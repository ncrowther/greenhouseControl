//import { useQuery } from '@tanstack/react-query';
import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';
const config = require('./config.js')

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseTemperature = ({ configData, configservice }) => {

  const lightState = configData.doc.lightState;
  const heaterState = configData.doc.heaterState;
  const windowState = configData.doc.windowState;
  const fanState = configData.doc.fanState;
  const pumpState = configData.doc.pumpState;
  const lightOn = configData.doc.lightOnOff[0];
  const lightOff = configData.doc.lightOnOff[1];
  const tapOnOne = configData.doc.wateringTimes[0]
  const tapOnTwo = configData.doc.wateringTimes[1]
  const tapOnThree = configData.doc.wateringTimes[2]

  const [minTemperature, setMinTemperature] = useState(configData.doc.temperatureRange[0]);
  const [maxTemperature, setMaxTemperature] = useState(configData.doc.temperatureRange[1]);

  const handleOnSubmit = (event, configData, configservice) => {

    event.preventDefault();

    console.log("On Submit: ")

    var lowTemp = Math.trunc(minTemperature )
    var highTemp = Math.trunc(maxTemperature )

    config.writeConfig(configData, lightState, lightOn, lightOff, pumpState, fanState, heaterState, tapOnOne, tapOnTwo, tapOnThree, windowState, lowTemp, highTemp, configservice)

  };

  return (

    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>

        <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Min:&nbsp;</h3>
        <Knob value={minTemperature} onChange={(e) => setMinTemperature(e.value)} min={0} max={30} valueColor="blue" rangeColor="lightgray" />

        <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Max:&nbsp;</h3>
        <Knob value={maxTemperature} onChange={(e) => setMaxTemperature(e.value)} min={5} max={50} valueColor="red" rangeColor="lightgray"/>

      </div>

      <div></div>

      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
        <Button label=" Apply" inputid="applyTemp" name="applyTemp" value="Apply" onClick={(e) => handleOnSubmit(e, { configData}, configservice)} tooltip="Select min and max temperature" />
      </div>

    </div>

  );

};

export default GreenhouseTemperature;