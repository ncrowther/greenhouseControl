'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { CiLight } from 'react-icons/ci';
import { Button, Grid, Column } from '@carbon/react';
import { Dropdown } from 'primereact/dropdown';
import '@carbon/charts-react/styles.css';
const endpoints = require('../config/endpoints.js');
const config = require('../config/config.js');

function LightPage() {
  const [light, setLight] = useState('OFF');
  const [lightOnTime, setLightOnTime] = useState('00:00');
  const [lightOffTime, setLightOffTime] = useState('00:00');
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());
  const [loading, setLoading] = useState(true);
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
      lightState: light,
      lightOnHH: lightOnTime,
      lightOffHH: lightOffTime,
    });

    console.log('Send: ' + JSON.stringify(configData));

    config.light(configData, selectedEnv);
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
              setLight(configData.lightState);
              setLightOnTime(configData.lightOnOff[0]);
              setLightOffTime(configData.lightOnOff[1]);
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

  useEffect(() => {
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
          <h4>Light:</h4>

          {lightButton}

          <br></br>
          <br></br>

          <h4>On:</h4>
          <Knob
            value={lightOnTime}
            onChange={(e) => setLightOnTime(e.value)}
            min={0}
            max={24}
            valueTemplate={'{value}H'}
            valueColor="orange"
            rangeColor="lightgray"
          />

          <h4>Off:</h4>
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
        <br></br>
        <br></br>
      </Column>
    </Grid>
  );
}

export default LightPage;
