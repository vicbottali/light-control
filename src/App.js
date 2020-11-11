
import React, { Component } from "react";
import "./styles.css";
import Axios from "axios";
import { hot } from "react-hot-loader";
import iro from "@jaames/iro";

function Device(props) {
    return (
        <div className="device-card">
            <p>{props.name}</p>
            <button className="btn power" onClick={props.togglePower}>{props.state}</button>
            <button className="btn color" onClick={props.changeColor}>Color</button>
        </div>
    )
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: {},
            selectedDevice: null,
            colorPicker: null
        }
        this.toggleDevicePower.bind(this);
        this.chooseColor.bind(this);
    }

    // Fires after component is added to DOM tree
    componentDidMount() {
        Axios({
            method: "GET",
            url: "http://localhost:8000/devices",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log(res.data);
            this.setState({ devices: res.data});
        });
    }

    toggleDevicePower(id, power) {
        Axios({
            method: "GET",
            url: `http://localhost:8000/${id}/${power}`,
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log(res);
            let update = { ...this.state.devices };
            update[id].state.on = res.data.state.on;
            this.setState(update);
        });
    }

    setColor(rgb){
        Axios({
            method: "PATCH",
            url: `http://localhost:8000/${id}`,
            data: rgb,
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log(res);
        });
    }

    chooseColor(id){
        if(!this.state.selectedDevice){
            let colorPicker = new iro.ColorPicker("#colorWheel", {
                layout: [
                    {
                        component: iro.ui.Wheel,
                        options: {
                            wheelLightness: false,
                            wheelAngle: 0,
                            wheelDirection: "anticlockwise"
                        }
                    },
                    {
                        component: iro.ui.Slider,
                        options: {
                            sliderType: 'value',
                            sliderShape: 'bar',
                            activeIndex: 2
                        }
                    }
                ]
            });
            
            colorPicker.on('input:end', function (color) {
                console.log(color);
                Axios({
                    method: "PATCH",
                    url: `http://localhost:8000/${id}`,
                    data: color.rgb,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then(res => {
                    console.log(res);
                });
            });
            
            this.setState({selectedDevice: this.state.devices[id]});
        } else {
            this.setState({ selectedDevice: this.state.devices[id]});
        }
    }

    renderDevices(devices) {
        return Object.keys(devices).map((d) => {
            let device = devices[d];
            return (
                <Device
                    name={device.name ? device.name : 'No Name'}
                    state={device.state.on ? 'Off' : 'On'}
                    togglePower={this.toggleDevicePower.bind(this, device.id, !device.state.on)}
                    changeColor={this.chooseColor.bind(this, device.id)}
                    key={device.id} />
            )
        })
    }

    render() {
        return (
            <div>
                <header>
                    <h1> Lights </h1>
                </header>
                <main>
                    <div className="flex-container">
                        {this.renderDevices(this.state.devices)}
                    </div>
                    <div className="color-options">
                        <div className="wheel" id="colorWheel"></div>
                    </div>
                </main>
            </div>
        );
    }
}

export default hot(module)(App);