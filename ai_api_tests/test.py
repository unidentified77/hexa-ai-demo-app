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
