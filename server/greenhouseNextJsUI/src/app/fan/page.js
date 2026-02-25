'use client';

import React, { useState, useEffect } from 'react';
import { Knob } from 'primereact/knob';
import { PiFanFill } from 'react-icons/pi';
import { Button, Grid, Column } from '@carbon/react';
import { Dropdown } from 'primereact/dropdown';
import '@carbon/charts-react/styles.css';
const endpoints = require('../config/endpoints.js');
const config = require('../config/config.js');

function Fan() {
  const [highTemp, setHighTemp] = useState('0');
  const [fan, setFan] = useState('OFF');
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
      fanState: fan,
      maxTemp: highTemp,
    });

    console.log('Set: ' + JSON.stringify(configData));

    config.fan(configData, selectedEnv);
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
              setFan(configData.fanState);
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

  // Set fan buttons and highlight the one that is enabled
  let fanButton = {};
  if (fan === 'ON') {
    fanButton = (
      <div className="p-inputgroup flex-1">
        <Button
          kind="primary"
          renderIcon={PiFanFill}
          inputid="fan1"
          name="fanOn"
          value="ON"
          onClick={(e) => setFan('ON')}
        >
          {' '}
          ON*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan2"
          name="fanOff"
          value="OFF"
          onClick={(e) => setFan('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan3"
          name="fanAuto"
          value="AUTO"
          onClick={(e) => setFan('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else if (fan === 'OFF') {
    fanButton = (
      <div className="p-inputgroup flex-1">
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan1"
          name="fanOn"
          value="ON"
          onClick={(e) => setFan('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="primary"
          renderIcon={PiFanFill}
          inputid="fan2"
          name="fanOff"
          value="OFF"
          onClick={(e) => setFan('OFF')}
        >
          {' '}
          OFF*
        </Button>
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan3"
          name="fanAuto"
          value="AUTO"
          onClick={(e) => setFan('AUTO')}
        >
          {' '}
          AUTO
        </Button>
      </div>
    );
  } else {
    fanButton = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan1"
          name="fanOn"
          value="ON"
          onClick={(e) => setFan('ON')}
        >
          {' '}
          ON
        </Button>
        <Button
          kind="tertiary"
          renderIcon={PiFanFill}
          inputid="fan2"
          name="fanOff"
          value="OFF"
          onClick={(e) => setFan('OFF')}
        >
          {' '}
          OFF
        </Button>
        <Button
          kind="primary"
          renderIcon={PiFanFill}
          inputid="fan3"
          name="fanAuto"
          value="AUTO"
          onClick={(e) => setFan('AUTO')}
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
          <h4>Fan:</h4>
          {fanButton}

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
export default Fan;
