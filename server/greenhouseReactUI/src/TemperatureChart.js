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

  const labels = data.Docs.reduce((labels, obj) => {
    labels.push(obj._id)
    return labels;
  }, []); 

  const readings = data.Docs.reduce((temperature, obj) => {
    temperature.push(obj.temperature)
    return temperature;
  }, []); 

  console.log("Readings: " + JSON.stringify(readings))

  const datax = {
    labels,
    datasets: [
      {
        label: 'Temperature',
        data: readings, 
        backgroundColor: 'blue',
        borderWidth: 1
      },
    ],
  };

  return (
    <div className="card" align="center"> 
      <b>Danger zones: Below 10 or over 40</b> 
      <Bar options={options} data={datax} />
    </div>
  )
}

export default TemperatureChart;