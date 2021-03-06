
import React, { Component } from "react";
import "./styles.css";
import iro from "@jaames/iro";
import Axios from "axios";
import { hot } from "react-hot-loader";
import { Device } from "./components/Device";

const PORT = process.env.EXP_PORT || 8000;


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: {},
            selectedDevice: null
        };

        this.picker = null;
    }

    // Fires after component is added to DOM tree
    componentDidMount() {
        Axios({
            method: "GET",
            url: `http://localhost:${PORT}/devices`,
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log(res.data);
            this.setState({ devices: res.data });
        });

        this.renderPicker();
    }

    toggleDevicePower(id, power) {
        Axios({
            method: "GET",
            url: `http://localhost:${PORT}/${id}/${power}`,
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

    setSelected(id) {
        if (!this.state.selectedDevice) {
            this.picker.setOptions({ display: "block" });
        }
        let device = this.state.devices[id];
        this.setState({ selectedDevice: device }, this.updatePicker);
    }

    updatePicker() {
        let color = this.state.selectedDevice.state.color;
        this.picker.color.set({ r: color.red, g: color.green, b: color.blue });
        this.picker.context.id = this.state.selectedDevice.id;
    }

    renderPicker() {
        let picker = new iro.ColorPicker("#colorWheel", {
            display: "none",
            layout: [
                {
                    component: iro.ui.Wheel,
                    options: {
                        wheelLightness: false,
                        wheelAngle: 0,
                        wheelDirection: "clockwise"
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

        this.picker = picker;
        picker.on('input:end', this.setColor);
    }

    setColor(color) {
        console.log(color);
        console.log(this);
        Axios({
            method: "PATCH",
            url: `http://localhost:${PORT}/${this.context.id}`,
            data: color.rgb,
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log(res);
        });
    }

    renderDevices(devices) {
        return Object.keys(devices).map((d, index) => {
            let device = devices[d];
            let animDelay = { '--delay': `${index * 0.15}s`};
            return (
                <Device
                    name={device.name ? device.name : 'No Name'}
                    state={device.state.on ? 'Off' : 'On'}
                    togglePower={this.toggleDevicePower.bind(this, device.id, !device.state.on)}
                    setSelected={this.setSelected.bind(this, device.id)}
                    animDelay={animDelay}
                    key={device.id} />
            )
        })
    }

    render() {
        const deviceName = this.state.selectedDevice
                            ? this.state.selectedDevice.name
                            : 'Choose Device';
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
                        <h3>{deviceName}</h3>
                        <div className="wheel" id="colorWheel"></div>
                    </div>
                </main>
            </div>
        );
    }
}

export default hot(module)(App);