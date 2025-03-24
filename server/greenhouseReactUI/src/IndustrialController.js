import { useQueries } from '@tanstack/react-query';
import GreenhouseConfig from './GreenhouseConfig.js';
import GreenhouseTemperature from './GreenhouseTemperature.js';
import GreenhouseVpd from './GreenhouseVpd.js';
import GreenhouseLight from './GreenhouseLight.js';
import GreenhouseWatering from './GreenhouseWatering.js';
import GreenhouseDetails from './GreenhouseDetails.js';
import HumidityTempChart from './HumidityTempChart.js';
import Co2Chart from './Co2Chart.js';
import VpdChart from './VpdChart.js';
import { Panel } from 'primereact/panel';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';


import 'primereact/resources/themes/vela-green/theme.css';

/**
 * This function is responsible for rendering the IndustrialController React UI.
 * It fetches data from a Cloudant database and displays it in various charts.
 * 
 * @returns {JSX.Element} - The JSX element representing the IndustrialController component.
 */
const IndustrialController = () => {

  // Get customer id from URL (not currently used)
  //const queryStringParams = queryString.parse(window.location.search);
  //console.log("***queryStringParams.id: " + queryStringParams.id

  const baseurl = 'https://ph8pr72f-3000.uks1.devtunnels.ms'
  const dataservice = baseurl + '/docs'
  const configservice = baseurl + '/config?id=default'

  const results = useQueries({
    queries: [
      { queryKey: ['logData', 1], queryFn: () =>
      fetch(dataservice, { mode: 'cors' }).then(
        (res) => res.json()
      )},
      { queryKey: ['configData', 2], queryFn: () =>
        fetch(configservice, { mode: 'cors' }).then(
          (res) => res.json()
        )},      
    ],
  });

  // Show a loading message while data is fetching
  const isLoading = results.some(result => result.isLoading)
  if (isLoading) {
    return <h2>Loading...</h2>;
  }

  
  // Show a error message
  const isError = results.some(result => result.isError)
  if (isError) {
    return <h2>Error loading data...</h2>;
  }

  //console.log("RESULT 1:" + JSON.stringify(results[0].data))
  //console.log("RESULT 2:" + JSON.stringify(results[1].data))

  const logData = results[0].data
  const configData = results[1].data

  return (

    <Panel header="" className="p-panel-title ml-2 text-primary" >
      <img style={{ width: 380, height: 200 }} align="center" src="greenhouse.jpg" alt="Greenhouse" />
      <h1>Greenhouse Controller</h1>
   
      <Divider type="solid" />       

      <Card title="Status" className="card" border="white">
        <GreenhouseDetails data={logData} />
      </Card>

      <Divider type="solid" />

      <Card title="Configuration" className="card">
        <GreenhouseConfig configData={configData} configservice={configservice} />
      </Card>

      <Divider type="solid" />

      <Card title="Temperature" className="md:w-25rem" >
        <GreenhouseTemperature configData={configData} configservice={configservice}  />
      </Card>   

      <Divider type="solid" />

      <Card title="Vpd" className="md:w-25rem" >
        <GreenhouseVpd configData={configData} configservice={configservice}  />
      </Card>       

      <Divider type="solid" />          

      <Card title="Light" className="md:w-25rem">
        <GreenhouseLight configData={configData} configservice={configservice} />
      </Card>   

      <Divider type="solid" />       

      <Card title="Watering" className="md:w-25rem">
        <GreenhouseWatering configData={configData} configservice={configservice} />
      </Card>    

      <Divider type="solid" />       

      <Card title="Climate" className="md:w-25rem">
        <HumidityTempChart data={logData} />
      </Card>

      <Divider type="solid" />       

      <Card title="Co2" className="md:w-25rem">
        <Co2Chart data={logData} />
      </Card>

      <Divider type="solid" />       

      <Card title="Vpd" className="md:w-25rem">
        <VpdChart data={logData} />
      </Card>


    </Panel >



  );
};

export default IndustrialController;

