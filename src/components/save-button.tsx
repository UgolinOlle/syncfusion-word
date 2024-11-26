"use client";

import React from "react";
import { DocumentEditorContainerComponent } from "@syncfusion/ej2-react-documenteditor";
import { SaveAll } from "lucide-react";
import { cn } from "~/lib/utils";

interface SaveButtonProps {
  container: DocumentEditorContainerComponent | null;
  isDisabled?: boolean;
}

export const SaveButton: React.FC<SaveButtonProps> = ({
  container,
  isDisabled,
}) => {
  const handleSave = () => {
    if (!container) return;

    const fileName = container.documentEditor.documentName || "Document";
    container.documentEditor.save(fileName, "Docx");
  };

  return (
    <button
      className={cn(
        "text-white px-4 py-2 mt-4 rounded transition duration-300 ease-in-out group flex items-center gap-2",
        !isDisabled
          ? "bg-neutral-500 cursor-no-drop"
          : "bg-green-500 hover:bg-green-600"
      )}
      onClick={handleSave}
      disabled={!isDisabled}
    >
      Save
      <SaveAll
        size={18}
        className="transform group-hover:rotate-6 transition duration-300 ease-in-out"
      />
    </button>
  );
};
