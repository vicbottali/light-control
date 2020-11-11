
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
});



//app.use(express.static("public"));

/*
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
})
*/
