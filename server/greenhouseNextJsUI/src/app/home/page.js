'use client';

import { Breadcrumb, Grid, Column } from '@carbon/react';

import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function LandingPage() {
  const zone1Hydration = '0';
  const zone2Hydration = '0';
  const zone3Hydration = '0';
  const zone4Hydration = '0';

  const zone1Color = 'orange';
  const zone2Color = 'red';
  const zone3Color = 'green';
  const zone4Color = 'red';

  const router = useRouter();

  return (
    <Grid fullWidth style={{ backgroundColor: 'black' }}>
      <Column
        lg={16}
        md={8}
        sm={4}
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '20px 0',
          backgroundColor: 'black',
        }}
      >
        <video
          src="/demo.mp4"
          controls
          autoPlay
          loop
          muted
          preload="metadata"
          style={{
            position: 'relative',
            width: '100vw',
            height: 'calc(90vh - 240px)',
            maxHeight: 'calc(90vh - 240px)',
          }}
        />
      </Column>

      <Column style={{ backgroundColor: 'black' }}>
        <div
          className="map-fullscreen"
          style={{
            position: 'relative',
            width: '100vw',
            height: 'calc(60vh)',
            maxHeight: 'calc(60vh - 240px)',
          }}
        >
          <button
            onClick={() =>
              router.push(
                '/zone?id=1&hydration=' +
                  zone1Hydration +
                  '&color=' +
                  zone1Color
              )
            }
            title="Go to Zone 1"
            style={{
              position: 'absolute',
              top: '16%',
              left: '10%',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '3px solid #fff',
              backgroundColor: 'rgba(255, 165, 0, 0.85)',
              color: '#000',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            1
          </button>

          <button
            onClick={() =>
              router.push(
                '/zone?id=2&hydration=' +
                  zone2Hydration +
                  '&color=' +
                  zone2Color
              )
            }
            title="Go to Zone 2"
            className="zone-button-flash"
            style={{
              position: 'absolute',
              top: '16%',
              left: '33%',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '3px solid #fff',
              backgroundColor: 'rgba(255, 0, 0, 0.85)',
              color: '#000',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            2
          </button>

          <button
            onClick={() =>
              router.push(
                '/zone?id=3&hydration=' +
                  zone3Hydration +
                  '&color=' +
                  zone3Color
              )
            }
            title="Go to Zone 3"
            style={{
              position: 'absolute',
              top: '16%',
              left: '55%',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '3px solid #fff',
              backgroundColor: 'rgba(0, 255, 0, 0.85)',
              color: '#000',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            3
          </button>

          <button
            onClick={() =>
              router.push(
                '/zone?id=4&hydration=' +
                  zone4Hydration +
                  '&color=' +
                  zone4Color
              )
            }
            title="Go to Zone 4"
            className="zone-button-flash"
            style={{
              position: 'absolute',
              top: '16%',
              left: '77%',
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              border: '3px solid #fff',
              backgroundColor: 'rgba(255, 0, 0, 0.85)',
              color: '#000',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            4
          </button>
        </div>
      </Column>

      <Column
        lg={16}
        md={8}
        sm={4}
        className="landing-page__banner"
        style={{ backgroundColor: 'black' }}
      ></Column>
    </Grid>
  );
}
