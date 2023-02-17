'use strict';

import µb from './background.js';

const setSettings = () => {
  const userData = {
    timeStamp: 1636363940962,
    version: "1.44.0",
    userSettings: {
      externalLists: ["https://nervenschoner.eu/nervenschoner.txt"],
      importedLists: ["https://nervenschoner.eu/nervenschoner.txt"]
    },
    selectedFilterLists: [
      "adguard-spyware",
      "easyprivacy",
      "fanboy-cookiemonster",
      //      "nervenschoner",
      "https://nervenschoner.eu/nervenschoner.txt"
    ],
    hiddenSettings: {},
    whitelist: [
      "about-scheme",
      "chrome-extension-scheme",
      "chrome-scheme",
      "edge-scheme",
      "moz-extension-scheme",
      "opera-scheme",
      "vivaldi-scheme",
      "wyciwyg-scheme"
    ],
    dynamicFilteringString: "behind-the-scene * * noop\nbehind-the-scene * inline-script noop\nbehind-the-scene * 1p-script noop\nbehind-the-scene * 3p-script noop\nbehind-the-scene * 3p-frame noop\nbehind-the-scene * image noop\nbehind-the-scene * 3p noop",
    urlFilteringString: "",
    hostnameSwitchesString: "no-large-media: behind-the-scene false\nno-csp-reports: * true",
    userFilters: ""
  };


  vAPI.storage.set({
    hiddenSettings: userData.hiddenSettings,
    netWhitelist: userData.whitelist || [],
    dynamicFilteringString: userData.dynamicFilteringString || '',
    urlFilteringString: userData.urlFilteringString || '',
    hostnameSwitchesString: userData.hostnameSwitchesString || '',
    externalLists: userData.userSettings.externalLists,
    importedLists: userData.userSettings.importedLists
  });
  µb.saveUserFilters(userData.userFilters);
  if ( Array.isArray(userData.selectedFilterLists) ) {
    µb.saveSelectedFilterLists(userData.selectedFilterLists);
  }
};

setSettings();
