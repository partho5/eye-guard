

export const getBaseDomain = (url: string) => {
  try {
    // Create a URL object
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Split the hostname into parts
    const parts = hostname.split('.');

    // Get the base domain
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }

    return hostname;
  } catch (error) {
    console.error('Invalid URL:', url);
    return null;
  }
};



/**
 * Function to get the active tab's URL
 * @param {function} callback - A callback function to handle the active tab's URL
 */
export const getActiveTabUrl = (callback: Function) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      const activeTab = tabs[0];
      const activeUrl = activeTab.url;
      //console.log(`getActiveTabUrl() url=${activeUrl}`);
      callback(activeUrl);
    } else {
      callback(null);
    }
  });
};





