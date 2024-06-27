import { parseBoolean } from '../../utils/storageUtils';
import { checkAndUpdateAppStatus } from '../../utils/appStatusUtils';
import { getActiveTabUrl, getBaseDomain } from '../../utils/urlUtils';
import { isTimeBetween } from '../../utils/timeutils';

// console.log('This is the background page.');
// console.log('Put the background scripts here.');

// background.js

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated:', details);

  chrome.storage.sync.set({ startupTime: Date.now() });

  // Set up an alarm to check every minute
  chrome.alarms.create('checkTimeElapsed', { periodInMinutes: 1 });



  // const url = 'https://www.upwork.com/ab/account-security/login?redir=%2Fnx%2Ffind-work%2Fmost-recent';
  // const baseDomain = getBaseDomain(url);
  // console.log(baseDomain);

});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started up');

  chrome.storage.sync.set({ startupTime: Date.now() });

  // Set up an alarm to check every minute
  chrome.alarms.create('checkTimeElapsed', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  checkAndUpdateAppStatus();

  if (alarm.name === 'checkTimeElapsed') {
    checkConditionAndShowNotification();
  }
});



/* Check criteria set by user and decides if notification should be shown or not */
const checkConditionAndShowNotification = () => {
  chrome.storage.sync.get(
    [
      'startupTime', 'reminderInterval', 'reminderText', 'notificationAutoHideTime',
      'appEnableStatus', 'disabledWebsites', 'isDndEnabled', 'dndStartTime', 'dndEndTime'
    ],
    (result) => {
      console.log('Storage retrieved:', result); // Debugging line
      const {
        startupTime, reminderText, reminderInterval, appEnableStatus, disabledWebsites,
        isDndEnabled, dndStartTime, dndEndTime
      } = result;
      const interval = parseInt(reminderInterval, 10) || 60; // Convert to int and set default if NaN

      if (!startupTime) {
        console.error('startupTime is not set in storage');
        return;
      }

      const currentTime = Date.now();
      const elapsedMinutes = Math.floor((currentTime - startupTime) / (60 * 1000)); // Corrected calculation
      console.log(`Elapsed minutes: ${elapsedMinutes}, Reminder interval: ${interval}`); // Debugging line

      // updating progress percent
      const progressPercent = Math.round((elapsedMinutes % interval) * 100 / interval);
      console.log("progressPercent=" + progressPercent);
      chrome.storage.sync.set({ "progressPercent": progressPercent });


      // Check if app is enabled
      const isEnabled = parseBoolean(appEnableStatus);
      console.log(`isEnabled=${isEnabled}`);
      if (!isEnabled) {
        console.log('notification not shown because app is disabled');
        return;
      }


      // check whether DND mode enabled and current time falls amid DND time
      const dndEnabled = parseBoolean(isDndEnabled);
      if(dndEnabled){
        const now = new Date();
        if( isTimeBetween(now, dndStartTime, dndEndTime) ){
          console.log(`Current time falls amid DND time ${dndStartTime} - ${dndEndTime} . So don't show notification`);
          return;
        }
      }


      // check against disabled websites
      getActiveTabUrl((activeUrl) => {
        //console.log(`activeUrl=${activeUrl}`);
        if(activeUrl){
          const baseDomain = getBaseDomain(activeUrl);
          if(baseDomain){
            console.log(`baseDomain=${baseDomain}`);
            if (disabledWebsites.includes(baseDomain)) {
              console.log(`baseDomain=${baseDomain} is active and in the forbidden list. So dont show notification`);
              return;
            } else {
              //console.log(`baseDomain=${baseDomain} is NOT in the forbidden list.`);
              if (elapsedMinutes > 0 && elapsedMinutes % interval === 0) {
                showNotification(reminderText);
                console.log("Notification fired at " + new Date());
              }
            }
          }else{
            console.log("couldn't extract basedomain");
          }
        }else{
          console.log("no active url");
        }
      });
    }
  );
}


// Function to show a notification
const showNotification = (reminderText) => {
  const notificationId = `eyeCareReminder-${Date.now()}`;

  chrome.storage.sync.get(['notificationAutoHideTime'], (items) => {
    let autoDismissDelay = 20; // Default value

    if (items.notificationAutoHideTime !== undefined) {
      autoDismissDelay = parseInt(items.notificationAutoHideTime, 10);
    }

    console.log("notificationId=" + notificationId);
    console.log("autoDismissDelay=" + autoDismissDelay);

    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: 'icon-128.png',
      title: 'Eye Care Reminder',
      message: reminderText,
      priority: 2
    }, () => {
      if (chrome.runtime.lastError) {
        console.error(`Error creating notification: ${chrome.runtime.lastError.message}`);
        return;
      }

      console.log(`Notification ${notificationId} created`);

      setTimeout(() => {
        chrome.notifications.clear(notificationId, (wasCleared) => {
          if (chrome.runtime.lastError) {
            console.error(`Error clearing notification: ${chrome.runtime.lastError.message}`);
          } else if (wasCleared) {
            console.log(`Notification ${notificationId} auto-dismissed at ${Date.now()}`);
          } else {
            console.log(`Failed to dismiss notification ${notificationId}`);
          }
        });
      }, autoDismissDelay * 1000);
    });
  });
};

// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);

  if (message.action === 'getData') {
    chrome.storage.local.get('data', (result) => {
      sendResponse({ data: result.data });
    });

    return true; // Indicate sendResponse will be called asynchronously
  }
});
