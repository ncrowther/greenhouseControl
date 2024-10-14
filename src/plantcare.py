import sys
from machine import Pin, PWM, ADC, I2C
import dht
import time
import binascii
import machine
import onewire
import ds18x20
from machine_i2c_lcd import I2cLcd
import asyncio

#################################################
### Greenouse controller for Rasberry Pi Pico ###
### Author: Nigel T. Crowther
### Date: 03-Sep-2024
#################################################

# Define midnight reset period
RESET_HOUR = 00 # 24 hour
RESET_ON_TIME  = time.mktime((2000, 01, 01, RESET_HOUR, 00, 00, 0, 0))
RESET_OFF_TIME = time.mktime((2000, 01, 01, RESET_HOUR, 01, 00, 0, 0))

# Define millisecond amounts
ONE_MINUTE = 60000

# class syntax

class OnOffState():
    ON = "ON"
    OFF = "OFF"
    AUTO = "AUTO"  
    
class WindowState():
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    AUTO = "AUTO"

class HardwareError(Exception):
    def __init__(self, message, error_code):
        super().__init__(message)
        self.error_code = error_code
        self.message = message
        
class LightSwitch(object):
    # Relay light switch

    # Define light on and off times
    LIGHT_ON_HOUR  = 09 # 24 hour
    LIGHT_OFF_HOUR = 19 # 24 hour
    LIGHT_ON_TIME  = time.mktime((2000, 01, 01, LIGHT_ON_HOUR, 00, 00, 0, 0))
    LIGHT_OFF_TIME = time.mktime((2000, 01, 01, LIGHT_OFF_HOUR, 00, 00, 0, 0))

    def __init__(self):
        # GPIO pin number  relay is connected to
        RELAY_PIN = 22
        self.relay_pin = Pin(RELAY_PIN, Pin.OUT)
        self.state = OnOffState.AUTO

    def setOnOffTime(self, onTime, offTime):
        # refine light on and off times
        self.LIGHT_ON_HOUR  = int(onTime) # 24 hour
        self.LIGHT_OFF_HOUR = int(offTime) # 24 hour
        self.LIGHT_ON_TIME  = time.mktime((2000, 01, 01, self.LIGHT_ON_HOUR, 00, 00, 0, 0))
        self.LIGHT_OFF_TIME = time.mktime((2000, 01, 01, self.LIGHT_OFF_HOUR, 00, 00, 0, 0))        

    def setState(self, state):
        
        self.state = state
            
        if (state == OnOffState.ON):
            self.relay_pin.value(1)  # Set relay to ON state
            print("Light ON")
        elif (state == OnOffState.OFF):
            self.relay_pin.value(0)  # Set relay to OFF state
            print("LightOFF")
            
    def toggleState(self):
            
        if (self.state == OnOffState.ON):
            self.setState(OnOffState.OFF)
        elif (self.state == OnOffState.OFF):
            self.setState(OnOffState.AUTO)
        elif (self.state == OnOffState.AUTO):
            self.setState(OnOffState.ON)                
            
    def controlLights(self, rtc):

        print("Light state %s" %self.status())
        
        if (OnOffState.AUTO == self.status()) and (rtc.timeInRange(self.LIGHT_ON_TIME, self.LIGHT_OFF_TIME)):
            self.setState(OnOffState.ON)
            
        if (OnOffState.AUTO == self.status()) and (not rtc.timeInRange(self.LIGHT_ON_TIME, self.LIGHT_OFF_TIME)):            
            self.setState(OnOffState.OFF)              
     
    def status(self):
        return self.state
        
    def settings(self):
        return str(self.LIGHT_ON_HOUR) + ":00 - " +  str(self.LIGHT_OFF_HOUR) + ":00"     


