# Copilot Ollama Bridge

A VS Code extension that exposes GitHub Copilot through Ollama-compatible API endpoints using VS Code's official Language Model API.

## ✨ Features

- **🔗 Ollama-Compatible API**: Drop-in replacement for Ollama
- **🤖 GitHub Copilot Integration**: Uses VS Code's official Language Model API
- **🔐 Automatic Authentication**: No manual token extraction needed
- **🌐 OpenAI-Compatible API**: Support for `/v1/chat/completions` endpoint
- **🌊 Streaming Support**: Real-time streaming responses with SSE
- **📊 Real-time Status**: Status bar integration with server status
- **📝 Request Logging**: Output channel with detailed request logging
- **⚙️ Configurable**: Customizable port and auto-start settings
- **🔧 CORS Enabled**: Cross-origin requests supported for web applications

## 📋 Requirements

- VS Code 1.84.0 or higher
- GitHub Copilot extension installed and authenticated
- Active GitHub Copilot subscription

## 🚀 Quick Setup

1. **Install dependencies**:
   ```bash
   cd copilot-ollama-bridge
   npm install
   ```

2. **Compile TypeScript**:
   ```bash
   npm run compile
   ```

3. **Install extension**:
   - Open this folder in VS Code
   - Press `F5` to launch Extension Development Host
   - Or package: `npx vsce package` then install the `.vsix` file

4. **Configure Tools**:
   - **For Copilot Bridge**: `http://localhost:11435`
   - **For regular Ollama**: `http://localhost:11434` (for embeddings, etc.)
   - Model: `copilot:latest`

## 📡 API Endpoints

### GET /api/tags
List available models

```bash
curl http://localhost:11435/api/tags
```

### POST /api/generate
Generate text completions

```bash
curl -X POST http://localhost:11435/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"copilot:latest","prompt":"def fibonacci(n):"}'
```

### POST /api/chat
Chat-style completions

```bash
curl -X POST http://localhost:11435/api/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"copilot:latest","messages":[{"role":"user","content":"Write a function"}]}'
```

## 🌐 OpenAI-Compatible Endpoints

### POST /v1/chat/completions
OpenAI-compatible chat completions with streaming support

```bash
# Non-streaming request
curl -X POST http://localhost:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "model": "copilot:latest",
    "messages": [
      {"role": "system", "content": "You are a helpful assistant."},
      {"role": "user", "content": "Hello, how are you?"}
    ],
    "stream": false
  }'

# Streaming request
curl -X POST http://localhost:11435/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer dummy-token" \
  -d '{
    "model": "copilot:latest",
    "messages": [
      {"role": "user", "content": "Tell me a joke"}
    ],
    "stream": true,
    "stream_options": {"include_usage": true}
  }'
```

**Features:**
- ✅ OpenAI API format compatibility
- ✅ Streaming and non-streaming responses
- ✅ Complex message content support (text arrays)
- ✅ Usage statistics with `stream_options.include_usage`
- ✅ CORS support for web applications
- ✅ Works with any OpenAI-compatible client

## ⚙️ Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `copilot-bridge.port` | `11435` | Server port (Copilot Bridge default) |
| `copilot-bridge.autoStart` | `true` | Auto-start on VS Code startup |

## 🎮 Commands

- **Start Copilot Bridge Server** - Start the API server
- **Stop Copilot Bridge Server** - Stop the API server  
- **Restart Copilot Bridge Server** - Restart the API server

## 📊 Monitoring

- **Status Bar**: Shows current server status and port
- **Output Channel**: View detailed request logs in "Copilot Bridge" channel
- **Web Interface**: Visit `http://localhost:11435` for status and documentation

## 🔧 Usage with Tools

### Cline/Claude Dev
1. Set Ollama URL: `http://localhost:11435`
2. Select model: `copilot:latest`

### Obsidian with OpenAI-Compatible Plugins
For Obsidian plugins that expect OpenAI API endpoints:
1. Set API URL: `http://localhost:11435/v1/chat/completions`
2. Use any dummy API key (the bridge doesn't require authentication)
3. Select model: `copilot:latest` or `test`

### Other Ollama Clients
Any tool that supports Ollama can use this bridge as a drop-in replacement.

### OpenAI-Compatible Applications
Any application that uses the OpenAI API format can connect to:
- Base URL: `http://localhost:11435/v1`
- API Key: Not required (use any dummy value)
- Supported models: `copilot:latest`, `copilot:gpt-4o`, `copilot:gpt-4`, etc.

## 🔍 Troubleshooting

### "No Copilot models available"
1. Ensure GitHub Copilot extension is installed
2. Sign in to GitHub Copilot in VS Code
3. Verify your Copilot subscription is active
4. Run command: `GitHub Copilot: Sign In`

### Port Already in Use
1. Check if Ollama is running: `ps aux | grep ollama`
2. Stop Ollama: `killall ollama`
3. Or change port in extension settings

### API Errors
- Check "Copilot Bridge" output channel for detailed logs
- Verify Copilot quota hasn't been exceeded
- Try refreshing GitHub authentication

### CORS Issues with Web Applications
If you're getting CORS errors from web applications (like Obsidian):
1. Ensure the extension is running (check status bar)
2. Verify the correct port is being used (default: 11435)
3. Check that the Authorization header is properly formatted
4. Try restarting the Copilot Bridge Server

### OpenAI Endpoint Not Working
1. Verify you're using the correct endpoint: `/v1/chat/completions`
2. Ensure the request includes proper Content-Type header
3. Check that the extension server is running (not regular Ollama)
4. Review request format matches OpenAI API specification

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────┐
│ Ollama Clients  │───▶│                  │───▶│                 │───▶│              │
│ (Cline, etc.)   │    │                  │    │   VS Code       │    │   GitHub     │
├─────────────────┤    │  Copilot-Ollama  │    │   Language      │    │   Copilot    │
│ OpenAI Clients  │───▶│     Bridge       │───▶│   Model API     │───▶│   Service    │
│ (Obsidian, etc.)│    │                  │    │                 │    │              │
└─────────────────┘    └──────────────────┘    └─────────────────┘    └──────────────┘
                              │
                              ▼
                       ┌──────────────────┐
                       │  Unified Response│
                       │  (Ollama/OpenAI) │
                       └──────────────────┘
```

The extension acts as a universal bridge, translating both Ollama and OpenAI API requests to VS Code's Language Model API calls and formatting responses back to the appropriate format.

**Supported API Formats:**
- 🦙 **Ollama API**: `/api/tags`, `/api/generate`, `/api/chat`
- 🤖 **OpenAI API**: `/v1/chat/completions` with streaming support

## 🔄 Why This Approach?

| Aspect | Manual Token Extraction | VS Code Extension |
|--------|------------------------|-------------------|
| Authentication | ❌ Brittle, OS-dependent | ✅ Official API |
| User Consent | ❌ Bypassed | ✅ Proper dialogs |
| Quota Limits | ❌ Ignored | ✅ Respected |
| Reliability | ❌ Token hunting | ✅ Stable API |
| Maintenance | ❌ High | ✅ Low |

## 📄 License

MIT License
