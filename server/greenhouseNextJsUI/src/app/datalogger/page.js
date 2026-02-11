'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Loading, Checkbox, CheckboxGroup } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import options1 from './options.js';
import '@carbon/charts-react/styles.css';
const endpoints = require('../config/endpoints.js');

// Assisted by watsonx Code Assistant

function calculateVPD(airTemperature, humidity) {
  // Calculate leaf temperature assuming it's 1 degrees higher than air temperature
  const leafTemperature = airTemperature;
  const esAir =
    0.61078 * Math.exp((17.27 * airTemperature) / (airTemperature + 237.3));
  const esLeaf =
    0.61078 * Math.exp((17.27 * leafTemperature) / (leafTemperature + 237.3));
  const e = (humidity / 100) * esAir;
  const vpd = esLeaf - e;

  return vpd;
}

function ChartPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [chartData, setChartData] = useState([]);
  const [airTemperatureData, setAirTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [pressureData, setPressureData] = useState([]);
  const [vocData, setvocData] = useState([]);
  const [vpdData, setVpdData] = useState([]);
  const [chartOptions, setChartOptions] = useState(options1);
  const [airTemperatureChecked, setAirTemperatureChecked] = useState(true);
  const [humidityChecked, setHumidityChecked] = useState(true);
  const [vpdChecked, setVpdChecked] = useState(true);
  const [vocChecked, setvocChecked] = useState(false);
  const [pressureChecked, setPressureChecked] = useState(false);

  const refreshChart = (
    airChecked,
    humidityChecked,
    vpdChecked,
    vocChecked,
    pressureChecked
  ) => {
    //this will reload the page with the new selection
    let data = [];

    if (airChecked) {
      data = data.concat(airTemperatureData);
    }

    if (humidityChecked) {
      data = data.concat(humidityData);
    }

    if (vpdChecked) {
      data = data.concat(vpdData);
    }

    if (vocChecked) {
      data = data.concat(vocData);
    }

    if (pressureChecked) {
      data = data.concat(pressureData);
    }

    setChartData(data);

    setAirTemperatureChecked(airChecked);
    setHumidityChecked(humidityChecked);
    setVpdChecked(vpdChecked);
    setvocChecked(vocChecked);
    setPressureChecked(pressureChecked);
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
              let vocPos = 2;
              let pressurePos = 3;

              let sensorCodes = docs.data.list[0];

              // Map sensor codes to positions in the data array:
              const temperatureSensorCode = 4165;
              const pressureSensorCode = 4166;
              const humiditySensorCode = 4167;
              const airQualityCode = 4168;

              for (let i = 0; i < sensorCodes.length; i++) {
                let sensorCode = sensorCodes[i];

                if (sensorCode[1] == temperatureSensorCode) {
                  temperaturePos = i;
                }

                if (sensorCode[1] == humiditySensorCode) {
                  humidityPos = i;
                }

                if (sensorCode[1] == airQualityCode) {
                  vocPos = i;
                }
                if (sensorCode[1] == pressureSensorCode) {
                  pressurePos = i;
                }
              }

              //we have data
              //now parse it into the format needed for the chart

              const vocReadings = docs.data.list[1][vocPos].reduce(
                (vocReadings, obj) => {
                  console.log('******voc*********' + JSON.stringify(obj));

                  var voc = {
                    group: 'Voc',
                    date: obj[1],
                    value: obj[0] / 10, // divide by 10 to correct scale error
                  };
                  vocReadings.push(voc);
                  return vocReadings;
                },
                []
              );
              setvocData(vocReadings);

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
                  group: 'AirTemperature',
                  date: obj[1],
                  value: obj[0],
                };
                airTemperature.push(temp);
                return airTemperature;
              }, []);
              setAirTemperatureData(airTemperatureReadings);

              var i = 0;
              // VPD is calculated from air temperature and humidity
              const vpdReadings = docs.data.list[1][temperaturePos].reduce(
                (vpd, obj) => {
                  const airTemperature = obj[0];
                  const humidity = humidityReadings[i].value;

                  console.log('******airC*********' + airTemperature);
                  console.log('******Hum*********' + humidity);

                  const vpdCalc = calculateVPD(airTemperature, humidity);

                  console.log('******Vpd*********' + vpdCalc);

                  var temp = {
                    group: 'VPD',
                    date: obj[1],
                    value: vpdCalc,
                  };
                  vpd.push(temp);
                  i++;
                  return vpd;
                },
                []
              );
              setVpdData(vpdReadings);

              const pressureReadings = docs.data.list[1][pressurePos].reduce(
                (pressure, obj) => {
                  console.log('********Pressure*******' + JSON.stringify(obj));

                  var hum = {
                    group: 'Pressure',
                    date: obj[1],
                    value: obj[0],
                  };
                  pressure.push(hum);
                  return pressure;
                },
                []
              );
              setPressureData(pressureReadings);

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

  // Initialize chart when data is loaded
  useEffect(() => {
    if (
      airTemperatureData.length > 0 ||
      humidityData.length > 0 ||
      vpdData.length > 0 ||
      vocData.length > 0 ||
      pressureData.length > 0
    ) {
      refreshChart(
        airTemperatureChecked,
        humidityChecked,
        vpdChecked,
        vocChecked,
        pressureChecked
      );
    }
  }, [airTemperatureData, humidityData, vpdData, vocData, pressureData]);

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
            refreshChart(
              checked,
              humidityChecked,
              vpdChecked,
              vocChecked,
              pressureChecked
            )
          }
        />

        <Checkbox
          id="humidity"
          labelText="Humidity"
          checked={humidityChecked}
          onChange={(_, { checked }) =>
            refreshChart(
              airTemperatureChecked,
              checked,
              vpdChecked,
              vocChecked,
              pressureChecked
            )
          }
        />

        <Checkbox
          id="vpd"
          labelText="VPD"
          checked={vpdChecked}
          onChange={(_, { checked }) =>
            refreshChart(
              airTemperatureChecked,
              humidityChecked,
              checked,
              vocChecked,
              pressureChecked
            )
          }
        />

        <Checkbox
          id="voc"
          labelText="Voc"
          checked={vocChecked}
          onChange={(_, { checked }) =>
            refreshChart(
              airTemperatureChecked,
              humidityChecked,
              vpdChecked,
              checked,
              pressureChecked
            )
          }
        />

        <Checkbox
          id="pressure"
          labelText="Pressure"
          checked={pressureChecked}
          onChange={(_, { checked }) =>
            refreshChart(
              airTemperatureChecked,
              humidityChecked,
              vpdChecked,
              vocChecked,
              checked
            )
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
