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
const photoDbName = process.env.PHOTO_DB_NAME

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
console.log('Photo DB: ' + photoDbName);

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

  console.log(JSON.stringify(doc));

  await cloudantLib.createDoc(service, logDbName, doc).then(function (ret) {

    console.error('Created doc');

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

  await purge(res, logDbName);

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

// ///////////////////// Set Config ////////////////////
app.post('/config', async (req, res) => {

  const id = req.query.id;
  const newDoc = req.body;

  console.log('Set Config: ' + JSON.stringify(newDoc))

  updateDoc(res, configDbName, id, newDoc)

})

// //////////////// Get Config ////////////////////////
app.get('/config', async (req, res) => {

  const id = req.query.id;
  console.log('Get config for ' + id)

  await cloudantLib.findById(service, configDbName, id).then(function (doc) {

    var local = new Date();
    local.setMinutes(local.getMinutes() - local.getTimezoneOffset());

    const config = {
      doc: doc,
      timestamp: (local)
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


// ///////////////////// Write Photo ////////////////////
app.post('/photo', async (req, res) => {

    console.log('Write photo');

    const newDoc = req.body;

    var timestamp = new Date().toISOString();
  
    const doc = {
      "_id": timestamp,
      "photo": newDoc.photo,
      "timestamp": timestamp
    }

    console.log(JSON.stringify(doc));

    await cloudantLib.createDoc(service, photoDbName, doc).then(function (ret) {
  
      console.error('Created photo');
  
      res.status(200);
      res.set('Access-Control-Allow-Origin', '*');
      res.send(timestamp);
  
    }, function (err) {
      console.error('[App] Cloudant DB Failure in create photo: ' + err)
      res.status(500);
      res.set('Access-Control-Allow-Origin', '*');
      res.send(err);
    })    
    
  })

// //////////////// Get Photo ////////////////////////
app.get('/photo', async (req, res) => {

  const id = req.query.id;
  console.log('Get photo for ' + id)

  await cloudantLib.findById(service, photoDbName, id).then(function (doc) {

    res.status(200);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(doc);

  }, function (err) {
    console.error('[App] Cloudant DB Failure in get photo: ' + err)
    res.status(500);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(err);
  })

})

// //////////////// Get All Photos ////////////////////////
app.get('/photos', async (req, res) => {

  console.log('Get all photos')

  await purge(res, photoDbName);

  await cloudantLib.findAllDocs(service, photoDbName).then(function (docs) {

    console.log("Count: " + docs.length)
    res.status(200);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(docs);

  }, function (err) {
    console.error('[App] Cloudant DB Failure in get photos: ' + err)
    res.status(500);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(err);
  })

})


// Create cloudant doc
async function createDoc(doc, res, dbName) {

  console.log('[App] Create doc:' + JSON.stringify(doc.id));

  await cloudantLib.createDoc(service, dbName, doc).then(function (ret) {

    console.log('[App] Created doc');

    return ret

  }, function (err) {
    console.error('[App] Cloudant DB Failure in create photo doc: ' + err);
    res.status(500);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(err);
  });
}

/**
 * Find and update document in Cloudant database.
 * @param {Object} res - The response object.
 * @returns {void}
 */
async function updateDoc(res, dbName, id, newDoc) {
  console.log('Update doc');

  await cloudantLib.findById(service, dbName, id).then(function (doc) {

    console.log('Updating doc: ' + id);

    cloudantLib.updateDoc(service, dbName, doc, newDoc).then(function (doc) {

      res.status(200);
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

      res.send(doc);

    }, function (err) {
      console.error('[App] Cloudant DB Failure in post config: ' + err)
      res.status(500);
      res.set('Access-Control-Allow-Origin', '*');
      res.set("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
      res.send(err);
    })


  }, function (err) {

    // Create doc if not found
    newDoc._id = "default"
    createDoc(newDoc, res, dbName);

    res.status(200);
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

    res.send(newDoc);
  })

}

/**
 * Purge expired documents from Cloudant database.
 * @param {Object} res - The response object.
 * @returns {void}
 */
async function purge(res, dbName) {

  console.log('Purge docs in ' + dbName);

  await cloudantLib.getExpiredDocs(service, dbName).then(function (docs) {
    cloudantLib.deleteDocs(service, dbName, docs);

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

