const { ResponseCookies } = require('next/dist/compiled/@edge-runtime/cookies');
const endpoints = require('./endpoints.js');

var environments = [
  { name: 'Zone1', zoneId: '1', camId: '1' },
  { name: 'Zone2', zoneId: '2', camId: '2' },
  { name: 'Zone3', zoneId: '3', camId: '3' },
  { name: 'Zone4', zoneId: '4', camId: '4' },
];

var currentEnv = environments[0];

exports.getEnv = function getEnv() {
  return currentEnv;
};

exports.getEnvs = function getEnvs() {
  return environments;
};

exports.setEnv = function setEnv(env) {
  console.log('Environment set to: ' + env);
  currentEnv = env;
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

exports.writeConfig = function writeConfig(configData, selectedEnv) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.configServiceEndpoint + '?id=' + selectedEnv.name, {
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

exports.light = function light(configData, selectedEnv) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.lightServiceEndpoint + '?id=' + selectedEnv.name, {
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

exports.heat = function heat(configData, selectedEnv) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.heatServiceEndpoint + '?id=' + selectedEnv.name, {
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

exports.humidity = function humidity(configData, selectedEnv) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.humidityServiceEndpoint + '?id=' + selectedEnv.name, {
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

exports.fan = function fan(configData, selectedEnv) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.fanServiceEndpoint + '?id=' + selectedEnv.name, {
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

exports.vent = function vent(configData, selectedEnv) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.ventServiceEndpoint + '?id=' + selectedEnv.name, {
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

exports.water = function water(configData, selectedEnv) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.waterServiceEndpoint + '?id=' + selectedEnv.name, {
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

exports.pump = async function pump(configData, selectedEnv) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');
  // Send data to the backend via POST
  fetch(endpoints.pumpServiceEndpoint + '?id=' + selectedEnv, {
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
