/**
 * Thin MCP widget shell — extracts the json-render spec from ChatGPT's
 * tool-output injection and loads the real Next.js renderer in an inner
 * iframe that fills the shell. Actively resizes to match content height.
 */
export function rendererTemplate(baseUrl: string): string {
  return /* html */ `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Diageo Widget</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; overflow: hidden; background: transparent; }
  #frame { width: 100%; border: 0; display: block; min-height: 400px; }
  #loading { font-family: system-ui, sans-serif; color: #888; text-align: center; padding: 40px 16px; font-size: 14px; }
</style>
</head>
<body>
<div id="loading">Loading\u2026</div>
<script>
(function(){
  var BASE = ${JSON.stringify(baseUrl)};
  var done = false;

  function extractSpec(raw) {
    try {
      var d = typeof raw === "string" ? JSON.parse(raw) : raw;
      if (d && d.root && d.elements) return d;
      if (d && d.spec) return d.spec;
      if (d && typeof d.text === "string") {
        var p = JSON.parse(d.text);
        if (p && p.spec) return p.spec;
        if (p && p.root && p.elements) return p;
      }
      if (d && d.content && d.content[0] && d.content[0].text) {
        var inner = JSON.parse(d.content[0].text);
        if (inner && inner.spec) return inner.spec;
      }
    } catch(e) {}
    return null;
  }

  function loadRenderer(spec) {
    if (done || !spec) return;
    done = true;
    var encoded = btoa(unescape(encodeURIComponent(JSON.stringify(spec))));
    var url = BASE + "/mcp-render?s=" + encoded;

    // Remove loading text
    var el = document.getElementById("loading");
    if (el) el.remove();

    // Create inner iframe
    var frame = document.createElement("iframe");
    frame.id = "frame";
    frame.src = url;
    frame.style.minHeight = "400px";
    document.body.appendChild(frame);

    // Listen for resize messages from the inner page
    window.addEventListener("message", function(ev) {
      try {
        var data = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
        if (data && data.type === "diageo-widget-resize" && data.height) {
          var h = data.height + 8;
          frame.style.height = h + "px";
          // Also resize ourselves for the outer host (ChatGPT)
          document.documentElement.style.height = h + "px";
          document.body.style.height = h + "px";
        }
      } catch(e) {}
    });
  }

  function probe() {
    if (done) return;
    if (window.openai && window.openai.toolOutput) loadRenderer(extractSpec(window.openai.toolOutput));
  }

  // Proxy setter for async injection
  try {
    window.openai = new Proxy(window.openai || {}, {
      set: function(t, k, v) { t[k] = v; if (k === "toolOutput") loadRenderer(extractSpec(v)); return true; }
    });
  } catch(e) {}

  // postMessage fallback
  window.addEventListener("message", function(ev) {
    if (done) return;
    loadRenderer(extractSpec(ev.data));
  });

  // Immediate + retries
  probe();
  [100, 300, 800, 2000, 5000].forEach(function(ms) { setTimeout(probe, ms); });
})();
</script>
</body>
</html>`;
}
