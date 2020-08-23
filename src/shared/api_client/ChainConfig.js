import * as voilk from 'voilk';

voilk.config.set('address_prefix', 'SHR');

let chain_id = '';
for (let i = 0; i < 32; i++) chain_id += '00';

module.exports = {
    address_prefix: 'SHR',
    expire_in_secs: 15,
    chain_id,
};
