import http.client
import json

def getBearerToken():

    conn = http.client.HTTPSConnection("iam.cloud.ibm.com")
    payload = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&response_type=cloud_iam&apikey=2cyXLlh7LNgB7Z_s3acLW7RiPmQXZs05Samh65FRZA1A'
    headers = {
      'ibm-service-instance-id': 'pico',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    conn.request("POST", "/identity/token", payload, headers)
    res = conn.getresponse()
        
    data = res.read().decode("utf-8")

    jsonData = json.loads(data)
    accessToken = jsonData["access_token"]
    
    bearerToken = 'Bearer ' + accessToken
    
    print(bearerToken)
  
    return bearerToken


def getConfig(bearerToken):

    conn = http.client.HTTPSConnection("724c8e7f-5faa-49e1-8dc0-7a39ffd871ad-bluemix.cloudantnosqldb.appdomain.cloud")
    payload = ''
    headers = {
      'Authorization': bearerToken }
    conn.request("GET", "/greenhouse/_all_docs?include_docs=true", payload, headers)
    res = conn.getresponse()
    data = res.read().decode("utf-8")
    #print(data)


    jsonData = json.loads(data)
    docs = jsonData["rows"][0]
    doc = docs["doc"]
    print(doc)

    light = doc["light"]
    print(light)

    watering = doc["watering"]
    print(watering)

    temperature = doc["temperature"]
    print(temperature)
    
   
tok = getBearerToken()
getConfig(tok)
