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
            
 
    async def configure(self, plantCare):
            
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
        
    async def care(self):
        print('Start care...')
        
        SLEEP_TIME = 10
        LOG_TIME = 30 # fifteen mins
        
        count = 0
        
        while True:

            # get config data
            timestamp = await self.configure(self.plantCare)
            
            await self.plantCare.careforplants()
            
            if (count % LOG_TIME == 0):
                await self.logger()
                if (count == 0):  # First time aroud use timestamp to set pico clock
                    self.plantCare.setDateTime(timestamp)
                
            await asyncio.sleep(SLEEP_TIME)
            
            count = count + 1
                            
        
    async def logger(self):  
        
        print('Start logger...')
        
        timestamp = "DATA SERVICE ERROR"
        try: 
        
            self.connect_to_network()
                             
            time = self.plantCare.getSystemTime()
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
            
            
    async def logData(self, timestamp, temperature, humidity, co2, vpd):
        
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
            
            
    async def serve_client(self, reader, writer):
        
        print("Client connected")
                    
        request_line = await reader.readline()
        print("Request:", request_line)
        # We are not interested in HTTP request headers, skip them
        while await reader.readline() != b"\r\n":
            pass

        request = str(request_line)
        
        windowOpen = request.find('/window/open')
        windowClosed = request.find('/window/close')
        windowAuto = request.find('/window/auto')
        windowToggle = request.find('/window/toggle')
        
        lightOn = request.find('/light/on')
        lightOff = request.find('/light/off')
        lightAuto = request.find('/light/auto')
        lightToggle = request.find('/light/toggle')
        
        pumpOn = request.find('/pump/on')
        pumpOff = request.find('/pump/off')
        pumpAuto = request.find('/pump/auto')
        pumpToggle = request.find('/pump/toggle')
        
        fanOn = request.find('/fan/on')
        fanOff = request.find('/fan/off')
        fanAuto = request.find('/fan/auto')
        fanToggle = request.find('/fan/toggle')
        
        heaterOn = request.find('/heater/on')
        heaterOff = request.find('/heater/off')
        heaterAuto = request.find('/heater/auto')
        heaterToggle = request.find('/heater/toggle')
        
        FOUND = 6
       
        # Window
        if windowOpen == FOUND:
            self.plantCare.setWindow(WindowState.OPEN)  
        if windowClosed == FOUND:
            self.plantCare.setWindow(WindowState.CLOSED)         
        if windowAuto == FOUND:
            self.plantCare.setWindow(WindowState.AUTO)
        if windowToggle == FOUND:
            self.plantCare.toggleWindow()       
        
        # Light
        if lightOn == FOUND:
            self.plantCare.setLight(OnOffState.ON)    
        if lightOff == FOUND:
            self.plantCare.setLight(OnOffState.OFF)
        if lightAuto == FOUND:
            self.plantCare.setLight(OnOffState.AUTO)
        if lightToggle == FOUND:
            self.plantCare.toggleLight()            
        
        # Pump
        if pumpOn == FOUND:
            self.plantCare.setPump(OnOffState.ON)          
        if pumpOff == FOUND:
            self.plantCare.setPump(OnOffState.OFF)       
        if pumpAuto == FOUND:
            self.plantCare.setPump(OnOffState.AUTO)
        if pumpToggle == FOUND:
            self.plantCare.togglePump()
            
        # Fan
        if fanOn == FOUND:
            self.plantCare.setFan(OnOffState.ON)          
        if fanOff == FOUND:
            self.plantCare.setFan(OnOffState.OFF)       
        if fanAuto == FOUND:
            self.plantCare.setFan(OnOffState.AUTO)
        if fanToggle == FOUND:
            self.plantCare.toggleFan()             
            
        # Heater
        if heaterOn == FOUND:
            self.plantCare.setHeater(OnOffState.ON)          
        if heaterOff == FOUND:
            self.plantCare.setHeater(OnOffState.OFF)       
        if heaterAuto == FOUND:
            self.plantCare.setHeater(OnOffState.AUTO)
        if heaterToggle == FOUND:
            self.plantCare.toggleHeater()            

        time = self.plantCare.getSystemTime()
        light = self.plantCare.getLightStatus()
        lightSettings = self.plantCare.getLightSettings()        
        windowStatus = self.plantCare.getWindowStatus()    
        windowAngle = self.plantCare.getWindowAngle()
        windowSettings = self.plantCare.getWindowSettings()
        fan = self.plantCare.getFanStatus()
        fanSettings = self.plantCare.getFanSettings()        
        pump = self.plantCare.getPumpStatus()
        pumpSettings = self.plantCare.getPumpSettings()
        heater = self.plantCare.getHeaterStatus()
        heaterSettings = self.plantCare.getHeaterSettings()
        
        temperatureData = self.plantCare.getTemperatureData()
        humidityData = self.plantCare.getHumidityData()
        
        html = """<!DOCTYPE html>
        <html>
            <head> <title>Pico Greenhouse Controller</title> </head>
            <body> <h1 style="color:green;">Pico Greenhouse Controller</h1>
                <p>DateTime: {}</p>            
                <p>Light: {}</p>
                <p>Light Times: {}</p>                
                <p>Window Status: {} </p>                
                <p>Window Angle: {} Degrees</p>
                <p>Window Temperature Range: {}</p>                
                <p>Pump: {}</p>
                <p>Pump Times: {}</p>
                <p>Fan: {}</p>
                <p>Fan Temperature Range: {}</p>                    
                <p>Heater: {}</p>
                <p>Heater Temperature Range: {}</p>                     
                <p>Temperature: {:.2f}C High: {:.2f}C Low: {:.2f}C</p>
                <p>Humidity: {:.2f}% High: {:.2f}% Low: {:.2f}%</p>                
                
                <form action="/light/toggle" method="put" target="_blank">
                <input type="submit" value="Light">
                </form>
                
                <form action="/window/toggle" method="put" target="_blank">
                <input type="submit" value="Window">
                </form>             
                
                <form action="/pump/toggle" method="put" target="_blank">
                <input type="submit" value="Pump">
                </form>
                
                <form action="/fan/toggle" method="put" target="_blank">
                <input type="submit" value="Fan">
                </form>                       
                
                <form action="/heater/toggle" method="put" target="_blank">
                <input type="submit" value="Heater">
                </form>                  
                
            </body>
        </html>
        """  
        response = html.format(time,
                               light,
                               lightSettings,
                               windowStatus,
                               windowAngle,
                               windowSettings,
                               pump,
                               pumpSettings,
                               fan,
                               fanSettings,                               
                               heater,
                               heaterSettings,
                               temperatureData[0],
                               temperatureData[1],
                               temperatureData[2],
                               humidityData[0],
                               humidityData[1],
                               humidityData[2])
        
        writer.write('HTTP/1.0 200 OK\r\nContent-type: text/html\r\n\r\n')
        writer.write(response)

        await writer.drain()
        await writer.wait_closed()
        print("Client disconnected")

async def main():   
               
    try: 
        plantServer = PlantServer()

        tasks = await asyncio.gather(
            asyncio.start_server(plantServer.serve_client, "0.0.0.0", 80),
            plantServer.care())
        
        print(tasks)


    except Exception as err:
        sys.print_exception(err)
        errMsg = '{}: {}'.format(type(err).__name__, err)
        print(errMsg)
        self.displayError(123, "WIFI ERROR")
        machine.reset()

def doit():
    try: 
        asyncio.run(main())
    except Exception as err:
        sys.print_exception(err)
        print(f"Unexpected {err=}, {type(err)=}")

if __name__ == "__main__":
    
    doit()


