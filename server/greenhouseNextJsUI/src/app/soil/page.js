'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Loading, Checkbox, CheckboxGroup } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import options1 from './options.js';
import '@carbon/charts-react/styles.css';
const endpoints = require('../endpoints.js');

function ChartPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [chartData, setChartData] = useState([]);
  const [soilTemperatureData, setsoilTemperatureData] = useState([]);
  const [soilMoistureData, setsoilMoistureData] = useState([]);
  const [ionsData, setionsData] = useState([]);
  const [chartOptions, setChartOptions] = useState(options1);
  const [soilTemperatureChecked, setsoilTemperatureChecked] = useState(false);
  const [soilMoistureChecked, setsoilMoistureChecked] = useState(false);
  const [ionsChecked, setionsChecked] = useState(false);

  const refreshChart = (
    soilTemperatureChecked,
    soilMoistureChecked,
    ionsChecked
  ) => {
    //this will reload the page with the new selection
    let data = [];

    if (soilTemperatureChecked) {
      data = data.concat(soilTemperatureData);
    }

    if (soilMoistureChecked) {
      data = data.concat(soilMoistureData);
    }

    if (ionsChecked) {
      data = data.concat(ionsData);
    }

    setChartData(data);

    setsoilTemperatureChecked(soilTemperatureChecked);
    setsoilMoistureChecked(soilMoistureChecked);
    setionsChecked(ionsChecked);
  };

  useEffect(() => {
    async function getTelemetryData() {
      await fetch(endpoints.sensecapSoilEndpoint, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: endpoints.sensecapAuth,
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((docs) => {
              let temperaturePos = 0;
              let soilMoisturePos = 1;
              let ionsPos = 2;

              let sensorCodes = docs.data.list[0];

              // Map sensor codes to positions in the data array:
              const temperatureSensorCode = 4102; //4165;
              const humidiySensorCode = 4103; //4166;
              const ionsSensorCode = 4108; //4167;

              for (let i = 0; i < sensorCodes.length; i++) {
                let sensorCode = sensorCodes[i];

                if (sensorCode[1] == temperatureSensorCode) {
                  temperaturePos = i;
                }

                if (sensorCode[1] == humidiySensorCode) {
                  soilMoisturePos = i;
                }

                if (sensorCode[1] == ionsSensorCode) {
                  ionsPos = i;
                }
              }

              //we have data
              //now parse it into the format needed for the chart

              const ionsReadings = docs.data.list[1][ionsPos].reduce(
                (ionsReadings, obj) => {
                  console.log('******ions*********' + JSON.stringify(obj));

                  var ions = {
                    group: 'ions',
                    date: obj[1],
                    value: obj[0],
                  };
                  ionsReadings.push(ions);
                  return ionsReadings;
                },
                []
              );
              setionsData(ionsReadings);

              const soilMoistureReadings = docs.data.list[1][
                soilMoisturePos
              ].reduce((soilMoisture, obj) => {
                console.log(
                  '********Soil Moisture******' + JSON.stringify(obj)
                );

                var soilm = {
                  group: 'soilMoisture',
                  date: obj[1],
                  value: obj[0],
                };
                soilMoisture.push(soilm);
                return soilMoisture;
              }, []);
              setsoilMoistureData(soilMoistureReadings);

              const soilTemperatureReadings = docs.data.list[1][
                temperaturePos
              ].reduce((soilTemperature, obj) => {
                console.log('******soil C*********' + JSON.stringify(obj));

                var temp = {
                  group: 'soilTemperature',
                  date: obj[1],
                  value: obj[0],
                };
                soilTemperature.push(temp);
                return soilTemperature;
              }, []);
              setsoilTemperatureData(soilTemperatureReadings);

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
      <CheckboxGroup invalidText="Invalid" warnText="Warning">
        <Checkbox
          id="soilTemperature"
          labelText="soil Temperature"
          checked={soilTemperatureChecked}
          onChange={(_, { checked }) =>
            refreshChart(checked, soilMoistureChecked, ionsChecked)
          }
        />

        <Checkbox
          id="soilMoisture"
          labelText="soilMoisture"
          checked={soilMoistureChecked}
          onChange={(_, { checked }) =>
            refreshChart(soilTemperatureChecked, checked, ionsChecked)
          }
        />

        <Checkbox
          id="ions"
          labelText="ions"
          checked={ionsChecked}
          onChange={(_, { checked }) =>
            refreshChart(soilTemperatureChecked, soilMoistureChecked, checked)
          }
        />
      </CheckboxGroup>

      <Grid>
        <LineChart data={chartData} options={chartOptions} />
      </Grid>
    </Grid>
  );
}
export default ChartPage;
