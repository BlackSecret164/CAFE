import React, { useState } from "react";
import ActionButton from "../actionButton/ActionButton";
import "./TabContent.scss";
import DataTable from "../table/DataTable";
import { DataStaff } from "../table/DataTable";
import DeleteButton from "@/components/form/Delete/delete-button";

const TabContent = () => {
  const [selectedStaff, setSelectedStaff] = useState<DataStaff | null>(null);
  const [isEditVisible, setEditVisible] = useState(false);
  const [isDeleteVisible, setDeleteVisible] = useState(false);

  // Hàm để chọn khách hàng và mở hộp thoại chỉnh sửa
  const handleSelectStaff = (staff: DataStaff) => {
    setSelectedStaff(staff);
  };

  const handleEditButtonClick = () => {
    if (selectedStaff) {
      setEditVisible(true);
    }
  };

  const handleSaveStaff = (updatedStaff: DataStaff) => {
    // Thực hiện logic lưu cập nhật ở đây
    console.log("Updated Staff:", updatedStaff);
    setEditVisible(false);
  };

  const handleDeleteButtonClick = () => {
    if (selectedStaff) {
      setDeleteVisible(true);
    }
  };
  const handleConfirmDelete = () => {
    if (selectedStaff) {
      // Logic to delete the selected staff
      console.log("Deleted Staff:", selectedStaff);
      setSelectedStaff(null);
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
        selectedStaff={selectedStaff}
        onEdit={handleEditButtonClick}
        onSave={handleSaveStaff}
        onDelete={handleDeleteButtonClick}
      />

      {/* DataTable cho phép chọn khách hàng */}
      <DataTable onSelectStaff={handleSelectStaff}/>

    </div>
  );
};

export default TabContent;
