import groq

client = groq.Groq(api_key="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")

chat = client.chat.completions.create(
    model="llama-3.3-70b-versatile",
    messages=[{"role": "user", "content": "Maximum 500 words, 1 sentence, Create a detailed logo concept that evokes a Monogram, Abstract, Mascot, Minimal or Vintage style; clean-lined, creative, vector-style, high-contrast logo with a strong symbolic focus."}]
)

print(chat.choices[0].message.content)
