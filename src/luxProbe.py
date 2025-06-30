# Rui Santos & Sara Santos - Random Nerd Tutorials
# Complete project details at https://RandomNerdTutorials.com/raspberry-pi-pico-bh1750-micropython/

from machine import Pin, SoftI2C
from bh1750 import BH1750
import time


class LuxProbe(object):
  
    def __init__(self):
    
        # setup the I2C communication for the Light sensor
        I2C_SDA = 20
        I2C_SCL = 21
        
        #  I2C Pins
        i2c = SoftI2C(scl=Pin(I2C_SCL), sda=Pin(I2C_SDA), freq=400000)
        
        scan = i2c.scan()
        print("I2c LED scan: ", scan)

        # Create BH1750 object
        self.light_sensor = BH1750(bus=i2c, addr=0x5c)#addr=addr=0x23)
        
        time.sleep_ms(200)
        
        self.lux = 0        
        self.highlux = 0
        self.lowlux = 100
        
        
    def measureIt(self, rtc):   
    
        try:
            print('measureIt')
            
            self.lux = self.light_sensor.luminance(BH1750.CONT_HIRES_1)
            
            # Reset stats at midnight
            #if (rtc.timeInRange(RESET_ON_TIME, RESET_OFF_TIME)):
            #    print("Reset stats")
            #    self.highlux = 0
            #    self.lowlux = 10000
                
            # Set lux high score
            if (self.lux > self.highlux):
                self.highlux = self.lux
            
            if (self.lux < self.lowlux):
                self.lowlux = self.lux
                
            
        except Exception as e:
            
            print("Error in Lux probe:", e)
       
     

luxProbe = LuxProbe()


# Read lux every 2 seconds
while True:
    luxProbe.measureIt(None) #self.rtc)
    
    print("Luminance: {:.2f} lux".format(luxProbe.lux))
            
    time.sleep(2)
    

