import sys
import math
import traceback
from machine import Pin, PWM, ADC, I2C, SoftI2C
import dht
from micropython_sht20 import sht20
import time
import binascii
import machine
import onewire
import ds18x20
from machine_i2c_lcd import I2cLcd
import breakout_scd41
from pimoroni_i2c import PimoroniI2C
from MLX90614 import MLX90614
import asyncio
from bh1750 import BH1750

#################################################
### Greenouse controller for Rasberry Pi Pico ###
### Author: Nigel T. Crowther
### Date: 03-Sep-2024
#################################################

# Define midnight reset period
RESET_HOUR = 0 # 24 hour
RESET_ON_TIME  = time.mktime((2000, 1, 1, RESET_HOUR, 0, 0, 0, 0))
RESET_OFF_TIME = time.mktime((2000, 1, 1, RESET_HOUR, 1, 0, 0, 0))

# Define millisecond amounts
ONE_MINUTE = 60000

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
        
# Abtract class for controller devices

    """
    This class is a controller for an ON/OFF device.
    
    Attributes:
        state (OnOffState): The current state of the device.
    
    Methods:
        setState(state): Sets the state of the device.
        status(): Returns the current state of the device.
    """
class OnOFFAutoController:
    
    state = OnOffState.AUTO
        
    def setState(self, state):
        
        if not hasattr(OnOffState, state) : 
            print('**Invalid state:' + str(state))
            return
        
        print('**Set state:' + str(self.state) + "->" + str(state))
        
        if (state == OnOffState.ON):
            self.on()
        elif (state == OnOffState.OFF):
            self.off()
        #elif (state == OnOffState.AUTO):
            # Do nothing               
   
        self.state = state                    
            
    def status(self):
        return self.state

#
## BH1750 light lux sensor probe
#
class LuxProbe(object):
  
    def __init__(self):
    
        # setup the I2C communication for the Light sensor
        I2C_SDA = 20
        I2C_SCL = 21
        
        #  I2C Pins
        i2c = SoftI2C(scl=Pin(I2C_SCL), sda=Pin(I2C_SDA))
        
        scan = i2c.scan()
        print("I2c lux scan: ", scan)

        # Create BH1750 object
        self.light_sensor = BH1750(bus=i2c, addr=0x5c)
        self.light_sensor.reset()
        
        self.lux = 0        
        self.highLux = 0
        self.lowLux = 100
        
        
    def measureIt(self, rtc):   
    
        try:
            print('measureIt lux')
            

            self.lux = round(self.light_sensor.luminance(BH1750.CONT_HIRES_1))
            
            # Reset stats at midnight
            if (rtc.timeInRange(RESET_ON_TIME, RESET_OFF_TIME)):
                print("Reset stats")
                self.highLux = 0
                self.lowLux = 100000
                
            # Set lux high score
            if (self.lux > self.highLux):
                self.highLux = self.lux
            
            if (self.lux < self.lowLux):
                self.lowLux = self.lux
                    
            
        except Exception as e:
            print("Error in Lux probe:", e)
            
            
#
## SH20 temperature humidity probe
#
class TemperatureHumidityProbe(object):
  
    def __init__(self):
        # setup the I2C communication for the SHT20 sensor
        #  I2C Pins
        #I2C_PORT = 1
        #I2C_SDA = 6
        #I2C_SCL = 7
        
        I2C_PORT = 0
        I2C_SDA = 20
        I2C_SCL = 21

        i2c = I2C(I2C_PORT, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA))
                                                      
        scan = i2c.scan()
        print("probe scan:", scan)

        addr = 64
        print("Temp humidity probe addr:", addr)

        self.sht = sht20.SHT20(i2c)
        
        self.temperature = 0        
        self.highTemp = 0
        self.lowTemp = 100
        
        self.humidity = 0        
        self.highHumidity = 0
        self.lowHumidity = 100        
        
    def measureIt(self, rtc):   
    
        try:
            print('SHT20 measureIt')
            #self.sht.reset()
            
            self.temperature = self.sht.temperature
            self.temperature = round(self.temperature, 2)
                    
            self.humidity = self.sht.humidity
            self.humidity = round(self.humidity, 2)
                 
            print("SH20 Temperature (C): " + str(self.temperature))
            print("SH20 Humidity (%RH): " + str(self.humidity))
            
            # Reset stats at midnight
            if (rtc.timeInRange(RESET_ON_TIME, RESET_OFF_TIME)):
                print("Reset temperature stats")
                self.highTemp = 0
                self.lowTemp = 100
             
            # Set temperature high score
            if (self.temperature > self.highTemp):
                self.highTemp = self.temperature
            
            if (self.temperature < self.lowTemp):
                self.lowTemp = self.temperature
                
            # Set humidity high score
            if (self.humidity > self.highHumidity):
                self.highHumidity = self.humidity
            
            if (self.humidity < self.lowHumidity):
                self.lowHumidity = self.humidity

        except Exception as e:
            print(e)  
            raise HardwareError("SHT20 Probe", 100)            
    
    
