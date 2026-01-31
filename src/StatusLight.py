# LED Candle animation for microypthon on esp8266

# Copyright 2018 Fritscher
# Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

# The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

# Values for the Gaussian distribution are taken from Eric's comment on https://cpldcpu.wordpress.com/2016/01/05/reverse-engineering-a-real-candle/
import time
import uos
import math
import machine, neopixel
from machine import Pin

RED = (255, 0, 0)
GREEN = (00, 255, 0)
BLUE = (00, 00, 255)
MAGENTA = (255, 00, 255)
ORANGE = (255, 255, 0)
    
class StatusLight(object):
        
    def __init__(self):
        # number of leds
        LED_COUNT = 1
        # Pico pin
        GPIO_PIN = 13
        self.np = neopixel.NeoPixel(machine.Pin(GPIO_PIN), LED_COUNT)

    def show(self):
       self.np.write()

    def color(self, r, g, b):
        return (int(r), int(g), int(b))

    def setPixelColor(self, color):
        self.np[0] = color

    def wait(self, ms):
       time.sleep(ms/1000.0)

    def c_brightness(self, c, brightness):
        return max(0, min(c * brightness / 100, 255))

    def setOperationalStatus(self):
        self.setColor(GREEN, 1)    
        self.show()
        
    def setConnectingStatus(self):
        self.setColor(BLUE, 25)
        self.show()    
        self.wait(10)
        self.setColor(BLUE, 1)    
        self.show()
        
    def setSleepingStatus(self):
        self.setColor(MAGENTA, 1)
        self.show()
        
    def setWarningStatus(self):
        self.setColor(ORANGE, 1)
        self.show()                

    def setErroredStatus(self):
        self.setColor(RED, 255)
        self.show()
 

    def setColor(self, colorTuple, brightness):
        self.setPixelColor(self.color(self.c_brightness(colorTuple[0], brightness), self.c_brightness(colorTuple[1], brightness), self.c_brightness(colorTuple[2], brightness)))
    
        
def main():

    statusLight = StatusLight()

    while True: 
        #statusLight.setOperationalStatus()
        #statusLight.wait(1000)
        statusLight.setConnectingStatus()
        statusLight.wait(1000)        
        #statusLight.setErroredStatus()
        #statusLight.wait(1000)    
 
        
if __name__ == "__main__":
    main()    
        



