import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { RHFInput } from "react-hook-form-input";
import Select from "react-select";
import { Checkbox } from "antd";
import "./index.css";
import axios from "axios";
import { Server } from "./server/index";
import { Profile } from "./profile/index";
import {
  handlerServerTypesStructure,
  handlerServerDnsStructure,
} from "../../../../helpers/serverData";
import {
  optionsConnectionType,
  optionsMtu,
} from "../../../../constants/settings";
import { ConnectionDetails } from "./connectionDetails/index";

const fs = require('fs');

export const DrawerContent = () => {
  const { handleSubmit, register, setValue, reset } = useForm();
  const [showMore, setShowMore] = useState(false);
  const [showMoreText, setShowMoreText] = useState("Show more");
  const [radioValue, setRadioValue] = useState("SHARED");
  const [checkboxValue, setCheckboxValue] = useState("SHARED");
  const [shared, setShared] = useState([]);
  const [dedicated, setDedicated] = useState([]);
  const [dedicated11, setDedicated11] = useState([]);
  const [dnsData, setDnsData] = useState([]);
  const [inputList, setInputList] = useState([{ firstName: "", lastName: "" }]);
  const [radioValueConnection, setRadioValueConnection] = useState("TCP");
  const [radioValueConnectionValue, setRadioValueConnectionValue] = useState(
    "443"
  );

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...inputList];
    list[index][name] = value;
    setInputList(list);
  };

  const handleRemoveClick = (index) => {
    const list = [...inputList];
    list.splice(index, 1);
    setInputList(list);
  };

  const handleAddClick = () => {
    setInputList([...inputList, { firstName: "", lastName: "" }]);
  };

  function onChangeCheckbox(e) {
    setCheckboxValue(e.target.checked);
  }

  useEffect(() => {
    axios
      .get("https://www.serverlistvault.com/servers.json")
      .then(function (response) {
        setShared(handlerServerTypesStructure(response.data.servers, "shared"));
        setDedicated(
          handlerServerTypesStructure(response.data.servers, "dedicated")
        );
        setDedicated11(
          handlerServerTypesStructure(response.data.servers, "dedicated11")
        );
      })
      .catch(function (error) {
        console.log("error", error);
      })
      .then(function () {});
  }, []);

  useEffect(() => {
    axios
      .get("https://www.serverlistvault.com/dns.json")
      .then(function (response) {
        console.log("response", response);
        setDnsData(handlerServerDnsStructure(response.data.dns));
      })
      .catch(function (error) {
        console.log("error", error);
      })
      .then(function () {});
  }, []);

  const handleShowMore = () => {
    if (!showMore) {
      setShowMore(true);
      setShowMoreText("Hide");
    } else {
      setShowMore(false);
      setShowMoreText("Show more");
    }
  };

  function onChangeRadio(e) {
    setRadioValue(e.target.value);
  }

  function onChangeRadioConnection(e) {
    setRadioValueConnection(e.target.value);
  }
  function onChangeRadioConnectionValue(e) {
    setRadioValueConnectionValue(e.target.value);
  }

  return (
    <div className="settings-forms-wrapper">
      <form
        onSubmit={handleSubmit((data) => {
          console.log("data", data);
          console.log("checkboxValue", checkboxValue);
          console.log("dnsData", dnsData);
          console.log("radioValueConnection", radioValueConnection);
          console.log("radioValueConnectionValue", radioValueConnectionValue);
          console.log("inputList", inputList);

          fs.writeFileSync('profile.txt', `${inputList[0].firstName}\n${inputList[0].lastName}`);

        })}
      >
        <div className="form-titles">Connection Type</div>
        <RHFInput
          as={<Select options={optionsConnectionType} />}
          //rules={{ required: true }}
          name="connectionType"
          register={register}
          setValue={setValue}
          className="form-select"
        />
        <div type="more" onClick={handleShowMore} className="form-show-more">
          {showMoreText}
        </div>
        {showMore && (
          <div className="show-more-wrapper">
            <Checkbox onChange={onChangeCheckbox} style={{ color: "#fff" }}>
              Kill Switch
            </Checkbox>
            <div className="form-show-more-connection-log">
              View the connection log
            </div>
            <RHFInput
              as={<Select options={dnsData} placeholder="DNS: Default" />}
              //rules={{ required: true }}
              name="dns"
              register={register}
              setValue={setValue}
              className="form-select"
            />
            <RHFInput
              as={<Select options={optionsMtu} placeholder="MTU: Default" />}
              //rules={{ required: true }}
              name="mtu"
              register={register}
              setValue={setValue}
              className="form-select"
            />
            <ConnectionDetails
              radioValueConnection={radioValueConnection}
              onChangeRadioConnection={onChangeRadioConnection}
              radioValueConnectionValue={radioValueConnectionValue}
              onChangeRadioConnectionValue={onChangeRadioConnectionValue}
            />
          </div>
        )}
        <Profile
          register={register}
          setValue={setValue}
          handleInputChange={handleInputChange}
          handleRemoveClick={handleRemoveClick}
          handleAddClick={handleAddClick}
          inputList={inputList}
          setInputList={setInputList}
        />

        <button className="form-button">Save</button>
      </form>
      <Server
        onChangeRadio={onChangeRadio}
        radioValue={radioValue}
        setRadioValue={setRadioValue}
        shared={shared}
        dedicated={dedicated}
        dedicated11={dedicated11}
      />
    </div>
  );
};
