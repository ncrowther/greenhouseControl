'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Loading } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import options1 from './options.js';
import '@carbon/charts-react/styles.css';
const endpoints = require('../endpoints.js');

function LuxPage() {
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
              const luxReadings = docs.Docs.reduce((luxReadings, obj) => {
                let lux = 0;
                if (obj.lux > 0) {
                  lux = obj.lux;
                }
                var luxPlot = {
                  group: 'lux',
                  date: obj._id,
                  value: lux,
                };

                luxReadings.push(luxPlot);
                return luxReadings;
              }, []);

              setChartData(luxReadings);
              setChartOptions(options1);
            }, []);
          }
        })
        .catch((err) => {
          console.log(err);
          return <Grid>{err}</Grid>;
        });

      setLoading(false);
    }

    getTelemetryData();
  }, []);

  if (loading) {
    return <Loading active className="some-class" description="Loading" />;
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
export default LuxPage;
