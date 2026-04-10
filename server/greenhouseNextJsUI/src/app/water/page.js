'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
const config = require('../config/config.js');
import { IoRainyOutline } from 'react-icons/io5';
import { Button, Grid, Column, Slider } from '@carbon/react';
import { Dropdown } from 'primereact/dropdown';
import '@carbon/charts-react/styles.css';
const endpoints = require('../config/endpoints.js');

function Water() {
  const [pumpState, setPumpState] = useState('OFF');
  const [pumpOnDuration, setPumpOnDuration] = useState(0);
  const [pumpOnTime1, setPumpOnTime1] = useState(0);
  const [pumpOnTime2, setPumpOnTime2] = useState(0);
  const [pumpOnTime3, setPumpOnTime3] = useState(0);
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());
  const [loading, setLoading] = useState(true);
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

  function writeConfig(event) {
    let configData = JSON.stringify({
      pumpState: pumpState,
      wateringDuration: pumpOnDuration,
      timeHH1: pumpOnTime1,
      timeHH2: pumpOnTime2,
      timeHH3: pumpOnTime3,
    });

    console.log('Send: ' + JSON.stringify(configData));

    config.water(configData, selectedEnv);
  }

  async function getConfigData(selectedEnv) {
    await config
      .getConfigData(selectedEnv)
      .then((configData) => {
        console.log('Config*******' + JSON.stringify(configData));
        if (configData) {
          setPumpState(configData.pumpState);
          setPumpOnDuration(configData.wateringDuration);
          setPumpOnTime1(configData.wateringTimes[0]);
          setPumpOnTime2(configData.wateringTimes[1]);
          setPumpOnTime3(configData.wateringTimes[2]);
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

  // Set pump buttons and highlight the one that is enabled
  let pumpButton = {};
  if (pumpState === 'ON') {
    pumpButton = (
      <div>
        <Button
          kind="primary"
          renderIcon={IoRainyOutline}
          inputid="pump1"
          name="pumpOn"
          value="ON"
          onClick={(e) => setPumpState('ON')}
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
          onClick={(e) => setPumpState('OFF')}
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
          onClick={(e) => setPumpState('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else if (pumpState === 'OFF') {
    pumpButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump1"
          name="pumpOn"
          value="ON"
          onClick={(e) => setPumpState('ON')}
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
          onClick={(e) => setPumpState('OFF')}
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
          onClick={(e) => setPumpState('AUTO')}
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
          onClick={(e) => setPumpState('ON')}
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
          onClick={(e) => setPumpState('OFF')}
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
          onClick={(e) => setPumpState('AUTO')}
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
        <br></br>
        <br></br>
      </Column>
    </Grid>
  );
}
export default Water;
