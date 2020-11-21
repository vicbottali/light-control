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
            /** TODO: 
             * 1. Need to dynamically figure out ack options for different types of controllers 
             * 2. Find a better way of determining white support - only set after queryState call */
            this._deviceControllers[device.id] = new Control(device.address);
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

    /**
     * Runs a few functions on a Control object to determine
     * the appropriate ack parameters for the type of bulb/controller.
     * @param   {string} id - Device id
     * @return  {number} Value for ack mask **Control.ackMask({bitMask})**
     */
    async ackParamTest(id) {
        let device = this._deviceControllers[id],
            bitMask = 15;  // Start with '1111', flip corresponding bit if time out
        
        await device.setPower(true)
            .catch((e) => { bitMask ^= 0x01 });

        await device.setColor(255, 255, 255)
            .catch((e) => { bitMask ^= 0x02 });
        
        // Handles both the third and fourth parameters
        await device.setPattern('seven_color_cross_fade', 10)
            .catch((e) => { bitMask ^= 0x0C });

        return bitMask;
    }
}

module.exports = MainControl;


