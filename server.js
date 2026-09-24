import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CLT_BBOX = { lamin: 34.75, lomin: -81.15, lamax: 35.45, lomax: -80.45 };

app.use(express.static(path.join(__dirname, "public")));
app.get("/api/aircraft", async (_req, res) => {
  try {
    const params = new URLSearchParams(CLT_BBOX);
    const response = await fetch("https://opensky-network.org/api/states/all?" + params.toString(), { headers: { "User-Agent": "CLT-Airport-Display/2.0" } });
    if (!response.ok) return res.status(response.status).json({ error: "OpenSky request failed", status: response.status });
    const data = await response.json();
    const aircraft = (data.states || []).filter(s => s[5] != null && s[6] != null).map(s => ({ icao24:s[0], callsign:(s[1]||"").trim(), country:s[2], longitude:s[5], latitude:s[6], altitude:s[7], onGround:s[8], velocity:s[9], heading:s[10], verticalRate:s[11] }));
    res.json({ timestamp:data.time, aircraft });
  } catch (error) { console.error(error); res.status(500).json({ error:"Unable to load aircraft data" }); }
});
app.use((_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log("CLT Monitor running on http://localhost:" + PORT));