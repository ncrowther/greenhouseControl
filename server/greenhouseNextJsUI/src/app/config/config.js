const { ResponseCookies } = require('next/dist/compiled/@edge-runtime/cookies');
const endpoints = require('./endpoints.js');

var environments = [
  { name: 'Zone1', zoneId: '1', camId: '1' },
  { name: 'Zone2', zoneId: '2', camId: '2' },
  { name: 'Zone3', zoneId: '3', camId: '3' },
  { name: 'Zone4', zoneId: '4', camId: '4' },
];

exports.getEnvs = function getEnvs() {
  return environments;
};

// Global read/write zone
let env = environments[0];
const getEnv = () => env;
const setEnv = (value) => {
  env = value;
};

exports.getEnv = getEnv;
exports.setEnv = setEnv;

exports.getConfigData = async function getConfigData(selectedEnv) {
  const configEndpoint =
    endpoints.getEndpoint() +
    endpoints.configService +
    '?id=' +
    selectedEnv.name;

  try {
    const response = await fetch(configEndpoint, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const data = await response.json();
      const configData = data.doc;
      return configData;
    } else {
      console.log('Error getting config data: ' + response.status);
      throw new Error('Error getting config data: ' + response.status);
    }
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.writeConfig = function writeConfig(configData, selectedEnv) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  // Send data to the backend via POST
  const configEndpoint =
    endpoints.getEndpoint() +
    endpoints.configService +
    '?id=' +
    selectedEnv.name;
  fetch(configEndpoint, {
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
  const lightEndpoint =
    endpoints.getEndpoint() +
    endpoints.lightService +
    '?id=' +
    selectedEnv.name;
  fetch(lightEndpoint, {
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
  const heatEndpoint =
    endpoints.getEndpoint() + endpoints.heatService + '?id=' + selectedEnv.name;
  fetch(heatEndpoint, {
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
  const humidityEndpoint =
    endpoints.getEndpoint() +
    endpoints.humidityService +
    '?id=' +
    selectedEnv.name;
  fetch(humidityEndpoint, {
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
  const fanEndpoint =
    endpoints.getEndpoint() + endpoints.fanService + '?id=' + selectedEnv.name;
  fetch(fanEndpoint, {
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
  const ventEndpoint =
    endpoints.getEndpoint() + endpoints.ventService + '?id=' + selectedEnv.name;
  fetch(ventEndpoint, {
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
  const waterEndpoint =
    endpoints.getEndpoint() +
    endpoints.waterService +
    '?id=' +
    selectedEnv.name;
  fetch(waterEndpoint, {
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

exports.pump = async function pump(configData, zoneId) {
  console.log('SEND: ' + JSON.stringify(configData));

  const myHeaders = new Headers();
  myHeaders.append('Content-Type', 'application/json');

  // Send data to the backend via POST
  const pumpEndpoint =
    endpoints.getEndpoint() + endpoints.pumpService + '?id=' + zoneId;
  fetch(pumpEndpoint, {
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
