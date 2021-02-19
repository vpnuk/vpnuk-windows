import React from "react";
import { useForm } from "react-hook-form";
import { RHFInput } from "react-hook-form-input";
import Select from "react-select";
import { Radio } from "antd";
import "./index.css";

export const Server = ({
  onChangeRadio,
  radioValue,
  shared,
  dedicated,
  dedicated11,
}) => {
  const { handleSubmit, register, setValue, reset } = useForm();
  return (
    <form onSubmit={handleSubmit((data) => console.log("data1", data))}>
      <div className="form-titles">Server</div>
      <div className="form-server-block">
        <div className="form-server-block-radio">
          <Radio.Group onChange={onChangeRadio} defaultValue={radioValue}>
            <Radio.Button value="SHARED">SHARED</Radio.Button>
            <Radio.Button value="DEDICATED">DEDICATED</Radio.Button>
            <Radio.Button value="1:1">1:1</Radio.Button>
          </Radio.Group>
        </div>
        <RHFInput
          as={
            <Select
              options={
                radioValue === "SHARED"
                  ? shared
                  : radioValue === "DEDICATED"
                  ? dedicated
                  : dedicated11
              }
            />
          }
          //rules={{ required: true }}
          //okkhjbhj
          name="server"
          register={register}
          setValue={setValue}
          className="form-select"
        />
      </div>
      <button className="form-button">Connect</button>
    </form>
  );
};
