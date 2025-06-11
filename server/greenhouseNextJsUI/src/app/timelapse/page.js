'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Loading } from '@carbon/react';
import { Galleria } from 'primereact/galleria';
const endpoints = require('../endpoints.js');

function TimelapsePage(camId) {
  const timelapsePeriod = 300;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [images1, setimages1] = useState(null);
  const [images2, setimages2] = useState(null);
  const responsiveOptions = [
    {
      breakpoint: '991px',
      numVisible: 12,
    },
    {
      breakpoint: '767px',
      numVisible: 12,
    },
    {
      breakpoint: '575px',
      numVisible: 12,
    },
  ];

  const itemTemplate = (item) => {
    return (
      <img
        src={'data:image/jpeg;base64,' + item.photo}
        alt={item.timestamp}
        style={{ width: '100%', display: 'block' }}
      />
    );
  };

  const thumbnailTemplate = (item) => {
    return (
      <img
        src={'data:image/jpeg;base64,' + item.photo}
        alt={item.timestamp}
        style={{ width: '10%', height: '10%' }}
      />
    );
  };

  useEffect(() => {
    async function getPhotoData() {
      let camId = 1;
      await fetch(`${endpoints.photoServiceEndpoint}?camId=${camId}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((timelapseData) => {
              setimages1(timelapseData.Docs);
            }, []);
          }
        })
        .catch((err) => {
          console.log(err);
          return <Grid className="timelapse-page">Loading</Grid>;
        });

      camId = 2;
      await fetch(`${endpoints.photoServiceEndpoint}?camId=${camId}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((timelapseData) => {
              setimages2(timelapseData.Docs);
            }, []);
          }
        })
        .catch((err) => {
          console.log(err);
          return <Grid className="timelapse-page">Loading</Grid>;
        });

      setLoading(false);
    }

    getPhotoData();
  }, []);

  if (loading) {
    return <Loading active className="timelapse-class" description="Loading" />;
  }

  if (error) {
    return `Error! ${error}`;
  }

  return (
    <Grid className="timelapse-page">
      <Galleria
        value={images2}
        responsiveOptions={responsiveOptions}
        numVisible={5}
        style={{ maxWidth: '480px' }}
        item={itemTemplate}
        thumbnail={thumbnailTemplate}
        circular
        transitionInterval={timelapsePeriod}
      />

      <Galleria
        value={images1}
        activeIndex={0}
        responsiveOptions={responsiveOptions}
        numVisible={5}
        style={{ maxWidth: '480px' }}
        item={itemTemplate}
        thumbnail={thumbnailTemplate}
        circular
        transitionInterval={timelapsePeriod}
      />
    </Grid>
  );
}
export default TimelapsePage;
