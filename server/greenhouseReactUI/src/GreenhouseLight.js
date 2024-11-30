//import { useQuery } from '@tanstack/react-query';
import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Slider } from "primereact/slider";
import { InputText } from "primereact/inputtext";

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseLight = ({ jsonConfig }) => {

  const SLIDER_100_RANGE = 4.1666
  const lightState  = jsonConfig.doc.lightState;
  const heaterState = jsonConfig.doc.heaterState;
  const fanState = jsonConfig.doc.fanState;
  const pumpState = jsonConfig.doc.pumpState;
  const lowTemp = jsonConfig.doc.temperatureRange[0];
  const highTemp = jsonConfig.doc.temperatureRange[1];

  const [lightOnOff, setlightOnOff] = useState([jsonConfig.doc.lightOnOff[0] * SLIDER_100_RANGE, jsonConfig.doc.lightOnOff[1] * SLIDER_100_RANGE]);

  const handleOnSubmit = (event, jsonConfig) => {

    event.preventDefault();

    console.log("Got: " + JSON.stringify(jsonConfig))

    var lightOn = Math.trunc(lightOnOff[0] / SLIDER_100_RANGE)
    var lightOff = Math.trunc(lightOnOff[1] / SLIDER_100_RANGE)

    console.log("***********lightOn:", lightOn);
    console.log("***********lightOff:", lightOff);

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

      <div className="card flex flex-column md:flex-row gap-3">
        On:
        <InputText value={Math.trunc(lightOnOff[0] / SLIDER_100_RANGE)} onChange={(e) => setlightOnOff(e.target.value)} className="w-full" disabled/>
        &nbsp;&nbsp;Off:
        <InputText value={Math.trunc(lightOnOff[1] / SLIDER_100_RANGE)} onChange={(e) => setlightOnOff(e.target.value)} className="w-full" disabled/>
        <br></br> <br></br>
        <Slider
         value={lightOnOff} onChange={(e) => setlightOnOff(e.value)} className="w-14rem" range />
        <br></br> 
        <Button label=" Apply" inputid="applyTemp" name="applyTemp" value="Apply" onClick={(e) => handleOnSubmit(e, { jsonConfig })} />

      </div>


  );

};

export default GreenhouseLight;