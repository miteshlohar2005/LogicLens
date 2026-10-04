export function buildSandpackFiles(generatedFiles: Array<{ path: string; content: string }>) {
  const sandpackFiles: Record<string, string> = {};

  generatedFiles.forEach((file) => {
    let normalizedPath = file.path;
    if (!normalizedPath.startsWith("/")) {
      normalizedPath = "/" + normalizedPath;
    }
    sandpackFiles[normalizedPath] = file.content;
  });

  // Ensure index.tsx exists, if not, create a default one that mounts App.tsx
  if (!sandpackFiles["/index.tsx"] && !sandpackFiles["/index.js"]) {
    sandpackFiles["/index.tsx"] = `import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container!);
root.render(<App />);
`;
  }

  // Inject Tailwind CSS via index.html or styles.css if not present
  if (!sandpackFiles["/public/index.html"]) {
    sandpackFiles["/public/index.html"] = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LogicLens Generated App</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              brand: '#6c63ff',
              surface: '#080b14',
            }
          }
        }
      }
    </script>
    <style>
      body {
        background-color: #0f172a;
        color: #f8fafc;
        font-family: ui-sans-serif, system-ui, sans-serif;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
  }

  return sandpackFiles;
}
