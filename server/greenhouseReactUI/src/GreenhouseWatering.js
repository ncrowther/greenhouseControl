//import { useQuery } from '@tanstack/react-query';
import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Knob } from 'primereact/knob';

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseWatering = ({ configData }) => {

  const lightState = configData.doc.lightState;
  const heaterState = configData.doc.heaterState;
  const fanState = configData.doc.fanState;
  const pumpState = configData.doc.pumpState;
  const lowTemp = configData.doc.temperatureRange[0];
  const highTemp = configData.doc.temperatureRange[1];
  const lightOn = configData.doc.lightOnOff[0];
  const lightOff = configData.doc.lightOnOff[1];

  const [tapOnOne, setTapOnOne] = useState(configData.doc.wateringTimes[0].split(":")[0])
  const [tapOnTwo, setTapOnTwo] = useState(configData.doc.wateringTimes[1].split(":")[0])
  const [tapOnThree, setTapOnThree] = useState(configData.doc.wateringTimes[2].split(":")[0])

  const handleOnSubmit = (event, configData) => {

    event.preventDefault();

    console.log("Got: " + JSON.stringify(configData))

    var tapOnOneTime = tapOnOne + ":00"
    var tapOnTwoTime = tapOnTwo + ":00"
    var tapOnThreeTime = tapOnThree + ":00"

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
        tapOnOneTime,
        tapOnTwoTime,
        tapOnThreeTime
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

          <Button label=" Apply" inputid="applyWatering" name="applyWatering" value="Apply" onClick={(e) => handleOnSubmit(e, { configData })} tooltip="Select watering times" />
        </div>

    </div>

  );

};

export default GreenhouseWatering;