const { ResponseCookies } = require('next/dist/compiled/@edge-runtime/cookies');
const endpoints = require('../endpoints.js')

exports.writeConfig = function writeConfig(configData, lightState, lightOn, lightOff, pumpState, fanState, heaterState, tapOnOne, tapOnTwo, tapOnThree, windowState, lowTemp, highTemp, configservice) {

  console.log("SEND: " + JSON.stringify(configData))

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  // Send data to the backend via POST
  fetch(endpoints.configServiceEndpoint, {
    method: 'POST',
    mode: 'cors',
    headers: myHeaders,
    body: configData // body data type must match "Content-Type" header

  }).then((response) => {
      console.log(response)
    })
    .catch(error => console.error(error));

}

