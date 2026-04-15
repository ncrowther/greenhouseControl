'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { BiVent } from 'react-icons/bi';
import { Button, Grid, Column } from '@carbon/react';
import '@carbon/charts-react/styles.css';
const config = require('../config/config.js');

function Vent() {
  const [highTemp, setHighTemp] = useState('0');
  const [vent, setVent] = useState('DOWN');
  const [ventRun, setVentRun] = useState('0');
  const [ventPause, setVentPause] = useState(0);
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const setEnv = async (event) => {
    console.log('Event: ' + JSON.stringify(event));
    config.setEnv(event);
    setLoading(true);
    await getConfigData(event);
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
      windowRun: ventRun,
      windowPause: ventPause,
      maxTemp: highTemp,
    });

    console.log('Write: ' + JSON.stringify(configData));

    config.vent(configData, selectedEnv);
  };

  async function getConfigData(selectedEnv) {
    await config
      .getConfigData(selectedEnv)
      .then((configData) => {
        console.log('Config*******' + JSON.stringify(configData));
        if (configData) {
          setHighTemp(configData.temperatureRange[1]);
          setVent(configData.windowState);
          setVentRun(configData.windowRun);
          setVentPause(configData.windowPause);
        }
      })
      .catch((err) => {
        console.log(err);
        return <Grid className="config-page">Error</Grid>;
      });

    setLoading(false);
  }

  useEffect(() => {
    getConfigData(selectedEnv);
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
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {config.getEnvs().map((env) => (
            <button
              key={env.id}
              onClick={() => {
                setSelectedEnv(env);
                setEnv(env);
              }}
              style={{
                padding: '16px 32px',
                fontSize: '16px',
                backgroundColor:
                  selectedEnv.id === env.id ? '#0f62fe' : '#e0e0e0',
                color: selectedEnv.id === env.id ? 'white' : 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: selectedEnv.id === env.id ? 'bold' : 'normal',
              }}
            >
              {env.name}
            </button>
          ))}
        </div>
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

          <h4>Vent Run (1 - 45 Sec):</h4>
          <Knob
            value={ventRun}
            onChange={(e) => setVentRun(e.value)}
            min={1}
            max={45}
            valueTemplate={'{value}'}
            valueColor="blue"
            rangeColor="lightgray"
          />

          <h4>Vent Pause (1 - 240 Sec):</h4>
          <Knob
            value={ventPause}
            onChange={(e) => setVentPause(e.value)}
            min={1}
            max={240}
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
