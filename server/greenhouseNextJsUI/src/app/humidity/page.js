'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { WiHumidity } from 'react-icons/wi';
import { Button, Grid, Column } from '@carbon/react';
import '@carbon/charts-react/styles.css';
const endpoints = require('../config/endpoints.js');
const config = require('../config/config.js');

function Humidity() {
  const [lowHumidity, setLowHumidity] = useState('0');
  const [humidifier, sethumidifier] = useState('OFF');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const handleOnSubmit = (event) => {
    let configData = JSON.stringify({
      humidifierState: humidifier,
      minHumidity: lowHumidity,
      maxHumidity: 100,
    });

    console.log('Got: ' + JSON.stringify(configData));

    config.humidity(configData);
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
                setLowHumidity(configData.humidityRange[0]);
                sethumidifier(configData.humidifierState);
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
      <Column lg={1} md={1} sm={1}>
        {/* Empty first column */}
      </Column>

      <Column lg={5} md={5} sm={5}>
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
      </Column>
    </Grid>
  );
}

export default Humidity;
