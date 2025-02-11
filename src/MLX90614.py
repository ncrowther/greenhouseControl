# SPDX-FileCopyrightText: Copyright (c) 2023 Jose D. Montoya
#
# SPDX-License-Identifier: MIT
"""
`MLX90614`
================================================================================

MicroPython Driver for the Sensirion MLX90614 Temperature Sensor


* Author(s): Jose D. Montoya


"""

import time
import struct
from micropython import const


__version__ = "0.0.0+auto.0"
__repo__ = "https://github.com/jposada202020/MicroPython_MLX90614.git"

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
        from micropython_MLX90614 import MLX90614

    Once this is done you can define your `machine.I2C` object and define your sensor object

    .. code-block:: python

        i2c = I2C(1, sda=Pin(2), scl=Pin(3))
        probe = MLX90614.MLX90614(i2c)

    Now you have access to the attributes

    .. code-block:: python

        airTemperature = probe.get_amb_temp()
        objectTemperature = probe.get_obj_temp()

    """

    def __init__(self, i2c, address: int = 0x40) -> None:
        
        # setup the I2C communication for the SHT20 sensor
        #  I2C Pins
        I2C_PORT = 1
        I2C_SDA = 6
        I2C_SCL = 7        

        i2c = I2C(I2C_PORT, scl=Pin(I2C_SCL), sda=Pin(I2C_SDA))
                                                      
        addr = i2c.scan()

        addr = i2c.scan()[0]
        print("**************************" + str(addr))

        self._i2c = i2c
        self._address = address     

    def read_reg(regAddr):     
        buf = i2c.readfrom_mem(self._address, regAddr, 2) # read 2 bytes from memory address regAddr of peripheral i2cAddr
        return buf

    def data_to_temp(self, data):
        temp = (data*0.02) - 273.15
        return temp

    def get_amb_temp(self):
        data = self.read_reg(self.MLX90614_TA)
        return self.data_to_temp(data)

    def get_obj_temp(self):
        data = self.read_reg(self.MLX90614_TOBJ1)
        return self.data_to_temp(data)
    
if __name__ == "__main__":
    sensor = MLX90614()
    while True:    
        print("Ambient Temp:",round(sensor.get_amb_temp(),2),"C")
        print(" Object Temp:",round(sensor.get_obj_temp(),2),"C\n")
        time.sleep(0.5)    