import sys
import network
import socket
import gc
import http
import urequests
import json


def logger(self):  
        
    print('Start logger...')
    
    try: 
    
        self.connect_to_network()
                         
        time = getDateTime()
        temperatureData = self.plantCare.getTemperatureData()
        humidityData = self.plantCare.getHumidityData()
        co2Data = self.plantCare.getCo2Data()
        vpd = 0
        await self.logData(time, temperatureData[0], humidityData[0], co2Data[0], vpd)
            
    except Exception as err:
        sys.print_exception(err)
        print(f"Unexpected {err=}, {type(err)=}")
        self.displayError(123, "WIFI ERROR")
        machine.reset() 
        
def logData(self, timestamp, temperature, humidity, co2, vpd):
    
    header = {
      'Content-Type': 'application/json',
      }
    
    payload = json.dumps({
      "timestamp": timestamp,
      "temperature": temperature,
      "humidity": humidity,
      "co2": co2,
      "vpd": vpd
    })
    
    request_url = 'https://dataservice.1apbmbk49s5e.eu-gb.codeengine.appdomain.cloud/doc'
 
    gc.collect() 
    resp = None
    try:
        resp = urequests.post(request_url, headers = header, data = payload)
        resp.close()
        
    except Exception as e: # Here it catches any error.
        print(e)
        if isinstance(e, OSError) and resp: # If the error is an OSError the socket has to be closed.
            resp.close()
    finally:   
        gc.collect()
                
 
while True:
    #tok = getBearerToken()
    logData("1232", 0, 0, 0, 0)
    print(tok)
