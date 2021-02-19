import React, { useState } from "react";
import SettingsImage from "../../../assets/settings.png";
import "./index.css";

export const DrawerContent = () => {
  return (
    <>
      <div className="settings-button">
        <img alt="settings-icon" src={`${SettingsImage}`} />
        <div>
          <p>Settings</p>
        </div>
      </div>
    </>
  );
};
