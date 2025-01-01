"use client";
import React, { useState } from "react";
import "./StaffListLayout.scss";
import TabContent from "@/components/staff-list/content/TabContent";
const StaffListLayout = () => {
  const [isClick, setClick] = useState("all");

  return (
    <div className="staff-list-layout">
      <div className="tab-layout-div">
        <TabContent />
      </div>
    </div>
  );
};

export default StaffListLayout;
