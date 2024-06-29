// Popup.jsx

import React, { useEffect, useRef, useState } from 'react';
import logo from '../../assets/img/logo.png';
import './Popup.css';
import './Popup.css';
import '../themes/dark';
import clcokIcon from '../../assets/img/icon-clock';
import defaultSettings from '../../Config/defaultSettings';



const Popup = ({
  theme = 'default', id = 'popupView',
  disabled = false /* clickable by default */

}) => {
  const openSettingsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  const [reminderInterval, setReminderInterval] = useState(defaultSettings.reminderInterval);
  const [reminderText, setReminderText] = useState(defaultSettings.reminderText);
  const popupRef = useRef(null);
  const [etaPercent, setEtaPercent] = useState(0);
  const [isAppToogleChecked, setIsAppToogleChecked] = useState(true);
  const [currentTheme, setCurrentTheme] = useState(defaultSettings.theme);


  const compRef = useRef(null);


  // Retrieve the reminderInterval value from Chrome storage
  useEffect(() => {
    chrome.storage.sync.get(['reminderInterval'], (result) => {
      if (result.reminderInterval) {
        setReminderInterval(result.reminderInterval);
      }
    });
  }, []);

  const handleIntervalChange = (e) => {
    try{
      //when user clears field, attempting to parse value may raise error. In such case no action is taken.
      const intVal = parseInt(e.target.value, 10); // Convert value to integer
      setReminderInterval(intVal);
    }catch (e){}
  };

  const saveIntervalMagnitude = (e) => {
    chrome.storage.sync.set({reminderInterval});
  }


  useEffect(() => {
    chrome.storage.sync.get(['reminderText'], (result) => {
      if (result.reminderText) {
        setReminderText(result.reminderText);
      }
    });
  }, []);

  const handleReminderTextChange = (e) => {
    setReminderText(e.target.value);
  };

  const saveReminderText = (e) => {
    chrome.storage.sync.set({reminderText});
  }

  /* in case user clicks out of popup div, value may not be saved in general. So perform this */
  const handleClickOutside = (event) => {
    if (popupRef.current && !popupRef.current.contains(event.target)) {
      saveReminderText();
      saveIntervalMagnitude();
    }
  };


  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleSave = () => {
    window.close();
    saveReminderText();
    saveIntervalMagnitude();
  }




  useEffect(() => {
    const popupContainer = document.querySelector('.popup-container');
    chrome.storage.sync.get(['userChosenTheme'], (result) => {

      //console.log(`result.userChosenTheme=${result.userChosenTheme}`);
      //console.log(`popup id =${id}`);

      if (result.userChosenTheme) {
        const savedTheme = result.userChosenTheme;
        if(id === 'popupView'){
          //this is the main popup view of extension.
          // Hilarious logic. I got an issue in user
          theme = savedTheme === 'default' ? 'dark' : 'default';
          //console.log(`for main pop view applied theme: ${theme}`);
        }

        if(theme === 'dark'){
          console.log('rendering theme', id);
          popupContainer.classList.add('theme-dark');
          popupContainer.classList.remove('theme-default');
          popupContainer.style.background = '#000';
        }
        if(theme === 'default'){
          // default theme
          console.log('rendering theme', id);
          popupContainer.classList.add('theme-default');
          //popupContainer.classList.remove('theme-dark');
          //popupContainer.style.background = 'linear-gradient(to bottom right, #d1ffff, #ffdbfe)';
        }
      }else{
        // maybe first run.
        chrome.storage.sync.set({userChosenTheme: defaultSettings.theme});
      }
    });
  }, []);


  useEffect(() => {
    const fetchProgressPercent = () => {
      chrome.storage.sync.get(["progressPercent"], (result) => {
        const progressPercent = result.progressPercent;
        if (progressPercent !== undefined) {
          setEtaPercent(progressPercent);
        }
      });
    }

    fetchProgressPercent(); // Invoke immediately

    const handleStorageChange = (changes, areaName) => {
      if (areaName === 'sync' && 'progressPercent' in changes) {
        setEtaPercent(changes.progressPercent.newValue);
      }
    }

    // Add the listener for storage changes
    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup listener on component unmount
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };

  }, []);


  const handleToggle = () => {
    setIsAppToogleChecked(!isAppToogleChecked);
  }

  return (
    <div
      className="popup-container"
      id={id}
      ref={compRef}
      onClick={()=>{
        console.log("clicked theme id", compRef.current.id);
      }}
    >
      <div className="app-state-toggle-btn" title="Instant disable/enable">
        {/*<ToggleButton*/}
        {/*  isChecked={isAppToogleChecked}*/}
        {/*  handleToggle={handleToggle}*/}
        {/*/>*/}
      </div>
      <div className="popup-header">
        <img src={logo} className="popup-logo" alt="eye care logo" />
        <h2 className="popup-title signika-negative-500">Protect Your Eyesight</h2>
      </div>
      <div className="popup-content">
        <div className="popup-row">
          <img
            src={clcokIcon}
            className="icon icon-clock" alt="Settings" style={{ width: '50px' }} />
          <label htmlFor="reminder-interval"
                 style={{ textAlign: 'center' }}>
            Reminder interval
          </label>
          <input
            type="number"
            id="reminder-interval"
            className="popup-input"
            value={reminderInterval}
            min={10}
            max={4 * 60}
            step={10}
            onChange={handleIntervalChange}
            onMouseLeave={saveIntervalMagnitude}
          />
          <span className="popup-unit">minutes</span>
        </div>
        <div className="popup-row">
          <label htmlFor="reminder-text" className="left-indent">Reminder message</label>
          <textarea
            id="reminder-text"
            className="popup-textarea"
            rows="3"
            value={reminderText}
            onChange={handleReminderTextChange}
            onMouseLeave={saveReminderText}
          />
        </div>

        <div className="action-btns">
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={disabled}
            title="Your inputs will be saved"
          >Save</button>
        </div>
      </div>

      <div className="eta">
        <div className="progress-bar" style={{ width: `${etaPercent}%` }}></div>
      </div>

      <div className="more-options" title="These options may benefit you more">
        <div className="open-options-page" onClick={openSettingsPage}>Customize more</div>
      </div>
    </div>
  );
};

export default Popup;
