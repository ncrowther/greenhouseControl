'use client';

import React, { useState, useEffect } from 'react';
import { Grid } from '@carbon/react';
import { Galleria } from 'primereact/galleria';
const endpoints = require('../endpoints.js');

function Timelapse2Page() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [images, setImages] = useState(null);
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
    async function getPhotoData(camId) {
      await fetch(`${endpoints.photoServiceEndpoint}?camId=${camId}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((timelapseData) => {
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

              setImages(timelapseData.Docs);

              const itemTemplate = (item) => {
                if (item) {
                  return (
                    <img
                      src={'data:image/jpeg;base64,' + item.photo}
                      alt={item.timestamp}
                      style={{ width: '100%', display: 'block' }}
                    />
                  );
                }
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

              return (
                <div className="card">
                  <Galleria
                    value={images}
                    responsiveOptions={responsiveOptions}
                    numVisible={5}
                    style={{ maxWidth: '480px' }}
                    item={itemTemplate}
                    thumbnail={thumbnailTemplate}
                    circular
                    autoPlay
                    transitionInterval={600}
                  />
                </div>
              );
            }, []);
          }
        })
        .catch((err) => {
          console.log(err);
          return <Grid className="temphum-page">Loading</Grid>;
        });

      setLoading(false);
    }

    // CAMERA ID
    const camId = 2
    getPhotoData(camId);
  }, []);

  if (loading) {
    return <Grid className="timelapse-page">Loading</Grid>;
  }

  if (error) {
    return `Error! ${error}`;
  }



  return (
    <div className="timelapse-page">
      <Galleria
        value={images}
        responsiveOptions={responsiveOptions}
        numVisible={5}
        style={{ maxWidth: '480px' }}
        item={itemTemplate}
        thumbnail={thumbnailTemplate}
        circular
        autoPlay
        transitionInterval={600}
      />
    </div>
  );
}
export default Timelapse2Page;
