import http.client
import gc
import http
import urequests
import json

def getBearerToken():

    payload = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&response_type=cloud_iam&apikey=2cyXLlh7LNgB7Z_s3acLW7RiPmQXZs05Samh65FRZA1A'
    header = {
      'ibm-service-instance-id': 'pico',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    request_url = 'https://iam.cloud.ibm.com/identity/token'
    
    gc.collect() 
    resp = None
    try:
        resp = urequests.post(request_url, headers = header, data = payload).json()

        #jsonData = json.loads(data)
        accessToken = res["access_token"]
        
        bearerToken = 'Bearer ' + accessToken
        
        print(bearerToken)
        
    except Exception as e: # Here it catches any error.
        if isinstance(e, OSError) and resp: # If the error is an OSError the socket has to be closed.
            resp.close()
        bearerToken = {"error": e}
        
    gc.collect()               
    return bearerToken


def setConfig(plantCare, bearerToken):
         
    payload = ''
    header = {
      'Authorization': bearerToken }
    
    request_url = 'https://724c8e7f-5faa-49e1-8dc0-7a39ffd871ad-bluemix.cloudantnosqldb.appdomain.cloud/greenhouse/_all_docs?include_docs=true'

    response = urequests.get(request_url, headers = header)
 
    jsonData = response.json()
    print(jsonData)

    docs = jsonData["rows"][0]
    doc = docs["doc"]
    print(doc)

    lightOnOff = doc["lightOnOff"]
    onTime = lightOnOff[0]
    offTime = lightOnOff[1]
    print("Light on:" + onTime)
    print("Light off:" + offTime)        
    #plantCare.setLightOnOffTime(onTime, offTime)
    
    lightState = doc["lightState"]
    #plantCare.setLight(lightState)  # must be same as PlantCare.OnOffState      

    watering = doc["wateringTimes"]
    print(watering)

    temperature = doc["temperatureRange"]
    print(temperature)
    
    response.close()

def getDateTime():

    formatedTime = '00:00:00,Saturday,2000-01-01' 

    try: 
        ###  get date time
        r = urequests.get("http://worldtimeapi.org/api/timezone/Europe/London")
        datetime = r.json()
        print(datetime)
        # 2024-09-27T19:55:53.468676+01:0
        formatedTime = datetime["datetime"]
        formatedTime = formatedTime[11:19]
        formatedTime = formatedTime + ',Sunday,2024-09-22'
        print("Formatted time: " + formatedTime)
        r.close()
    
    finally:     
        return formatedTime

def logData(bearerToken, timestamp, temperature):
    
    header = {
      'Content-Type': 'application/json',
      'Authorization': bearerToken
      }
    
    payload = json.dumps({
      "timestamp": timestamp,
      "temperature": temperature,
    })
    
    request_url = 'https://724c8e7f-5faa-49e1-8dc0-7a39ffd871ad-bluemix.cloudantnosqldb.appdomain.cloud/greenhouselog'

    urequests.post(request_url, headers = header, data = payload)
    
 
while True:
    tok = getBearerToken()
    logData(tok, "1232", 0)
    print(tok)
