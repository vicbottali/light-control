// wifi light library
const { Discovery, Control } = require('magic-home');
const fs = require('fs');
const { listenerCount } = require('process');

const reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// intitial setup, check for saved device info
var deviceInfo, deviceInfoString, discoveredDevices;
fs.readFile('device-info.json', (error, data) => {
    if(error) {
      console.log('No saved device info. Generating device-info.json...');
      deviceInfoString = JSON.stringify({devices:[], groups:[]});
      fs.writeFile('device-info.json', deviceInfoString, (error) => {
        if(error) {
          throw error;
        }
        console.log(`File created. Run 'scan' command to view available devices.`);
        deviceInfo = JSON.parse(deviceInfoString);
        startCmdInterface();
      });
    } 
    else {
      deviceInfoString = data;
      deviceInfo = JSON.parse(deviceInfoString);
      startCmdInterface();
    }
});

function startCmdInterface(){
  
  console.log("Enter Command: ");
  
  reader.on('line', (input) => {
    let cmd = input.split(' ');

    switch(cmd[0]) {
      case 'scan':
        scanLights()
          .then(() => { 
            console.log(`${discoveredDevices.length} devices found.`, discoveredDevices);
          })
          .catch((error => {throw error;}));
        break;
      case 'list':
        list();
        break;
      case 'name':
        nameLight(cmd[1], cmd[2]);
        break;
      default: 
        console.log(
          `Command not found. List of options:
           scan - scans for all available devices 
           list - show all named devices
           name <device-address> <name> - set a device's name`
        );
    }
  });  
}


async function scanLights() {
  let discovery = new Discovery();
  let devices = await discovery.scan(500);
  discoveredDevices = devices;
}

async function nameLight(address, name) {
  console.log(name, address);
  /*
  let nameFn = () => {

  }
  */
  if(!discoveredDevices) {
    await scanLights();
  }

  for(let i in discoveredDevices){
    if(discoveredDevices[i].address === address){
      console.log(discoveredDevices[i]);
      if(!deviceInfoString.contains(address)){
        discoveredDevices[i].name = name;
        deviceInfo.devices.push(discoveredDevices);
        saveToFile(deviceInfo);
        return;
      }
    }
  }

  console.log('Address not found.');
}

function saveToFile(updateData){
  console.log('Saving...');
  fs.writeFile('device-info.json', JSON.stringify(updateData), (error) => {
    if(error) {
      throw error;
    }
    console.log(`Update successful.`);
    deviceInfo = updateData;
    deviceInfoString = JSON.stringify(deviceInfo);
  });
}



/*
let light = new Control("192.168.1.47");
light.setPower(true).then(success => {
    console.log('on?')
});
*/

/** For express for web interface later
const express = require('express')
const app = express()
const port = 3000
const path = require('path')

app.use(express.static("public"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
*/