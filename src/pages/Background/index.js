console.log('This is the background page.');
console.log('Put the background scripts here.');


// background.js

// Listen for the onInstalled event, which fires when the extension is first installed, updated, or reloaded.
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated:', details);

  // Perform initialization tasks when the extension is installed or updated
  // For example, set default settings or show a welcome message

  // Store the startup time when the extension is installed or reloaded
  chrome.storage.sync.set({ startupTime: Date.now() });

});

// Listen for the onStartup event, which fires when the browser starts up or when the extension is first loaded.
chrome.runtime.onStartup.addListener(() => {
  console.log('Extension started up');

  // Perform tasks on extension startup
  // For example, check for updates or resume any ongoing tasks

  // Store the startup time when the browser starts up
  chrome.storage.sync.set({ startupTime: Date.now() });
});

// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message);

  // Process the message and respond if necessary
  if (message.action === 'getData') {
    // Example: Retrieve data from storage and send it back to the sender
    chrome.storage.local.get('data', (result) => {
      sendResponse({ data: result.data });
    });

    // Return true to indicate that sendResponse will be called asynchronously
    return true;
  }
});




chrome.storage.sync.get(['reminderInterval', 'reminderText'], (result)=>{
  console.log("reminderInterval="+result.reminderInterval);
  console.log("reminderText="+result.reminderText);
});





// Function to send a message to the popup
function updatePopupUI(message) {
  chrome.runtime.sendMessage({type: 'updateUI', message: message}, (response) => {
    console.log('Popup has been updated:', response);
  });
}





// Function to show a notification
const showNotification = (reminderText) => {
  const notificationId = `eyeCareReminder-${Date.now()}`;

  console.log("notificationId="+notificationId);

  // Create the notification
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: 'icon-128.png',
    title: 'Eye Care Reminder',
    message: reminderText,
    priority: 2
  }, () => {
    // Set a timeout to auto-dismiss the notification after (n*1000) milliseconds
    setTimeout(() => {
      chrome.notifications.clear(notificationId, (wasCleared) => {
        if (wasCleared) {
          console.log(`Notification ${notificationId} auto-dismissed`);
        } else {
          console.log(`Failed to dismiss notification ${notificationId}`);
        }
      });
    }, 20 * 1000);
  });
};



// Check the time elapsed every minute
setInterval(() => {
  chrome.storage.sync.get(['startupTime', 'reminderInterval', 'reminderText'], (result) => {
    console.log('Storage retrieved:', result); // Debugging line
    const { startupTime } = result;
    const {reminderText} = result;
    const reminderInterval = parseInt(result.reminderInterval, 10) || 60; // Convert to int and set default if NaN

    if (!startupTime) {
      console.error('startupTime is not set in storage');
      return;
    }

    const currentTime = Date.now();
    const elapsedMinutes = Math.floor((currentTime - startupTime) / (60 * 1000)); // Corrected calculation

    console.log(`Elapsed minutes: ${elapsedMinutes}, Reminder interval: ${reminderInterval}`); // Debugging line

    // Show notification every reminderInterval minutes
    if (elapsedMinutes > 0 && elapsedMinutes % reminderInterval === 0) {
      showNotification(reminderText);
      console.log("Notification fired at "+ new Date());
    }

    const progressPercent = Math.round((elapsedMinutes % reminderInterval) * 100 / reminderInterval);
    console.log("progressPercent="+progressPercent);
    chrome.storage.sync.set({"progressPercent" : progressPercent});

  });
}, 60 * 1000); // 60*1000 ms=1min. Check every minute
