console.log('This is the background page.');
console.log('Put the background scripts here.');

// background.js

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated:', details);

  chrome.storage.sync.set({ startupTime: Date.now() });

  // Set up an alarm to check every minute
  chrome.alarms.create('checkTimeElapsed', { periodInMinutes: 1 });
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started up');

  chrome.storage.sync.set({ startupTime: Date.now() });

  // Set up an alarm to check every minute
  chrome.alarms.create('checkTimeElapsed', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkTimeElapsed') {
    checkConditionAndShowNotification();
  }
});



/* Check criteria set by user and decides if notification should be shown or not */
const checkConditionAndShowNotification = () => {
  chrome.storage.sync.get(['startupTime', 'reminderInterval', 'reminderText'], (result) => {
    console.log('Storage retrieved:', result); // Debugging line
    const { startupTime, reminderText, reminderInterval } = result;
    const interval = parseInt(reminderInterval, 10) || 60; // Convert to int and set default if NaN

    if (!startupTime) {
      console.error('startupTime is not set in storage');
      return;
    }

    const currentTime = Date.now();
    const elapsedMinutes = Math.floor((currentTime - startupTime) / (60 * 1000)); // Corrected calculation

    console.log(`Elapsed minutes: ${elapsedMinutes}, Reminder interval: ${interval}`); // Debugging line

    if (elapsedMinutes > 0 && elapsedMinutes % interval === 0) {
      showNotification(reminderText);
      console.log("Notification fired at "+ new Date());
    }

    const progressPercent = Math.round((elapsedMinutes % interval) * 100 / interval);
    console.log("progressPercent=" + progressPercent);
    chrome.storage.sync.set({"progressPercent": progressPercent});
  });
}


// Function to show a notification
const showNotification = (reminderText) => {
  const notificationId = `eyeCareReminder-${Date.now()}`;
  const autoDismissDelay = 20; //sec

  console.log("notificationId=" + notificationId);

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
