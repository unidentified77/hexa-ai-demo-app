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

client = groq.Groq(api_key="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")

chat = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Maximum 500 words, 1 sentence, Create a detailed logo concept that evokes a Monogram, Abstract, Mascot, Minimal or Vintage style; clean-lined, creative, vector-style, high-contrast logo with a strong symbolic focus."}]
)

print(chat.choices[0].message.content)
