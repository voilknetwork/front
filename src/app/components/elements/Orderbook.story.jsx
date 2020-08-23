import React from 'react';
import { storiesOf } from '@storybook/react';
import { withKnobs, select } from '@storybook/addon-knobs';
import Orderbook from './Orderbook';

const selectOptions = ['error', 'default'];

const mockOrder = {
    getVSDAmount: () => 999,
    getStringVSD: () => 'nine hundred and ninety nine',
    getStringVoilk: () => 'two hundred voilk',
    getStringPrice: () => '55',
    equals: () => 55,
};

const mockOrder2 = {
    getVSDAmount: () => 111,
    getStringVSD: () => 'one hundred and eleven',
    getStringVoilk: () => 'one voilk',
    getStringPrice: () => '55',
    equals: () => 55,
};

storiesOf('Elements', module)
    .addDecorator(withKnobs)
    .add('Orderbook', () => (
        <Orderbook
            side={'bids'}
            orders={[mockOrder, mockOrder2]}
            onClick={price => {
                setFormPrice(price);
            }}
        />
    ));
