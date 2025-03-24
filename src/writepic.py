import base64
import requests
import datetime

GREENHOUSE_SERVER_URL =  'https://ph8pr72f-3000.uks1.devtunnels.ms'

image = '/home/ncrowther/Pictures/greenhouse.jpg'

image_64 = base64.b64encode(open(image,"rb").read())

print(image_64)

timestamp = datetime.datetime.now()

print(timestamp)

timestamp = str(timestamp)[0:19]

print(timestamp)

url = GREENHOUSE_SERVER_URL + '/photo'
myobj = {'photo': image_64, 'timestamp': timestamp}

res = requests.post(url, data = myobj)
    
print("POST:" + str(res))

