import React, { useState } from "react";
import ActionButton from "../actionButton/ActionButton";
import "./TabContent.scss";
import DataTable, { DataProduct } from "../table/DataTable";

const TabContent = () => {
  const [selectedProduct, setSelectedProduct] = useState<DataProduct | null>(null);
  const [isEditVisible, setEditVisible] = useState(false);
  const [isDeleteVisible, setDeleteVisible] = useState(false);

  // Hàm để chọn khách hàng và mở hộp thoại chỉnh sửa
  const handleSelectProduct = (product: DataProduct) => {
    setSelectedProduct(product);
  };

  const handleEditButtonClick = () => {
    if (selectedProduct) {
      setEditVisible(true);
    }
  };

  const handleSaveProduct = (updatedProduct: DataProduct) => {
    // Thực hiện logic lưu cập nhật ở đây
    console.log("Updated Product:", updatedProduct);
    setEditVisible(false);
  };

  const handleDeleteButtonClick = () => {
    if (selectedProduct) {
      setDeleteVisible(true);
    }
  };
  const handleConfirmDelete = () => {
    if (selectedProduct) {
      // Logic to delete the selected product
      console.log("Deleted Product:", selectedProduct);
      setSelectedProduct(null);
    }
    setDeleteVisible(false);
  };

  const handleCancelDelete = () => {
    setDeleteVisible(false);
  };

  return (
    <div className="tab-content-div">
      {/* Truyền props vào ActionButton */}
      <ActionButton
        selectedProduct={selectedProduct}
        onEdit={handleEditButtonClick}
        onSave={handleSaveProduct}
        onDelete={handleDeleteButtonClick}
      />

      {/* DataTable cho phép chọn khách hàng */}
      <DataTable onSelectProduct={handleSelectProduct}/>

    </div>
  );
};

export default TabContent;
