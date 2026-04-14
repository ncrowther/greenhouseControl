'use client';

import React, { useEffect, useState } from 'react';
import TelemetryTable from './TelemetryTable';
import { Dropdown } from 'primereact/dropdown';

import {
  Link,
  DataTableSkeleton,
  Pagination,
  Column,
  Grid,
  ToastNotification,
  TextInput,
  Button,
} from '@carbon/react';
const endpoints = require('../config/endpoints.js');
const config = require('../config/config.js');

const headers = [
  {
    key: '_id',
    header: 'Timestamp',
  },
  {
    key: 'humidity',
    header: 'Humidity',
  },
  {
    key: 'airTemperature',
    header: 'Air Temperature',
  },
  {
    key: 'leafTemperature',
    header: 'Leaf Temperature',
  },
  {
    key: 'co2',
    header: 'Co2',
  },
  {
    key: 'vpd',
    header: 'Vpd',
  },
  {
    key: 'lux',
    header: 'Lux',
  },
];

const getNotifications = (rows, maxTemp, minTemp) => {
  const MAX_TEMPERATURE = maxTemp;
  const MIN_TEMPERATURE = minTemp;

  const notifications = [];
  let maxViolation = null;
  let minViolation = null;

  const now = new Date();
  const dateString = now.toISOString().split('T')[0];

  for (const row of rows) {
    var rowDate = row._id.split('T')[0];
    if (rowDate === dateString) {
      const airTemperature = row.airTemperature;
      if (airTemperature) {
        if (airTemperature > MAX_TEMPERATURE) {
          if (!maxViolation || airTemperature > maxViolation.temperature) {
            maxViolation = { temperature: airTemperature, row };
          }
        }
        if (airTemperature < MIN_TEMPERATURE) {
          if (!minViolation || airTemperature < minViolation.temperature) {
            minViolation = { temperature: airTemperature, row };
          }
        }
      }
    }
  }

  if (maxViolation) {
    notifications.push(
      <ToastNotification
        key="max-temperature"
        aria-label="closes notification"
        caption={maxViolation.row._id}
        kind="warning"
        onClose={() => {}}
        onCloseButtonClick={() => {}}
        role="status"
        statusIconDescription="notification"
        subtitle={`${maxViolation.temperature}C above ${MAX_TEMPERATURE}C`}
        timeout={60000}
        title="Max temperature alert"
      />
    );
  }

  if (minViolation) {
    notifications.push(
      <ToastNotification
        key="min-temperature"
        aria-label="closes notification"
        caption={minViolation.row._id}
        kind="warning"
        onClose={() => {}}
        onCloseButtonClick={() => {}}
        role="status"
        statusIconDescription="notification"
        subtitle={`${minViolation.temperature}C below ${MIN_TEMPERATURE}C`}
        timeout={60000}
        title="Min temperature alert"
      />
    );
  }

  return notifications;
};

const getRowItems = (rows) =>
  rows
    .slice(0)
    .reverse()
    .map((row) => ({
      id: row._id,
      ...row,
    }));

function TelemetryPage() {
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [rows, setRows] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [selectedEnv, setSelectedEnv] = useState(config.getEnv());
  const [maxViolationTemp, setMaxViolationTemp] = useState(30.0);
  const [minViolationTemp, setMinViolationTemp] = useState(4.0);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Load temperature thresholds from localStorage
    const savedMaxTemp = localStorage.getItem('maxViolationTemp');
    const savedMinTemp = localStorage.getItem('minViolationTemp');

    if (savedMaxTemp) setMaxViolationTemp(parseFloat(savedMaxTemp));
    if (savedMinTemp) setMinViolationTemp(parseFloat(savedMinTemp));
  }, []);

  const setEnv = async (event) => {
    console.log('Event: ' + JSON.stringify(event));
    config.setEnv(event);
    setLoading(true);
    await getData();
    setLoading(false);
  };

  const saveTemperatureSettings = () => {
    localStorage.setItem('maxViolationTemp', maxViolationTemp.toString());
    localStorage.setItem('minViolationTemp', minViolationTemp.toString());
    // Refresh notifications with new thresholds
    setNotifications(
      getNotifications(rows, maxViolationTemp, minViolationTemp)
    );
    setShowSettings(false);
  };

  async function getData() {
    const telemetryEndpoint =
      endpoints.getEndpoint() +
      endpoints.dataService +
      '?id=zone' +
      config.getEnv().id;
    await fetch(telemetryEndpoint, {
      method: 'get',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (response.status == 200) {
          response.json().then((data) => {
            setRows(getRowItems(data.Docs));
            setNotifications(
              getNotifications(data.Docs, maxViolationTemp, minViolationTemp)
            );
          });
        }
      })
      .catch((err) => {
        console.log(err);
        setError('Error obtaining repository data');
      });

    setLoading(false);
  }

  useEffect(() => {
    getData();
  }, []);

  if (loading) {
    return (
      <Grid className="repo-page">
        <Column lg={16} md={8} sm={4} className="repo-page__r1">
          <DataTableSkeleton
            columnCount={headers.length + 1}
            rowCount={1}
            headers={headers}
          />
        </Column>
      </Grid>
    );
  }

  if (error) {
    return `Error! ${error}`;
  }

  return (
    <Grid className="repo-page">
      {notifications}

      <Column lg={16} md={8} sm={4}>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            alignItems: 'center',
          }}
        >
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
      </Column>

      <Column>
        <div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              backgroundColor: showSettings ? '#0f62fe' : '#e0e0e0',
              color: showSettings ? 'white' : 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: showSettings ? 'bold' : 'normal',
            }}
          >
            Alerts
          </button>
        </div>
      </Column>

      {showSettings && (
        <Column
          lg={16}
          md={8}
          sm={4}
          style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f4f4f4',
            borderRadius: '4px',
          }}
        >
          <h4 style={{ marginBottom: '16px' }}>Temperature Alert Settings</h4>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              alignItems: 'flex-end',
            }}
          >
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                }}
              >
                Max Temperature Alert (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={maxViolationTemp}
                onChange={(e) =>
                  setMaxViolationTemp(parseFloat(e.target.value) || 0)
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                }}
              >
                Min Temperature Alert (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={minViolationTemp}
                onChange={(e) =>
                  setMinViolationTemp(parseFloat(e.target.value) || 0)
                }
                style={{
                  width: '100%',
                  padding: '8px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                }}
              />
            </div>
            <button
              onClick={saveTemperatureSettings}
              style={{
                padding: '8px 24px',
                fontSize: '14px',
                backgroundColor: '#0f62fe',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
            >
              Save Settings
            </button>
          </div>
          <p style={{ marginTop: '12px', fontSize: '12px', color: '#666' }}>
            Current settings: Max {maxViolationTemp}°C, Min {minViolationTemp}°C
          </p>
        </Column>
      )}

      <Column lg={16} md={8} sm={4} className="repo-page__r1">
        <TelemetryTable headers={headers} rows={rows} />
        <Pagination
          totalItems={rows.length}
          backwardText="Previous page"
          forwardText="Next page"
          pageSize={currentPageSize}
          pageSizes={[5, 10, 15, 25]}
          itemsPerPageText="Items per page"
          onChange={({ page, pageSize }) => {
            if (pageSize !== currentPageSize) {
              setCurrentPageSize(pageSize);
            }
            setFirstRowIndex(pageSize * (page - 1));
          }}
        />
      </Column>
    </Grid>
  );
}

export default TelemetryPage;
