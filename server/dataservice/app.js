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
var moment = require('moment');

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

  // var timestamp = new Date();

  var time = moment();
  var timestamp = time.format('YYYY-MM-DDTHH:mm:ss');
  console.log(timestamp);

  const doc = {
    "_id": timestamp,
    "airTemperature": newDoc.airTemperature,
    "leafTemperature": newDoc.leafTemperature,
    "humidity": newDoc.humidity,
    "co2": newDoc.co2,
    "vpd": newDoc.vpd,
    "lux": newDoc.lux
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

  const purgeWindow = 48 // Hours
  await purge(res, purgeWindow, logDbName);

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

// ///////////////////// Set Light ////////////////////
app.post('/light', async (req, res) => {


  const inputDoc = req.body;

  console.log('Set Light ' + JSON.stringify(inputDoc));

  const settings = req.query.id;
  console.log('Settings ' + settings);

  const id = "default"
  console.log('Get light for ' + id)

  await cloudantLib.findById(service, configDbName, id).then(function (originalDoc) {

    var time = moment();
    var timestamp = time.format('YYYY-MM-DDTHH:mm:ss');
    console.log(timestamp);

    const newDoc = {
      "lightState": inputDoc.lightState,
      "lightOnOff": [
        inputDoc.lightOnHH,
        inputDoc.lightOffHH
      ],
      "pumpState": originalDoc.pumpState,
      "fanState": originalDoc.fanState,
      "heaterState": originalDoc.heaterState,
      "wateringDuration": originalDoc.wateringDuration,
      "wateringTimes": [
        originalDoc.wateringTimes[0],
        originalDoc.wateringTimes[1],
        originalDoc.wateringTimes[2]
      ],
      "windowState": originalDoc.windowState,
      "windowRun": originalDoc.windowRun,
      "windowPause": originalDoc.windowPause,
      "temperatureRange": [
        originalDoc.temperatureRange[0],
        originalDoc.temperatureRange[1]
      ],
      "lastUpdate": timestamp
    }

    console.log('Set Config: ' + JSON.stringify(newDoc))

    updateDoc(res, configDbName, id, newDoc)

  })
})

// ///////////////////// Set Heat ////////////////////
app.post('/heat', async (req, res) => {

  const inputDoc = req.body;

  console.log('Set Heat ' + JSON.stringify(inputDoc));

  const id = "default"
  console.log('Get heat for ' + id)

  await cloudantLib.findById(service, configDbName, id).then(function (originalDoc) {

    var time = moment();
    var timestamp = time.format('YYYY-MM-DDTHH:mm:ss');
    console.log(timestamp);

    const newDoc = {
      "lightState": originalDoc.lightState,
      "lightOnOff": [
        originalDoc.lightOnOff[0],
        originalDoc.lightOnOff[1]
      ],
      "pumpState": originalDoc.pumpState,
      "fanState": originalDoc.fanState,
      "heaterState": inputDoc.heaterState,
      "wateringDuration": originalDoc.wateringDuration,
      "wateringTimes": [
        originalDoc.wateringTimes[0],
        originalDoc.wateringTimes[1],
        originalDoc.wateringTimes[2]
      ],
      "windowState": originalDoc.windowState,
      "windowRun": originalDoc.windowRun,
      "windowPause": originalDoc.windowPause,
      "temperatureRange": [
        inputDoc.minTemp,
        originalDoc.temperatureRange[1]
      ],
      "lastUpdate": timestamp
    }

    console.log('Set Config: ' + JSON.stringify(newDoc))

    updateDoc(res, configDbName, id, newDoc)

  })
})

// ///////////////////// Set Irrigation ////////////////////
app.post('/water', async (req, res) => {

  const inputDoc = req.body;

  console.log('Set irrigation ' + JSON.stringify(inputDoc));

  const id = "default"
  console.log('Get irrigation for ' + id)

  await cloudantLib.findById(service, configDbName, id).then(function (originalDoc) {

    var time = moment();
    var timestamp = time.format('YYYY-MM-DDTHH:mm:ss');
    console.log(timestamp);

    const newDoc = {
      "lightState": originalDoc.lightState,
      "lightOnOff": [
        originalDoc.lightOnOff[0],
        originalDoc.lightOnOff[1]
      ],
      "pumpState": inputDoc.pumpState,
      "fanState": originalDoc.fanState,
      "heaterState": originalDoc.heaterState,
      "wateringDuration": inputDoc.wateringDuration,
      "wateringTimes": [
        inputDoc.timeHH1,
        inputDoc.timeHH2,
        inputDoc.timeHH3
      ],
      "windowState": originalDoc.windowState,
      "windowRun": originalDoc.windowRun,
      "windowPause": originalDoc.windowPause,
      "temperatureRange": [
        originalDoc.temperatureRange[0],
        originalDoc.temperatureRange[1]
      ],
      "lastUpdate": timestamp
    }

    console.log('Set Config: ' + JSON.stringify(newDoc))

    updateDoc(res, configDbName, id, newDoc)

  })
})

// ///////////////////// Set Cooling ////////////////////
app.post('/cool', async (req, res) => {

  const inputDoc = req.body;

  console.log('Set cooling ' + JSON.stringify(inputDoc));

  const id = "default"
  console.log('Get config for ' + id)

  await cloudantLib.findById(service, configDbName, id).then(function (originalDoc) {

    var time = moment();
    var timestamp = time.format('YYYY-MM-DDTHH:mm:ss');
    console.log(timestamp);

    const newDoc = {
      "lightState": originalDoc.lightState,
      "lightOnOff": [
        originalDoc.lightOnOff[0],
        originalDoc.lightOnOff[1]
      ],
      "pumpState": originalDoc.pumpState,
      "fanState": inputDoc.fanState,
      "heaterState": originalDoc.heaterState,
      "wateringDuration": originalDoc.wateringDuration,
      "wateringTimes": [
        originalDoc.wateringTimes[0],
        originalDoc.wateringTimes[1],
        originalDoc.wateringTimes[2]
      ],
      "windowState": inputDoc.windowState,
      "windowRun": inputDoc.windowRun,
      "windowPause": inputDoc.windowPause,
      "temperatureRange": [
        originalDoc.temperatureRange[0],
        inputDoc.maxTemp
      ],
      "lastUpdate": timestamp
    }

    console.log('Set Config: ' + JSON.stringify(newDoc))

    updateDoc(res, configDbName, id, newDoc)

  })
})

// ///////////////////// Set Config ////////////////////
app.post('/config', async (req, res) => {

  console.log('Write config');

  var time = moment();
  var timestamp = time.format('YYYY-MM-DDTHH:mm:ss');
  console.log(timestamp);

  const id = "default" //req.query.id;
  const inputDoc = req.body;

  // Hint: This is the doc that is required for input from the OpenAPI spec
  const newDoc = {
    "lightState": inputDoc.lightState,
    "lightOnOff": [
      inputDoc.lightOnOff[0],
      inputDoc.lightOnOff[1]
    ],
    "pumpState": inputDoc.pumpState,
    "fanState": inputDoc.fanState,
    "heaterState": inputDoc.heaterState,
    "wateringDuration": inputDoc.wateringDuration,
    "wateringTimes": [
      inputDoc.wateringTimes[0],
      inputDoc.wateringTimes[1],
      inputDoc.wateringTimes[2]
    ],
    "windowState": inputDoc.windowState,
    "windowRun": inputDoc.windowRun,
    "windowPause": inputDoc.windowPause,
    "temperatureRange": [
      inputDoc.temperatureRange[0],
      inputDoc.temperatureRange[1]
    ],
    "lastUpdate": timestamp
  }

  console.log('Set Config: ' + JSON.stringify(newDoc))

  updateDoc(res, configDbName, id, newDoc)


})

// //////////////// Get Config ////////////////////////
app.get('/config', async (req, res) => {

  const id = "default" //req.query.id;
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

  const newDoc = req.body;
  console.log('Write photo to cam ' + newDoc.cam);

  const camId = newDoc.cam
  photoDb = getPhotoDb(camId);
  console.log('Write photo to: ' + photoDb);

  var timestamp = new Date().toISOString();

  const doc = {
    "_id": timestamp,
    "photo": newDoc.photo,
    "timestamp": timestamp
  }

  console.log(JSON.stringify(doc));

  await cloudantLib.createDoc(service, photoDb, doc).then(function (ret) {

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

// //////////////// Get Latest Photo ////////////////////////
app.get('/photo', async (req, res) => {

  const camId = req.query.camId
  photoDb = getPhotoDb(camId);
  console.log('Get latest photos from: ' + photoDb);

  await cloudantLib.findAllDocs(service, photoDb).then(function (docs) {

    photos = docs.Docs
    let latest = photos.length
    let latestPhoto = photos[latest - 1]

    res.status(200);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(latestPhoto);

  }, function (err) {
    console.error('[App] Cloudant DB Failure in get photo: ' + err)
    res.status(500);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(err);
  })



})

// //////////////// Get All Photos ////////////////////////
app.get('/photos', async (req, res) => {

  const camId = req.query.camId

  photoDb = getPhotoDb(camId);
  console.log('Get all photos from: ' + photoDb);

  const purgeWindow = 12  // Hours
  await purge(res, purgeWindow, photoDb);

  await cloudantLib.findAllDocs(service, photoDb).then(function (docs) {

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
      console.error('[App] Cloudant DB Failure in update doc: ' + err)
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
async function purge(res, purgeWindow, dbName) {

  console.log('Purge docs in ' + dbName);

  await cloudantLib.getExpiredDocs(service, purgeWindow, dbName).then(function (docs) {
    cloudantLib.deleteDocs(service, dbName, docs);

  }, function (err) {
    console.error('[App] Cloudant DB Failure in purge docs: ' + err);
    res.status(500);
    res.set('Access-Control-Allow-Origin', '*');
    res.send(err);
  });
}

// ////// Helper function to get photoDb from cameraId passed in query param ///
function getPhotoDb(camId) {
  if (camId == null) {
    camId = 1;
  }

  let photoDb = process.env.CAM1_DB_NAME;

  if (camId == 2) {
    photoDb = process.env.CAM2_DB_NAME;
  }

  if (camId == 3) {
    photoDb = process.env.CAM3_DB_NAME;
  }

  if (camId == 4) {
    photoDb = process.env.CAM4_DB_NAME;
  }

  console.log("Selected db " + photoDb)
  return photoDb;
}

app.listen(port, () => {
  console.info('[App] Listening on http://localhost:' + port)
})

