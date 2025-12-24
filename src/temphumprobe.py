from micropython_sht20 import SHT20
from machine import Pin, PWM, ADC, I2C
import time

#
## SH20 temperature humidity probe
#
class TemperatureHumidityProbe(object):
  
    def __init__(self):
        # setup the I2C communication for the SHT20 sensor
        #  I2C Pins
        I2C_PORT = 0
        I2C_SDA =0
        I2C_SCL = 1      

        i2c = I2C(I2C_PORT, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA))
                                                      
        addr = i2c.scan()

        addr = i2c.scan()[0]
        print("**************************" + str(addr))

        self.sht = SHT20(i2c, addr)
        
        self.temperature = 0        
        self.highTemp = 0
        self.lowTemp = 100
        
        self.humidity = 0        
        self.highHumidity = 0
        self.lowHumidity = 100        
        
    def measureIt(self):   
    
        try:
            print('SHT20 measureIt')
            #self.sht.reset()
            
            self.temperature = self.sht.temperature
            self.temperature = round(self.temperature, 2)
                    
            self.humidity = self.sht.humidity
            self.humidity = round(self.humidity, 2)
                 
            print("SH20 Temperature (C): " + str(self.temperature))
            print("SH20 Humidity (%RH): " + str(self.humidity))
        

        except Exception as e:
            print(e)  
            #raise HardwareError("SHT20 Probe", 100)            
    
    
            
            
def main():
     
    probe = TemperatureHumidityProbe()
    
    while True:
        time.sleep(1)
        probe.measureIt()

if __name__ == "__main__":
    main()            