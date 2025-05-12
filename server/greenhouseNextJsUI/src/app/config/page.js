'use client';

import React, { useState, useEffect } from "react";
import { Grid} from '@carbon/react';
import { Button } from 'primereact/button';
import { BiWindow } from "react-icons/bi";
import { FaFireFlameSimple } from "react-icons/fa6";
import { CiLight } from "react-icons/ci";
import { PiFanFill } from "react-icons/pi";
import { IoRainyOutline } from "react-icons/io5";
const config = require('./config.js')
const endpoints = require('../endpoints.js')

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
function ConfigPage() {

  const [highTemp, setHighTemp] = useState("0");
  const [lowTemp, setLowTemp] = useState("0");
  const [light, setLight] = useState("OFF");
  const [lightOnTime, setLightOnTime] = useState("00:00");
  const [lightOffTime, setLightOffTime] = useState("00:00");
  const [heater, setHeater] = useState("OFF");
  const [fan, setFan] = useState("OFF");
  const [pump, setPump] = useState("OFF");
  const [pumpOnTime1, setPumpOnTime1] = useState("00:00");
  const [pumpOnTime2, setPumpOnTime2] = useState("00:00");
  const [pumpOnTime3, setPumpOnTime3] = useState("00:00");
  const [window, setWindow] = useState("DOWN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();


  const handleOnSubmit = (event) => {

    // Prevent default refresh
    event.preventDefault();

    let configData = JSON.stringify({
      "lightState": light,
      "lightOnOff": [
        lightOnTime,
        lightOffTime
      ],
      "pumpState": pump,
      "fanState": fan,
      "heaterState": heater,
      "wateringTimes": [
        pumpOnTime1,
        pumpOnTime2,
        pumpOnTime3
      ],
      "windowState": window,
      "temperatureRange": [
        lowTemp,
        highTemp
      ]
    })

    console.log("Got: " + JSON.stringify(configData))


    config.writeConfig(configData)

  };

  useEffect(() => {
    async function getConfigData() {

      await fetch(endpoints.configServiceEndpoint, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((data) => {

              const configData = data.doc

              console.log("*******" + JSON.stringify(configData))

              if (configData) {

                setLowTemp( configData.temperatureRange[0])
                setHighTemp( configData.temperatureRange[1])

                setLight(configData.lightState);
                setLightOnTime( configData.lightOnOff[0])
                setLightOffTime( configData.lightOnOff[1])

                setPumpOnTime1(configData.wateringTimes[0])
                setPumpOnTime2(configData.wateringTimes[1])
                setPumpOnTime3(configData.wateringTimes[2])

                setHeater(configData.heaterState);
                setFan(configData.fanState);
                setPump(configData.pumpState);
                setWindow(configData.windowState);

              }

            }, []);

          }
        })
        .catch((err) => {
          console.log(err);
          return (
            <Grid className="config-page">
              Loading
            </Grid>
          );
        });


      setLoading(false);
    }

    getConfigData();
  }, []);

  if (loading) {
    return (
      <Grid className="config-page">
        Loading
      </Grid>
    );
  }

  if (error) {
    return `Error! ${error}`;
  }


  // Set light buttons and highlight the one that is enabled
  let lightButton = {}
  if (light === 'ON') {
    lightButton = <div className="p-inputgroup flex-1">
      <Button label=" ON*" icon={CiLight} severity="danger" className="p-button-success" inputid="light1" name="lightOn" value="ON" onClick={(e) => setLight('ON')} outlined />
      <Button label=" OFF" icon={CiLight} className="p-button-danger" inputid="light2" name="lightOff" value="OFF" onClick={(e) => setLight('OFF')} />
      <Button label=" AUTO" icon={CiLight} className="p-button-warning" inputid="light3" name="lightAuto" value="AUTO" onClick={(e) => setLight('AUTO')} />
    </div>
  }
  else if (light === 'OFF') {
    lightButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={CiLight} className="p-button-success" inputid="light1" name="lightOn" value="ON" onClick={(e) => setLight('ON')} />
      <Button label=" OFF*" icon={CiLight} className="p-button-danger" inputid="light2" name="lightOff" value="OFF" onClick={(e) => setLight('OFF')} outlined />
      <Button label=" AUTO" icon={CiLight} className="p-button-warning" inputid="light3" name="lightAuto" value="AUTO" onClick={(e) => setLight('AUTO')} />
    </div>
  }
  else {
    lightButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={CiLight} className="p-button-success" inputid="light1" name="lightOn" value="ON" onClick={(e) => setLight('ON')} />
      <Button label=" OFF" icon={CiLight} className="p-button-danger" inputid="light2" name="lightOff" value="OFF" onClick={(e) => setLight('OFF')} />
      <Button label=" AUTO*" icon={CiLight} className="p-button-warning" inputid="light3" name="lightAuto" value="AUTO" onClick={(e) => setLight('AUTO')} outlined />
    </div>
  }

  // Set heater buttons and highlight the one that is enabled
  let heaterButton = {}
  if (heater === 'ON') {
    heaterButton = <div className="p-inputgroup flex-1">
      <Button label=" ON*" icon={FaFireFlameSimple} className="p-button-success" inputid="heater1" name="heaterOn" value="ON" onClick={(e) => setHeater('ON')} outlined />
      <Button label=" OFF" icon={FaFireFlameSimple} className="p-button-danger" inputid="heater2" name="heaterOff" value="OFF" onClick={(e) => setHeater('OFF')} />
      <Button label=" AUTO" icon={FaFireFlameSimple} className="p-button-warning" inputid="heater3" name="heaterAuto" value="AUTO" onClick={(e) => setHeater('AUTO')} />
    </div>
  }
  else if (heater === 'OFF') {
    heaterButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={FaFireFlameSimple} className="p-button-success" inputid="heater1" name="heaterOn" value="ON" onClick={(e) => setHeater('ON')} />
      <Button label=" OFF*" icon={FaFireFlameSimple} className="p-button-danger" inputid="heater2" name="heaterOff" value="OFF" onClick={(e) => setHeater('OFF')} outlined />
      <Button label=" AUTO" icon={FaFireFlameSimple} className="p-button-warning" inputid="heater3" name="heaterAuto" value="AUTO" onClick={(e) => setHeater('AUTO')} />
    </div>
  }
  else {
    heaterButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={FaFireFlameSimple} className="p-button-success" inputid="heater1" name="heaterOn" value="ON" onClick={(e) => setHeater('ON')} />
      <Button label=" OFF" icon={FaFireFlameSimple} className="p-button-danger" inputid="heater2" name="heaterOff" value="OFF" onClick={(e) => setHeater('OFF')} />
      <Button label=" AUTO*" icon={FaFireFlameSimple} className="p-button-warning" inputid="heater3" name="heaterAuto" value="AUTO" onClick={(e) => setHeater('AUTO')} outlined />
    </div>
  }

  // Set window buttons and highlight the one that is enabled
  let windowButton = {}
  if (window === 'OPEN') {
    windowButton = <div className="p-inputgroup flex-1">
      <Button label=" UP*" icon={BiWindow} className="p-button-success" inputid="window1" name="windowOpen" value="OPEN" onClick={(e) => setWindow('OPEN')} outlined />
      <Button label=" DWN" icon={BiWindow} className="p-button-danger" inputid="window2" name="windowClosed" value="CLOSED" onClick={(e) => setWindow('CLOSED')} />
      <Button label=" AUTO" icon={BiWindow} className="p-button-warning" inputid="window3" name="windowAuto" value="AUTO" onClick={(e) => setWindow('AUTO')} />
    </div>
  }
  else if (window === 'CLOSED') {
    windowButton = <div className="p-inputgroup flex-1">
      <Button label=" UP" icon={BiWindow} className="p-button-success" inputid="window1" name="windowOpen" value="OPEN" onClick={(e) => setWindow('OPEN')} />
      <Button label=" DWN*" icon={BiWindow} className="p-button-danger" inputid="window2" name="windowClosed" value="CLOSED" onClick={(e) => setWindow('CLOSED')} outlined />
      <Button label=" AUTO" icon={BiWindow} className="p-button-warning" inputid="window3" name="windowAuto" value="AUTO" onClick={(e) => setWindow('AUTO')} />
    </div>
  }
  else {
    windowButton = <div className="p-inputgroup flex-1">
      <Button label=" UP" icon={BiWindow} className="p-button-success" inputid="window1" name="windowOpen" value="OPEN" onClick={(e) => setWindow('OPEN')} />
      <Button label=" DWN" icon={BiWindow} className="p-button-danger" inputid="window2" name="windowClosed" value="CLOSED" onClick={(e) => setWindow('CLOSED')} />
      <Button label=" AUTO*" icon={BiWindow} className="p-button-warning" inputid="window3" name="windowAuto" value="AUTO" onClick={(e) => setWindow('AUTO')} outlined />
    </div>
  }  

  // Set fan buttons and highlight the one that is enabled
  let fanButton = {}
  if (fan === 'ON') {
    fanButton = <div className="p-inputgroup flex-1">
      <Button label=" ON*" icon={PiFanFill} className="p-button-success" inputid="fan1" name="fanOn" value="ON" onClick={(e) => setFan('ON')} outlined />
      <Button label=" OFF" icon={PiFanFill} className="p-button-danger" inputid="fan2" name="fanOff" value="OFF" onClick={(e) => setFan('OFF')} />
      <Button label=" AUTO" icon={PiFanFill} className="p-button-warning" inputid="fan3" name="fanAuto" value="AUTO" onClick={(e) => setFan('AUTO')} />
    </div>
  }
  else if (fan === 'OFF') {
    fanButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={PiFanFill} className="p-button-success" inputid="fan1" name="fanOn" value="ON" onClick={(e) => setFan('ON')} />
      <Button label=" OFF*" icon={PiFanFill} className="p-button-danger" inputid="fan2" name="fanOff" value="OFF" onClick={(e) => setFan('OFF')} outlined />
      <Button label=" AUTO" icon={PiFanFill} className="p-button-warning" inputid="fan3" name="fanAuto" value="AUTO" onClick={(e) => setFan('AUTO')} />
    </div>
  }
  else {
    fanButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={PiFanFill} className="p-button-success" inputid="fan1" name="fanOn" value="ON" onClick={(e) => setFan('ON')} />
      <Button label=" OFF" icon={PiFanFill} className="p-button-danger" inputid="fan2" name="fanOff" value="OFF" onClick={(e) => setFan('OFF')} />
      <Button label=" AUTO*" icon={PiFanFill} className="p-button-warning" inputid="fan3" name="fanAuto" value="AUTO" onClick={(e) => setFan('AUTO')} outlined />
    </div>
  }

  // Set pump buttons and highlight the one that is enabled
  let pumpButton = {}
  if (pump === 'ON') {
    pumpButton = <div className="p-inputgroup flex-1">
      <Button label=" ON*" icon={IoRainyOutline} className="p-button-success" inputid="pump1" name="pumpOn" value="ON" onClick={(e) => setPump('ON')} outlined />
      <Button label=" OFF" icon={IoRainyOutline} className="p-button-danger" inputid="pump2" name="pumpOff" value="OFF" onClick={(e) => setPump('OFF')} />
      <Button label=" AUTO" icon={IoRainyOutline} className="p-button-warning" inputid="pump3" name="pumpAuto" value="AUTO" onClick={(e) => setPump('AUTO')} />
    </div>
  }
  else if (pump === 'OFF') {
    pumpButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={IoRainyOutline} className="p-button-success" inputid="pump1" name="pumpOn" value="ON" onClick={(e) => setPump('ON')} />
      <Button label=" OFF*" icon={IoRainyOutline} className="p-button-danger" inputid="pump2" name="pumpOff" value="OFF" onClick={(e) => setPump('OFF')} outlined/>
      <Button label=" AUTO" icon={IoRainyOutline} className="p-button-warning" inputid="pump3" name="pumpAuto" value="AUTO" onClick={(e) => setPump('AUTO')} />
    </div>
  }
  else {
    pumpButton = <div className="p-inputgroup flex-1">
      <Button label=" ON" icon={IoRainyOutline} className="p-button-success" inputid="pump1" name="pumpOn" value="ON" onClick={(e) => setPump('ON')} />
      <Button label=" OFF" icon={IoRainyOutline} className="p-button-danger" inputid="pump2" name="pumpOff" value="OFF" onClick={(e) => setPump('OFF')} />
      <Button label=" AUTO*" icon={IoRainyOutline} className="p-button-warning" inputid="pump3" name="pumpAuto" value="AUTO" onClick={(e) => setPump('AUTO')} outlined />
    </div>
  }

  return (

    <form onSubmit={(e) => handleOnSubmit(e)}>

      <div className="card flex flex-column md:flex-row gap-3">

        {lightButton}

        <br></br>

        {heaterButton}

        <br></br>

        {windowButton}

        <br></br>        

        {fanButton}

        <br></br>

        {pumpButton}

      </div>

    </form>

  );


}
export default ConfigPage;
