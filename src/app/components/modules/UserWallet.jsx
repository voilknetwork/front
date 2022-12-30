/* eslint react/prop-types: 0 */
import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router";
import tt from "counterpart";
import { List } from "immutable";
import SavingsWithdrawHistory from "app/components/elements/SavingsWithdrawHistory";
import TransferHistoryRow from "app/components/cards/TransferHistoryRow";
import TransactionError from "app/components/elements/TransactionError";
import TimeAgoWrapper from "app/components/elements/TimeAgoWrapper";
import ImpRecorder from "app/components/elements/ImpRecorder/ImpRecorder";
import {
  numberWithCommas,
  coiningVoilk,
  delegatedVoilk,
  pricePerVoilk
} from "app/utils/StateFunctions";
import WalletSubMenu from "app/components/elements/WalletSubMenu";
import shouldComponentUpdate from "app/utils/shouldComponentUpdate";
import Tooltip from "app/components/elements/Tooltip";
import { FormattedHTMLMessage } from "app/Translator";
import {
  LIQUID_TOKEN,
  LIQUID_TICKER,
  DEBT_TOKENS,
  COINING_TOKEN
} from "app/client_config";
import * as transactionActions from "app/redux/TransactionReducer";
import * as globalActions from "app/redux/GlobalReducer";
import DropdownMenu from "app/components/elements/DropdownMenu";

const assetPrecision = 1000;

class UserWallet extends React.Component {
  constructor() {
    super();
    this.state = {
      claimInProgress: false
    };
    this.onShowDepositVoilk = e => {
      if (e && e.preventDefault) e.preventDefault();
      const name = this.props.current_user.get("username");
      const new_window = window.open();
      new_window.opener = null;
      new_window.location = "https://affiliates.voilk.com";
    };
    this.onShowWithdrawVoilk = e => {
      e.preventDefault();
      const new_window = window.open();
      new_window.opener = null;
      new_window.location = "https://affiliates.voilk.com";
    };
    this.onShowDepositPower = (current_user_name, e) => {
      e.preventDefault();
      const new_window = window.open();
      new_window.opener = null;
      new_window.location = "https://affiliates.voilk.com";
    };
    this.onShowDepositVSD = (current_user_name, e) => {
      e.preventDefault();
      const new_window = window.open();
      new_window.opener = null;
      new_window.location = "https://affiliates.voilk.com";
    };
    this.onShowWithdrawVSD = e => {
      e.preventDefault();
      const new_window = window.open();
      new_window.opener = null;
      new_window.location = "https://affiliates.voilk.com";
    };
    this.shouldComponentUpdate = shouldComponentUpdate(this, "UserWallet");
  }

  handleClaimRewards = account => {
    this.setState({ claimInProgress: true }); // disable the claim button
    this.props.claimRewards(account);
  };

