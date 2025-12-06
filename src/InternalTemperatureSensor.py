#
## Internal Pico temperature 
#
class TemperatureProbe(object):
  
    def __init__(self):

        # Create an ADC object for the internal temperature sensor (ADC4)
        self.sensor_temp = machine.ADC(4)
        
        self.temperature = 0        
        self.highTemp = 0
        self.lowTemp = 100       
        
    def measureIt(self):   
    
        try:
            print('Temperature measureIt')
          
            # Read the raw ADC value (0-65535)
            adc_value = self.sensor_temp.read_u16()
            
            # Define the conversion factor for a 16-bit value to voltage
            conversion_factor = 3.3 / (65535)
            
            # Convert the raw value to voltage
            voltage = adc_value * conversion_factor
            
            # Convert the voltage to Celsius using the formula
            self.temperature = 12 - (voltage - 0.706) / 0.001721
            
            self.temperature = round(self.temperature, 1)
            
            # Print the rounded temperature to 1 decimal place
            print("Temperature: {} C".format(self.temperature))
            
            # Reset stats at midnight
            #if (rtc.timeInRange(RESET_ON_TIME, RESET_OFF_TIME)):
            #    print("Reset temperature stats")
            #    self.highTemp = 0
            #    self.lowTemp = 100
             
            # Set temperature high score
            if (self.temperature > self.highTemp):
                self.highTemp = self.temperature
            
            if (self.temperature < self.lowTemp):
                self.lowTemp = self.temperature

        except Exception as e:
            print(e)  
            raise HardwareError("Temperature Probe", 100) 