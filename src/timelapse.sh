# !/bin/sh
# timelapse.sh
# Run this script on startup:
# sudo crontab -e
# @reboot sh /home/ncrowther/projects/timelapse/timelapse.sh > /home/ncrowther/projects/timelapse/timelapse.log

cd /home/ncrowther/projects/timelapse
sudo python timelase.py