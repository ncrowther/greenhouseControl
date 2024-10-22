import React from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import { Bar } from 'react-chartjs-2';

const TemperatureChart = ({ data}) => {

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '',
      },
    },
  };

  const labels = data.Docs.reduce((temperature, obj) => {
    temperature.push(obj.timestamp)
    return temperature;
  }, []); // 

  const Readings = data.Docs.reduce((temperature, obj) => {
    temperature.push(obj.temperature)
    return temperature;
  }, []); 

  console.log("Readings: " + JSON.stringify(Readings))

  const datax = {
    labels,
    datasets: [
      {
        label: 'Temperature',
        data: Readings, 
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth: 1
      },
    ],
  };

  return <Bar options={options} data={datax} />;
}

export default TemperatureChart;