'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { BiVent } from 'react-icons/bi';
import { Button, Grid, Column } from '@carbon/react';
import { Dropdown } from 'primereact/dropdown';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const setEnv = async (event) => {
    console.log('Event: ' + JSON.stringify(event));
    config.setEnv(event);
    setLoading(true);
    await getConfigData();
    setLoading(false);
  };

  const handleOnSubmit = (event) => {
    // Prevent default refresh
    event.preventDefault();

    writeConfig(event);
  };

  const writeConfig = (event) => {
    let configData = JSON.stringify({
      windowState: vent,
      fanState: fan,
      windowRun: ventRun,
      windowPause: ventPause - 10, // Adjust for UI offset
      maxTemp: highTemp,
    });

    console.log('Write: ' + JSON.stringify(configData));

    config.vent(configData, selectedEnv);
  };

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
  }

  useEffect(() => {
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

  return (
    <Grid>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <h1>
          <Dropdown
            variant="filled"
            value={selectedEnv}
            onChange={(e) => {
              setSelectedEnv(e.value);
              setEnv(e.value);
            }}
            options={config.getEnvs()}
            optionLabel="name"
            checkmark={true}
            highlightOnSelect={false}
            placeholder="Select environment"
            className="w-full md:w-14rem"
          />
        </h1>
      </Column>
      <Column lg={10} md={10} sm={10}>
        <br></br>
        <form onSubmit={(e) => handleOnSubmit(e)}>
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
        <br></br>
        <br></br>
      </Column>
    </Grid>
  );
}
export default Vent;
