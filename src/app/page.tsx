"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";

import { PdfExporter } from "~/components/pdf-exporter";
import { SaveButton } from "~/components/save-button";

DocumentEditorContainerComponent.Inject(Toolbar);

/**
 * Home page
 * @description This is the home page of the application.
 * @returns React component
 */
export default function Home() {
  // --- Variables
  const containerRef = useRef<DocumentEditorContainerComponent | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);

  // --- Functions
  document.getElementById("save")?.addEventListener("click", () => {
    containerRef.current?.documentEditor.save("sample", "Docx");
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      containerRef.current?.documentEditor.open(file);
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;

      container.created = () => {
        container.documentEditor.documentChange = () => {
          setIsDocumentLoaded(true);
          container.documentEditor.focusIn();
        };

        const listViewElement = document.getElementById("listview");
        const documentElement = container.documentEditor.element;

        if (listViewElement && documentElement) {
          listViewElement.removeEventListener("dragstart", handleDragStart);
          documentElement.removeEventListener("dragover", handleDragOver);
          documentElement.removeEventListener("drop", handleDrop);

          listViewElement.addEventListener("dragstart", handleDragStart);
          documentElement.addEventListener("dragover", handleDragOver);
          documentElement.addEventListener("drop", handleDrop);
        }
      };

      return () => {
        const documentElement = container.documentEditor?.element;
        const listViewElement = document.getElementById("listview");

        listViewElement?.removeEventListener("dragstart", handleDragStart);
        documentElement?.removeEventListener("dragover", handleDragOver);
        documentElement?.removeEventListener("drop", handleDrop);
      };
    }
  }, []);

  const handleDragStart = (event: DragEvent) => {
    const target = event.target as HTMLElement;
    const variableValue = target.getAttribute("data-value");

    if (variableValue && variableValue.includes("<table")) {
      event.dataTransfer?.setData("text/html", variableValue);
      target.classList.add("de-drag-target");
    } else if (variableValue) {
      event.dataTransfer?.setData("text/plain", variableValue);
      target.classList.add("de-drag-target");
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    const text = event.dataTransfer?.getData("text/plain");

    if (text && containerRef.current) {
      containerRef.current.documentEditor.editor.insertText(text);
    }
  };

  // --- Render
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-6xl">
        Office.js X <span className="text-blue-500">Wealthcome</span>
      </h1>

      <div className="flex flex-row gap-4">
        <PdfExporter
          container={containerRef.current}
          isDisabled={isDocumentLoaded}
        />

        <SaveButton container={containerRef.current} isDisabled={isDocumentLoaded} />
      </div>

      <div className="flex flex-row gap-4 w-full">
        <div className="flex-grow w-3/4 h-full mt-4">
          <DocumentEditorContainerComponent
            id="container"
            height="70vh"
            width="100%"
            ref={containerRef}
            serviceUrl="http://127.0.0.1:5001/api/documenteditor/"
            enableToolbar={true}
          />
        </div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}
