import React from "react";

function Device(props) {
    return (
        <div className="device-card">
            <p>{props.name}</p>
            <button className="btn power" onClick={props.togglePower}>{props.state}</button>
            <button className="btn color" onClick={props.setSelected}>Options</button>
        </div>
    )
}

export { Device };