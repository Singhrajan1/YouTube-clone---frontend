import React from 'react';

export const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Confirm', danger = false }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <div className="modal-box confirm-dialog">
        <h3 id="confirm-dialog-title" className="confirm-title">{title}</h3>
        <p className="confirm-message">{message}</p>
        <div className="confirm-actions">
          <button className="btn btn-ghost" onClick={onCancel} id="confirm-cancel-btn">
            Cancel
          </button>
          <button
            className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
            id="confirm-ok-btn"
            autoFocus
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
