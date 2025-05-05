//import { useQuery } from '@tanstack/react-query';
import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';
const config = require('./config.js')

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseWatering = ({ configData, configservice}) => {

  const lightState = configData.doc.lightState;
  const heaterState = configData.doc.heaterState;
  const windowState = configData.doc.windowState;
  const fanState = configData.doc.fanState;
  const pumpState = configData.doc.pumpState;
  const lowTemp = configData.doc.temperatureRange[0];
  const highTemp = configData.doc.temperatureRange[1];
  const lightOn = configData.doc.lightOnOff[0];
  const lightOff = configData.doc.lightOnOff[1];

  const [tapOnOne, setTapOnOne] = useState(configData.doc.wateringTimes[0])
  const [tapOnTwo, setTapOnTwo] = useState(configData.doc.wateringTimes[1])
  const [tapOnThree, setTapOnThree] = useState(configData.doc.wateringTimes[2])

  const handleOnSubmit = (event, configData, configservice) => {

    event.preventDefault();

    console.log("Got: " + JSON.stringify(configData))

    var tapOnOneTime = tapOnOne + ":00"
    var tapOnTwoTime = tapOnTwo + ":00"
    var tapOnThreeTime = tapOnThree + ":00"

   config.writeConfig(configData, lightState, lightOn, lightOff, pumpState, fanState, heaterState, tapOnOne, tapOnTwo, tapOnThree, windowState, lowTemp, highTemp, configservice)

  };

  return (

    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>

        <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Time 1:&nbsp;</h3>
        <Knob value={tapOnOne} onChange={(e) => setTapOnOne(e.value)} min={0} max={23} valueColor="green" rangeColor="lightgray" />

        <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Time 2:&nbsp;</h3>
        <Knob value={tapOnTwo} onChange={(e) => setTapOnTwo(e.value)} min={0} max={23} valueColor="green" rangeColor="lightgray" />

        <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Time 3:&nbsp;</h3>
        <Knob value={tapOnThree} onChange={(e) => setTapOnThree(e.value)} min={0} max={23} valueColor="green" rangeColor="lightgray" />

      </div>

      
      <div style={{
          display: 'flex',
          justifyContent: 'left',
          alignItems: 'center'
        }}>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

          <Button label=" Apply" inputid="applyWatering" name="applyWatering" value="Apply" onClick={(e) => handleOnSubmit(e, { configData }, configservice)} tooltip="Select watering times" />
        </div>

    </div>

  );

};

export default GreenhouseWatering;