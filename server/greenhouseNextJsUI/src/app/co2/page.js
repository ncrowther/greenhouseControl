'use client';


import React, { useState, useEffect } from 'react';
import { Grid } from '@carbon/react';
import { Chart } from 'primereact/chart';
const endpoints = require('../endpoints.js')

function Co2Page() {
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

              const labels = docs.Docs.reduce((labels, obj) => {
                labels.push(obj._id)
                return labels;
              }, []);

              const co2Readings = docs.Docs.reduce((co2Readings, obj) => {
                var co2 = obj.co2
                co2Readings.push(co2)
                return co2Readings;
              }, []);

              const documentStyle = getComputedStyle(document.documentElement);
              const textColor = documentStyle.getPropertyValue('--text-color');
              const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
              const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
              const data = {
                labels: labels,

                datasets: [
                  {
                    label: 'Co2. Daytime optimal for plants: 600 - 1200 ppm',
                    data: co2Readings,
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--blue-500'),
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
      <Grid className="co2-page">
        Loading
      </Grid>
    );
  }

  if (error) {
    return `Error! ${error}`;
  }

  return (
    <div className="co2-page">
      <Chart type="line" data={chartData} options={chartOptions} />
    </div>
  )

}
export default Co2Page;
