'use client';

import './_landing-page.scss';

import React, { useState, useEffect, useCallback } from 'react';

import { Grid, Column, Button } from '@carbon/react';

const config = require('../config/config.js');

import { IoRainyOutline } from 'react-icons/io5';
import { FaFireFlameSimple } from 'react-icons/fa6';
import { CiLight } from 'react-icons/ci';
import { WiHumidity } from 'react-icons/wi';
import { Knob } from 'primereact/knob';
import Image from 'next/image';

const endpoints = require('../config/endpoints.js');

export default function Zone(zoneParam) {
  const zone = zoneParam.searchParams.id;
  const hydration =
    zoneParam.searchParams.hydration === undefined
      ? '50'
      : zoneParam.searchParams.hydration;
  const color =
    zoneParam.searchParams.color === undefined
      ? 'red'
      : zoneParam.searchParams.color;

  const [waterLevel, setWaterLevel] = useState(parseInt(hydration));
  const [waterColor, setWaterColor] = useState(color);
  const [pumpState, setPumpState] = useState('OFF');
  const [direction, setDirection] = useState('DOWN');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

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

  const tick = (zone) => {
    if (waterLevel <= 43 && pumpState === 'AUTO') {
      if (direction !== 'UP') {
        writePumpConfig('ON', zone);
        setDirection('UP');
      }
    } else if (waterLevel >= 67 && pumpState === 'AUTO') {
      if (direction !== 'DOWN') {
        writePumpConfig('OFF', zone);
        setDirection('DOWN');
      }
    }

    if (waterLevel >= 97 && pumpState === 'ON') {
      setPumpState('OFF');
      writePumpConfig('OFF', zone);
      setDirection('DOWN');
    }

    if (pumpState === 'ON') {
      setDirection('UP');
    }

    if (pumpState === 'OFF') {
      setDirection('DOWN');
    }

    if (direction === 'UP' && waterLevel < 97) {
      setWaterLevel((waterLevel) => waterLevel + 3);
    } else if (direction === 'DOWN' && waterLevel > 3) {
      setWaterLevel((waterLevel) => waterLevel - 3);
    }

    setDial();
    //getConfigData();
  };

  const handleOnSubmit = (state, zone) => {
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

    // Delay the state update and config write by 0.5 second (adjust as needed)
    setIsSubmitting(true);
    setTimeout(() => {
      setPumpState(newState);
      writePumpConfig(newState, zone);
      setIsSubmitting(false);
    }, 1000);
  };

  function writePumpConfig(newState, zone) {
    let configData = JSON.stringify({
      pumpState: newState,
    });

    console.log('****Write Config: ' + JSON.stringify(configData));

    config.pump(configData, zone);
  }

  async function getConfigData(selectedEnv) {
    await config
      .getConfigData(selectedEnv)
      .then((configData) => {
        console.log('Config*******' + JSON.stringify(configData));
        if (configData) {
          setPumpState(configData.pumpState);
        }
      })
      .catch((err) => {
        console.log(err);
        return <Grid className="config-page">Error</Grid>;
      });

    setLoading(false);
  }

  //useEffect(() => {
  //  getConfigData();
  //}, []);

  useEffect(() => {
    const dInterval = setInterval(() => tick(zone), 1000);
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
        disabled={isSubmitting}
        kind="primary"
        renderIcon={IoRainyOutline}
        inputid="pump1"
        name="pumpOn"
        value={pumpState}
        onClick={(e) => handleOnSubmit(pumpState, zone)}
      >
        {' '}
        {isSubmitting ? 'Updating...' : pumpState}
      </Button>
    </div>
  );

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <h1>&nbsp;Zone {zone}</h1>
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

          <Column></Column>

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

          <Column></Column>

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

          <Column></Column>

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

      <Column lg={16} md={8} sm={4} style={{ marginTop: '1px' }}>
        <hr
          style={{
            border: 'none',
            borderTop: '3px solid #797676',
            margin: '10px 0',
          }}
        />
      </Column>

      <Column lg={16} md={8} sm={4} style={{ marginTop: '4px' }}>
        <div style={{ width: '100%', height: 'auto', position: 'relative' }}>
          <Image
            src={
              pumpState === 'AUTO' && direction === 'UP'
                ? '/basilruleautoon.jpg'
                : pumpState === 'AUTO' && direction === 'DOWN'
                ? '/basilruleautooff.jpg'
                : '/watering.jpg'
            }
            width={1200}
            height={400}
            style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
          />
        </div>
      </Column>
    </Grid>
  );
}
