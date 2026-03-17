const serviceEndpoint =
  process.env.REACT_APP_DATA_SERVICE_END_POINT !== undefined
    ? process.env.REACT_APP_DATA_SERVICE_END_POINT
    : 'http://86.4.208.162';
const sensecapDatalogEndpoint =
  process.env.REACT_APP_SENSECAP_DATALOG_END_POINT !== undefined
    ? process.env.REACT_APP_SENSECAP_DATALOG_END_POINT
    : 'https://sensecap.seeed.cc/openapi/list_telemetry_data?device_eui=2CF7F1C06490068B';
const sensecapSoilEndpoint =
  process.env.REACT_APP_SENSECAP_SOIL_END_POINT !== undefined
    ? process.env.REACT_APP_SENSECAP_SOIL_END_POINT
    : 'https://sensecap.seeed.cc/openapi/list_telemetry_data?device_eui=2CF7F1C06370017B';
const sensecapAuth =
  process.env.REACT_APP_SENSECAP_AUTH !== undefined
    ? process.env.REACT_APP_SENSECAP_AUTH
    : 'Basic WldGQ0M5VEJUQ0RUWllNNjowRkUwNUNCQzdBMTE0RURCODVBMDcyQ0Q2MjYxNjc2NzgzNTJBNjJEQkM5RjQ3NTM5N0VCNzFGMEI3QjJFNUE5';

//const serviceEndpoint = 'https://foxhound-hip-initially.ngrok-free.app';
//const serviceEndpoint = 'http://localhost:3000';
//const serviceEndpoint = 'http://86.4.208.162';
//const sensecapDatalogEndpoint =
//  'https://sensecap.seeed.cc/openapi/list_telemetry_data?device_eui=2CF7F1C06490068B';
//const sensecapSoilEndpoint =
//  'https://sensecap.seeed.cc/openapi/list_telemetry_data?device_eui=2CF7F1C06370017B';
//const sensecapAuth =
//  'Basic WldGQ0M5VEJUQ0RUWllNNjowRkUwNUNCQzdBMTE0RURCODVBMDcyQ0Q2MjYxNjc2NzgzNTJBNjJEQkM5RjQ3NTM5N0VCNzFGMEI3QjJFNUE5';

const configServiceEndpoint = `${serviceEndpoint}/config`;
const lightServiceEndpoint = `${serviceEndpoint}/light`;
const heatServiceEndpoint = `${serviceEndpoint}/heat`;
const humidityServiceEndpoint = `${serviceEndpoint}/humidity`;
const fanServiceEndpoint = `${serviceEndpoint}/fan`;
const ventServiceEndpoint = `${serviceEndpoint}/vent`;
const waterServiceEndpoint = `${serviceEndpoint}/water`;
const pumpServiceEndpoint = `${serviceEndpoint}/pump`;
const dataServiceEndpoint = `${serviceEndpoint}/docs`;
const photoServiceEndpoint = `${serviceEndpoint}/photos`;

exports.serviceEndpoint = serviceEndpoint;
exports.sensecapAuth = sensecapAuth;
exports.configServiceEndpoint = configServiceEndpoint;
exports.lightServiceEndpoint = lightServiceEndpoint;
exports.heatServiceEndpoint = heatServiceEndpoint;
exports.humidityServiceEndpoint = humidityServiceEndpoint;
exports.fanServiceEndpoint = fanServiceEndpoint;
exports.ventServiceEndpoint = ventServiceEndpoint;
exports.waterServiceEndpoint = waterServiceEndpoint;
exports.pumpServiceEndpoint = pumpServiceEndpoint;
exports.dataServiceEndpoint = dataServiceEndpoint;
exports.photoServiceEndpoint = photoServiceEndpoint;
exports.sensecapDatalogEndpoint = sensecapDatalogEndpoint;
exports.sensecapSoilEndpoint = sensecapSoilEndpoint;
exports.sensecapAuth = sensecapAuth;
