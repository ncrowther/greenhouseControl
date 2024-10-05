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

#### DEFINE WATERING TIMES HERE ####
WATERING_TIMES = ["10:00", "12:00", "21:00"]

### DEFINE FAN ON/OFF TEMPERATURE
FAN_ON_TEMPERATURE = 27
FAN_OFF_TEMPERATURE = 25

# Define window open/close temperature
OPEN_WINDOW_TEMPERATURE = 25
CLOSE_WINDOW_TEMPERATURE = 22

# Define light on and off times
LIGHT_ON_HOUR  = 09 # 24 hour
LIGHT_OFF_HOUR = 19 # 24 hour
LIGHT_ON_TIME  = time.mktime((2000, 01, 01, LIGHT_ON_HOUR, 00, 00, 0, 0))
LIGHT_OFF_TIME = time.mktime((2000, 01, 01, LIGHT_OFF_HOUR, 00, 00, 0, 0))

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

    def __init__(self):
        # GPIO pin number  relay is connected to
        RELAY_PIN = 22
        self.relay_pin = Pin(RELAY_PIN, Pin.OUT)
        self.state = OnOffState.AUTO

    def setState(self, state):
        
        self.state = state
            
        if (state == OnOffState.ON):
            self.relay_pin.value(1)  # Set relay to ON state
            print("Light ON")
        elif (state == OnOffState.OFF):
            self.relay_pin.value(0)  # Set relay to OFF state
            print("LightOFF")
     
    def status(self):
            return self.state


class LinearActuator(object):
    # Linear Actuator for window
    
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

    def angle(self):
        return self.windowAngle  

    def status(self):
        return self.state

        #return "AUTO " + str(CLOSE_WINDOW_TEMPERATURE) + "C - " + str(OPEN_WINDOW_TEMPERATURE) + "C"      

    
class Pump(object):
    # PWM dual power switch

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
     
    def status(self):   
        return self.state
                 
           # return "AUTO: " + str(WATERING_TIMES)
                 
               
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
        
        try: 
            hour = new_time[0] + new_time[1]
            minute = new_time[3] + new_time[4]
            second = new_time[6] + new_time[7]
            week = "0" + str(self.w.index(new_time.split(",",2)[1])+1)
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
    
    def printDateTime(self, t):
        a = t[0]&0x7F  #second
        b = t[1]&0x7F  #minute
        c = t[2]&0x3F  #hour
        d = t[3]&0x07  #week
        e = t[4]&0x3F  #day
        f = t[5]&0x1F  #month
        print("20%x/%02x/%02x %02x:%02x:%02x %s" %(t[6],t[5],t[4],t[2],t[1],t[0],self.w[t[3]-1]))       

    def getTimeStr(self):
        t = self.getDateTime()
        
        hour = t[2]  #hour
        minute = t[1]  #minute
        
        hour = "%02x" % hour
        mins = "%02x" % minute
        
        timeStr = str(hour) + ":" + str(mins)

        return timeStr

class Lcd(object):
    
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
        
    async def showData(self, ddsProbe, rtc):
        
        timeNow= rtc.getTimeStr()    
        timeStr = "Time: " + timeNow ;
        temperatureStr = "Temp: " + str(ddsProbe.temperature) + "C"
        #highStr = "High: " + str(ddsProbe.highTemp) + "C"
        #lowStr =  "Low:  " + str(ddsProbe.lowTemp) + "C"        
        
        # Display high lows on the LCD screen       
        #self.lcd.clear()
        #self.lcd.putstr(highStr)
        #self.lcd.putstr("\n")        
        #self.lcd.putstr(lowStr)
        
        # Display time & temp on the LCD screen       
        self.lcd.clear()
        self.lcd.putstr(timeStr)
        self.lcd.putstr("\n")
        self.lcd.putstr(temperatureStr)
        
    def showError(self, code, message):
        self.lcd.clear()
        self.lcd.putstr("Error: " + str(code))
        self.lcd.putstr("\n")
        self.lcd.putstr(message)        
        
    
