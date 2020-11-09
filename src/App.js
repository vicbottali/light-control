
import React, { Component } from "react";
import "./styles.css";
import Axios from "axios";
import { hot } from "react-hot-loader";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: {},
            availableDevices: {}
        }
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
            this.setState({ devices: res.data });
        });

        Axios({
            method: "GET",
            url: "http://localhost:8000/scan",
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log(res.data);
            this.setState({ availableDevices: res.data });
        });
    }

    renderDevice(devices) {
        return Object.keys(devices).map((d) => {
            return (
                <div className="device-card" key={d}>
                    <p>{devices[d].name}</p>
                </div>
            )
        })
    }

    render() {
        return (
            <div>
                <header>
                    <h1> Lights </h1>
                </header>
                <div class="flex-container">
                    {this.renderDevice(this.state.devices)}
                </div>
            </div>
        );
    }
}

export default hot(module)(App);