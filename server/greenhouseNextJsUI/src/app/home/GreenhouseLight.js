'use client';

import React, { useState, useEffect } from "react";
import { Grid } from '@carbon/react';
import { Knob } from 'primereact/knob';
import { Button } from 'primereact/button';
import { BiWindow } from "react-icons/bi";
import { FaFireFlameSimple } from "react-icons/fa6";
import { CiLight } from "react-icons/ci";
import { PiFanFill } from "react-icons/pi";
import { IoRainyOutline } from "react-icons/io5";
const config = require('../config/config.js')
const endpoints = require('../endpoints.js')

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
function GreenhouseLight() {

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

    writeConfig(event)

  };

  const writeConfig = (event) => {

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

                setLowTemp(configData.temperatureRange[0])
                setHighTemp(configData.temperatureRange[1])

                setLight(configData.lightState);
                setLightOnTime(configData.lightOnOff[0])
                setLightOffTime(configData.lightOnOff[1])

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

  return (

    <form onSubmit={(e) => handleOnSubmit(e)}>

      <div>

        <h4>Light</h4>
        {lightButton}

        <br></br>        

        <h4>On</h4>
        <Knob value={lightOnTime} onChange={(e) => setLightOnTime(e.value)} min={0} max={24} valueTemplate={'{value}H'} valueColor="orange" rangeColor="lightgray" />

        <h4>Off</h4>
        <Knob value={lightOffTime} onChange={(e) => setLightOffTime(e.value)} min={0} max={24} valueTemplate={'{value}H'} valueColor="gray" rangeColor="lightgray" />

      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>
      <Button label=" Set" inputid="applyTemp" name="applyTemp" value="Apply" onClick={(e) => handleOnSubmit(e)} tooltip="Set on/off time" />
      </div>

    </form >

  );


}
export default GreenhouseLight;