"""
This code defines a class called Heater that inherits from the OnOFFAutoController class. 
The Heater class has an init method that initializes the relay pin number and sets it to output mode. 
It also has on and off methods that set the relay pin to the corresponding state. 
The control method turns on the heater if it is lower than the min temperature
If the temperature rises above the dead zone, the heater is turned off
"""
class Heater(OnOFFAutoController):
    # Relay heater
    
    def __init__(self):
        # GPIO pin number  relay is connected to
        RELAY_PIN = 0
        self.relay_pin = Pin(RELAY_PIN, Pin.OUT)
        
    def on(self):
        print("Heater ON")
        self.relay_pin.value(1)  # Set relay to ON state
            
    def off(self):   
        print("Heater OFF")
        self.relay_pin.value(0)  # Set relay to OFF state
        
    def control(self, temperature, minTemperature):
        
        # Degrees in which the temp must rise before turning off
        DEAD_ZONE = 1
        
        # On
        if (OnOffState.AUTO == self.status()) and (temperature <= minTemperature):
            self.setState(OnOffState.ON)
            self.setState(OnOffState.AUTO) 

        # Off 
        if (OnOffState.AUTO == self.status()) and (temperature > (minTemperature + DEAD_ZONE)):
            self.setState(OnOffState.OFF)
            self.setState(OnOffState.AUTO)         

"""
This code defines a class Fan that controls a fan using PWM signals. 
The on method turns the fan on, and the off method turns it off. 
The control method checks the temperature and turns the fan on or off based on the specified conditions.
"""
class Fan(OnOFFAutoController):
    
    def __init__(self):
        # GPIO pin number fan is connected to
        RELAY_PIN = 27
        self.relay_pin = Pin(RELAY_PIN, Pin.OUT)
        
    def on(self):
        print("Fan ON")
        self.relay_pin.value(1)  # Set relay to ON state
            
    def off(self):   
        print("Fan OFF")
        self.relay_pin.value(0)  # Set relay to OFF state
     
    def control(self, temperature, maxTemperature):
        
        # Degrees in which the temp must drop below max temperature before stopping
        DEAD_ZONE = 2
        
        # On
        if (OnOffState.AUTO == self.status()) and (temperature >= maxTemperature):
            self.setState(OnOffState.ON)
            self.setState(OnOffState.AUTO)
            return

        # Off 
        if (OnOffState.AUTO == self.status()) and (temperature < (maxTemperature - DEAD_ZONE)):        
            self.setState(OnOffState.OFF)
            self.setState(OnOffState.AUTO)
        

"""
The Light class has methods to turn the light on and off, as well as to control the light based on a given time.
"""
class LightSwitch(OnOFFAutoController):
    # Relay light switch

    # Define light on and off times
    LIGHT_ON_HOUR  = 9 # 24 hour
    LIGHT_OFF_HOUR = 19 # 24 hour
    LIGHT_ON_TIME  = time.mktime((2000, 1, 1, LIGHT_ON_HOUR, 0, 0, 0, 0))
    LIGHT_OFF_TIME = time.mktime((2000, 1, 1, LIGHT_OFF_HOUR, 0, 0, 0, 0))

    def __init__(self):
        # GPIO pin number  relay is connected to
        RELAY_PIN = 22
        self.relay_pin = Pin(RELAY_PIN, Pin.OUT)
        self.state = OnOffState.AUTO

    def setOnOffTime(self, onTime, offTime):
        # redefine light on and off times
        self.LIGHT_ON_HOUR  = int(onTime) # 24 hour
        self.LIGHT_OFF_HOUR = int(offTime) # 24 hour
        self.LIGHT_ON_TIME  = time.mktime((2000, 1, 1, self.LIGHT_ON_HOUR, 0, 0, 0, 0))
        self.LIGHT_OFF_TIME = time.mktime((2000, 1, 1, self.LIGHT_OFF_HOUR, 0, 0, 0, 0))                    
            
    def on(self):
        print("Light ON")
        self.relay_pin.value(1)  # Set relay to ON state
            
    def off(self):   
        print("Light OFF")
        self.relay_pin.value(0)  # Set relay to OFF state
        
    def control(self, rtc):

        print("Light state %s" %self.status())
        
        if (OnOffState.AUTO == self.status()) and (rtc.timeInRange(self.LIGHT_ON_TIME, self.LIGHT_OFF_TIME)):
            self.setState(OnOffState.ON)          
            self.setState(OnOffState.AUTO)
            
        if (OnOffState.AUTO == self.status()) and (not rtc.timeInRange(self.LIGHT_ON_TIME, self.LIGHT_OFF_TIME)):            
            self.setState(OnOffState.OFF)
            self.setState(OnOffState.AUTO)            

