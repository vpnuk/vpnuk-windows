import React from "react";
import { Radio } from "antd";
import "./index.css";

export const ConnectionDetails = ({
  radioValueConnection,
  onChangeRadioConnection,
  radioValueConnectionValue,
  onChangeRadioConnectionValue,
}) => {
  return (
    <div className="connection-details-wrapper">
      <Radio.Group
        onChange={onChangeRadioConnection}
        defaultValue={radioValueConnection}
      >
        <Radio.Button value="TCP">TCP</Radio.Button>
        <Radio.Button value="UDP">UDP</Radio.Button>
        <Radio.Button value="Obfuscation">Obfuscation</Radio.Button>
      </Radio.Group>
      {radioValueConnection === "TCP" ? (
        <Radio.Group
          onChange={onChangeRadioConnectionValue}
          defaultValue={radioValueConnectionValue}
        >
          <Radio.Button value="443">443</Radio.Button>
          <Radio.Button value="80">80</Radio.Button>
          <Radio.Button value="8008">8008</Radio.Button>
        </Radio.Group>
      ) : radioValueConnection === "UDP" ? (
        <Radio.Group
          onChange={onChangeRadioConnectionValue}
          defaultValue={radioValueConnectionValue}
        >
          <Radio.Button value="1194">1194</Radio.Button>
          <Radio.Button value="55194">55194</Radio.Button>
          <Radio.Button value="65194">65194</Radio.Button>
        </Radio.Group>
      ) : (
        <Radio.Group
          onChange={onChangeRadioConnectionValue}
          defaultValue={radioValueConnectionValue}
        >
          <Radio.Button value="443">443</Radio.Button>
        </Radio.Group>
      )}
    </div>
  );
};
