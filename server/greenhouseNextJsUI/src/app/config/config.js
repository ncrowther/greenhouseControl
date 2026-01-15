const { ResponseCookies } = require('next/dist/compiled/@edge-runtime/cookies');
const endpoints = require('../endpoints.js');

exports.writeConfig = function writeConfig(configData) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.configServiceEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: myHeaders,
    body: configData, // body data type must match "Content-Type" header
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.error(error));
};

exports.light = function light(configData) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.lightServiceEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: myHeaders,
    body: configData, // body data type must match "Content-Type" header
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.error(error));
};

exports.heat = function heat(configData) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.heatServiceEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: myHeaders,
    body: configData, // body data type must match "Content-Type" header
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.error(error));
};

exports.cool = function cool(configData) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.coolServiceEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: myHeaders,
    body: configData, // body data type must match "Content-Type" header
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.error(error));
};

exports.water = function water(configData) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.waterServiceEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: myHeaders,
    body: configData, // body data type must match "Content-Type" header
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => console.error(error));
};
