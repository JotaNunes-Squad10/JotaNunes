import React from "react";
import { Dialog } from "primereact/dialog";

interface CreateTopicProps {
  visible: boolean;
  onHide: () => void;
}

export default function CreateTopic({ visible, onHide }: CreateTopicProps) {
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
