import React from 'react';
import { Card } from 'primereact/card';

const GreenhouseDetails = ({ data }) => {

  var totalRecords = data.Docs.length-1
  var timestamp = data.Docs[totalRecords].timestamp
  var temperature = data.Docs[totalRecords].temperature
  var humidity = data.Docs[totalRecords].humidity

  console.log("totalCount: " + totalRecords)
  console.log("temperature: " + temperature)

  const content = <>
      <b>Last Reading: {timestamp} </b>
      <br /> <br />   
      <b>Total Readings: {totalRecords} </b>
      <br /> <br />             
      <b>Current Temperature: {temperature} C</b>
      <br /> <br />
      <b>Current Humidity: {humidity} %</b>
  </>;


    return (
      <Card style={{ color: 'green' }}>
        {content}
      </Card>
    );
};

export default GreenhouseDetails;