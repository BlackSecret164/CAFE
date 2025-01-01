"use client";
import React from "react";
import "./MenuLayout.scss";
import MenuContent from "@/components/menu-product/content/MenuContent";

const MenuLayout = () => {
  return (
    <div className="menu-layout">
      <div className="menu-main">
        <MenuContent />
      </div>
    </div>
  );
};

export default MenuLayout;
