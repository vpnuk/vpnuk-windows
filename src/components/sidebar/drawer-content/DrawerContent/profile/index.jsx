import React from "react";
import "./index.css";

export function Profile({
  handleInputChange,
  handleRemoveClick,
  handleAddClick,
  inputList,
}) {
  let id = 1;
  return (
    <div className="form-profile-block">
      <div className="form-titles">Profile</div>
      {inputList.map((x, i) => {
        return (
          <div key={id++} className="form-profile-block-inline">
            <div className="button-remove-wrapper">
              {inputList.length !== 1 && (
                <button
                  className="remove-button"
                  onClick={() => handleRemoveClick(i)}
                >
                  Remove Profile
                </button>
              )}
            </div>
            <input
              name="login"
              placeholder="VPN username"
              value={x.login}
              onChange={(e) => handleInputChange(e, i)}
            />
            <input
              className="ml10"
              name="password"
              placeholder="VPN password"
              value={x.password}
              onChange={(e) => handleInputChange(e, i)}
            />
            <div className="buttons-wrapper">
              {inputList.length - 1 === i && (
                <button onClick={handleAddClick} className="add-button">
                  + Add New Profile
                </button>
              )}
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: 20 }}>{JSON.stringify(inputList)}</div>
    </div>
  );
}
