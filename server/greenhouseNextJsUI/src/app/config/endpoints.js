///const serviceEndpoint = 'https://foxhound-hip-initially.ngrok-free.app';
const serviceEndpoint = 'http://localhost:3000';
const sensecapDatalogEndpoint =
  'https://sensecap.seeed.cc/openapi/list_telemetry_data?device_eui=2CF7F1C06490068B';
const sensecapSoilEndpoint =
  'https://sensecap.seeed.cc/openapi/list_telemetry_data?device_eui=2CF7F1C06370017B';
const sensecapAuth =
  'Basic WldGQ0M5VEJUQ0RUWllNNjowRkUwNUNCQzdBMTE0RURCODVBMDcyQ0Q2MjYxNjc2NzgzNTJBNjJEQkM5RjQ3NTM5N0VCNzFGMEI3QjJFNUE5';

const configServiceEndpoint = `${serviceEndpoint}/config`;
const lightServiceEndpoint = `${serviceEndpoint}/light`;
const heatServiceEndpoint = `${serviceEndpoint}/heat`;
const humidityServiceEndpoint = `${serviceEndpoint}/humidity`;
const fanServiceEndpoint = `${serviceEndpoint}/fan`;
const ventServiceEndpoint = `${serviceEndpoint}/vent`;
const waterServiceEndpoint = `${serviceEndpoint}/water`;
const dataServiceEndpoint = `${serviceEndpoint}/docs`;
const photoServiceEndpoint = `${serviceEndpoint}/photos`;

exports.configServiceEndpoint = configServiceEndpoint;
exports.lightServiceEndpoint = lightServiceEndpoint;
exports.heatServiceEndpoint = heatServiceEndpoint;
exports.humidityServiceEndpoint = humidityServiceEndpoint;
exports.fanServiceEndpoint = fanServiceEndpoint;
exports.ventServiceEndpoint = ventServiceEndpoint;
exports.waterServiceEndpoint = waterServiceEndpoint;
exports.dataServiceEndpoint = dataServiceEndpoint;
exports.photoServiceEndpoint = photoServiceEndpoint;
exports.sensecapDatalogEndpoint = sensecapDatalogEndpoint;
exports.sensecapSoilEndpoint = sensecapSoilEndpoint;
exports.sensecapAuth = sensecapAuth;
