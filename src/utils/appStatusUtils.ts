
import { disablePeriodExpireTime, isCurrentTimeAheadOf } from './timeutils';
import { parseBoolean } from './storageUtils';
import defaultSettings from '../Config/defaultSettings';

export const checkAndUpdateAppStatus = () => {
  chrome.storage.sync.get(['appEnableStatus', 'appDisabledAt', 'disableDurationInMinutes'], (items) => {
    let status = items.appEnableStatus !== undefined ? parseBoolean(items.appEnableStatus) : defaultSettings.appEnableStatus;
    const appDisabledAt = items.appDisabledAt ? new Date(items.appDisabledAt) : undefined;
    const disableDurationInMinutes = items.disableDurationInMinutes !== undefined ? parseInt(items.disableDurationInMinutes, 10) : defaultSettings.disableDurationInMinutes;

    if (appDisabledAt && isCurrentTimeAheadOf(disablePeriodExpireTime(appDisabledAt, disableDurationInMinutes))) {
      status = true; // Enable the app if the disable time has passed
      chrome.storage.sync.set({ appEnableStatus: status });
      console.log(`checkAndUpdateAppStatus() ${status}`);
    }
  });
};


