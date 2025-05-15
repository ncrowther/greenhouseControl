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
function GreenhouseCool() {

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

  return (

    <form onSubmit={(e) => handleOnSubmit(e)}>

      <div>

        <h4>Window</h4>
        {windowButton}

        <br></br>

        <h4>Fan</h4>
        {fanButton}

        <br></br>

        <h4>Max</h4>
        <Knob value={highTemp} onChange={(e) => setHighTemp(e.value) } min={5} max={50} valueTemplate={'{value}C'} valueColor="red" rangeColor="lightgray"/>

      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>

      <Button label=" Set" inputid="applyTemp" name="applyTemp" value="Apply" onClick={(e) => handleOnSubmit(e)} />        


      </div>

    </form >

  );


}
export default GreenhouseCool;