""" 
This class is for Window Control. 
It sets up two GPIO pins, one for the up button and one for the down button. 
It also initializes the window angle to 0 and sets the initial state of the window to AUTO.
"""
class LinearActuator(object):
    # Linear Actuator for window

    # Define window pulse count and length
    MAX_ACTUATOR_ANGLE = 100
    MIN_ACTUATOR_ANGLE = 0
    PULSE_TIME = 2000  
    PULSE_DEGREE_CHANGE = 25
    
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
        
    def up(self):
        
        if (self.windowAngle <= self.MAX_ACTUATOR_ANGLE):
            self.down_pin.value(0)  # Set down to OFF state
            self.up_pin.value(1)  # Set up to ON state
            time.sleep_ms(self.PULSE_TIME)
            self.up_pin.value(0)  # Set up to OFF state
            
            # Increment degrees incline
            self.windowAngle = self.windowAngle + self.PULSE_DEGREE_CHANGE
        
    def down(self):
        
        if (self.windowAngle >= self.MIN_ACTUATOR_ANGLE):        
            self.up_pin.value(0)  # Set up to OFF state   
            self.down_pin.value(1)  # Set down to ON state
            time.sleep_ms(self.PULSE_TIME)
            self.down_pin.value(0)  # Set down  to OFF state
            
            # Decrement degrees incline
            self.windowAngle = self.windowAngle - self.PULSE_DEGREE_CHANGE
            
    def control(self, temperature, maxTemperature):
        
        # Degrees in which the temp must drop below max temperature before closing
        DEAD_ZONE = 2
        
        print("Window control: " + self.status()  + " " + str(temperature) + ">" + str(maxTemperature))
        
        # Open
        if (OnOffState.AUTO == self.status()) and (temperature >= maxTemperature):
            self.up() 

        # Close 
        if (OnOffState.AUTO == self.status()) and (temperature < (maxTemperature - DEAD_ZONE)):        
            self.down()     

    def angle(self):
        return self.windowAngle  

    def status(self):
        return self.state
        
