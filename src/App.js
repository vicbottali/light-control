
import React, { Component } from "react";
import "./styles.css";
import Axios from "axios";
import { hot } from "react-hot-loader";

function Device(props){
    return(
        <div className="device-card">
            <p>{props.name}</p>
            <button onClick={props.togglePower}>{props.state}</button>
        </div>
    )
}

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devices: {}
        }
        this.toggleDevicePower.bind(this);
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
    }

    toggleDevicePower(id, power){
        Axios({
            method: "GET",
            url: `http://localhost:8000/${id}/${power}`,
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => {
            console.log(res);
            let update = {...this.state.devices};
            update[id].state.on = res.data.state.on;
            this.setState(update);
        });
    }

    renderDevices(devices) {
        return Object.keys(devices).map((d) => {
            let device = devices[d];
            return (
                <Device 
                    name={device.name ? device.name : 'No Name'} 
                    state={device.state.on ? 'Off' : 'On'}
                    togglePower={this.toggleDevicePower.bind(this, device.id, !device.state.on)}
                    key={device.id}/>
            )
        })
    }

    render() {
        return (
            <div>
                <header>
                    <h1> Lights </h1>
                </header>
                <div className="flex-container">
                    {this.renderDevices(this.state.devices)}
                </div>
            </div>
        );
    }
}

export default hot(module)(App);