class PlantCare(object):
    
    def __init__(self, datetime):
        
        self.rtc = Clock()
                
        # Set internal clock     
        self.rtc.set_time(datetime)

        ## Creat the objects to be controlled
        self.light = LightSwitch()
        self.ddsProbe = TemperatureProbe()
        self.pump = Pump()
        self.windows = LinearActuator()
        self.lcd = Lcd()

        self.lcd.showData(self.ddsProbe, self.rtc)
                
        # Startup check
        self.windows.setState(WindowState.OPEN)
        #self.pump.fanOn()
        self.pump.setState(OnOffState.ON)
        self.light.setState(OnOffState.ON)

        time.sleep_ms(500)

        # Turn off everything before starting loop
        #self.pump.fanOff()
        self.windows.setState(WindowState.CLOSED)        
        self.pump.setState(OnOffState.AUTO)
        self.light.setState(OnOffState.OFF)        
    
    async def controlTemperature(self, temperatureSensor, pump, rtc, window):

        await temperatureSensor.measureIt(rtc)
        temperature = temperatureSensor.temperature

        # Open window
        
        print ("Control Temp window state: " + str(window.status()))
               
        if (WindowState.AUTO == window.status()) and (temperature >= OPEN_WINDOW_TEMPERATURE):
            await window.up()      

        # Close window 
        if (WindowState.AUTO == window.status()) and (temperature < CLOSE_WINDOW_TEMPERATURE):
            await window.down()  

        # Turn on/off fan
        #if (temperature >= FAN_ON_TEMPERATURE):
        #    pump.fanOn()        

        #if (temperature <= FAN_OFF_TEMPERATURE):
        #    pump.fanOff()
            
        return temperature
      
    async def waterOff(self, pump, wateringPeriod):  
        await asyncio.sleep_ms(wateringPeriod * 1000)
        print("Watering Period OFF ")
        pump.setState(OnOffState.OFF)
        
        # Sleep for a minute before turning back to AUTO mode so that we dont run again in the same time period
        await asyncio.sleep_ms(ONE_MINUTE)
        print("Watering sleep Period OFF ")
        pump.setState(OnOffState.AUTO)
       
               
    async def controlWatering(self, temperature, pump, rtc):
        
        MIN_WATERING_TEMP = 10
        timeNow = rtc.getTimeStr()
        
        print("Pump state %s" %pump.status())    
        
        if ( (temperature > MIN_WATERING_TEMP) and (timeNow in WATERING_TIMES) and (OnOffState.AUTO == pump.status()) ):
            t = int(pow(temperature, 3) * 3)
            wateringPeriod = int(t/1000)
                            
            pump.setState(OnOffState.ON)
            print("Watering Period %s mseconds " %wateringPeriod )                              
            await self.waterOff(pump, wateringPeriod)

            
    def controlLights(self, light, rtc):

        print("Light state %s" %light.status())
        
        if (OnOffState.AUTO == light.status()) and (rtc.timeInRange(LIGHT_ON_TIME, LIGHT_OFF_TIME)):
            light.setState(OnOffState.ON)
            
        if (OnOffState.AUTO == light.status()) and (not rtc.timeInRange(LIGHT_ON_TIME, LIGHT_OFF_TIME)):            
            light.setState(OnOffState.OFF)               
            
    def setWindow(self, state):      
        self.windows.setState(state)
        
    def setLight(self, state):
        self.light.setState(state)
        
    def setPump(self, state):
        self.pump.setState(state)            
        
    def getTemperatureData(self):
        return [self.ddsProbe.temperature, self.ddsProbe.highTemp, self.ddsProbe.lowTemp]
    
    def getSystemTime(self):
        return self.rtc.getTimeStr()
    
    def getLightStatus(self):
        return self.light.status()
    
    def getWindowStatus(self):
        return self.windows.status()
    
    def getWindowAngle(self):
        return self.windows.angle()      
        
    def getPumpStatus(self):
        return self.pump.status()        
    
    def cleanUp(self):
        #self.pump.fanOff()
        self.pump.setState(OnOffState.OFF)
        self.light.setState(OnOffState.OFF)
    
    async def careforplants(self):
          
        print("careforplants...")
        # Look after plants
#         try:        
        timeNow = self.rtc.getDateTime()
        self.rtc.printDateTime(timeNow) 
        
        print("controlLights...")
        self.controlLights(self.light, self.rtc)        
        
        print("controlTemperature...")
        temperature = await self.controlTemperature(self.ddsProbe, self.pump, self.rtc, self.windows)
       
        print("display data...")
        await self.lcd.showData(self.ddsProbe, self.rtc)
        
        print("controlWatering...")
        await self.controlWatering(temperature, self.pump, self.rtc)
        
#         except HardwareError as e:
#             print(e)            
#             self.cleanUp()
#             self.lcd.showError(e.error_code, e.message)
#             sys.exit("Terminated")
#             
#         except Exception as e:
#             print(e)
#             self.cleanUp()
#             self.lcd.showError(101, "General error")
#             sys.exit("Terminated")
            
async def count():
    print(".")         
            
async def main():
    
    datetime = '10:00:00,Sunday,2024-09-29' 
    plantCare = PlantCare(datetime)
    
    while True:
        await asyncio.gather(plantCare.careforplants(), count())

if __name__ == "__main__":
    asyncio.run(main())
