from machine import Pin, PWM
from math import floor
import time
import math

a = 2
b = 3
r = 3

#The lower this value the higher quality the circle is with more points generated
stepSize = 0.109

#Generated vertices
positions = []

t = 0
while t < 2 * math.pi:
    positions.append((((r * math.cos(t) + a) * 5), (r * math.sin(t) + b) * 5))
    t += stepSize

print("LEN: " + str(len(positions)))


    
##############################
    
class ServoMotor(object):

    def __init__(self, pin): 
        # Initialize PWM on pin 16 for servo control
        self.servo = machine.PWM(machine.Pin(pin))
        self.servo.freq(50)  # Set PWM frequency to 50Hz, common for servo motors


    """
    Maps a value from one range to another.
    This function is useful for converting servo angle to pulse width.

    Args:
        x (int): The input value to be mapped.
        in_min (int): The minimum value of the input range.
        in_max (int): The maximum value of the input range.
        out_min (int): The minimum value of the output range.
        out_max (int): The maximum value of the output range.

    Returns:
        int: The mapped value.
    """
    def interval_mapping(self, x, in_min, in_max, out_min, out_max):
        return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

    """
    Moves the servo to a specific angle.
    The angle is converted to a suitable duty cycle for the PWM signal.

    Args:
        angle (int): The angle to move the servo to.

    Returns:
        None
    """    
    def servo_write(self, angle):
        pulse_width = self.interval_mapping(
            angle, 0, 180, 0.5, 2.5
        )  # Map angle to pulse width in ms
        duty = int(
            self.interval_mapping(pulse_width, 0, 20, 0, 65535)
        )  # Map pulse width to duty cycle
        self.servo.duty_u16(duty)  # Set PWM duty cycle

    """
    Tick.

    Returns:
        None
    """
    def tick(self, pos):                        
        
        #print("Tick : %2d" % (pos))   # print position
        
        self.servo_write(pos)
 
#######################


def plot_pixel(point):
    # Draw a pixel at the given point (x, y)
    
    print("%3d, %3d" % point) # print position
            
# Continuously display current time every second 
def main():
    
    servoMotorX = ServoMotor(16)
    servoMotorY = ServoMotor(17)
    
    MIN_X = 60
    MAX_X = 90
    MIN_Y = 60
    MAX_Y = 90
    x_operand = 1
    y_operand = 1    
    x = 1
    y = MAX_Y

        
    while True:
            
        for point in reversed(positions):
            plot_pixel(point)
            servoMotorX.tick(MIN_X + point[0])
            servoMotorY.tick(MIN_Y + point[1])
                
            time.sleep_ms(1000)  # One second
                    
    
if __name__ == "__main__":
    main()    



