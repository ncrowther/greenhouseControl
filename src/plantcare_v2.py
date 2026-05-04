import sys
import math
from machine import Pin, PWM, ADC, I2C
import time
import binascii
import machine
import asyncio
from StatusLight import StatusLight
from Sht20Probe import TemperatureHumidityProbe
from Rtc import Clock
from Errors import HardwareError

#################################################
### Greenhouse controller for Rasberry Pi Pico ###
### Author: Nigel T. Crowther
### Date: 03-Sep-2024
#################################################

class OnOffState():
    ON = "ON"
    OFF = "OFF"
    AUTO = "AUTO"  
    
class WindowState():
    OPEN = "OPEN"
    CLOSED = "CLOSED"
    AUTO = "AUTO"
        
# Abtract class for controller devices

    """
    This class is a controller for an ON/OFF device.
    
    Attributes:
        state (OnOffState): The current state of the device.
    
    Methods:
        setState(state): Sets the state of the device.
        status(): Returns the current state of the device.
    """
class OnOffController:
    
    state = OnOffState.AUTO
        
    def setState(self, state):
        
        if not hasattr(OnOffState, state) : 
            print('**Invalid state:' + str(state))
            return
        
        #print('**Set state:' + str(self.state) + "->" + str(state))
        
        if (state == OnOffState.ON):
            self.on()
        elif (state == OnOffState.OFF):
            self.off()
        #elif (state == OnOffState.AUTO):
            # Do nothing               
   
        self.state = state                    
            
    def status(self):
        return self.state
    
class SolenoidController(OnOffController):

    internalState = OnOffState.ON
                    
    def __init__(self):
        
        self.initialised = False
        # GPIO pin + window is connected to
        UP_PIN = 16
        self.up_pin = Pin(UP_PIN, Pin.OUT)
        self.up_pin.value(0)  # Set down to OFF state        
        
        # GPIO pin - window is connected to
        DOWN_PIN = 17
        self.down_pin = Pin(DOWN_PIN, Pin.OUT)
        self.down_pin.value(0)  # Set down to OFF state

    
    def on(self):
        
        print("ON: " + self.internalState)
        
        if (OnOffState.OFF == self.internalState):   
            self.down_pin.value(0)  # Set down to OFF state
            self.up_pin.value(1)  # Set up to ON state    
                 
            # Pulse on             
            time.sleep_ms(1000)
            # Pulse off
            
            self.up_pin.value(0)  # Set up to OFF state
            
            self.internalState = OnOffState.ON            
                     
        
    def off(self):
        
        print("OFF: " + self.internalState)        
     
        if (OnOffState.ON == self.internalState):     
            self.up_pin.value(0)  # Set up to OFF state   
            self.down_pin.value(1)  # Set down to ON state    
                     
            # Pulse on             
            time.sleep_ms(1000)
            # Pulse off
            
            self.down_pin.value(0)  # Set down to OFF state
            
            self.internalState = OnOffState.OFF            
           
    
"""
The Light class has methods to turn the light on and off, as well as to control the light based on a given time.
"""
class LightSwitch(OnOffController):
    # Relay light switch

    # Define light on and off times
    LIGHT_ON_HOUR  = 9 # 24 hour
    LIGHT_OFF_HOUR = 19 # 24 hour
    LIGHT_ON_TIME  = time.mktime((2000, 1, 1, LIGHT_ON_HOUR, 0, 0, 0, 0))
    LIGHT_OFF_TIME = time.mktime((2000, 1, 1, LIGHT_OFF_HOUR, 0, 0, 0, 0))

    def __init__(self):
        # GPIO pin number  relay is connected to
        RELAY_PIN = 19
        self.relay_pin = Pin(RELAY_PIN, Pin.OUT)
        self.state = OnOffState.AUTO

    def setOnOffTime(self, onTime, offTime):
        # redefine light on and off times
        self.LIGHT_ON_HOUR  = int(onTime) # 24 hour
        self.LIGHT_OFF_HOUR = int(offTime) # 24 hour
        self.LIGHT_ON_TIME  = time.mktime((2000, 1, 1, self.LIGHT_ON_HOUR, 0, 0, 0, 0))
        self.LIGHT_OFF_TIME = time.mktime((2000, 1, 1, self.LIGHT_OFF_HOUR, 0, 0, 0, 0))                    
            
    def on(self):
        self.relay_pin.value(1)  # Set relay to ON state
            
    def off(self):   
        self.relay_pin.value(0)  # Set relay to OFF state
        
    def control(self, rtc):

        #print("Light state %s" %self.status())
        
        if (OnOffState.AUTO == self.status()) and (rtc.timeInRange(self.LIGHT_ON_TIME, self.LIGHT_OFF_TIME)):
            self.setState(OnOffState.ON)          
            self.setState(OnOffState.AUTO)
            
        if (OnOffState.AUTO == self.status()) and (not rtc.timeInRange(self.LIGHT_ON_TIME, self.LIGHT_OFF_TIME)):            
            self.setState(OnOffState.OFF)
            self.setState(OnOffState.AUTO)            


