'use client';

import TelemetryTable from './TelemetryTable';
import {
  Link,
  DataTableSkeleton,
  Pagination,
  Column,
  Grid,
} from '@carbon/react';
const endpoints = require('../endpoints.js')

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
    key: 'temperature',
    header: 'Temperature',
  },
  {
    key: 'co2',
    header: 'Co2',
  },
  {
    key: 'vpd',
    header: 'Vpd',
  }
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

const getRowItems = (rows) =>
  rows.slice(0).reverse().map((row) => ({
    id: row._id,
    ...row,
  }));

function RepoPage() {
  const [firstRowIndex, setFirstRowIndex] = useState(0);
  const [currentPageSize, setCurrentPageSize] = useState(15);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    async function getData() {

      await fetch(`${endpoints.dataServiceEndpoint}`, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.status == 200) {
            response.json().then((data) => {
              setRows(getRowItems(data.Docs));
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
      <Column lg={16} md={8} sm={4} className="repo-page__r1">
        <TelemetryTable
          headers={headers}
          rows={rows}
        />
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
