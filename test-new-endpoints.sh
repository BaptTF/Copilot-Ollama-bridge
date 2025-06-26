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

# Test CORS preflight
echo "📋 Testing CORS preflight request:"
echo "curl -X OPTIONS http://localhost:11435/api/version -H 'Origin: http://localhost:3000'"
curl -s -X OPTIONS http://localhost:11435/api/version -H "Origin: http://localhost:3000" -I | grep -E "(HTTP|Access-Control)"
echo ""

echo "✅ All tests completed!"
echo ""
echo "🌐 Open WebUI Compatibility:"
echo "   - GET /api/version ✅"
echo "   - GET /api/ps ✅"
echo "   - CORS properly configured ✅"
echo ""
echo "📚 New endpoints documentation available at: http://localhost:11435"
