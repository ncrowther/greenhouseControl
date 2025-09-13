'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
const config = require('../config/config.js');
import { IoRainyOutline } from 'react-icons/io5';
import { Button, Grid, Column, Slider } from '@carbon/react';
import '@carbon/charts-react/styles.css';
const endpoints = require('../endpoints.js');

function Water() {
  const [highTemp, setHighTemp] = useState('0');
  const [lowTemp, setLowTemp] = useState('0');
  const [light, setLight] = useState('OFF');
  const [lightOnTime, setLightOnTime] = useState(0);
  const [lightOffTime, setLightOffTime] = useState(0);
  const [heater, setHeater] = useState('OFF');
  const [fan, setFan] = useState('OFF');
  const [pump, setPump] = useState('OFF');
  const [pumpOnDuration, setPumpOnDuration] = useState(0);
  const [pumpOnTime1, setPumpOnTime1] = useState(0);
  const [pumpOnTime2, setPumpOnTime2] = useState(0);
  const [pumpOnTime3, setPumpOnTime3] = useState(0);
  const [window, setWindow] = useState('DOWN');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const handleOnSubmit = (event) => {
    // Prevent default refresh
    event.preventDefault();

    writeConfig(event);
  };

  const writeConfig = (event) => {
    let configData = JSON.stringify({
      lightState: light,
      lightOnOff: [lightOnTime, lightOffTime],
      pumpState: pump,
      fanState: fan,
      heaterState: heater,
      wateringDuration: pumpOnDuration,
      wateringTimes: [pumpOnTime1, pumpOnTime2, pumpOnTime3],
      windowState: window,
      temperatureRange: [lowTemp, highTemp],
    });

    console.log('Got: ' + JSON.stringify(configData));

    config.writeConfig(configData);
  };

  useEffect(() => {
    async function getConfigData() {
      await fetch(endpoints.configServiceEndpoint, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((data) => {
              const configData = data.doc;

              console.log('*******' + JSON.stringify(configData));

              if (configData) {
                setLowTemp(configData.temperatureRange[0]);
                setHighTemp(configData.temperatureRange[1]);

                setLight(configData.lightState);
                setLightOnTime(configData.lightOnOff[0]);
                setLightOffTime(configData.lightOnOff[1]);

                setPumpOnDuration(configData.wateringDuration);
                setPumpOnTime1(configData.wateringTimes[0]);
                setPumpOnTime2(configData.wateringTimes[1]);
                setPumpOnTime3(configData.wateringTimes[2]);

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
          return <Grid className="config-page">Loading</Grid>;
        });

      setLoading(false);
    }

    getConfigData();
  }, []);

  if (loading) {
    return <Grid className="config-page">Loading</Grid>;
  }

  if (error) {
    return `Error! ${error}`;
  }

  // Set pump buttons and highlight the one that is enabled
  let pumpButton = {};
  if (pump === 'ON') {
    pumpButton = (
      <div>
        <Button
          kind="primary"
          renderIcon={IoRainyOutline}
          inputid="pump1"
          name="pumpOn"
          value="ON"
          onClick={(e) => setPump('ON')}
        >
          {' '}
          ON*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump2"
          name="pumpOff"
          value="OFF"
          onClick={(e) => setPump('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump3"
          name="pumpAuto"
          value="AUTO"
          onClick={(e) => setPump('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else if (pump === 'OFF') {
    pumpButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump1"
          name="pumpOn"
          value="ON"
          onClick={(e) => setPump('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="primary"
          renderIcon={IoRainyOutline}
          inputid="pump2"
          name="pumpOff"
          value="OFF"
          onClick={(e) => setPump('OFF')}
        >
          {' '}
          OFF*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump3"
          name="pumpAuto"
          value="AUTO"
          onClick={(e) => setPump('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else {
    pumpButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump1"
          name="pumpOn"
          value="ON"
          onClick={(e) => setPump('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump2"
          name="pumpOff"
          value="OFF"
          onClick={(e) => setPump('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="primary"
          renderIcon={IoRainyOutline}
          inputid="pump3"
          name="pumpAuto"
          value="AUTO"
          onClick={(e) => setPump('AUTO')}
        >
          {' '}
          AUTO*
        </Button>
      </div>
    );
  }

  return (
    <Grid>
      <Column lg={1} md={1} sm={1}>
        {/* Empty first column */}
      </Column>

      <Column lg={5} md={5} sm={5}>
        <form onSubmit={(e) => handleOnSubmit(e)}>
          <br></br>
          <h4>Pump:</h4>
          {pumpButton}

          <br></br>
          <br></br>
          <div>
            <h4>T1:</h4>
            <Knob
              value={pumpOnTime1}
              onChange={(e) => setPumpOnTime1(e.value)}
              min={0}
              max={23}
              valueTemplate={'{value}H'}
              valueColor="green"
              rangeColor="lightgray"
            />

            <h4>T2:</h4>
            <Knob
              value={pumpOnTime2}
              onChange={(e) => setPumpOnTime2(e.value)}
              min={0}
              max={23}
              valueTemplate={'{value}H'}
              valueColor="green"
              rangeColor="lightgray"
            />

            <h4>T3:</h4>
            <Knob
              value={pumpOnTime3}
              onChange={(e) => setPumpOnTime3(e.value)}
              min={0}
              max={23}
              valueTemplate={'{value}H'}
              valueColor="green"
              rangeColor="lightgray"
            />
          </div>
          <br></br>
          <br></br>
          <h4>Duration (Minutes):</h4>
          <Slider
            ariaLabelInput="Lower bound"
            invalidText="Invalid value"
            labelText=""
            max={59}
            min={0}
            step={1}
            unstable_ariaLabelInputUpper="Upper bound"
            value={pumpOnDuration}
            warnText="Warning message goes here"
            onChange={(e) => setPumpOnDuration(e.value)}
          />

          <br></br>
          <br></br>

          <Button
            kind="primary"
            onClick={(e) => handleOnSubmit(e)}
            iconDescription="Set"
          >
            Set
          </Button>
        </form>
      </Column>
    </Grid>
  );
}
export default Water;
