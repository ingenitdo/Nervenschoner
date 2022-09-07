/*******************************************************************************

 uBlock Origin - a browser extension to block requests.
 Copyright (C) 2014-present Raymond Hill

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see {http://www.gnu.org/licenses/}.

 Home: https://github.com/gorhill/uBlock
 */

/* global uDom */

'use strict';

const messaging = vAPI.messaging;
const scopeToSrcHostnameMap = {
  '/': '*',
  '.': ''
};
const hostnameToSortableTokenMap = new Map();
//const statsStr = vAPI.i18n('popupBlockedStats');
//const domainsHitStr = vAPI.i18n('popupHitDomainCount');

let popupData = {};
//let dfPaneBuilt = false;
//let dfHotspots = null;
//const allHostnameRows = [];
//let cachedPopupHash = '';

const cachePopupData = function ( data ) {
  popupData = {};
  scopeToSrcHostnameMap['.'] = '';
  hostnameToSortableTokenMap.clear();

  if( typeof data !== 'object' ) {
    return popupData;
  }
  popupData = data;
  popupData.cnameMap = new Map( popupData.cnameMap );
  scopeToSrcHostnameMap['.'] = popupData.pageHostname || '';
  const hostnameDict = popupData.hostnameDict;
  if( typeof hostnameDict !== 'object' ) {
    return popupData;
  }
  for( const hostname in hostnameDict ) {
    if( hostnameDict.hasOwnProperty( hostname ) === false ) {
      continue;
    }
    let domain = hostnameDict[hostname].domain;
    let prefix = hostname.slice( 0, 0 - domain.length - 1 );
    // Prefix with space char for 1st-party hostnames: this ensure these
    // will come first in list.
    if( domain === popupData.pageDomain ) {
      domain = '\u0020';
    }
    hostnameToSortableTokenMap.set(
      hostname,
      domain + ' ' + prefix.split( '.' ).reverse().join( '.' )
    );
  }
  return popupData;
};

const getPopupData = async function ( tabId ) {
  const response = await messaging.send( 'popupPanel', {
    what: 'getPopupData',
    tabId,
  } );

  cachePopupData( response );
};

const toggleNetFilteringSwitch = function ( ev ) {
  if( !popupData || !popupData.pageURL ) {
    return;
  }

  messaging.send( 'popupPanel', {
    what: 'toggleNetFiltering',
    url: popupData.pageURL,
    scope: ev.ctrlKey || ev.metaKey ? 'page' : '',
    state: !uDom( 'body' ).toggleClass( 'off' ).hasClass( 'off' ),
    tabId: popupData.tabId,
  } );
  getState( !uDom( 'body' ).hasClass( 'off' ) );

  messaging.send('popupPanel', {
    what: 'reloadTab',
    tabId: popupData.tabId,
    select: vAPI.webextFlavor.soup.has('mobile'),
    bypassCache: ev.ctrlKey || ev.metaKey || ev.shiftKey,
  });
};

const toggleTracker = async function () {
  const elem = document.getElementById( 'acp-config-tracker' );
  const isWebTracker = !document.getElementById( 'acp-config-tracker' ).classList.contains( 'off' );

  if( isWebTracker ) {
    elem.classList.add( 'off' );
    toggleWebTracker( false );
  }
  else {
    elem.classList.remove( 'off' );
    toggleWebTracker( true );
  }
  getState( !uDom( 'body' ).hasClass( 'off' ) );
};

