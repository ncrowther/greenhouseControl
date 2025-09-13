'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';

const config = require('../config/config.js');
import { BiWindow } from 'react-icons/bi';
import { PiFanFill } from 'react-icons/pi';
import { Button, Grid, Column } from '@carbon/react';
import '@carbon/charts-react/styles.css';
const endpoints = require('../endpoints.js');

function Cool() {
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

  // Set window buttons and highlight the one that is enabled
  let windowButton = {};
  if (window === 'OPEN') {
    windowButton = (
      <div>
        <Button
          kind="primary"
          renderIcon={BiWindow}
          inputid="windowOpen"
          name="windowOpen"
          value="OPEN"
          onClick={(e) => setWindow('OPEN')}
        >
          {' '}
          UP*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={BiWindow}
          inputid="windowClosed"
          name="windowClosed"
          value="CLOSED"
          onClick={(e) => setWindow('CLOSED')}
        >
          {' '}
          DWN
        </Button>
        <Button
          kind="tertiary"
          renderIcon={BiWindow}
          inputid="windowAuto"
          name="windowAuto"
          value="AUTO"
          onClick={(e) => setWindow('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else if (window === 'CLOSED') {
    windowButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={BiWindow}
          inputid="windowOpen"
          name="windowOpen"
          value="OPEN"
          onClick={(e) => setWindow('OPEN')}
        >
          {' '}
          UP
        </Button>
        <Button
          kind="primary"
          renderIcon={BiWindow}
          inputid="windowClosed"
          name="windowClosed"
          value="CLOSED"
          onClick={(e) => setWindow('CLOSED')}
        >
          {' '}
          DWN*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={BiWindow}
          inputid="windowAuto"
          name="windowAuto"
          value="AUTO"
          onClick={(e) => setWindow('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else {
    windowButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={BiWindow}
          inputid="windowOpen"
          name="windowOpen"
          value="OPEN"
          onClick={(e) => setWindow('OPEN')}
        >
          {' '}
          UP
        </Button>
        <Button
          kind="tertiary"
          renderIcon={BiWindow}
          inputid="windowClosed"
          name="windowClosed"
          value="CLOSED"
          onClick={(e) => setWindow('CLOSED')}
        >
          {' '}
          DWN
        </Button>
        <Button
          kind="tertiary"
          renderIcon={BiWindow}
          inputid="windowAuto"
          name="windowAuto"
          value="AUTO"
          onClick={(e) => setWindow('AUTO')}
        >
          {' '}
          AUTO*
        </Button>
      </div>
    );
  }

  // Set fan buttons and highlight the one that is enabled
  let fanButton = {};
  if (fan === 'ON') {
    fanButton = (
      <div className="p-inputgroup flex-1">
        <Button
          kind="primary"
          renderIcon={PiFanFill}
          inputid="fan1"
          name="fanOn"
          value="ON"
          onClick={(e) => setFan('ON')}
        >
          {' '}
          ON*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan2"
          name="fanOff"
          value="OFF"
          onClick={(e) => setFan('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan3"
          name="fanAuto"
          value="AUTO"
          onClick={(e) => setFan('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else if (fan === 'OFF') {
    fanButton = (
      <div className="p-inputgroup flex-1">
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan1"
          name="fanOn"
          value="ON"
          onClick={(e) => setFan('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="primary"
          renderIcon={PiFanFill}
          inputid="fan2"
          name="fanOff"
          value="OFF"
          onClick={(e) => setFan('OFF')}
        >
          {' '}
          OFF*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan3"
          name="fanAuto"
          value="AUTO"
          onClick={(e) => setFan('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else {
    fanButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan1"
          name="fanOn"
          value="ON"
          onClick={(e) => setFan('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan2"
          name="fanOff"
          value="OFF"
          onClick={(e) => setFan('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="primary"
          renderIcon={PiFanFill}
          inputid="fan3"
          name="fanAuto"
          value="AUTO"
          onClick={(e) => setFan('AUTO')}
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
          <h4>Window:</h4>
          {windowButton}

          <br></br>

          <h4>Fan:</h4>
          {fanButton}

          <br></br>
          <br></br>

          <h4>Max:</h4>
          <Knob
            value={highTemp}
            onChange={(e) => setHighTemp(e.value)}
            min={5}
            max={50}
            valueTemplate={'{value}C'}
            valueColor="red"
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
export default Cool;
