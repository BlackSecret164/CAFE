import React from 'react';
import './delete-button.scss';

interface DeleteButtonProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="delete-dialog">
      <div className="delete-dialog__content">
        <button className="delete-dialog__close" onClick={onCancel}>×</button>
        <div className="delete-dialog__icon">⚠️</div>
        <h2 className="delete-dialog__title">Sure you want to delete?</h2>
        <p className="delete-dialog__message">Are you sure you want to delete this?</p>
        <div className="delete-dialog__actions">
          <button className="delete-dialog__cancel" onClick={onCancel}>No, cancel</button>
          <button className="delete-dialog__confirm" onClick={onConfirm}>Yes, confirm</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteButton;
