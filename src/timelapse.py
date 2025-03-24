from time import sleep, time
import datetime
from picamera2 import Picamera2, Preview
import base64
import requests


GREENHOUSE_SERVER_URL =  'https://ph8pr72f-3000.uks1.devtunnels.ms'
WAIT_TIME =  60 * 15  # every fifteen mins
picam2 = Picamera2()

camera_config = picam2.create_preview_configuration(main={"size":(640,480), "format": "RGB888"})
picam2.configure(camera_config)
picam2.start_preview(Preview.NULL)
   
frame = 1

while True:
    
    picam2.start()
    
    sleep(3)
    
    print("Frame " + str(frame))
    
    image = '/home/ncrowther/Pictures/greenhouse' + str(frame) + '.jpg'

    picam2.capture_file(image)

    picam2.stop()
    
    image_64 = base64.b64encode(open(image,"rb").read())

    #print(image_64)

    timestamp = datetime.datetime.now()
    timestamp = str(timestamp)[0:19]
    url = GREENHOUSE_SERVER_URL + '/photo'
    myobj = {'_id': frame, 'photo': image_64, 'timestamp': timestamp}

    res = requests.post(url, data = myobj)
    
    print("POST:" + str(res))
    
    sleep(WAIT_TIME)
    
    frame = frame + 1
                                              
