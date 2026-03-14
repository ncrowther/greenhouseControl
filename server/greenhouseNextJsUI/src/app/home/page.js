'use client';

import React, { useState, useEffect } from 'react';

import {
  Breadcrumb,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Grid,
  Column,
  Button,
} from '@carbon/react';

const config = require('../config/config.js');

import { IoRainyOutline } from 'react-icons/io5';

import { Knob } from 'primereact/knob';
import Image from 'next/image';

const endpoints = require('../config/endpoints.js');

export default function LandingPage() {
  const endpoint = endpoints.serviceEndpoint;

  const [hydrationLevelZone1, setHydrationLevelZone1] = useState(0);
  const [hydrationLevelZone2, setHydrationLevelZone2] = useState(0);
  const [hydrationLevelZone3, setHydrationLevelZone3] = useState(0);
  const [hydrationLevelZone4, setHydrationLevelZone4] = useState(0);

  const [pumpStateZ1, setPumpStateZ1] = useState('OFF');
  const [pumpStateZ2, setPumpStateZ2] = useState('OFF');
  const [pumpStateZ3, setPumpStateZ3] = useState('OFF');
  const [pumpStateZ4, setPumpStateZ4] = useState('OFF');
  const [pumpColorZ1, setPumpColorZ1] = useState('gray');
  const [pumpColorZ2, setPumpColorZ2] = useState('gray');
  const [pumpColorZ3, setPumpColorZ3] = useState('gray');
  const [pumpColorZ4, setPumpColorZ4] = useState('gray');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();

  const zone1 = config.getEnvs()[0];
  const zone2 = config.getEnvs()[1];
  const zone3 = config.getEnvs()[2];
  const zone4 = config.getEnvs()[3];

  const handleOnSubmit = async (zone, state) => {
    // Prevent default refresh
    //event.preventDefault();

    console.log('Zone' + zone);
    console.log('state: ' + state);

    let newState = 'OFF';

    if (state === 'ON') {
      newState = 'OFF';
    } else if (state === 'OFF') {
      newState = 'AUTO';
    } else if (state === 'AUTO') {
      newState = 'ON';
    }

    await writeConfig(zone, newState);
    setPumpState(zone, newState);
    window.location.reload(false);
  };

  async function writeConfig(zone, state) {
    let configData = JSON.stringify({
      pumpState: state,
    });

    console.log('Send: ' + JSON.stringify(configData));

    await config.pump(configData, zone);
  }

  function setPumpState(zone, state) {
    if (zone.name === zone1.name) {
      if (state === 'ON') {
        setHydrationLevelZone1(30);
        setPumpColorZ1('orange');
      } else if (state === 'OFF') {
        setHydrationLevelZone1(100);
        setPumpColorZ1('green');
      } else if (state === 'AUTO') {
        setHydrationLevelZone1(100);
        setPumpColorZ1('gray');
      }

      setPumpStateZ1(state);
    } else if (zone.name === zone2.name) {
      if (state === 'ON') {
        setHydrationLevelZone2(10);
        setPumpColorZ2('red');
      } else if (state === 'OFF') {
        setHydrationLevelZone2(100);
        setPumpColorZ2('green');
      } else if (state === 'AUTO') {
        setHydrationLevelZone2(100);
        setPumpColorZ2('gray');
      }

      setPumpStateZ2(state);
    } else if (zone.name === zone3.name) {
      if (state === 'ON') {
        setHydrationLevelZone3(70);
        setPumpColorZ3('orange');
      } else if (state === 'OFF') {
        setHydrationLevelZone3(100);
        setPumpColorZ3('green');
      } else if (state === 'AUTO') {
        setHydrationLevelZone3(100);
        setPumpColorZ3('gray');
      }

      setPumpStateZ3(state);
    } else if (zone.name === zone4.name) {
      if (state === 'ON') {
        setHydrationLevelZone4(50);
        setPumpColorZ4('orange');
      } else if (state === 'OFF') {
        setHydrationLevelZone4(100);
        setPumpColorZ4('green');
      } else if (state === 'AUTO') {
        setHydrationLevelZone4(100);
        setPumpColorZ4('gray');
      }

      setPumpStateZ4(state);
    }
  }

  async function getPumpState(zone) {
    await fetch(endpoints.configServiceEndpoint + '?id=' + zone.name, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status == 200) {
          response.json().then((data) => {
            const configData = data.doc;

            console.log('*******' + JSON.stringify(configData));

            if (configData) {
              setPumpState(zone, configData.pumpState);
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
    getPumpState(config.getEnvs()[0]);
    getPumpState(config.getEnvs()[1]);
    getPumpState(config.getEnvs()[2]);
    getPumpState(config.getEnvs()[3]);
  }, []);

  if (loading) {
    return <Grid className="config-page">Loading</Grid>;
  }

  if (error) {
    return `Error! ${error}`;
  }

  // Set Zone 1 pump button and highlight the one that is enabled
  let pumpButtonZ1 = {};

  if (pumpStateZ1 === 'ON') {
    pumpButtonZ1 = (
      <div>
        <Button
          kind="primary"
          renderIcon={IoRainyOutline}
          inputid="pump1"
          name="pumpOn"
          value="ON"
          onClick={(e) => handleOnSubmit(zone1, 'ON')}
        >
          ON
        </Button>
      </div>
    );
  } else if (pumpStateZ1 === 'OFF') {
    pumpButtonZ1 = (
      <div>
        <Button
          kind="secondary"
          renderIcon={IoRainyOutline}
          inputid="pump2"
          name="pumpOff"
          value="OFF"
          onClick={(e) => handleOnSubmit(zone1, 'OFF')}
        >
          OFF
        </Button>
      </div>
    );
  } else {
    pumpButtonZ1 = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump3"
          name="pumpAuto"
          value="AUTO"
          onClick={(e) => handleOnSubmit(zone1, 'AUTO')}
        >
          AUTO
        </Button>
      </div>
    );
  }

  // Set Zone 2 pump button and highlight the one that is enabled
  let pumpButtonZ2 = {};

  if (pumpStateZ2 === 'ON') {
    pumpButtonZ2 = (
      <div>
        <Button
          kind="primary"
          renderIcon={IoRainyOutline}
          inputid="pump1"
          name="pumpOn"
          value="ON"
          onClick={(e) => handleOnSubmit(zone2, 'ON')}
        >
          ON
        </Button>
      </div>
    );
  } else if (pumpStateZ2 === 'OFF') {
    pumpButtonZ2 = (
      <div>
        <Button
          kind="secondary"
          renderIcon={IoRainyOutline}
          inputid="pump2"
          name="pumpOff"
          value="OFF"
          onClick={(e) => handleOnSubmit(zone2, 'OFF')}
        >
          OFF
        </Button>
      </div>
    );
  } else {
    pumpButtonZ2 = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump3"
          name="pumpAuto"
          value="AUTO"
          onClick={(e) => handleOnSubmit(zone2, 'AUTO')}
        >
          AUTO
        </Button>
      </div>
    );
  }

  // Set Zone 3 pump button and highlight the one that is enabled
  let pumpButtonZ3 = {};

  if (pumpStateZ3 === 'ON') {
    pumpButtonZ3 = (
      <div>
        <Button
          kind="primary"
          renderIcon={IoRainyOutline}
          inputid="pump1"
          name="pumpOn"
          value="ON"
          onClick={(e) => handleOnSubmit(zone3, 'ON')}
        >
          ON
        </Button>
      </div>
    );
  } else if (pumpStateZ3 === 'OFF') {
    pumpButtonZ3 = (
      <div>
        <Button
          kind="secondary"
          renderIcon={IoRainyOutline}
          inputid="pump2"
          name="pumpOff"
          value="OFF"
          onClick={(e) => handleOnSubmit(zone3, 'OFF')}
        >
          OFF
        </Button>
      </div>
    );
  } else {
    pumpButtonZ3 = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump3"
          name="pumpAuto"
          value="AUTO"
          onClick={(e) => handleOnSubmit(zone3, 'AUTO')}
        >
          AUTO
        </Button>
      </div>
    );
  }

  // Set Zone 3 pump button and highlight the one that is enabled
  let pumpButtonZ4 = {};

  if (pumpStateZ4 === 'ON') {
    pumpButtonZ4 = (
      <div>
        <Button
          kind="primary"
          renderIcon={IoRainyOutline}
          inputid="pump1"
          name="pumpOn"
          value="ON"
          onClick={(e) => handleOnSubmit(zone4, 'ON')}
        >
          ON
        </Button>
      </div>
    );
  } else if (pumpStateZ4 === 'OFF') {
    pumpButtonZ4 = (
      <div>
        <Button
          kind="secondary"
          renderIcon={IoRainyOutline}
          inputid="pump2"
          name="pumpOff"
          value="OFF"
          onClick={(e) => handleOnSubmit(zone4, 'OFF')}
        >
          OFF
        </Button>
      </div>
    );
  } else {
    pumpButtonZ4 = (
      <div>
        <Button
          kind="tertiary"
          renderIcon={IoRainyOutline}
          inputid="pump3"
          name="pumpAuto"
          value="AUTO"
          onClick={(e) => handleOnSubmit(zone4, 'AUTO')}
        >
          AUTO
        </Button>
      </div>
    );
  }

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation"></Breadcrumb>
        <h1 className="landing-page__heading">Open Greenhouse</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0}>
          <TabList className="tabs-group" aria-label="Page navigation">
            <Tab>Irrigation</Tab>
            <Tab>Temperature</Tab>
            <Tab>Humidity</Tab>
            <Tab>About</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <h4> &nbsp; &nbsp; Zone 1:</h4>
                  <Knob
                    value={hydrationLevelZone1}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor={pumpColorZ1}
                    rangeColor="lightgray"
                  />
                  {pumpButtonZ1}
                </Column>
                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <h4> &nbsp; &nbsp;Zone 2:</h4>
                  <Knob
                    value={hydrationLevelZone2}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor={pumpColorZ2}
                    rangeColor="lightgray"
                  />
                  {pumpButtonZ2}
                </Column>

                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <h4> &nbsp; &nbsp;Zone 3:</h4>
                  <Knob
                    value={hydrationLevelZone3}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor={pumpColorZ3}
                    rangeColor="lightgray"
                  />
                  {pumpButtonZ3}
                </Column>

                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <h4> &nbsp; &nbsp; Zone 4:</h4>
                  <Knob
                    value={hydrationLevelZone4}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor={pumpColorZ4}
                    rangeColor="lightgray"
                  />
                  {pumpButtonZ4}
                </Column>
                <Column md={4} lg={{ span: 8, offset: 8 }} sm={4}></Column>
              </Grid>
            </TabPanel>
            <TabPanel>TBD</TabPanel>
            <TabPanel>TBD</TabPanel>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column
                  md={4}
                  lg={7}
                  sm={4}
                  className="landing-page__tab-content"
                >
                  <h4>
                    Control your environment with Open Greenhouse, an
                    open-source project for monitoring and controlling your
                    greenhouse.
                  </h4>
                  <br /> <br />
                  <strong>Server:</strong> <br />
                  {endpoints.serviceEndpoint}
                  <br /> <br />
                  <strong>Senscap Soil Sensor:</strong>
                  <br />
                  {endpoints.sensecapSoilEndpoint}
                  <br /> <br />
                  <strong>Senscap Air Sensor:</strong> <br />
                  {endpoints.sensecapDatalogEndpoint}
                  <br /> <br />
                  <strong>Senscap API Key:</strong> <br />
                  {endpoints.sensecapAuth}
                  <br /> <br />
                </Column>
                <Column md={4} lg={{ span: 8, offset: 8 }} sm={4}>
                  <Image
                    className="landing-page__illo"
                    src="/tab-illo.png"
                    alt="Carbon illustration"
                    width={240}
                    height={480}
                  />
                </Column>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>
    </Grid>
  );
}
