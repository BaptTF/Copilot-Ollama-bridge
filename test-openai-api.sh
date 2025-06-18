#!/bin/bash

echo "🧪 Testing OpenAI-compatible /v1/chat/completions endpoint"
echo "========================================================="

# Test the exact request format from the Obsidian plugin
curl 'http://localhost:11435/v1/chat/completions' \
  -H 'authorization: Bearer' \
  -H 'accept: application/json' \
  -H 'content-type: application/json' \
  --data-raw '{
  "model": "copilot:latest",
  "tools": [],
  "messages": [
    {
      "role": "system",
      "content": "You are an intelligent assistant to help answer any questions that the user has, particularly about editing and organizing markdown files in Obsidian.\n\n1. Please keep your response as concise as possible. Avoid being verbose.\n\n2. Do not lie or make up facts.\n\n3. Format your response in markdown.\n\n4. Respond in the same language as the user'\''s message."
    },
    {
      "role": "user",
      "content": "test"
    }
  ],
  "stream": false
}'

echo -e "\n\n🌊 Testing with streaming enabled..."
echo "===================================="

curl 'http://localhost:11435/v1/chat/completions' \
  -H 'authorization: Bearer' \
  -H 'accept: application/json' \
  -H 'content-type: application/json' \
  --data-raw '{
  "model": "copilot:latest",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Hello, how are you?"
        }
      ]
    }
  ],
  "stream": true,
  "stream_options": {
    "include_usage": true
  }
}'

echo -e "\n\n✅ OpenAI API endpoint test completed!"
