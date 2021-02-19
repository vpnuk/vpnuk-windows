import React from "react";
import SettingsImage from "../../../../../assets/settings.png";
import "./index.css";

export const HeaderContent = () => {
  return (
    <>
      <div className="settings-button-modal">
        <img alt="settings-icon" src={`${SettingsImage}`} />
        <div>
          <p>Settings</p>
        </div>
      </div>
    </>
  );
};
