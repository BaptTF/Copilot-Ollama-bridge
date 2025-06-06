# Manual Installation Guide for Copilot Ollama Bridge

## 📋 Prerequisites

1. **Node.js and npm** installed on your system
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

2. **VS Code** installed
   - Download from: https://code.visualstudio.com/
   - Verify: `code --version`

3. **GitHub Copilot extension** installed and authenticated in VS Code

## 🔧 Step-by-Step Manual Installation

### Step 1: Navigate to Extension Directory
```bash
cd copilot-ollama-bridge
```

### Step 2: Install Dependencies
```bash
npm install
```

This will install the TypeScript compiler and VS Code extension types.

### Step 3: Compile TypeScript
```bash
npm run compile
```

This compiles `src/extension.ts` to `out/extension.js`.

### Step 4: Install VS Code Extension Manager (if not already installed)
```bash
npm install -g @vscode/vsce
```

### Step 5: Package the Extension
```bash
npx vsce package
```

This creates a `.vsix` file (e.g., `copilot-ollama-bridge-1.0.0.vsix`).

### Step 6: Install Extension in VS Code

#### Option A: Command Line
```bash
code --install-extension copilot-ollama-bridge-1.0.0.vsix
```

#### Option B: VS Code GUI
1. Open VS Code
2. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
3. Type "Extensions: Install from VSIX..."
4. Select the generated `.vsix` file
5. Click "Install"

### Step 7: Restart VS Code
Close and reopen VS Code to activate the extension.

### Step 8: Verify Installation
1. Check the status bar for a 🤖 icon (indicating the bridge status)
2. Open Command Palette (`Ctrl+Shift+P`)
3. Look for commands starting with "Copilot Bridge"

## ⚙️ Configuration

### Auto-Start (Default)
The extension will automatically start the bridge server on VS Code startup.

### Manual Control
Use these commands in the Command Palette:
- `Start Copilot Bridge Server`
- `Stop Copilot Bridge Server`
- `Restart Copilot Bridge Server`

### Settings
Go to VS Code Settings and search for "copilot-bridge":
- `copilot-bridge.port`: Server port (default: 11434)
- `copilot-bridge.autoStart`: Auto-start on startup (default: true)

## 🧪 Testing the Installation

### Check Server Status
1. Look for 🤖 icon in VS Code status bar
2. Should show "Copilot Bridge:11434" when running

### Test API Endpoints
```bash
# Test from terminal
curl http://localhost:11434/api/tags

# Or run the test script
./test-api.sh
```

### Check Logs
1. Open VS Code Output panel (`View > Output`)
2. Select "Copilot Bridge" from the dropdown
3. You should see server startup messages

## 🔧 Configure Cline

Once the extension is running:

1. **Open Cline Settings**
2. **Set Ollama URL**: `http://localhost:11434`
3. **Set Model**: `copilot:latest`
4. **Test**: Try sending a message to Cline

## 🔍 Troubleshooting

### Extension Not Loading
- Check VS Code Output > "Copilot Bridge" for error messages
- Ensure GitHub Copilot extension is installed and authenticated
- Try restarting VS Code

### Port Already in Use
- Check if Ollama is running: `ps aux | grep ollama`
- Stop Ollama: `killall ollama`
- Or change port in VS Code settings

### API Not Responding
- Check status bar icon (should show green play button)
- Check Output panel for error messages
- Try restarting the bridge: Command Palette > "Restart Copilot Bridge Server"

### "No Copilot models available"
1. Open Command Palette
2. Run "GitHub Copilot: Sign In"
3. Follow authentication prompts
4. Restart the bridge

## 📊 Monitoring

- **Status Bar**: Real-time server status
- **Output Channel**: Detailed request logs
- **Web Interface**: Visit `http://localhost:11434` for documentation

## 🚀 Development Mode (Alternative)

Instead of packaging, you can run in development mode:

1. Open the `copilot-ollama-bridge` folder in VS Code
2. Press `F5` to launch Extension Development Host
3. A new VS Code window opens with the extension loaded
4. Use this window for testing

## ✅ Success Indicators

You'll know it's working when:
- 🤖 icon appears in VS Code status bar
- `curl http://localhost:11434/api/tags` returns model list
- Cline can connect and generate responses
- Output channel shows request logs

## 🆘 Getting Help

If you encounter issues:
1. Check the "Copilot Bridge" output channel in VS Code
2. Verify GitHub Copilot subscription is active
3. Ensure VS Code Language Model API access is enabled
4. Try the test script: `./test-api.sh`
