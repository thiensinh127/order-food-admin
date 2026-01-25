import React from "react";
import { Modal } from "../Modal";
import "./index.css"

const ConfirmModal = ({ open, onClose, onConfirm, title, message, loading }) => {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title || "Confirm Action"}
      description={message || "Are you sure you want to proceed?"}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary"
            style={{ backgroundColor: '#ef4444' }} // Red for danger/delete
          >
            {loading ? "Processing..." : "Delete"}
          </button>
        </>
      }
    >
      <div style={{ padding: '4px 0' }}>
        {/* Children can be empty for simple confirmation */}
      </div>
    </Modal>
  );
};

export default ConfirmModal;
