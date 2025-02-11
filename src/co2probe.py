import breakout_scd41
from pimoroni_i2c import PimoroniI2C
import time

class Co2TemperatureHumidityProbe(object):
  
    def __init__(self):
        # setup the I2C communication for the Co2 sensor
        #  I2C Pins
        I2C_PORT = 0
        I2C_SDA = 20
        I2C_SCL = 21        

        self.i2c = PimoroniI2C(sda=(I2C_SDA), scl=(I2C_SCL))  
 
        self.temperature = 0        
        self.highTemp = 0
        self.lowTemp = 100
        
        self.humidity = 0        
        self.highHumidity = 0
        self.lowHumidity = 100
        
        self.co2 = 0        
        self.highCo2 = 0
        self.lowCo2 = 100           
        
    def measureIt(self):   
    
        try:
            print('measureIt')
        
                       
            breakout_scd41.init(self.i2c)
            t = breakout_scd41.get_temperature_offset()
            print(t)
            
            breakout_scd41.set_temperature_offset(4444)
            
            breakout_scd41.start()
            while not breakout_scd41.ready():
                print("Waiting for sensor")
                time.sleep_ms(5000)
                
            self.co2, self.temperature, self.humidity = breakout_scd41.measure()
  
            self.temperature = round(self.temperature - 1.5, 2)
            self.humidity = round(self.humidity, 2)
            self.co2 = round(self.co2, 0)
                 
            print("Temperature (C): " + str(self.temperature))
            print("Humidity (%RH): " + str(self.humidity))
            print("Co2 (ppm): " + str(self.co2))
        
            
        except Exception as e:
            print(e)
            
            I2C_PORT = 0
            I2C_SDA = 20
            I2C_SCL = 21        

            i2c = PimoroniI2C(sda=(I2C_SDA), scl=(I2C_SCL))              
            breakout_scd41.init(i2c)
            breakout_scd41.start()
            print('measureIt error: ' + e)   
            #raise HardwareError("Pimoroni C02 Probe", 100)
            
            
            
            
def main():
     
    probe = Co2TemperatureHumidityProbe()
    
    while True:
        probe.measureIt()

if __name__ == "__main__":
    main()            