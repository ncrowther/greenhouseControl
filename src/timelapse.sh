# !/bin/sh
# See https://www.instructables.com/ShareCreate-Edit-Files-Between-Your-Mac-and-Raspbe/
# Instructions: 
# Create folder /home/ncrowther/projects/timelapse
# Create folder /home/ncrowther/projects/timelapse/log
# Move this file to /home/ncrowther/projects/timelapse
# chmod +rwx timelapse.sh
# sudo crontab -e
# @reboot sh /home/ncrowther/projects/timelapse/timelapse.sh > /home/ncrowther/projects/timelapse/timelapse.log
sudo python /home/ncrowther/projects/timelapse/timelase.py