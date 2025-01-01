"use client";
import React, { useState } from "react";
import "./CustomerListLayout.scss";
import TabContent from "@/components/customer-list/content/TabContent";
const CustomerListLayout = () => {
  const [isClick, setClick] = useState("all");

  return (
    <div className="customer-list-layout">
      <div className="tab-layout-div">
        <TabContent />
      </div>
    </div>
  );
};

export default CustomerListLayout;
