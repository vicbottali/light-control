// wifi light library
const { Discovery, Control } = require('magic-home');
const fs = require('fs');

class MainControl {
  constructor(){
    this._deviceInfo = null;
    this._discoveredDevices = {};
  }

  get deviceInfo() {
    return this._deviceInfo;
  }

  get discoveredDevices() {
    return this._discoveredDevices;
  }

  /**
   * intitialize the instance, sets deviceInfo and discoveredDevices
   * @returns a Promise resolving to scanned devices  
   */
  initialize(){
    let promise = new Promise((resolve, reject) => {
      this.scanLights()
      .then(_ => {
        fs.readFile('../device-info.json', (error, data) => {
          if(error) {
            console.log('No saved device info. Generating device-info.json...');
            this._deviceInfo = {};
            fs.writeFile('../device-info.json', JSON.stringify(this._deviceInfo), (error) => {
              if(error) {
                reject(error);
              }
              console.log(`File created. Run 'scan' command to view available devices.`);
              resolve(this.deviceInfo);
            });
          } else {
            this._deviceInfo = JSON.parse(data);
            resolve(this._deviceInfo);
          }
        })
      })
      .catch((error) => {
        reject(error);
      })
    });

    return promise;
  }

  /**
   * Scan for available devices on network
  */
  async scanLights() {
    let discovery = new Discovery();
    let devices = await discovery.scan(500);
    devices.map((d) => {this._discoveredDevices[d.id] = d;});
  }

  nameLight(id, name) {
    if(!this._discoveredDevices[id]){
      console.log("Invalid id.");
      return;
    }
    if(this._deviceInfo[id]){
      console.log(`Device already named - ${this._deviceInfo[id].name}.`);
    } else {
      this._deviceInfo[id] = this._discoveredDevices[id];
      this._deviceInfo[id].name = name;
      this.saveToFile(this._deviceInfo);
    }
  }

  setPower(deviceName, power){
    for(let d in this._deviceInfo){
      if(this._deviceInfo[d].name === deviceName){
        let light = new Control(this._deviceInfo[d].address);
        light.setPower(power).then(success => { console.log(`${this._deviceName} turned ${power ? 'on': 'off'}`)});
      }
    }
  }

  saveToFile(updateData){
    console.log('Saving...');
    fs.writeFile('../device-info.json', JSON.stringify(updateData), (error) => {
      if(error) {
        throw error;
      }
      console.log(`Update successful.`);
      this._deviceInfo = updateData;
    });
  }

}

module.exports = MainControl;


