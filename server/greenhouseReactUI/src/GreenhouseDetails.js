import React from 'react';
import { Card } from 'primereact/card';

const GreenhouseDetails = ({ data }) => {

  var totalRecords = data.Docs.length - 1
  var timestamp = data.Docs[totalRecords]._id
  var airTemperature = data.Docs[totalRecords].temperature
  var humidity = data.Docs[totalRecords].humidity
  var co2 = data.Docs[totalRecords].co2

  var leafTemperature = airTemperature - 2.8
  var leafVp = 0.61078 * Math.exp(17.27 * leafTemperature / (leafTemperature + 237.3))
  var airVp = 0.61078 * Math.exp(17.27 * airTemperature / (airTemperature + 237.3)) * (humidity / 100)
  var vpd = (leafVp - airVp).toFixed(2)

  const stats = <>
      <b>Last Reading: {timestamp} </b>
      <br /> <br />   
      <b>Total Readings: {data.Docs.length} </b>            
      <br /> <br />
  </>;

    // Set humidity color
    let humidityText = <b style={{ color: 'green' }}>Current Humidity: {humidity} %</b>
    if (humidityText <  35 ) {
      humidityText = <b style={{ color: 'orange' }}>Current Humidity: {humidity} %</b>
    }
    else if (humidityText > 70) {
      humidityText = <b style={{ color: 'blue' }}>Current Humidity: {humidity} %</b>
    }

    // Set air temp color
    let temperatureText = <b style={{ color: 'green' }}>Current Air Temperature: {airTemperature} C </b> 
    if (airTemperature <  20 ) {
      temperatureText = <b style={{ color: 'blue' }}>Current Air Temperature: {airTemperature} C </b> 
    }
    else if (airTemperature > 30) {
      temperatureText = <b style={{ color: 'red' }}>Current Air Temperature: {airTemperature} C </b> 
    }

    // Set co2 color
    let co2Text = <b style={{ color: 'green' }}>Current Co2: {co2} ppm</b> 
    if (co2 <  400 ) {
      temperatureText = <b style={{ color: 'blue' }}>Current Co2: {co2} ppm</b>  
    }
    else if (co2 > 1200) {
      temperatureText = <b style={{ color: 'red' }}>Current Co2: {co2} ppm</b>  
    }    
    
    // Set vpd color
    let vpdText = <b style={{ color: 'green' }}>Current VPD: {vpd} </b> 
    if (vpd <  0.4 ) {
      vpdText = <b style={{ color: 'blue' }}>Current VPD: {vpd} </b> 
    }
    else if (vpd > 1.6) {
      vpdText = <b style={{ color: 'red' }}>Current VPD: {vpd} </b> 
    }

    return (
      <Card style={{ color: 'green' }}>
        {stats}
        {temperatureText}
        <br/> <br/> 
        {humidityText}        
        <br/> <br/> 
        {co2Text}           
        <br/> <br/> 
        {vpdText}
      </Card>
    );
};

export default GreenhouseDetails;