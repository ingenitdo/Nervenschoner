'use strict';

const helpButton = document.getElementById('help-button');
const imprintButton = document.getElementById('imprint-button');
const dataPrivacyButton = document.getElementById('data-privacy-button');

function setPage(page) {
  const iframe = document.getElementById("acp-iframe");
  iframe.setAttribute("src", page);
  if(page === "acp-help.html") {
    dataPrivacyButton.classList.remove("active");
    helpButton.classList.add("active");
    imprintButton.classList.remove("active");
  }
  if(page === "acp-imprint.html") {
    dataPrivacyButton.classList.remove("active");
    imprintButton.classList.add("active");
    helpButton.classList.remove("active");
  }
  if(page === "acp-data-privacy.html") {
    dataPrivacyButton.classList.add("active");
    imprintButton.classList.remove("active");
    helpButton.classList.remove("active");

  }
}


helpButton.addEventListener('click', () => setPage('acp-help.html'));
imprintButton.addEventListener('click', () => setPage('acp-imprint.html'));
dataPrivacyButton.addEventListener('click', () => setPage('acp-data-privacy.html'));

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const tab = urlParams.get('tab');

if(tab === "imprint") {
  setPage('acp-imprint.html');
} else if(tab === "data-privacy") {
  setPage('acp-data-privacy.html');
}


