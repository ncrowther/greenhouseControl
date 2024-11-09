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


/**
 * A chart to display humidity data.
 * @param {HumidityChartProps} data - The data for the chart.
 * @returns {JSX.Element} The component.
 */
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

  const labels = data.Docs.reduce((labels, obj) => {
    labels.push(obj._id)
    return labels;
  }, []); 

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