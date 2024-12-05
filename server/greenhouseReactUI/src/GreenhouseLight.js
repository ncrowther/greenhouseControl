import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseLight = ({ configData }) => {

  const lightState = configData.doc.lightState;
  const heaterState = configData.doc.heaterState;
  const fanState = configData.doc.fanState;
  const pumpState = configData.doc.pumpState;
  const lowTemp = configData.doc.temperatureRange[0];
  const highTemp = configData.doc.temperatureRange[1];
  const tapOnOne = configData.doc.wateringTimes[0].split(":")[0]
  const tapOnTwo = configData.doc.wateringTimes[1].split(":")[0]
  const tapOnThree = configData.doc.wateringTimes[2].split(":")[0]

  const [lightOn, setLightOn] = useState(configData.doc.lightOnOff[0]);
  const [lightOff, setLightOff] = useState(configData.doc.lightOnOff[1]);

  const handleOnSubmit = (event, configData) => {

    event.preventDefault();

    console.log("Got: " + JSON.stringify(configData))

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
      "windowState": "OFF",
      "temperatureRange": [
        lowTemp,
        highTemp
      ]
    })

    console.log("SEND: " + JSON.stringify(configData))

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    // Send data to the backend via POST
    fetch('https://dataservice.1apbmbk49s5e.eu-gb.codeengine.appdomain.cloud/config?id=default', {
      //fetch('http://localhost:3000/config?id=default', {
      method: 'POST',
      headers: myHeaders,
      body: configData // body data type must match "Content-Type" header

    }).then(    
      setTimeout(() => {
      window.location.reload(true);
      }, 500))
    .catch(error => console.error(error));

  };

  return (

    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>

        <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;On:&nbsp;</h3>
        <Knob value={lightOn} onChange={(e) => setLightOn(e.value)} min={0} max={24} valueColor="orange" rangeColor="lightgray" />

        <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Off:&nbsp;</h3>
        <Knob value={lightOff} onChange={(e) => setLightOff(e.value)} min={0} max={24} valueColor="gray" rangeColor="lightgray" />

      </div>

      <div></div>

      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button label=" Apply" inputid="applyTemp" name="applyTemp" value="Apply" onClick={(e) => handleOnSubmit(e, { configData })} tooltip="Select light on off time" />
      </div>

    </div>

  );

};


export default GreenhouseLight;