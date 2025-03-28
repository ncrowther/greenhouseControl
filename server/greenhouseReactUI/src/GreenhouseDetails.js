import React from 'react';
import { Chip } from 'primereact/chip';
import { MdOutlineAccessTime } from "react-icons/md";
import { FaTemperatureEmpty  } from "react-icons/fa6";
import { WiHumidity } from "react-icons/wi"
import { MdOutlineCo2 } from "react-icons/md";
import { MdEnergySavingsLeaf } from "react-icons/md";

const GreenhouseDetails = ({ data }) => {

  var totalRecords = data.Docs.length - 1
  var timestamp = data.Docs[totalRecords]._id
  timestamp = timestamp.substring(0, 16);
  var airTemperature = data.Docs[totalRecords].temperature
  var humidity = data.Docs[totalRecords].humidity
  var co2 = data.Docs[totalRecords].co2
  var vpd = data.Docs[totalRecords].vpd

  //var leafTemperature = airTemperature - 2.8
  //var leafVp = 0.61078 * Math.exp(17.27 * leafTemperature / (leafTemperature + 237.3))
  //var airVp = 0.61078 * Math.exp(17.27 * airTemperature / (airTemperature + 237.3)) * (humidity / 100)
  //var vpd = (leafVp - airVp).toFixed(2)

  const timeText = <b style={{ color: 'green' }}>&nbsp;{timestamp} </b>

  // Set humidity color
  let humidityText = <b style={{ color: 'green' }}>&nbsp;{humidity} %</b>
  if (humidityText < 35) {
    humidityText = <b style={{ color: 'red' }}>&nbsp;{humidity} %</b>
  }
  else if (humidityText > 70) {
    humidityText = <b style={{ color: 'blue' }}>&nbsp;{humidity} %</b>
  }

  // Set air temp color
  let temperatureText = <b style={{ color: 'green' }}>&nbsp;{airTemperature} C </b>
  if (airTemperature < 20) {
    temperatureText = <b style={{ color: 'blue' }}>&nbsp;{airTemperature} C </b>
  }
  else if (airTemperature > 30) {
    temperatureText = <b style={{ color: 'red' }}>&nbsp;{airTemperature} C </b>
  }

  // Set co2 color
  let co2Text = <b style={{ color: 'green' }}>&nbsp;{co2} ppm</b>
  if (co2 < 400) {
    co2Text = <b style={{ color: 'blue' }}>&nbsp;{co2} ppm</b>
  }
  else if (co2 > 1200) {
    co2Text = <b style={{ color: 'red' }}>&nbsp;{co2} ppm</b>
  }

  // Set vpd color
  let vpdText = <b style={{ color: 'green' }}>&nbsp;{vpd} </b>
  if (vpd < 0.4) {
    vpdText = <b style={{ color: 'blue' }}>&nbsp;{vpd} </b>
  }
  else if (vpd > 1.6) {
    vpdText = <b style={{ color: 'red' }}>&nbsp;{vpd} </b>
  }

  return (
    <div className="card flex flex-wrap gap-2">
      <Chip key="1" label={timeText} icon={MdOutlineAccessTime}/> <br></br>
      <Chip key="2" label={temperatureText} icon={FaTemperatureEmpty }/> <br></br>
      <Chip key="3" label={humidityText} icon={WiHumidity}/> <br></br>
      <Chip key="4" label={co2Text} icon={MdOutlineCo2}/> <br></br>
      <Chip key="5" label={vpdText} icon={MdEnergySavingsLeaf}/>
    </div>
  );
};

export default GreenhouseDetails;