"""
This code defines a class called Heater that inherits from the OnOffController class. 
The Heater class has an init method that initializes the relay pin number and sets it to output mode. 
It also has on and off methods that set the relay pin to the corresponding state. 
The control method turns on the heater if it is lower than the min temperature
If the temperature rises above the dead zone, the heater is turned off
"""
class Heater(OnOffController):
    # Relay heater
    
    def __init__(self):
        # GPIO pin number  relay is connected to
        RELAY_PIN = 20
        self.relay_pin = Pin(RELAY_PIN, Pin.OUT)
        
    def on(self):
        self.relay_pin.value(1)  # Set relay to ON state
            
    def off(self):   
        self.relay_pin.value(0)  # Set relay to OFF state
        
    def control(self, temperature, minTemperature):
        
        # Degrees in which the temp must rise before turning off
        DEAD_ZONE = 1
            
        # On     
        if (OnOffState.AUTO == self.status()) and (temperature <= minTemperature):
            #print("Heat On: " + str(temperature) + "<=" + str(minTemperature))          
            self.setState(OnOffState.ON)
            self.setState(OnOffState.AUTO)
            
        #print("Off temp: {} > {}".format(temperature, minTemperature + DEAD_ZONE))                 

        # Off
        offTemperature = (minTemperature + DEAD_ZONE)
        if (OnOffState.AUTO == self.status()) and (temperature > offTemperature):
            #print("Heat Off: " + str(temperature) + ">" + str(offTemperature))
            self.setState(OnOffState.OFF)
            self.setState(OnOffState.AUTO)
            
""" 
This class is for Window Control. 
It sets up two GPIO pins, one for the up button and one for the down button. 
It also initializes the window angle to 0 and sets the initial state of the window to AUTO.
"""
class Vent(object):
    # Vent control

    MAX_RUN_SECONDS = 180
    RUN_SECS = 5
    PAUSE_SECS = 10
    
    def __init__(self):
        
        self.initialised = False
        # GPIO pin + window is connected to
        UP_PIN = 14
        self.up_pin = Pin(UP_PIN, Pin.OUT)
        self.up_pin.value(0)  # Set down to OFF state        
        
        # GPIO pin - window is connected to
        DOWN_PIN = 15
        self.down_pin = Pin(DOWN_PIN, Pin.OUT)
        self.down_pin.value(0)  # Set down to OFF state        
        
        # Degree opening for window
        self.runSeconds = 0
    
        self.state = WindowState.AUTO
                

    def setState(self, state):
        
        self.state = state
            
        if (state == WindowState.OPEN):
            self.down_pin.value(0)  # Set down to OFF state
            self.up_pin.value(1)  # Set up to ON state
            self.runSeconds = self.MAX_RUN_SECONDS
            #print("Window OPEN")
        elif (state == WindowState.CLOSED):
            self.up_pin.value(0)  # Set up to OFF state        
            self.down_pin.value(1)  # Set down to ON state
            self.runSeconds = 0 # Fully closed angle
            #print("Window CLOSED")           
            
    def control(self, count, temperature, maxTemperature, statusLight):
        
        # Degrees in which the temp must drop below max temperature before closing
        DEAD_ZONE = 2

        # Return if initialisation delay not met
        if not (self.initialised):
            modulus = count % self.MAX_RUN_SECONDS
            print("Count %s, Pause: %s, Modulus %s " %(count, self.MAX_RUN_SECONDS, modulus) )                   
            if (modulus != 0):
                # Sleep for pause interval
                remaining = self.MAX_RUN_SECONDS - modulus
                print("**Initialisation delay remaining seconds: %s " %remaining )
                statusLight.setVentDwellStatus()
                return
            else:
                self.initialised = True
                self.setState(OnOffState.AUTO)

        # Return if delay time not met
        modulus = count % self.PAUSE_SECS
        print("Count %s, Pause: %s, Modulus %s " %(count, self.PAUSE_SECS, modulus) )           
        if (modulus != 0):
            # Sleep for pause interval
            remaining = self.PAUSE_SECS - modulus
            print("Remaining time %s " %remaining )
            statusLight.setVentDwellStatus()
            return
           
        # Open
        if (WindowState.AUTO == self.status()) and (temperature > maxTemperature) and (self.runSeconds <= self.MAX_RUN_SECONDS):
            print("UP Temp %s > maxTemp: %s run %s -> %s" %(temperature, maxTemperature, self.runSeconds, self.MAX_RUN_SECONDS) )     
            statusLight.setVentRunStatus()
            
            self.up(self.RUN_SECS)

        # Close
        minTemperature = (maxTemperature - DEAD_ZONE)
        if (WindowState.AUTO == self.status()) and (temperature < minTemperature) and (self.runSeconds > 0):
            print("DOWN Temp %s < minTemp: %s run %s -> 0" %(temperature, minTemperature, self.runSeconds) )              
            statusLight.setVentRunStatus()            
            self.down(self.RUN_SECS)

    def angle(self):
        return self.runSeconds  

    def status(self):
        return self.state
    
    def setPauseSecs(self, pauseSecs):
        self.PAUSE_SECS = pauseSecs
        
    def setRunSecs(self, runSecs):
        self.RUN_SECS = runSecs            
    
    def up(self, runTimeSeconds):
        
        self.down_pin.value(0)  # Set down to OFF state
        self.up_pin.value(1)  # Set up to ON state   
        
        print("UP run %s seconds " %runTimeSeconds )        
             
        time.sleep_ms(runTimeSeconds * 1000)
        
        print("Run period OFF ")
        self.up_pin.value(0)  # Set up to OFF state      
        
        # Increment seconds running up
        self.runSeconds = self.runSeconds + runTimeSeconds
            
        print("Total UP run: %s seconds " %self.runSeconds )               
        
    def down(self, runTimeSeconds):
     
        self.up_pin.value(0)  # Set up to OFF state   
        self.down_pin.value(1)  # Set down to ON state    
        
        print("DOWN run: %s seconds " %runTimeSeconds )        
             
        time.sleep_ms(runTimeSeconds * 1000)
        
        print("Run period OFF ")
        self.down_pin.value(0)  # Set down to OFF state 

        # Increment seconds running down
        self.runSeconds = self.runSeconds - runTimeSeconds
        
        if (self.runSeconds < 0):
            self.runSeconds = 0
            
        print("Total DOWN run: %s seconds " %self.runSeconds )             
        
    def fullDown(self):
        self.up_pin.value(0)  # Set up to OFF state   
        self.down_pin.value(1)  # Set down to ON state         
        self.runSeconds = 0       
        
    def fullUp(self):
        self.up_pin.value(1)  # Set up to ON state   
        self.down_pin.value(0)  # Set down to OFF state         
        self.runSeconds = self.MAX_RUN_SECONDS        
                    
       
                    
