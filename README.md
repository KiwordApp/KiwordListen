# Kiword Listen

<div align="center">

<img src="https://www.kiword.top/assets/logo.webp" alt="Kiword Listen — offline AI meeting transcription with speaker recognition" width="96" />

**Offline AI meeting & lecture transcription with speaker recognition — 100% on-device, zero cloud.**

[Website](https://www.kiword.top/) · [Download](https://www.kiword.top/download) · [Issue Tracker](https://github.com/KiwordApp/KiwordListen/issues) · [Upstream: Handy](https://github.com/cjpais/Handy)

![Platform](https://img.shields.io/badge/platform-Windows%2010%2F11-0078D6?logo=windows11&logoColor=white)
![License](https://img.shields.io/badge/core%20license-MIT-green)
![Built on Handy](https://img.shields.io/badge/built%20on-Handy-8A2BE2)
![Claude MCP](https://img.shields.io/badge/Claude-MCP%20ready-00A4E4)

</div>

**Kiword Listen** is a privacy-first desktop app that turns meetings and lectures into structured, searchable transcripts — entirely on your PC. It captures audio at the **process level** (only Zoom, Teams, or your browser — never your email pings), recognizes **who is speaking** with an on-device voiceprint engine, and lets Claude act as your real-time meeting assistant through a **local MCP server**. No audio, transcript, or voiceprint ever leaves your machine.

> *"The on-device auditory intelligence for your AI agents. 100% private, zero-cloud."*

Kiword Listen is built on top of [Handy](https://github.com/cjpais/Handy), the open-source offline speech-to-text project, and extends it with process-loopback capture, speaker recognition, AI-agent integration, and meeting/lecture workflows.

## Why Kiword Listen?

| | Kiword Listen | Cloud meeting bots |
| --- | --- | --- |
| Audio leaves your PC | **Never** | Always |
| Bot joins your call | **No** — pure local capture | Yes, visible to everyone |
| Virtual audio drivers | **Not required** (native WASAPI loopback) | Often required |
| Speaker recognition | **On-device** voiceprints | Uploaded to cloud |
| Works offline | **Yes** | No |
| AI assistant access | **Local MCP server** for Claude | Vendor-locked |

## Core Features

### Process-Level Audio Capture (Windows Native)

- Captures sound from a **specific application** — `Zoom.exe`, `Teams.exe`, `Chrome.exe`, `Spotify.exe` and more — using the native **WASAPI Process Loopback** API (Windows 10 Build 20348+ / Windows 11).
- No third-party virtual audio cables, no drivers to install. It works out of the box.
- System noise is automatically isolated: notifications and ringtones never leak into your transcript.

### Meeting & Lecture Modes

- **Meeting mode**: record your microphone and the meeting app simultaneously; speakers are separated automatically.
- **Lecture mode**: record a browser or system audio for hours of single-speaker talks, with automatic Markdown chaptering by silence and semantics.

### On-Device Speaker Recognition (Voice ID)

- A lightweight local embedding engine distinguishes `Speaker 1`, `Speaker 2`, … in real time.
- Rename a speaker once (e.g. "Alex") and the voiceprint is stored in a local SQLite database — every future meeting, Alex is labeled automatically via cosine-similarity matching.

### Structured Transcripts & One-Click Export

- Speaker-labeled, timestamped transcript paragraphs.
- Three always-visible copy formats:
  - **Clean Text** — pure prose, no timestamps or symbols.
  - **Markdown** — `**Alex**: text`, ready for Notion / Obsidian.
  - **HTML** — lightly styled rich text for Gmail / Outlook / Word.

### Local History with Instant Search

- Every session is stored locally and listed by date, duration, type, and participants.
- Full-text keyword search with highlighting, powered by **SQLite FTS5**.
- Delete single sessions or batch-clean cached audio to reclaim disk space.

### Claude Integration via Local MCP Server

Kiword Listen ships a local MCP server (`kiword-mcp-server.exe`, stdio protocol). A **"One-Click Connect to Claude Desktop"** button writes the config into `%APPDATA%\Claude\claude_desktop_config.json` for you.

Tools exposed to Claude and other AI agents:

| Tool | Description |
| --- | --- |
| `get_live_transcript` | Pull the last N minutes of cleaned transcript during a live meeting for real-time advice. |
| `get_active_participants` | Get voiceprint-bound participants (name, email, speaking time). |
| `send_meeting_email` | Send a Claude-drafted follow-up email directly from the meeting context. |
| `sync_tasks_and_events` | Push action items to Google Tasks; create follow-up events in Google Calendar. |

### Google Workspace Sync

- **Contacts**: type a few letters while renaming a speaker and pick from your Google Contacts; the voiceprint is bound to that person's email.
- **Tasks**: send extracted action items to Google Tasks in one click.
- **Calendar**: running sessions pick up the current Google Calendar event as the transcript title.

### Live Bilingual Subtitles (Coming Soon)

- Always-on-top, borderless HUD at the bottom of your screen (`Ctrl + Shift + L` to toggle).
- Foreign-language original on top, your language highlighted below. End-to-end latency under 1 second.
- Adjustable opacity and font size.

## Privacy by Design

- 100% on-device processing: transcription via local Whisper/Parakeet models accelerated by **ONNX Runtime (DirectML)** — NVIDIA, AMD, and Intel GPUs/NPUs supported.
- Audio, transcripts, and voiceprint vectors stay in `%LOCALAPPDATA%\kiword\data\`.
- Designed for ≤ 20% CPU and ≤ 1.5 GB RAM on mainstream laptops.
- The app proudly states: *"100% On-Device Processing. No audio leaves this PC."*

## Roadmap

- [x] Monorepo based on the Handy upstream core
- [ ] **Phase 1** — WASAPI process-loopback capture, local Whisper transcription, Markdown/HTML export, history UI
- [ ] **Phase 2** — Voice ID with SQLite voiceprint persistence, Local MCP Server for Claude Desktop, Google Contacts sync
- [ ] **Phase 3** — Claude-driven email & task automation, live bilingual subtitle overlay, Founders Club beta

## Availability

Kiword Listen is a commercial product built on open-source foundations:

- **14-day full-featured free trial**, no credit card required.
- **Kiword Pro ($99/year)** unlocks process-level capture, Voice ID, Google sync, MCP server, live subtitles, and unlimited meeting/lecture sessions.
- Early supporters can join the **Founders Club** on [kiword.top](https://www.kiword.top/).

See the [website](https://www.kiword.top/) for details and downloads.

## Development

This repository is a monorepo:

```
.
├── handy_core/     # Upstream Handy core — Rust + Tauri transcription engine (kept close to upstream)
└── src/listen/     # Kiword Listen product UI and business logic
```

Prerequisites: [Rust](https://rustup.rs/) (latest stable) and [Bun](https://bun.sh/).

```bash
cd handy_core
bun install
bun run tauri dev
```

For platform-specific build instructions, see [handy_core/BUILD.md](handy_core/BUILD.md).

## Credits & Attribution

Kiword Listen is built on [Handy](https://github.com/cjpais/Handy) by [cjpais](https://github.com/cjpais) and its contributors — an excellent open-source, offline speech-to-text foundation. The upstream engine in `handy_core/` retains Handy's MIT license (see [handy_core/LICENSE](handy_core/LICENSE)). Per Handy's licensing terms, the Handy name and brand assets are not open source; Kiword Listen is independently branded and is not endorsed by the Handy project.

Standing on the shoulders of:

- [Whisper](https://github.com/openai/whisper) (OpenAI) and [whisper.cpp](https://github.com/ggml-org/whisper.cpp) / ggml — local speech recognition
- [Silero VAD](https://github.com/snakers4/silero-vad) — voice activity detection
- [Tauri](https://tauri.app/) — the Rust-based app framework

## License

The upstream core (`handy_core/`) is MIT-licensed — see [handy_core/LICENSE](handy_core/LICENSE). Kiword Listen product terms and licensing are described on [kiword.top](https://www.kiword.top/).
