from machine import Pin
import onewire
import time, ds18x20
from Errors import HardwareError

#
## ds18x20 temperature probe
#
class TemperatureProbe(object):
  
    def __init__(self):
        # Initialize the OneWire bus on GPIO pin 12
        ow = onewire.OneWire(Pin(0))

        # Create a DS18X20 instance using the OneWire bus
        self.ds = ds18x20.DS18X20(ow)

        # Scan for DS18X20 devices on the bus and print their addresses
        self.roms = self.ds.scan()
        print('found devices:', self.roms)    
        
        self.temperature = 0        
        self.highTemp = 0
        self.lowTemp = 100

    def measureIt(self, rtc):   
    
        try:
            print('SD18B20 measureIt')
            
            # Start the temperature conversion process
            self.ds.convert_temp()
            # Wait for the conversion to complete (750 ms for DS18X20)
            time.sleep_ms(750)

            # Read and print the temperature from fisst sensor found on the bus
            self.temperature = self.ds.read_temp(self.roms[0])
        
            print("Temperature (C): " + str(self.temperature))
            
                

        except Exception as e:
            print(e)  
            raise HardwareError("DS18B20 Temperature Probe", 100)
        
if __name__ == '__main__':
    
    temperatureProbe = TemperatureProbe()
    temp = temperatureProbe.measureIt(0)
    print("Temperature:" , temp)  # Print temperature
        
        
