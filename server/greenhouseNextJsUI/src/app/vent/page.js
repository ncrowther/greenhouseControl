'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { BiWindow } from 'react-icons/bi';
import { PiFanFill } from 'react-icons/pi';
import { Button, Grid, Column } from '@carbon/react';
import '@carbon/charts-react/styles.css';
const endpoints = require('../config/endpoints.js');
const config = require('../config/config.js');

function Vent() {
  const [highTemp, setHighTemp] = useState('0');
  const [fan, setFan] = useState('OFF');
  const [window, setWindow] = useState('DOWN');
  const [windowRun, setWindowRun] = useState('0');
  const [windowPause, setWindowPause] = useState('0');
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());
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

    config.vent(configData);
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
  let ventButton = {};
  if (window === 'OPEN') {
    ventButton = (
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
    ventButton = (
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
    ventButton = (
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

  const env = `${selectedEnv.name}`;

  return (
    <Grid>
      <Column lg={1} md={1} sm={1}>
        {/* Empty first column */}
      </Column>
      <Column lg={10} md={10} sm={10}>
        <br></br>
        <form onSubmit={(e) => handleOnSubmit(e)}>
          <h3>{env}</h3>
          <br></br>
          <br></br>

          <h4>Vent:</h4>
          {ventButton}
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
export default Vent;
