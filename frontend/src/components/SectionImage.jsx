import React from 'react';

export default function SectionImage({ src, alt, height = 200, width = "100%", objectFit = "cover", objectPosition = "center", style = {} }) {
    if (!src) return null;
    return (
        <div
            style={{
                width: width,
                height: height,
                borderRadius: 16,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(255,255,255,0.02)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                ...style
            }}
        >
            <img
                src={src}
                alt={alt}
                style={{
                    width: '100%',
                    height: '100%',
                    objectFit: objectFit,
                    objectPosition: objectPosition,
                }}
                onError={(e) => {
                    e.target.style.display = 'none';
                }}
            />
        </div>
    );
}
