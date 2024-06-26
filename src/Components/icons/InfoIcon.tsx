import React, { CSSProperties, useState } from 'react';

interface InfoIconProps {
  title: string;
}

const InfoIcon: React.FC<InfoIconProps> = ({ title }) => {
  const iconStyle: CSSProperties = {
    backgroundColor: '#fff',
    color: '#000',
    border: '1px solid #000',
    fontSize: '0.9rem',
    marginRight: '10px',
    position: 'relative',
    bottom: '3px',
    fontFamily: '"Courier New", cursive',
    padding: '1px 5px',
    borderRadius: '50%',
    cursor: 'pointer',
    transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
  };

  const iconHoverStyle: CSSProperties = {
    backgroundColor: '#000',
    color: '#fff',
    borderColor: '#000',
  };

  const [hover, setHover] = useState(false);

  return (
    <span
      className="icon-info"
      title={title}
      style={hover ? { ...iconStyle, ...iconHoverStyle } : iconStyle}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
            i
        </span>
  );
};

export default InfoIcon;
