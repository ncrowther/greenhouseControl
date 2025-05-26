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
              const airTemperatureReadings = docs.Docs.reduce(
                (airTemperature, obj) => {
                  var temp = {
                    group: 'airTemperature',
                    date: obj._id,
                    value: obj.airTemperature,
                  };
                  airTemperature.push(temp);
                  return airTemperature;
                },
                []
              );

              const leafTemperatureReadings = docs.Docs.reduce(
                (leafTemperature, obj) => {
                  var temp = {
                    group: 'leafTemperature',
                    date: obj._id,
                    value: obj.leafTemperature,
                  };
                  leafTemperature.push(temp);
                  return leafTemperature;
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

              const vpd_normalization = 10;
              const vpdReadings = docs.Docs.reduce((vpdReadings, obj) => {
                var vpd = {
                  group: 'Vpd',
                  date: obj._id,
                  value: obj.vpd * vpd_normalization,
                };
                vpdReadings.push(vpd);
                return vpdReadings;
              }, []);

              const co2_normalization = 10;
              const co2Readings = docs.Docs.reduce((co2Readings, obj) => {
                var co2 = {
                  group: 'Co2',
                  date: obj._id,
                  value: obj.co2 / co2_normalization,
                };
                co2Readings.push(co2);
                return co2Readings;
              }, []);

              const mergedData = airTemperatureReadings
                .concat(leafTemperatureReadings)
                .concat(humidityReadings)
                .concat(vpdReadings)
                .concat(co2Readings);

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
