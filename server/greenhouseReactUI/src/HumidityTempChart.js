import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';

export default function HumidityTempChart({ data }) {

  const labels = data.Docs.reduce((labels, obj) => {
    labels.push(obj._id)
    return labels;
  }, []);   

  const temperatureReadings = data.Docs.reduce((temperature, obj) => {
    temperature.push(obj.temperature)
    return temperature;
  }, []);

  const humidityReadings = data.Docs.reduce((humidity, obj) => {
    humidity.push(obj.humidity)
    return humidity;
  }, []);

  const co2Readings = data.Docs.reduce((co2, obj) => {
    co2.push(obj.co2)
    return co2;
  }, []);  

  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    const data = {
      labels: labels, 
      datasets: [
        {
          label: 'Temperature',
          data: temperatureReadings,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--blue-500'),
          tension: 0.4
        },
        {
          label: 'Humidity',
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

  return (
    <div className="card">
      <Chart type="line" data={chartData} options={chartOptions} />
    </div>
  )

}