"""
The Pump class has methods for controlling the pump's speed, turning it off, and watering the plants. 
It also has a control method that determines when to water the plants based on temperature and time.
"""
class Pump(OnOFFAutoController):
    # PWM dual power switch

    #### DEFINE WATERING TIMES HERE ####
    WATERING_TIMES = [10, 13, 21]
    WATERING_PERIOD = 2 # minutes

    def __init__(self):
        #Define pins for Pump
        PWM_IN = 16
        PWM_OUT = 17          
        self.pump_a = PWM(Pin(PWM_IN), freq=1000)
        self.pump_b = PWM(Pin(PWM_OUT), freq=1000)
        
    def on(self):
        print("PUMP ON")
        MAX_PUMP_SPEED = 65535
        self.pump_a.duty_u16(0)
        self.pump_b.duty_u16(MAX_PUMP_SPEED)  # speed(0-65535)
                   
    def off(self):   
        print("PUMP OFF")            
        # Stop pump
        self.pump_a.duty_u16(0)
        self.pump_b.duty_u16(0)
              
    async def watering(self, wateringPeriod):
        print("Watering Period %s seconds " %wateringPeriod )
        
        self.setState(OnOffState.ON) 
        await asyncio.sleep_ms(wateringPeriod * 1000)
        
        print("Watering Period OFF ")
        self.setState(OnOffState.OFF)
        
        # Set back to Auto for next time
        self.setState(OnOffState.AUTO)   
              
    def control(self, temperature, rtc):
        
        print("Pump state %s" %self.status())
        
        if (OnOffState.AUTO == self.status()):

            for h in self.WATERING_TIMES:
                                
                # Define pump on/off time
                PUMP_ON_HOUR  = h # 24 hour
 
                PUMP_ON_TIME  = time.mktime((2000, 01, 01, PUMP_ON_HOUR, 00, 00, 0, 0))
                PUMP_OFF_TIME = time.mktime((2000, 01, 01, PUMP_ON_HOUR, self.WATERING_PERIOD, 00, 0, 0))                     
                print("Pump on: " + str(PUMP_ON_HOUR)+ "h for " + str(self.WATERING_PERIOD) + "m")
                    
                if (rtc.timeInRange(PUMP_ON_TIME, PUMP_OFF_TIME)):
                    print("Pump time on %s" %h)
                    self.setState(OnOffState.ON)          
                    self.setState(OnOffState.AUTO)
                    return
                    
                if (not rtc.timeInRange(PUMP_ON_TIME, PUMP_OFF_TIME)):
                    print("Pump time off %s" %h)
                    self.setState(OnOffState.OFF)
                    self.setState(OnOffState.AUTO)
                               
        
        #if ( (temperature > self.MIN_WATERING_TEMP) and (timeNow in self.WATERING_TIMES) and (OnOffState.AUTO == self.status()) ):                                     
         #   asyncio.create_task(self.watering(self.WATERING_PERIOD))
     
    def setTimes(self, wateringTimes, period, minTemp):
        self.WATERING_TIMES = wateringTimes
        self.WATERING_PERIOD = period
       
class Co2Probe(object):
  
    def __init__(self):
        # setup the I2C communication for the Co2 sensor
        #  I2C Pins
        I2C_PORT = 0
        I2C_SDA = 20
        I2C_SCL = 21        

        self.i2c = PimoroniI2C(sda=(I2C_SDA), scl=(I2C_SCL))  
        
        self.co2 = 0        
        self.highCo2 = 0
        self.lowCo2 = 100           
        
    def measureIt(self, rtc):   
    
        try:
            print('measureIt')
            
            breakout_scd41.init(self.i2c)
            breakout_scd41.start()
            while not breakout_scd41.ready():
                print("Waiting for sensor")
                time.sleep_ms(5000)
                
            self.co2, temperature, humidity = breakout_scd41.measure()
  
            self.co2 = round(self.co2, 0)
            print("Co2 (ppm): " + str(self.co2))
            
            # Reset stats at midnight
            if (rtc.timeInRange(RESET_ON_TIME, RESET_OFF_TIME)):
                print("Reset stats")
                self.highCo2 = 0
                self.lowCo2 = 2000
                
            # Set co2 high score
            if (self.co2 > self.highCo2):
                self.highCo2 = self.co2
            
            if (self.co2 < self.lowCo2):
                self.lowCo2 = self.co2
                
            
        except Exception as e:
            print(e)
            
            I2C_PORT = 0
            I2C_SDA = 20
            I2C_SCL = 21        

            i2c = PimoroniI2C(sda=(I2C_SDA), scl=(I2C_SCL))              
            breakout_scd41.init(i2c)
            breakout_scd41.start()
            #print('measureIt error: ' + e)   
            #raise HardwareError("Pimoroni C02 Probe", 100)

"""
class  Clock is used to interact with an I2C clock. 
The init method initializes the I2C bus and sets the address of the clock. 
The class also includes a method called getTime, which retrieves the current time from the clock and returns it as a string.
"""
class Clock(object):
#  The register value is the binary-coded decimal (BCD) format
#  sec min hour week day month year
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
           
        timeInSeconds = time.mktime((2000, 1, 1, hour, minute, 0, 0, 0))
        
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

