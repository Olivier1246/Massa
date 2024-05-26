######################################################################################
##              Massa API
##
##              Verify balance and buy Roll
##              Verion 0.0.1
##
##              Olivier: CryptoHouse1246@gmail.com
######################################################################################
##
##              How to use with cron
##              0 */4 * * * python3 ~/massa/massa-client/Massa.py
##
##              Every 4 Hours the program test for buy a new Roll
######################################################################################
##
##              Use Python3
##
##              apt update && apt install -y python3 python3-pip
##
##              pip install <packages>
######################################################################################
import requests
import json
import os
import subprocess
import logging
from datetime import datetime

######################################################################################
###########         Variables

logger = logging.getLogger(__name__)

API_IP = '192.168.0.160'    #local IP
API_PORT = 53035            #local port
Massa_Address = str("AU......paV") 
password = str("xxxxxxx")

######################################################################################
def get_status():
    headers = {
        'Content-Type': 'application/json',
    }
    json_data = {
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'get_status',
        'params': [],
    }
    response = requests.post((f'http://{API_IP}:{API_PORT}'), headers=headers, json=json_data)
    json_str= json.loads(response.text)
    print(json.dumps(json_str, indent=2))

    node_id = json_str["result"]["node_id"]
    node_ip = json_str["result"]["node_ip"]
    node_version = json_str["result"]["version"]

    status = (node_id, node_ip, node_version)
    return status
    
def get_addresses(address: str):
    
    headers = {
        'Content-Type': 'application/json',
    }
    json_data = {
        'jsonrpc': '2.0',
        'id': 1,
        'method': 'get_addresses',
        'params': [[address]]
    }
    response = requests.post((f'http://{API_IP}:{API_PORT}'), headers=headers, json=json_data)
    json_str = json.loads(response.text)  
    #print(json.dumps(json_str, indent=2))
        
    items = []

    for item in json_str["result"]:
        items.append(item['final_balance'])
        items.append(item['final_roll_count'])

    node_final_balance = items[0]
    node_final_roll_count = items[1]

    status = (node_final_balance, node_final_roll_count)
    return status

def buy_roll(address: str, amount: int) -> str:
    cmd = [ "./massa-client", "-j", "-p", password,
        "buy_rolls", address, str(amount), "0" ]
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        json_data = json.loads(result.stdout)
        logger.info(datetime.now().strftime('%d/%m/%Y %H:%M:%S'))
        logger.info(f"Operation id {json_data[0]} bought {amount} rolls for {address}")
        return f"Operation id {json_data[0]} bought {amount} rolls for {address}"
    except subprocess.CalledProcessError as err:
        logger.info(f"Error while asking to buy rolls: {err}")
        return f"Error while asking to buy rolls: {err}"



######################################################################################
os.system('cls||clear')
status= get_status()
print(("IP:{1} ID:{0} Version:{2}".format(status[0], status[1], status[2])).replace(' ','\n'))

addresses =get_addresses(str(Massa_Address))
print(("Address:{0} Roll:{1} Balance:{2}".format(Massa_Address, addresses[0], addresses[1])).replace(' ','\n'))
roll = addresses[0]

print("Buy = {0}".format(roll))
logging.basicConfig(filename='massa_py.log', level=logging.INFO)
if float(roll) > 100:
    buy_roll(str(Massa_Address), 1)
else:
    print("Not enought roll")
    logger.info(datetime.now().strftime('%d/%m/%Y %H:%M:%S'))
    logger.info("Not enought roll")
 
exit