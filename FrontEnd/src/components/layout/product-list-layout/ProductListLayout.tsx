"use client";
import React, { useState } from "react";
import "./ProductListLayout.scss";
import TabContent from "@/components/product-list/content/TabContent";
const ProductListLayout = () => {
  const [isClick, setClick] = useState("all");

  return (
    <div className="product-list-layout">
      <div className="tab-layout-div">
        <TabContent />
      </div>
    </div>
  );
};

export default ProductListLayout;
