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
            <Tab>Status</Tab>
            <Tab>Light</Tab>       
            <Tab>Heat</Tab>   
            <Tab>Cool</Tab>           
            <Tab>Irrigation</Tab>                                                        
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
                  <h3 className="landing-page__subheading">Greenhouse</h3>
                  <p className="landing-page__p">
                    Control your climate
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
                  <h3 className="landing-page__subheading">Latest</h3>           
                  <br></br>              
                  <GreenhouseDetails />
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
              </Grid>
            </TabPanel>                                
          </TabPanels>
        </Tabs>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__r3">
        <InfoSection heading="The Principles">

          <InfoCard
            heading="Climate"
            body="Plants tolerate a wide temperature and humidity range. Most plants wont tolerate frost or temperatures above 45C"
            icon={() => <FaTemperatureEmpty size={32} />}
          />
          <InfoCard
            heading="Co2"
            body="Plants grow well in co2 of 400ppm, but some may grow faster in higher concentrations"
            icon={() => <MdOutlineCo2 size={32} />}
          />
          <InfoCard
            heading="Vpd"
            body="VPD or Vapor Pressure Deficit is the amount a plant can transpire (sweat).  A good range is 0.2-2.  Any lower and the plant will grow slowly and risks disease.  Any higher and the plant could dry out"
            icon={() => <MdEnergySavingsLeaf size={32} />}
          />          
        </InfoSection>
      </Column>
    </Grid>
  );
}
