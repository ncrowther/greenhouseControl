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

import React, { useState } from 'react';
import Image from 'next/image';
const endpoints = require('../config/endpoints.js');

const config = require('../config/config.js');

export default function LandingPage() {
  const [selectedServer, setSelectedServer] = useState('Cloud Service');

  const serverOptions = [
    {
      name: 'Cloud Service',
      value:
        'https://dataservice.27uzmkl2grxv.us-south.codeengine.appdomain.cloud',
    },
    { name: 'Localhost', value: 'http://localhost:3000' },
    {
      name: 'Foxhound',
      value: 'https://foxhound-hip-initially.ngrok-free.app',
    },
  ];

  function setServer(serverEndpoint) {
    setSelectedServer(serverEndpoint);
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
            <Tab>Status</Tab>
            <Tab>About</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column
                  md={4}
                  lg={7}
                  sm={4}
                  className="landing-page__tab-content"
                >
                  <h4>All systems operational</h4>
                  <br /> <br />
                  <strong>Server:</strong> <br />
                  <select
                    value={selectedServer}
                    onChange={(e) => setServer(e.target.value)}
                    style={{
                      width: '100%',
                      marginTop: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    {serverOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.name}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '0.85rem', color: '#ccc' }}>
                    Current: {selectedServer}
                  </div>
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
