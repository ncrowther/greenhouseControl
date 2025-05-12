'use client';

import React, { useState, useEffect } from 'react';
import { Grid } from '@carbon/react';
import { Chip } from 'primereact/chip';
import { MdOutlineAccessTime } from "react-icons/md";
import { FaTemperatureEmpty } from "react-icons/fa6";
import { WiHumidity } from "react-icons/wi"
import { MdOutlineCo2 } from "react-icons/md";
import { MdEnergySavingsLeaf } from "react-icons/md";
const endpoints = require('../endpoints.js')

function StatusPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [timestamp, setTimestamp] = useState();
  const [airTemp, setAirTemp] = useState();
  const [humidity, setHumidity] = useState();
  const [co2, setCo2] = useState();
  const [vpd, setVpd] = useState();

  useEffect(() => {
    async function getTelemetryData() {

      await fetch(endpoints.dataServiceEndpoint, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((data) => {

              if (data.Docs && data.Docs.length > 0) {

                var totalRecords = data.Docs.length - 1
                var ts = data.Docs[totalRecords]._id
                setTimestamp(ts.substring(0, 16))
                setAirTemp(data.Docs[totalRecords].temperature)
                setHumidity(data.Docs[totalRecords].humidity)
                setCo2(data.Docs[totalRecords].co2)
                setVpd(data.Docs[totalRecords].vpd)
              }

            }, []);

          }
        })
        .catch((err) => {
          console.log(err);
          return (
            <Grid className="status-page">
              Loading
            </Grid>
          );
        });


      setLoading(false);
    }

    getTelemetryData();
  }, []);

  if (loading) {
    return (
      <Grid className="status-page">
        Loading
      </Grid>
    );
  }

  if (error) {
    return `Error! ${error}`;
  }

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
  let temperatureText = <b style={{ color: 'green' }}>&nbsp;{airTemp} C </b>
  if (airTemp < 20) {
    temperatureText = <b style={{ color: 'blue' }}>&nbsp;{airTemp} C </b>
  }
  else if (airTemp > 30) {
    temperatureText = <b style={{ color: 'red' }}>&nbsp;{airTemp} C </b>
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
    <Grid className="status-page">
      <div className="card flex flex-wrap gap-2">
        <Chip id="1" key="1" label={timeText} icon={MdOutlineAccessTime} /> <br></br>
        <Chip id="2" key="2" label={temperatureText} icon={FaTemperatureEmpty} /> <br></br>
        <Chip id="3" key="3" label={humidityText} icon={WiHumidity} /> <br></br>
        <Chip id="4" key="4" label={co2Text} icon={MdOutlineCo2} /> <br></br>
        <Chip id="5" key="5" label={vpdText} icon={MdEnergySavingsLeaf} />
      </div>
    </Grid>
  );


}
export default StatusPage;