class LinearActuator(object):
    # Linear Actuator for window
    
    # Define window open/close temperature
    OPEN_WINDOW_TEMPERATURE = 25
    CLOSE_WINDOW_TEMPERATURE = 22

    # Define window pulse count and length
    MAX_ACTUATOR_ANGLE = 90
    PULSE_TIME = 500  
    PULSE_DEGREE_CHANGE = 5
    
    def __init__(self):
        # GPIO pin + window is connected to
        UP_PIN = 15
        self.up_pin = Pin(UP_PIN, Pin.OUT)
        
        # GPIO pin - window is connected to
        DOWN_PIN = 14
        self.down_pin = Pin(DOWN_PIN, Pin.OUT)
        
        # Degree opening for window
        self.windowAngle = 0
    
        self.state = WindowState.AUTO

    def setState(self, state):
        
        self.state = state
            
        if (state == WindowState.OPEN):
            self.down_pin.value(0)  # Set down to OFF state
            self.up_pin.value(1)  # Set up to ON state
            self.windowAngle = self.MAX_ACTUATOR_ANGLE
            print("Window OPEN")
        elif (state == WindowState.CLOSED):
            self.up_pin.value(0)  # Set up to OFF state        
            self.down_pin.value(1)  # Set down to ON state
            self.windowAngle = 0  
            print("Window CLOSED")
            
    def toggleState(self):
            
        if (self.state == WindowState.OPEN):
            self.setState(WindowState.CLOSED)
        elif (self.state == WindowState.CLOSED):
            self.setState(WindowState.AUTO)
        elif (self.state == WindowState.AUTO):
            self.setState(WindowState.OPEN)               
        
    async def up(self):
        
        if (self.windowAngle <= self.MAX_ACTUATOR_ANGLE):
            self.down_pin.value(0)  # Set down to OFF state
            self.up_pin.value(1)  # Set up to ON state
            await asyncio.sleep_ms(self.PULSE_TIME)
            self.up_pin.value(0)  # Set up to OFF state
            
            # Increment degrees incline
            self.windowAngle = self.windowAngle + self.PULSE_DEGREE_CHANGE
        
    async def down(self):
        
        if (self.windowAngle > 0):        
            self.up_pin.value(0)  # Set up to OFF state   
            self.down_pin.value(1)  # Set down to ON state
            await asyncio.sleep_ms(self.PULSE_TIME)
            self.down_pin.value(0)  # Set down  to OFF state
            
            # Decrement degrees incline
            self.windowAngle = self.windowAngle - self.PULSE_DEGREE_CHANGE
            
    async def control(self, temperatureSensor, rtc):

        await temperatureSensor.measureIt(rtc)
        temperature = temperatureSensor.temperature
        
        # Open window      
        if (WindowState.AUTO == self.status()) and (temperature >= self.OPEN_WINDOW_TEMPERATURE):
            await self.up()      

        # Close window 
        if (WindowState.AUTO == self.status()) and (temperature < self.CLOSE_WINDOW_TEMPERATURE):
            await self.down()  
            
        return temperature            

    def angle(self):
        return self.windowAngle  

    def status(self):
        return self.state
    
    def settings(self):
        return str(self.CLOSE_WINDOW_TEMPERATURE) + " - " + str(self.OPEN_WINDOW_TEMPERATURE) + "C"      

    
