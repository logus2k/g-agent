# g-agent Developer SDK

A lightweight web interface for conversational agent infrastructure (LLM, STT, TTS).

## Features

- Clean, modern chat interface
- Real-time streaming responses with markdown support
- Speech-to-text voice recording (foundation)
- Configurable agent settings (persisted to localStorage)
- WebSocket support for streaming via Socket.IO
- Health checks and service info endpoints
- Docker containerization ready

## Project Structure

```
.
├── app.js                      # Express server
├── package.json                # Node dependencies
├── Dockerfile                  # Container image
├── docker-compose.yml          # Local deployment config
├── README.md                   # This file
├── public/
│   └── index.html              # Main client page
├── script/
│   ├── agentClient.js          # Socket.IO agent client
│   ├── llm-bridge.js           # LLM integration
│   ├── audioResampler.js       # Audio resampling for STT
│   ├── recorder.worklet.js     # Audio worklet processor
│   └── router-listener.js      # Router message handler
└── library/
    ├── socket.io.min.js        # WebSocket library
    ├── marked.min.js           # Markdown parser
    ├── purify.min.js           # HTML sanitizer
    └── highlight.min.js        # Code syntax highlighter
```

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server (port 6677)
npm run dev

# Open in browser
# http://localhost:6677
```

### Docker Deployment

```bash
# Build and run with docker-compose
docker-compose up --build

# Or manually:
docker build -t g-agent .
docker run -p 6677:6677 g-agent
```

### Production with Nginx

Add to your nginx config (similar to your Gaia setup):

```nginx
location = /agent { return 301 /agent/; }

location ^~ /agent/ {
    proxy_pass http://host.docker.internal:6677/;
    proxy_http_version 1.1;
    
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection upgrade;
    proxy_set_header Origin $http_origin;
    
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    proxy_read_timeout 600s;
    proxy_send_timeout 600s;
    proxy_buffering off;
}
```

Then access at: `http://localhost:6677`

## Configuration

### Environment Variables

Set in `.env` or docker-compose.yml:

```bash
NODE_ENV=production          # development or production
PORT=6677                    # Server port
HOST=0.0.0.0                 # Bind address
LLM_URL=https://logus2k.com/llm     # Your LLM service
STT_URL=https://logus2k.com/stt     # Your STT service
TTS_URL=https://logus2k.com/tts     # Your TTS service
```

### Client Settings

Settings are accessible via the ⚙️ button in the top right:

- **LLM Server URL**: Agent service endpoint (defaults to current origin)
- **Agent Name**: Identifier for your agent (default: `ml`)
- **STT Server URL**: Speech-to-Text service (for voice recording)
- **TTS Enabled**: Toggle Text-to-Speech audio responses

Settings persist to browser localStorage.

## API Endpoints

### Health Check
```
GET /health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "uptime": 3600.5
}
```

### Service Info
```
GET /api/info
```

Returns:
```json
{
  "name": "Generic Conversational Agent",
  "version": "1.0.0",
  "services": {
    "llm": "https://logus2k.com/llm",
    "stt": "https://logus2k.com/stt",
    "tts": "https://logus2k.com/tts"
  }
}
```

## Agent Communication

The client communicates with your agent services via:

1. **LLM Agent** (port 7701)
   - WebSocket: `/llm/socket.io/` 
   - Handles chat messages and streaming responses
   - Protocol: Socket.IO events (`Chat`, `ChatChunk`, `ChatDone`, `Error`)

2. **STT Service** (port 2700)
   - WebSocket: `/stt/socket.io/`
   - Handles speech-to-text transcription
   - Returns interim and final transcripts

3. **TTS Service** (port 7700)
   - WebSocket: `/tts/socket.io/`
   - Handles text-to-speech audio generation
   - Streams audio responses

## Voice Recording Setup

The application includes voice recording infrastructure using Web Audio API:

- `AudioWorkletProcessor` for real-time audio capture
- Linear interpolation resampling to 16kHz PCM16
- Integration point ready for your STT server

To activate voice features, configure the STT URL in settings.

## Debugging

Browser console integration:
```javascript
// In browser console
window.agent  // Access the agent instance
agent.send("test message")  // Send directly
agent.client  // Access Socket.IO client
```

Check server logs:
```bash
docker logs g-agent
```

Health status:
```bash
curl http://localhost:6677/health
```

## File Locations

When deploying, ensure this directory structure:

```
/path/to/app/
├── app.js
├── package.json
├── public/index.html
├── script/
│   ├── agentClient.js
│   ├── llm-bridge.js
│   ├── audioResampler.js
│   ├── recorder.worklet.js
│   └── router-listener.js
└── library/
    ├── socket.io.min.js
    ├── marked.min.js
    ├── purify.min.js
    └── highlight.min.js
```

If deploying to production, copy the library and script directories into the appropriate folders.

## Dependencies

- **express**: Web framework
- **compression**: HTTP compression middleware
- **socket.io-client**: WebSocket communication (browser only, loaded from library)
- **marked**: Markdown parsing (browser only, loaded from library)
- **DOMPurify**: HTML sanitization (browser only, loaded from library)
- **highlight.js**: Code syntax highlighting (browser only, loaded from library)

## Notes

- Uses ES6 modules (`import`/`export`)
- Requires Node.js >= 18.0.0
- Automatic service health checks when running in Docker
- Graceful shutdown on SIGTERM/SIGINT

## License

MIT
