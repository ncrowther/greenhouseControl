//import { useQuery } from '@tanstack/react-query';
import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseTemperature = ({ jsonConfig }) => {

  const lightState = jsonConfig.doc.lightState;
  const heaterState = jsonConfig.doc.heaterState;
  const fanState = jsonConfig.doc.fanState;
  const pumpState = jsonConfig.doc.pumpState;

  const [minTemperature, setMinTemperature] = useState(jsonConfig.doc.temperatureRange[0]);
  const [maxTemperature, setMaxTemperature] = useState(jsonConfig.doc.temperatureRange[1]);

  const handleOnSubmit = (event, jsonConfig) => {

    event.preventDefault();

    console.log("Got: " + JSON.stringify(jsonConfig))

    var lowTemp = Math.trunc(minTemperature )
    var highTemp = Math.trunc(maxTemperature )

    jsonConfig = JSON.stringify({
      "lightState": lightState,
      "lightOnOff": [
        "08",
        "21"
      ],
      "pumpState": pumpState,
      "fanState": fanState,
      "heaterState": heaterState,
      "wateringTimes": [
        "09:00",
        "12:00",
        "17:00"
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
      window.location.reload(true);;
    }, 500);


  };

  return (

    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>

        <h3>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Min:&nbsp;</h3>
        <Knob value={minTemperature} onChange={(e) => setMinTemperature(e.value)} min={0} max={30}  />

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
        <Button label=" Apply" inputid="applyTemp" name="applyTemp" value="Apply" onClick={(e) => handleOnSubmit(e, { jsonConfig })} tooltip="Select min and max temperature" />
      </div>

    </div>

  );

};

export default GreenhouseTemperature;