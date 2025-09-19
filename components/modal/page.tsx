import React from "react";
import { Dialog } from "primereact/dialog";

interface BasicDocProps {
  visible: boolean;
  onHide: () => void;
}

export default function BasicDoc({ visible, onHide }: BasicDocProps) {
  return (
    <Dialog
      header="Header"
      visible={visible}
      style={{ width: "50vw" }}
      onHide={onHide}
    >
      <p className="m-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua.
      </p>
    </Dialog>
  );
}
