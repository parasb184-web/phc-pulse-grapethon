import React from 'react';
import logoUrl from '../assets/phc-pulse-logo.png'; // Make sure the asset exists here

const Logo = ({ height = 40, style = {} }) => {
    return (
        <img
            src={logoUrl}
            alt="PHC Pulse Logo"
            style={{
                height: `${height}px`,
                width: 'auto',
                objectFit: 'contain',
                ...style,
            }}
        />
    );
};

export default Logo;
