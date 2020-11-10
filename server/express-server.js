
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
        res.send(controller.deviceInfo);
    });

    app.get("/scan", (req, res) => {
        res.send(controller.discoveredDevices);
    });
});



//app.use(express.static("public"));

/*
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
})
*/
