import sys
from machine import Pin, PWM, ADC, I2C
from micropython_sht20 import SHT20



#
## SH20 temperature humidity probe
#
class TemperatureHumidityProbe(object):
  
    def __init__(self):
        # setup the I2C communication for the SHT20 sensor
        #  I2C Pins
        I2C_PORT = 1
        I2C_SDA = 6
        I2C_SCL = 7        

        i2c = I2C(I2C_PORT, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA))
                                                      
        addr = i2c.scan()

        addr = i2c.scan()[0]
        print("**************************" + str(addr))

        self.sht = SHT20(i2c)
        self.sht.reset()
        
        self.temperature = 0                 
        self.humidity = 0        
   
        
    def measureIt(self):   
    
        try:
            print('SHT20 measureIt')
            #self.sht.reset()
            
            self.temperature = self.sht.temperature
            self.temperature = round(self.temperature, 2)
                    
            self.humidity = self.sht.humidity
            self.humidity = round(self.humidity, 2)
                 
            print("Temperature (C): " + str(self.temperature))
            print("Humidity (%RH): " + str(self.humidity))


        except Exception as e:
            print(e)          
    
    
 
        
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
        
      
        self.probe = TemperatureHumidityProbe()
      
 
    def careforplants(self):
          
        print("careforplants...")
        # Look after plants
        try:        
  
         
            print("read temp and humidity...")
            self.probe.measureIt()
            
            
        except Exception as e:
            print(e)
            sys.exit("Terminated")
            
def main():
    
    datetime = '10:01:00,Sunday,2024-09-29' 
    plantCare = PlantCare("192.168.1.1")
    
    while True:
        plantCare.careforplants()

if __name__ == "__main__":
    main()