const getState = ( configOn ) => {
  const isWebTracker = !document.getElementById( 'acp-config-tracker' ).classList.contains( 'off' );

  if( configOn ) {
    uDom( '#acp-config' ).addClass( 'acp-config-on' );
    uDom( '#acp-config' ).removeClass( 'acp-config-off' );

    document.getElementById( 'acp-config-enable-button' ).ariaLabel="Einwilligungs- und Cookiebanner werden blockiert";

    document.getElementById( 'acp-config-cookies' ).innerHTML = "Einwilligungs- und Cookiebanner werden blockiert";
    document.getElementById( 'acp-config-enable-label' ).innerHTML = "Auf dieser Website nichts blockieren";
    uDom( '#acp-config-enable-button' ).addClass( 'acp-config-enable-button-on' );
    uDom( '#acp-config-enable-button' ).removeClass( 'acp-config-enable-button-off' );

    if( isWebTracker ) {
      document.getElementById( 'acp-config-tracker-label' ).ariaLabel="Web-Tracker werden zusätzlich blockiert";

      document.getElementById( 'acp-config-tracker-label' ).innerHTML = "Web-Tracker werden zusätzlich blockiert";
      uDom( '#acp-config-tracker-button' ).addClass( 'acp-config-tracker-button-on' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-on-disabled' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-off' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-off-disabled' );
    }
    else {
      document.getElementById( 'acp-config-tracker-label' ).ariaLabel="Web-Tracker werden nicht zusätzlich blockiert";

      document.getElementById( 'acp-config-tracker-label' ).innerHTML = "Web-Tracker zusätzlich blockieren";
      uDom( '#acp-config-tracker-button' ).addClass( 'acp-config-tracker-button-off' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-off-disabled' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-on' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-on-disabled' );
    }
  }
  else {
    uDom( '#acp-config' ).addClass( 'acp-config-off' );
    uDom( '#acp-config' ).removeClass( 'acp-config-on' );

    document.getElementById( 'acp-config-enable-button' ).ariaLabel="Einwilligungs- und Cookiebanner werden nicht blockiert";

    document.getElementById( 'acp-config-cookies' ).innerHTML = "Einwilligungs- und Cookiebanner werden nicht blockiert";
    document.getElementById( 'acp-config-enable-label' ).innerHTML = "Blockieren für diese Website wieder einschalten";
    uDom( '#acp-config-enable-button' ).addClass( 'acp-config-enable-button-off' );
    uDom( '#acp-config-enable-button' ).removeClass( 'acp-config-enable-button-on' );

    if( isWebTracker ) {
      document.getElementById( 'acp-config-tracker-label' ).ariaLabel="Web-Tracker werden nicht blockiert";

      document.getElementById( 'acp-config-tracker-label' ).innerHTML = "Web-Tracker werden nicht blockiert";
      uDom( '#acp-config-tracker-button' ).addClass( 'acp-config-tracker-button-on-disabled' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-on' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-off' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-off-disabled' );
    }
    else {
      document.getElementById( 'acp-config-tracker-label' ).ariaLabel="Web-Tracker werden nicht zusätzlich blockiert";

      document.getElementById( 'acp-config-tracker-label' ).innerHTML = "Web-Tracker zusätzlich blockieren";
      uDom( '#acp-config-tracker-button' ).addClass( 'acp-config-tracker-button-off-disabled' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-off' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-on' );
      uDom( '#acp-config-tracker-button' ).removeClass( 'acp-config-tracker-button-on-disabled' );
    }
  }
};

// after load
const selfURL = new URL( self.location.href );
const tabId = parseInt( selfURL.searchParams.get( 'tabId' ), 10 ) || null;

getPopupData( tabId, true ).then( async () => {
  const isFiltering = popupData.netFilteringSwitch;

  const isWebTracker = await getIsWebTracker();

  if( !isFiltering ) {
    uDom( 'body' ).addClass( 'off' );
  }
  if( !isWebTracker ) {
    document.getElementById( 'acp-config-tracker' ).classList.add( 'off' );
  }
  getState( isFiltering, isWebTracker );
  if( document.readyState !== 'complete' ) {
    self.addEventListener( 'load', () => {
      getState( true, true );
    }, { once: true } );
  }
  else {
  }
} );

uDom( '#acp-config-enable-button' ).on( 'click', toggleNetFilteringSwitch );
uDom( '#acp-config-tracker' ).on( 'click', toggleTracker );
uDom( '#acp-config-tracker-button2' ).on( 'click', toggleTracker );

const getIsWebTracker = async () => {
  return messaging.send( 'dashboard', {
    what: 'getLists',
  } ).then( details => {
    return details.available["adguard-spyware"].off === false;
  } );
};

const toggleWebTracker = ( state ) => {
  let toSelect = ["fanboy-cookiemonster",
    "https://nervenschoner.eu/nervenschoner.txt",
//    "nervenschoner"
        ];
  let toRemove = ["adguard-spyware",
    "easyprivacy"];
  if( state ) {
    toSelect = [
      "fanboy-cookiemonster",
//      "nervenschoner",
      "https://nervenschoner.eu/nervenschoner.txt",
      "adguard-spyware",
      "easyprivacy"];
    toRemove = [];
  }
  messaging.send( 'dashboard', {
    what: 'applyFilterListSelection',
    toSelect: toSelect,
    toImport: [],
    toRemove: toRemove,
  } );
};