import React, { useState } from "react";
import ActionButton from "../actionButton/ActionButton";
import "./TabContent.scss";
import DeleteButton from "@/components/form/Delete/delete-button";
import DataTable, { DataMaterial } from "../table/DataTable";

const TabContent = () => {
  const [selectedMaterial, setSelectedMaterial] = useState<DataMaterial | null>(null);
  const [isEditVisible, setEditVisible] = useState(false);
  const [isDeleteVisible, setDeleteVisible] = useState(false);

  // Hàm để chọn khách hàng và mở hộp thoại chỉnh sửa
  const handleSelectMaterial = (material: DataMaterial) => {
    setSelectedMaterial(material);
  };

  const handleEditButtonClick = () => {
    if (selectedMaterial) {
      setEditVisible(true);
    }
  };

  const handleSaveMaterial = (updatedMaterial: DataMaterial) => {
    // Thực hiện logic lưu cập nhật ở đây
    console.log("Updated Material:", updatedMaterial);
    setEditVisible(false);
  };

  const handleDeleteButtonClick = () => {
    if (selectedMaterial) {
      setDeleteVisible(true);
    }
  };
  const handleConfirmDelete = () => {
    if (selectedMaterial) {
      // Logic to delete the selected material
      console.log("Deleted Material:", selectedMaterial);
      setSelectedMaterial(null);
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
        selectedMaterial={selectedMaterial}
        onEdit={handleEditButtonClick}
        onSave={handleSaveMaterial}
        onDelete={handleDeleteButtonClick}
      />

      {/* DataTable cho phép chọn khách hàng */}
      <DataTable onSelectMaterial={handleSelectMaterial}/>

    </div>
  );
};

export default TabContent;