  render() {
    const {
      onShowDepositVoilk,
      onShowWithdrawVoilk,
      onShowDepositVSD,
      onShowWithdrawVSD,
      onShowDepositPower
    } = this;
    const {
      convertToVoilk,
      price_per_voilk,
      savings_withdraws,
      account,
      current_user,
      open_orders
    } = this.props;
    const gprops = this.props.gprops.toJS();

    if (!account) return null;
    let coining_voilk = coiningVoilk(account.toJS(), gprops);
    let delegated_voilk = delegatedVoilk(account.toJS(), gprops);

    let isMyAccount =
      current_user && current_user.get("username") === account.get("name");

    const disabledWarning = false;
    // isMyAccount = false; // false to hide wallet transactions

    const showTransfer = (asset, transferType, e) => {
      e.preventDefault();
      this.props.showTransfer({
        to: isMyAccount ? null : account.get("name"),
        asset,
        transferType
      });
    };

    const savings_balance = account.get("savings_balance");
    const savings_vsd_balance = account.get("savings_vsd_balance");

    const powerDown = (cancel, e) => {
      e.preventDefault();
      const name = account.get("name");
      if (cancel) {
        const coining_shares = cancel
          ? "0.000000 COINS"
          : account.get("coining_shares");
        this.setState({ toggleDicoinError: null });
        const errorCallback = e2 => {
          this.setState({ toggleDicoinError: e2.toString() });
        };
        const successCallback = () => {
          this.setState({ toggleDicoinError: null });
        };
        this.props.withdrawCoining({
          account: name,
          coining_shares,
          errorCallback,
          successCallback
        });
      } else {
        const to_withdraw = account.get("to_withdraw");
        const withdrawn = account.get("withdrawn");
        const coining_shares = account.get("coining_shares");
        const delegated_coining_shares = account.get(
          "delegated_coining_shares"
        );
        this.props.showPowerdown({
          account: name,
          to_withdraw,
          withdrawn,
          coining_shares,
          delegated_coining_shares
        });
      }
    };

    // Sum savings withrawals
    let savings_pending = 0,
      savings_vsd_pending = 0;
    if (savings_withdraws) {
      savings_withdraws.forEach(withdraw => {
        const [amount, asset] = withdraw.get("amount").split(" ");
        if (asset === "VOILK") savings_pending += parseFloat(amount);
        else {
          if (asset === "VSD") savings_vsd_pending += parseFloat(amount);
        }
      });
    }

    // Sum conversions
    let conversionValue = 0;
    const currentTime = new Date().getTime();
    const conversions = account
      .get("other_history", List())
      .reduce((out, item) => {
        if (item.getIn([1, "op", 0], "") !== "convert") return out;

        const timestamp = new Date(item.getIn([1, "timestamp"])).getTime();
        const finishTime = timestamp + 86400000 * 3.5; // add 3.5day conversion delay
        if (finishTime < currentTime) return out;

        const amount = parseFloat(
          item.getIn([1, "op", 1, "amount"]).replace(" VSD", "")
        );
        conversionValue += amount;

        return out.concat([
          <div key={item.get(0)}>
            <Tooltip
              t={tt("userwallet_jsx.conversion_complete_tip", {
                date: new Date(finishTime).toLocaleString()
              })}
            >
              <span>
                (+{tt("userwallet_jsx.in_conversion", {
                  amount: numberWithCommas("$" + amount.toFixed(3))
                })})
              </span>
            </Tooltip>
          </div>
        ]);
      }, []);

    const balance_voilk = parseFloat(account.get("balance").split(" ")[0]);
    const saving_balance_voilk = parseFloat(savings_balance.split(" ")[0]);
    const dicoining =
      parseFloat(account.get("coining_withdraw_rate").split(" ")[0]) > 0.0;
    const vsd_balance = parseFloat(account.get("vsd_balance"));
    const vsd_balance_savings = parseFloat(savings_vsd_balance.split(" ")[0]);
    const vsdOrders =
      !open_orders || !isMyAccount
        ? 0
        : open_orders.reduce((o, order) => {
            if (order.sell_price.base.indexOf("VSD") !== -1) {
              o += order.for_sale;
            }
            return o;
          }, 0) / assetPrecision;

    const voilkOrders =
      !open_orders || !isMyAccount
        ? 0
        : open_orders.reduce((o, order) => {
            if (order.sell_price.base.indexOf("VOILK") !== -1) {
              o += order.for_sale;
            }
            return o;
          }, 0) / assetPrecision;

    // set displayed estimated value
    const total_vsd =
      vsd_balance +
      vsd_balance_savings +
      savings_vsd_pending +
      vsdOrders +
      conversionValue;
    const total_voilk =
      coining_voilk +
      balance_voilk +
      saving_balance_voilk +
      savings_pending +
      voilkOrders;
    let total_value =
      "$" + numberWithCommas((total_voilk * 0.5 + total_vsd * 1).toFixed(2));

    // format spacing on estimated value based on account state
    let estimate_output = <p>{total_value}</p>;
    if (isMyAccount) {
      estimate_output = <p>{total_value}&nbsp; &nbsp; &nbsp;</p>;
    }

    /// transfer log
    let idx = 0;
    const transfer_log = account
      .get("transfer_history")
      .map(item => {
        const data = item.getIn([1, "op", 1]);
        const type = item.getIn([1, "op", 0]);

        // Filter out rewards
        if (
          type === "curation_reward" ||
          type === "author_reward" ||
          type === "comment_benefactor_reward"
        ) {
          return null;
        }

        if (
          data.vsd_payout === "0.000 VSD" &&
          data.coining_payout === "0.000000 COINS"
        )
          return null;
        return (
          <TransferHistoryRow
            key={idx++}
            op={item.toJS()}
            context={account.get("name")}
          />
        );
      })
      .filter(el => !!el)
      .reverse();

    let voilk_menu = [
      {
        value: tt("userwallet_jsx.transfer"),
        link: "#",
        onClick: showTransfer.bind(this, "VOILK", "Transfer to Account")
      },
      {
        value: tt("userwallet_jsx.transfer_to_savings"),
        link: "#",
        onClick: showTransfer.bind(this, "VOILK", "Transfer to Savings")
      },
      {
        value: tt("userwallet_jsx.power_up"),
        link: "#",
        onClick: showTransfer.bind(this, "COINS", "Transfer to Account")
      }
    ];
    let power_menu = [
      {
        value: tt("userwallet_jsx.power_down"),
        link: "#",
        onClick: powerDown.bind(this, false)
      }
    ];
    let dollar_menu = [
      {
        value: tt("g.transfer"),
        link: "#",
        onClick: showTransfer.bind(this, "VSD", "Transfer to Account")
      },
      {
        value: tt("userwallet_jsx.transfer_to_savings"),
        link: "#",
        onClick: showTransfer.bind(this, "VSD", "Transfer to Savings")
      },
      { value: tt("userwallet_jsx.market"), link: "/market" }
    ];
    if (isMyAccount) {
      voilk_menu.push({
        value: tt("g.buy"),
        link: "#",
        onClick: onShowDepositVoilk.bind(this, current_user.get("username"))
      });
      voilk_menu.push({
        value: tt("g.sell"),
        link: "#",
        onClick: onShowWithdrawVoilk
      });
      voilk_menu.push({
        value: tt("userwallet_jsx.market"),
        link: "/market"
      });
      power_menu.push({
        value: tt("g.buy"),
        link: "#",
        onClick: onShowDepositPower.bind(this, current_user.get("username"))
      });
      dollar_menu.push({
        value: tt("g.buy"),
        link: "#",
        onClick: onShowDepositVSD.bind(this, current_user.get("username"))
      });
      dollar_menu.push({
        value: tt("g.sell"),
        link: "#",
        onClick: onShowWithdrawVSD
      });
    }
    if (dicoining) {
      power_menu.push({
        value: "Cancel Power Down",
        link: "#",
        onClick: powerDown.bind(this, true)
      });
    }

    const isWithdrawScheduled =
      new Date(account.get("next_coining_withdrawal") + "Z").getTime() >
      Date.now();

    const voilk_balance_str = numberWithCommas(balance_voilk.toFixed(3));
    const voilk_orders_balance_str = numberWithCommas(voilkOrders.toFixed(3));
    const power_balance_str = numberWithCommas(coining_voilk.toFixed(3));
    const received_power_balance_str =
      (delegated_voilk < 0 ? "+" : "") +
      numberWithCommas((-delegated_voilk).toFixed(3));
    const vsd_balance_str = numberWithCommas("$" + vsd_balance.toFixed(3)); // formatDecimal(account.vsd_balance, 3)
    const vsd_orders_balance_str = numberWithCommas("$" + vsdOrders.toFixed(3));
    const savings_balance_str = numberWithCommas(
      saving_balance_voilk.toFixed(3) + " VOILK"
    );
    const savings_vsd_balance_str = numberWithCommas(
      "$" + vsd_balance_savings.toFixed(3)
    );

    const savings_menu = [
      {
        value: tt("userwallet_jsx.withdraw_LIQUID_TOKEN", {
          LIQUID_TOKEN
        }),
        link: "#",
        onClick: showTransfer.bind(this, "VOILK", "Savings Withdraw")
      }
    ];
    const savings_vsd_menu = [
      {
        value: tt("userwallet_jsx.withdraw_DEBT_TOKENS", {
          DEBT_TOKENS
        }),
        link: "#",
        onClick: showTransfer.bind(this, "VSD", "Savings Withdraw")
      }
    ];
    // set dynamic secondary wallet values
    const vsdInterest = this.props.vsd_interest / 100;
    const vsdMessage = (
      <span>{tt("userwallet_jsx.tradeable_tokens_transferred")}</span>
    );

    const reward_voilk =
      parseFloat(account.get("reward_voilk_balance").split(" ")[0]) > 0
        ? account.get("reward_voilk_balance")
        : null;
    const reward_vsd =
      parseFloat(account.get("reward_vsd_balance").split(" ")[0]) > 0
        ? account.get("reward_vsd_balance")
        : null;
    const reward_sp =
      parseFloat(account.get("reward_coining_voilk").split(" ")[0]) > 0
        ? account.get("reward_coining_voilk").replace("VOILK", "SP")
        : null;

    let rewards = [];
    if (reward_voilk) rewards.push(reward_voilk);
    if (reward_vsd) rewards.push(reward_vsd);
    if (reward_sp) rewards.push(reward_sp);

    let rewards_str;
    switch (rewards.length) {
      case 3:
        rewards_str = `${rewards[0]}, ${rewards[1]} and ${rewards[2]}`;
        break;
      case 2:
        rewards_str = `${rewards[0]} and ${rewards[1]}`;
        break;
      case 1:
        rewards_str = `${rewards[0]}`;
        break;
    }

    let claimbox;
    if (current_user && rewards_str && isMyAccount) {
      claimbox = (
        <div className="row">
          <div className="columns small-12">
            <div className="UserWallet__claimbox">
              <span className="UserWallet__claimbox-text">
                Your current rewards: {rewards_str}
              </span>
              <button
                disabled={this.state.claimInProgress}
                className="button"
                onClick={e => {
                  this.handleClaimRewards(account);
                }}
              >
                {tt("userwallet_jsx.redeem_rewards")}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="UserWallet">
        {claimbox}

        <div className="row">
          <div className="columns small-10 medium-12 medium-expand">
            {isMyAccount ? (
              <WalletSubMenu account_name={account.get("name")} />
            ) : (
              <div>
                <br />
                <h4>{tt("g.balances")}</h4>
                <br />
              </div>
            )}
          </div>
          {
            <div className="columns shrink">
              {isMyAccount && (
                <button
                  className="UserWallet__buysp button hollow"
                  onClick={onShowDepositVoilk}
                >
                  {tt("userwallet_jsx.buy_voilk_or_voilk_power")}
                </button>
              )}
            </div>
          }
        </div>

        <div className="UserWallet__balance row">
          <div className="column small-12 medium-8">
            VOILK
            <FormattedHTMLMessage
              className="secondary"
              id="tips_js.liquid_token"
              params={{ LIQUID_TOKEN, COINING_TOKEN }}
            />
          </div>
          <div className="column small-12 medium-4">
            {isMyAccount ? (
              <DropdownMenu
                className="Wallet_dropdown"
                items={voilk_menu}
                el="li"
                selected={voilk_balance_str + " VOILK"}
              />
            ) : (
              voilk_balance_str + " VOILK"
            )}
            {voilkOrders ? (
              <div
                style={{
                  paddingRight: isMyAccount ? "0.85rem" : null
                }}
              >
                <Link to="/market">
                  <Tooltip t={tt("market_jsx.open_orders")}>
                    (+{voilk_orders_balance_str} VOILK)
                  </Tooltip>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
        <div className="UserWallet__balance row zebra">
          <div className="column small-12 medium-8">
            VOILK POWER
            <FormattedHTMLMessage
              className="secondary"
              id="tips_js.influence_token"
            />
            {delegated_voilk != 0 ? (
              <span className="secondary">
                {tt("tips_js.part_of_your_voilk_power_is_currently_delegated", {
                  user_name: account.get("name")
                })}
              </span>
            ) : null}
          </div>
          <div className="column small-12 medium-4">
            {isMyAccount ? (
              <DropdownMenu
                className="Wallet_dropdown"
                items={power_menu}
                el="li"
                selected={power_balance_str + " VOILK"}
              />
            ) : (
              power_balance_str + " VOILK"
            )}
            {delegated_voilk != 0 ? (
              <div
                style={{
                  paddingRight: isMyAccount ? "0.85rem" : null
                }}
              >
                <Tooltip t="VOILK POWER delegated to/from this account">
                  ({received_power_balance_str} VOILK)
                </Tooltip>
              </div>
            ) : null}
          </div>
        </div>
        <div className="UserWallet__balance row">
          <div className="column small-12 medium-8">
            VOILK DOLLARS
            <div className="secondary">{vsdMessage}</div>
          </div>
          <div className="column small-12 medium-4">
            {isMyAccount ? (
              <DropdownMenu
                className="Wallet_dropdown"
                items={dollar_menu}
                el="li"
                selected={vsd_balance_str}
              />
            ) : (
              vsd_balance_str
            )}
            {vsdOrders ? (
              <div
                style={{
                  paddingRight: isMyAccount ? "0.85rem" : null
                }}
              >
                <Link to="/market">
                  <Tooltip t={tt("market_jsx.open_orders")}>
                    (+{vsd_orders_balance_str})
                  </Tooltip>
                </Link>
              </div>
            ) : null}
            {conversions}
          </div>
        </div>
        <div className="UserWallet__balance row zebra">
          <div className="column small-12 medium-8">
            {tt("userwallet_jsx.savings")}
            <div className="secondary">
              <span>
                {tt(
                  "transfer_jsx.balance_subject_to_3_day_withdraw_waiting_period"
                )}
              </span>
            </div>
          </div>
          <div className="column small-12 medium-4">
            {isMyAccount ? (
              <DropdownMenu
                className="Wallet_dropdown"
                items={savings_menu}
                el="li"
                selected={savings_balance_str}
              />
            ) : (
              savings_balance_str
            )}
            <br />
            {isMyAccount ? (
              <DropdownMenu
                className="Wallet_dropdown"
                items={savings_vsd_menu}
                el="li"
                selected={savings_vsd_balance_str}
              />
            ) : (
              savings_vsd_balance_str
            )}
          </div>
        </div>
        <div className="UserWallet__balance row">
          <div className="column small-12 medium-8">
            {tt("userwallet_jsx.estimated_account_value")}
            <div className="secondary">
              {tt("tips_js.estimated_value", { LIQUID_TOKEN })}
            </div>
          </div>
          <div className="column small-12 medium-4">{estimate_output}</div>
        </div>
        <div className="UserWallet__balance row">
          <div className="column small-12">
            {isWithdrawScheduled && (
              <span>
                {tt("userwallet_jsx.next_power_down_is_scheduled_to_happen")}&nbsp;{" "}
                <TimeAgoWrapper date={account.get("next_coining_withdrawal")} />.
              </span>
            )}
            {/*toggleDicoinError && <div className="callout alert">{toggleDicoinError}</div>*/}
            <TransactionError opType="withdraw_coining" />
          </div>
        </div>
        {disabledWarning && (
          <div className="row">
            <div className="column small-12">
              <div className="callout warning">
                {tt("userwallet_jsx.transfers_are_temporary_disabled")}
              </div>
            </div>
          </div>
        )}
        <div className="row">
          <div className="column small-12">
            <hr />
          </div>
        </div>

        {isMyAccount && <SavingsWithdrawHistory />}

        <div className="row">
          <div className="column small-12">
            {/** history */}
            <h4>{tt("userwallet_jsx.history")}</h4>
            <div className="secondary">
              <span>
                {tt("transfer_jsx.beware_of_spam_and_phishing_links")}
              </span>
              &nbsp;
              <span>
                {tt("transfer_jsx.transactions_make_take_a_few_minutes")}
              </span>
            </div>
            <table>
              <tbody>{transfer_log}</tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(
  // mapStateToProps
  (state, ownProps) => {
    const price_per_voilk = pricePerVoilk(state);
    const savings_withdraws = state.user.get("savings_withdraws");
    const gprops = state.global.get("props");
    const vsd_interest = gprops.get("vsd_interest_rate");
    return {
      ...ownProps,
      open_orders: state.market.get("open_orders"),
      price_per_voilk,
      savings_withdraws,
      vsd_interest,
      gprops
    };
  },
  // mapDispatchToProps
  dispatch => ({
    claimRewards: account => {
      const username = account.get("name");
      const successCallback = () => {
        dispatch(globalActions.getState({ url: `@${username}/transfers` }));
      };

      const operation = {
        account: username,
        reward_voilk: account.get("reward_voilk_balance"),
        reward_vsd: account.get("reward_vsd_balance"),
        reward_coins: account.get("reward_coining_balance")
      };

      dispatch(
        transactionActions.broadcastOperation({
          type: "claim_reward_balance",
          operation,
          successCallback
        })
      );
    },
    convertToVoilk: e => {
      //post 2018-01-31 if no calls to this function exist may be safe to remove. Incoinigate use of ConvertToVoilk.jsx
      e.preventDefault();
      const name = "convertToVoilk";
      dispatch(globalActions.showDialog({ name }));
    },
    showChangePassword: username => {
      const name = "changePassword";
      dispatch(globalActions.remove({ key: name }));
      dispatch(globalActions.showDialog({ name, params: { username } }));
    }
  })
)(UserWallet);
