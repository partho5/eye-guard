import React, { useState } from 'react';
import './ToggleButton.css'; // Import the CSS file

interface ToggleButtonProps {
  isChecked: boolean,
  handleToggle: () => void
}

const ToggleButton: React.FC<ToggleButtonProps> = ({isChecked, handleToggle}) => {

  return (
    <>
      {/*<div id="cb-label">*/}
      {/*  current state: <span id="toggle-state">{isChecked ? 'Enabled' : 'Disabled'}</span>*/}
      {/*</div>*/}
      <input
        id="cb-toggle"
        type="checkbox"
        className="hide-me"
        checked={isChecked}
        onChange={handleToggle}
        aria-labelledby="cb-label"
      />
      <label htmlFor="cb-toggle" className="toggle"></label>
    </>
  );
};


// make handleToggle optional
ToggleButton.defaultProps = {
  handleToggle: () => {}
};

export default ToggleButton;
