"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";
import { toast } from "sonner";
import { PdfExporter } from "~/components/pdf-exporter";

DocumentEditorContainerComponent.Inject(Toolbar);

export default function Home() {
  const containerRef = useRef<DocumentEditorContainerComponent | null>(null);
  const [variables, setVariables] = useState<{ name: string; value: string }[]>(
    [],
  );
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);

  // --- Functions
  const fetchVariables = async () => {
    try {
      const response = await fetch("/api/variables");
      if (response.ok) {
        const data = await response.json();
        setVariables(data);
      } else {
        toast.error("Erreur lors de la récupération des variables.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des variables :", error);
      toast.error("Erreur lors de la récupération des variables.");
    }
  };

  const replaceVariablesInDocument = (
    editor: any,
    variables: { name: string; value: string }[],
  ) => {
    variables.forEach(({ name, value }) => {
      const variablePattern = `${name}`;
      editor.search.findAll(variablePattern);
      const results = editor.search.searchResults;

      if (results && results.length > 0) {
        for (let i = 0; i < results.length; i++) {
          editor.search.searchResults.index = i;
          editor.editor.insertText(value);
        }
        editor.search.searchResults.clear();
      }
    });
  };

  const applyReplacements = async () => {
    if (containerRef.current && isDocumentLoaded) {
      await fetchVariables();
      replaceVariablesInDocument(
        containerRef.current.documentEditor,
        variables,
      );
      toast.success("Les variables ont été appliquées au document.");
    }
  };

  useEffect(() => {
    fetchVariables();
  }, []);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;

      container.documentEditor.documentChange = () => {
        setIsDocumentLoaded(true);
        container.documentEditor.focusIn();
      };

      // Drag and Drop Events
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
    if (variableValue) {
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

  useEffect(() => {
    if (isDocumentLoaded) {
      applyReplacements();
    }
  }, [isDocumentLoaded]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-6xl">
        Office.js X <span className="text-blue-500">Wealthcome</span>
      </h1>
      <PdfExporter container={containerRef.current} />

      <div className="flex flex-row gap-4 w-full">
        {isDocumentLoaded && (
          <div id="listview" className="w-2/4 bg-white shadow p-4 rounded">
            <h2 className="text-2xl font-semibold mb-4">Variables</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="font-bold">Key</div>
              <div className="font-bold">Value</div>
              {variables.map((variable, index) => (
                <React.Fragment key={index}>
                  <div
                    className="cursor-pointer bg-neutral-300 rounded-lg px-2 py-1 overflow-hidden text-ellipsis whitespace-nowrap"
                    draggable
                    data-value={variable.value}
                  >
                    {variable.name}
                  </div>
                  <div
                    className="rounded-lg px-2 py-1 bg-blue-500 text-white cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap"
                    draggable
                    data-value={variable.value}
                  >
                    {variable.value}
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
        <div className="flex-grow w-3/4 h-full mt-4">
          <DocumentEditorContainerComponent
            id="container"
            height="70vh"
            width="100%"
            ref={containerRef}
            serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
            enableToolbar={true}
          />
        </div>
      </div>
    </div>
  );
}
