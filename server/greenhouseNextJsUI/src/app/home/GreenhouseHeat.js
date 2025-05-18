'use client';

import React, { useState, useEffect } from "react";
import { Knob } from 'primereact/knob';
import { FaFireFlameSimple } from "react-icons/fa6";
import {
  Button,
  Grid,
  Column,
} from '@carbon/react';
const config = require('../config/config.js')
const endpoints = require('../endpoints.js')

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
function GreenhouseHeat() {

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
      "heaterState": heater,
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
                setHeater(configData.heaterState);
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

  // Set heater buttons and highlight the one that is enabled
  let heaterButton = {}
  if (heater === 'ON') {
    heaterButton = <div>
      <Button kind="danger" renderIcon={FaFireFlameSimple} inputid="heater1" name="heaterOn" value="ON" onClick={(e) => setHeater('ON')} > ON*</Button>
      <Button kind="tertiary" renderIcon={FaFireFlameSimple} inputid="heater2" name="heaterOff" value="OFF" onClick={(e) => setHeater('OFF')}> OFF</Button>
      <Button kind="tertiary" renderIcon={FaFireFlameSimple} inputid="heater3" name="heaterAuto" value="AUTO" onClick={(e) => setHeater('AUTO')} > AUTO</Button>
    </div>
  }
  else if (heater === 'OFF') {
    heaterButton = <div>
      <Button kind="tertiary" renderIcon={FaFireFlameSimple} inputid="heater1" name="heaterOn" value="ON" onClick={(e) => setHeater('ON')}> ON</Button>
      <Button kind="danger" renderIcon={FaFireFlameSimple} inputid="heater2" name="heaterOff" value="OFF" onClick={(e) => setHeater('OFF')} > OFF*</Button>
      <Button kind="tertiary" renderIcon={FaFireFlameSimple} inputid="heater3" name="heaterAuto" value="AUTO" onClick={(e) => setHeater('AUTO')} > AUTO</Button>
    </div>

  }
  else {
    heaterButton = <div>
      <Button kind="tertiary" renderIcon={FaFireFlameSimple} inputid="heater1" name="heaterOn" value="ON" onClick={(e) => setHeater('ON')}> ON</Button>
      <Button kind="tertiary" renderIcon={FaFireFlameSimple} inputid="heater2" name="heaterOff" value="OFF" onClick={(e) => setHeater('OFF')}> OFF</Button>
      <Button kind="danger" renderIcon={FaFireFlameSimple} inputid="heater3" name="heaterAuto" value="AUTO" onClick={(e) => setHeater('AUTO')}  > AUTO*</Button>
    </div>
  }

  return (

    <Column>

      <form onSubmit={(e) => handleOnSubmit(e)}>

        <h4>Heater</h4>
        {heaterButton}

        <br></br>
        <br></br>

        <h4>Min</h4>
        <Knob value={lowTemp} onChange={(e) => setLowTemp(e.value)} min={5} max={50} valueTemplate={'{value}C'} valueColor="blue" rangeColor="lightgray" />

        <Button kind="primary" onClick={(e) => handleOnSubmit(e)} iconDescription="Set">Set</Button>

      </form >

    </Column>

  );


}
export default GreenhouseHeat;
