const serviceEndpoint =
  process.env.NEXT_PUBLIC_DATA_SERVICE_END_POINT !== undefined
    ? process.env.NEXT_PUBLIC_DATA_SERVICE_END_POINT
    : 'https://dataservice.27uzmkl2grxv.us-south.codeengine.appdomain.cloud';
const sensecapDatalogEndpoint =
  process.env.NEXT_PUBLIC_SENSECAP_DATALOG_END_POINT !== undefined
    ? process.env.NEXT_PUBLIC_SENSECAP_DATALOG_END_POINT
    : 'https://sensecap.seeed.cc/openapi/list_telemetry_data?device_eui=2CF7F1C06490068B';
const sensecapSoilEndpoint =
  process.env.NEXT_PUBLIC_SENSECAP_SOIL_END_POINT !== undefined
    ? process.env.NEXT_PUBLIC_SENSECAP_SOIL_END_POINT
    : 'https://sensecap.seeed.cc/openapi/list_telemetry_data?device_eui=2CF7F1C06370017B';
const sensecapAuth =
  process.env.NEXT_PUBLIC_SENSECAP_AUTH !== undefined
    ? process.env.NEXT_PUBLIC_SENSECAP_AUTH
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
const configService = '/config';
const dataService = '/docs';
const lightService = '/light';
const heatService = '/heat';
const humidityService = '/humidity';
const fanService = '/fan';
const ventService = '/vent';
const waterService = '/water';
const pumpService = '/pump';
const photoService = '/photos';

// Global read/write endpoint variable (default to serviceEndpoint)
let endpoint = serviceEndpoint;
const getEndpoint = () => endpoint;
const setEndpoint = (value) => {
  endpoint = value;
};

exports.getEndpoint = getEndpoint;
exports.setEndpoint = setEndpoint;

exports.dataService = dataService;
exports.configService = configService;
exports.lightService = lightService;
exports.heatService = heatService;
exports.humidityService = humidityService;
exports.fanService = fanService;
exports.ventService = ventService;
exports.waterService = waterService;
exports.pumpService = pumpService;
exports.photoService = photoService;
exports.sensecapDatalogEndpoint = sensecapDatalogEndpoint;
exports.sensecapSoilEndpoint = sensecapSoilEndpoint;
exports.sensecapAuth = sensecapAuth;
