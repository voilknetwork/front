import React from 'react';
import PropTypes from 'prop-types';
import Logo from '../../../assets/images/logo.png';

const VoilkLogo = () => {
    return (
        <span className="logo">
            <img src={Logo} alt="Voilknetwork" id="voilknetwork" />
        </span>
    );
};

export default VoilkLogo;
