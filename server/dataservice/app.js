/*
 Copyright 2023 IBM Corp.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// IMPORTANT: Start  DOS command, execute setenv.bat then run 'npm start'

const express = require('express')
var https = require('https');
const querystring = require('querystring');
const cloudantLib = require('./database/cloudantDb.js')
const session = require('express-session')
const { CloudantV1 } = require('@ibm-cloud/cloudant')
const cors = require('cors');

const service = CloudantV1.newInstance()

const logDbName = process.env.LOG_DB_NAME
const configDbName = process.env.CONFIG_DB_NAME
const fs = require('fs');

const app = express()

// Enable CORS for all routes
app.use(cors());

const bodyParser = require('body-parser')

app.use(bodyParser.json())


const port = process.env.PORT || 3000 //8080

// ////////////// Cloudant Setup //////////////////////

console.log('Log DB: ' + logDbName);
console.log('Config DB: ' + configDbName);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }))

// Parse JSON bodies (as sent by API clients)
app.use(express.json())

// //////////////// Create Doc ////////////////////////
app.post('/doc', async (req, res) => {

  console.log('Write doc');

  const newDoc = req.body;

  var timestamp = new Date();

  const doc = {
    "_id": timestamp,
    "temperature": newDoc.temperature,
    "humidity": newDoc.humidity,
    "co2": newDoc.co2,
    "vpd": newDoc.vpd
  }

  await cloudantLib.createDoc(service, logDbName, doc).then(function (ret) {

    console.error('[App] Created doc');

    res.status(200);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(timestamp);

  }, function (err) {
    console.error('[App] Cloudant DB Failure in create doc: ' + err)
    res.status(500);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(err);
  })

})

// //////////////// Get Docs ////////////////////////
app.get('/docs', async (req, res) => {

  console.log('Get docs')

  await purge(res);

  await cloudantLib.findAllDocs(service, logDbName).then(function (docs) {

    res.status(200);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(docs);

  }, function (err) {
    console.error('[App] Cloudant DB Failure in get docs: ' + err)
    res.status(500);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(err);
  })

})

// //////////////// Get Config ////////////////////////
app.get('/config', async (req, res) => {

  //var query = require('url').parse(req.url,true).query;

  const id = req.query.id;
  console.log('Get config for ' + id)

  await cloudantLib.findById(service, configDbName, id).then(function (doc) {

    const config = {
      doc: doc,
      timestamp: new Date()
    }

    res.status(200);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(config);

  }, function (err) {
    console.error('[App] Cloudant DB Failure in get config: ' + err)
    res.status(500);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(err);
  })

})

// ///////////////////// Set Config ////////////////////
app.post('/config', async (req, res) => {

  const id = req.query.id;
  const newDoc = req.body;

  console.log('Set Config: ' + JSON.stringify(newDoc))

  findDoc(res, id, newDoc)

})

/**
 * Find document from Cloudant database.
 * @param {Object} res - The response object.
 * @returns {void}
 */
async function findDoc(res, id, newDoc) {
  console.log('Update doc');

  await cloudantLib.findById(service, configDbName, id).then(function (doc) {

    console.log('Updating: ' + JSON.stringify(doc));

    cloudantLib.updateDoc(service, configDbName, doc, newDoc).then(function (doc) {

      res.status(200);
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      //res.header('Access-Control-Allow-Origin', 'Origin, X-Requested-With, Content-Type, Accept');
      //res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept');

      res.send(doc);

    }, function (err) {
      console.error('[App] Cloudant DB Failure in post config: ' + err)
      res.status(500);
      res.set('Access-Control-Allow-Origin', '*');
      res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.send(err);
    })


  }, function (err) {
    console.error('[App] Cloudant DB Failure in find doc: ' + err)
    res.status(500);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(err);
  })

}

/**
 * Purge expired documents from Cloudant database.
 * @param {Object} res - The response object.
 * @returns {void}
 */
async function purge(res) {
  console.log('Purge docs');

  await cloudantLib.getExpiredDocs(service, logDbName).then(function (docs) {
    cloudantLib.deleteDocs(service, logDbName, docs);

  }, function (err) {
    console.error('[App] Cloudant DB Failure in purge docs: ' + err);
    res.status(500);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(err);
  });
}

app.listen(port, () => {
  console.info('[App] Listening on http://localhost:' + port)
})

