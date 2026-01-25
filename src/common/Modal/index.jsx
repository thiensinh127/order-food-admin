import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./index.css";

function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

function getFocusable(container) {
  if (!container) return [];
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(",");
  return Array.from(container.querySelectorAll(selector));
}

/**
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - title?: string | ReactNode
 * - description?: string | ReactNode
 * - size?: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 * - closeOnEsc?: boolean (default: true)
 * - closeOnOutside?: boolean (default: true)
 * - footer?: ReactNode
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  size = "md",
  closeOnEsc = true,
  closeOnOutside = true,
  footer,
  children,
}) {
  const overlayRef = useRef(null);
  const panelRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useLockBodyScroll(open);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement;

    const focusables = getFocusable(panelRef.current);
    if (focusables.length) focusables[0].focus();
    else panelRef.current?.focus();

    function onKeyDown(e) {
      if (e.key === "Escape" && closeOnEsc) {
        e.stopPropagation();
        onClose?.();
      }
      if (e.key === "Tab") {
        const nodes = getFocusable(panelRef.current);
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, closeOnEsc, onClose]);

  function onOverlayClick(e) {
    if (!closeOnOutside) return;
    if (e.target === overlayRef.current) onClose?.();
  }

  if (typeof document === "undefined") return null;
  if (!open) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onMouseDown={onOverlayClick}
      className="modal-overlay"
      aria-modal="true"
      role="dialog"
    >
      <div className={`modal-container modal-size-${size}`}>
        <div ref={panelRef} tabIndex={-1} className="modal-panel">
          {(title || description) && (
            <div className="modal-header">
              {title && (
                <h2 className="modal-title" id="modal-title">
                  {title}
                </h2>
              )}
              {description && (
                <p className="modal-description">{description}</p>
              )}
            </div>
          )}

          <div className="modal-body">{children}</div>

          {footer !== undefined && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>,
    document.body
  );
}
