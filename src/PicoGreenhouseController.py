import network
import socket
import time
import uasyncio as asyncio
from plantcare import PlantCare

plantCare = PlantCare()

ssid = 'TALKTALKE0F9AF'
password = 'H6K8EK9M'

html = """<!DOCTYPE html>
<html>
    <head> <title>Pico Greenhouse Controller</title> </head>
    <body> <h1>Pico Greenhouse Controller</h1>
        <p>Time: {}</p>
        <p>Manual Override: {}</p>  
        <p>Temperature: {:.2f}</p>
        <p>High: {:.2f}</p>
        <p>Low: {:.2f}</p>
    </body>
</html>
"""

wlan = network.WLAN(network.STA_IF)

def connect_to_network():

    wlan.active(True)
    wlan.config(pm = 0xa11140) # Disable power-save mode
    wlan.connect(ssid, password)

    max_wait = 10
    while max_wait > 0:
        if wlan.status() < 0 or wlan.status() >= 3:
            break
        max_wait -= 1
        print('waiting for connection...')
        time.sleep(2)

        if wlan.status() != 3:
            raise RuntimeError('network connection failed')
        else:
            print('connected')
            status = wlan.ifconfig()
            print('ip = ' + status[0])
        
async def serve_client(reader, writer):

    global plantCare
    
    print("Client connected")
    request_line = await reader.readline()
    print("Request:", request_line)
    # We are not interested in HTTP request headers, skip them
    while await reader.readline() != b"\r\n":
        pass

    request = str(request_line)
    windowAuto = request.find('/window/auto')    
    windowOpen = request.find('/window/open')
    windowClosed = request.find('/window/close')
    print( 'window auto = ' + str(windowAuto))    
    print( 'window open = ' + str(windowOpen))
    print( 'window closed = ' + str(windowClosed))

    stateis = ""
    if windowAuto == 6:
        await plantCare.manualOverrideOff()
        stateis = "Window Auto"
        
    if windowOpen == 6:
        await plantCare.openWindows()
        stateis = "Window Open"

    if windowClosed == 6:
        await plantCare.closeWindows()
        stateis = "Window Closed"

    systemData = await plantCare.getSystemData()
    temperatureData = await plantCare.getTemperatureData()
    
    response = html.format(systemData[0], systemData[1], temperatureData[0], temperatureData[1], temperatureData[2])
    
    writer.write('HTTP/1.0 200 OK\r\nContent-type: text/html\r\n\r\n')
    writer.write(response)

    await writer.drain()
    await writer.wait_closed()
    print("Client disconnected")

async def main():
    
    print('Connecting to Network...')
    connect_to_network()

    print('Setting up webserver...')
    asyncio.create_task(asyncio.start_server(serve_client, "0.0.0.0", 80))

    while True:
        asyncio.create_task(plantCare.careforplants())
        await asyncio.sleep(5)
    #await asyncio.gather(plantCare.careforplants())

if __name__ == "__main__":
    try:
        asyncio.run(main())          
    finally:
        asyncio.new_event_loop()
    
    
