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

def generate_image(prompt, out_path="output.jpg"):
    # prompt içerisindeki boşlukları URL-safe hâle getir
    prompt_encoded = prompt.replace(" ", "_")
    url = f"https://pollinations.ai/p/{prompt_encoded}"
    resp = requests.get(url)
    if resp.status_code == 200:
        with open(out_path, "wb") as f:
            f.write(resp.content)
        print("Image downloaded to", out_path)
    else:
        print("Error:", resp.status_code, resp.text)

if __name__ == "__main__":
    prompt = "a beautiful landscape with mountains and rivers at sunset"
    generate_image(prompt, "landscape.jpg")
