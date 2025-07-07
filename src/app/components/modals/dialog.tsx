import React, { useEffect, useRef, forwardRef } from 'react';
import A11yDialog from 'a11y-dialog';
import ReactDOM from 'react-dom';

interface DialogBoxProps {
  id: string;
  titleId: string;
  children: React.ReactNode;
  // Optionally, add open/close handlers or refs as needed
}
const DialogBox = forwardRef<any, DialogBoxProps>(
  ({ id, titleId, children }: DialogBoxProps, ref) => {
    const rootElementRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<any>(null);
    const wrapperId = `${id}-wrapper`;

  // Create wrapper div on mount (like Vue's created)
  useEffect(() => {
    let wrapper = document.getElementById(wrapperId);
    if (!wrapper) {
      wrapper = document.createElement('div');
      wrapper.setAttribute('id', wrapperId);
      // You may want to append to a specific container, e.g. #app-dialog
      document.body.appendChild(wrapper);
    }
    return () => {
      // Clean up wrapper on unmount
      if (wrapper && wrapper.parentNode) {
        wrapper.parentNode.removeChild(wrapper);
      }
    };
  }, [wrapperId]);

  // Initialize/destroy A11yDialog
  useEffect(() => {
    if (rootElementRef.current) {
      dialogRef.current = new A11yDialog(rootElementRef.current);
      // Optionally expose dialogRef.current via props/ref
    }
    return () => {
      if (dialogRef.current) {
        dialogRef.current.destroy();
        dialogRef.current = null;
      }
    };
  }, []);

  // Portal rendering
  const dialogContent = (
    <div id={id} ref={rootElementRef}>
      <div data-a11y-dialog-hide tabIndex={-1} />
      <dialog role="dialog" aria-label={titleId}>
        <div role="document">{children}</div>
      </dialog>
    </div>
  );

  // Render into wrapper portal
  if (typeof document !== "undefined") {
  const wrapper = document.getElementById(wrapperId);
  return wrapper ? ReactDOM.createPortal(dialogContent, wrapper) : null;
}
  
});

export default DialogBox;