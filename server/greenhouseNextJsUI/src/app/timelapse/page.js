'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Loading, Column } from '@carbon/react';
import { Galleria } from 'primereact/galleria';
import { Dropdown } from 'primereact/dropdown';
const config = require('../config/config.js');
const endpoints = require('../config/endpoints.js');

function TimelapsePage(camId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [images1, setimages1] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());

  const environment = [
    { name: 'Allotment', camId: '1' },
    { name: 'Growtent', camId: '2' },
    { name: 'Progogator', camId: '3' },
    { name: 'Drive', camId: '4' },
  ];

  const setEnv = async (event) => {
    console.log('Event: ' + JSON.stringify(event));
    config.setEnv(event);
    setLoading(true);
    await getPhotos(event.camId, setimages1);
    setLoading(false);
  };

  const itemTemplate = (item) => {
    return (
      <img
        src={'data:image/jpeg;base64,' + (item ? item.photo : null)}
        alt={item ? item.timestamp : null}
        style={{ width: '100%', display: 'block' }}
      />
    );
  };

  const getPhotos = async (camId, setImages) => {
    const ONE_SECOND = 1000;
    await new Promise((resolve) => setTimeout(resolve, ONE_SECOND));
    await fetch(`${endpoints.photoServiceEndpoint}?camId=${camId}`, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status == 200) {
          response.json().then((timelapseData) => {
            setImages(timelapseData.Docs);
          }, []);
        }
      })
      .catch((err) => {
        console.log(err);
        return <Grid className="timelapse-page">Loading</Grid>;
      });
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <Loading active className="timelapse-class" description="Loading" />;
  }

  if (error) {
    return `Error! ${error}`;
  }

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <h1>
          <Dropdown
            variant="filled"
            value={selectedEnv}
            onChange={(e) => {
              setSelectedEnv(e.value);
              setEnv(e.value);
            }}
            options={environment}
            optionLabel="name"
            checkmark={true}
            highlightOnSelect={false}
            placeholder="Select environment"
            className="w-full md:w-14rem"
          />
        </h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__content">
        <Galleria
          style={{ maxWidth: '1024px' }}
          value={images1}
          item={itemTemplate}
          autoPlay
          transitionInterval={150}
        />
      </Column>
    </Grid>
  );
}
export default TimelapsePage;