"""
This class initializes the LCD display and provides methods showData and showError which are responsible for displaying data on the LCD screen.
"""
class Lcd(object):  
    
    #  display mode
    screen = 0
            
    def __init__(self):
        
        #  I2C Settings
        I2C_FREQ = 100000 #400000
        I2C_PORT = 0
        I2C_SDA = 20
        I2C_SCL = 21
    
        # setup the I2C communication for the LCD display
        self.bus = I2C(I2C_PORT, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA), freq=I2C_FREQ)
                                                      
        scan = self.bus.scan()
        print("I2c LED scan: ", scan)
        
        addr = 39 #self.bus.scan()[0]
        print("I2c LED addr: ", addr)

        self.lcd = I2cLcd(self.bus, addr, 2, 16)
        
        self.lcd.putstr("Hello RPi Pico!\n")
        
    def showData(self, probe, co2probe, rtc, vpd, leafTemperature, airTemperature, lux):
                
        # Display time & temp on the LCD screen
                
        if (self.screen == 0): 
            temperatureStr = str(airTemperature) + "A - " + str(leafTemperature) + "L"
            humidityStr    = str(probe.humidity) + "%"
            
            self.lcd.clear()
            self.lcd.putstr(temperatureStr)
            self.lcd.putstr("\n")
            self.lcd.putstr(humidityStr)         
            self.screen = 1
            
        elif (self.screen == 1):
            co2Str = str(co2probe.co2) + " ppm"
            vpdStr = str(vpd) + " vpd"
            
            self.lcd.clear()
            self.lcd.putstr(co2Str)
            self.lcd.putstr("\n")
            self.lcd.putstr(vpdStr)
            self.screen = 2
            
        elif (self.screen == 2):
            highlowStr = "H" + str(probe.highTemp) + " L" + str(probe.lowTemp) + "C"
            luxStr =  str(lux) + " lux"
            
            self.lcd.clear()
            self.lcd.putstr(highlowStr)
            self.lcd.putstr("\n")
            self.lcd.putstr(luxStr)                               
            self.screen = 3
            
        elif (self.screen == 3):
            timeStr = rtc.getTimeStr()   
            dateStr = rtc.getDateTimeStr()[:10]
            self.lcd.clear()
            self.lcd.putstr(timeStr)
            self.lcd.putstr("\n")
            self.lcd.putstr(dateStr)                         
            self.screen = 0
                
                 
    def showError(self, code, message):
        self.lcd.clear()
        self.lcd.putstr("Error: " + str(code))
        self.lcd.putstr("\n")
        self.lcd.putstr(message)        
        
