
// For express for web interface later

const express = require('express')
const app = express()
const port = 8000
const path = require('path')
const cors = require("cors")
const MainControl = require('./main.js');

const controller = new MainControl();
controller.initialize().then(_ => {
    app.use(cors());
    app.use(express.json());

    app.listen(port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    });

    app.get("/devices", (req, res) => {
        let allDevices = {...controller.discoveredDevices};
        let queries = [];
        for (let i in allDevices) {
            queries.push(controller.getDeviceState(allDevices[i].id));
            if(i in controller.deviceInfo){ 
                allDevices[i].name = controller.deviceInfo[i].name;
            }; 
        }
        Promise.all(queries).then((states) => {
            states.map((state, index) => {
                allDevices[Object.keys(allDevices)[index]].state = state;
            });
            res.send(allDevices);
        });
    });

    app.get("/:id/:power", async (req, res) => {
        let power = req.params.power === 'true'? true : false;
        let response = await controller.togglePower(req.params.id, power);
        res.send(response);
    });

    app.patch("/:id", async (req, res) => {
        console.log(req.body);
        let body = req.body;
        let response = await controller.setColor(req.params.id, body.r, body.b, body.g);
        res.send(response);
    });
});