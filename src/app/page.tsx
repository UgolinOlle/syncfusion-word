"use client";

import {
  DocumentEditorContainerComponent,
  Toolbar,
} from "@syncfusion/ej2-react-documenteditor";

DocumentEditorContainerComponent.Inject(Toolbar);

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <h1 className="text-6xl">
        Office.js X <span className="text-blue-500">Wealthcome</span>
      </h1>
      <DocumentEditorContainerComponent
        id="container"
        // style={{ height: "590px" }}
        serviceUrl="https://ej2services.syncfusion.com/production/web-services/api/documenteditor/"
        enableToolbar={true}
      />
    </div>
  );
}
