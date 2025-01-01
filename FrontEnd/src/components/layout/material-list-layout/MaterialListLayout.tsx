"use client";
import React, { useState } from "react";
import "./MaterialListLayout.scss";
import TabContent from "@/components/material-list/content/TabContent";
const MaterialListLayout = () => {
  const [isClick, setClick] = useState("all");

  return (
    <div className="material-list-layout">
      <div className="tab-layout-div">
        <TabContent />
      </div>
    </div>
  );
};

export default MaterialListLayout;
