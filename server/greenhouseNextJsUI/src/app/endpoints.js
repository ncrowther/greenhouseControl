const serviceEndpoint = 'https://foxhound-hip-initially.ngrok-free.app';
const sensecapEndpoint =
  'https://sensecap.seeed.cc/openapi/list_telemetry_data?device_eui=2CF7F1C06490068B';
const sensecapAuth =
  'Basic WldGQ0M5VEJUQ0RUWllNNjowRkUwNUNCQzdBMTE0RURCODVBMDcyQ0Q2MjYxNjc2NzgzNTJBNjJEQkM5RjQ3NTM5N0VCNzFGMEI3QjJFNUE5';

const configServiceEndpoint = `${serviceEndpoint}/config?id=default`;
const dataServiceEndpoint = `${serviceEndpoint}/docs`;
const photoServiceEndpoint = `${serviceEndpoint}/photos`;

exports.configServiceEndpoint = configServiceEndpoint;
exports.dataServiceEndpoint = dataServiceEndpoint;
exports.photoServiceEndpoint = photoServiceEndpoint;
exports.sensecapEndpoint = sensecapEndpoint;
exports.sensecapAuth = sensecapAuth;
