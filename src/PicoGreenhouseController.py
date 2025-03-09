import sys
import network
import socket
import time
from requests_2 import post, get
import json
import gc
import machine

from plantcare import PlantCare, WindowState, OnOffState

GREENHOUSE_DATASERVICE = 'https://ph8pr72f-3000.uks1.devtunnels.ms' #'https://lz4fm5hn-3000.uks1.devtunnels.ms'
        
"""
This code is a Python program that controls a plant care system. 
It connects to a network, retrieves system time, temperature, humidity, 
and CO2 data from the plant care system, and logs the data to a Greenhouse Data Service. 
The program also includes a function to display an error message with a specific code and message.
"""
class PlantServer(object):
    
    #ssid = 'TALKTALKE0F9AF_EXT'
    ssid = 'TALKTALKE0F9AF'
    password = 'H6K8EK9M'  
    ipAddress = "ERR"
        
    def __init__(self):
        
        self.wlan = network.WLAN(network.STA_IF)
        self.ipAddress = self.connect_to_network()
        
        if self.ipAddress == None:
            self.plantCare = PlantCare(None, None)         
            self.displayError(99, "No WIFI")
        else:            
            self.plantCare = PlantCare(self.ipAddress)
            
    """
    Connect to a Wi-Fi network.

    Parameters:
    self (object): The instance of the class.

    Returns:
    str: The IP address of the connected network.
    """    
    def connect_to_network(self):

        print('Check Network...')    
        
        # Check if already connected
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
            
    """
    Configure the plant care system based on the configuration stored in the Greenhouse Data Service.

    Args:
        plantCare (PlantCare): The plant care system to configure.

    Returns:
        str: The timestamp of the last successful configuration.
    """
    def configure(self, plantCare):
               
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
            plantCare.setTemperatureRange(temperatureRange[0], temperatureRange[1])            
        
        except Exception as e:
            if isinstance(e, OSError) and resp: # If the error is an OSError the socket has to be closed.
                resp.close()
            print(e)
        finally:
            if resp:
                resp.close()
            gc.collect()
            
            return timestamp
           
    """
    This function displays an error message with a specific code and message.

    Args:
        code (int): The error code.
        message (str): The error message.

    Returns:
        None
    """
    def displayError(self, code, message):
        self.plantCare.displayError(code, message)
        
    """
    This function is responsible for caring for plants.

    Parameters:
    self (object): An instance of the class.

    Returns:
    None
    """
    def care(self):
        print('Start care...')
        
        SLEEP_TIME = 5
        LOG_TIME = 90 # log period in seconds = SLEEP_TIME * LOG_TIME
        
        count = 0
        
        while True:

            # get config data
            timestamp = self.configure(self.plantCare)
            
            self.plantCare.careforplants()
            
            if (count % LOG_TIME == 0):
                self.logger()
                if (count == 0):  # First time around use timestamp to set pico clock
                    self.plantCare.setDateTime(timestamp)
                
            time.sleep(SLEEP_TIME)
            
            count = count + 1
                            
        
    # This function is used to log data from the plant care system. 
    # It attempts to connect to the network, retrieve system time,  temperature, humidity, 
    # and CO2 from the plant care system, and then log the data. If any errors occur during this process, 
    # it will display an error message and reset the machine.
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
            
            
    # This code is a function that logs data to the Greenhouse Data Service. 
    # The response from the server is returned.
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
            
"""
This function is the main entry point for the program.

Parameters:
None

Returns:
None
"""
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
