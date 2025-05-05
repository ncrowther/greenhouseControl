exports.writeConfig = function writeConfig(configData, lightState, lightOn, lightOff, pumpState, fanState, heaterState, tapOnOne, tapOnTwo, tapOnThree, windowState, lowTemp, highTemp, configservice) {

  configData = JSON.stringify({
    "lightState": lightState,
    "lightOnOff": [
      lightOn,
      lightOff
    ],
    "pumpState": pumpState,
    "fanState": fanState,
    "heaterState": heaterState,
    "wateringTimes": [
      tapOnOne,
      tapOnTwo,
      tapOnThree
    ],
    "windowState": windowState,
    "temperatureRange": [
      lowTemp,
      highTemp
    ]
  })

  console.log("SEND: " + JSON.stringify(configData))

  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  // Send data to the backend via POST
  fetch(configservice, {
    method: 'POST',
    mode: 'cors',
    headers: myHeaders,
    body: configData // body data type must match "Content-Type" header

  }).then(
    setTimeout(() => {
      window.location.reload(true);
    }, 500))
    .catch(error => console.error(error));

}

