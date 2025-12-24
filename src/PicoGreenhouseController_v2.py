import sys
import network
import socket
import time
from requests import post, get
import json
import gc
import machine

from plantcare_v2 import PlantCare, WindowState, OnOffState
from StatusLight import StatusLight

#GREENHOUSE_DATASERVICE = 'http://192.168.0.207:3000' 
GREENHOUSE_DATASERVICE = 'http://86.4.208.162'


"""
This code is a Python program that controls a plant care system. 
It connects to a network, retrieves system time, temperature, humidity, 
and CO2 data from the plant care system, and logs the data to a Greenhouse Data Service. 
The program also includes a function to display an error message with a specific code and message.
"""
class PlantServer(object):
    
    #ssid = 'VM7763450'
    #password = 'udWrTpeejf86gugx' 
    ssid = 'MIFI_3880'
    password = None    
    ipAddress = "ERR"
        
    def __init__(self):
        
        self.statusLight = StatusLight()
        self.statusLight.setConnectingStatus()      
        
        self.wlan = network.WLAN(network.STA_IF)
        self.ipAddress = self.connect_to_network(self.ssid, self.password)
        
        print("***IP: " + str(self.ipAddress))
        
        if self.ipAddress == None:
            self.plantCare = PlantCare(None)         
            print("No WIFI")
            self.statusLight.setErroredStatus()  
        else:
            self.statusLight.setOperationalStatus()   
            self.plantCare = PlantCare(self.ipAddress)
            timestamp = self.configure()
            self.plantCare.setDateTime(timestamp)
            
    """
    Attempt Connection to WIFI
    """
    def wifiConnection(self, ssid, password):
        
        print("Connect to Wi-Fi: " + ssid)
                    
        try:
            
            if (password != None):
                self.wlan.connect(ssid, password)
            else:
                self.wlan.connect(ssid)
                
            MAX_TRIES = 3
            for i in range(MAX_TRIES):

                print('Connect attempt {}...'.format(i))
                time.sleep(6)

                print('Wlan status:' + self.getWlanStatus())
                
                wlanStatus = self.wlan.status()
                
                if (wlanStatus == network.STAT_GOT_IP):                        
                    print('******** WIFI CONNECTED ********')

                    status = self.wlan.ifconfig()
                    ip = status[0]
                    print('ip = ' + ip)
                    self.ipAddress = ip
                    
                    print('IP address: '  + self.ipAddress)
                    
                    return self.ipAddress
                
            else:  
                return None
            
        except Exception as e:
            err = self.getWlanStatus()
            print('Connection Error: ' + err)
            return None
        
    """
    Connect to a Wi-Fi network.

    Parameters:
    self (object): The instance of the class.

    Returns:
    str: The IP address of the connected network.
    """    
    def connect_to_network(self, ssid, password):  
        
        try:        
            # Check if already connected
            print("Connect to Wi-Fi....")
            
            self.wlan.active(True)
            self.wlan.config(pm = 0xa11140) # Disable power-save mode

            if (password):
                self.wlan.connect(ssid, password)
            else:
                self.wlan.connect(ssid)
            
            MAX_TRIES = 10
            for i in range(MAX_TRIES):

                print('waiting for connection attempt {}...'.format(i))
                time.sleep(6)

                print('Wlan status:' + self.getWlanStatus())
                
                wlanStatus = self.wlan.status()
                
                if (wlanStatus == network.STAT_GOT_IP):                        
                    print('******** WIFI CONNECTED ********')

                    status = self.wlan.ifconfig()
                    ip = status[0]
                    print('ip = ' + ip)
                    self.ipAddress = ip
                    
                    print('IP address: '  + self.ipAddress)
                    
                    return self.ipAddress
            
        except Exception as e:
            
            err = self.getWlanStatus()
                
            print('Error: ' + err)         
            

    """
    Get WIreless lan connection status
    """
    def getWlanStatus(self):
        
            err = "Unknown error"
            wlanStatus = self.wlan.status()
            if (wlanStatus == network.STAT_IDLE):
                err = "- no connection and no activity"

            if (wlanStatus == network.STAT_CONNECTING):
                err = "– connecting in progress"

            if (wlanStatus ==  network.STAT_WRONG_PASSWORD):
                err = "– failed due to incorrect password"

            if (wlanStatus ==  network.STAT_NO_AP_FOUND):
                err = "– failed because no access point replied"

            if (wlanStatus ==  network.STAT_CONNECT_FAIL):
                err = "– failed due to other problems"
                
            return err
        
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
            print("configure(): CONNECTION ERROR " + str(e))
        finally:
            if resp:
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
        
        temperatureRange = doc["temperatureRange"]            
        plantCare.setTemperatureRange(temperatureRange[0], temperatureRange[1])        
                
        windowState = doc["windowState"]
        plantCare.setWindow(windowState)  # must be same as PlantCare.WindowState
        
        pumpState = doc["pumpState"]
        plantCare.setPump(pumpState)  # must be same as PlantCare.OnOffState
        
        fanState = doc["fanState"]
        plantCare.setFan(fanState)  # must be same as PlantCare.OnOffState        
        
        wateringPeriod = doc["wateringDuration"]  	# minutes
        wateringTimes = doc["wateringTimes"]  		# list of three start times in 24H format
        wateringMinTemp = 5       					# Not implemented
        plantCare.setWateringTimes(wateringTimes, wateringPeriod, wateringMinTemp)        
            

    # This function is used to log data from the plant care system. 
    # It attempts to connect to the network and log the data. If any errors occur during this process, 
    # it will display an error message and reset the machine.
    def logger(self):  
        
        print('Start logger...')
        
        try: 
        
            self.connect_to_network(self.ssid, self.password)
                             
            temperatureData = self.plantCare.getTemperatureData()
            humidityData = self.plantCare.getHumidityData()

            self.logData(temperatureData, humidityData)
                
        except Exception as err:
            sys.print_exception(err)
            print(f"Unexpected {err=}, {type(err)=}")
            self.displayError(123, "SYSTEM ERROR")
            machine.reset()
            
            
    # Logs data to the Greenhouse Data Service. 
    def logData(self, airTemperature, humidity):
        
        print("Logging data...")
        
        header = {
          'Content-Type': 'application/json',
          }
        
        payload = json.dumps({
          "airTemperature": airTemperature,
          "leafTemperature": 0,          
          "humidity": humidity,
          "co2": 0,
          "vpd": 0,
          "lux": 0          
        })
        
        request_url = GREENHOUSE_DATASERVICE + '/doc?id=polytunnel'
     
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
    This function is responsible for caring for plants.

    Parameters:
    self (object): An instance of the class.

    Returns:
    None
    """
    def care(self):
        print('Start care...')
        
        statusLight = StatusLight()        
        
        SLEEP_TIME = 10
        LOG_TIME = 90 # log period in seconds = SLEEP_TIME * LOG_TIME
        
        count = 0
        
        while True:

            print("Care")
            
            self.plantCare.careforplants()
            
            # get config data
            timestamp = self.configure()
            
            # If timestamp exists then log every LOG_TIME mins
            if (timestamp and (count % LOG_TIME == 0)):
                self.logger()
                self.plantCare.setDateTime(timestamp)            
 
            print('Sleep for {} seconds'.format(SLEEP_TIME))
            
            statusLight.setSleepingStatus()                       
            time.sleep(SLEEP_TIME)           
            statusLight.setOperationalStatus()

            count = count + 1
                            
        
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


