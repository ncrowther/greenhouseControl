'use client';

import React, { useState, useEffect } from 'react';
import { Grid, Loading, Column } from '@carbon/react';
import { Galleria } from 'primereact/galleria';
const config = require('../config/config.js');
const endpoints = require('../config/endpoints.js');

function CamPage(id) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [photos, setphotos] = useState(null);
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());

  const setEnv = async (event) => {
    console.log('Event: ' + JSON.stringify(event));
    config.setEnv(event);
    setLoading(true);
    setphotos(null);
    await getPhotos(event.id, setphotos);
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

  const getPhotos = async (id, setImages) => {
    const ONE_SECOND = 1000;
    await new Promise((resolve) => setTimeout(resolve, ONE_SECOND));

    console.log('**CAM ID: ' + id);

    const camEndpoint =
      endpoints.getEndpoint() + endpoints.photoService + '?camId=cam' + id;

    await fetch(camEndpoint, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status == 200) {
          response.json().then((camData) => {
            setImages(camData.Docs);
          }, []);
        }
      })
      .catch((err) => {
        console.log(err);
        return <Grid className="cam-page">Loading</Grid>;
      });

    setLoading(false);
  };

  useEffect(() => {
    getPhotos(selectedEnv.id, setphotos);
  }, []);

  if (loading) {
    return <Loading active className="cam-class" description="Loading" />;
  }

  if (error) {
    return `Error! ${error}`;
  }

  return (
    <Grid className="landing-page" fullWidth>
      <Column lg={16} md={8} sm={4} className="landing-page__banner">
        <h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {config.getEnvs().map((env) => (
              <button
                key={env.id}
                onClick={() => {
                  setSelectedEnv(env);
                  setEnv(env);
                }}
                style={{
                  padding: '16px 32px',
                  fontSize: '16px',
                  backgroundColor:
                    selectedEnv.id === env.id ? '#0f62fe' : '#e0e0e0',
                  color: selectedEnv.id === env.id ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: selectedEnv.id === env.id ? 'bold' : 'normal',
                }}
              >
                {env.name}
              </button>
            ))}
          </div>
        </h1>
      </Column>
      <Column lg={16} md={8} sm={4} className="landing-page__content">
        <Galleria
          style={{ maxWidth: '800px' }}
          value={photos}
          item={itemTemplate}
          autoPlay
          transitionInterval={100}
        />
      </Column>
    </Grid>
  );
}
export default CamPage;
