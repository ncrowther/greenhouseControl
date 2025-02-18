# SPDX-FileCopyrightText: Copyright (c) 2023 Jose D. Montoya
#
# SPDX-License-Identifier: MIT
"""
`MLX90614`
================================================================================

Raspberry Pico Driver for the Sensirion MLX90614 Temperature Sensor


* Author(s): Nigel T. Crowther
* Date: 13-Feb-2025


"""
import sys
import math
from machine import Pin, PWM, ADC, I2C
import time
import struct
from micropython import const

__version__ = "0.0.0+auto.0"
__repo__ = "https://github.com/ncrowther/greenhouseControl"


class MLX90614:
    """Driver for the MLX90614 Sensor connected over I2C.

    :param ~machine.I2C i2c: The I2C bus the MLX90614 is connected to.
    :param int address: The I2C device address. Defaults to :const:`0x40`

    :raises RuntimeError: if the sensor is not found

    **Quickstart: Importing and using the device**

    Here is an example of using the :class:`MLX90614` class.
    First you will need to import the libraries to use the sensor

    .. code-block:: python

        from machine import Pin, I2C
        from MLX90614 import MLX90614

    Once this is done you can define your `machine.I2C` object and define your sensor object

    .. code-block:: python

        i2c = I2C(1, sda=Pin(2), scl=Pin(3))
        probe = MLX90614.MLX90614(i2c)

    Now you have access to the attributes

    .. code-block:: python

        airTemperature = probe.get_amb_temp()
        objectTemperature = probe.get_obj_temp()

    """
    
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

    def __init__(self) -> None:
        
        # setup the I2C communication for the SHT20 sensor
        #  I2C Pins
        I2C_PORT = 1
        I2C_SDA = 6
        I2C_SCL = 7        

        i2c = I2C(I2C_PORT, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA), freq=100000)
                                                      
        scan = i2c.scan()
        print("I2C scan:" + str(scan))
        
        addr = i2c.scan()[0]
        print("**************************" + str(addr))

        self._i2c = i2c
        self._address = addr

    
    def read_reg(self, reg_addr):
        err = None
        for i in range(self.comm_retries):
            try:
                return self._i2c.readfrom_mem(self._address, reg_addr, 2)
            except Exception as e:
                err = e
                #"Rate limiting" - sleeping to prevent problems with sensor
                #when requesting data too quickly
                print(err)
                time.sleep(self.comm_sleep_amount)
        #By this time, we made a couple requests and the sensor didn't respond
        #(judging by the fact we haven't returned from this function yet)
        #So let's just re-raise the last IOError we got
        raise err    


    def data_to_temp(self, data):
        
        int_val = int.from_bytes(data, "little")
 
        # printing int equivalent
        #print(int_val)
    
        temp = (int_val*0.02) - 273.15
        return temp

    def get_amb_temp(self):
        data = self.read_reg(self.MLX90614_TA)
        return self.data_to_temp(data)

    def get_obj_temp(self):
        data = self.read_reg(self.MLX90614_TOBJ1)
        return self.data_to_temp(data)
    
if __name__ == "__main__":
    
    sensor = MLX90614()
    
    time.sleep(1)
        
    # Read device ID to make sure that we can communicate with the ADXL343
    data = sensor.read_reg(sensor.MLX90614_TA)
    print(data)
    
    count = 0
    diffTotal = 0

    while True:
        count = count + 1
        ambientTemp = round(sensor.get_amb_temp(),2)
        objectTemp = round(sensor.get_obj_temp(),2)
        diff =  objectTemp - ambientTemp
        
        diffTotal = diffTotal + diff
        diffAv = diffTotal / count
        
        print("Ambient Temp:",ambientTemp,"C")
        print(" Object Temp:", objectTemp,"C")
        print(" Diff:", diff,"C")
        print(" Diff average:", diffAv,"C\n")
        time.sleep(1)    