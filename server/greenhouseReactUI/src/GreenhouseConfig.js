import React, { useState } from "react";
import { RadioButton } from "primereact/radiobutton";
import { Button } from 'primereact/button';

/**
 * A chart to display humidity data.
 * @param {GreenhouseConfigProps} data - The data for the chart.
 * @returns {JSX.Element} The component.
 */
const GreenhouseConfig = () => {

  const load = () => {

    const jsonData = JSON.stringify({
      "lightState": "ON",
      "lightOnOff": [
        "08",
        "21"
      ],
      "pumpState": "OFF",
      "fanState": "OFF",
      "heaterState": "AUTO",
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

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    // Send data to the backend via POST
    fetch('http://localhost:3000/config?id=default', {

      method: 'POST',
      body: jsonData // body data type must match "Content-Type" header

    })
  }


  const [light, setLight] = useState('');

  return (
    <div className="card flex justify-content-center">
      <div className="flex flex-wrap gap-3">
        <div className="flex align-items-center">
          <RadioButton inputId="light1" name="lightOn" value="ON" onChange={(e) => setLight(e.value)} checked={light === 'ON'} />
          <label htmlFor="light1" className="ml-2">ON</label>
        </div>
        <div className="flex align-items-center">
          <RadioButton inputId="light2" name="lightOff" value="OFF" onChange={(e) => setLight(e.value)} checked={light === 'OFF'} />
          <label htmlFor="light2" className="ml-2">OFF</label>
        </div>
        <div className="flex align-items-center">
          <RadioButton inputId="light3" name="lightAuto" value="AUTO" onChange={(e) => setLight(e.value)} checked={light === 'AUTO'} />
          <label htmlFor="light3" className="ml-2">AUTO</label>
        </div>
      </div>
      <div className="card flex flex-wrap justify-content-center gap-3">
        <Button label="Submit" icon="pi pi-check" onClick={load} />
      </div>
    </div>
  );

};

export default GreenhouseConfig;