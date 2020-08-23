import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import shouldComponentUpdate from 'app/utils/shouldComponentUpdate';
//import { imageProxy } from 'app/utils/ProxifyUrl';
import proxifyImageUrl from 'app/utils/ProxifyUrl';

export const SIZE_SMALL = 'small';
export const SIZE_MED = 'medium';
export const SIZE_LARGE = 'large';

const sizeList = [SIZE_SMALL, SIZE_MED, SIZE_LARGE];

export const avatarSize = {
    small: SIZE_SMALL,
    medium: SIZE_MED,
    large: SIZE_LARGE,
};

class Userpic extends Component {
    shouldComponentUpdate = shouldComponentUpdate(this, 'Userpic');

    render() {
        const { account, json_metadata, size } = this.props;
        const hideIfDefault = this.props.hideIfDefault || false;
        const avSize = size && sizeList.indexOf(size) > -1 ? '/' + size : '';
    //let md = {};//JSON.parse(json_metadata);
        let default_url = "https://www.shareicon.net/data/512x512/2015/10/05/651222_man_512x512.png";
        let style = {
            backgroundImage:
                'url(' + proxifyImageUrl(default_url, `${avSize}`) + ')',
        };
        //if (hideIfDefault) {
            try {
                const md = JSON.parse(json_metadata);
                if (!/^(https?:)\/\//.test(md.profile.profile_image)) {
                        
                    style = {
                        backgroundImage:
                            'url(' + proxifyImageUrl(default_url, `${avSize}`) + ')',
                    };
                    //return null;
                }
                else {  
                    style = {
                                backgroundImage:
                                    'url(' + proxifyImageUrl(md.profile.profile_image, `${avSize}`) + ')',
                            };
                        
                }
            } catch (e) {
                //return null;
            }
        //}
        
        
        //const img = JSON.parse(json_metadata);
        /*
        const style = {
                backgroundImage:
                    'url(' + proxifyImageUrl(md.profile.profile_image, `${avSize}`) + ')',
        };
        
        const style = {
            backgroundImage:
                'url(' + imageProxy() + `u/${account}/avatar${avSize})`,
        };
	*/
        return <div className="Userpic" style={style} />;
    }
}

Userpic.propTypes = {
    account: PropTypes.string.isRequired,
};

export default connect((state, ownProps) => {
    const { account, hideIfDefault } = ownProps;
    return {
        account,
        json_metadata: state.global.getIn([
            'accounts',
            account,
            'json_metadata',
        ]),
        hideIfDefault,
    };
})(Userpic);
