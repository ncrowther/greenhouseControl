'use client';

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

import { useRouter } from 'next/navigation';

const config = require('../config/config.js');

import { Knob } from 'primereact/knob';
import Image from 'next/image';

const endpoints = require('../config/endpoints.js');

export default function LandingPage() {
  const endpoint = endpoints.serviceEndpoint;

  const zone1Hydration = '22';
  const zone2Hydration = '9';
  const zone3Hydration = '42';
  const zone4Hydration = '2';

  const zone1Color = 'orange';
  const zone2Color = 'red';
  const zone3Color = 'green';
  const zone4Color = 'red';

  const router = useRouter();

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation"></Breadcrumb>
        <h1 className="landing-page__heading">Open Greenhouse</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0}>
          <TabList className="tabs-group" aria-label="Page navigation">
            <Tab>Status</Tab>
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
                  <Knob
                    value={zone1Hydration}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor={zone1Color}
                    rangeColor="lightgray"
                  />

                  <Button
                    kind="primary"
                    inputid="heater2"
                    name="heaterAuto"
                    value="AUTO"
                    onClick={() =>
                      router.push(
                        '/zone?id=Zone1&hydration=' +
                          zone1Hydration +
                          '&color=' +
                          zone1Color
                      )
                    }
                  >
                    Zone 1
                  </Button>
                </Column>
                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <Knob
                    value={zone2Hydration}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor={zone2Color}
                    rangeColor="lightgray"
                  />

                  <Button
                    kind="primary"
                    inputid="heater2"
                    name="heaterAuto"
                    value="AUTO"
                    onClick={() =>
                      router.push(
                        '/zone?id=Zone2&hydration=' +
                          zone2Hydration +
                          '&color=' +
                          zone2Color
                      )
                    }
                  >
                    Zone 2
                  </Button>
                </Column>

                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <Knob
                    value={zone3Hydration}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor={zone3Color}
                    rangeColor="lightgray"
                  />

                  <Button
                    kind="primary"
                    inputid="heater3"
                    name="heaterAuto"
                    value="AUTO"
                    onClick={() =>
                      router.push(
                        '/zone?id=Zone3&hydration=' +
                          zone3Hydration +
                          '&color=' +
                          zone3Color
                      )
                    }
                  >
                    Zone 3
                  </Button>
                </Column>

                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <Knob
                    value={zone4Hydration}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor={zone4Color}
                    rangeColor="lightgray"
                  />

                  <Button
                    kind="primary"
                    inputid="heater4"
                    name="heaterAuto"
                    value="AUTO"
                    onClick={() =>
                      router.push(
                        '/zone?id=Zone4&hydration=' +
                          zone4Hydration +
                          '&color=' +
                          zone4Color
                      )
                    }
                  >
                    Zone 4
                  </Button>
                </Column>

                <Column md={4} lg={{ span: 8, offset: 8 }} sm={4}></Column>
              </Grid>
            </TabPanel>
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
                  <small>
                    {' '}
                    <b>{process.env.NODE_ENV}</b> mode.
                  </small>
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
