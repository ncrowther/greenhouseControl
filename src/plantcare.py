import sys
import math
import traceback
from machine import Pin, PWM, ADC, I2C
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
        
        print('**Set state:' + str(self.state) + "->" + str(state))
        
        if (state == OnOffState.ON):
            self.on()
        elif (state == OnOffState.OFF):
            self.off()            
   
        self.state = state                    
            
    def status(self):
        return self.state

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

        
    def control(self, vpd):
        
        # Degrees in which the temp must decrease before turning off
        DEAD_ZONE = 0.1
        MIN_VPD = 0.4
        MAX_VPD = 1.6
        
        if (vpd < MIN_VPD):
            self.setState(OnOffState.ON)
            self.setState(OnOffState.AUTO)
            return
            
        # On
        if (OnOffState.AUTO == self.status()) and (vpd >= MAX_VPD):
            self.setState(OnOffState.ON)
            self.setState(OnOffState.AUTO) 

        # Off 
        if (OnOffState.AUTO == self.status()) and (vpd < (MAX_VPD - DEAD_ZONE)):        
            self.setState(OnOffState.OFF)
            self.setState(OnOffState.AUTO)
        

"""
The Light class has methods to turn the light on and off, as well as to control the light based on a given time.
"""
class LightSwitch(OnOFFAutoController):
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
        # redefine light on and off times
        self.LIGHT_ON_HOUR  = int(onTime) # 24 hour
        self.LIGHT_OFF_HOUR = int(offTime) # 24 hour
        self.LIGHT_ON_TIME  = time.mktime((2000, 01, 01, self.LIGHT_ON_HOUR, 00, 00, 0, 0))
        self.LIGHT_OFF_TIME = time.mktime((2000, 01, 01, self.LIGHT_OFF_HOUR, 00, 00, 0, 0))                    
            
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
        
    def up(self):
        
        if (self.windowAngle <= self.MAX_ACTUATOR_ANGLE):
            self.down_pin.value(0)  # Set down to OFF state
            self.up_pin.value(1)  # Set up to ON state
            time.sleep_ms(self.PULSE_TIME)
            self.up_pin.value(0)  # Set up to OFF state
            
            # Increment degrees incline
            self.windowAngle = self.windowAngle + self.PULSE_DEGREE_CHANGE
        
    def down(self):
        
        if (self.windowAngle > 0):        
            self.up_pin.value(0)  # Set up to OFF state   
            self.down_pin.value(1)  # Set down to ON state
            time.sleep_ms(self.PULSE_TIME)
            self.down_pin.value(0)  # Set down  to OFF state
            
            # Decrement degrees incline
            self.windowAngle = self.windowAngle - self.PULSE_DEGREE_CHANGE
            
    def control(self, temperature, maxTemperature):
        
        # Degrees in which the temp must drop below max temperature before closing
        DEAD_ZONE = 5
        
        # On
        if (OnOffState.AUTO == self.status()) and (temperature >= maxTemperature):
            self.up() 

        # Off 
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
    WATERING_TIMES = ["10:00", "12:00", "21:00"]

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
              
    def watering(self, wateringPeriod):
        print("Watering Period %s seconds " %wateringPeriod )    
        time.sleep(wateringPeriod)
        print("Watering Period OFF ")
        self.setState(OnOffState.OFF)
        
        # Sleep for a minute before turning back to AUTO mode so that we dont run again in the same time period
        time.sleep_ms(ONE_MINUTE)
        print("Watering sleep Period OFF ")
        self.setState(OnOffState.AUTO)
              
    def control(self, temperature, rtc):
        
        MIN_WATERING_TEMP = 10
        timeNow = rtc.getTimeStr()
        
        print("Pump state %s" %self.status())    
        
        if ( (temperature > MIN_WATERING_TEMP) and (timeNow in self.WATERING_TIMES) and (OnOffState.AUTO == self.status()) ):
            t = int(pow(temperature, 3) * 3)
            wateringPeriod = int(t/1000)
                            
            self.setState(OnOffState.ON)                          
            self.watering(wateringPeriod)         
     
    def setTimes(self, wateringTimes):
        self.WATERING_TIMES = wateringTimes
       
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

