#!/usr/bin/env node
// app.js - Generic Agent Web Server

import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 6677;
const HOST = process.env.HOST || "0.0.0.0";

// Middleware
app.use(compression());
app.use(express.json());

// Static assets with caching
app.use(express.static(path.join(__dirname, "public"), {
	maxAge: "7d",
	etag: false,
	lastModified: true
}));

// Library files
app.use("/library", express.static(path.join(__dirname, "library"), {
	maxAge: "30d",
	etag: false
}));

// Script modules
app.use("/script", express.static(path.join(__dirname, "script"), {
	maxAge: "7d",
	etag: false
}));

// Health check
app.get("/health", (req, res) => {
	res.json({
		status: "ok",
		timestamp: new Date().toISOString(),
		uptime: process.uptime()
	});
});

// Info endpoint
app.get("/api/info", (req, res) => {
	res.json({
		name: "Generic Conversational Agent",
		version: "1.0.0",
		services: {
			llm: process.env.LLM_URL || "https://logus2k.com/llm",
			stt: process.env.STT_URL || "https://logus2k.com/stt",
			tts: process.env.TTS_URL || "https://logus2k.com/tts"
		}
	});
});

// Serve the main agent page at all routes (SPA fallback)
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling
app.use((err, req, res, next) => {
	console.error("Error:", err);
	res.status(500).json({
		error: "Internal server error",
		message: process.env.NODE_ENV === "development" ? err.message : undefined
	});
});

// Start server
app.listen(PORT, HOST, () => {
	console.log(`[g-agent] Server running at http://${HOST}:${PORT}`);
	console.log(`[g-agent] Environment: ${process.env.NODE_ENV || "development"}`);
	console.log(`[g-agent] LLM Service: ${process.env.LLM_URL || "https://logus2k.com/llm"}`);
	console.log(`[g-agent] STT Service: ${process.env.STT_URL || "https://logus2k.com/stt"}`);
	console.log(`[g-agent] TTS Service: ${process.env.TTS_URL || "https://logus2k.com/tts"}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
	console.log("[g-agent] SIGTERM received, shutting down gracefully...");
	process.exit(0);
});

process.on("SIGINT", () => {
	console.log("[g-agent] SIGINT received, shutting down gracefully...");
	process.exit(0);
});
