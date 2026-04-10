'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { WiHumidity } from 'react-icons/wi';
import { Button, Grid, Column } from '@carbon/react';
import { Dropdown } from 'primereact/dropdown';
import '@carbon/charts-react/styles.css';
const endpoints = require('../config/endpoints.js');
const config = require('../config/config.js');

function Humidity() {
  const [lowHumidity, setLowHumidity] = useState('0');
  const [humidifier, sethumidifier] = useState('OFF');
  const [loading, setLoading] = useState(true);
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());
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
      humidifierState: humidifier,
      minHumidity: lowHumidity,
      maxHumidity: 100,
    });

    console.log('Set: ' + JSON.stringify(configData));

    config.humidity(configData, selectedEnv);
  };

  async function getConfigData(selectedEnv) {
    await config
      .getConfigData(selectedEnv)
      .then((configData) => {
        if (configData) {
          setLowHumidity(configData.humidityRange[0]);
          sethumidifier(configData.humidifierState);
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

  // Set humidifier buttons and highlight the one that is enabled
  let humidifierButton = {};
  if (humidifier === 'ON') {
    humidifierButton = (
      <div>
        <Button
          kind="primary"
          renderIcon={WiHumidity}
          inputid="humidifier1"
          name="humidifierOn"
          value="ON"
          onClick={(e) => sethumidifier('ON')}
        >
          {' '}
          ON*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={WiHumidity}
          inputid="humidifier2"
          name="humidifierOff"
          value="OFF"
          onClick={(e) => sethumidifier('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="tertiary"
          renderIcon={WiHumidity}
          inputid="humidifier3"
          name="humidifierAuto"
          value="AUTO"
          onClick={(e) => sethumidifier('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else if (humidifier === 'OFF') {
    humidifierButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={WiHumidity}
          inputid="humidifier1"
          name="humidifierOn"
          value="ON"
          onClick={(e) => sethumidifier('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="primary"
          renderIcon={WiHumidity}
          inputid="humidifier2"
          name="humidifierOff"
          value="OFF"
          onClick={(e) => sethumidifier('OFF')}
        >
          {' '}
          OFF*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={WiHumidity}
          inputid="humidifier3"
          name="humidifierAuto"
          value="AUTO"
          onClick={(e) => sethumidifier('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else {
    humidifierButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={WiHumidity}
          inputid="humidifier1"
          name="humidifierOn"
          value="ON"
          onClick={(e) => sethumidifier('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="tertiary"
          renderIcon={WiHumidity}
          inputid="humidifier2"
          name="humidifierOff"
          value="OFF"
          onClick={(e) => sethumidifier('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="primary"
          renderIcon={WiHumidity}
          inputid="humidifier3"
          name="humidifierAuto"
          value="AUTO"
          onClick={(e) => sethumidifier('AUTO')}
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
          <h4>Humidifier:</h4>
          {humidifierButton}

          <br></br>
          <br></br>

          <h4>Min:</h4>
          <Knob
            value={lowHumidity}
            onChange={(e) => setLowHumidity(e.value)}
            min={5}
            max={100}
            valueTemplate={'{value}%'}
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
        <br></br>
        <br></br>
      </Column>
    </Grid>
  );
}

export default Humidity;
