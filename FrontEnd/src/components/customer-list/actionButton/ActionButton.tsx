import React, { useState, useEffect } from "react";
import "./ActionButton.scss";
import Button from "@/components/ui/Button";
import { Icon } from "@iconify/react";
import "../../../scss/_variables.scss";
import { CreateCustomer } from "@/components/form/Create/Customer/create-customer";
import { EditCustomer } from "@/components/form/Edit/Customer/edit-customer";
import { DataCustomer } from "../table/DataTable";
import DeleteButton from "@/components/form/Delete/delete-button";

interface ActionButtonProps {
  selectedCustomer: DataCustomer | null;
  onEdit: () => void;
  onSave: (updatedCustomer: DataCustomer) => void;
  onDelete: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ selectedCustomer, onEdit, onSave, onDelete }) => {
  const [clickNew, setClickNew] = useState(false);
  const [clickEdit, setClickEdit] = useState(false);
  const [clickDelete, setClickDelete] = useState(false);

  // Xử lý khi `selectedCustomer` thay đổi
  useEffect(() => {
    if (selectedCustomer) {
      setClickEdit(false);
      setClickDelete(false);
    }
  }, [selectedCustomer]);

  // Hàm chọn một khách hàng cụ thể để chỉnh sửa
  const handleClickNewButton = () => {
    setClickNew(!clickNew);
  };

  // Hàm chọn một khách hàng cụ thể để chỉnh sửa
  const handleClickEditButton = () => {
    if (selectedCustomer) {
      setClickEdit(true);
      onEdit();
    }
  };
  
  const handleSaveCustomer = (updatedCustomer: DataCustomer) => {
    onSave(updatedCustomer);
    setClickEdit(false);
  };

  // Hàm Xoá khách hàng
  const handleClickDeleteButton = () => {
    if (selectedCustomer) {
      setClickDelete(true);
    }
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
      {clickNew && <CreateCustomer onclose={handleClickNewButton} />}

      {/* Hiển thị nút Edit và Delete */}
      <div className="edit-del-button-div">
        <div
          className={`button-div ${clickEdit ? "active" : "inactive"}`}
          onClick={handleClickEditButton}
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
        {clickEdit && selectedCustomer && (
          <EditCustomer
            customer={selectedCustomer}
            onSave={handleSaveCustomer}
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
