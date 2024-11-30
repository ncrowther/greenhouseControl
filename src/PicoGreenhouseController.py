import sys
import network
import socket
import time
import asyncio
from requests_2 import post, get
import json
import gc
import machine

from plantcare import PlantCare, WindowState, OnOffState

class PlantServer(object):
    
    #ssid = 'TALKTALKE0F9AF_EXT'
    ssid = 'TALKTALKE0F9AF'
    password = 'H6K8EK9M'  
    ipAddress = "IP"
        
    def __init__(self):
        
        # https://docs.pycom.io/tutorials/networks/wlan/
        self.wlan = network.WLAN(network.STA_IF)
        self.ipAddress = self.connect_to_network()
        
        if self.ipAddress == None:
            self.plantCare = PlantCare(None, None)         
            self.displayError(99, "No WIFI")
        else:            
            self.plantCare = PlantCare(self.ipAddress)
            
    
    def connect_to_network(self):

        print('Check Network...')    
        
        # Check if already connected
        #if self.wlan.status() != 3:
        print("Connecting to Wi-Fi...")
        
        self.wlan.active(True)
        self.wlan.config(pm = 0xa11140) # Disable power-save mode
        self.wlan.connect(self.ssid, self.password)

        max_wait = 100
        while max_wait > 0:
            if self.wlan.status() < 0 or self.wlan.status() >= 3:
                break
            max_wait -= 1
            print('waiting for connection...')
            time.sleep(2)

        if self.wlan.status() != 3:
            print('Network connection failed') 
            return None
        else:
            print('********************************************WIFI CONNECTED')
            status = self.wlan.ifconfig()
            ip = status[0]
            print('ip = ' + ip)
            self.ipAddress = ip
                
        status = self.wlan.ifconfig()
        return status[0]     
            
 
    def configure(self, plantCare):
            
        GREENHOUSE_DATASERVICE = 'https://dataservice.1apbmbk49s5e.eu-gb.codeengine.appdomain.cloud'
        
        request_url = GREENHOUSE_DATASERVICE + '/config?id=default'
        resp = None
        timestamp = "2024-09-01T00:00:00.000Z"
        
        gc.collect() 
        resp = None
        response = "ERROR"
        try:
            resp = get( request_url, timeout=10)
            response = resp.text
            resp.close()
            
            jsonData = json.loads(response)
            
            timestamp = jsonData["timestamp"]
            
            # Config stored inside doc          
            doc = jsonData["doc"]

            lightOnOff = doc["lightOnOff"]
            onTime = lightOnOff[0]
            offTime = lightOnOff[1]        
            plantCare.setLightOnOffTime(onTime, offTime)
            
            lightState = doc["lightState"]
            plantCare.setLight(lightState)  # must be same as PlantCare.OnOffState      

            wateringTimes = doc["wateringTimes"]       
            plantCare.setWateringTimes(wateringTimes)            
            
            pumpState = doc["pumpState"]
            plantCare.setPump(pumpState)  # must be same as PlantCare.OnOffState
            
            fanState = doc["fanState"]
            plantCare.setFan(fanState)  # must be same as PlantCare.OnOffState
            
            heaterState = doc["heaterState"]
            plantCare.setHeater(heaterState)  # must be same as PlantCare.OnOffState                
            
            windowState = doc["windowState"]
            plantCare.setWindow(windowState)  # must be same as PlantCare.WindowState
            
            temperatureRange = doc["temperatureRange"]            
            plantCare.setWindowTemperatureRange(temperatureRange[0], temperatureRange[1])            
        
        except Exception as e:
            if isinstance(e, OSError) and resp: # If the error is an OSError the socket has to be closed.
                resp.close()
            print(e)
        finally:
            if resp:
                resp.close()
            gc.collect()
            
            return timestamp
           
    def displayError(self, code, message):
        self.plantCare.displayError(code, message)
        
    def care(self):
        print('Start care...')
        
        SLEEP_TIME = 10
        LOG_TIME = 30 # fifteen mins
        
        count = 0
        
        while True:

            # get config data
            timestamp = self.configure(self.plantCare)
            
            self.plantCare.careforplants()
            
            if (count % LOG_TIME == 0):
                self.logger()
                if (count == 0):  # First time aroud use timestamp to set pico clock
                    self.plantCare.setDateTime(timestamp)
                
            asyncio.sleep(SLEEP_TIME)
            
            count = count + 1
                            
        
    def logger(self):  
        
        print('Start logger...')
        
        timestamp = "DATA SERVICE ERROR"
        try: 
        
            self.connect_to_network()
                             
            time = self.plantCare.getSystemTime()
            temperatureData = self.plantCare.getTemperatureData()
            humidityData = self.plantCare.getHumidityData()
            co2Data = self.plantCare.getCo2Data()
            vpd = 0
            self.logData(time, temperatureData[0], humidityData[0], co2Data[0], vpd)
                
        except Exception as err:
            sys.print_exception(err)
            print(f"Unexpected {err=}, {type(err)=}")
            self.displayError(123, "WIFI ERROR")
            machine.reset()
            
            
    def logData(self, timestamp, temperature, humidity, co2, vpd):
        
        GREENHOUSE_DATASERVICE = 'https://dataservice.1apbmbk49s5e.eu-gb.codeengine.appdomain.cloud'
        
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
        
        request_url = GREENHOUSE_DATASERVICE + '/doc'
     
        gc.collect() 
        resp = None
        response = "ERROR"
        try:
            resp = post( request_url, headers=header, data=payload, timeout=10)
            response = resp.text
            resp.close()
            
        except Exception as e: # Here it catches any error.
            print(e)
            if isinstance(e, OSError) and resp: # If the error is an OSError the socket has to be closed.
                resp.close()
        finally:   
            gc.collect()          
            return response
            

def main():   
               
    try: 
        plantServer = PlantServer()    
        plantServer.care()
        

    except Exception as err:
        sys.print_exception(err)
        errMsg = '{}: {}'.format(type(err).__name__, err)
        print(errMsg)
        machine.reset()

main()



