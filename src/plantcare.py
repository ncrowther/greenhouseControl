from machine import Pin, PWM, ADC, I2C
import dht
import time
import binascii
import ssd1306
import machine
import onewire
import ds18x20
from pico_i2c_lcd import I2cLcd

#################################################
### Greenouse controller for Rasberry Pi Pico ###
### Author: Nigel T. Crowther
### Date: 03-Sep-2024
#################################################

#### DEFINE WATERING TIMES HERE ####
WATERING_TIMES = ["10:00", "12:00", "17:00"]

### DEFINE FAN ON TEMPERATURE
FAN_ON_TEMPERATURE = 23

# Define light on and off times
LIGHT_ON_HOUR  = 09 # 24 hour
LIGHT_OFF_HOUR = 20 # 24 hour
LIGHT_ON_TIME  = time.mktime((2000, 01, 01, LIGHT_ON_HOUR, 00, 00, 0, 0))
LIGHT_OFF_TIME = time.mktime((2000, 01, 01, LIGHT_OFF_HOUR, 00, 00, 0, 0))

# Define midnight reset period
RESET_HOUR = 00 # 24 hour
RESET_ON_TIME  = time.mktime((2000, 01, 01, RESET_HOUR, 00, 00, 0, 0))
RESET_OFF_TIME = time.mktime((2000, 01, 01, RESET_HOUR, 01, 00, 0, 0))

class LightSwitch(object):
    # Relay light switch

    def __init__(self):
        # GPIO pin number  relay is connected to
        RELAY_PIN = 22
        self.relay_pin = Pin(RELAY_PIN, Pin.OUT)

    def on(self):
        self.relay_pin.value(1)  # Set relay to ON state

    def off(self):
        self.relay_pin.value(0)  # Set relay to OFF state


    
class PwmSwitch(object):
    # PWM dual power switch

    def __init__(self):
        #Define pins for Pump
        PWM_IN = 18
        PWM_OUT = 19    
        self.pump_a = PWM(Pin(PWM_IN), freq=1000)
        self.pump_b = PWM(Pin(PWM_OUT), freq=1000)

        # Define pins for Fan
        PWM_IN = 16
        PWM_OUT = 17    
        self.fan_a = PWM(Pin(PWM_IN), freq=1000)
        self.fan_b = PWM(Pin(PWM_OUT), freq=1000)
        
    def pumpOn(self):
        print("Pump ON")
        MAX_PUMP_SPEED = 65535
        self.pump_a.duty_u16(0)
        self.pump_b.duty_u16(MAX_PUMP_SPEED)  # speed(0-65535)
            
    def pumpOff(self):
        # Stop pump
        self.pump_a.duty_u16(0)
        self.pump_b.duty_u16(0)
        
    def fanOn(self):
        print("Fan ON")
        MAX_FAN_SPEED = 65535
        self.fan_a.duty_u16(0)
        self.fan_b.duty_u16(MAX_FAN_SPEED)  # speed(0-65535)
            
    def fanOff(self):   
        # Stop fan
        self.fan_a.duty_u16(0)
        self.fan_b.duty_u16(0)        


class DDS18B20Probe(object):
  
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
        
    def measureIt(self, rtc):   
        try:
            # get temp 
            roms = self.ds_sensor.scan()
            print('Found DS devices: ', roms)

            self.ds_sensor.convert_temp()
            time.sleep_ms(750)
            for rom in roms:
                print(rom)
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
            print("DDS18B20 Probe failed to read temperature")
            print(e)
   

