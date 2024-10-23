"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";
import { toast } from "sonner";
import { PdfExporter } from "~/components/pdf-exporter";
import { Table } from "lucide-react";
import { cn } from "~/lib/utils";

DocumentEditorContainerComponent.Inject(Toolbar);

export default function Home() {
  // --- Variables
  const containerRef = useRef<DocumentEditorContainerComponent | null>(null);
  const [variables, setVariables] = useState<{ name: string; value: string }[]>(
    [],
  );
  const [isDocumentLoaded, setIsDocumentLoaded] = useState(false);
  const dummyData = [
    { name: "John Doe", age: "30", country: "USA" },
    { name: "Jane Smith", age: "25", country: "Canada" },
    { name: "Alex Johnson", age: "28", country: "UK" },
  ];

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

  const convertHtmlToSfdt = async (htmlContent: string) => {
    try {
      const response = await fetch(
        "http://localhost:5000/api/documenteditor/LoadString",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: htmlContent }),
        },
      );

      if (response.ok) {
        const sfdtData = await response.json();

        containerRef.current?.documentEditor.editor.paste(sfdtData);
        toast.success("Contenu HTML ajouté au document.");
      } else {
        toast.error("Erreur lors de la conversion du contenu HTML.");
      }
    } catch (error) {
      console.error("Erreur lors de la conversion HTML en SFDT :", error);
      toast.error("Erreur lors de la conversion HTML en SFDT.");
    }
  };

  const addDummyDataToVariables = () => {
    const tableHTML = `
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; border-radius: 10%">
        <thead style="background-color: #007BFF; color: white;">
          <tr>
            <th style="padding: 8px; text-align: left;background-color: #007BFF;">Name</th>
            <th style="padding: 8px; text-align: left;background-color: #007BFF;">Age</th>
            <th style="padding: 8px; text-align: left;background-color: #007BFF;">Country</th>
          </tr>
        </thead>
        <tbody>
          ${dummyData
            .map(
              (data, index) => `
                <tr style="background-color: ${index % 2 === 0 ? "#f9f9f9" : "#ffffff"};">
                  <td style="border: 1px solid #ddd; padding: 8px;">${data.name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${data.age}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${data.country}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
  `;

    setVariables((prev) => [...prev, { name: "Table", value: tableHTML }]);
    toast.success("Données fictives ajoutées aux variables.");
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
    const html = event.dataTransfer?.getData("text/html");
    const text = event.dataTransfer?.getData("text/plain");

    console.log("HTML:", html);
    if (html) {
      convertHtmlToSfdt(html);
    } else if (text && containerRef.current) {
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

      <div className="flex items-center gap-4 mt-4">
        <PdfExporter
          container={containerRef.current}
          disabled={isDocumentLoaded}
        />
        <button
          onClick={() => addDummyDataToVariables()}
          className={cn(
            "mt-4 px-4 py-2 text-white rounded transition duration-300 ease-in-out group flex items-center gap-2",
            !isDocumentLoaded
              ? "bg-neutral-500 cursor-no-drop"
              : "hover:bg-green-700 bg-green-500 ",
          )}
          disabled={!isDocumentLoaded}
        >
          Add HTML Table
          <Table
            size={18}
            className="group-hover:rotate-6 transform transition duration-300 ease-in-out"
          />
        </button>
      </div>

      <div className="flex flex-row gap-4 w-full">
        {isDocumentLoaded && (
          <div id="listview" className="w-2/4 bg-white shadow p-4 rounded mt-4">
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
            serviceUrl="http://localhost:5000/api/documenteditor/"
            enableToolbar={true}
          />
        </div>
      </div>
    </div>
  );
}
