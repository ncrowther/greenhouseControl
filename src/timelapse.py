from time import sleep, time
from picamera2 import Picamera2, Preview
import base64
import requests
from datetime import datetime
from PIL import Image
from PIL import ImageDraw


GREENHOUSE_SERVER_URL =  'http://192.168.1.33:3000'
WAIT_TIME =  60 * 15  # every fifteen mins
picam2 = Picamera2()

camera_config = picam2.create_preview_configuration(main={"size":(640,480), "format": "RGB888"})
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
    timestamp = date_time.strftime("%d-%m-%Y %H:%M:%S")
    timestamp = str(timestamp)[0:19]
    print(timestamp)
    
    #image = 'C:/Users/092463866/Pictures/greenhouse.jpg'
    image = '/home/ncrowther/Pictures/greenhouse' + str(timestamp) + '.jpg'

    picam2.capture_file(image)
    
    # Open Image
    img = Image.open(image)

    # Call draw Method to embed timestamp into image
    I1 = ImageDraw.Draw(img)
    
    # Add timestamp to the image
    I1.text((10, 10), timestamp, fill=(255, 255, 255))

    # Display edited image
    img.show()

    # Save the edited image
    img.save(image)    

    picam2.stop()
    
    image_64 = base64.b64encode(open(image,"rb").read())

    print(image_64)

    url = GREENHOUSE_SERVER_URL + '/photo'
    myobj = {'_id': frame, 'photo': image_64, 'timestamp': timestamp}

    try:
        res = requests.post(url, data = myobj)
        print("POST:" + str(res))
    except:
        print("Failed to send photo")
    
    sleep(WAIT_TIME)
    
    frame = frame + 1
                                              
