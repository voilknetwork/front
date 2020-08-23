/* eslint react/prop-types: 0 */
import React from 'react';
import { connect } from 'react-redux';
import TransferHistoryRow from 'app/components/cards/TransferHistoryRow';
import {
    numberWithCommas,
    coinsToSp,
    assetFloat,
} from 'app/utils/StateFunctions';
import tt from 'counterpart';
import {
    COINING_TOKEN,
    LIQUID_TICKER,
    COIN_TICKER,
    DEBT_TICKER,
    DEBT_TOKEN_SHORT,
} from 'app/client_config';

class AuthorRewards extends React.Component {
    constructor() {
        super();
        this.state = { historyIndex: 0 };
        this.onShowDeposit = () => {
            this.setState({ showDeposit: !this.state.showDeposit });
        };
        this.onShowDepositVoilk = () => {
            this.setState({
                showDeposit: !this.state.showDeposit,
                depositType: LIQUID_TICKER,
            });
        };
        this.onShowDepositPower = () => {
            this.setState({
                showDeposit: !this.state.showDeposit,
                depositType: COIN_TICKER,
            });
        };
        // this.onShowDeposit = this.onShowDeposit.bind(this)
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            nextProps.transfer_history.length !==
                this.props.transfer_history.length ||
            nextState.historyIndex !== this.state.historyIndex
        );
    }

    _setHistoryPage(back) {
        const newIndex = this.state.historyIndex + (back ? 10 : -10);
        this.setState({ historyIndex: Math.max(0, newIndex) });
    }

    render() {
        const { state: { historyIndex } } = this;
        const { account_name, transfer_history } = this.props;

        /// transfer log
        let rewards24Coins = 0,
            rewardsWeekCoins = 0,
            totalRewardsCoins = 0;
        let rewards24Voilk = 0,
            rewardsWeekVoilk = 0,
            totalRewardsVoilk = 0;
        let rewards24VSD = 0,
            rewardsWeekVSD = 0,
            totalRewardsVSD = 0;
        const today = new Date();
        const oneDay = 86400 * 1000;
        const yesterday = new Date(today.getTime() - oneDay).getTime();
        const lastWeek = new Date(today.getTime() - 7 * oneDay).getTime();

        let firstDate, finalDate;
        let author_log = transfer_history
            .map((item, index) => {
                // Filter out rewards
                if (item[1].op[0] === 'author_reward') {
                    if (!finalDate) {
                        finalDate = new Date(item[1].timestamp).getTime();
                    }
                    firstDate = new Date(item[1].timestamp).getTime();

                    const coin = assetFloat(
                        item[1].op[1].coining_payout,
                        COIN_TICKER
                    );
                    const voilk = assetFloat(
                        item[1].op[1].voilk_payout,
                        LIQUID_TICKER
                    );
                    const vsd = assetFloat(
                        item[1].op[1].vsd_payout,
                        DEBT_TICKER
                    );

                    if (new Date(item[1].timestamp).getTime() > lastWeek) {
                        if (new Date(item[1].timestamp).getTime() > yesterday) {
                            rewards24Coins += coin;
                            rewards24Voilk += voilk;
                            rewards24VSD += vsd;
                        }
                        rewardsWeekCoins += coin;
                        rewardsWeekVoilk += voilk;
                        rewardsWeekVSD += vsd;
                    }
                    totalRewardsCoins += coin;
                    totalRewardsVoilk += voilk;
                    totalRewardsVSD += vsd;

                    return (
                        <TransferHistoryRow
                            key={index}
                            op={item}
                            context={account_name}
                        />
                    );
                }
                return null;
            })
            .filter(el => !!el);

        let currentIndex = -1;
        const curationLength = author_log.length;
        const daysOfCuration = (firstDate - finalDate) / oneDay || 1;
        const averageCurationCoins = !daysOfCuration
            ? 0
            : totalRewardsCoins / daysOfCuration;
        const averageCurationVoilk = !daysOfCuration
            ? 0
            : totalRewardsVoilk / daysOfCuration;
        const averageCurationVSD = !daysOfCuration
            ? 0
            : totalRewardsVSD / daysOfCuration;
        const hasFullWeek = daysOfCuration >= 7;
        const limitedIndex = Math.min(historyIndex, curationLength - 10);
        author_log = author_log.reverse().filter(() => {
            currentIndex++;
            return (
                currentIndex >= limitedIndex && currentIndex < limitedIndex + 10
            );
        });

        const navButtons = (
            <nav>
                <ul className="pager">
                    <li>
                        <div
                            className={
                                'button tiny hollow float-left ' +
                                (historyIndex === 0 ? ' disabled' : '')
                            }
                            onClick={this._setHistoryPage.bind(this, false)}
                            aria-label="Previous"
                        >
                            <span aria-hidden="true">
                                &larr; {tt('g.newer')}
                            </span>
                        </div>
                    </li>
                    <li>
                        <div
                            className={
                                'button tiny hollow float-right ' +
                                (historyIndex >= curationLength - 10
                                    ? ' disabled'
                                    : '')
                            }
                            onClick={
                                historyIndex >= curationLength - 10
                                    ? null
                                    : this._setHistoryPage.bind(this, true)
                            }
                            aria-label="Next"
                        >
                            <span aria-hidden="true">
                                {tt('g.older')} &rarr;
                            </span>
                        </div>
                    </li>
                </ul>
            </nav>
        );
        return (
            <div className="UserWallet">
                <div className="UserWallet__balance UserReward__row row">
                    <div className="column small-12 medium-8">
                        {tt(
                            'authorrewards_jsx.estimated_author_rewards_last_week'
                        )}:
                    </div>
                    <div className="column small-12 medium-4">
                        {numberWithCommas(
                            coinsToSp(
                                this.props.state,
                                rewardsWeekCoins + ' ' + COIN_TICKER
                            )
                        ) +
                            ' ' +
                            COINING_TOKEN}
                        <br />
                        {rewardsWeekVoilk.toFixed(3) + ' ' + LIQUID_TICKER}
                        <br />
                        {rewardsWeekVSD.toFixed(3) + ' ' + DEBT_TOKEN_SHORT}
                    </div>
                </div>

                <div className="row">
                    <div className="column small-12">
                        <hr />
                    </div>
                </div>

                <div className="row">
                    <div className="column small-12">
                        {/** history */}
                        <h4>
                            {tt('authorrewards_jsx.author_rewards_history')}
                        </h4>
                        <table>
                            <tbody>{author_log}</tbody>
                        </table>
                        {navButtons}
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const { account } = ownProps;
        return {
            state,
            account_name: account.name,
            transfer_history: account.transfer_history || [],
        };
    }
)(AuthorRewards);
