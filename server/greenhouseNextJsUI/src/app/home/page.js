'use client';


import GreenhouseDetails from './GreenhouseDetails.js';
import GreenhouseLight from './GreenhouseLight.js';
import GreenhouseHeat from './GreenhouseHeat.js';
import GreenhouseCool from './GreenhouseCool.js';
import GreenhouseIrrigation from './GreenhouseIrrigation.js';

import { FaTemperatureEmpty } from "react-icons/fa6";
import { MdOutlineCo2 } from "react-icons/md";
import { MdEnergySavingsLeaf } from "react-icons/md";
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Grid,
  Column,
} from '@carbon/react';
import {
  Advocate,
  Globe,
  AcceleratingTransformation,
} from '@carbon/pictograms-react';
import { InfoSection, InfoCard } from '@/components/Info/Info';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <Breadcrumb noTrailingSlash aria-label="Page navigation">
        </Breadcrumb>
        <h1 className="landing-page__heading">
          Climate Control
        </h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r2">
        <Tabs defaultSelectedIndex={0}>
          <TabList className="tabs-group" aria-label="Page navigation">
            <Tab>About</Tab>
            <Tab>Light</Tab>
            <Tab>Min</Tab>
            <Tab>Max</Tab>
            <Tab>Water</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column
                  md={4}
                  lg={7}
                  sm={4}
                  className="landing-page__tab-content">
                  <h3 className="landing-page__subheading">Greenhouse Control</h3>
                  <br></br>
                  Welcome to Greenhouse Control.
                  <br></br>
                  <br></br>
                  <h4>
                    Light
                  </h4>
                  <p>
                    Most plants grow well in 12-14 hours strong daylight and 8-12 hours darkness
                  </p>
                  <br></br>
                  <h4>
                    Min Temperature
                  </h4>
                  <p>
                    Most plants wont tolerate frost
                  </p>
                  <br></br>
                  <h4>
                    Max Temperature
                  </h4>
                  <p>
                    Most plants wont tolerate temperatures above 45C
                  </p>
                  <br></br>
                  <h4>
                    Water
                  </h4>
                  <p>
                    Most plants like to be soaked in water and then let their roots dry out before watering again
                  </p>
                  <br></br>
                  <h4>
                    Co2
                  </h4>
                  <p>
                    Plants grow well in a standard co2 concentration of 400ppm, but may grow faster in higher concentrations
                  </p>
                  <br></br>
                  <h4>
                    Vpd
                  </h4>
                  <p>
                    VPD or Vapor Pressure Deficit is the amount a plant can transpire (sweat).
                    A good range is 0.2-2.  Lower and there is a risk of disease.  Higher and the plant could dry out.
                  </p>

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
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column
                  lg={16}
                  md={8}
                  sm={4}
                  className="landing-page__tab-content">
                  <br></br>
                  <GreenhouseLight />
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
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column
                  lg={16}
                  md={8}
                  sm={4}
                  className="landing-page__tab-content">
                  <br></br>
                  <GreenhouseHeat />
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
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column
                  lg={16}
                  md={8}
                  sm={4}
                  className="landing-page__tab-content">
                  <br></br>
                  <GreenhouseCool />
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
            <TabPanel>
              <Grid className="tabs-group-content">
                <Column
                  lg={16}
                  md={8}
                  sm={4}
                  className="landing-page__tab-content">
                  <br></br>
                  <GreenhouseIrrigation />
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
    </Grid >
  );
}
