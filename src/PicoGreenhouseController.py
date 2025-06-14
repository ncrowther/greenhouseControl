import sys
import network
import socket
import time
from requests_2 import post, get
import json
import gc
import machine

from plantcare import PlantCare, WindowState, OnOffState

GREENHOUSE_DATASERVICE = 'http://192.168.1.33:3000' 
        
"""
This code is a Python program that controls a plant care system. 
It connects to a network, retrieves system time, temperature, humidity, 
and CO2 data from the plant care system, and logs the data to a Greenhouse Data Service. 
The program also includes a function to display an error message with a specific code and message.
"""
class PlantServer(object):
    
    ssid = 'TALKTALKE0F9AF_EXT'
    #ssid = 'TALKTALKE0F9AF'
    password = 'H6K8EK9M'  
    ipAddress = "ERR"
        
    def __init__(self):
        
        self.wlan = network.WLAN(network.STA_IF)
        self.ipAddress = self.connect_to_network()
        
        if self.ipAddress == None:
            self.plantCare = PlantCare(None)         
            self.displayError(99, "No WIFI")
            sys.exit(retval=-1)
        else:
            self.plantCare = PlantCare(self.ipAddress)
            timestamp = self.configure()
            self.plantCare.setDateTime(timestamp)
            
    """
    Connect to a Wi-Fi network.

    Parameters:
    self (object): The instance of the class.

    Returns:
    str: The IP address of the connected network.
    """    
    def connect_to_network(self):  
        
        try:        
            # Check if already connected
            print("Connect to Wi-Fi....")
            
            self.wlan.active(True)
            self.wlan.config(pm = 0xa11140) # Disable power-save mode
            self.wlan.connect(self.ssid, self.password)
        
            while True:

                print('waiting for connection...')
                time.sleep(6)

                if (self.wlan.status() == 3):                        
                    print('******** WIFI CONNECTED ********')

                    status = self.wlan.ifconfig()
                    ip = status[0]
                    print('ip = ' + ip)
                    self.ipAddress = ip
                    
                    print('IP address: '  + self.ipAddress)
                    
                    return self.ipAddress
            
        except Exception as e:
            print('Attempting connection') 

        
    """
    Configure the plant care system based on the configuration stored in the Greenhouse Data Service.

    Args:
        plantCare (PlantCare): The plant care system to configure.

    Returns:
        str: The timestamp of the last successful configuration.
    """
    def configure(self):
               
        plantCare = self.plantCare
        
        request_url = GREENHOUSE_DATASERVICE + '/config?id=default'
        resp = None
        timestamp = None
        
        gc.collect() 
        resp = None
        response = "ERROR"
        try:
            resp = get( request_url, timeout=2000)
            response = resp.text
            resp.close()
            
            print("************RESPONSE **********" + response)
      
            jsonData = json.loads(response)
            timestamp = jsonData["timestamp"]
            print("timestamp: " + timestamp) 
            
            self.reconfigure(plantCare, jsonData)               
        
        except Exception as e:
            if isinstance(e, OSError) and resp: # If the error is an OSError the socket has to be closed.
                print(resp)
                resp.close()
            print("CONNECTION ERROR " + str(e))
        finally:
            if resp:
                print(resp)
                resp.close()
                gc.collect()
                           
                return timestamp

    """
    Reonfigure the plant care system based on the configuration passed in.

    Args:
        plantCare (PlantCare): The plant care system to configure.
        jsonData: The new configuration

    """
    def reconfigure(self, plantCare, jsonData):
            
            # Config stored inside doc          
        doc = jsonData["doc"]

        lightOnOff = doc["lightOnOff"]
        onTime = lightOnOff[0]
        offTime = lightOnOff[1]        
        plantCare.setLightOnOffTime(onTime, offTime)
            
        lightState = doc["lightState"]
        plantCare.setLight(lightState)  # must be same as PlantCare.OnOffState                
            
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
            
        wateringTimes = doc["wateringTimes"]
        wateringPeriod = 20 #doc["wateringPeriod"] mins
        wateringMinTemp = 10 #doc["wateringMinTemp"]     C       
        plantCare.setWateringTimes(wateringTimes, wateringPeriod, wateringMinTemp)

           
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

            print("Care")
            self.plantCare.careforplants()
            
            # get config data
            timestamp = self.configure()
            print("************* TIME: " + str(timestamp))

            # If timestamp exists then log every LOG_TIME mins
            if (timestamp and (count % LOG_TIME == 0)):
                self.logger()
                self.plantCare.setDateTime(timestamp)

            time.sleep(SLEEP_TIME)

            count = count + 1
                            
        
    # This function is used to log data from the plant care system. 
    # It attempts to connect to the network, retrieve system time,  temperature, humidity, 
    # and CO2 from the plant care system, and then log the data. If any errors occur during this process, 
    # it will display an error message and reset the machine.
    def logger(self):  
        
        print('Start logger...')
        
        try: 
        
            self.connect_to_network()
                             
            temperatureData = self.plantCare.getTemperatureData()
            humidityData = self.plantCare.getHumidityData()
            co2Data = self.plantCare.getCo2Data()
            vpd = self.plantCare.getVpdData()
            lux = self.plantCare.getluxData()
            self.logData(temperatureData[0], temperatureData[1], humidityData[0], co2Data[0], vpd, lux[0])
                
        except Exception as err:
            sys.print_exception(err)
            print(f"Unexpected {err=}, {type(err)=}")
            self.displayError(123, "WIFI ERROR")
            machine.reset()
            
            
    # This code is a function that logs data to the Greenhouse Data Service. 
    def logData(self, airTemperature, leafTemperature, humidity, co2, vpd, lux):
        
        print("Logging data...")
        
        header = {
          'Content-Type': 'application/json',
          }
        
        payload = json.dumps({
          "airTemperature": airTemperature,
          "leafTemperature": leafTemperature,          
          "humidity": humidity,
          "co2": co2,
          "vpd": vpd,
          "lux": lux          
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
        #machine.reset()

main()





