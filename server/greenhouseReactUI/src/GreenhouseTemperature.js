//import { useQuery } from '@tanstack/react-query';
import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseTemperature = ({ configData, configservice }) => {

  const lightState = configData.doc.lightState;
  const heaterState = configData.doc.heaterState;
  const fanState = configData.doc.fanState;
  const pumpState = configData.doc.pumpState;
  const lightOn = configData.doc.lightOnOff[0];
  const lightOff = configData.doc.lightOnOff[1];
  const tapOnOne = configData.doc.wateringTimes[0].split(":")[0]
  const tapOnTwo = configData.doc.wateringTimes[1].split(":")[0]
  const tapOnThree = configData.doc.wateringTimes[2].split(":")[0]

  const [minTemperature, setMinTemperature] = useState(configData.doc.temperatureRange[0]);
  const [maxTemperature, setMaxTemperature] = useState(configData.doc.temperatureRange[1]);

  const handleOnSubmit = (event, configData, configservice) => {

    event.preventDefault();

    console.log("On Submit: ")

    var lowTemp = Math.trunc(minTemperature )
    var highTemp = Math.trunc(maxTemperature )

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
      "windowState": heaterState,
      "temperatureRange": [
        lowTemp,
        highTemp
      ]
    })


    console.log("POST: " + configservice)
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