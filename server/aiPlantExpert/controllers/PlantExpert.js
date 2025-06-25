'use strict';

var utils = require('../utils/writer.js');
var plantExpertService = require('../service/plantExpertService.js');

module.exports.plantexpert = function plantexpert (req, res, next, body, projectId, apiKey) {
  plantExpertService.getBearer(req, apiKey)
  .then(function (bearerTokenResponse) {
    console.log('****bearerTokenResponse: ', bearerTokenResponse);
    plantExpertService.askPlantQuestion(body, projectId, bearerTokenResponse)
    .then(function (watsonxResponse) {
      console.log('****OK: ');
      utils.writeJson(res, watsonxResponse);
    })
    .catch(function (watsonxResponse) {
      console.log('****ERROR: ' + watsonxResponse);
      utils.writeJson(res, watsonxResponse);
    });
  })
  .catch(function (bearerTokenResponse) {
    console.log('****bearer error: ', bearerTokenResponse);
    utils.writeJson(res, bearerTokenResponse);
  });
};
