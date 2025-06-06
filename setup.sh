#!/bin/bash

echo "🚀 Setting up Copilot Ollama Bridge Extension"
echo "============================================="

# Check if Node.js and npm are installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install Node.js and npm first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if VS Code is installed
if ! command -v code &> /dev/null; then
    echo "❌ Error: VS Code is not installed or not in PATH."
    echo "   Please install VS Code first: https://code.visualstudio.com/"
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

if [ $? -ne 0 ]; then
    echo "❌ Failed to compile TypeScript"
    exit 1
fi

echo "✅ Extension compiled successfully"

# Check if vsce is available
if ! command -v vsce &> /dev/null; then
    echo "📥 Installing vsce (VS Code Extension Manager)..."
    npm install -g @vscode/vsce
fi

# Package the extension
echo "📦 Packaging extension..."
npx vsce package

if [ $? -ne 0 ]; then
    echo "❌ Failed to package extension"
    exit 1
fi

# Find the generated .vsix file
VSIX_FILE=$(find . -name "*.vsix" | head -1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ No .vsix file found"
    exit 1
fi

echo "✅ Extension packaged: $VSIX_FILE"

# Install the extension
echo "🔧 Installing extension in VS Code..."
code --install-extension "$VSIX_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup Complete!"
    echo "=================="
    echo ""
    echo "The Copilot Ollama Bridge extension has been installed!"
    echo ""
    echo "Next steps:"
    echo "1. Restart VS Code"
    echo "2. Ensure GitHub Copilot extension is installed and authenticated"
    echo "3. The bridge will auto-start (check status bar for 🤖 icon)"
    echo ""
    echo "📋 Configure Cline:"
    echo "  • Ollama URL: http://localhost:11434"
    echo "  • Model: copilot:latest"
    echo ""
    echo "🎮 Available commands in VS Code:"
    echo "  • Start Copilot Bridge Server"
    echo "  • Stop Copilot Bridge Server"
    echo "  • Restart Copilot Bridge Server"
    echo ""
    echo "🧪 Test the API:"
    echo "  curl http://localhost:11434/api/tags"
    echo ""
    echo "📖 View documentation:"
    echo "  Open http://localhost:11434 in your browser"
    echo ""
    echo "📊 Monitor activity:"
    echo "  Check 'Copilot Bridge' output channel in VS Code"
else
    echo "❌ Failed to install extension automatically."
    echo ""
    echo "📋 Manual installation:"
    echo "  1. Open VS Code"
    echo "  2. Press Ctrl+Shift+P"
    echo "  3. Run 'Extensions: Install from VSIX...'"
    echo "  4. Select: $VSIX_FILE"
fi

echo ""
echo "💡 Tip: If you encounter issues, check the 'Copilot Bridge' output channel in VS Code"