class ds3231(object):
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
    
    def getDateTime(self):
        t = self.bus.readfrom_mem(int(self.address),int(self.start_reg),7)
        return t
    
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

        #print("Time: ", timeStr)
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
        print(addr)

        addr = self.bus.scan()[0]
        print(addr)

        self.lcd = I2cLcd(self.bus, addr, 2, 16)
        
        self.lcd.putstr("Hello RPi Pico!\n")
        
    def showData(self, ddsProbe, rtc):
                
        ddsProbe.measureIt(rtc)
        
        timeNow= rtc.getTimeStr()    
        timeStr = "Time: " + timeNow ;
        temperatureStr = "Temp: " + str(ddsProbe.temperature) + "C"
        highStr = "High: " + str(ddsProbe.highTemp) + "C"
        lowStr =  "Low:  " + str(ddsProbe.lowTemp) + "C"        
        
        # Display high lows on the LCD screen       
        self.lcd.clear()
        self.lcd.putstr(highStr)
        self.lcd.putstr("\n")        
        self.lcd.putstr(lowStr)
        
        sleep(4000)
        
        # Display time & temp on the LCD screen       
        self.lcd.clear()
        self.lcd.putstr(timeStr)
        self.lcd.putstr("\n")
        self.lcd.putstr(temperatureStr)        
    
def controlTemperature(ddsProbe, pwmSwitch, rtc):
    SAMPLE_SIZE = 3 # sample size
    SECONDS = 5000 # ms
    temperatureArray = [None] * SAMPLE_SIZE
    
    for i in range(SAMPLE_SIZE):
        
        time.sleep_ms(SECONDS)
        
        ddsProbe.measureIt(rtc)
        temperature = ddsProbe.temperature
        temperatureArray[i] = temperature
    
    averageTemp = sum(temperatureArray) / SAMPLE_SIZE

    secs = (SECONDS * SAMPLE_SIZE) / 1000;
    
    print("Average temperature over " + str(secs) + " seconds: " + str(averageTemp) + "C")
    
    if (averageTemp >= FAN_ON_TEMPERATURE):
        pwmSwitch.fanOn()        
    else:
        pwmSwitch.fanOff()
        
    return averageTemp
        
def controlWatering(averageTemp, pwmSwitch):
    
    MIN_WATERING_TEMP = 10
    timeNow = rtc.getTimeStr()
    
    if (averageTemp > MIN_WATERING_TEMP and timeNow in WATERING_TIMES):
        pwmSwitch.pumpOn()
        
        wateringPeriod = int(pow(averageTemp, 3) * 3)
        wateringPeriodSeconds = wateringPeriod/1000
        print("Watering Period %s seconds " %wateringPeriodSeconds)
        sleep(wateringPeriod)
        pwmSwitch.pumpOff()
        # Do nothing for the rest of one minute to prevent this 'if statement' repeating
        minuteRemainder = 60000 - wateringPeriod
        print("Remaining seconds %s " %minuteRemainder)
        if (minuteRemainder > 0):
           sleep(minuteRemainder)
    else:
        pwmSwitch.pumpOff()
        
def controlLights(lightSwitch, rtc):

    if (rtc.timeInRange(LIGHT_ON_TIME, LIGHT_OFF_TIME)):
        lightSwitch.on()
    else:
       lightSwitch.off() 
           
        
def sleep(period):
    print("Sleep for " + str(period) + "ms") 
    time.sleep_ms(period)
    
## MAIN ##

rtc = ds3231()
        
# Set internal clock
rtc.set_time('20:37:00,Saturday,2024-09-14')       

## Creat the objects to be controlled
lightSwitch = LightSwitch()
ddsProbe = DDS18B20Probe()
pwmSwitch = PwmSwitch()
lcd = Lcd()

lcd.showData(ddsProbe, rtc)
        
# Turn on and off objects for startup check
pwmSwitch.fanOn()
pwmSwitch.pumpOn()
lightSwitch.on()
        
# Clear screen
# oled.clearOled()

sleep(5000)

# Turn off everything before starting loop
pwmSwitch.fanOff()
pwmSwitch.pumpOff()
lightSwitch.off()

sleep(2000)
  
# loop forever looking after plants
try:
    while True:
        
        timeNow = rtc.getDateTime()
        rtc.printDateTime(timeNow) 
        
        controlLights(lightSwitch, rtc)        
        
        averageTemp = controlTemperature(ddsProbe, pwmSwitch, rtc)
        
        lcd.showData(ddsProbe, rtc)
        
        controlWatering(averageTemp, pwmSwitch)
           
except Exception as e:
    print(e)
    print("Terminated")
    pwmSwitch.fanOff()
    pwmSwitch.pumpOff()
    lightSwitch.off()
    
