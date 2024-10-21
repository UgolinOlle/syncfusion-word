"use client";

import React, { useEffect, useState } from "react";
import {
  DocumentEditorContainerComponent,
  Toolbar,
  ImageFormat,
} from "@syncfusion/ej2-react-documenteditor";
import {
  PdfBitmap,
  PdfDocument,
  PdfPageOrientation,
  PdfPageSettings,
  PdfSection,
  SizeF,
} from "@syncfusion/ej2-pdf-export";
import { toast } from "sonner";

DocumentEditorContainerComponent.Inject(Toolbar);

export default function Home() {
  const [container, setContainer] =
    useState<DocumentEditorContainerComponent | null>(null);
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
        return data;
      } else {
        toast.error("Erreur lors de la récupération des variables.");
        return [];
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des variables :", error);
      toast.error("Erreur lors de la récupération des variables.");
      return [];
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
    if (container && isDocumentLoaded) {
      const fetchedVariables = await fetchVariables();
      replaceVariablesInDocument(container.documentEditor, fetchedVariables);
      toast.success("Les variables ont été appliquées au document.");
    }
  };

  useEffect(() => {
    if (container) {
      container.documentEditor.documentChange = () => {
        setIsDocumentLoaded(true);
      };
    }
  }, [container]);

  useEffect(() => {
    if (isDocumentLoaded) {
      applyReplacements();
    }
  }, [isDocumentLoaded]);

  const onClick = () => {
    if (!container) return;

    const obj = container;
    const pdfDocument: PdfDocument = new PdfDocument();
    const count: number = obj.documentEditor.pageCount;

    obj.documentEditor.documentEditorSettings.printDevicePixelRatio = 2;
    let loadedPage = 0;

    for (let i = 1; i <= count; i++) {
      setTimeout(() => {
        const format: ImageFormat = "image/jpeg" as ImageFormat;
        const image = obj.documentEditor.exportAsImage(i, format);

        image.onload = function () {
          const imageHeight = parseInt(image.style.height.replace("px", ""));
          const imageWidth = parseInt(image.style.width.replace("px", ""));

          const section: PdfSection = pdfDocument.sections.add() as PdfSection;
          const settings: PdfPageSettings = new PdfPageSettings(0);

          if (imageWidth > imageHeight) {
            settings.orientation = PdfPageOrientation.Landscape;
          }

          settings.size = new SizeF(imageWidth, imageHeight);
          section.setPageSettings(settings);

          const page = section.pages.add();
          const graphics = page.graphics;
          const imageStr = image.src.replace("data:image/jpeg;base64,", "");
          const pdfImage = new PdfBitmap(imageStr);
          graphics.drawImage(pdfImage, 0, 0, imageWidth, imageHeight);

          loadedPage++;
          if (loadedPage === count) {
            pdfDocument.save(
              (obj.documentEditor.documentName === ""
                ? "sample"
                : obj.documentEditor.documentName) + ".pdf",
            );
          }
        };
      }, 500);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-6xl">
        Office.js X <span className="text-blue-500">Wealthcome</span>
      </h1>
      <button
        className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
        onClick={onClick}
      >
        Export
      </button>
      <div className="flex-grow w-full mt-4 h-full">
        <DocumentEditorContainerComponent
          id="container"
          style={{ width: "100%", height: "900px" }}
          serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
          enableToolbar={true}
          ref={(scope) => setContainer(scope)}
        />
      </div>
    </div>
  );
}
