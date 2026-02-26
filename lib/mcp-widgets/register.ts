import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { rendererTemplate } from "./renderer";

export const WIDGET_URI = "ui://diageo/renderer.html";

/**
 * Register the generic Diageo widget renderer as an MCP resource.
 * The resource is a thin HTML shell that extracts the spec from ChatGPT's
 * tool output and navigates to the real Next.js renderer at /mcp-render.
 */
export function registerWidgets(server: McpServer, baseUrl: string) {
  server.registerResource(
    "diageo-widget-renderer",
    WIDGET_URI,
    { mimeType: "text/html" },
    async () => ({
      contents: [
        {
          uri: WIDGET_URI,
          mimeType: "text/html",
          text: rendererTemplate(baseUrl),
        },
      ],
    })
  );
}
