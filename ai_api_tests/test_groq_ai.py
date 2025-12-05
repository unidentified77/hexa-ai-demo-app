"""
TEST SCRIPT: Groq API (LLM) Integration Verification
----------------------------------------------------
Purpose:
  This script serves as an isolated test to verify the functionality of the 
  Groq API (using Llama 3) for generating creative logo prompts before 
  integrating the logic into the Firebase Cloud Functions backend.

What it does:
  1. Authenticates with the Groq API client.
  2. Sends a structured prompt to the 'llama-3.3-70b-versatile' model.
  3. Prints the generated creative text response to the console.

Usage:
  Run this script locally to ensure the API Key is valid and the model 
  returns the expected text format.
"""


import groq
import os
import sys

DEFAULT_KEY = "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"
api_key = os.environ.get("GROQ_API_KEY", DEFAULT_KEY)


if not api_key:
    print("❌ Error: GROQ_API_KEY is missing in environment variables.")
    sys.exit(1)

try:
    client = groq.Groq(api_key="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")

    chat = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": "Test prompt: Say 'Hello World' in 3 words."}]
    )
    
    response = chat.choices[0].message.content
    print("✅ Groq API Success:", response)

except Exception as e:
    print(f"❌ Groq API Failed: {e}")
    sys.exit(1)