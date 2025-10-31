# Timelapse camera for Raspbery Pi
# Author: Nigel T. Crowther
# Date: 31-Oct-2025
#
# Set CAMERA_NUMBER to uniquely identify camera image
# For remote maintenance via SSH, see https://phoenixnap.com/kb/enable-ssh-raspberry-pi
#
from time import sleep, time
from picamera2 import Picamera2, Preview
import base64
import requests
from datetime import datetime
from PIL import Image
from PIL import ImageDraw
import socket

CAMERA_NUMBER = 3
GREENHOUSE_SERVER_URL =  'https://foxhound-hip-initially.ngrok-free.app'
BASE_DIR = '/home/ncrowther/Pictures/greenhouse'
WAIT_TIME =  60 * 15  # Photo every fifteen mins
NO_IMAGE = 8000 # Image size below which it is discarded

# Check internet connection
def checkInternet():
    try:
        res = socket.getaddrinfo('google.com',80)
        return True
    except:
        return False

# Function to wait for internet connection
def waitForInternet():
    while not(checkInternet()):
        sleep(1)

def generateTimestamp():
    ts = datetime.now().timestamp()
    date_time = datetime.fromtimestamp(ts)
    timestamp = date_time.strftime("%Y-%m-%d %H:%M:%S")
    timestamp = str(timestamp)[0:19]
    return timestamp        
        
def postPhoto(image, frame, timestamp):
    image_64 = base64.b64encode(open(image, "rb").read())

    imageLen = len(image_64)
    print("Image length: {}".format(imageLen))

    # Discard if the image is less than a defined size
    if (imageLen < NO_IMAGE):
        print("Discarding")
        return

    # Wait until WIFI connected
    waitForInternet()

    # Post photo to server
    url = GREENHOUSE_SERVER_URL + '/photo'
    myobj = {'_id': frame, 'cam': CAMERA_NUMBER, 'photo': image_64, 'timestamp': timestamp}
    try:
        res = requests.post(url, data=myobj)
        print("POST:" + str(res))
    except Exception as e:
        print(f'Failed to send photo. {type(e)}: e')
        print("Message: {}".format(e))

def takePhoto(timestamp):

    # Start camera and wait
    picam2.start()      
    sleep(5)  

    # Create image file path
    image = BASE_DIR + str(timestamp) + '.jpg'    

    picam2.capture_file(image)

    # Open Image
    img = Image.open(image)

    # Call draw Method to embed timestamp into image
    I1 = ImageDraw.Draw(img)

    #Define the coordinates for the rectangle
    xy = [(0, 0), (120, 30)]

    #Draw a filled black rectangle
    I1.rectangle(xy, outline="white", fill="black", width = 1)

    # Add timestamp and hostname to the image
    I1.text((4, 4), timestamp, fill="white")
    I1.text((4, 14), hostname, fill="white")

    # Save the edited image
    img.save(image)

    return image


hostname = socket.gethostname()
picam2 = Picamera2()
camera_config = picam2.create_preview_configuration(main={"size":(320,240), "format": "RGB888"})
picam2.configure(camera_config)
picam2.start_preview(Preview.NULL)

frame = 1

while True:
                
    print("Frame " + str(frame))

    # Generate timestamp
    timestamp = generateTimestamp()
    print(timestamp)

    image = takePhoto(timestamp)

    picam2.stop()

    postPhoto(image, frame, timestamp)

    sleep(WAIT_TIME)

    frame = frame + 1


