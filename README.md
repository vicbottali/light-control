# light-control
Interface for working with Wifi controlled LED light bulbs and strips.

## Web Interface
Built using Express for the API and React for the frontend. For right now, it only works when served on the same network as the LED controllers.
The easiest way to get it started is by using the NPM script:
```
npm run serve-dev
```
which will spin up the Express server and serve up the React frontend with Webpack at the same time.

## CLI Interface
While magic-home NPM library itself already contains a CLI tool for interfacing with lights based on their IP address,
the CLI found in `./server/cli.js` aims to add functionality like naming lights, and executing commands using their name rather than IP Address.
You can run the CLI from the main directory with:
```
node ./server/cli.js
``` 
or you can use the NPM script:
```
npm run cli
```
## Simple Demo
The web interface is still a work in progress, but below is an example of it interacting with the LED strip on the back of the TV it's displayed on. (Pardon the gif quality):
![Led Demo](https://github.com/vicbottali/light-control/blob/master/led-demo.gif)
