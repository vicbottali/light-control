
// For express for web interface later

const express = require('express')
const app = express()
const port = 8000
const path = require('path')
const cors = require("cors")

app.use(cors());

//app.use(express.static("public"));

/*
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
})
*/

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});

app.get("/", (req, res) => {
  res.send({ message: "We did it!" });
});