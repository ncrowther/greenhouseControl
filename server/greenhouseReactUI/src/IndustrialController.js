import { useQuery } from '@tanstack/react-query';
import GreenhouseDetails from './GreenhouseDetails.js';
import HumidityTempCo2Chart from './HumidityTempCo2Chart.js';
import HumidityChart from './HumidityChart.js';
import TemperatureChart from './TemperatureChart.js';
import Co2Chart from './Co2Chart.js';
import { Panel } from 'primereact/panel';
import { Card } from 'primereact/card';
import queryString from 'query-string';
import "primereact/resources/themes/bootstrap4-light-blue/theme.css";

/**
 * This function is responsible for rendering the IndustrialController React UI.
 * It fetches data from a Cloudant database and displays it in various charts.
 * 
 * @returns {JSX.Element} - The JSX element representing the IndustrialController component.
 */
const IndustrialController = () => {

  // Get customer id from URL (not currently used)
  const queryStringParams = queryString.parse(window.location.search);
  console.log("***queryStringParams.id: " + queryStringParams.id)

  const { data, isLoading, error } = useQuery({
    queryFn: () =>
      fetch('https://dataservice.1apbmbk49s5e.eu-gb.codeengine.appdomain.cloud/docs', { mode: 'cors' }).then(
      // fetch('http://localhost:3000/docs', { mode: 'cors' }).then(
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

        <Card title="Humidity Temperature Co2" className="md:w-25rem" style={{ color: 'black' }}>
          <HumidityTempCo2Chart data={data} />
        </Card>

        <Card title="Temperature" className="md:w-25rem" style={{ color: 'black' }}>
          <TemperatureChart data={data} />
        </Card>

        <Card title="Humidity" className="md:w-25rem" style={{ color: 'black' }}>
          <HumidityChart data={data} />
        </Card>

        <Card title="Co2" className="md:w-25rem" style={{ color: 'black' }}>
          <Co2Chart data={data} />
        </Card>        


      </Panel>
   
 

  );
};

export default IndustrialController;

