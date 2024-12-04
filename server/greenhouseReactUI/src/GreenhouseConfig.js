//import { useQuery } from '@tanstack/react-query';
import React, { useState } from "react";
import { Button } from 'primereact/button';
import { FaFireFlameSimple } from "react-icons/fa6";
import { CiLight } from "react-icons/ci";
import { PiFanFill } from "react-icons/pi";
import { IoRainyOutline } from "react-icons/io5";

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
const GreenhouseConfig = ({ jsonConfig }) => {

  const [light, setLight] = useState(jsonConfig.doc.lightState);
  const [heater, setHeater] = useState(jsonConfig.doc.heaterState);
  const [fan, setFan] = useState(jsonConfig.doc.fanState);
  const [pump, setPump] = useState(jsonConfig.doc.pumpState);
  const lightOn = jsonConfig.doc.lightOnOff[0];
  const lightOff = jsonConfig.doc.lightOnOff[1];
  const tapOnOne = jsonConfig.doc.wateringTimes[0].split(":")[0]
  const tapOnTwo = jsonConfig.doc.wateringTimes[1].split(":")[0]
  const tapOnThree = jsonConfig.doc.wateringTimes[2].split(":")[0]

  const temperatureRange = jsonConfig.doc.temperatureRange;

  const handleOnSubmit = (event, jsonConfig) => {

    event.preventDefault();

    console.log("Got: " + JSON.stringify(jsonConfig))

    var lightState = { light }.light
    var heaterState = { heater }.heater
    var fanState = { fan }.fan
    var pumpState = { pump }.pump

    var lowTemp = temperatureRange[0]
    var highTemp =temperatureRange[1]

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
        tapOnOne,
        tapOnTwo,
        tapOnThree
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

  // Set light buttons and highlight the one that is enabled
  let lightButton = {}
  if (jsonConfig.doc.lightState === 'ON') {
    lightButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={CiLight} severity="danger" className="p-button-success" inputid="light1" name="lightOn" value="ON" onClick={(e) => setLight('ON')} outlined />
      <Button label=" OFF" icon={CiLight} className="p-button-danger" inputid="light2" name="lightOff" value="OFF" onClick={(e) => setLight('OFF')} />
      <Button label=" AUTO" icon={CiLight} className="p-button-warning" inputid="light3" name="lightAuto" value="AUTO" onClick={(e) => setLight('AUTO')} />
    </div>
  }
  else if (jsonConfig.doc.lightState === 'OFF') {
    lightButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={CiLight} className="p-button-success" inputid="light1" name="lightOn" value="ON" onClick={(e) => setLight('ON')} />
      <Button label=" OFF" icon={CiLight} className="p-button-danger" inputid="light2" name="lightOff" value="OFF" onClick={(e) => setLight('OFF')} outlined />
      <Button label=" AUTO" icon={CiLight} className="p-button-warning" inputid="light3" name="lightAuto" value="AUTO" onClick={(e) => setLight('AUTO')} />
    </div>
  }
  else {
    lightButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={CiLight} className="p-button-success" inputid="light1" name="lightOn" value="ON" onClick={(e) => setLight('ON')} />
      <Button label=" OFF" icon={CiLight} className="p-button-danger" inputid="light2" name="lightOff" value="OFF" onClick={(e) => setLight('OFF')} />
      <Button label=" AUTO" icon={CiLight} className="p-button-warning" inputid="light3" name="lightAuto" value="AUTO" onClick={(e) => setLight('AUTO')} outlined />
    </div>
  }

  // Set heater buttons and highlight the one that is enabled
  let heaterButton = {}
  if (jsonConfig.doc.heaterState === 'ON') {
    heaterButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={FaFireFlameSimple} className="p-button-success" inputid="heater1" name="heaterOn" value="ON" onClick={(e) => setHeater('ON')} outlined />
      <Button label=" OFF" icon={FaFireFlameSimple} className="p-button-danger" inputid="heater2" name="heaterOff" value="OFF" onClick={(e) => setHeater('OFF')} />
      <Button label=" AUTO" icon={FaFireFlameSimple} className="p-button-warning" inputid="heater3" name="heaterAuto" value="AUTO" onClick={(e) => setHeater('AUTO')} />
    </div>
  }
  else if (jsonConfig.doc.heaterState === 'OFF') {
    heaterButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={FaFireFlameSimple} className="p-button-success" inputid="heater1" name="heaterOn" value="ON" onClick={(e) => setHeater('ON')} />
      <Button label=" OFF" icon={FaFireFlameSimple} className="p-button-danger" inputid="heater2" name="heaterOff" value="OFF" onClick={(e) => setHeater('OFF')} outlined />
      <Button label=" AUTO" icon={FaFireFlameSimple} className="p-button-warning" inputid="heater3" name="heaterAuto" value="AUTO" onClick={(e) => setHeater('AUTO')} />
    </div>
  }
  else {
    heaterButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={FaFireFlameSimple} className="p-button-success" inputid="heater1" name="heaterOn" value="ON" onClick={(e) => setHeater('ON')} />
      <Button label=" OFF" icon={FaFireFlameSimple} className="p-button-danger" inputid="heater2" name="heaterOff" value="OFF" onClick={(e) => setHeater('OFF')} />
      <Button label=" AUTO" icon={FaFireFlameSimple} className="p-button-warning" inputid="heater3" name="heaterAuto" value="AUTO" onClick={(e) => setHeater('AUTO')} outlined />
    </div>
  }

  // Set fan buttons and highlight the one that is enabled
  let fanButton = {}
  if (jsonConfig.doc.fanState === 'ON') {
    fanButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={PiFanFill} className="p-button-success" inputid="fan1" name="fanOn" value="ON" onClick={(e) => setFan('ON')} outlined />
      <Button label=" OFF" icon={PiFanFill} className="p-button-danger" inputid="fan2" name="fanOff" value="OFF" onClick={(e) => setFan('OFF')} />
      <Button label=" AUTO" icon={PiFanFill} className="p-button-warning" inputid="fan3" name="fanAuto" value="AUTO" onClick={(e) => setFan('AUTO')} />
    </div>
  }
  else if (jsonConfig.doc.fanState === 'OFF') {
    fanButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={PiFanFill} className="p-button-success" inputid="fan1" name="fanOn" value="ON" onClick={(e) => setFan('ON')} />
      <Button label=" OFF" icon={PiFanFill} className="p-button-danger" inputid="fan2" name="fanOff" value="OFF" onClick={(e) => setFan('OFF')} outlined />
      <Button label=" AUTO" icon={PiFanFill} className="p-button-warning" inputid="fan3" name="fanAuto" value="AUTO" onClick={(e) => setFan('AUTO')} />
    </div>
  }
  else {
    fanButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={PiFanFill} className="p-button-success" inputid="fan1" name="fanOn" value="ON" onClick={(e) => setFan('ON')} />
      <Button label=" OFF" icon={PiFanFill} className="p-button-danger" inputid="fan2" name="fanOff" value="OFF" onClick={(e) => setFan('OFF')} />
      <Button label=" AUTO" icon={PiFanFill} className="p-button-warning" inputid="fan3" name="fanAuto" value="AUTO" onClick={(e) => setFan('AUTO')} outlined />
    </div>
  }

  // Set pump buttons and highlight the one that is enabled
  let pumpButton = {}
  if (jsonConfig.doc.pumpState === 'ON') {
    pumpButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={IoRainyOutline} className="p-button-success" inputid="pump1" name="pumpOn" value="ON" onClick={(e) => setPump('ON')} outlined />
      <Button label=" OFF" icon={IoRainyOutline} className="p-button-danger" inputid="pump2" name="pumpOff" value="OFF" onClick={(e) => setPump('OFF')} />
      <Button label=" AUTO" icon={IoRainyOutline} className="p-button-warning" inputid="pump3" name="pumpAuto" value="AUTO" onClick={(e) => setPump('AUTO')} />
    </div>
  }
  else if (jsonConfig.doc.pumpState === 'OFF') {
    pumpButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={IoRainyOutline} className="p-button-success" inputid="pump1" name="pumpOn" value="ON" onClick={(e) => setPump('ON')} />
      <Button label=" OFF" icon={IoRainyOutline} className="p-button-danger" inputid="pump2" name="pumpOff" value="OFF" onClick={(e) => setPump('OFF')} outlined/>
      <Button label=" AUTO" icon={IoRainyOutline} className="p-button-warning" inputid="pump3" name="pumpAuto" value="AUTO" onClick={(e) => setPump('AUTO')} />
    </div>
  }
  else {
    pumpButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={IoRainyOutline} className="p-button-success" inputid="pump1" name="pumpOn" value="ON" onClick={(e) => setPump('ON')} />
      <Button label=" OFF" icon={IoRainyOutline} className="p-button-danger" inputid="pump2" name="pumpOff" value="OFF" onClick={(e) => setPump('OFF')} />
      <Button label=" AUTO" icon={IoRainyOutline} className="p-button-warning" inputid="pump3" name="pumpAuto" value="AUTO" onClick={(e) => setPump('AUTO')} outlined />
    </div>
  }

  return (

    <form onSubmit={(e) => handleOnSubmit(e, { jsonConfig })}>

      <div className="card flex flex-column md:flex-row gap-3">

        {lightButton}

        <br></br>

        {heaterButton}

        <br></br>

        {fanButton}

        <br></br>

        {pumpButton}

      </div>

    </form>

  );

};

export default GreenhouseConfig;