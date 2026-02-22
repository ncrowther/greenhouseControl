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
from PIL import ImageDraw, Image, ImageFont
import socket
import os

CAMERA_NUMBER = 4
GREENHOUSE_SERVER_URL =  'https://foxhound-hip-initially.ngrok-free.app'
BASE_DIR = '/home/ncrowther/Pictures/greenhouse'
WAIT_TIME =  60 * 15 # Photo every 15 mins
IMAGE_SIZE = (2592, 1944)
NO_IMAGE = IMAGE_SIZE[0] * IMAGE_SIZE[1] * 0.1  # Image size below which it is discarded


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
        print("Image too dark. Discarding")
        return

    # Wait until WIFI connected
    waitForInternet()

    # Post photo to server
    url = GREENHOUSE_SERVER_URL + '/photo'
    myobj = {'_id': frame, 'cam': CAMERA_NUMBER, 'photo': image_64, 'timestamp': timestamp}
    try:
        res = requests.post(url, data=myobj, timeout=30)
        print("POST:" + str(res))
    except Exception as e:
        print(f'Failed to send photo. {type(e)}: e')
        print("Message: {}".format(e))


def deletePhoto(file):
    # Remove old image if exists
    if os.path.exists(file):
       os.remove(file)

def takePhoto(timestamp, hostname, ip ):

    # Start camera and wait
    picam2.start()
    sleep(5)

    # Create image file path
    image = BASE_DIR + str(timestamp) + '.jpg'

    picam2.capture_file(image)

    # specified font size
    font = ImageFont.truetype("/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf", 32)

    # Open Image
    img = Image.open(image)

    # Call draw Method to embed timestamp into image
    I1 = ImageDraw.Draw(img)

    #Define the coordinates for the rectangle
    xy = [(0, 0), (390, 112)]

    #Draw a filled black rectangle
    I1.rectangle(xy, outline="white", fill="black", width = 4)

    # Add timestamp and hostname to the image
    I1.text((10, 10), timestamp, font=font, fill="white")
    I1.text((10, 36), hostname, font=font, fill="white")
    I1.text((10, 66), ip, font=font, fill="white")

    # Save the edited image
    img.save(image)

    return image


def initialise():
    hostname = socket.gethostname()
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.connect(("8.8.8.8", 80))
    ip = s.getsockname()[0]

    print("Hostname: {}, IP: {}".format(hostname, ip))

    picam2 = Picamera2()
    camera_config = picam2.create_preview_configuration(main={"size": IMAGE_SIZE, "format": "RGB888"})
    picam2.configure(camera_config)
    picam2.start_preview(Preview.NULL)

    return hostname, ip, picam2

##################### Main program #####################

hostname, ip, picam2 = initialise()

frame = 1

while True:

    print("Frame " + str(frame))

    # Generate timestamp
    timestamp = generateTimestamp()
    print(timestamp)

    image = takePhoto(timestamp, hostname, ip)

    picam2.stop()

    postPhoto(image, frame, timestamp)

    deletePhoto(image)

    sleep(WAIT_TIME)

    frame = frame + 1


