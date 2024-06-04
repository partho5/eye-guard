// Popup.jsx

import React, { useEffect, useRef, useState } from 'react';
import logo from '../../assets/img/logo.png';
import './Popup.css';
import ToggleButton from '../../Components/ToggleButton/ToggleButton';
import defaultSettings from '../../Config/defaultSettings';

const Popup = () => {
  const openSettingsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  const [reminderInterval, setReminderInterval] = useState(defaultSettings.reminderInterval);
  const [reminderText, setReminderText] = useState(defaultSettings.reminderText);
  const popupRef = useRef(null);
  const [etaPercent, setEtaPercent] = useState(0);
  const [isAppToogleChecked, setIsAppToogleChecked] = useState(true);


  // Retrieve the reminderInterval value from Chrome storage
  useEffect(() => {
    chrome.storage.sync.get(['reminderInterval'], (result) => {
      if (result.reminderInterval) {
        setReminderInterval(result.reminderInterval);
      }
    });
  }, []);

  const handleIntervalChange = (e) => {
    const intVal = parseInt(e.target.value, 10); // Convert value to integer
    setReminderInterval(intVal);
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




  // useEffect(() => {
  //   // Listen for messages from the background script
  //   chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //     if (request.type === 'updateUI') {
  //       setEtaPercent(request.message);
  //       sendResponse({status: 'received'});
  //     }
  //   });
  // });


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
    <div className="popup-container">
      <div className="app-state-toggle-btn" title="Instant disable/enable">
        <ToggleButton
          isChecked={isAppToogleChecked}
          handleToggle={handleToggle}
        />
      </div>
      <div className="popup-header">
        <img src={logo} className="popup-logo" alt="eye care logo" />
        <h2 className="popup-title signika-negative-500">Protect Your Eyesight</h2>
      </div>
      <div className="popup-content">
        <div className="popup-row">
          <img
            src="https://static.vecteezy.com/system/resources/previews/019/873/851/original/clock-icon-transparent-free-icon-free-png.png"
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
            min={1}
            max={8 * 60}
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
          <button className="btn-save" onClick={handleSave} title="Your inputs will be saved">Save</button>
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
