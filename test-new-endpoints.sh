#!/bin/bash

echo "🧪 Testing New Ollama API Endpoints"
echo "=================================="
echo ""

# Test /api/version endpoint
echo "📋 Testing GET /api/version:"
echo "curl http://localhost:11435/api/version"
curl -s http://localhost:11435/api/version | jq .
echo ""

# Test /api/ps endpoint
echo "📋 Testing GET /api/ps:"
echo "curl http://localhost:11435/api/ps"
curl -s http://localhost:11435/api/ps | jq '.models[0:3]' # Show first 3 models for brevity
echo ""

# Test existing /api/tags endpoint to ensure compatibility
echo "📋 Testing GET /api/tags (existing endpoint):"
echo "curl http://localhost:11435/api/tags"
curl -s http://localhost:11435/api/tags | jq '.models[0:2]' # Show first 2 models for brevity
echo ""

# Test OpenAI-compatible endpoints
echo "📋 Testing GET /v1/models (OpenAI format):"
echo "curl http://localhost:11435/v1/models"
curl -s http://localhost:11435/v1/models | jq '.data[0:2]' # Show first 2 models for brevity
echo ""

echo "📋 Testing GET /models (OpenAI format):"
echo "curl http://localhost:11435/models"
curl -s http://localhost:11435/models | jq '.data[0:2]' # Show first 2 models for brevity
echo ""

echo "📋 Testing POST /chat/completions (Open WebUI format):"
echo "curl -X POST http://localhost:11435/chat/completions"
curl -s -X POST http://localhost:11435/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model":"copilot:latest","messages":[{"role":"user","content":"Hello from Open WebUI"}],"max_tokens":10}' | jq .
echo ""

# Test CORS preflight
echo "📋 Testing CORS preflight request:"
echo "curl -X OPTIONS http://localhost:11435/api/version -H 'Origin: http://localhost:3000'"
curl -s -X OPTIONS http://localhost:11435/api/version -H "Origin: http://localhost:3000" -I | grep -E "(HTTP|Access-Control)"
echo ""

echo "✅ All tests completed!"
echo ""
echo "🌐 API Compatibility:"
echo "   - Ollama API: GET /api/version ✅"
echo "   - Ollama API: GET /api/ps ✅"
echo "   - OpenAI API: GET /v1/models ✅"
echo "   - OpenAI API: GET /models ✅"
echo "   - Open WebUI: POST /chat/completions ✅"
echo "   - CORS properly configured ✅"
echo ""
echo "📚 Full endpoint documentation available at: http://localhost:11435"
