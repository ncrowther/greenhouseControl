'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Loading } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import options1 from './options.js';
import '@carbon/charts-react/styles.css';
const endpoints = require('../endpoints.js');

function TempHumPage() {
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
              const temperatureReadings = docs.Docs.reduce(
                (temperature, obj) => {
                  var temp = {
                    group: 'Temperature',
                    date: obj._id,
                    value: obj.temperature,
                  };
                  temperature.push(temp);
                  return temperature;
                },
                []
              );

              const humidityReadings = docs.Docs.reduce((humidity, obj) => {
                var hum = {
                  group: 'Humidity',
                  date: obj._id,
                  value: obj.humidity,
                };
                humidity.push(hum);
                return humidity;
              }, []);

              const mergedData = temperatureReadings.concat(humidityReadings);

              setChartData(mergedData);
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
export default TempHumPage;
