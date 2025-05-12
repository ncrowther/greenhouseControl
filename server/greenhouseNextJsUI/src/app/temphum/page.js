'use client';

import React, { useState, useEffect } from 'react';
import {
  Link,
  DataTableSkeleton,
  Pagination,
  Column,
  Grid,
} from '@carbon/react';
import { Chart } from 'primereact/chart';
const endpoints = require('../endpoints.js')

function TempHumPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});


  useEffect(() => {
    async function getTelemetryData() {

      await fetch(endpoints.dataServiceEndpoint, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((docs) => {
              //setRows(getRowItems(data.Docs));

              const labels = docs.Docs.reduce((labels, obj) => {
                labels.push(obj._id)
                return labels;
              }, []);

              const temperatureReadings = docs.Docs.reduce((temperature, obj) => {
                temperature.push(obj.temperature)
                return temperature;
              }, []);

              const humidityReadings = docs.Docs.reduce((humidity, obj) => {
                humidity.push(obj.humidity)
                return humidity;
              }, []);

              const documentStyle = getComputedStyle(document.documentElement);
              const textColor = documentStyle.getPropertyValue('--text-color');
              const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
              const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
              const data = {
                labels: labels,
                datasets: [
                  {
                    label: 'Degrees C',
                    data: temperatureReadings,
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--blue-500'),
                    tension: 0.4
                  },
                  {
                    label: 'Humidity %',
                    data: humidityReadings,
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--red-500'),
                    tension: 0.4
                  }
                ]
              };
              const options = {
                maintainAspectRatio: false,
                aspectRatio: 0.6,
                plugins: {
                  legend: {
                    labels: {
                      color: textColor
                    }
                  }
                },
                scales: {
                  x: {
                    ticks: {
                      color: textColorSecondary
                    },
                    grid: {
                      color: surfaceBorder
                    }
                  },
                  y: {
                    ticks: {
                      color: textColorSecondary
                    },
                    grid: {
                      color: surfaceBorder
                    }
                  }
                }
              };

              setChartData(data);
              setChartOptions(options);
            }, []);

          }
        })
        .catch((err) => {
          console.log(err);
          return (
            <Grid className="temphum-page">
              Loading
            </Grid>
          );
        });


      setLoading(false);
    }

    getTelemetryData();
  }, []);

  if (loading) {
    return (
      <Grid className="temphum-page">
        Loading
      </Grid>
    );
  }

  if (error) {
    return `Error! ${error}`;
  }

  return (
    <Grid className="temphum-page">
    <div className="card">
      <Chart type="line" data={chartData} options={chartOptions} />
    </div>
    </Grid>
  )

}
export default TempHumPage;
