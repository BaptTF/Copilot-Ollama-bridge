#!/bin/bash

echo "🧪 Testing Copilot Ollama Bridge API"
echo "===================================="

BASE_URL="http://localhost:11434"

# Check if server is running
echo "📡 Checking if server is running..."
if ! curl -s "$BASE_URL" > /dev/null; then
    echo "❌ Server is not running on $BASE_URL"
    echo "   Please start the Copilot Bridge extension in VS Code"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Test /api/tags endpoint
echo "🏷️  Testing /api/tags endpoint..."
echo "curl $BASE_URL/api/tags"
curl -s "$BASE_URL/api/tags" | jq '.' 2>/dev/null || curl -s "$BASE_URL/api/tags"
echo ""
echo ""

# Test /api/generate endpoint
echo "🤖 Testing /api/generate endpoint..."
echo "curl -X POST $BASE_URL/api/generate -d '{\"model\":\"copilot:latest\",\"prompt\":\"def hello_world():\",...}'"
curl -s -X POST "$BASE_URL/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"model":"copilot:latest","prompt":"def hello_world():","stream":false}' | \
  jq '.' 2>/dev/null || curl -s -X POST "$BASE_URL/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"model":"copilot:latest","prompt":"def hello_world():","stream":false}'
echo ""
echo ""

# Test /api/chat endpoint
echo "💬 Testing /api/chat endpoint..."
echo "curl -X POST $BASE_URL/api/chat -d '{\"model\":\"copilot:latest\",\"messages\":[...]}'"
curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"model":"copilot:latest","messages":[{"role":"user","content":"Write a simple Python function"}],"stream":false}' | \
  jq '.' 2>/dev/null || curl -s -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{"model":"copilot:latest","messages":[{"role":"user","content":"Write a simple Python function"}],"stream":false}'
echo ""
echo ""

echo "✅ API tests completed!"
echo ""
echo "💡 Tips:"
echo "  • Check VS Code 'Copilot Bridge' output channel for detailed logs"
echo "  • Visit $BASE_URL in your browser for documentation"
echo "  • Use 'copilot:latest' as the model name in Cline"
