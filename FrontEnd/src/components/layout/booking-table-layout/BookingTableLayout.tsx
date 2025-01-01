"use client";
import React, { useState } from "react";
import "./BookingTableLayout.scss";
import TabContent from "@/components/booking-table/content/TabContent";
const BookingTableLayout = () => {
  const [isClick, setClick] = useState("all");

  return (
    <div className="booking-table-layout">
      <div className="tab-layout-div">
        <TabContent />
      </div>
    </div>
  );
};

export default BookingTableLayout;
