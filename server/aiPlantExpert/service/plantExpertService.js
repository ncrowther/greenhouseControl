'use strict';

var request = require('request');
var responseParser = require('../utils/responseParser.js');

/**
 * Get bearer token 
 *
 * returns Bearer Token given API Key
 **/
exports.getBearer = function (req, apiKey) {

  return new Promise(function (resolve, reject) {

    console.log("***getBearer");

    console.log('*** ApiKey: ', apiKey);

    var options = {
      'method': 'POST',
      'url': 'https://iam.cloud.ibm.com/identity/token',
      'headers': {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      form: {
        'grant_type': 'urn:ibm:params:oauth:grant-type:apikey',
        'apikey': apiKey
      }
    };

    request(options, function (error, response) {
      if (error) throw new Error(error);

      var responseJson = JSON.parse(response.body);
      console.log(responseJson);

      var accessToken = responseJson.access_token;

      console.log("Token: " + accessToken);

      resolve(accessToken);

    });

  });
}

/**
 * Ask plant Question
 *
 * body Request question on plant
 * projectId String Project Identifier 
 * apiKey String Api Key
 * min_new_tokens Integer min length of generated questions (optional)
 * max_new_tokens Integer max length of generated questions (optional)
 * returns Response
 **/
exports.askPlantQuestion = function (body, projectId, token) {

  return new Promise(function (resolve, reject) {

    var bearerToken = "Bearer " + token;
    console.log("*************askPlantQuestion");

    var plant = body.plant;
    const prompt =  '"You are an expert horticulturalist.  Recommend greenhouse growing conditions for a  plant.  In your anwer specify Temperature range in celcius,  light as full sun, partial shade or full shade, humidity in percent,  watering level as high medium or low.  Supply your answer only in table format.\n\nInput: how to grow a ' + plant + '\nOutput:'

    console.log('Prompt: ', prompt);

    var inputPayload = {
      "input": prompt,
      "parameters": {
        "decoding_method": "greedy",
        "max_new_tokens": 200,
        "min_new_tokens": 0,
        "stop_sequences": [],
        "repetition_penalty": 1
      },
      "model_id": "ibm/granite-3-8b-instruct",
      "project_id": projectId,
      "moderations": {
        "hap": {
          "input": {
            "enabled": true,
            "threshold": 0.5,
            "mask": {
              "remove_entity_value": true
            }
          },
          "output": {
            "enabled": true,
            "threshold": 0.5,
            "mask": {
              "remove_entity_value": true
            }
          }
        },
        "pii": {
          "input": {
            "enabled": true,
            "threshold": 0.5,
            "mask": {
              "remove_entity_value": true
            }
          },
          "output": {
            "enabled": true,
            "threshold": 0.5,
            "mask": {
              "remove_entity_value": true
            }
          }
        },
        "granite_guardian": {
          "input": {
            "enabled": false,
            "threshold": 1
          }
        }
      }
    }

    const watsonx_ai_url = 'https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29'
    var inputStr = JSON.stringify(inputPayload);
    console.log('***inputStr: ', inputStr);

    var options = {
      'method': 'POST',
      'url': watsonx_ai_url,
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': bearerToken,
      },
      body: inputStr
    };

    request(options, function (error, response) {
      if (error) throw new Error(error);
      console.log(response.body);

      var responsePayload = {
        "generated": "Cannot generate",
      };

      var responseJson = JSON.parse(response.body);

      console.log('***Response: ', responseJson);

      if (responseJson.status_code != 403) {

        if (responseJson.errors) {

          console.log('***result: ', JSON.stringify(responseJson.errors));
          resolve(responseJson.errors);
          return;
        }

        var generatedTxt = responseJson.results[0].generated_text

        console.log('***generatedTxt: ', generatedTxt);

        var r = responseParser.extractData(generatedTxt)

        responsePayload = {
          "generated": generatedTxt,
          "lux": r.lux,
          "lightOn": r.lightOn,
          "lightOff": r.lightOff,
          "highTemp": r.highTemp,
          "lowTemp": r.lowTemp,
          "highHumidity": r.highHumidity,
          "lowHumidity": r.lowHumidity,          
          "wateringDuration": r.wateringDuration,
          "waterTime1": r.waterTime1,
          "waterTime2": r.waterTime2,
          "waterTime3": r.waterTime3,                    
        }
      }

      resolve(responsePayload);

    });

  })
}

