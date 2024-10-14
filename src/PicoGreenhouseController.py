import sys
import network
import socket
import time
import asyncio
import urequests
import json
import gc

from plantcare import PlantCare, WindowState, OnOffState

class PlantServer(object):
    
    ssid = 'TALKTALKE0F9AF_EXT'
    #ssid = 'TALKTALKE0F9AF'
    password = 'H6K8EK9M'
        
    def __init__(self):
        
        self.wlan = network.WLAN(network.STA_IF)
        ipAddress = self.connect_to_network()
        
        datetime = self.getDateTime()
        
        self.plantCare = PlantCare(datetime, ipAddress)
            
    
    def connect_to_network(self):

        print('Connecting to Network...')
        
        ip = "ERROR"
        self.wlan.active(True)
        self.wlan.config(pm = 0xa11140) # Disable power-save mode
        self.wlan.connect(self.ssid, self.password)

        max_wait = 10
        while max_wait > 0:
            if self.wlan.status() < 0 or self.wlan.status() >= 3:
                break
            max_wait -= 1
            print('waiting for connection...')
            time.sleep(2)

        if self.wlan.status() != 3:
            print('Network connection failed')
            raise OSError('Network connection failed')
        else:
            print('connected')
            status = self.wlan.ifconfig()
            ip = status[0]
            print('ip = ' + ip)
     
        return ip
            
    async def getBearerToken(self):

        payload = 'grant_type=urn%3Aibm%3Aparams%3Aoauth%3Agrant-type%3Aapikey&response_type=cloud_iam&apikey=2cyXLlh7LNgB7Z_s3acLW7RiPmQXZs05Samh65FRZA1A'
        header = {
          'ibm-service-instance-id': 'pico',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
        
        request_url = 'https://iam.cloud.ibm.com/identity/token'
        
        gc.collect() 
        resp = None
        bearerToken = None
        try:
            resp = urequests.post(request_url, headers = header, data = payload)
            
            jsonData = resp.json()
            accessToken = jsonData["access_token"]
            
            bearerToken = 'Bearer ' + accessToken         
            
        except Exception as e: # Here it catches any error.
            if isinstance(e, OSError) and resp: # If the error is an OSError the socket has to be closed.
                resp.close()
            print("Error: " +  e)
        finally:
            if resp:
                resp.close()
            gc.collect()
            print(bearerToken)
            return bearerToken


    async def setConfig(self, plantCare, bearerToken):
                    
        resp = None                    
        payload = ''
        header = {
          'Authorization': bearerToken }
        
        request_url = 'https://724c8e7f-5faa-49e1-8dc0-7a39ffd871ad-bluemix.cloudantnosqldb.appdomain.cloud/greenhouse/_all_docs?include_docs=true'

        try: 
            resp = urequests.get(request_url, headers = header)
     
            jsonData = resp.json()
            print(jsonData)

            docs = jsonData["rows"][0]
            doc = docs["doc"]
            print(doc)

            lightOnOff = doc["lightOnOff"]
            onTime = lightOnOff[0]
            offTime = lightOnOff[1]
            print("Light on:" + onTime)
            print("Light off:" + offTime)        
            plantCare.setLightOnOffTime(onTime, offTime)
            
            lightState = doc["lightState"]
            plantCare.setLight(lightState)  # must be same as PlantCare.OnOffState      

            watering = doc["wateringTimes"]
            print(watering)

            temperature = doc["temperatureRange"]
            print(temperature)
            
        except Exception as e: # Here it catches any error.
            if isinstance(e, OSError) and resp: # If the error is an OSError the socket has to be closed.
                resp.close()
            print(e)
        finally:
            if resp:
                resp.close()
            gc.collect()

    def getDateTime(self):

        formatedTime = '00:00:00,Saturday,2000-01-01' 
        resp = None
        try:
            r = urequests.get("http://worldtimeapi.org/api/timezone/Europe/London")
            datetime = r.json()
            print(datetime)
            # 2024-09-27T19:55:53.468676+01:0
            formatedTime = datetime["datetime"]
            formatedDate = formatedTime[0:10]
            formatedTime = formatedTime[11:19]
            formatedTime = formatedTime + ',Sunday,' + formatedDate
            print("Formatted time: " + formatedTime)
            r.close()
            
        except Exception as e: # Here it catches any error.
            print(e)
            if isinstance(e, OSError) and r: # If the error is an OSError the socket has to be closed.
                r.close()
        finally:   
            gc.collect()    
            return formatedTime
    
    async def logData(self, bearerToken, timestamp, temperature):
        
        header = {
          'Content-Type': 'application/json',
          'Authorization': bearerToken
          }
        
        payload = json.dumps({
          "timestamp": timestamp,
          "temperature": temperature,
        })
        
        request_url = 'https://724c8e7f-5faa-49e1-8dc0-7a39ffd871ad-bluemix.cloudantnosqldb.appdomain.cloud/greenhouselog'

        
        gc.collect() 
        resp = None
        try:
            resp = urequests.post(request_url, headers = header, data = payload)
            resp.close()
            
        except Exception as e: # Here it catches any error.
            if isinstance(e, OSError) and resp: # If the error is an OSError the socket has to be closed.
                resp.close()
        finally:   
            gc.collect()
        
        
    def displayError(self, code, message):
        self.plantCare.displayError(code, message)
        
    async def care(self):
        
        print('Start care...')
        
        while True:
           await self.plantCare.careforplants()
           await asyncio.sleep(10)                 

        
    async def logger(self):  
        
        print('Start logger...')
        
        FIFTEEN_MINUTES = 900 #900 secs
   
        await asyncio.sleep(15) # Give 15 seconds for the first temperature reading
        while True:
            tok = await self.getBearerToken()
            
            if (tok):
                time = self.plantCare.getSystemTime()
                temperatureData = self.plantCare.getTemperatureData()
                await self.logData(tok, time, temperatureData[0])
                
                # Get config data
                await self.setConfig(self.plantCare, tok)
            
            await asyncio.sleep(FIFTEEN_MINUTES)
            

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

        time = self.plantCare.getSystemTime()
        light = self.plantCare.getLightStatus()
        lightSettings = self.plantCare.getLightSettings()        
        windowStatus = self.plantCare.getWindowStatus()    
        windowAngle = self.plantCare.getWindowAngle()
        windowSettings = self.plantCare.getWindowSettings()
        pump = self.plantCare.getPumpStatus()
        pumpSettings = self.plantCare.getPumpSettings()
        
        temperatureData = self.plantCare.getTemperatureData()
    
        html = """<!DOCTYPE html>
        <html>
            <head> <title>Pico Greenhouse Controller</title> </head>
            <body> <h1 style="color:green;">Pico Greenhouse Controller</h1>
                <p>Time: {}</p>            
                <p>Light: {}</p>
                <p>Light Times: {}</p>                
                <p>Window Status: {} </p>                
                <p>Window Angle: {} Degrees</p>
                <p>Window Temperature Range: {}</p>                
                <p>Pump: {}</p>
                <p>Pump Times: {}</p>                   
                <p>Temperature: {:.2f}C</p>
                <p>High: {:.2f}C</p>
                <p>Low: {:.2f}C</p>
                
                <form action="/light/toggle" method="put" target="_blank">
                <input type="submit" value="Light">
                </form>
                
                <form action="/window/toggle" method="put" target="_blank">
                <input type="submit" value="Window">
                </form>             
                
                <form action="/pump/toggle" method="put" target="_blank">
                <input type="submit" value="Pump">
                </form>                
                
            </body>
        </html>
        """
        
        response = html.format(time, light, lightSettings, windowStatus, windowAngle, windowSettings, pump, pumpSettings, temperatureData[0], temperatureData[1], temperatureData[2])
        
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
            plantServer.care(),
            plantServer.logger())
        
        print(tasks)
        
    except Exception as err:
        sys.print_exception(err)
        errMsg = '{}: {}'.format(type(err).__name__, err)
        print(errMsg)
        plantServer.displayError(999, errMsg)
        raise

def doit():
    try: 
        asyncio.run(main())
    except Exception as err:
        sys.print_exception(err)
        print(f"Unexpected {err=}, {type(err)=}")
        pass

if __name__ == "__main__":
    
    doit()