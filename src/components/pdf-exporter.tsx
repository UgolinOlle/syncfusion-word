"use client";

import React from "react";
import {
  PdfBitmap,
  PdfDocument,
  PdfPageOrientation,
  PdfPageSettings,
  PdfSection,
  SizeF,
} from "@syncfusion/ej2-pdf-export";
import {
  DocumentEditorContainerComponent,
  ImageFormat,
} from "@syncfusion/ej2-react-documenteditor";

interface PdfExporterProps {
  container: DocumentEditorContainerComponent | null;
}

export const PdfExporter: React.FC<PdfExporterProps> = ({ container }) => {
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
    <button
      className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
      onClick={onClick}
    >
      Export
    </button>
  );
};
