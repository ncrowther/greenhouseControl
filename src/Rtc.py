#!/usr/bin/python
# -*- coding: utf-8 -*-
from machine import Pin, I2C
import time
import binascii

class HardwareError(Exception):
    def __init__(self, message, error_code):
        super().__init__(message)
        self.error_code = error_code
        self.message = message
        
"""
class  Clock is used to interact with an I2C clock. 
The init method initializes the I2C bus and sets the address of the clock. 
The class also includes a method called getTime, which retrieves the current time from the clock and returns it as a string.
"""
class Clock(object):
#  The register value is the binary-coded decimal (BCD) format
#  sec min hour week day month year
    NowTime = b'\x00\x45\x13\x02\x24\x05\x21'
    w  = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    address = 0x68
    start_reg = 0x00
    alarm1_reg = 0x07
    control_reg = 0x0e
    status_reg = 0x0f
    
    def __init__(self):
        #  I2C Clock Pins
        # Modified circuit to use i2c1
        I2C_PORT = 1
        I2C_SDA = 6
        I2C_SCL = 7

        self.bus = I2C(I2C_PORT,scl=Pin(I2C_SCL),sda=Pin(I2C_SDA))

    def set_time(self,new_time):
        
        # new_time = '10:00:00,Sunday,2024-09-29' 
        try: 
            hour = new_time[0] + new_time[1]
            minute = new_time[3] + new_time[4]
            second = new_time[6] + new_time[7]
            week = "00"
            #week = "0" + str(self.w.index(new_time.split(",",2)[1])+1)
            year = new_time.split(",",2)[2][2] + new_time.split(",",2)[2][3]
            month = new_time.split(",",2)[2][5] + new_time.split(",",2)[2][6]
            day = new_time.split(",",2)[2][8] + new_time.split(",",2)[2][9]
            now_time = binascii.unhexlify((second + " " + minute + " " + hour + " " + week + " " + day + " " + month + " " + year).replace(' ',''))
            #print(binascii.unhexlify((second + " " + minute + " " + hour + " " + week + " " + day + " " + month + " " + year).replace(' ','')))

            self.bus.writeto_mem(int(self.address),int(self.start_reg),now_time)

        except:
            raise HardwareError("Ds3231 Clock", 101)        
    
    def getDateTime(self):      
        try: 
            t = self.bus.readfrom_mem(int(self.address),int(self.start_reg),7)
            return t
        except:
            raise HardwareError("Ds3231 Clock", 102)    
    
    def getTimeInSeconds(self):
        t = self.getDateTime()
        hour = t[2]  #hour
        minute = t[1]  #minute
        
        hour = int("%02x" % hour)
        minute = int("%02x" % minute)   
           
        timeInSeconds = time.mktime((2000, 1, 1, hour, minute, 0, 0, 0))
        
        return timeInSeconds    
    
    def timeInRange(self, startRange, endRange):    
        timeNow = self.getTimeInSeconds()        
        return (time.ticks_diff(startRange, timeNow) <= 0) and (time.ticks_diff(endRange, timeNow) > 0)
    
    def getDateTimeStr(self):
        
        t = self.getDateTime()
                    
        a = t[0]&0x7F  #second
        b = t[1]&0x7F  #minute
        c = t[2]&0x3F  #hour
        d = t[3]&0x07  #week
        e = t[4]&0x3F  #day
        f = t[5]&0x1F  #month
        
        #datetimestr = "20%x/%02x/%02x %02x:%02x:%02x %s" %(t[6],t[5],t[4],t[2],t[1],t[0],self.w[t[3]-1])
        datetimestr = "20%x/%02x/%02x %02x:%02x:%02x" %(t[6],t[5],t[4],t[2],t[1],t[0])
        
        return datetimestr

    def getTimeStr(self):
        t = self.getDateTime()
        
        hour = t[2]  #hour
        minute = t[1]  #minute
        
        hour = "%02x" % hour
        mins = "%02x" % minute
        
        timeStr = str(hour) + ":" + str(mins)

        return timeStr
    
if __name__ == '__main__':
    
    rtc = Clock()
    time.sleep_ms(500)
    rtc.set_time('13:45:50,Monday,2021-05-24')
    timestamp = rtc.getDateTimeStr()
    print(timestamp)