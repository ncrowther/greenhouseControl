import array, time
from machine import Pin
import rp2

class Relay(object):
  
    PIN_NUM = 13
    
    def __init__(self,pin=PIN_NUM):
        self.pin=pin
  
        self.pump = Pin(21,Pin.OUT)
        self.ventUp = Pin(20,Pin.OUT)
        self.ventDown = Pin(19,Pin.OUT)
        self.fan = Pin(18,Pin.OUT)
        self.light = Pin(17,Pin.OUT)
        self.heater = Pin(16,Pin.OUT)
        self.ch7 = Pin(15,Pin.OUT)
        self.ch8 = Pin(14,Pin.OUT)
        
    ##########################################################################
            
    def ON(self,n): 
        n.high()
            
    def OFF(self,n): 
        n.low()      
                     

if __name__=='__main__':
    relay = Relay()

    while True:
        print("high")
        relay.ON(relay.pump)
        time.sleep(1)

        print("low")
        relay.OFF(relay.pump)
        time.sleep(1)

