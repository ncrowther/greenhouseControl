import { useQuery } from '@tanstack/react-query';
import GreenhouseDetails from './GreenhouseDetails.js';
import HumidityChart from './HumidityChart.js';
import TemperatureChart from './TemperatureChart.js';
import HumidityTempChart from './HumidityTempChart.js';
import { Panel } from 'primereact/panel';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import queryString from 'query-string';
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";

const IndustrialController = () => {

  // Get params from URL
  const queryStringParams = queryString.parse(window.location.search);
  console.log("***queryStringParams.id: " + queryStringParams.driverId)

  //  fetch('https://dataservice.1apbmbk49s5e.eu-gb.codeengine.appdomain.cloud/docs', { mode: 'cors' }).then(
  const { data, isLoading, error } = useQuery({
    queryFn: () =>
      fetch('http://localhost:3000/docs', { mode: 'cors' }).then(
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

      <Panel header="" class="p-panel-title ml-2 text-primary">
        <img style={{ width: 600, height: 260 }} align="center" src="greenhouse.jpg" alt="Greenhouse" />
        <Card title="Pico Industrial Controller" className="md:w-25rem" style={{ color: 'black' }}>
          <GreenhouseDetails data={data} />
        </Card>

        <Card title="Humidity Temperature" className="md:w-25rem" style={{ color: 'black' }}>
          <HumidityTempChart data={data} />
        </Card>

        <Card title="Temperature" className="md:w-25rem" style={{ color: 'black' }}>
          <TemperatureChart data={data} />
        </Card>

        <Card title="Humidity" className="md:w-25rem" style={{ color: 'black' }}>
          <HumidityChart data={data} />
        </Card>


      </Panel>
   
 

  );
};

export default IndustrialController;

