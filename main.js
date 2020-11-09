// wifi light library
const { Discovery, Control } = require('magic-home');
const fs = require('fs');
const { listenerCount } = require('process');

const reader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

// intitial setup, check for saved device info
// find devices on network
var deviceInfo; 
var discoveredDevices = {};
scanLights()
  .then(_ => {
    fs.readFile('device-info.json', (error, data) => {
      if(error) {
        console.log('No saved device info. Generating device-info.json...');
        deviceInfo = {};
        fs.writeFile('device-info.json', JSON.stringify(deviceInfo), (error) => {
          if(error) {
            throw error;
          }
          console.log(`File created. Run 'scan' command to view available devices.`);
          startCmdInterface();
        });
      } else {
        deviceInfo = JSON.parse(data);
        startCmdInterface();
      }
    })
  })
  .catch((error) => {
    throw error;
  })


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
      case 'on':
        setPower(cmd[1], true);
        break;
      case 'off':
        setPower(cmd[1], false);
        break;
      default: 
        console.log(
          `Command not found. List of options:
           scan - scans for all available devices 
           list - show all named devices
           name <device-id> <name> - set a device's name
           on <device-name> - turn device on
           off <device-name> - turn device off`
        );
    }
  });  
}

/**
 * Scan for available devices on network
 */
async function scanLights() {
  let discovery = new Discovery();
  let devices = await discovery.scan(500);
  devices.map((d) => {discoveredDevices[d.id] = d;});
}

function nameLight(id, name) {
  if(!discoveredDevices[id]){
    console.log("Invalid id.");
    return;
  }
  if(deviceInfo[id]){
    console.log(`Device already named - ${deviceInfo[id].name}.`);
  } else {
    deviceInfo[id] = discoveredDevices[id];
    deviceInfo[id].name = name;
    saveToFile(deviceInfo);
  }
}

function list(){
  console.log(deviceInfo);
}

function setPower(deviceName, power){
  for(let d in deviceInfo){
    if(deviceInfo[d].name === deviceName){
      let light = new Control(deviceInfo[d].address);
      light.setPower(power).then(success => { console.log(`${deviceName} turned ${power ? 'on': 'off'}`)});
    }
  }
}

function saveToFile(updateData){
  console.log('Saving...');
  fs.writeFile('device-info.json', JSON.stringify(updateData), (error) => {
    if(error) {
      throw error;
    }
    console.log(`Update successful.`);
    deviceInfo = updateData;
  });
}

// For express for web interface later
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