class Pump(object):
    # PWM dual power switch

    #### DEFINE WATERING TIMES HERE ####
    WATERING_TIMES = ["10:00", "12:00", "21:00"]

    def __init__(self):
        #Define pins for Pump
        PWM_IN = 16
        PWM_OUT = 17          
        self.pump_a = PWM(Pin(PWM_IN), freq=1000)
        self.pump_b = PWM(Pin(PWM_OUT), freq=1000)
        
        self.state = OnOffState.AUTO
        
    def setState(self, state):
           
        print('Set pump state:' + str(state))
        
        if (state == OnOffState.ON) and (OnOffState.ON != self.state):
            print("PUMP ON")
            MAX_PUMP_SPEED = 65535
            self.pump_a.duty_u16(0)
            self.pump_b.duty_u16(MAX_PUMP_SPEED)  # speed(0-65535)
        elif (state == OnOffState.OFF) and (OnOffState.ON == self.state):
            print("PUMP OFF")            
            # Stop pump
            self.pump_a.duty_u16(0)
            self.pump_b.duty_u16(0)
            
        self.state = state
        
    def toggleState(self):
            
        if (self.state == OnOffState.ON):
            self.setState(OnOffState.OFF)
        elif (self.state == OnOffState.OFF):
            self.setState(OnOffState.AUTO)
        elif (self.state == OnOffState.AUTO):
            self.setState(OnOffState.ON)           
        
    async def waterOff(self, pump, wateringPeriod):  
        await asyncio.sleep_ms(wateringPeriod * 1000)
        print("Watering Period OFF ")
        pump.setState(OnOffState.OFF)
        
        # Sleep for a minute before turning back to AUTO mode so that we dont run again in the same time period
        await asyncio.sleep_ms(ONE_MINUTE)
        print("Watering sleep Period OFF ")
        pump.setState(OnOffState.AUTO)
       
               
    async def controlWatering(self, temperature, rtc):
        
        MIN_WATERING_TEMP = 10
        timeNow = rtc.getTimeStr()
        
        print("Pump state %s" %self.status())    
        
        if ( (temperature > MIN_WATERING_TEMP) and (timeNow in self.WATERING_TIMES) and (OnOffState.AUTO == self.status()) ):
            t = int(pow(temperature, 3) * 3)
            wateringPeriod = int(t/1000)
                            
            self.setState(OnOffState.ON)
            print("Watering Period %s mseconds " %wateringPeriod )                              
            await self.waterOff(pump, wateringPeriod)         
     
    def status(self):   
        return self.state
                 
    def settings(self):
        return str(self.WATERING_TIMES)
    
                           
class TemperatureProbe(object):
  
    # Temperature probe
    # DHT temp sensor  
    def __init__(self):
        #Define pin for Temperature sensor
        SENSOR_PIN = 28    
    
        ds_pin = machine.Pin(SENSOR_PIN)
        self.ds_sensor = ds18x20.DS18X20(onewire.OneWire(ds_pin))
        self.temperature = 0
        self.highTemp = 0
        self.lowTemp = 100
        
        # get sensors 
        self.roms = self.ds_sensor.scan()
        print('Found DS devices: ', self.roms)
        
    async def measureIt(self, rtc):   
        try:
            print('measureIt')
            self.ds_sensor.convert_temp()      
            await asyncio.sleep_ms(750)        
            for rom in self.roms:
                self.temperature = self.ds_sensor.read_temp(rom)
                print('temperature (ºC):', "{:.2f}".format(self.temperature))
            
            # Reset stats at midnight
            if (rtc.timeInRange(RESET_ON_TIME, RESET_OFF_TIME)):
                print("Reset temperature stats")
                self.highTemp = 0
                self.lowTemp = 100
             
            # Set high score
            if (self.temperature > self.highTemp):
                self.highTemp = self.temperature
            
            if (self.temperature < self.lowTemp):
                self.lowTemp = self.temperature

        except:
            print('measureIt error')   
            raise HardwareError("DDS18B20 Probe", 100)
        

