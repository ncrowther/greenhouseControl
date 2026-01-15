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

#from Lcd import Lcd

#################################################
### Greenhouse controller for Rasberry Pi Pico ###
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
        RELAY_PIN = 18
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
        RELAY_PIN = 19
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
        
        # Print the rounded temperature to 1 decimal place
        print("On temp: {} <= {}".format(temperature, minTemperature))        
        
        # On     
        if (OnOffState.AUTO == self.status()) and (temperature <= minTemperature):
            print("Heat On: " + str(temperature) + "<=" + str(minTemperature))          
            self.setState(OnOffState.ON)
            self.setState(OnOffState.AUTO)
            
        print("Off temp: {} > {}".format(temperature, minTemperature + DEAD_ZONE))                 

        # Off
        offTemperature = (minTemperature + DEAD_ZONE)
        if (OnOffState.AUTO == self.status()) and (temperature > offTemperature):
            print("Heat Off: " + str(temperature) + ">" + str(offTemperature))
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
    MAX_ACTUATOR_ANGLE = 180
    MIN_ACTUATOR_ANGLE = 0
    PULSE_DEGREE_CHANGE = 10
    RUN_SECS = 5
    PAUSE_SECS = 10
    
    def __init__(self):
        # GPIO pin + window is connected to
        UP_PIN = 14
        self.up_pin = Pin(UP_PIN, Pin.OUT)
        
        # GPIO pin - window is connected to
        DOWN_PIN = 15
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
            
    def control(self, temperature, maxTemperature):
        
        # Degrees in which the temp must drop below max temperature before closing
        DEAD_ZONE = 2
           
        # Open
        if (WindowState.AUTO == self.status()) and (temperature > maxTemperature):
            print("Vent Up: " + str(temperature) + ">" + str(maxTemperature))
            self.up(self.RUN_SECS, self.PAUSE_SECS)

        # Close
        minTemperature = (maxTemperature - DEAD_ZONE)
        if (WindowState.AUTO == self.status()) and (temperature < minTemperature):
            print("Vent Down: " + str(temperature) + "<" + str(minTemperature))
            self.down(self.RUN_SECS, self.PAUSE_SECS)

    def angle(self):
        return self.windowAngle  

    def status(self):
        return self.state
    
    def setPauseSecs(self, pauseSecs):
        self.PAUSE_SECS = pauseSecs
        
    def setRunSecs(self, runSecs):
        self.RUN_SECS = runSecs            
    
    def up(self, runTimeSeconds, intervalSeconds):
        
        if (self.windowAngle <= self.MAX_ACTUATOR_ANGLE):
            
            self.down_pin.value(0)  # Set down to OFF state
            self.up_pin.value(1)  # Set up to ON state   
            
            print("Run Period %s seconds " %runTimeSeconds )        
                 
            time.sleep_ms(runTimeSeconds * 1000)
            
            print("Run period OFF ")
            self.up_pin.value(0)  # Set up to OFF state
            
            # Sleep for pause interval
            print("Interval %s seconds " %intervalSeconds )           
            time.sleep_ms(intervalSeconds * 1000)        
            
            # Increment degrees incline
            self.windowAngle = self.windowAngle + runTimeSeconds
            
            if (self.windowAngle > self.MAX_ACTUATOR_ANGLE):
                self.windowAngle = self.MAX_ACTUATOR_ANGLE
                
            print("Window Angle: " + str(self.windowAngle))              
        
    def down(self, runTimeSeconds, intervalSeconds):

        if (self.windowAngle > self.MIN_ACTUATOR_ANGLE):    
        
            self.up_pin.value(0)  # Set up to OFF state   
            self.down_pin.value(1)  # Set down to ON state    
            
            print("Run Period %s seconds " %runTimeSeconds )        
                 
            time.sleep_ms(runTimeSeconds * 1000)
            
            print("Run period OFF ")
            self.down_pin.value(0)  # Set down to OFF state
            
            # Sleep for pause interval
            print("Interval %s seconds " %intervalSeconds )           
            time.sleep_ms(intervalSeconds * 1000)  

            # Decrement degrees incline
            self.windowAngle = abs(self.windowAngle - runTimeSeconds)
            print("Window Angle: " + str(self.windowAngle))      
       
                    