"""
This code defines a class Fan that controls a fan using PWM signals. 
The on method turns the fan on, and the off method turns it off. 
The control method checks the temperature and turns the fan on or off based on the specified conditions.
"""
class Fan(OnOffController):
    
    def __init__(self):
        # GPIO pin number 
        RELAY_PIN = 18
        self.relay_pin = Pin(RELAY_PIN, Pin.OUT)
        
    def on(self):
        self.relay_pin.value(1)  # Set relay to ON state
            
    def off(self):   
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
The Pump class has methods for controlling the pump's speed, turning it off, and watering the plants. 
It also has a control method that determines when to water the plants based on temperature and time.
"""
class Pump(SolenoidController):
    
    #### DEFINE WATERING TIMES HERE ####
    WATERING_TIMES = [6, 12, 18]
    WATERING_DURATION = 1 # minutes
              
    def control(self, temperature, rtc):
        
        #print("Pump state %s" %self.status())
        
        if (OnOffState.AUTO == self.status()):

            for h in self.WATERING_TIMES:
                                
                # Define pump on/off time
                PUMP_ON_HOUR  = h # 24 hour
 
                PUMP_ON_TIME  = time.mktime((2000, 1, 1, PUMP_ON_HOUR, 0, 0, 0, 0))
                PUMP_OFF_TIME = time.mktime((2000, 1, 1, PUMP_ON_HOUR, self.WATERING_DURATION, 0, 0, 0))                   
                    
                if (rtc.timeInRange(PUMP_ON_TIME, PUMP_OFF_TIME)):
                    print("Pump on: " + str(PUMP_ON_HOUR)+ "h for " + str(self.WATERING_DURATION) + "s")
                    self.setState(OnOffState.ON)          
                    self.setState(OnOffState.AUTO)
                    return
                
                OFF_WINDOW = 59  # minutes
                PUMP_OFF_TIME2 = time.mktime((2000, 1, 1, PUMP_ON_HOUR, OFF_WINDOW, 0, 0, 0))                   
                
                if (rtc.timeInRange(PUMP_OFF_TIME, PUMP_OFF_TIME2)):
                    print("Pump off: " + str(PUMP_ON_HOUR)+ "h for " + str(OFF_WINDOW) + "s")
                    self.setState(OnOffState.OFF)          
                    self.setState(OnOffState.AUTO)
                    return                
                    
                
     
    def setTimes(self, wateringTimes, period, minTemp):
        self.WATERING_TIMES = wateringTimes
        self.WATERING_DURATION = period      
        
"""
This code controls various devices such as a pump, fan, heater, , and probe. 
The "careforplants" method performs various tasks such as controlling the lights, temperature, watering 
It also includes error handling to handle hardware errors and general exceptions.
"""
class PlantCare(object):
    
    # define temperature range
    MIN_TEMPERATURE  = 15
    MAX_VENT_TEMPERATURE = 25
    MAX_FAN_TEMPERATURE = MAX_VENT_TEMPERATURE + 2
        
    def __init__(self, ip):
       
        try:
            self.ip = ip
            
            # Clock used to active objects on a schedule 
            self.rtc = Clock()
            
            # Neopixel status light
            self.statusLight = StatusLight()
            
            # Init temperature probe
            self.temperatureProbe = TemperatureHumidityProbe()
            self.temperatureProbe.measureIt()                    
            airTemperature = self.temperatureProbe.temperature           

            ## Create the objects to be controlled
            self.windows = Vent()
            self.pump = Pump()
            self.fan = Fan()
            # Agricultural grow light
            self.light = LightSwitch()            
            self.heater = Heater()            
            
            self.pump.setState(OnOffState.OFF)
            self.pump.setState(OnOffState.AUTO)        
                         
            self.fan.setState(OnOffState.OFF)
            self.fan.setState(OnOffState.AUTO)
            
            self.light.setState(OnOffState.OFF)
            self.light.setState(OnOffState.AUTO)
            
            self.heater.setState(OnOffState.OFF)
            self.heater.setState(OnOffState.AUTO)            
            
            # Startup 
            # Set to default pos before auto controls
            if (airTemperature <= self.MAX_VENT_TEMPERATURE): 
                self.windows.fullDown()
            else:
                self.windows.fullUp()               
            
        except HardwareError as e:
            print("Exception: " + str(e))         
            self.statusLight.setErroredStatus()                 
        
    def setDateTime(self, datetime):              
        
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
        
    def setLight(self, state):
        self.light.setState(state)
        
    def setLightOnOffTime(self, onTime, offTime):
        self.light.setOnOffTime(onTime, offTime)
        
    def setHeater(self, state):
        self.heater.setState(state)    
          
    def setWindow(self, state):      
        self.windows.setState(state)
        
    def setWindowRun(self, runSecs):      
        self.windows.setRunSecs(runSecs)
        
    def setWindowPause(self, pauseSecs):      
        self.windows.setPauseSecs(pauseSecs)              
        
    def setTemperatureRange(self, min, max):          
        self.MIN_TEMPERATURE = min
        self.MAX_VENT_TEMPERATURE = max
        self.MAX_FAN_TEMPERATURE= max + 5
        
    def getTemperatureData(self):
        return self.temperatureProbe.temperature
    
    def getHumidityData(self):
        return self.temperatureProbe.humidity       
    
    def setPump(self, state):
        self.pump.setState(state)
        
    def setFan(self, state):
        self.fan.setState(state)        
           
    def setWateringTimes(self, wateringTimes, period, minTemp):
        
        if (period == None):
            period = 1 # Minutes
            
        if (minTemp == None):
            minTemp = 10 # C
            
        self.pump.setTimes(wateringTimes, period, minTemp)
    
    def cleanUp(self):
        self.pump.setState(OnOffState.OFF)
        self.light.setState(OnOffState.OFF)        

    def careforplants(self, count):
     
        # Look after plants
        try:
            time.sleep_ms(500)
            
            self.temperatureProbe.measureIt()                    
            airTemperature = self.temperatureProbe.temperature
            humidity = self.temperatureProbe.humidity
            
            #print("control vents")
            self.windows.control(count, airTemperature, self.MAX_VENT_TEMPERATURE, self.statusLight)
            
            #print("control fans")
            self.fan.control(airTemperature, self.MAX_FAN_TEMPERATURE)
            
            #print("control heater")            
            self.heater.control(airTemperature, self.MIN_TEMPERATURE) 
            
            # print("control watering...")
            self.pump.control(airTemperature, self.rtc)
            
            #print("controlLights...")
            self.light.control(self.rtc)                   

          
        except HardwareError as e:
            print("Exception: " + str(e))
            
            self.statusLight.setErroredStatus()  
         
            sys.exit("Terminated")
                                   

            
def main():
    
    plantCare = PlantCare("192.168.1.1")
             
    while True:
        plantCare.careforplants(1)

if __name__ == "__main__":
    main()