"""
This class initializes the LCD display and provides methods showData and showError which are responsible for displaying data on the LCD screen.
"""
class Lcd(object):  
    
    #  display mode
    screen = 0
            
    def __init__(self):
        
        #  I2C Pins
        #I2C_PORT = 0
        #I2C_SDA = 6
        #I2C_SCL = 7
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
        
    def showData(self, probe, co2probe, rtc, vpd, leafTemperature, airTemperature):
                
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
            highStr = "Hi: " + str(probe.highTemp) + "C"
            lowStr =  "Lo: " + str(probe.lowTemp) + "C"
            
            self.lcd.clear()
            self.lcd.putstr(highStr)
            self.lcd.putstr("\n")
            self.lcd.putstr(lowStr)                               
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
    MIN_TEMPERATURE  = 20
    MAX_TEMPERATURE = 40
        
    def __init__(self, ip):
        
        self.ip = ip
        
        self.rtc = Clock()
        
        ## Creat the objects to be controlled
        self.light = LightSwitch()
        self.probe = TemperatureHumidityProbe()
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
        self.windows.setState(WindowState.OPEN)
        #self.pump.setState(OnOffState.ON)
        #self.light.setState(OnOffState.ON)
        self.fan.setState(OnOffState.OFF)
        #self.heater.setState(OnOffState.ON)
        #self.fan.off()     
        time.sleep_ms(5000)

        # Turn off everything and then set to AUTO before starting loop
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
        # datetime "2024-11-10T19:26:35.927Z"
        
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
        return [self.probe.temperature, self.probe.highTemp, self.probe.lowTemp]
    
    def getHumidityData(self):
        return [self.probe.humidity, self.probe.highHumidity, self.probe.lowHumidity]    
 
    def getCo2Data(self):
        return [self.co2probe.co2, self.co2probe.highCo2, self.co2probe.lowCo2]    

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
    
    def setWateringTimes(self, wateringTimes):
        self.pump.setTimes(wateringTimes)
    
    def displayError(self, code, message):
        self.lcd.showError(code, message)
    
    def cleanUp(self):
        #self.pump.fanOff()
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
            timestamp = self.rtc.getDateTimeStr() 
            print(timestamp)
            
            print("controlLights...")
            self.light.control(self.rtc)        
            
         
            #print("read temp and humidity...")
            self.probe.measureIt(self.rtc)
            
            print("Read co2...")
            self.co2probe.measureIt(self.rtc)
            #print("co2: " + str(co2probe.co2))
            

            temperature = self.probe.temperature
            print("Temp: "+ str(temperature))
            #self.windows.control(temperature, self.MAX_TEMPERATURE)
            
            humidity = self.probe.humidity
            print("Humidity: "+ str(humidity))

            airTemperature = temperature 
            #leafTemperature = temperature - 1.5
            leafTemperature = round(self.heatSensor.get_obj_temp(),2)
        
            print("Air Temp:",airTemperature,"C")
            print("Leaf Temp:", leafTemperature,"C")

            vpd = self.calculateVPD(airTemperature, leafTemperature, humidity)
            
            self.fan.control(vpd)

            self.heater.control(temperature, self.MIN_TEMPERATURE)
            
            print("controlWatering...")
            self.pump.control(temperature, self.rtc)
            
            print("display data...")
            self.lcd.showData(self.probe, self.co2probe, self.rtc, vpd, leafTemperature, airTemperature)        

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
            
def main():
    
    plantCare = PlantCare("192.168.1.1")
    
    while True:
        plantCare.careforplants()

if __name__ == "__main__":
    main()
