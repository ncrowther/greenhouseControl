import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseLight = ({ jsonConfig }) => {

  const lightState = jsonConfig.doc.lightState;
  const heaterState = jsonConfig.doc.heaterState;
  const fanState = jsonConfig.doc.fanState;
  const pumpState = jsonConfig.doc.pumpState;
  const lowTemp = jsonConfig.doc.temperatureRange[0];
  const highTemp = jsonConfig.doc.temperatureRange[1];
  const tapOnOne = jsonConfig.doc.wateringTimes[0].split(":")[0]
  const tapOnTwo = jsonConfig.doc.wateringTimes[1].split(":")[0]
  const tapOnThree = jsonConfig.doc.wateringTimes[2].split(":")[0]

  const [lightOn, setLightOn] = useState(jsonConfig.doc.lightOnOff[0]);
  const [lightOff, setLightOff] = useState(jsonConfig.doc.lightOnOff[1]);

  const handleOnSubmit = (event, jsonConfig) => {

    event.preventDefault();

    console.log("Got: " + JSON.stringify(jsonConfig))

    jsonConfig = JSON.stringify({
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

    console.log("SEND: " + JSON.stringify(jsonConfig))

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    // Send data to the backend via POST
    fetch('https://dataservice.1apbmbk49s5e.eu-gb.codeengine.appdomain.cloud/config?id=default', {
      //fetch('http://localhost:3000/config?id=default', {
      method: 'POST',
      headers: myHeaders,
      body: jsonConfig // body data type must match "Content-Type" header

    })

    setTimeout(() => {
      window.location.reload(true);
    }, 500);

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
        <Button label=" Apply" inputid="applyTemp" name="applyTemp" value="Apply" onClick={(e) => handleOnSubmit(e, { jsonConfig })} tooltip="Select light on off time" />
      </div>

    </div>

  );

};


export default GreenhouseLight;