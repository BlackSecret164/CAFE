import React, { useState } from "react";
import "./ActionButton.scss";
import Button from "@/components/ui/Button";
import { Icon } from "@iconify/react";
import "../../../scss/_variables.scss";
import { CreateTables } from "@/components/form/Create/Tables/create-tables";
import { EditTables } from "@/components/form/Edit/Tables/edit-tables";
import { DataTables } from "../table/DataTable";
import DeleteButton from "@/components/form/Delete/delete-button";

interface ActionButtonProps {
  selectedTables: DataTables | null;
  onEdit: () => void;
  onSave: (updatedTables: DataTables) => void;
  onDelete: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ selectedTables, onEdit, onSave, onDelete }) => {
  const [clickNew, setClickNew] = useState(false);
  const [clickEdit, setClickEdit] = useState(false);
  const [clickDelete, setClickDelete] = useState(false);

  // Hàm chọn một khách hàng cụ thể để chỉnh sửa
  const handleClickNewButton = () => {
    setClickNew(!clickNew);
  };

  // Hàm chọn một khách hàng cụ thể để chỉnh sửa
  const handleClickEditButton = () => {
    if (selectedTables) {
      setClickEdit(true);
    }
  };

  const handleSaveTables = (updatedTables: DataTables) => {
    onSave(updatedTables);
    setClickEdit(false);
  };

  // Hàm Xoá khách hàng
  const handleClickDeleteButton = () => {
    setClickDelete(!clickDelete);
  };

  const handleConfirmDelete = () => {
    onDelete();
    setClickDelete(false);
  };

  const handleCancelDelete = () => {
    setClickDelete(false);
  };

  return (
    <div className="my-action-button">

      {/* Hiển thị nút New */}
      <div
        className={`new-button-div ${clickNew ? "active" : "inactive"}`}
        onClick={handleClickNewButton}
      >
        <Button
          variant="primary"
          size="medium"
          rounded="none"
          backgroundColor="transparent"
          padding="10px 16px"
          type="button"
          disabled={false}
        >
          <Icon
            icon="ic:round-plus"
            width={20}
            height={20}
            style={{ color: "white" }}
            className="icon-custom"
          />
          New
        </Button>
      </div>
      {clickNew && <CreateTables onclose={handleClickNewButton} />}

      {/* Hiển thị nút Edit và Delete */}
      <div className="edit-del-button-div">
        <div
          className={`button-div ${clickEdit ? "active" : "inactive"}`}
          onClick={onEdit}
        >
          <Button
            variant="primary"
            size="medium"
            rounded="none"
            backgroundColor="transparent"
            textColor="#2F4156"
            padding="10px 16px"
            type="button"
            disabled={false}
          >
            <Icon
              icon="tabler:edit"
              width={20}
              height={20}
              className="icon-custom-other"
            />
            Edit
          </Button>
        </div>
        {clickEdit && selectedTables && (
          <EditTables
            tables={selectedTables}
            onSave={handleSaveTables}
            onClose={() => setClickEdit(false)}
          />
        )}

        {/* Hiển thị nút Delete */}
        <div
          className={`button-div ${clickDelete ? "active" : "inactive"}`}
          onClick={handleClickDeleteButton}
        >
          <Button
            variant="primary"
            size="medium"
            rounded="none"
            backgroundColor="transparent"
            textColor="#2F4156"
            padding="10px 16px"
            type="button"
            disabled={false}
          >
            <Icon
              icon="bx:bxs-trash"
              width={20}
              height={20}
              className="icon-custom-other"
            />
            Delete
          </Button>
        </div>

        {/* Delete Confirmation Dialog */}
        {clickDelete && (
          <DeleteButton
            onConfirm={handleConfirmDelete}
            onCancel={handleCancelDelete}
          />
        )}
      </div>
    </div>
  );
};

export default ActionButton;
