'use client';

import TelemetryTable from './TelemetryTable';
import {
  Link,
  DataTableSkeleton,
  Pagination,
  Column,
  Grid,
  ToastNotification,
} from '@carbon/react';
const endpoints = require('../endpoints.js');

import React, { useEffect, useState } from 'react';

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

const LinkList = ({ url, homepageUrl }) => (
  <ul style={{ display: 'flex' }}>
    <li>
      <Link href={url}>Greenhouse</Link>
    </li>
    {homepageUrl && (
      <li>
        <span>&nbsp;|&nbsp;</span>
        <Link href={homepageUrl}>Homepage</Link>
      </li>
    )}
  </ul>
);

const getNotifications = (rows) => {
  const MAX_TEMPERATURE = 27.0;
  const MIN_TEMPERATURE = 14.0;

  const notifications = [];
  let maxViolation = null;
  let minViolation = null;

  for (const row of rows) {
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

function RepoPage() {
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [rows, setRows] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    async function getData() {
      await fetch(`${endpoints.dataServiceEndpoint}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((data) => {
              setRows(getRowItems(data.Docs));
              setNotifications(getNotifications(data.Docs));
            });
          }
        })
        .catch((err) => {
          console.log(err);
          setError('Error obtaining repository data');
        });

      setLoading(false);
    }

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

export default RepoPage;
