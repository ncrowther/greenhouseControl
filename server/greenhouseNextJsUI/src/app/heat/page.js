'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { FaFireFlameSimple } from 'react-icons/fa6';
const config = require('../config/config.js');
import { Button, Grid, Column } from '@carbon/react';
import '@carbon/charts-react/styles.css';
const endpoints = require('../endpoints.js');

function Heat() {
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
                setHeater(configData.heaterState);
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

  // Set heater buttons and highlight the one that is enabled
  let heaterButton = {};
  if (heater === 'ON') {
    heaterButton = (
      <div>
        <Button
          kind="primary"
          renderIcon={FaFireFlameSimple}
          inputid="heater1"
          name="heaterOn"
          value="ON"
          onClick={(e) => setHeater('ON')}
        >
          {' '}
          ON*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater2"
          name="heaterOff"
          value="OFF"
          onClick={(e) => setHeater('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater3"
          name="heaterAuto"
          value="AUTO"
          onClick={(e) => setHeater('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else if (heater === 'OFF') {
    heaterButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater1"
          name="heaterOn"
          value="ON"
          onClick={(e) => setHeater('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="primary"
          renderIcon={FaFireFlameSimple}
          inputid="heater2"
          name="heaterOff"
          value="OFF"
          onClick={(e) => setHeater('OFF')}
        >
          {' '}
          OFF*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater3"
          name="heaterAuto"
          value="AUTO"
          onClick={(e) => setHeater('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else {
    heaterButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater1"
          name="heaterOn"
          value="ON"
          onClick={(e) => setHeater('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater2"
          name="heaterOff"
          value="OFF"
          onClick={(e) => setHeater('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="primary"
          renderIcon={FaFireFlameSimple}
          inputid="heater3"
          name="heaterAuto"
          value="AUTO"
          onClick={(e) => setHeater('AUTO')}
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
          <h4>Heat:</h4>
          {heaterButton}

          <br></br>
          <br></br>

          <h4>Min:</h4>
          <Knob
            value={lowTemp}
            onChange={(e) => setLowTemp(e.value)}
            min={5}
            max={50}
            valueTemplate={'{value}C'}
            valueColor="blue"
            rangeColor="lightgray"
          />

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

export default Heat;
