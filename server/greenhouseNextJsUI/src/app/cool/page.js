'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { BiWindow } from 'react-icons/bi';
import { PiFanFill } from 'react-icons/pi';
import { Button, Grid, Column } from '@carbon/react';
import '@carbon/charts-react/styles.css';
const endpoints = require('../config/endpoints.js');
const config = require('../config/config.js');

function Cool() {
  const [highTemp, setHighTemp] = useState('0');
  const [fan, setFan] = useState('OFF');
  const [window, setWindow] = useState('DOWN');
  const [windowRun, setWindowRun] = useState('0');
  const [windowPause, setWindowPause] = useState('0');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const handleOnSubmit = (event) => {
    // Prevent default refresh
    event.preventDefault();

    let configData = JSON.stringify({
      windowState: window,
      fanState: fan,
      windowRun: windowRun,
      windowPause: windowPause,
      maxTemp: highTemp,
    });

    console.log('Got: ' + JSON.stringify(configData));

    config.cool(configData);
  };

  useEffect(() => {
    async function getConfigData() {
      await fetch(
        endpoints.configServiceEndpoint + '?id=' + config.getEnv().name,
        {
          method: 'get',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
        .then((response) => {
          if (response.status == 200) {
            response.json().then((data) => {
              const configData = data.doc;

              console.log('*******' + JSON.stringify(configData));

              if (configData) {
                setHighTemp(configData.temperatureRange[1]);
                setFan(configData.fanState);
                setWindow(configData.windowState);
                setWindowRun(configData.windowRun);
                setWindowPause(configData.windowPause);
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
          kind="primary"
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
          <h4>Vent:</h4>
          {windowButton}

          <br></br>

          <h4>Fan:</h4>
          {fanButton}

          <br></br>
          <br></br>

          <h4>Temperature:</h4>
          <Knob
            value={highTemp}
            onChange={(e) => setHighTemp(e.value)}
            min={5}
            max={40}
            valueTemplate={'{value}C'}
            valueColor="red"
            rangeColor="lightgray"
          />

          <h4>Vent Run (0 - 60 Sec):</h4>
          <Knob
            value={windowRun}
            onChange={(e) => setWindowRun(e.value)}
            min={0}
            max={60}
            valueTemplate={'{value}'}
            valueColor="blue"
            rangeColor="lightgray"
          />

          <h4>Vent Pause (0 - 120 Sec):</h4>
          <Knob
            value={windowPause}
            onChange={(e) => setWindowPause(e.value)}
            min={0}
            max={120}
            valueTemplate={'{value}'}
            valueColor="purple"
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
