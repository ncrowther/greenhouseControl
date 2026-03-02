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

import { Knob } from 'primereact/knob';

import Image from 'next/image';

export default function LandingPage() {
  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation"></Breadcrumb>
        <h1 className="landing-page__heading">IBM Greenhouse</h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0}>
          <TabList className="tabs-group" aria-label="Page navigation">
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
                  Plant growth powered by IBM Instana and Turbonomic.
                </Column>
              </Grid>

              <Grid className="tabs-group-content">
                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <h4>Plant 1:</h4>
                  <Knob
                    value={10}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor="red"
                    rangeColor="lightgray"
                  />
                </Column>
                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <h4>Plant 2:</h4>
                  <Knob
                    value={80}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor="green"
                    rangeColor="lightgray"
                  />
                </Column>

                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <h4>Plant 3:</h4>
                  <Knob
                    value={60}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor="orange"
                    rangeColor="lightgray"
                  />
                </Column>

                <Column
                  md={2}
                  lg={3}
                  sm={1}
                  className="landing-page__tab-content"
                >
                  <h4>Plant 4:</h4>
                  <Knob
                    value={90}
                    min={0}
                    max={100}
                    valueTemplate={'{value}%'}
                    valueColor="green"
                    rangeColor="lightgray"
                  />
                </Column>
                <Column md={4} lg={{ span: 8, offset: 8 }} sm={4}></Column>
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Column>
    </Grid>
  );
}
