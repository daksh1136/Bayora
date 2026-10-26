import asyncio
import json
import base64
import os
import httpx
import websockets

HTML_PATH = "/Users/raj/Downloads/Bayora/docs/Bayora_Project_Overview.html"
OUT_PDF_PATH = "/Users/raj/Downloads/Bayora/Bayora_Project_Overview.pdf"
ARTIFACT_PDF_PATH = "/Users/raj/.gemini/antigravity/brain/70938304-4017-4629-833d-c24d83def94b/Bayora_Project_Overview.pdf"

async def generate_pdf():
    print("===================================================================")
    print("  📄 BAYORA DOCUMENTATION GENERATOR - CHROME CDP PDF BUILDER       ")
    print("===================================================================")

    with open(HTML_PATH, "r", encoding="utf-8") as f:
        html_content = f.read()

    # 1. Connect to Chrome target
    async with httpx.AsyncClient() as client:
        resp = await client.put("http://127.0.0.1:9223/json/new?about:blank")
        target = resp.json()
        ws_url = target["webSocketDebuggerUrl"]
        print(f"✓ Created new Chrome tab: {target['id']}")

    ws = await websockets.connect(ws_url, max_size=50 * 1024 * 1024)
    print("✓ Connected to Chrome CDP WebSocket")

    # Enable Page and Runtime
    await ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
    await ws.recv()

    # Navigate to file URL
    file_url = f"file://{HTML_PATH}"
    print(f"✓ Loading document: {file_url}")
    await ws.send(json.dumps({
        "id": 2,
        "method": "Page.navigate",
        "params": {"url": file_url}
    }))

    # Wait for page load
    while True:
        raw = await ws.recv()
        msg = json.loads(raw)
        if msg.get("id") == 2 or msg.get("method") == "Page.loadEventFired":
            break

    await asyncio.sleep(1.0) # ensure webfonts are loaded

    # Generate print PDF
    print("✓ Rendering print-ready vector PDF...")
    await ws.send(json.dumps({
        "id": 3,
        "method": "Page.printToPDF",
        "params": {
            "printBackground": True,
            "paperWidth": 8.27,      # A4 width in inches
            "paperHeight": 11.69,    # A4 height in inches
            "marginTop": 0.4,
            "marginBottom": 0.4,
            "marginLeft": 0.5,
            "marginRight": 0.5,
            "preferCSSPageSize": True,
            "generateTaggedPDF": True
        }
    }))

    while True:
        raw = await ws.recv()
        msg = json.loads(raw)
        if msg.get("id") == 3:
            pdf_bytes = base64.b64decode(msg["result"]["data"])
            print(f"✓ Generated PDF ({len(pdf_bytes)} bytes)")
            
            # Save to root workspace
            with open(OUT_PDF_PATH, "wb") as out_f:
                out_f.write(pdf_bytes)
            print(f"  📁 Saved: {OUT_PDF_PATH}")

            # Save to brain artifact folder
            with open(ARTIFACT_PDF_PATH, "wb") as art_f:
                art_f.write(pdf_bytes)
            print(f"  📁 Saved: {ARTIFACT_PDF_PATH}")
            break

    await ws.close()
    print("===================================================================")
    print("  🎉 PDF EXPLANATION DOCUMENT GENERATED SUCCESSFULLY!              ")
    print("===================================================================")

if __name__ == "__main__":
    asyncio.run(generate_pdf())
