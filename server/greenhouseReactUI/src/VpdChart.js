import React, { useState, useEffect } from 'react';
import { Chart } from 'primereact/chart';

/**
 * A chart to display humidity data.
 * @param {Co2ChartProps} data - The data for the chart.
 * @returns {JSX.Element} The component.
 */
const VpdChart = ({ data}) => {

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
          label: 'Virtual Pressure Deficit.  Plant stress below 0.4 or over 1.6',
          data: vpdReadings,
          fill: false,
          borderColor: documentStyle.getPropertyValue('--green-500'),
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

export default VpdChart;