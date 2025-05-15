'use client';

import React, { useState, useEffect } from "react";
import { Grid } from '@carbon/react';
import { Knob } from 'primereact/knob';
import { Button } from 'primereact/button';
import { IoRainyOutline } from "react-icons/io5";
const config = require('../config/config.js')
const endpoints = require('../endpoints.js')

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
function GreenhouseIrrigation() {

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
      <Button label=" OFF*" icon={IoRainyOutline} className="p-button-danger" inputid="pump2" name="pumpOff" value="OFF" onClick={(e) => setPump('OFF')} outlined />
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

      <div>

        <h4>Pump</h4>
        {pumpButton}

        <br></br>        

        <h3>Time 1</h3>
        <Knob value={pumpOnTime1} onChange={(e) => setPumpOnTime1(e.value)} min={0} max={23} valueTemplate={'{value}H'} valueColor="green" rangeColor="lightgray" />

        <h3>Time 2</h3>
        <Knob value={pumpOnTime2} onChange={(e) => setPumpOnTime2(e.value)} min={0} max={23} valueTemplate={'{value}H'} valueColor="green" rangeColor="lightgray" />

        <h3>Time 2</h3>
        <Knob value={pumpOnTime3} onChange={(e) => setPumpOnTime3(e.value)} min={0} max={23} valueTemplate={'{value}H'} valueColor="green" rangeColor="lightgray" />

      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center'
      }}>
      <Button label=" Set" inputid="applyTemp" name="applyTemp" value="Apply" onClick={(e) => handleOnSubmit(e)} tooltip="Set on/off times" />
      </div>

    </form >

  );


}
export default GreenhouseIrrigation;