"""
This code controls various devices such as a pump, fan, heater, light, and probe. 
The "careforplants" method performs various tasks such as controlling the lights, temperature, watering, and displaying data on the LCD screen. 
It also includes error handling to handle hardware errors and general exceptions.
"""
class PlantCare(object):
    

    # define temperature range
    MIN_TEMPERATURE  = 15
    MAX_TEMPERATURE = 24
        
    def __init__(self, ip):
        
        self.ip = ip
        self.vpd = 0
        
        # There is a conflict between the Lux sensor and clock.  Need to init lux first
        self.luxProbe = LuxProbe()
                
        self.rtc = Clock()
        
        ## Creat the objects to be controlled
        self.light = LightSwitch()
        
        self.thProbe = TemperatureHumidityProbe()
        self.co2probe = Co2Probe()

        self.pump = Pump()
        self.fan = Fan()
        self.windows = LinearActuator()
        self.heater = Heater()
        self.lcd = Lcd()
                
        self.heatSensor = MLX90614()
        #time.sleep(1)
        # Read device ID to make sure that we can communicate with the ADXL343
        #data = self.heatSensor.read_reg(self.heatSensor.MLX90614_TA)
        #print(data)
        
        # Startup check
        # Turn off everything and then set to AUTO before starting loop
        self.windows.setState(WindowState.OPEN)
        time.sleep_ms(50)
        self.windows.setState(WindowState.CLOSED)               
        self.windows.setState(WindowState.AUTO)
        
        self.pump.setState(OnOffState.OFF)
        self.pump.setState(OnOffState.AUTO)
        
        self.fan.setState(OnOffState.OFF)
        self.fan.setState(OnOffState.AUTO)        
        
        self.light.setState(OnOffState.OFF)
        self.light.setState(OnOffState.AUTO)
        
        self.heater.setState(OnOffState.OFF)
        self.heater.setState(OnOffState.AUTO)
        
    def setDateTime(self, datetime):              
        # Set internal clock
        
        # BUG needto reset the clock
        self.rtc = Clock()
        
        # datetime "2024-11-10T19:26:35.927Z"
        if (datetime == None):
            datetime = "2000-01-01T01:01:01.927Z"
        #12th character to the 20th character
        time = datetime[11:20] 

        # First 10 chars
        date = datetime[0:11]

        # '10:00:00,Sunday,2024-09-29' 
        formatedDateTime = time + ',Sunday,' + date
        
        print("SET INTERNAL CLOCK TO: " + formatedDateTime)
 
        self.rtc.set_time(formatedDateTime)
        
        
    def setWindow(self, state):      
        self.windows.setState(state)        
        
    def setLight(self, state):
        self.light.setState(state)
        
    def setLightOnOffTime(self, onTime, offTime):
        self.light.setOnOffTime(onTime, offTime)
        
    def getPumpStatus(self):
        return self.pump.status()
    
    def getPumpSettings(self):
        return self.pump.settings()
    
    def setPump(self, state):
        self.pump.setState(state)
        
    def setFan(self, state):
        self.fan.setState(state)
        
    def getFanStatus(self):
        return self.fan.status()
    
    def getFanSettings(self):
        return self.fan.settings()         
        
    def setHeater(self, state):
        self.heater.setState(state)
        
    def getHeaterStatus(self):
        return self.heater.status()
    
    def getHeaterSettings(self):
        return self.heater.settings()        
        
    def getTemperatureData(self):
        # Air temp in [0] and leaf temp in [1]
        return [self.thProbe.temperature, self.heatSensor.getObjectTemperature(), self.thProbe.highTemp, self.thProbe.lowTemp]
    
    def getHumidityData(self):
        return [self.thProbe.humidity, self.thProbe.highHumidity, self.thProbe.lowHumidity]    
  
    def getCo2Data(self):
        
        #print("Read co2...")
        self.co2probe.measureIt(self.rtc)
        print("co2: " + str(self.co2probe.co2))        
        
        return [self.co2probe.co2, self.co2probe.highCo2, self.co2probe.lowCo2]    
 
    def getluxData(self): 
        self.luxProbe = LuxProbe()
        self.luxProbe.measureIt(self.rtc)
        print("*************** Luminance: {:.2f} lux".format(self.luxProbe.lux))
              
        return [self.luxProbe.lux, self.luxProbe.highLux, self.luxProbe.lowLux]              
    
    def getVpdData(self):
        return self.vpd    

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
    
    def setTemperatureRange(self, min, max):
        self.MIN_TEMPERATURE = min
        self.MAX_TEMPERATURE = max        
    
    def setWateringTimes(self, wateringTimes, period, minTemp):
        
        if (period == None):
            period = 60 # Seconds
            
        if (minTemp == None):
            minTemp = 10 # C
            
        self.pump.setTimes(wateringTimes, period, minTemp)
    
    def displayError(self, code, message):
        self.lcd.showError(code, message)
    
    def cleanUp(self):
        self.pump.setState(OnOffState.OFF)
        self.light.setState(OnOffState.OFF)
        
    def calculateVPD(self, airTemperature, leafTemperature, humidity):

        leafVp = 0.61078 * math.exp(17.27 * leafTemperature / (leafTemperature + 237.3))
    
        airVp = 0.61078 * math.exp(17.27 * airTemperature / (airTemperature + 237.3)) * (humidity / 100)
        
        vpd = round(leafVp - airVp, 2)
        
        return vpd        
    
    def careforplants(self):
          
        print("careforplants...")
        # Look after plants
        try:
            
            self.rtc = Clock()           
            timestamp = self.rtc.getDateTimeStr() 
            print(timestamp)
            
            print("controlLights...")
            self.light.control(self.rtc)        
                     
            #print("read temp and humidity...")
            self.thProbe.measureIt(self.rtc)                    
            airTemperature = self.thProbe.temperature   
            humidity = self.thProbe.humidity

            leafTemperature = self.heatSensor.getObjectTemperature()
        
            print("Air Temp:",airTemperature,"C")
            print("Leaf Temp:", leafTemperature,"C")

            self.vpd = self.calculateVPD(airTemperature, leafTemperature, humidity)
                 
            self.windows.control(airTemperature, self.MAX_TEMPERATURE)
                        
            self.fan.control(airTemperature, self.MAX_TEMPERATURE)
            
            self.heater.control(leafTemperature, self.MIN_TEMPERATURE)
            
            print("controlWatering...")
            self.pump.control(leafTemperature, self.rtc)
            
            print("display data...")
            self.lcd.showData(self.thProbe, self.co2probe, self.rtc, self.vpd, leafTemperature, airTemperature, self.luxProbe.lux)         

        except HardwareError as e:
            print("Exception: " + str(e))
         
            self.cleanUp()
            self.lcd.showError(e.error_code, e.message)
            sys.exit("Terminated")
                                   

            
def main():
    
    plantCare = PlantCare("192.168.1.1")
             
    while True:
        plantCare.careforplants()

if __name__ == "__main__":
    main()




