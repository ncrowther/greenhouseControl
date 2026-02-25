'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { FaFireFlameSimple } from 'react-icons/fa6';
import { Button, Grid, Column } from '@carbon/react';
import { Dropdown } from 'primereact/dropdown';
import '@carbon/charts-react/styles.css';

const endpoints = require('../config/endpoints.js');
const config = require('../config/config.js');

function Heater() {
  const [lowTemp, setLowTemp] = useState('0');
  const [heater, setHeater] = useState('OFF');
  const [loading, setLoading] = useState(true);
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());
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
      heaterState: heater,
      minTemp: lowTemp,
    });

    console.log('Got: ' + JSON.stringify(configData));

    config.heat(configData, selectedEnv);
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

  useEffect(() => {
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

export default Heater;
