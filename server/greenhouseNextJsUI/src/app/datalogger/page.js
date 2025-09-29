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
  const [airTemperatureData, setAirTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [co2Data, setCo2Data] = useState([]);
  const [chartOptions, setChartOptions] = useState(options1);
  const [airTemperatureChecked, setAirTemperatureChecked] = useState(false);
  const [humidityChecked, setHumidityChecked] = useState(false);
  const [co2Checked, setCo2Checked] = useState(false);

  const refreshChart = (airChecked, humidityChecked, co2Checked) => {
    //this will reload the page with the new selection
    let data = [];

    if (airChecked) {
      data = data.concat(airTemperatureData);
    }

    if (humidityChecked) {
      data = data.concat(humidityData);
    }

    if (co2Checked) {
      data = data.concat(co2Data);
    }

    setChartData(data);

    setAirTemperatureChecked(airChecked);
    setHumidityChecked(humidityChecked);
    setCo2Checked(co2Checked);
  };

  useEffect(() => {
    async function getTelemetryData() {
      await fetch(endpoints.sensecapDatalogEndpoint, {
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
              let humidityPos = 1;
              let co2Pos = 2;

              let sensorCodes = docs.data.list[0];

              // Map sensor codes to positions in the data array:
              const temperatureSensorCode = 4165;
              const humidiySensorCode = 4166;
              const co2SensorCode = 4167;

              for (let i = 0; i < sensorCodes.length; i++) {
                let sensorCode = sensorCodes[i];

                if (sensorCode[1] == temperatureSensorCode) {
                  temperaturePos = i;
                }

                if (sensorCode[1] == humidiySensorCode) {
                  humidityPos = i;
                }

                if (sensorCode[1] == co2SensorCode) {
                  co2Pos = i;
                }
              }

              //we have data
              //now parse it into the format needed for the chart

              const co2Readings = docs.data.list[1][co2Pos].reduce(
                (co2Readings, obj) => {
                  console.log('******co2*********' + JSON.stringify(obj));

                  var co2 = {
                    group: 'Co2',
                    date: obj[1],
                    value: obj[0],
                  };
                  co2Readings.push(co2);
                  return co2Readings;
                },
                []
              );
              setCo2Data(co2Readings);

              const humidityReadings = docs.data.list[1][humidityPos].reduce(
                (humidity, obj) => {
                  console.log('*********hum******' + JSON.stringify(obj));

                  var hum = {
                    group: 'Humidity',
                    date: obj[1],
                    value: obj[0],
                  };
                  humidity.push(hum);
                  return humidity;
                },
                []
              );
              setHumidityData(humidityReadings);

              const airTemperatureReadings = docs.data.list[1][
                temperaturePos
              ].reduce((airTemperature, obj) => {
                console.log('******airC*********' + JSON.stringify(obj));

                var temp = {
                  group: 'airTemperature',
                  date: obj[1],
                  value: obj[0],
                };
                airTemperature.push(temp);
                return airTemperature;
              }, []);
              setAirTemperatureData(airTemperatureReadings);

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
          id="airTemperature"
          labelText="Air Temperature"
          checked={airTemperatureChecked}
          onChange={(_, { checked }) =>
            refreshChart(checked, humidityChecked, co2Checked)
          }
        />

        <Checkbox
          id="humidity"
          labelText="Humidity"
          checked={humidityChecked}
          onChange={(_, { checked }) =>
            refreshChart(airTemperatureChecked, checked, co2Checked)
          }
        />

        <Checkbox
          id="Co2"
          labelText="Co2"
          checked={co2Checked}
          onChange={(_, { checked }) =>
            refreshChart(airTemperatureChecked, humidityChecked, checked)
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
