import React from 'react';

export default function ConfirmModal({
  isOpen,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isConfirming = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-modal__backdrop" role="presentation" onClick={onCancel}>
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-modal-title">{title}</h2>
        <p>{message}</p>
        <div className="confirm-modal__actions">
          <button type="button" onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={isConfirming}>
            {isConfirming ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
