'use client';

import React, { useState, useEffect } from 'react';
import { Grid } from '@carbon/react';
//import { Chart } from 'primereact/chart';
import { LineChart } from '@carbon/charts-react';
import options1 from './options.js';
import '@carbon/charts-react/styles.css';
const endpoints = require('../endpoints.js');

function Co2Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [chartData, setChartData] = useState([]);
  const [chartOptions, setChartOptions] = useState(options1);

  useEffect(() => {
    async function getTelemetryData() {
      await fetch(endpoints.dataServiceEndpoint, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((docs) => {
              const vpdReadings = docs.Docs.reduce((vpdReadings, obj) => {
                var vpd = { group: 'VPD', date: obj._id, value: obj.vpd };
                vpdReadings.push(vpd);
                return vpdReadings;
              }, []);

              const co2Readings = docs.Docs.reduce((co2Readings, obj) => {
                var co2 = { group: 'Co2', date: obj._id, value: obj.co2 };
                co2Readings.push(co2);
                return co2Readings;
              }, []);

              console.log(JSON.stringify(co2Readings));

              setChartData(co2Readings);
              setChartOptions(options1);
            }, []);
          }
        })
        .catch((err) => {
          console.log(err);
          return <Grid>Loading</Grid>;
        });

      setLoading(false);
    }

    getTelemetryData();
  }, []);

  if (loading) {
    return <Grid>Loading</Grid>;
  }

  if (error) {
    return <Grid>{error};</Grid>;
  }

  return (
    <Grid>
      <LineChart data={chartData} options={chartOptions} />
    </Grid>
  );
}
export default Co2Page;
