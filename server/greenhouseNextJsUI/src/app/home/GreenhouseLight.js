'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { CiLight } from 'react-icons/ci';
const config = require('../config/config.js');
const endpoints = require('../endpoints.js');
import { Button, Grid, Column } from '@carbon/react';

/**
 * Set the greenhouse config
 * @returns {JSX.Element} The component.
 */
function GreenhouseLight() {
  const [highTemp, setHighTemp] = useState('0');
  const [lowTemp, setLowTemp] = useState('0');
  const [light, setLight] = useState('OFF');
  const [lightOnTime, setLightOnTime] = useState('00:00');
  const [lightOffTime, setLightOffTime] = useState('00:00');
  const [heater, setHeater] = useState('OFF');
  const [fan, setFan] = useState('OFF');
  const [pump, setPump] = useState('OFF');
  const [pumpOnDuration, setPumpOnDuration] = useState(0);
  const [pumpOnTime1, setPumpOnTime1] = useState('00:00');
  const [pumpOnTime2, setPumpOnTime2] = useState('00:00');
  const [pumpOnTime3, setPumpOnTime3] = useState('00:00');
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

  // Set light buttons and highlight the one that is enabled
  let lightButton = {};
  if (light === 'ON') {
    lightButton = (
      <div>
        <Button
          kind="primary"
          renderIcon={CiLight}
          inputid="light1"
          name="lightOn"
          value="ON"
          onClick={(e) => setLight('ON')}
        >
          {' '}
          ON*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={CiLight}
          inputid="light2"
          name="lightOff"
          value="OFF"
          onClick={(e) => setLight('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="tertiary"
          renderIcon={CiLight}
          inputid="light3"
          name="lightAuto"
          value="AUTO"
          onClick={(e) => setLight('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else if (light === 'OFF') {
    lightButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={CiLight}
          inputid="light1"
          name="lightOn"
          value="ON"
          onClick={(e) => setLight('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="primary"
          renderIcon={CiLight}
          inputid="light2"
          name="lightOff"
          value="OFF"
          onClick={(e) => setLight('OFF')}
        >
          {' '}
          OFF*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={CiLight}
          inputid="light3"
          name="lightAuto"
          value="AUTO"
          onClick={(e) => setLight('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else {
    lightButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={CiLight}
          inputid="light1"
          name="lightOn"
          value="ON"
          onClick={(e) => setLight('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="tertiary"
          renderIcon={CiLight}
          inputid="light2"
          name="lightOff"
          value="OFF"
          onClick={(e) => setLight('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="primary"
          renderIcon={CiLight}
          inputid="light3"
          name="lightAuto"
          value="AUTO"
          onClick={(e) => setLight('AUTO')}
        >
          {' '}
          AUTO*
        </Button>
      </div>
    );
  }

  return (
    <Column>
      <form onSubmit={(e) => handleOnSubmit(e)}>
        <h4>Light</h4>

        {lightButton}

        <br></br>
        <br></br>

        <h4>On</h4>
        <Knob
          value={lightOnTime}
          onChange={(e) => setLightOnTime(e.value)}
          min={0}
          max={24}
          valueTemplate={'{value}H'}
          valueColor="orange"
          rangeColor="lightgray"
        />

        <h4>Off</h4>
        <Knob
          value={lightOffTime}
          onChange={(e) => setLightOffTime(e.value)}
          min={0}
          max={24}
          valueTemplate={'{value}H'}
          valueColor="gray"
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
  );
}
export default GreenhouseLight;
