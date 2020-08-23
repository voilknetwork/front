import assert from 'assert';
import constants from 'app/redux/constants';
import { parsePayoutAmount, repLog10 } from 'app/utils/ParsersAndFormatters';
import { Long } from 'bytebuffer';
import { COIN_TICKER, LIQUID_TICKER } from 'app/client_config';
import { fromJS } from 'immutable';
import { formatter } from 'voilk';

export const numberWithCommas = x => x.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export function coinsToSpf(state, coining_shares) {
    const { global } = state;
    let coins = coining_shares;
    if (typeof coining_shares === 'string') {
        coins = assetFloat(coining_shares, COIN_TICKER);
    }
    const total_coins = assetFloat(
        global.getIn(['props', 'total_coining_shares']),
        COIN_TICKER
    );
    const total_coin_voilk = assetFloat(
        global.getIn(['props', 'total_coining_fund_voilk']),
        LIQUID_TICKER
    );
    return total_coin_voilk * (coins / total_coins);
}

export function coinsToSp(state, coining_shares) {
    return coinsToSpf(state, coining_shares).toFixed(3);
}

export function spToCoinsf(state, voilk_power) {
    const { global } = state;
    let power = voilk_power;
    if (typeof power === 'string') {
        power = assetFloat(power, LIQUID_TICKER);
    }
    const total_coins = assetFloat(
        global.getIn(['props', 'total_coining_shares']),
        COIN_TICKER
    );
    const total_coin_voilk = assetFloat(
        global.getIn(['props', 'total_coining_fund_voilk']),
        LIQUID_TICKER
    );
    return voilk_power / total_coin_voilk * total_coins;
}

export function spToCoins(state, coining_shares) {
    return spToCoinsf(state, coining_shares).toFixed(6);
}

export function coiningVoilk(account, gprops) {
    const coins = parseFloat(account.coining_shares.split(' ')[0]);
    const total_coins = parseFloat(gprops.total_coining_shares.split(' ')[0]);
    const total_coin_voilk = parseFloat(
        gprops.total_coining_fund_voilk.split(' ')[0]
    );
    const coining_voilkf = total_coin_voilk * (coins / total_coins);
    return coining_voilkf;
}

// How much VOILK this account has delegated out (minus received).
export function delegatedVoilk(account, gprops) {
    const delegated_coins = parseFloat(
        account.delegated_coining_shares.split(' ')[0]
    );
    const received_coins = parseFloat(
        account.received_coining_shares.split(' ')[0]
    );
    const coins = delegated_coins - received_coins;
    const total_coins = parseFloat(gprops.total_coining_shares.split(' ')[0]);
    const total_coin_voilk = parseFloat(
        gprops.total_coining_fund_voilk.split(' ')[0]
    );
    const coining_voilkf = total_coin_voilk * (coins / total_coins);
    return coining_voilkf;
}

export function assetFloat(str, asset) {
    try {
        assert.equal(typeof str, 'string');
        assert.equal(typeof asset, 'string');
        assert(
            new RegExp(`^\\d+(\\.\\d+)? ${asset}$`).test(str),
            'Asset should be formatted like 99.99 ' + asset + ': ' + str
        );
        return parseFloat(str.split(' ')[0]);
    } catch (e) {
        console.log(e);
        return undefined;
    }
}

export function isFetchingOrRecentlyUpdated(global_status, order, category) {
    const status = global_status
        ? global_status.getIn([category || '', order])
        : null;
    if (!status) return false;
    if (status.fetching) return true;
    if (status.last_fetch) {
        const res =
            new Date() - status.last_fetch <
            constants.FETCH_DATA_EXPIRE_SEC * 1000;
        return res;
    }
    return false;
}

export function contentStats(content) {
    if (!content) return {};
    if (!(content instanceof Map)) content = fromJS(content);

    let net_rshares_adj = Long.ZERO;
    let neg_rshares = Long.ZERO;
    let total_votes = 0;
    let up_votes = 0;

    // TODO: breaks if content has no active_votes attribute.

    content.get('active_votes').forEach(v => {
        const sign = Math.sign(v.get('percent'));
        if (sign === 0) return;
        total_votes += 1;
        if (sign > 0) up_votes += 1;

        const rshares = String(v.get('rshares'));

        // For flag weight: count total neg rshares
        if (sign < 0) {
            neg_rshares = neg_rshares.add(rshares);
        }

        // For graying: sum up total rshares from voters with non-neg reputation.
        if (String(v.get('reputation')).substring(0, 1) !== '-') {
            // And also ignore tiny downvotes (9 digits or less)
            if (!(rshares.substring(0, 1) === '-' && rshares.length < 11)) {
                net_rshares_adj = net_rshares_adj.add(rshares);
            }
        }
    });

    // take negative rshares, divide by 2, truncate 10 digits (plus neg sign), count digits.
    // creates a cheap log10, stake-based flag weight. 1 = approx $400 of downvoting stake; 2 = $4,000; etc
    const flagWeight = Math.max(String(neg_rshares.div(2)).length - 11, 0);

    // post must have non-trivial negative rshares to be grayed out. (more than 10 digits)
    const grayThreshold = -9999999999;
    const meetsGrayThreshold = net_rshares_adj.compare(grayThreshold) < 0;

    // to be eligible for deletion, a comment must have non-positive rshares and no replies
    const hasPositiveRshares = Long.fromString(
        String(content.get('net_rshares'))
    ).gt(Long.ZERO);
    const allowDelete = !hasPositiveRshares && content.get('children') === 0;
    const hasPendingPayout =
        parsePayoutAmount(content.get('pending_payout_value')) >= 0.02;
    const authorRepLog10 = repLog10(content.get('author_reputation'));

    const gray =
        !hasPendingPayout && (authorRepLog10 < 1 || meetsGrayThreshold);
    const hide = !hasPendingPayout && authorRepLog10 < 0; // rephide

    // Combine tags+category to check nsfw status
    const json = content.get('json_metadata');
    let tags = [];
    try {
        tags = (json && JSON.parse(json).tags) || [];
        if (typeof tags == 'string') {
            tags = [tags];
        }
        if (!Array.isArray(tags)) {
            tags = [];
        }
    } catch (e) {
        tags = [];
    }
    tags.push(content.get('category'));
    tags = filterTags(tags);
    const isNsfw = tags.filter(tag => tag && tag.match(/^nsfw$/i)).length > 0;

    return {
        hide,
        gray,
        authorRepLog10,
        allowDelete,
        isNsfw,
        flagWeight,
        total_votes,
        up_votes,
        hasPendingPayout,
    };
}

export function filterTags(tags) {
    return tags
        .filter(tag => typeof tag === 'string')
        .filter((value, index, self) => value && self.indexOf(value) === index);
}

export function pricePerVoilk(state) {
    const feed_price = state.user.get(
        'latest_feed_price',
        state.global.get('feed_price')
    );
    if (feed_price && feed_price.has('base') && feed_price.has('quote')) {
        return formatter.pricePerVoilk(feed_price.toJS());
    }
    return undefined;
}
