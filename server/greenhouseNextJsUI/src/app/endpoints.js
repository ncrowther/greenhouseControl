const serviceEndpoint = "http://localhost:3000" //"https://foxhound-hip-initially.ngrok-free.app"
const configServiceEndpoint = `${serviceEndpoint}/config?id=default`
const dataServiceEndpoint = `${serviceEndpoint}/docs`
const photoServiceEndpoint = `${serviceEndpoint}/photos`

exports.configServiceEndpoint =  configServiceEndpoint;
exports.dataServiceEndpoint =  dataServiceEndpoint;
exports.photoServiceEndpoint =  photoServiceEndpoint;