const MainControl = require('./main.js');

const controller = new MainControl();
controller.initialize().then(_ => {
    startCmdInterface()
});


function startCmdInterface(){
    const reader = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    console.log("Enter Command: ");
    
    reader.on('line', (input) => {
      let cmd = input.split(' ');
  
      switch(cmd[0]) {
        case 'scan':
            console.log(controller.discoveredDevices);
          break;
        case 'refresh':
            controller.scanLights()
            .then(() => { 
              console.log(controller.discoveredDevices);
            })
            .catch((error => {throw error;}));
          break;
        case 'state':
            let queries = [];
            for(let i in controller.discoveredDevices){
                queries.push(controller.getDeviceState(controller.discoveredDevices[i].id));
            }
            Promise.all(queries).then((states) => {
                console.log(states);
            });
            break;
        case 'list':
            console.log(controller.deviceInfo);
            break;
        case 'name':
            controller.nameLight(cmd[1], cmd[2]);
            break;
        case 'on':
            controller.setPower(cmd[1], true);
            break;
        case 'off':
            controller.setPower(cmd[1], false);
            break;
        default: 
            console.log(
                `Command not found. List of options:
                scan - get all available devices 
                refresh - rescan for available devices
                list - show all named devices
                name <device-id> <name> - set a device's name
                on <device-name> - turn device on
                off <device-name> - turn device off`
            );
        }
    });  
  }