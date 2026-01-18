from machine import Pin, I2C
import ssd1306

class Oled                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         (object):

    #  display mode
    screen = 0
    
    def __init__(self): 
        #====== setup the I2C communication
        i2c = I2C(0, sda=Pin(0), scl=Pin(1))

        # Set up the OLED display (128x64 pixels) on the I2C bus
        # SSD1306_I2C is a subclass of FrameBuffer. FrameBuffer provides support for graphics primitives.
        # http://docs.micropython.org/en/latest/pyboard/library/framebuf.html
        self.oled = ssd1306.SSD1306_I2C(128, 64, i2c)

    """
    Clear the display by filling it with white

    Args:
        self (object): Instance of the OLED 

    Returns:
        None
    """
    def oledClearWhite(self):
        # Clear the display by filling it with white and then showing the update
        self.oled.fill(1)
        self.oled.show()
        time.sleep(1)  # Wait for 1 second

    """
    Clear the display by filling it with black

    Args:
        self (object): Instance of the OLED 

    Returns:
        None
    """
    def oledClearBlack(self):
        # Clear the display again by filling it with black
        self.oled.fill(0)
        self.oled.show()

    """
    Display date and time on the OLED screen.

    Args:
        year (int): The year.
        month (int): The month.
        day (int): The day.
        hour (int): The hour.
        minute (int): The minute.
        sec (int): The second.

    Returns:
        None
    """

    def show(self, dateStr, timeStr, temperature, humidity, maxTemp, minTemp, wateringTimes, wateringDuration):
      
        print("OLED")
         
        # clear 
        self.oledClearBlack()
        
        if (self.screen == 0): 
            # Display text on the OLED screen
            self.oled.text('Date: ' + dateStr, 0, 0)   
            self.oled.text('Time: ' + timeStr, 0, 16)
            self.oled.text('Temp: ' + str(temperature) + " C", 0, 32)         
            self.oled.text('Humidity: ' + str(humidity) + "%", 0, 48)       
            self.screen = 1
            
        elif (self.screen == 1):
            self.oled.text('Max Temp: ' + str(maxTemp), 0, 0)   
            self.oled.text('Min Temp: ' + str(minTemp), 0, 16)
            self.screen = 2
            
        elif (self.screen == 2):
            self.oled.text('WATER1: ' + str(wateringTimes[0]), 0, 0)   
            self.oled.text('WATER2: ' + str(wateringTimes[1]), 0, 16)
            self.oled.text('WATER3: ' + str(wateringTimes[2]), 0, 32)
            self.oled.text('Duration: ' + str(wateringDuration), 0, 48)              
            self.screen = 0            

        # Show data
        self.oled.show()

        
    """
    Display date and time on the OLED screen.

    Args:
        year (int): The year.
        month (int): The month.
        day (int): The day.
        hour (int): The hour.
        minute (int): The minute.
        sec (int): The second.

    Returns:
        None
    """

    def showVentStatus(self, direction, condition, temperature, maxTemperature, windowAngle, runSecs, pauseSecs):
      
        ventRuleLHS = "%5.2f" % (temperature)
        ventRuleRHS = "%5.2f" % (maxTemperature)
        ventRule = ventRuleLHS + condition + ventRuleRHS        
        ventAngle = "Angle: %d" % (windowAngle)        
        dwell = "R:%d D:%d" % (runSecs, pauseSecs)
        
        print(direction + " " + ventRule + " " + ventAngle + " " + dwell)
        
        # clear 
        self.oledClearBlack()

        # Display text on the OLED screen
        self.oled.text(direction, 0, 0)
        self.oled.text(ventRule, 0, 16)        
        self.oled.text(ventAngle, 0, 32)
        self.oled.text(dwell, 0, 48)        
        self.oled.show()
                
        
if __name__ == '__main__':
    
    WATERING_TIMES = [6, 12, 18]
    WATERING_PERIOD = 1 # minutes
    
    oled = Oled()
    
    oled.screen = 1
    oled.show("2026/01/17", "11:22:16", 20, 60, 10, 14, WATERING_TIMES, WATERING_PERIOD)        

