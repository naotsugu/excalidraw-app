import React, { useState, useRef } from "react";
import { Excalidraw, MainMenu, WelcomeScreen, serializeAsJSON, exportToBlob, exportToSvg } from "@excalidraw/excalidraw";
import type { AppState, ExcalidrawImperativeAPI, ExcalidrawProps, BinaryFiles } from "@excalidraw/excalidraw/types/types"
import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

import { save } from "@tauri-apps/api/dialog";
import { writeFile, writeBinaryFile, writeTextFile } from "@tauri-apps/api/fs"

function App() {

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [viewModeEnabled, setViewModeEnabled] = useState(false);
  const [gridModeEnabled, setGridModeEnabled] = useState(false);
  const [theme, setTheme] = useState<ExcalidrawProps["theme"]>("light");
  const [exportWithDarkMode, setExportWithDarkMode] = useState<boolean>(false);

  return (
    <>
      <div style={{ height: "97vh" }}>
        <Excalidraw
          ref={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
          viewModeEnabled={viewModeEnabled}
          gridModeEnabled={gridModeEnabled}
          theme={theme}
        >
          <MainMenu>
            <MainMenu.Item onSelect={async () => {
              if (!excalidrawAPI) return;
              const path = await save({ defaultPath: "image.excalidraw" });
              if (!path) return;
              const file = serializeAsJSON(
                excalidrawAPI.getSceneElements(),
                excalidrawAPI.getAppState(),
                excalidrawAPI.getFiles(),
                "local"
              );
              await writeTextFile(path, file);
            }}>Save...</MainMenu.Item>
            <MainMenu.Item onSelect={async () => {
              if (!excalidrawAPI) return;
              const path = await save({ defaultPath: "image.png" });
              if (!path) return;
              const blob = await exportToBlob({
                elements: excalidrawAPI.getSceneElements(),
                mimeType: "image/png",
                appState: excalidrawAPI.getAppState(),
                files: excalidrawAPI.getFiles()
              });
              const arrayBuffer = await blob.arrayBuffer();
              await writeBinaryFile(path, arrayBuffer);
            }}>Export to png...</MainMenu.Item>

            <MainMenu.Item onSelect={async () => {
              if (!excalidrawAPI) return;
              const path = await save({ defaultPath: "image.svg" });
              if (!path) return;
              const svg = await exportToSvg({
                elements: excalidrawAPI.getSceneElements(),
                appState: excalidrawAPI.getAppState(),
                files: excalidrawAPI.getFiles()
              });
              await writeTextFile(path, svg.outerHTML);
            }}>Export to svg...</MainMenu.Item>
            
            <MainMenu.DefaultItems.LoadScene />
            <MainMenu.DefaultItems.ClearCanvas />
            <MainMenu.DefaultItems.ToggleTheme />
            <MainMenu.DefaultItems.Help />
          </MainMenu>
          <WelcomeScreen />
        </Excalidraw>
      </div>
    </>
  );
}

export default App;
