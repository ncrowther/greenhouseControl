'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { FaFireFlameSimple } from 'react-icons/fa6';
import { Button, Grid, Column } from '@carbon/react';
import '@carbon/charts-react/styles.css';

const endpoints = require('../config/endpoints.js');
const config = require('../config/config.js');

function Heater() {
  const [lowTemp, setLowTemp] = useState('0');
  const [heater, setHeater] = useState('OFF');
  const [loading, setLoading] = useState(true);
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());
  const [error, setError] = useState();

  const handleOnSubmit = (event) => {
    let configData = JSON.stringify({
      heaterState: heater,
      minTemp: lowTemp,
    });

    console.log('Got: ' + JSON.stringify(configData));

    config.heat(configData);
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
                setLowTemp(configData.temperatureRange[0]);
                setHeater(configData.heaterState);
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

  // Set heater buttons and highlight the one that is enabled
  let heaterButton = {};
  if (heater === 'ON') {
    heaterButton = (
      <div>
        <Button
          kind="primary"
          renderIcon={FaFireFlameSimple}
          inputid="heater1"
          name="heaterOn"
          value="ON"
          onClick={(e) => setHeater('ON')}
        >
          {' '}
          ON*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater2"
          name="heaterOff"
          value="OFF"
          onClick={(e) => setHeater('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater3"
          name="heaterAuto"
          value="AUTO"
          onClick={(e) => setHeater('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else if (heater === 'OFF') {
    heaterButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater1"
          name="heaterOn"
          value="ON"
          onClick={(e) => setHeater('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="primary"
          renderIcon={FaFireFlameSimple}
          inputid="heater2"
          name="heaterOff"
          value="OFF"
          onClick={(e) => setHeater('OFF')}
        >
          {' '}
          OFF*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater3"
          name="heaterAuto"
          value="AUTO"
          onClick={(e) => setHeater('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else {
    heaterButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater1"
          name="heaterOn"
          value="ON"
          onClick={(e) => setHeater('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="tertiary"
          renderIcon={FaFireFlameSimple}
          inputid="heater2"
          name="heaterOff"
          value="OFF"
          onClick={(e) => setHeater('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="primary"
          renderIcon={FaFireFlameSimple}
          inputid="heater3"
          name="heaterAuto"
          value="AUTO"
          onClick={(e) => setHeater('AUTO')}
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
          <h4>Heater:</h4>
          {heaterButton}

          <br></br>
          <br></br>

          <h4>Min:</h4>
          <Knob
            value={lowTemp}
            onChange={(e) => setLowTemp(e.value)}
            min={5}
            max={50}
            valueTemplate={'{value}C'}
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

export default Heater;
