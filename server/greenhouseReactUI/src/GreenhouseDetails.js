import React from 'react';
import { Card } from 'primereact/card';
import { Chip } from 'primereact/chip';
import { FaTemperatureHigh } from "react-icons/fa6";

const GreenhouseDetails = ({ data }) => {

  var totalRecords = data.Docs.length - 1
  var timestamp = data.Docs[totalRecords]._id
  timestamp = timestamp.substring(0, 16);
  var airTemperature = data.Docs[totalRecords].temperature
  var humidity = data.Docs[totalRecords].humidity
  var co2 = data.Docs[totalRecords].co2

  var leafTemperature = airTemperature - 2.8
  var leafVp = 0.61078 * Math.exp(17.27 * leafTemperature / (leafTemperature + 237.3))
  var airVp = 0.61078 * Math.exp(17.27 * airTemperature / (airTemperature + 237.3)) * (humidity / 100)
  var vpd = (leafVp - airVp).toFixed(2)

  const timeText = <b> Time: {timestamp} </b>

  // Set humidity color
  let humidityText = <b style={{ color: 'green' }}>Humidity: {humidity} %</b>
  if (humidityText < 35) {
    humidityText = <b style={{ color: 'red' }}>Humidity: {humidity} %</b>
  }
  else if (humidityText > 70) {
    humidityText = <b style={{ color: 'blue' }}>Humidity: {humidity} %</b>
  }

  // Set air temp color
  let temperatureText = <b style={{ color: 'green' }}>Temp: {airTemperature} C </b>
  if (airTemperature < 20) {
    temperatureText = <b style={{ color: 'blue' }}>Temp: {airTemperature} C </b>
  }
  else if (airTemperature > 30) {
    temperatureText = <b style={{ color: 'red' }}>Temp: {airTemperature} C </b>
  }

  // Set co2 color
  let co2Text = <b style={{ color: 'green' }}>Co2: {co2} ppm</b>
  if (co2 < 400) {
    co2Text = <b style={{ color: 'blue' }}>Co2: {co2} ppm</b>
  }
  else if (co2 > 1200) {
    co2Text = <b style={{ color: 'red' }}>Co2: {co2} ppm</b>
  }

  // Set vpd color
  let vpdText = <b style={{ color: 'green' }}>VPD: {vpd} </b>
  if (vpd < 0.4) {
    vpdText = <b style={{ color: 'blue' }}>VPD: {vpd} </b>
  }
  else if (vpd > 1.6) {
    vpdText = <b style={{ color: 'red' }}>VPD: {vpd} </b>
  }

  return (


    <Card>
      <Chip label={timeText} /> <br></br>
      <Chip label={temperatureText} image={FaTemperatureHigh}/> <br></br>
      <Chip label={humidityText} /> <br></br>
      <Chip label={co2Text} /> <br></br>
      <Chip label={vpdText} />
    </Card>
  );
};

export default GreenhouseDetails;