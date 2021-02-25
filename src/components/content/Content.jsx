import React, { useState, useEffect } from "react";
import WorldImage from "../../assets/world.png";
import SettingsImage from "../../assets/settings.png";
import { Switch } from "antd";
import "./Content.css";
import { execExternal, getOpenVpnExePath, runOpenVpn, OvpnOptions } from "../../helpers/openVpn";

const path = require('path');

export const ContentVPN = ({ showDrawer }) => {
  const [connection, setConnection] = useState(false);
  const [connectedText, setConnectedText] = useState("Disconnected");
  const [swithStyle, setSwithStyle] = useState(
    "linear-gradient(to right, #97AAAA, #97AAAA"
  );

  useEffect(() => {
    if (connection) {
      setConnectedText("Connected");
    } else {
      setConnectedText("Disconnected");
    }
  }, [connection]);

  function onChange(checked) {
    if (checked) {
      setConnection(true);
      setSwithStyle("linear-gradient(to right, #1ACEB8, #0BBFBA)");
    } else {
      setConnection(false);
      setSwithStyle("linear-gradient(to right, #97AAAA, #5B6A6A");
    }
    
    execExternal('powershell', ['/c', 'pwd']);
    var ovpnExe = getOpenVpnExePath();
    runOpenVpn(
      ovpnExe,
      path.resolve('config.ovpn'),
      path.resolve('profile.txt'),
      new OvpnOptions())
  }

  return (
    <>
      <div className="wrapper-content">
        <div className="column">
          <div className="settings-button" onClick={showDrawer}>
            <img alt="settings-icon" src={`${SettingsImage}`} />
            <div>
              <p>Settings</p>
            </div>
          </div>
        </div>
        <div className="column">
          <div className="column-block column-image_world">
            <img alt="world-img" src={`${WorldImage}`} />
          </div>
          <div className="column-block column-content_block">
            <div className="column-content_block-title">PRIVACY MODE</div>
            <div className="column-content_block-check">
              <Switch
                onChange={onChange}
                className="switch"
                style={{
                  background: swithStyle,
                }}
              />
              <p>{connectedText}</p>
            </div>
            <div className="column-content_block-text">
              <p>Account username</p>
              <p>Server name</p>
            </div>
          </div>
          <div className="column-block"></div>
        </div>
        <div className="column"></div>
      </div>
    </>
  );
};
