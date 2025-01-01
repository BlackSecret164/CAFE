import React, { useState } from "react";
import ActionButton from "../actionButton/ActionButton";
import "./TabContent.scss";
import DataTable from "../table/DataTable";
import { EditTables } from "@/components/form/Edit/Tables/edit-tables";
import { DataTables } from "../table/DataTable";
import DeleteButton from "@/components/form/Delete/delete-button";

const TabContent = () => {
  const [selectedTables, setSelectedTables] = useState<DataTables | null>(null);
  const [isEditVisible, setEditVisible] = useState(false);
  const [isDeleteVisible, setDeleteVisible] = useState(false);

  // Hàm để chọn khách hàng và mở hộp thoại chỉnh sửa
  const handleSelectTables = (Tables: DataTables) => {
    setSelectedTables(Tables);
  };

  const handleEditButtonClick = () => {
    if (selectedTables) {
      setEditVisible(true);
    }
  };

  const handleSaveTables = (updatedTables: DataTables) => {
    // Thực hiện logic lưu cập nhật ở đây
    console.log("Updated Tables:", updatedTables);
    setEditVisible(false);
  };

  const handleDeleteButtonClick = () => {
    if (selectedTables) {
      setDeleteVisible(true);
    }
  };
  const handleConfirmDelete = () => {
    if (selectedTables) {
      // Logic to delete the selected Tables
      console.log("Deleted Tables:", selectedTables);
      setSelectedTables(null);
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
        selectedTables={selectedTables}
        onEdit={handleEditButtonClick}
        onSave={handleSaveTables}
        onDelete={handleDeleteButtonClick}
      />

      {/* DataTable cho phép chọn khách hàng */}
      <DataTable onSelectTables={handleSelectTables} />

      {/* Hiển thị EditTables khi cần */}
      {isEditVisible && selectedTables && (
        <EditTables
          tables={selectedTables}
          onSave={handleSaveTables}
          onClose={() => setEditVisible(false)}
        />
      )}
    </div>
  );
};

export default TabContent;
