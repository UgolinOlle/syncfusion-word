"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";
import { toast } from "sonner";

import { PdfExporter } from "~/components/pdf-exporter";
import { TOOLBAR_ITEMS } from "~/lib/constants";

DocumentEditorContainerComponent.Inject(Toolbar);

export default function Home() {
  const containerRef = useRef<DocumentEditorContainerComponent | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);

  // --- Functions
  const handleToolbarClick = (args: any) => {
    switch (args.item.id) {
      case "new":
        containerRef.current?.documentEditor.openBlank();
        setIsDocumentLoaded(true);
        toast.success("Nouveau document créé avec succès.");
        break;
      case "open":
        fileInputRef.current?.click();
        break;
      case "save":
        containerRef.current?.documentEditor.save("sample", "Docx");
        toast.success("Document sauvegardé avec succès.");
        args.cancel = true;
        break;
      case "export":

      default:
        break;
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      // containerRef.current?.documentEditor.open(file);
      await loadDocumentFromBackend(file);
    }
  };

  const loadDocumentFromBackend = async (file: File) => {
    try {
      const formData = new FormData();

      formData.append("file", file);
      formData.append("clientId", "1");

      const response = await fetch(
        "http://localhost:8000/api/v1/generate-dynamic-document",
        {
          method: "POST",
          body: formData,
        },
      );

      if (response.ok) {
        const blob = await response.blob();

        containerRef.current?.documentEditor.open(blob);
        setIsDocumentLoaded(true);
        toast.success("Document chargé avec succès.");
      } else {
        toast.error("Erreur lors du chargement du document.");
      }
    } catch (error) {
      console.error("Erreur lors du chargement du document :", error);
      toast.error("Erreur lors du chargement du document.");
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;

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

      return () => {
        listViewElement?.removeEventListener("dragstart", handleDragStart);
        documentElement?.removeEventListener("dragover", handleDragOver);
        documentElement?.removeEventListener("drop", handleDrop);
      };
    }
  }, [isDocumentLoaded]);

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

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-6xl">
        Office.js X <span className="text-blue-500">Wealthcome</span>
      </h1>

      <PdfExporter
        container={containerRef.current}
        isDisabled={!isDocumentLoaded}
      />

      <div className="flex flex-row gap-4 w-full">
        <div className="flex-grow w-3/4 h-full mt-4">
          <DocumentEditorContainerComponent
            id="container"
            height="70vh"
            width="100%"
            ref={containerRef}
            serviceUrl="http://localhost:5000/api/documenteditor/"
            // serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
            enableToolbar={true}
            toolbarItems={TOOLBAR_ITEMS}
            toolbarClick={handleToolbarClick}
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
