from machine import Pin, I2C
from machine_i2c_lcd import I2cLcd

"""
This class initializes the LCD display and provides methods showData and showError which are responsible for displaying data on the LCD screen.
"""
class Lcd(object):  
    
    #  display mode
    screen = 0
            
    def __init__(self):
        
        #  I2C Settings
        I2C_FREQ = 100000 #400000
        I2C_PORT = 0
        I2C_SDA = 8
        I2C_SCL = 9
    
        # setup the I2C communication for the LCD display
        self.bus = I2C(I2C_PORT, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA), freq=I2C_FREQ)
                                                      
        scan = self.bus.scan()
        print("I2c LED scan: ", scan)
        
        addr = self.bus.scan()[0]
        print("I2c LED addr: ", addr)

        self.lcd = I2cLcd(self.bus, addr, 2, 16)
        
        self.lcd.putstr("Hello RPi Pico!\n")
        
    def showData(self, screen, rtc, airTemperature, humidity):
                
        # Display time & temp on the LCD screen
                
        if (screen == 0): 
            temperatureStr = 'Air Temp {} C'.format(airTemperature)
            humidityStr = 'Humidity {} %'.format(humidity)             
                     
            self.lcd.clear()
            self.lcd.putstr(temperatureStr)
            self.lcd.putstr("\n")
            self.lcd.putstr(humidityStr)         
            
        elif (screen == 1):
            timeStr = rtc.getTimeStr()   
            dateStr = rtc.getDateTimeStr()[:10]
            self.lcd.clear()
            self.lcd.putstr(timeStr)
            self.lcd.putstr("\n")
            self.lcd.putstr(dateStr)                         
                
                 
    def showError(self, code, message):
        self.lcd.clear()
        self.lcd.putstr("Error: " + str(code))
        self.lcd.putstr("\n")
        self.lcd.putstr(message)
        
if __name__ == '__main__':
    
    lcd = Lcd()
    lcd.showData(0, 0, 20, 50)
