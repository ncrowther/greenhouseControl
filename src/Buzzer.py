# Buzzer for Waveshare Pico Relay board

import time
from machine import Pin

BUZZER_PIN = 6
    
class Buzzer(object):
        
    def __init__(self):
        # Set GP6 as output
        self.buzzer = Pin(BUZZER_PIN, Pin.OUT)

    def buzz(self):
        while True:
            self.buzzer.high() # Turn on
            time.sleep(0.005)
            self.buzzer.low() # Turn off
            time.sleep(0.005)
        
def main():

    buzzer = Buzzer()

    buzzer.buzz()  
 
        
if __name__ == "__main__":
    main()    
        

