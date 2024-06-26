import React from 'react';

interface ToggleButtonProps {
  isChecked: boolean;
  handleToggle: () => void;
  id: string;
}

const ToggleButton: React.FC<ToggleButtonProps> = ({ isChecked, handleToggle, id }) => {
  const styles: { [key: string]: React.CSSProperties } = {
    hideMe: {
      opacity: 0,
      height: 0,
      width: 0,
    },
    toggle: {
      position: 'relative',
      display: 'inline-block',
      width: '44px',
      height: '20px',
      backgroundColor: isChecked ? 'hsl(102, 58%, 39%)' : 'hsl(0, 0%, 85%)',
      borderRadius: '16px',
      cursor: 'pointer',
      transition: 'background-color 0.25s ease-in',
    },
    toggleAfter: {
      content: '""',
      position: 'absolute',
      top: '2px',
      left: isChecked ? '26px' : '2px',
      width: '16px',
      height: '16px',
      backgroundColor: 'white',
      borderRadius: '50%',
      transition: 'all 0.25s ease-out',
    },
  };

  return (
    <>
      <input
        id={id}
        type="checkbox"
        style={styles.hideMe}
        checked={isChecked}
        onChange={handleToggle}
        aria-labelledby="cb-label"
      />
      <label htmlFor={id} style={styles.toggle}>
        <span style={styles.toggleAfter}></span>
      </label>
    </>
  );
};

export default ToggleButton;
