import React from 'react';
import { connect } from 'react-redux';
import Slider from 'react-rangeslider';
import tt from 'counterpart';
import reactForm from 'app/utils/ReactForm';
import * as globalActions from 'app/redux/GlobalReducer';
import * as transactionActions from 'app/redux/TransactionReducer';
import * as userActions from 'app/redux/UserReducer';
import { COIN_TICKER, LIQUID_TICKER, COINING_TOKEN } from 'app/client_config';
import {
    numberWithCommas,
    spToCoinsf,
    coinsToSpf,
    coinsToSp,
    assetFloat,
} from 'app/utils/StateFunctions';

class Powerdown extends React.Component {
    constructor(props, context) {
        super(props, context);
        let new_withdraw;
        if (props.to_withdraw - props.withdrawn > 0) {
            new_withdraw = props.to_withdraw - props.withdrawn;
        } else {
            // Set the default withrawal amount to (available - 5 VOILK)
            // This should be removed post hf20
            new_withdraw = Math.max(
                0,
                props.available_shares - spToCoinsf(props.state, 5.001)
            );
        }
        this.state = {
            broadcasting: false,
            manual_entry: false,
            new_withdraw,
        };
    }

    render() {
        const { broadcasting, new_withdraw, manual_entry } = this.state;
        const {
            account,
            available_shares,
            withdrawn,
            to_withdraw,
            coining_shares,
            delegated_coining_shares,
        } = this.props;
        const formatSp = amount =>
            numberWithCommas(coinsToSp(this.props.state, amount));
        const sliderChange = value => {
            this.setState({ new_withdraw: value, manual_entry: false });
        };
        const inputChange = event => {
            event.preventDefault();
            let value = spToCoinsf(
                this.props.state,
                parseFloat(event.target.value.replace(/,/g, ''))
            );
            if (!isFinite(value)) {
                value = new_withdraw;
            }
            this.setState({
                new_withdraw: value,
                manual_entry: event.target.value,
            });
        };
        const powerDown = event => {
            event.preventDefault();
            this.setState({ broadcasting: true, error_message: undefined });
            const successCallback = this.props.successCallback;
            const errorCallback = error => {
                this.setState({
                    broadcasting: false,
                    error_message: String(error),
                });
            };
            // workaround bad math in react-rangeslider
            let withdraw = new_withdraw;
            if (withdraw > coining_shares - delegated_coining_shares) {
                withdraw = coining_shares - delegated_coining_shares;
            }
            const coining_shares = `${withdraw.toFixed(6)} ${COIN_TICKER}`;
            this.props.withdrawCoining({
                account,
                coining_shares,
                errorCallback,
                successCallback,
            });
        };

        const notes = [];
        if (to_withdraw - withdrawn > 0) {
            const AMOUNT = formatSp(to_withdraw);
            const WITHDRAWN = formatSp(withdrawn);
            notes.push(
                <li key="already_power_down">
                    {tt('powerdown_jsx.already_power_down', {
                        AMOUNT,
                        WITHDRAWN,
                        LIQUID_TICKER,
                    })}
                </li>
            );
        }
        if (delegated_coining_shares !== 0) {
            const AMOUNT = formatSp(delegated_coining_shares);
            notes.push(
                <li key="delegating">
                    {tt('powerdown_jsx.delegating', { AMOUNT, LIQUID_TICKER })}
                </li>
            );
        }
        if (notes.length === 0) {
            let AMOUNT = coinsToSpf(this.props.state, new_withdraw) / 104;
            AMOUNT = AMOUNT.toFixed(AMOUNT >= 10 ? 0 : 1);
            notes.push(
                <li key="per_week">
                    {tt('powerdown_jsx.per_week', { AMOUNT, LIQUID_TICKER })}
                </li>
            );
        }
        // NOTE: remove this post hf20
        if (
            new_withdraw >
            coining_shares -
                delegated_coining_shares -
                spToCoinsf(this.props.state, 5)
        ) {
            const AMOUNT = 5;
            notes.push(
                <li key="warning" className="warning">
                    {tt('powerdown_jsx.warning', { AMOUNT, COINING_TOKEN })}
                </li>
            );
        }

        if (this.state.error_message) {
            const MESSAGE = this.state.error_message;
            notes.push(
                <li key="error" className="error">
                    {tt('powerdown_jsx.error', { MESSAGE })}
                </li>
            );
        }

        return (
            <div className="PowerdownModal">
                <div className="row">
                    <h3 className="column">
                        {tt('powerdown_jsx.power_down')} {broadcasting}
                    </h3>
                </div>
                <Slider
                    value={new_withdraw}
                    step={0.000001}
                    max={coining_shares - delegated_coining_shares}
                    format={formatSp}
                    onChange={sliderChange}
                />
                <p className="powerdown-amount">
                    {tt('powerdown_jsx.amount')}
                    <br />
                    <input
                        value={
                            manual_entry ? manual_entry : formatSp(new_withdraw)
                        }
                        onChange={inputChange}
                        autoCorrect={false}
                    />
                    {LIQUID_TICKER}
                </p>
                <ul className="powerdown-notes">{notes}</ul>
                <button
                    type="submit"
                    className="button"
                    onClick={powerDown}
                    disabled={broadcasting}
                >
                    {tt('powerdown_jsx.power_down')}
                </button>
            </div>
        );
    }
}

export default connect(
    // mapStateToProps
    (state, ownProps) => {
        const values = state.user.get('powerdown_defaults');
        const account = values.get('account');
        const to_withdraw = parseFloat(values.get('to_withdraw')) / 1e6;
        const withdrawn = parseFloat(values.get('withdrawn')) / 1e6;
        const coining_shares = assetFloat(
            values.get('coining_shares'),
            COIN_TICKER
        );
        const delegated_coining_shares = assetFloat(
            values.get('delegated_coining_shares'),
            COIN_TICKER
        );
        const available_shares =
            coining_shares - to_withdraw - withdrawn - delegated_coining_shares;

        return {
            ...ownProps,
            account,
            available_shares,
            delegated_coining_shares,
            state,
            to_withdraw,
            coining_shares,
            withdrawn,
        };
    },
    // mapDispatchToProps
    dispatch => ({
        successCallback: () => {
            dispatch(userActions.hidePowerdown());
        },
        powerDown: e => {
            e.preventDefault();
            const name = 'powerDown';
            dispatch(globalActions.showDialog({ name }));
        },
        withdrawCoining: ({
            account,
            coining_shares,
            errorCallback,
            successCallback,
        }) => {
            const successCallbackWrapper = (...args) => {
                dispatch(
                    globalActions.getState({ url: `@${account}/transfers` })
                );
                return successCallback(...args);
            };
            dispatch(
                transactionActions.broadcastOperation({
                    type: 'withdraw_coining',
                    operation: { account, coining_shares },
                    errorCallback,
                    successCallback: successCallbackWrapper,
                })
            );
        },
    })
)(Powerdown);
