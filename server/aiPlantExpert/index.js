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

const express = require('express')
const oas3Tools = require('oas3-tools');
const path = require('path');

const app = express()

const bodyParser = require('body-parser')

app.use(bodyParser.json())

const port = process.env.PORT || 8080

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }))

// Parse JSON bodies (as sent by API clients)
app.use(express.json())

// Swagger (OpenAPI) router configuration
const options = {
  routing: {
    controllers: path.join(__dirname, './controllers')
  }
};

const openApiSpec = path.join(__dirname, 'api/openapi.yaml');

// Initialize the Swagger middleware
const expressAppConfig = oas3Tools.expressAppConfig(openApiSpec, options);
const apiApp = expressAppConfig.getApp();

// Parse JSON bodies (as sent by API clients)
apiApp.use(bodyParser.json());

apiApp.listen(port, () => {
  console.info('[App] Listening on http://localhost:' + port)
});

