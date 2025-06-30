'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Loading, Checkbox, CheckboxGroup } from '@carbon/react';
import { LineChart } from '@carbon/charts-react';
import options1 from './options.js';
import '@carbon/charts-react/styles.css';
const endpoints = require('../endpoints.js');

function TempHumPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [chartData, setChartData] = useState([]);
  const [airTemperatureData, setAirTemperatureData] = useState([]);
  const [leafTemperatureData, setLeafTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [vpdData, setVpdData] = useState([]);
  const [co2Data, setCo2Data] = useState([]);
  const [luxData, setLuxData] = useState([]);
  const [chartOptions, setChartOptions] = useState(options1);
  const [leafTemperatureChecked, setLeafTemperatureChecked] = useState(false);
  const [airTemperatureChecked, setAirTemperatureChecked] = useState(false);
  const [humidityChecked, setHumidityChecked] = useState(false);
  const [vpdChecked, setVpdChecked] = useState(false);
  const [co2Checked, setCo2Checked] = useState(false);
  const [luxChecked, setLuxChecked] = useState(false);

  const refreshChart = (
    airChecked,
    leafChecked,
    humidityChecked,
    vpdChecked,
    co2Checked,
    luxChecked
  ) => {
    //this will reload the page with the new selection
    let data = [];

    if (airChecked) {
      data = data.concat(airTemperatureData);
    }

    if (leafChecked) {
      data = data.concat(leafTemperatureData);
    }

    if (humidityChecked) {
      data = data.concat(humidityData);
    }

    if (vpdChecked) {
      data = data.concat(vpdData);
    }

    if (co2Checked) {
      data = data.concat(co2Data);
    }

    if (luxChecked) {
      data = data.concat(luxData);
    }

    setChartData(data);

    setAirTemperatureChecked(airChecked);
    setLeafTemperatureChecked(leafChecked);
    setHumidityChecked(humidityChecked);
    setVpdChecked(vpdChecked);
    setCo2Checked(co2Checked);
    setLuxChecked(luxChecked);
  };

  const getRowItems = (rows) =>
    rows
      .slice(0)
      .reverse()
      .map((row) => ({
        id: row._id,
        ...row,
      }));

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
              setAirTemperatureData(airTemperatureReadings);

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
              setLeafTemperatureData(leafTemperatureReadings);

              const humidityReadings = docs.Docs.reduce((humidity, obj) => {
                var hum = {
                  group: 'Humidity',
                  date: obj._id,
                  value: obj.humidity,
                };
                humidity.push(hum);
                return humidity;
              }, []);
              setHumidityData(humidityReadings);

              const vpdReadings = docs.Docs.reduce((vpdReadings, obj) => {
                var vpd = {
                  group: 'Vpd',
                  date: obj._id,
                  value: obj.vpd,
                };
                vpdReadings.push(vpd);
                return vpdReadings;
              }, []);
              setVpdData(vpdReadings);

              const co2Readings = docs.Docs.reduce((co2Readings, obj) => {
                var co2 = {
                  group: 'Co2',
                  date: obj._id,
                  value: obj.co2,
                };
                co2Readings.push(co2);
                return co2Readings;
              }, []);
              setCo2Data(co2Readings);

              const luxReadings = docs.Docs.reduce((luxReadings, obj) => {
                let lux = 0;
                if (obj.lux > 0) {
                  lux = Math.sqrt(obj.lux / 4);
                  // lux = obj.lux;
                }
                var luxPlot = {
                  group: 'lux',
                  date: obj._id,
                  value: lux,
                };
                luxReadings.push(luxPlot);
                return luxReadings;
              }, []);
              setLuxData(luxReadings);

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
            refreshChart(
              checked,
              leafTemperatureChecked,
              humidityChecked,
              vpdChecked,
              co2Checked,
              luxChecked
            )
          }
        />
        <Checkbox
          id="leafTemperature"
          labelText="Leaf Temperature"
          checked={leafTemperatureChecked}
          onChange={(_, { checked }) =>
            refreshChart(
              airTemperatureChecked,
              checked,
              humidityChecked,
              vpdChecked,
              co2Checked,
              luxChecked
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
              leafTemperatureChecked,
              checked,
              vpdChecked,
              co2Checked,
              luxChecked
            )
          }
        />
        <Checkbox
          id="Vpd"
          labelText="Vpd"
          checked={vpdChecked}
          onChange={(_, { checked }) =>
            refreshChart(
              airTemperatureChecked,
              leafTemperatureChecked,
              humidityChecked,
              checked,
              co2Checked,
              luxChecked
            )
          }
        />
        <Checkbox
          id="Co2"
          labelText="Co2"
          checked={co2Checked}
          onChange={(_, { checked }) =>
            refreshChart(
              airTemperatureChecked,
              leafTemperatureChecked,
              humidityChecked,
              vpdChecked,
              checked,
              luxChecked
            )
          }
        />
        <Checkbox
          id="Light"
          labelText="Light"
          checked={luxChecked}
          onChange={(_, { checked }) =>
            refreshChart(
              airTemperatureChecked,
              leafTemperatureChecked,
              humidityChecked,
              vpdChecked,
              co2Checked,
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
export default TempHumPage;
