import { getSetting } from 'meteor/vulcan:core';
import { addInitFunction, addIdentifyFunction } from 'meteor/vulcan:events';

function googleTagManagerInit() {
  const googleTagManagerId = getSetting('googleTagManager.apiKey')
  if (googleTagManagerId) {
    (function (w, d, s, l, i) {
    w[l] = w[l] || []; w[l].push({
      'gtm.start':
        new Date().getTime(), event: 'gtm.js'
    }); var f = d.getElementsByTagName(s)[0],
      j = d.createElement(s), dl = l != 'dataLayer' ? '&l=' + l : ''; 
      j.async = true; 
      j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl;         
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', googleTagManagerId)
  }
}

addInitFunction(googleTagManagerInit)

const identifyFullStoryUser = (currentUser) => {
  const { karma = 0, afKarma = 0, frontpagePostCount = 0, voteCount = 0, createdAt, username, displayName: lWDisplayName } = currentUser
  const fullStoryData = { karma, afKarma, frontpagePostCount, voteCount, createdAt, username, lWDisplayName }
  global.FS.identify(currentUser._id, {
    // Don't show user display names by default
    displayName: currentUser._id,
    email: currentUser.email,
    // Custom LessWrong variables
    ...fullStoryData
  });
}

const identifyFSCallback = (currentUser) => {
  if (global.FS) {
    identifyFullStoryUser(currentUser)
  } else {
    window.addEventListener('fullstory_loaded', function() {
      identifyFullStoryUser(currentUser)
    })
  }
}

addIdentifyFunction(identifyFSCallback)