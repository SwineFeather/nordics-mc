curl https://api.x.ai/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer xai-mAYQCOyF28KXu1bePNLiPgtdNfIWgTEw1nddojyASc1tMEEgs22upLOY5KgvA5YXNk4NFiA5zmE6lE7i" \
-d '{
  "messages": [
    {
      "role": "user",
      "content": "What is the meaning of life, the universe, and everything?"
    }
  ],
  "model": "grok-3-latest",
  "stream": false,
  "temperature": 0.7
}'