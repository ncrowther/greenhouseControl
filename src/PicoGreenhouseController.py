import sys
import network
import socket
import time
import uasyncio as asyncio
import urequests
import json
from plantcare import PlantCare, WindowState, OnOffState

class PlantServer(object):
    
    ssid = 'TALKTALKE0F9AF_EXT'
    #ssid = 'TALKTALKE0F9AF'
    password = 'H6K8EK9M'
        
    def __init__(self):

        self.wlan = network.WLAN(network.STA_IF)
        self.connect_to_network()
        
        datetime = self.getDateTime() 
        self.plantCare = PlantCare(datetime)

    def connect_to_network(self):

        print('Connecting to Network...')
        
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
            raise RuntimeError('network connection failed')
        else:
            print('connected')
            status = self.wlan.ifconfig()
            print('ip = ' + status[0])      

    def getDateTime(self):

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
        return formatedTime
    
    def care(self):
        print("Care for plants...")
        await self.plantCare.careforplants()
        
        
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
        lightOn = request.find('/light/on')
        lightOff = request.find('/light/off')
        lightAuto = request.find('/light/auto')
        pumpOn = request.find('/pump/on')
        pumpOff = request.find('/pump/off')
        pumpAuto = request.find('/pump/auto')
        FOUND = 6
       
        # Window
        if windowOpen == FOUND:
            self.plantCare.setWindow(WindowState.OPEN)  
        if windowClosed == FOUND:
            self.plantCare.setWindow(WindowState.CLOSED)         
        if windowAuto == FOUND:
            self.plantCare.setWindow(WindowState.AUTO)            
        
        # Light
        if lightOn == FOUND:
            self.plantCare.setLight(OnOffState.ON)    
        if lightOff == FOUND:
            self.plantCare.setLight(OnOffState.OFF)
        if lightAuto == FOUND:
            self.plantCare.setLight(OnOffState.AUTO)
        
        # Pump
        if pumpOn == FOUND:
            self.plantCare.setPump(OnOffState.ON)          
        if pumpOff == FOUND:
            self.plantCare.setPump(OnOffState.OFF)       
        if pumpAuto == FOUND:
            self.plantCare.setPump(OnOffState.AUTO)                

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
    
    plantServer = PlantServer()

    try:  
        print('Start webserver...')
        asyncio.create_task(asyncio.start_server(plantServer.serve_client, "0.0.0.0", 80))
    
        while True:        
            await asyncio.create_task(plantServer.care())            
            await asyncio.sleep(5)      
    except Exception as e:
        sys.exit("Terminated after exception")

if __name__ == "__main__":
    try:
        asyncio.run(main())          
    finally:
        print("Restart....")
        asyncio.new_event_loop()
    
    

 