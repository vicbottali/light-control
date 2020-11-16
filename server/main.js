// wifi light library
const { Discovery, Control } = require('magic-home');
const fs = require('fs');

class MainControl {
    constructor() {
        this._deviceInfo = null;
        this._discoveredDevices = {};
        this._deviceControllers = {};
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
    initialize() {
        let promise = new Promise((resolve, reject) => {
            this.scanLights()
                .then(_ => {
                    fs.readFile('../device-info.json', (error, data) => {
                        if (error) {
                            console.log('No saved device info. Generating device-info.json...');
                            this._deviceInfo = {};
                            fs.writeFile('../device-info.json', JSON.stringify(this._deviceInfo), (error) => {
                                if (error) {
                                    reject(error);
                                }
                                console.log(`File created. Run 'scan' command to view available devices.`);
                                resolve(this._deviceInfo);
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
        devices.map((d) => {
            let device = d;
            this._discoveredDevices[device.id] = device;
            // hard-coding the ack options for now
            /** TODO: need to dynamically figure out ack options for different types of controllers */
            this._deviceControllers[device.id] = new Control(device.address, {
                ack: {
                    power: true,
                    color: false,
                    pattern: false,
                    custom_pattern: false
                }
            });
        });
    }

    getDeviceState(id) {
        return this._deviceControllers[id].queryState();
    }

    nameLight(id, name) {
        if (!this._discoveredDevices[id]) {
            console.log("Invalid id.");
            return;
        }
        if (this._deviceInfo[id]) {
            console.log(`Device already named - ${this._deviceInfo[id].name}.`);
        } else {
            this._deviceInfo[id] = this._discoveredDevices[id];
            this._deviceInfo[id].name = name;
            this.saveToFile(this._deviceInfo);
        }
    }

    async togglePower(id, power) {
        await this._deviceControllers[id].setPower(power);
        this._discoveredDevices[id].state.on = power;
        return this._discoveredDevices[id];
    }

    async setColor(id, r, g, b) {
        let res = await this._deviceControllers[id].setColor(r, g, b);
        return res;
    }

    // I'll leave this guy for the cli here for now
    setPower(deviceName, power) {
        for (let d in this._deviceInfo) {
            if (this._deviceInfo[d].name === deviceName) {
                let light = new Control(this._deviceInfo[d].address);
                light.setPower(power).then(success => { console.log(`${this._deviceName} turned ${power ? 'on' : 'off'}`) });
            }
        }
    }

    saveToFile(updateData) {
        console.log('Saving...');
        fs.writeFile('../device-info.json', JSON.stringify(updateData), (error) => {
            if (error) {
                throw error;
            }
            console.log(`Update successful.`);
            this._deviceInfo = updateData;
        });
    }


}

module.exports = MainControl;


