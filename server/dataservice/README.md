# Cloudant Facade for GreenhouseController

This package creates a datafacade into a Cloudant database.  
The facade is exposed as an OpenAPI 
See:

 [OpenApi](\openapi\dataApi.yaml)

### Local host Prerequisites

 * Create IBM Cloud account with Cloudant.  See https://cloud.ibm.com/docs/Cloudant?topic=Cloudant-getting-started-with-cloudant 
 
 * Create a Cloudant database with name Greenhouselog

 * Create credentials for next step

### Run on local host

 Edit setenv.bat to cloudant credentials (see prereqs)
 Open DOS prompt (***NOT powershell***).  Enter:

 ```sh
   setenv.bat
```

 Start a local nodejs server: 
 
```sh
   npm start
```

### Code Engine Hosting Prerequisites

 * Follow Local Host Prerequisites above
 
 * Create IBM Cloud account with Code Engine. 

 * Create a code engine project (eg name sample)

 * Create a code engine configmap configuration containing Cloudant credentials: CLOUDANT_APIKEY=XXX, CLOUDANT_URL=XXX, CONFIG_DB_NAME=greenhouseconfig
 LOG_DB_NAME=greenhouselog

 * Assign the config map to the Code Engine project

### Deployment to code engine on IBM Cloud

### Deployment to code engine on IBM Cloud

1. Open bash shell from VSC

```bash
   yarn clean
   yarn build
   [yarn start]
```

2. Login to IBM Cloud.

```bash
   ibmcloud login --sso
```

(if using public or techsales account, logout of ibm cloud (https://cloud.ibm.com/logout), then IBM Cloud Login:

https://cloud.ibm.com/authorize/itzwatsonx031

Username: student_6954ecabb4@techz12one.ibm.com
Password: ogk8arxlyrzwyo4

from the IBM Cloud console click user icon->Login to CLI and API. e.g.: ibmcloud login -a https://cloud.ibm.com -u passcode -p l6bjKxF0gL)

3. In the IBM Cloud console, go to Manage > Account > Account resources > Resource groups. Select the resource group for Code Engine. E.g. default

```bash
   ibmcloud resource groups

   ibmcloud target -g [resource_group] (-r [region])
```

4. Select the code engine project:

```bash
   ibmcloud ce project list

   ibmcloud ce project select -n [PROJECT_NAME] e.g asc-watsonx
```

5. Start Docker (Rancher) Desktop and wait for status to be STARTED

```bash
   docker login -u ncrowthe -p C\*\*\*\*!
```

6. Within this folder, edit CEbuild.sh and CErun.sh and change the REGISTRY to your Docker registry.

7. Using the bash shell [SEPARATE SHELL AS ADMIN], deploy the sample application to your docker repo:

```bash
   ./CEbuild.sh
```

8. Create config map

```bash
ibmcloud ce configmap create --name greenhouseconfig --from-env-file greenhouseconfig.txt
ibmcloud ce configmap get --name greenhouseconfig

```

9. Deploy the application to Code Engine on IBM Cloud. From the app's folder do:

```bash
   ./CErun.sh
```

10. Open the URL using the IBM Cloud Code Engine route for the application



## License

Copyright (c) 2024 IBM Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

