const { ResponseCookies } = require('next/dist/compiled/@edge-runtime/cookies');
const endpoints = require('./endpoints.js');

var environment = { name: 'default', code: '1' };

exports.getEnv = function setEnv() {
  return environment;
};

exports.setEnv = function setEnv(env) {
  console.log('Environment set to: ' + env);
  environment = env;
};

/*
exports.getConfig = function getConfig() {
  console.log('Get config for: ' + environment.name);  

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.configServiceEndpoint + '?id=' + environment.name, {
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
*/

exports.writeConfig = function writeConfig(configData) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.configServiceEndpoint + '?id=' + environment.name, {
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
  fetch(endpoints.lightServiceEndpoint + '?id=' + environment.name, {
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
  fetch(endpoints.heatServiceEndpoint + '?id=' + environment.name, {
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

exports.humidity = function humidity(configData) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.humidityServiceEndpoint + '?id=' + environment.name, {
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
  fetch(endpoints.coolServiceEndpoint + '?id=' + environment.name, {
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
  fetch(endpoints.waterServiceEndpoint + '?id=' + environment.name, {
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
