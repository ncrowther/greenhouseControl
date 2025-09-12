from time import sleep, time
from picamera2 import Picamera2, Preview
import base64
import requests
from datetime import datetime
from PIL import Image
from PIL import ImageDraw
import socket

hostname = socket.gethostname()
IPAddr = socket.gethostbyname(hostname)

GREENHOUSE_SERVER_URL =  'https://foxhound-hip-initially.ngrok-free.app'
BASE_DIR = '/home/ncrowther/Pictures/greenhouse'
WAIT_TIME =  60 * 15  # every fifteen mins
picam2 = Picamera2()

camera_config = picam2.create_preview_configuration(main={"size":(320,240), "format": "RGB888"})
picam2.configure(camera_config)
picam2.start_preview(Preview.NULL)

frame = 1

while True:

    picam2.start()

    sleep(5)

    print("Frame " + str(frame))

    # Generate timestamp
    ts = datetime.now().timestamp()
    date_time = datetime.fromtimestamp(ts)
    timestamp = date_time.strftime("%Y-%m-%d %H:%M:%S")
    timestamp = str(timestamp)[0:19]
    print(timestamp)

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

    # Add timestamp to the image
    I1.text((4, 4), timestamp, fill="white")
    I1.text((4, 14), hostname, fill="white")

    # Display edited image
    #img.show()

    # Save the edited image
    img.save(image)

    picam2.stop()

    image_64 = base64.b64encode(open(image,"rb").read())
    
    #print(image_64)

    url = GREENHOUSE_SERVER_URL + '/photo'
    myobj = {'_id': frame, 'cam': 1 , 'photo': image_64, 'timestamp': timestamp}
    try:
        res = requests.post(url, data = myobj)
        print("POST:" + str(res))
    except:
        print("Failed to send photo")

    sleep(WAIT_TIME)

    frame = frame + 1


