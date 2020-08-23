import { roundDown, roundUp } from './MarketUtils';
import { LIQUID_TICKER, DEBT_TICKER } from 'app/client_config';
const precision = 1000;

class Order {
    constructor(order, side) {
        this.side = side;
        this.price = parseFloat(order.real_price);
        this.price =
            side === 'asks'
                ? roundUp(this.price, 6)
                : Math.max(roundDown(this.price, 6), 0.000001);
        this.stringPrice = this.price.toFixed(6);
        this.voilk = parseInt(order.voilk, 10);
        this.vsd = parseInt(order.vsd, 10);
        this.date = order.created;
    }

    getVoilkAmount() {
        return this.voilk / precision;
    }

    getStringVoilk() {
        return this.getVoilkAmount().toFixed(3);
    }

    getPrice() {
        return this.price;
    }

    getStringPrice() {
        return this.stringPrice;
    }

    getStringVSD() {
        return this.getVSDAmount().toFixed(3);
    }

    getVSDAmount() {
        return this.vsd / precision;
    }

    add(order) {
        return new Order(
            {
                real_price: this.price,
                voilk: this.voilk + order.voilk,
                vsd: this.vsd + order.vsd,
                date: this.date,
            },
            this.type
        );
    }

    equals(order) {
        return (
            this.getStringVSD() === order.getStringVSD() &&
            this.getStringVoilk() === order.getStringVoilk() &&
            this.getStringPrice() === order.getStringPrice()
        );
    }
}

class TradeHistory {
    constructor(fill) {
        // Norm date (FF bug)
        var zdate = fill.date;
        if (!/Z$/.test(zdate)) zdate = zdate + 'Z';

        this.date = new Date(zdate);
        this.type =
            fill.current_pays.indexOf(DEBT_TICKER) !== -1 ? 'bid' : 'ask';
        this.color = this.type == 'bid' ? 'buy-color' : 'sell-color';
        if (this.type === 'bid') {
            this.vsd = parseFloat(
                fill.current_pays.split(' ' + DEBT_TICKER)[0]
            );
            this.voilk = parseFloat(
                fill.open_pays.split(' ' + LIQUID_TICKER)[0]
            );
        } else {
            this.vsd = parseFloat(fill.open_pays.split(' ' + DEBT_TICKER)[0]);
            this.voilk = parseFloat(
                fill.current_pays.split(' ' + LIQUID_TICKER)[0]
            );
        }

        this.price = this.vsd / this.voilk;
        this.price =
            this.type === 'ask'
                ? roundUp(this.price, 6)
                : Math.max(roundDown(this.price, 6), 0.000001);
        this.stringPrice = this.price.toFixed(6);
    }

    getVoilkAmount() {
        return this.voilk;
    }

    getStringVoilk() {
        return this.getVoilkAmount().toFixed(3);
    }

    getVSDAmount() {
        return this.vsd;
    }

    getStringVSD() {
        return this.getVSDAmount().toFixed(3);
    }

    getPrice() {
        return this.price;
    }

    getStringPrice() {
        return this.stringPrice;
    }

    equals(order) {
        return (
            this.getStringVSD() === order.getStringVSD() &&
            this.getStringVoilk() === order.getStringVoilk() &&
            this.getStringPrice() === order.getStringPrice()
        );
    }
}

module.exports = {
    Order,
    TradeHistory,
};
