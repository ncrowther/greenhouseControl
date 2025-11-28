# Step 5

## Carbon UI for Greenhouse

UI using IBM Carbon Design System React components.

## Build

Build and start

Enter Bash shell.
Install the Next.js app’s dependencies with:

## Quick Start

Run in Dev mode:

```bash
yarn dev
```

Configure paths in `jsconfig.json`

```
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/components/*": ["components/*"],
      "@/app/*": ["app/*"]
   }
  }
}
```

### Deployment to code engine on IBM Cloud

1. Open WSL shell from VSC

```bash
   yarn clean
   yarn build
```

2. Login to IBM Cloud.

```bash
   ibmcloud login --sso
```

(if using public account, from the IBM Cloud console click user icon->Login to CLI and API. e.g.: ibmcloud login -a https://cloud.ibm.com -u passcode -p l6bjKxF0gL)

3. In the IBM Cloud console, go to Manage > Account > Account resources > Resource groups. Select the resource group for Code Engine. E.g. default

```bash
   ibmcloud resource groups

   ibmcloud target -g [resource_group]
```

4. Select the code engine project:

```bash
   ibmcloud ce project list

   ibmcloud ce project select -n [PROJECT_NAME] e.g asc-watsonx
```

5. Start Docker Desktop

```bash
   docker login -u ncrowthe -p C\*\*\*\*!
```

6. Within this folder, edit CEbuild.sh and CErun.sh and change the REGISTRY to your Docker registry.

7. Using the bash shell, deploy the sample application to your docker repo:

```bash
   ./CEbuild
```

9. Deploy the application to Code Engine on IBM Cloud. From the app's folder do:

```bash
   ./CErun
```

10. Open the URL using the IBM Cloud Code Engine route for the application

## License

Copyright (c) 2025 IBM Corporation

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
