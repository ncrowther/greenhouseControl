from machine import Pin, I2C
from micropython_sht20 import sht20

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
        
if __name__ == '__main__':
    
    probe = TemperatureHumidityProbe()
    probe.measureIt(0, 20, 50)        