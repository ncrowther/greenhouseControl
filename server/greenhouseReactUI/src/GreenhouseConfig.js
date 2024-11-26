import React, { useState } from "react";
import { InputText } from 'primereact/inputtext';
import { RadioButton } from "primereact/radiobutton";
import { Button } from 'primereact/button';

/**
 * A chart to display humidity data.
 * @param {GreenhouseConfigProps} data - The data for the chart.
 * @returns {JSX.Element} The component.
 */
const GreenhouseConfig = () => {

  const handleOnSubmit = (event) => {

    event.preventDefault();

    console.log("You have submitted:", { light }.light);

    var lightState = { light }.light
    var heaterState = { heater }.heater
    var fanState = { fan }.fan
    var pumpState = { pump }.pump

    const jsonData = JSON.stringify({
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
        "27",
        "20"
      ]
    })

    console.log("SEND: " + jsonData)

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    // Send data to the backend via POST
    // fetch('https://dataservice.1apbmbk49s5e.eu-gb.codeengine.appdomain.cloud/config?id=default', {
    fetch('http://localhost:3000/config?id=default', {
      method: 'POST',
      headers: myHeaders,
      body: jsonData // body data type must match "Content-Type" header

    })

  };

  const [light, setLight] = useState('AUTO');
  const [heater, setHeater] = useState('AUTO');
  const [fan, setFan] = useState('OFF');
  const [pump, setPump] = useState('OFF');

  return (

    <form onSubmit={(e) => handleOnSubmit(e)}>

      <div className="card flex flex-column md:flex-row gap-3">


        <div className="p-inputgroup flex-1">
          <Button label="LIGHT ON" icon="pi pi-check" className="p-button-success" inputId="light1" name="lightOn" value="ON" onClick={(e) => setLight('ON')} />
          <Button label="LIGHT OFF" icon="pi pi-times" className="p-button-danger" inputId="light2" name="lightOff" value="OFF" onClick={(e) => setLight('OFF')} />
          <Button label="LIGHT AUTO" icon="pi pi-times" className="p-button-warning" inputId="light3" name="lightAuto" value="AUTO" onClick={(e) => setLight('AUTO')} />
        </div>
        <br></br>
        <div className="p-inputgroup flex-1">
          <Button label="HEATER ON" icon="pi pi-check" className="p-button-success" inputId="heater1" name="heaterOn" value="ON" onClick={(e) => setHeater('ON')} />
          <Button label="HEATER OFF" icon="pi pi-times" className="p-button-danger" inputId="heater2" name="heaterOff" value="OFF" onClick={(e) => setHeater('OFF')} />
          <Button label="HEATER AUTO" icon="pi pi-times" className="p-button-warning" inputId="heater3" name="heaterAuto" value="AUTO" onClick={(e) => setHeater('AUTO')} />
        </div>
        <br></br>
        <div className="p-inputgroup flex-1">
          <Button label="FAN ON" icon="pi pi-check" className="p-button-success" inputId="fan1" name="fanOn" value="ON" onClick={(e) => setFan('ON')} />
          <Button label="FAN OFF" icon="pi pi-times" className="p-button-danger" inputId="fan2" name="fanOff" value="OFF" onClick={(e) => setFan('OFF')} />
          <Button label="FAN AUTO" icon="pi pi-times" className="p-button-warning" inputId="fan3" name="fanAuto" value="AUTO" onClick={(e) => setFan('AUTO')} />
        </div>        
        <br></br>
        <div className="p-inputgroup flex-1">
          <Button label="PUMP ON" icon="pi pi-check" className="p-button-success" inputId="pump1" name="pumpOn" value="ON" onClick={(e) => setPump('ON')} />
          <Button label="PUMP OFF" icon="pi pi-times" className="p-button-danger" inputId="pump2" name="pumpOff" value="OFF" onClick={(e) => setPump('OFF')} />
          <Button label="PUMP AUTO" icon="pi pi-times" className="p-button-warning" inputId="pump3" name="pumpAuto" value="AUTO" onClick={(e) => setPump('AUTO')} />
        </div>         
      </div>



    </form>

  );

};

export default GreenhouseConfig;