import React, { useState, useEffect } from "react";
import WorldImage from "../../assets/world.png";
import SettingsImage from "../../assets/settings.png";
import { Switch } from "antd";
import axios from "axios";
import "./Content.css";
import { runOpenVpn, OvpnOptions, killWindowsProcess } from "../../helpers/openVpn";
const path = require('path');
const fs = require('fs');

export const ContentVPN = ({ showDrawer }) => {
  const [connection, setConnection] = useState(false);
  const [connectedText, setConnectedText] = useState("Disconnected");
  const [swithStyle, setSwithStyle] = useState(
    "linear-gradient(to right, #97AAAA, #97AAAA)"
  );

  useEffect(() => {
    axios
      .get("https://www.serverlistvault.com/openvpn-configuration.ovpn")
      .then((response) => {
        var file = fs.openSync('config.ovpn', 'w');
        ('' + response.data).split('\n').forEach(line => {
          if (!( line.startsWith('#')
              || line.startsWith('proto')
              || line.startsWith('remote')
              || line.startsWith('auth-user-pass'))) {
            
            fs.appendFileSync(file, line + '\n');
          }
        });
        fs.closeSync(file);
      })
      .catch(function (error) {
        console.log("error", error);
      })
      .then(() => {});
    fs.writeFileSync('profile.txt', 'devacc\ndevacc');
  }, []);

  useEffect(() => {
    if (connection) {
      setConnectedText("Connected");
    } else {
      setConnectedText("Disconnected");
    }
  }, [connection]);

  function onChange(checked) {
    const w = window.require('electron').remote.getCurrentWindow();
    if (checked) {
      try {
        w.currentConnection = runOpenVpn(
          path.resolve('config.ovpn'),
          path.resolve('profile.txt'),
          new OvpnOptions());
      } catch (error) {
        console.error(error);
        if (error.message === 'No OpenVPN found') {
          const { dialog } = window.require('electron').remote;
          console.log(dialog.showMessageBoxSync({
            type: 'error',
            title: 'Error',
            message: 'OpenVPN is not installed.'
          }));
        }
      }
      console.log(w.currentConnection)
      if (w.currentConnection) {
        setConnection(true);
        setSwithStyle("linear-gradient(to right, #1ACEB8, #0BBFBA)");
      }
    } else {
      setConnection(false);
      setSwithStyle("linear-gradient(to right, #97AAAA, #5B6A6A)");
      
      killWindowsProcess(
        window.require('electron').remote.require('child_process'),
        w.currentConnection.pid);
      w.currentConnection = false;
    }
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
                checked={connection}
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
