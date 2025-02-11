import sys
import math
from machine import Pin, PWM, ADC, I2C
from micropython_sht20 import SHT20

#
## Contactless temperature probe
#
class ContactlessTemperatureProbe(object):
  
    MLX90614_RAWIR1=0x04
    MLX90614_RAWIR2=0x05
    MLX90614_TA=0x06
    MLX90614_TOBJ1=0x07
    MLX90614_TOBJ2=0x08

    MLX90614_TOMAX=0x20
    MLX90614_TOMIN=0x21
    MLX90614_PWMCTRL=0x22
    MLX90614_TARANGE=0x23
    MLX90614_EMISS=0x24
    MLX90614_CONFIG=0x25
    MLX90614_ADDR=0x0E
    MLX90614_ID1=0x3C
    MLX90614_ID2=0x3D
    MLX90614_ID3=0x3E
    MLX90614_ID4=0x3F

    comm_retries = 5
    comm_sleep_amount = 0.1

    def __init__(self):
        # setup the I2C communication for the SHT20 sensor
        #  I2C Pins
        I2C_PORT = 1
        I2C_SDA = 6
        I2C_SCL = 7        

        i2c = I2C(I2C_PORT, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA))
                                                      
        addr = i2c.scan()

        self.addr = i2c.scan()[0]
        print("**************************" + str(self.addr))
        
    def getAmbientTemperature(self) -> float:
        """The measured temperature in Celsius."""
        while True:
            # While busy, the sensor doesn't respond to reads.
            try:
                self._i2c.readfrom_into(self._address, data)
                if data[0] != 0xFF:  # Check if read succeeded.
                    break
            except OSError:
                pass
        value, checksum = struct.unpack(">HB", data)

        if checksum != self._crc(data[:2]):
            raise ValueError("CRC mismatch")

        time.sleep(0.050)

        return value * 175.72 / 65536.0 - 46.85        

    def measureIt(self):   
    
        try:
            print('Temp gun measureIt')
            #self.sht.reset()
            
            self.temperature = self.sht.temperature
            self.temperature = round(self.temperature, 2)
                
                 
            print("Temperature (C): " + str(self.temperature))


        except Exception as e:
            print(e)          
    
   

    def read_reg(self, reg_addr):
        err = None
        for i in range(self.comm_retries):
            try:
                return self.bus.read_word_data(self.address, reg_addr)
            except IOError as e:
                err = e
                #"Rate limiting" - sleeping to prevent problems with sensor
                #when requesting data too quickly
                time(self.comm_sleep_amount)
        #By this time, we made a couple requests and the sensor didn't respond
        #(judging by the fact we haven't returned from this function yet)
        #So let's just re-raise the last IOError we got
        raise err
    
    def data_to_temp(self, data):
        temp = (data*0.02) - 273.15
        return temp

    def get_amb_temp(self):
        data = self.read_reg(self.MLX90614_TA)
        return self.data_to_temp(data)

    def get_obj_temp(self):
        data = self.read_reg(self.MLX90614_TOBJ1)
        return self.data_to_temp(data)
            
    def calculateVPD(self, airTemperature, leafTemperature, humidity):
        

        leafVp = 0.61078 * math.exp(17.27 * leafTemperature / (leafTemperature + 237.3))
        airVp = 0.61078 * math.exp(17.27 * airTemperature / (airTemperature + 237.3)) * (humidity / 100)
        vpd = round(leafVp - airVp, 2)
        
        return vpd
              
        
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
         
        self.probe = ContactlessTemperatureProbe()
      
 
    def careforplants(self):
          
        print("careforplants...")
        # Look after plants
        try:        
  
         
            print("read temp ...")
            #self.probe.measureIt()
            
            airTemperature = 18
            leafTemperature = 18
            humidity = 80
    
            vpd = self.probe.calculateVPD(airTemperature, leafTemperature, humidity)
            print(vpd)
            
        except Exception as e:
            print(e)
            sys.exit("Terminated")
            
def main():
    
    datetime = '10:01:00,Sunday,2024-09-29' 
    plantCare = PlantCare("192.168.1.1")
    
    
   # while True:
    plantCare.careforplants()

if __name__ == "__main__":
    main()

