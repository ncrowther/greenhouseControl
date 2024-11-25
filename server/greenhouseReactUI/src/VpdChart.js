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
 * @param {VpdChartProps} data - The data for the chart.
 * @returns {JSX.Element} The component.
 */
const VpdChart = ({ data}) => {

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

  const vpdReadings = data.Docs.reduce((vpdReadings, obj) => {

    var leafTemperature = obj.temperature - 2.8
    var leafVp = 0.61078 * Math.exp(17.27 * leafTemperature / (leafTemperature + 237.3))
    var airVp = 0.61078 * Math.exp(17.27 * obj.temperature / (obj.temperature + 237.3)) * (obj.humidity / 100)
    var vpd = (leafVp - airVp).toFixed(2)

    vpdReadings.push(vpd)
    return vpdReadings;
  }, []); 

  const datax = {
    labels,
    datasets: [
      {
        label: 'VPD',
        data: vpdReadings, 
        backgroundColor: 'rgba(30, 262, 135, 0.5)',
        borderWidth: 1
      },
    ],
  };

  return (
    <div className="card" align="center"> 
      <b>Danger zones: Below 0.4 or over 1.6</b> 
      <Bar options={options} data={datax} />
    </div>
  )

}

export default VpdChart;