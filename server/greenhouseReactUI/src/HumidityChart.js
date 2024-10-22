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

const HumidityChart = ({ data}) => {

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

  const labels = data.Docs.reduce((humidity, obj) => {
    humidity.push(obj.timestamp)
    return humidity;
  }, []); // 

  const Readings = data.Docs.reduce((humidity, obj) => {
    humidity.push(obj.humidity)
    return humidity;
  }, []); 

  console.log("Readings: " + JSON.stringify(Readings))

  const datax = {
    labels,
    datasets: [
      {
        label: 'Humidity',
        data: Readings, 
        backgroundColor: 'rgba(30, 262, 135, 0.5)',
        borderWidth: 1
      },
    ],
  };

  return <Bar options={options} data={datax} />;
}

export default HumidityChart;