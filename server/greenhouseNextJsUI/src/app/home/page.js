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
} from '@carbon/react';

import { Dropdown } from 'primereact/dropdown';
import { useState } from 'react';
import Image from 'next/image';
const config = require('../config/config.js');

export default function LandingPage() {
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());

  const environment = [
    { name: 'default', code: '1' },
    { name: 'Greenhouse', code: '2' },
    { name: 'Polytunnel', code: '3' },
  ];

  const setEnv = (event) => {
    console.log('Event: ' + JSON.stringify(event));
    config.setEnv(event);
  };

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation"></Breadcrumb>
        <h1 className="landing-page__heading">Greenhouse</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0}>
          <TabList className="tabs-group" aria-label="Page navigation">
            <Tab>Environment</Tab>
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
                  <div className="landing-page__tab-content">
                    <Dropdown
                      variant="filled"
                      value={selectedEnv}
                      onChange={(e) => {
                        setSelectedEnv(e.value);
                        setEnv(e.value);
                      }}
                      options={environment}
                      optionLabel="name"
                      placeholder="Select environment"
                    />
                  </div>
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
