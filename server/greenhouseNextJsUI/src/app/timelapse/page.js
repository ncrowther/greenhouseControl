'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Loading } from '@carbon/react';
import { Galleria } from 'primereact/galleria';
const endpoints = require('../endpoints.js');

function TimelapsePage(camId) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [images1, setimages1] = useState(null);
  const [images2, setimages2] = useState(null);
  const [images3, setimages3] = useState(null);
  const [images4, setimages4] = useState(null);

  const itemTemplate = (item) => {
    return (
      <img
        src={'data:image/jpeg;base64,' + item.photo}
        alt={item.timestamp}
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
    async function getPhotoData() {
      await getPhotos(1, setimages1);
      await getPhotos(2, setimages2);
      await getPhotos(3, setimages3);
      await getPhotos(4, setimages4);
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
        value={images1}
        item={itemTemplate}
        autoPlay
        transitionInterval={250}
      />

      <Galleria
        value={images2}
        item={itemTemplate}
        autoPlay
        transitionInterval={250}
      />

      <Galleria
        value={images3}
        item={itemTemplate}
        autoPlay
        transitionInterval={250}
      />

      <Galleria
        value={images4}
        item={itemTemplate}
        autoPlay
        transitionInterval={250}
      />
    </Grid>
  );
}
export default TimelapsePage;
