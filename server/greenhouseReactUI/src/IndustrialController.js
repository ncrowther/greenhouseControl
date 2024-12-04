import { useQuery } from '@tanstack/react-query';
import GreenhouseConfig from './GreenhouseConfig.js';
import GreenhouseTemperature from './GreenhouseTemperature.js';
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

  const { data : logData, isLoading, error } = useQuery({
    queryFn: () =>
      fetch('https://dataservice.1apbmbk49s5e.eu-gb.codeengine.appdomain.cloud/docs', { mode: 'cors' }).then(
        // fetch('http://localhost:3000/docs', { mode: 'cors' }).then(
        (res) => res.json()
      ),
  });


  // Get config from data API
  
  const { data: jsonConfig } = useQuery({
    queryFn: () =>
      fetch('https://dataservice.1apbmbk49s5e.eu-gb.codeengine.appdomain.cloud/config?id=default', { mode: 'cors' }).then(
        (res) => res.json()
      ),
    queryKey: [''],
  });



  // Show a loading message while data is fetching
  if (isLoading) {
    return <h2>Loading...</h2>;
  }

  // to handle error
  if (error) {
    return <div className="error">Error fetching data from Cloudant</div>
  }



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
        <GreenhouseConfig jsonConfig={jsonConfig} />
      </Card>

      <Divider type="solid" />

      <Card title="Temperature" className="md:w-25rem" >
        <GreenhouseTemperature jsonConfig={jsonConfig} />
      </Card>   

      <Divider type="solid" />          

      <Card title="Light" className="md:w-25rem">
        <GreenhouseLight jsonConfig={jsonConfig} />
      </Card>   

      <Divider type="solid" />       

      <Card title="Watering" className="md:w-25rem">
        <GreenhouseWatering jsonConfig={jsonConfig} />
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

