import React from "react";
import { Drawer } from "antd";
import { HeaderContent } from "./drawer-content/DrawerContent/Header/index";
import { DrawerContent } from "./drawer-content/DrawerContent/index";
import "./SideBar.css";

export const SideBar = ({ visible, setVisible }) => {
  const onClose = () => {
    setVisible(false);
  };

  return (
    <>
      <Drawer
        title="Basic Drawer"
        placement="left"
        onClose={onClose}
        visible={visible}
        width={522}
        title={<HeaderContent />}
        closable
        headerStyle={{ background: "#000000" }}
        drawerStyle={{ background: "#000000" }}
      >
        <DrawerContent />
      </Drawer>
    </>
  );
};
