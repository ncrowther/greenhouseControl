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
 * @param {Co2ChartProps} data - The data for the chart.
 * @returns {JSX.Element} The component.
 */
const Co2Chart = ({ data}) => {

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

  const Readings = data.Docs.reduce((co2, obj) => {
    co2.push(obj.co2)
    return co2;
  }, []);    

  console.log("Readings: " + JSON.stringify(Readings))

  const datax = {
    labels,
    datasets: [
      {
        label: 'Co2',
        data: Readings, 
        backgroundColor: '--gray-500',
        borderWidth: 1
      },
    ],
  };

  return (
    <div className="card" align="center"> 
      <b>Daytime optimal for plants: 600 - 1200 ppm</b> 
      <Bar options={options} data={datax} />
    </div>
  )  
}

export default Co2Chart;