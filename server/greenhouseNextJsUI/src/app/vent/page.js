'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { BiVent } from 'react-icons/bi';
import { PiFanFill } from 'react-icons/pi';
import { Button, Grid, Column } from '@carbon/react';
import '@carbon/charts-react/styles.css';
const endpoints = require('../config/endpoints.js');
const config = require('../config/config.js');

function Vent() {
  const [highTemp, setHighTemp] = useState('0');
  const [fan, setFan] = useState('OFF');
  const [vent, setVent] = useState('DOWN');
  const [ventRun, setVentRun] = useState('0');
  const [ventPause, setVentPause] = useState(10);
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const handleOnSubmit = (event) => {
    // Prevent default refresh
    event.preventDefault();

    let configData = JSON.stringify({
      windowState: vent,
      fanState: fan,
      windowRun: ventRun,
      windowPause: ventPause - 10, // Adjust for UI offset
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
                setVent(configData.windowState);
                setVentRun(configData.windowRun);
                setVentPause(configData.windowPause + 10); // Adjust for UI offset
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

  // Set vent buttons and highlight the one that is enabled
  let ventButton = {};
  if (vent === 'OPEN') {
    ventButton = (
      <div>
        <Button
          kind="primary"
          renderIcon={BiVent}
          inputid="ventOpen"
          name="ventOpen"
          value="OPEN"
          onClick={(e) => setVent('OPEN')}
        >
          {' '}
          UP*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={BiVent}
          inputid="ventClosed"
          name="ventClosed"
          value="CLOSED"
          onClick={(e) => setVent('CLOSED')}
        >
          {' '}
          DWN
        </Button>
        <Button
          kind="tertiary"
          renderIcon={BiVent}
          inputid="ventAuto"
          name="ventAuto"
          value="AUTO"
          onClick={(e) => setVent('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else if (vent === 'CLOSED') {
    ventButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={BiVent}
          inputid="ventOpen"
          name="ventOpen"
          value="OPEN"
          onClick={(e) => setVent('OPEN')}
        >
          {' '}
          UP
        </Button>
        <Button
          kind="primary"
          renderIcon={BiVent}
          inputid="ventClosed"
          name="ventClosed"
          value="CLOSED"
          onClick={(e) => setVent('CLOSED')}
        >
          {' '}
          DWN*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={BiVent}
          inputid="ventAuto"
          name="ventAuto"
          value="AUTO"
          onClick={(e) => setVent('AUTO')}
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
          renderIcon={BiVent}
          inputid="ventOpen"
          name="ventOpen"
          value="OPEN"
          onClick={(e) => setVent('OPEN')}
        >
          {' '}
          UP
        </Button>
        <Button
          kind="tertiary"
          renderIcon={BiVent}
          inputid="ventClosed"
          name="ventClosed"
          value="CLOSED"
          onClick={(e) => setVent('CLOSED')}
        >
          {' '}
          DWN
        </Button>
        <Button
          kind="primary"
          renderIcon={BiVent}
          inputid="ventAuto"
          name="ventAuto"
          value="AUTO"
          onClick={(e) => setVent('AUTO')}
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

          <h4>Vent Run (1 - 30 Sec):</h4>
          <Knob
            value={ventRun}
            onChange={(e) => setVentRun(e.value)}
            min={1}
            max={30}
            valueTemplate={'{value}'}
            valueColor="blue"
            rangeColor="lightgray"
          />

          <h4>Vent Pause (10 - 30 Sec):</h4>
          <Knob
            value={ventPause}
            onChange={(e) => setVentPause(e.value)}
            min={10}
            max={30}
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