"""
This code defines a class Fan that controls a fan using PWM signals. 
The on method turns the fan on, and the off method turns it off. 
The control method checks the temperature and turns the fan on or off based on the specified conditions.
"""
class Fan(OnOFFAutoController):
    
    def __init__(self):
        # GPIO pin number fan is connected to
        RELAY_PIN = 21
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
The Pump class has methods for controlling the pump's speed, turning it off, and watering the plants. 
It also has a control method that determines when to water the plants based on temperature and time.
"""
class Pump(OnOFFAutoController):
    # PWM dual power switch

    #### DEFINE WATERING TIMES HERE ####
    WATERING_TIMES = [10, 13, 21]
    WATERING_PERIOD = 1 # minutes

    def __init__(self):
        # GPIO pin number  relay is connected to
        RELAY_PIN = 20
        self.relay_pin = Pin(RELAY_PIN, Pin.OUT)
        
    def on(self):
        #print("Pump ON")
        self.relay_pin.value(1)  # Set relay to ON state
            
    def off(self):   
        #print("Pump OFF")
        self.relay_pin.value(0)  # Set relay to OFF state
              
    async def watering(self, wateringPeriod):
        print("Watering Period %s seconds " %wateringPeriod )
        
        self.setState(OnOffState.ON) 
        await asyncio.sleep_ms(wateringPeriod * 1000)
        
        print("Watering Period OFF ")
        self.setState(OnOffState.OFF)
        
        # Set back to Auto for next time
        self.setState(OnOffState.AUTO)   
              
    def control(self, temperature, rtc):
        
        #print("Pump state %s" %self.status())
        
        if (OnOffState.AUTO == self.status()):

            for h in self.WATERING_TIMES:
                                
                # Define pump on/off time
                PUMP_ON_HOUR  = h # 24 hour
 
                PUMP_ON_TIME  = time.mktime((2000, 1, 1, PUMP_ON_HOUR, 0, 0, 0, 0))
                PUMP_OFF_TIME = time.mktime((2000, 1, 1, PUMP_ON_HOUR, self.WATERING_PERIOD, 0, 0, 0))                     
                    
                if (rtc.timeInRange(PUMP_ON_TIME, PUMP_OFF_TIME)):
                    print("Pump on: " + str(PUMP_ON_HOUR)+ "h for " + str(self.WATERING_PERIOD) + "m")
                    self.setState(OnOffState.ON)          
                    self.setState(OnOffState.AUTO)
                    return
                    
                if (not rtc.timeInRange(PUMP_ON_TIME, PUMP_OFF_TIME)):
                    self.setState(OnOffState.OFF)
                    self.setState(OnOffState.AUTO)
                               
        
        #if ( (temperature > self.MIN_WATERING_TEMP) and (timeNow in self.WATERING_TIMES) and (OnOffState.AUTO == self.status()) ):                                     
         #   asyncio.create_task(self.watering(self.WATERING_PERIOD))
     
    def setTimes(self, wateringTimes, period, minTemp):
        self.WATERING_TIMES = wateringTimes
        self.WATERING_PERIOD = period
        
"""
This code controls various devices such as a pump, fan, heater, , and probe. 
The "careforplants" method performs various tasks such as controlling the lights, temperature, watering, and displaying data on the LCD screen. 
It also includes error handling to handle hardware errors and general exceptions.
"""
class PlantCare(object):
    

    # define temperature range
    MIN_TEMPERATURE  = 15
    MAX_TEMPERATURE = 25
        
    def __init__(self, ip):
        
        try:
            self.ip = ip
      
            # Clock used to active objects on a schedule 
            self.rtc = Clock()
            
            # Init temperature probe
            self.temperatureProbe = TemperatureHumidityProbe()            

            ## Create the objects to be controlled
            self.windows = LinearActuator()
            self.pump = Pump()
            self.fan = Fan()

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
            
        except HardwareError as e:
            print("Exception: " + str(e))
            
            statusLight = StatusLight()
            statusLight.setErroredStatus()                 
        
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
        
    def setHeater(self, state):
        self.heater.setState(state)      
          
    def setWindow(self, state):      
        self.windows.setState(state)
        
    def setWindowRun(self, runSecs):      
        self.windows.setRunSecs(runSecs)
        
    def setWindowPause(self, pauseSecs):      
        self.windows.setPauseSecs(pauseSecs)        
        
    def setLight(self, state):
        self.light.setState(state)
        
    def setLightOnOffTime(self, onTime, offTime):
        self.light.setOnOffTime(onTime, offTime)        
        
    def setTemperatureRange(self, min, max):      
        print("Set temp range: {}-{}".format(min, max))     
        self.MIN_TEMPERATURE = min
        self.MAX_TEMPERATURE = max
        
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

    def careforplants(self):
          
        print("careforplants...")
     
        # Look after plants
        try:
            time.sleep_ms(500)
            timestamp = self.rtc.getDateTimeStr() 
            print(timestamp)
            
            self.temperatureProbe.measureIt()                    
            airTemperature = self.temperatureProbe.temperature
            humidity = self.temperatureProbe.humidity              
            
            print("control vents")
            self.windows.control(airTemperature, self.MAX_TEMPERATURE)
            
            print("control fans")            
            self.fan.control(airTemperature, self.MAX_TEMPERATURE)            
            
            print("control watering...")
            self.pump.control(airTemperature, self.rtc)

          
        except HardwareError as e:
            print("Exception: " + str(e))
            
            statusLight = StatusLight()
            statusLight.setErroredStatus()  
         
            sys.exit("Terminated")
                                   

            
def main():
    
    plantCare = PlantCare("192.168.1.1")
             
    while True:
        plantCare.careforplants()

if __name__ == "__main__":
    main()


