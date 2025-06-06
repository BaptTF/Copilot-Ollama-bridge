# Copilot Ollama Bridge

A VS Code extension that exposes GitHub Copilot through Ollama-compatible API endpoints using VS Code's official Language Model API.

## ✨ Features

- **🔗 Ollama-Compatible API**: Drop-in replacement for Ollama
- **🤖 GitHub Copilot Integration**: Uses VS Code's official Language Model API
- **🔐 Automatic Authentication**: No manual token extraction needed
- **📊 Real-time Status**: Status bar integration with server status
- **📝 Request Logging**: Output channel with detailed request logging
- **⚙️ Configurable**: Customizable port and auto-start settings

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

4. **Configure Cline**:
   - Ollama URL: `http://localhost:11434`
   - Model: `copilot:latest`

## 📡 API Endpoints

### GET /api/tags
List available models

```bash
curl http://localhost:11434/api/tags
```

### POST /api/generate
Generate text completions

```bash
curl -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"copilot:latest","prompt":"def fibonacci(n):"}'
```

### POST /api/chat
Chat-style completions

```bash
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{"model":"copilot:latest","messages":[{"role":"user","content":"Write a function"}]}'
```

## ⚙️ Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| `copilot-bridge.port` | `11434` | Server port (Ollama default) |
| `copilot-bridge.autoStart` | `true` | Auto-start on VS Code startup |

## 🎮 Commands

- **Start Copilot Bridge Server** - Start the API server
- **Stop Copilot Bridge Server** - Stop the API server  
- **Restart Copilot Bridge Server** - Restart the API server

## 📊 Monitoring

- **Status Bar**: Shows current server status and port
- **Output Channel**: View detailed request logs in "Copilot Bridge" channel
- **Web Interface**: Visit `http://localhost:11434` for status and documentation

## 🔧 Usage with Tools

### Cline/Claude Dev
1. Set Ollama URL: `http://localhost:11434`
2. Select model: `copilot:latest`

### Other Ollama Clients
Any tool that supports Ollama can use this bridge as a drop-in replacement.

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

## 🏗️ Architecture

```
Cline/Client → HTTP Request → VS Code Extension → Language Model API → Copilot → Response
```

The extension acts as a bridge, translating Ollama API requests to VS Code's Language Model API calls and formatting responses back to Ollama format.

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
