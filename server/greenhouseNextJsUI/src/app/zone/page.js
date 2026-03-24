'use client';

import React, { useState, useEffect, useCallback } from 'react';

import { Grid, Column, Button } from '@carbon/react';

const config = require('../config/config.js');

import { IoRainyOutline } from 'react-icons/io5';
import { FaFireFlameSimple } from 'react-icons/fa6';
import { CiLight } from 'react-icons/ci';
import { WiHumidity } from 'react-icons/wi';

import { Knob } from 'primereact/knob';

const endpoints = require('../config/endpoints.js');

export default function Zone(zoneParam) {
  const endpoint = endpoints.serviceEndpoint;

  const [waterLevel, setWaterLevel] = useState(11);
  const [waterColor, setWaterColor] = useState('red');
  const [pumpState, setPumpState] = useState('  ');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const zone = zoneParam.searchParams.id;

  const setDial = () => {
    if (waterLevel <= 15) {
      setWaterColor('red');
    } else if (waterLevel <= 35) {
      setWaterColor('orange');
    } else if (waterLevel <= 75) {
      setWaterColor('green');
    } else if (waterLevel > 75) {
      setWaterColor('red');
    }
  };

  const tick = () => {
    if (waterLevel <= 90 && pumpState === 'ON') {
      setWaterLevel((waterLevel) => waterLevel + 1);
    } else if (waterLevel >= 15 && pumpState === 'OFF') {
      setWaterLevel((waterLevel) => waterLevel - 1);
    } else if (waterLevel > 50 && waterLevel <= 70 && pumpState === 'AUTO') {
      // Do Nothing as the water level is in the optimal range
    } else if (waterLevel > 70 && pumpState === 'AUTO') {
      setWaterLevel((waterLevel) => waterLevel - 5);
    } else if (waterLevel <= 50 && pumpState === 'AUTO') {
      setWaterLevel((waterLevel) => waterLevel + 5);
    }
    setDial();
    getConfigData();
  };

  const handleOnSubmit = (state) => {
    let newState = 'OFF';

    if (state === 'ON') {
      newState = 'OFF';
    } else if (state === 'OFF') {
      newState = 'AUTO';
    } else if (state === 'AUTO') {
      newState = 'ON';
    }

    console.log('state: ' + state);
    console.log('newstate: ' + newState);
    writeConfig(newState);
    setPumpState(newState);
    //window.location.reload(false);
  };

  function writeConfig(newState) {
    let configData = JSON.stringify({
      pumpState: newState,
    });

    console.log('****Write Config: ' + JSON.stringify(configData));

    config.pump(configData, zone);
  }

  async function getConfigData() {
    fetch(endpoints.configServiceEndpoint + '?id=' + zone, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status == 200) {
          response.json().then((data) => {
            const configData = data.doc;

            console.log('***getConfigData****' + JSON.stringify(configData));

            if (configData) {
              setPumpState(configData.pumpState);
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

  //useEffect(() => {
  //  getConfigData();
  //}, []);

  useEffect(() => {
    const dInterval = setInterval(() => tick(), 1000);
    return () => clearInterval(dInterval);
  }, [zone, pumpState, waterLevel, tick]);

  if (loading) {
    return <Grid className="config-page">Loading</Grid>;
  }

  if (error) {
    return `Error! ${error}`;
  }

  // Set Zone 1 pump button and highlight the one that is enabled
  let waterButton = {};

  waterButton = (
    <div>
      <Button
        kind="primary"
        renderIcon={IoRainyOutline}
        inputid="pump1"
        name="pumpOn"
        value={pumpState}
        onClick={(e) => handleOnSubmit(pumpState)}
      >
        {pumpState}
      </Button>
    </div>
  );

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <h1>{zone}</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Grid className="tabs-group-content">
          <Column md={2} lg={3} sm={1} className="landing-page__tab-content">
            <h3>Water</h3>
            <br></br>
            <Knob
              value={waterLevel}
              min={0}
              max={100}
              valueTemplate={'{value}%'}
              valueColor={waterColor}
              rangeColor="lightgray"
            />
            {waterButton}
          </Column>

          <Column md={2} lg={3} sm={1} className="landing-page__tab-content">
            <h3>Light</h3>
            <br></br>
            <Knob
              value="2.3"
              min={0}
              max={10}
              valueTemplate={'{value}klx'}
              valueColor="Green"
              rangeColor="lightgray"
            />

            <Button
              kind="primary"
              renderIcon={CiLight}
              inputid="light1"
              name="lightOn"
              value="ON"
            >
              ON
            </Button>
          </Column>

          <Column md={2} lg={3} sm={1} className="landing-page__tab-content">
            <h3>Temperature</h3>
            <br></br>
            <Knob
              value="22"
              min={0}
              max={40}
              valueTemplate={'{value}°C'}
              valueColor="Green"
              rangeColor="lightgray"
            />

            <Button
              kind="primary"
              renderIcon={FaFireFlameSimple}
              inputid="temp1"
              name="tempOn"
              value="ON"
            >
              ON
            </Button>
          </Column>

          <Column md={2} lg={3} sm={1} className="landing-page__tab-content">
            <h3>Humidity</h3>
            <br></br>
            <Knob
              value="62"
              min={0}
              max={100}
              valueTemplate={'{value}%'}
              valueColor="Green"
              rangeColor="lightgray"
            />

            <Button
              kind="primary"
              renderIcon={WiHumidity}
              inputid="hum1"
              name="humOn"
              value="ON"
            >
              ON
            </Button>
          </Column>
        </Grid>
      </Column>
    </Grid>
  );
}
