"""
TEST SCRIPT: Pollinations.ai API Integration Verification
"""
import requests
import sys
import time

def generate_image(prompt):
    prompt_encoded = prompt.replace(" ", "%20")
    
    url = f"https://image.pollinations.ai/prompt/{prompt_encoded}?nologo=true"
    
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    print(f"Testing URL: {url}")

    try:
        resp = requests.get(url, headers=headers, timeout=60)
        
        if resp.status_code == 200:
            if len(resp.content) > 0:
                print(f"✅ Pollinations API Success: Received {len(resp.content)} bytes.")
            else:
                print("❌ Pollinations API Error: Received empty response.")
                sys.exit(1)
        
        else:
            print(f"❌ Pollinations API Error: Status {resp.status_code}")
            print(f"Response Text: {resp.text[:200]}")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Pollinations Connection Failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    generate_image("minimalist vector logo")