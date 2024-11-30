//import { useQuery } from '@tanstack/react-query';
import React, { useState } from "react";
import { Button } from 'primereact/button';
import { Slider } from "primereact/slider";
import { InputText } from "primereact/inputtext";

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseTemperature = ({ jsonConfig }) => {

  const lightState  = jsonConfig.doc.lightState;
  const heaterState = jsonConfig.doc.heaterState;
  const fanState = jsonConfig.doc.fanState;
  const pumpState = jsonConfig.doc.pumpState;

  const [temperature, setTemperature] = useState([jsonConfig.doc.temperatureRange[0] * 3, jsonConfig.doc.temperatureRange[1] * 3]);

  const handleOnSubmit = (event, jsonConfig) => {

    event.preventDefault();

    console.log("Got: " + JSON.stringify(jsonConfig))

    var lowTemp = Math.trunc(temperature[0] / 3)
    var highTemp = Math.trunc(temperature[1] / 3)

    console.log("***********Hi:", highTemp);
    console.log("***********Lo:", lowTemp);

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

      <div className="card flex flex-column md:flex-row gap-3">
        Min:
        <InputText value={Math.trunc(temperature[0] / 3)} onChange={(e) => setTemperature(e.target.value)} className="w-full" disabled/>
        &nbsp;&nbsp;Max:
        <InputText value={Math.trunc(temperature[1] / 3)} onChange={(e) => setTemperature(e.target.value)} className="w-full" disabled/>
        <br></br> <br></br>
        <Slider
         value={temperature} onChange={(e) => setTemperature(e.value)} className="w-14rem" range />
        <br></br> 
        <Button label=" Apply" inputid="applyTemp" name="applyTemp" value="Apply" onClick={(e) => handleOnSubmit(e, { jsonConfig })} />

      </div>


  );

};

export default GreenhouseTemperature;