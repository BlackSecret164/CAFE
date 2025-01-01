import React, { useState } from "react";
import ActionButton from "../actionButton/ActionButton";
import "./TabContent.scss";
import DataTable from "../table/DataTable";
import { EditCustomer } from "@/components/form/Edit/Customer/edit-customer";
import { DataCustomer } from "../table/DataTable";
import DeleteButton from "@/components/form/Delete/delete-button";

const TabContent = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<DataCustomer | null>(null);
  const [isEditVisible, setEditVisible] = useState(false);
  const [isDeleteVisible, setDeleteVisible] = useState(false);

  // Hàm để chọn khách hàng và mở hộp thoại chỉnh sửa
  const handleSelectCustomer = (customer: DataCustomer) => {
    setSelectedCustomer(customer);
  };

  const handleEditButtonClick = () => {
    if (selectedCustomer) {
      setEditVisible(true);
    }
  };

  const handleSaveCustomer = (updatedCustomer: DataCustomer) => {
    // Thực hiện logic lưu cập nhật ở đây
    console.log("Updated Customer:", updatedCustomer);
    setEditVisible(false);
  };

  const handleDeleteButtonClick = () => {
    if (selectedCustomer) {
      setDeleteVisible(true);
    }
  };
  const handleConfirmDelete = () => {
    if (selectedCustomer) {
      // Logic to delete the selected customer
      console.log("Deleted Customer:", selectedCustomer);
      setSelectedCustomer(null);
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
        selectedCustomer={selectedCustomer}
        onEdit={handleEditButtonClick}
        onSave={handleSaveCustomer}
        onDelete={handleDeleteButtonClick}
      />

      {/* DataTable cho phép chọn khách hàng */}
      <DataTable onSelectCustomer={handleSelectCustomer}/>

    </div>
  );
};

export default TabContent;