class Clock(object):
#            13:45:00 Mon 24 May 2021
#  the register value is the binary-coded decimal (BCD) format
#               sec min hour week day month year
    NowTime = b'\x00\x45\x13\x02\x24\x05\x21'
    w  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    address = 0x68
    start_reg = 0x00
    alarm1_reg = 0x07
    control_reg = 0x0e
    status_reg = 0x0f
    
    def __init__(self):
        #  I2C Clock Pins
        I2C_PORT = 0
        I2C_SDA = 20
        I2C_SCL = 21
        self.bus = I2C(I2C_PORT,scl=Pin(I2C_SCL),sda=Pin(I2C_SDA))

    def set_time(self,new_time):
        
        # new_time = '10:00:00,Sunday,2024-09-29' 
        try: 
            hour = new_time[0] + new_time[1]
            minute = new_time[3] + new_time[4]
            second = new_time[6] + new_time[7]
            week = "00"
            #week = "0" + str(self.w.index(new_time.split(",",2)[1])+1)
            year = new_time.split(",",2)[2][2] + new_time.split(",",2)[2][3]
            month = new_time.split(",",2)[2][5] + new_time.split(",",2)[2][6]
            day = new_time.split(",",2)[2][8] + new_time.split(",",2)[2][9]
            now_time = binascii.unhexlify((second + " " + minute + " " + hour + " " + week + " " + day + " " + month + " " + year).replace(' ',''))
            #print(binascii.unhexlify((second + " " + minute + " " + hour + " " + week + " " + day + " " + month + " " + year).replace(' ','')))

            self.bus.writeto_mem(int(self.address),int(self.start_reg),now_time)

        except:
            raise HardwareError("Ds3231 Clock", 101)        
    
    def getDateTime(self):      
        try: 
            t = self.bus.readfrom_mem(int(self.address),int(self.start_reg),7)
            return t
        except:
            raise HardwareError("Ds3231 Clock", 102)    
    
    def getTimeInSeconds(self):
        t = self.getDateTime()
        hour = t[2]  #hour
        minute = t[1]  #minute
        
        hour = int("%02x" % hour)
        minute = int("%02x" % minute)   
           
        timeInSeconds = time.mktime((2000, 01, 01, hour, minute, 00, 0, 0))
        
        return timeInSeconds    
    
    def timeInRange(self, startRange, endRange):    
        timeNow = self.getTimeInSeconds()        
        return (time.ticks_diff(startRange, timeNow) <= 0) and (time.ticks_diff(endRange, timeNow) > 0)
    
    def getDateTimeStr(self):
        
        t = self.getDateTime()
                    
        a = t[0]&0x7F  #second
        b = t[1]&0x7F  #minute
        c = t[2]&0x3F  #hour
        d = t[3]&0x07  #week
        e = t[4]&0x3F  #day
        f = t[5]&0x1F  #month
        
        #datetimestr = "20%x/%02x/%02x %02x:%02x:%02x %s" %(t[6],t[5],t[4],t[2],t[1],t[0],self.w[t[3]-1])
        datetimestr = "20%x/%02x/%02x %02x:%02x:%02x" %(t[6],t[5],t[4],t[2],t[1],t[0])
        
        return datetimestr

    def getTimeStr(self):
        t = self.getDateTime()
        
        hour = t[2]  #hour
        minute = t[1]  #minute
        
        hour = "%02x" % hour
        mins = "%02x" % minute
        
        timeStr = str(hour) + ":" + str(mins)

        return timeStr

class Lcd(object):
    
    #  display mode
    screen = 0
            
    def __init__(self):
        
        #  I2C Pins
        I2C_PORT = 1
        I2C_SDA = 6
        I2C_SCL = 7
        I2C_FREQ = 400000
    
        # setup the I2C communication for the OLED display
        self.bus = I2C(I2C_PORT, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA), freq=I2C_FREQ)

        addr = self.bus.scan()

        addr = self.bus.scan()[0]
        print(addr)

        self.lcd = I2cLcd(self.bus, addr, 2, 16)
        
        self.lcd.putstr("Hello RPi Pico!\n")
        
    async def showData(self, ddsProbe, rtc, ip):
                
        # Display time & temp on the LCD screen
        # print("SCREEN: " + str(self.screen))
        
        if (self.screen == 0):
            timeNow = rtc.getTimeStr()    
            timeStr = "Time: " + timeNow ;
            temperatureStr = "Temp: " + str(ddsProbe.temperature) + "C"
        
            self.lcd.clear()
            self.lcd.putstr(timeStr)
            self.lcd.putstr("\n")
            self.lcd.putstr(temperatureStr)         
            self.screen = 1
            
        elif (self.screen == 1):
            highStr = "Hi: " + str(ddsProbe.highTemp) + "C"
            lowStr =  "Lo: " + str(ddsProbe.lowTemp) + "C"
            
            self.lcd.clear()
            self.lcd.putstr(highStr)
            self.lcd.putstr("\n")
            self.lcd.putstr(lowStr)                               
            self.screen = 2
            
        elif (self.screen == 2):
            timeStr = rtc.getDateTimeStr()[:10]  
            self.lcd.clear()
            self.lcd.putstr(timeStr)
            self.lcd.putstr("\n")
            self.lcd.putstr(ip)               
            self.screen = 0
            
        
    def showError(self, code, message):
        self.lcd.clear()
        self.lcd.putstr("Error: " + str(code))
        self.lcd.putstr("\n")
        self.lcd.putstr(message)        
        
    
