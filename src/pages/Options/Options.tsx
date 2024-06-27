import React, { useEffect, useState } from 'react';
import './Options.css';
import defaultSettings from '../../Config/defaultSettings';
import InfoIcon from '../../Components/icons/InfoIcon';
import logo from '../../assets/img/logo.png';
import restoreIcon from '../../assets/img/icon-restore-default.png';
import bugIcon from '../../assets/img/icon-bug.png';
import ToggleButton from '../../Components/ToggleButton/ToggleButton';
import { parseBoolean } from '../../utils/storageUtils';
import {
  disablePeriodExpireTime,
  getAddedTimeHumanReadable,
  isCurrentTimeAheadOf,
} from '../../utils/timeutils';

interface Props {
  title: string;
}



const Options: React.FC<Props> = ({ title }: Props) => {

  const [notificationAutoHideTime, setNotificationAutoHideTime] = useState(defaultSettings.notificationAutoHideTime);

  /**
   * disableTime is the display time and disableDurationInMinutes is the total minutes.
   * If 3 hours is selected, disableTime is 3 but corresponding disableDurationInMinutes is 3*60 minutes
   * */
  const [disableTime, setDisableTime] = useState(defaultSettings.disableDurationInMinutes);
  let [disableDurationInMinutes, setDisableDurationInMinutes] = useState(defaultSettings.disableDurationInMinutes);

  const [disableTimeUnit, setDisableTimeUnit] = useState(defaultSettings.disableTimeUnit);
  const [disabledWebsites, setDisabledWebsites] = useState(defaultSettings.disabledWebsites);
  const [dndStartTime, setDndStartTime] = useState(defaultSettings.dndStartTime);
  const [dndEndTime, setDndEndTime] = useState(defaultSettings.dndEndTime);
  const [isDndEnabled, setIsDndEnabled] = useState(defaultSettings.isDndEnabled);
  const [isAppToggleBtnEnabled, setIsAppToggleBtnEnabled] = useState(defaultSettings.appEnableStatus);
  const [appDisabledAt, setAppDisabledAt] = useState( new Date() );


  const disableFieldOpacity = 0.2;


  // at first run, save default values to storage
  useEffect(() => {
    chrome.storage.sync.get([
      'disabledWebsites', 'isAppToggleBtnEnabled', 'dndStartTime', 'dndEndTime', 'isDndEnabled'
    ], (items) => {
      if (items.disabledWebsites === undefined) {
        chrome.storage.sync.set({disabledWebsites: disabledWebsites});
      }
      if (items.isAppToggleBtnEnabled === undefined) {
        chrome.storage.sync.set({isAppToggleBtnEnabled: isAppToggleBtnEnabled});
      }
      if (items.dndStartTime === undefined) {
        chrome.storage.sync.set({dndStartTime: dndStartTime});
      }
      if (items.dndEndTime === undefined) {
        chrome.storage.sync.set({dndEndTime: dndEndTime});
      }
      if (items.isDndEnabled === undefined) {
        chrome.storage.sync.set({isDndEnabled: isDndEnabled});
      }
      console.log(`at first items.isDndEnabled=${items.isDndEnabled}`);
    });
  }, []);



  const restoreDefaults = () => {
    const newSettings = {
      notificationAutoHideTime: defaultSettings.notificationAutoHideTime,
      disableDurationInMinutes: defaultSettings.disableDurationInMinutes,
      disableTimeUnit: defaultSettings.disableTimeUnit,
      disabledWebsites: defaultSettings.disabledWebsites,
      dndStartTime: defaultSettings.dndStartTime,
      dndEndTime: defaultSettings.dndEndTime,
      isDndEnabled: defaultSettings.isDndEnabled,
      appEnableStatus: defaultSettings.appEnableStatus,
      appDisabledAt: new Date(),
    };

    setNotificationAutoHideTime(newSettings.notificationAutoHideTime);
    setDisableTime(newSettings.disableDurationInMinutes);
    setDisableDurationInMinutes(newSettings.disableDurationInMinutes);
    setDisableTimeUnit(newSettings.disableTimeUnit);
    setDisabledWebsites(newSettings.disabledWebsites);
    setDndStartTime(newSettings.dndStartTime);
    setDndEndTime(newSettings.dndEndTime);
    setIsDndEnabled(newSettings.isDndEnabled);
    setIsAppToggleBtnEnabled(newSettings.appEnableStatus);
    setAppDisabledAt(newSettings.appDisabledAt);

    chrome.storage.sync.set(newSettings, () => {
      console.log('Default settings restored and saved in Chrome storage.');
    });
  };


  useEffect(() => {
    chrome.storage.sync.get(['notificationAutoHideTime'], (items) => {
      if (items.notificationAutoHideTime !== undefined) {
        const delayTime = parseInt(items.notificationAutoHideTime, 10);
        setNotificationAutoHideTime(delayTime);
      }
    });
  }, []);


  const handleAutoHideNotificChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    setNotificationAutoHideTime(newValue);
    chrome.storage.sync.set({ notificationAutoHideTime: newValue });
  };

  const handleDisableTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(event.target.value, 10);
    setDisableTime(newValue);

    const minutes = convertDisableDurationToMinutes(newValue, disableTimeUnit);
    console.log(`handleDisableTimeChange ${minutes}`);
    chrome.storage.sync.set({ disableDurationInMinutes: minutes });
    appDisableAction(minutes);
  };


  const convertDisableDurationToMinutes = (value: number, unit: string) => {
    switch (unit) {
      case 'minute':
        return value;
      case 'hour':
        return value * 60;
      case 'day':
        return value * 1440; // 24 hours * 60 minutes
      default:
        return value;
    }
  };

  const convertMinutesToDisableDuration = (minutes: number) => {
    if (minutes % 1440 === 0) {
      return { value: minutes / 1440, unit: 'day' };
    } else if (minutes % 60 === 0) {
      return { value: minutes / 60, unit: 'hour' };
    } else {
      return { value: minutes, unit: 'minute' };
    }
  };


  /**
   * Returns an object containing the minimum, maximum, and step values that are allowed for the specified time unit.
   * For example, if the user selects the unit 'hour', the maximum value allowed is 24. If more time is needed,
   * the user should select 'day' as the unit.
   *
   * @param {string} unit - The time unit selected by the user (e.g., 'minute', 'hour', 'day').
   * @returns {Object} An object with `min`, `max`, and `step` properties.
   * @property {number} min - The minimum value allowed for the input field.
   * @property {number} max - The maximum value allowed for the input field.
   * @property {number} step - The step interval for the input field.
   */
  const getMinMaxValues = (unit: string) => {
    // Don't allow 0 as a min value
    switch (unit) {
      case 'minute':
        return { min: 10, max: 60, step: 10 };
      case 'hour':
        return { min: 4, max: 24, step: 4 };
      case 'day':
        return { min: 1, max: 31, step: 2 };
      default:
        return { min: 1, max: 90, step: 1 };
    }
  };



  const handleDisableTimeUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = event.target.value;
    setDisableTimeUnit(newUnit);
    chrome.storage.sync.set({ disableTimeUnit: newUnit });

    const { max } = getMinMaxValues(newUnit);
    setDisableTime(max);
    //console.log(`handleDisableTimeUnitChange ${max}`);
    const newDurationInMinutes = convertDisableDurationToMinutes(max, newUnit);
    chrome.storage.sync.set({ disableDurationInMinutes: newDurationInMinutes });
    appDisableAction(newDurationInMinutes);
  };

  // Call getMinMaxValues with the initial disableTimeUnit to initialize min, max, and step, which are used in initial UI rendering
  const { min, max, step } = getMinMaxValues(disableTimeUnit);


  /* Actions needed on both time and unit change */
  const appDisableAction = (disableDurationInMinutes: number) => {
    setDisableDurationInMinutes(disableDurationInMinutes);
    console.log(`setDisableDurationInMinutes()1=${disableDurationInMinutes}`);

    const disableTimeObj = new Date();
    setAppDisabledAt(disableTimeObj);
    console.log("app disabled set by user at=", disableTimeObj);
    chrome.storage.sync.set({appDisabledAt: disableTimeObj.toISOString()});
  }


  useEffect(() => {
    chrome.storage.sync.get(['appDisabledAt'], (items) => {
      if (items.appDisabledAt !== undefined) {
        try{
          const disableTimeObj = new Date(items.appDisabledAt);
          if (!isNaN(disableTimeObj.getTime())) {
            setAppDisabledAt(disableTimeObj);
          } else {
            console.log(`Invalid date format for appDisabledAt: ${items.appDisabledAt}`);
          }
        }catch (e){}
      }else{
        // Maybe App is running for the first time
        chrome.storage.sync.set({appDisabledAt: appDisabledAt.toISOString()});
        console.log("appDisabledAt set first time", appDisabledAt.toISOString());
      }
    });
  }, []);




  // Fetch and set initial values for disableTimeUnit and disableTime
  useEffect(() => {
    chrome.storage.sync.get(['disableDurationInMinutes', 'disableTimeUnit'], (items) => {
      let storedMinutes = items.disableDurationInMinutes;
      //console.log(`storedMinutes=${storedMinutes}`);
      if(storedMinutes === undefined){
        storedMinutes = defaultSettings.disableDurationInMinutes;
      }

      const storedDisableTimeUnit = items.disableTimeUnit || 'minute';
      if (storedMinutes !== undefined) {
        storedMinutes = parseInt(storedMinutes, 10);
        //console.log(`storedMinutes int=${storedMinutes}`);
        disableDurationInMinutes = storedMinutes;
        setDisableDurationInMinutes(storedMinutes);

        const unitAndTime = convertMinutesToDisableDuration(storedMinutes);
        const disableTimeUnit = unitAndTime.unit || storedDisableTimeUnit;
        const disableTimeValue = unitAndTime.value;
        //console.log(`disableDurationInMinutes= ${disableDurationInMinutes} - unit ${disableTimeUnit} & value ${disableTimeValue}`);

        setDisableTimeUnit(disableTimeUnit);
        setDisableTime(disableTimeValue);
      }else{
        // Maybe App is running for the first time
        chrome.storage.sync.set({disableDurationInMinutes: disableDurationInMinutes});
      }

      // perform initial assignment here, to use in UI rendering
      setDisableDurationInMinutes(disableDurationInMinutes);
      //console.log(`appDisabledAt= ${appDisabledAt} - disableDurationInMinutes=${disableDurationInMinutes}`);
    });
  }, []);


  const handleDisabledWebsitesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newWebsites = event.target.value;
    setDisabledWebsites(newWebsites);
    chrome.storage.sync.set({ disabledWebsites: newWebsites });
  }

  useEffect(() => {
    chrome.storage.sync.get(['disabledWebsites'], (items) => {
      if(items.disabledWebsites !== undefined){
        setDisabledWebsites(items.disabledWebsites);
      }
    });
  }, []);

  const handleDndStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value;
    setDndStartTime(newTime);
    chrome.storage.sync.set({ dndStartTime: newTime });
    console.log(`start time ${newTime}`);
  }

  useEffect(() => {
    chrome.storage.sync.get(['dndStartTime'], (items) => {
      if(items.dndStartTime !== undefined){
        setDndStartTime(items.dndStartTime);
      }
    });
  }, []);

  const handleDndEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = event.target.value;
    setDndEndTime(newTime);
    chrome.storage.sync.set({ dndEndTime: newTime });
  }

  useEffect(() => {
    chrome.storage.sync.get(['dndEndTime'], (items) => {
      if(items.dndEndTime !== undefined){
        setDndEndTime(items.dndEndTime);
      }
    });
  }, []);



  const handleAppStatusToggle  = () => {
    const newStatus = !isAppToggleBtnEnabled;
    setIsAppToggleBtnEnabled(newStatus);
    chrome.storage.sync.set({ appEnableStatus: newStatus });
  }


  useEffect(() => {
    chrome.storage.sync.get(['appEnableStatus'], (items) => {
      if (items.appEnableStatus !== undefined) {
        let status = parseBoolean(items.appEnableStatus);
        console.log('appEnableStatus option.tsx=', status);

        if (appDisabledAt && isCurrentTimeAheadOf(disablePeriodExpireTime(appDisabledAt, disableDurationInMinutes))) {
          status = true; // Enable the app if the disable time has passed
          chrome.storage.sync.set({ appEnableStatus: status });
        }

        setIsAppToggleBtnEnabled(status);
      }else{
        // Maybe App is running for the first time
        chrome.storage.sync.set({ appEnableStatus: defaultSettings.appEnableStatus });
      }
    });
  }, [appDisabledAt, disableDurationInMinutes]);



  const handleDndStatusToggle = () => {
    const newStatus = !isDndEnabled;
    setIsDndEnabled(newStatus);
    chrome.storage.sync.set({ isDndEnabled: newStatus });
  }

  useEffect(() => {
    chrome.storage.sync.get(['isDndEnabled'], (items) => {
      console.log(`isDndEnabled=${items.isDndEnabled}`);
      if(items.isDndEnabled !== undefined){
        const status = parseBoolean(items.isDndEnabled);
        setIsDndEnabled(status);
      }
    });
  }, []);



  return (
    <div className="container">
      <div className="header">
        <img src={logo} className="logo" alt="Logo" />
        <h3 className="font-play-bold">Eye Care</h3>
        <h1 className="font-play-bold">Customize to fit your need</h1>
      </div>

      <div className="content">
        <div className="preferences">

          <div className="section">
            <div className="title">More Comfort</div>
            <div className="body">
              <div className="preference">
                <span>
                  <InfoIcon title="If you don't close notification, it will automatically disappear after some delay" />
                  Auto hide notification after
                </span>
                <input
                  className='input-field'
                  type="number"
                  id="auto-hide-notific-input"
                  value={notificationAutoHideTime}
                  min="10"
                  max="60"
                  step="10"
                  onChange={handleAutoHideNotificChange}
                />
                seconds
              </div>
            </div>
          </div>

          <div className="section">
            <div className="title">Eliminate Side-effects</div>
            <div className="body">
              <div className="preference">
                <div>
                  <InfoIcon title="If you are in important works and want to disable the app temporarily" />
                  The app is currently
                  <span style={{ position: 'relative', top: '5px', margin: '0 6px 0 2px' }}>
                    <ToggleButton
                      id="app-status-toggle"
                      isChecked={isAppToggleBtnEnabled}
                      handleToggle={handleAppStatusToggle}
                    />
                  </span>
                  {isAppToggleBtnEnabled ? 'enabled' : 'disabled'}
                </div>
                <div className="disable-inputs-container"
                     style={{ opacity: (isAppToggleBtnEnabled ? disableFieldOpacity : 1) }}>
                  <span>Disable for next</span>
                  <input
                    className="input-field"
                    type="number"
                    id="disable-time-input"
                    value={disableTime}
                    min={min}
                    max={max}
                    step={step}
                    onChange={handleDisableTimeChange}
                    disabled={isAppToggleBtnEnabled}
                  />
                  <select
                    className="input-field"
                    id="disable-time-unit"
                    value={disableTimeUnit}
                    onChange={handleDisableTimeUnitChange}
                    disabled={isAppToggleBtnEnabled}
                  >
                    <option value="minute">{disableTime > 1 ? 'minutes' : 'minute'}</option>
                    <option value="hour">{disableTime > 1 ? 'hours' : 'hour'}</option>
                    <option value="day">{disableTime > 1 ? 'days' : 'day'}</option>
                  </select>
                  <div className="re-enable-label">
                    {appDisabledAt && !isCurrentTimeAheadOf(disablePeriodExpireTime(appDisabledAt, disableDurationInMinutes)) &&
                      <span>
                        will be enabled @ &nbsp;
                        {getAddedTimeHumanReadable(appDisabledAt, disableDurationInMinutes + 1)}
                        {/* just added 1 minute tolerance */}
                      </span>
                    }
                  </div>
                </div>
              </div>

              <div className="preference">
                <span>
                  <InfoIcon title="Each website must be in a separate line" />
                  Don't show notification while I am visiting these websites
                </span>
                <br />
                <textarea
                  placeholder="https://example.com"
                  className="input-field"
                  style={{ width: '80%', height: '100px', lineHeight: 2 }}
                  value={disabledWebsites}
                  spellCheck={false}
                  onChange={handleDisabledWebsitesChange}
                />
              </div>

              <div className="preference2">
                <span>
                  <InfoIcon title="Notification won't be shown during this time span" />
                  DND Mode
                  <span style={{ position: 'relative', top: '5px', margin: '0 6px 0 2px' }}>
                    <ToggleButton
                      id="dnd-toggle"
                      isChecked={isDndEnabled}
                      handleToggle={handleDndStatusToggle}
                    />
                  </span>
                </span>
                <div style={{ marginLeft: '5em', opacity: isDndEnabled ? 1 : disableFieldOpacity }}>
                  Do not disturb between
                  <input
                    className="input-field"
                    title="Start Time"
                    style={{ minWidth: '15%' }}
                    type="time"
                    value={dndStartTime}
                    disabled={!isDndEnabled}
                    onChange={handleDndStartTimeChange}
                  />
                  and
                  <input
                    className="input-field"
                    title="End Time"
                    style={{ minWidth: '15%' }}
                    type="time"
                    value={dndEndTime}
                    disabled={!isDndEnabled}
                    onChange={handleDndEndTimeChange}
                  />
                </div>
              </div>

            </div>
          </div>


          <div className="section section-about">
            <div className="title">About</div>
            <div className="body">
              <div className="secondary-title"><span>About this project</span></div>
              <div className="description">
                This is a open source project developed for the people like me who are passionate in their works and
                forget to take rest specially for their eyes.
                Though there may exist some similar solutions, this is my own effort to create more utility.
              </div>
              <br />
              <div className="secondary-title"><span>About developer</span></div>
              <div className="description">
                Hello! This is Partho, a full-stack engineer, co-founder of <a href="https://datamatric.com">Data
                Matric</a>. Alongside full-stack development I am recently focused on building AI solutions.
              </div>
            </div>
          </div>

          <div className="section section-action flex">
            <div className="action restore" title="All your preferences will be lost" onClick={restoreDefaults}>
              <img className="icon icon-restore" src={restoreIcon} alt="Restore Icon" />
              <span className="label">Restore default</span>
            </div>
            <div className="action" title="Report me if you find a bug/issue">
              <img className="icon icon-bug" src={bugIcon} alt="Bug Icon" />
              <span className="label">
                <a href="https://github.com/partho5/eye-guard/issues" target="_blank">Bug report</a>
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Options;
