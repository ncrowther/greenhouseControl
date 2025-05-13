const serviceEndpoint =
  'https://dataservice.1vdupw89gv43.eu-gb.codeengine.appdomain.cloud';
const configServiceEndpoint = `${serviceEndpoint}/config?id=default`;
const dataServiceEndpoint = `${serviceEndpoint}/docs`;
const photoServiceEndpoint = `${serviceEndpoint}/photos`;

exports.configServiceEndpoint = configServiceEndpoint;
exports.dataServiceEndpoint = dataServiceEndpoint;
exports.photoServiceEndpoint = photoServiceEndpoint;
