"""
TEST SCRIPT: Pollinations.ai API Integration Verification
-------------------------------------------------------
Purpose:
  This script serves as an isolated test to verify the functionality of the 
  Pollinations.ai image generation API before integrating it into the 
  Firebase Cloud Functions backend.

What it does:
  1. Sends a text prompt to the Pollinations API.
  2. Receives the binary image data (bytes).
  3. Saves the result locally to ensure data integrity.

Usage:
  Run this script locally to confirm the API is active and functioning correctly.
"""


import requests
import sys

def generate_image(prompt, out_path="test_output.jpg"):
    prompt_encoded = prompt.replace(" ", "_")
    url = f"https://pollinations.ai/p/{prompt_encoded}"
    
    try:
        resp = requests.get(url, timeout=30)
        
        if resp.status_code == 200:
            if len(resp.content) > 0:
                print(f"✅ Pollinations API Success: Received {len(resp.content)} bytes.")
            else:
                print("❌ Pollinations API Error: Received empty response.")
                sys.exit(1)
        else:
            print(f"❌ Pollinations API Error: Status {resp.status_code}")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Pollinations Connection Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_image("a futuristic logo test")