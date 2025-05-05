import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';
const config = require('./config.js')

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseLight = ({ configData, configservice }) => {

  const lightState = configData.doc.lightState;
  const heaterState = configData.doc.heaterState;
  const windowState = configData.doc.windowState;
  const fanState = configData.doc.fanState;
  const pumpState = configData.doc.pumpState;
  const lowTemp = configData.doc.temperatureRange[0];
  const highTemp = configData.doc.temperatureRange[1];
  const tapOnOne = configData.doc.wateringTimes[0]
  const tapOnTwo = configData.doc.wateringTimes[1]
  const tapOnThree = configData.doc.wateringTimes[2]

  const [lightOn, setLightOn] = useState(configData.doc.lightOnOff[0]);
  const [lightOff, setLightOff] = useState(configData.doc.lightOnOff[1]);

  const handleOnSubmit = (event, configData, configservice) => {

    event.preventDefault();

    console.log("Got: " + JSON.stringify(configData))

    config.writeConfig(configData, lightState, lightOn, lightOff, pumpState, fanState, heaterState, tapOnOne, tapOnTwo, tapOnThree, windowState, lowTemp, highTemp, configservice)

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
        <Button label=" Apply" inputid="applyTemp" name="applyTemp" value="Apply" onClick={(e) => handleOnSubmit(e, { configData},  configservice)} tooltip="Select light on off time" />
      </div>

    </div>

  );

};


export default GreenhouseLight;