class PlantCare(object):
    
    def __init__(self, datetime, ip):
        
        self.ip = ip
        
        self.rtc = Clock()
                
        # Set internal clock     
        self.rtc.set_time(datetime)

        ## Creat the objects to be controlled
        self.light = LightSwitch()
        self.ddsProbe = TemperatureProbe()
        self.pump = Pump()
        self.windows = LinearActuator()
        self.lcd = Lcd()

        self.lcd.showData(self.ddsProbe, self.rtc, self.ip)
                
        # Startup check
        self.windows.setState(WindowState.OPEN)
        #self.pump.fanOn()
        self.pump.setState(OnOffState.ON)
        self.light.setState(OnOffState.ON)

        time.sleep_ms(500)

        # Turn off everything before starting loop
        #self.pump.fanOff()
        self.windows.setState(WindowState.CLOSED)
        self.pump.setState(OnOffState.OFF)
        self.light.setState(OnOffState.OFF)
            
    def setWindow(self, state):      
        self.windows.setState(state)
        
    def toggleWindow(self):
        self.windows.toggleState()        
        
    def setLight(self, state):
        self.light.setState(state)
        
    def setLightOnOffTime(self, onTime, offTime):
        self.light.setOnOffTime(onTime, offTime)
        
    def toggleLight(self):
        self.light.toggleState()
        
    def setPump(self, state):
        self.pump.setState(state)
        
    def togglePump(self):
        self.pump.toggleState()        
        
    def getTemperatureData(self):
        return [self.ddsProbe.temperature, self.ddsProbe.highTemp, self.ddsProbe.lowTemp]
    
    def getSystemTime(self):
        return self.rtc.getDateTimeStr()
    
    def getLightStatus(self):
        return self.light.status()
    
    def getLightSettings(self):
        return self.light.settings()    
    
    def getWindowStatus(self):
        return self.windows.status()
    
    def getWindowAngle(self):
        return self.windows.angle()
    
    def getWindowSettings(self):
        return self.windows.settings()    
        
    def getPumpStatus(self):
        return self.pump.status()
    
    def getPumpSettings(self):
        return self.pump.settings()
    
    def displayError(self, code, message):
        self.lcd.showError(code, message)
    
    def cleanUp(self):
        #self.pump.fanOff()
        self.pump.setState(OnOffState.OFF)
        self.light.setState(OnOffState.OFF)
    
    async def careforplants(self):
          
        print("careforplants...")
        # Look after plants
        try:        
            timestamp = self.rtc.getDateTimeStr() 
            print(timestamp)
            
            print("controlLights...")
            self.light.controlLights(self.rtc)        
            
            print("controlTemperature...")
            temperature = await self.windows.control(self.ddsProbe, self.rtc)
            
            print("controlWatering...")
            await self.pump.controlWatering(temperature, self.rtc)
            
            print("display data...")
            await self.lcd.showData(self.ddsProbe, self.rtc, self.ip)        

        except HardwareError as e:
            print(e)            
            self.cleanUp()
            self.lcd.showError(e.error_code, e.message)
            sys.exit("Terminated")
            
        except Exception as e:
            print(e)
            self.cleanUp()
            self.lcd.showError(101, "General error")
            sys.exit("Terminated")
            
async def count():
    print(".")         
            
async def main():
    
    datetime = '10:00:00,Sunday,2024-09-29' 
    plantCare = PlantCare(datetime, "192.168.1.1")
    
    while True:
        await asyncio.gather(plantCare.careforplants(), count())

if __name__ == "__main__":
    asyncio.run(main())
