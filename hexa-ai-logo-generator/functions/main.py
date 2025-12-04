from firebase_functions import firestore_fn, https_fn, options
from firebase_admin import initialize_app, firestore, storage
import requests
import io
from PIL import Image
import random
import groq # Groq importu
import os

# --- AYARLAR ---
POLLINATIONS_BASE = "https://image.pollinations.ai/prompt"
# Güvenlik için API Key'i environment variable olarak saklamak en iyisidir, 
# ama şimdilik senin koduna göre buraya koyuyorum.
GROQ_API_KEY = "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"

initialize_app(options={
    'storageBucket': 'hexaai-63ae8.firebasestorage.app'
})

# --- YENİ EKLENEN FONKSİYON: SURPRISE ME (Prompt Üretici) ---
@https_fn.on_call(memory=options.MemoryOption.MB_256)
def generate_creative_prompt(req: https_fn.CallableRequest):
    """
    Frontend'den çağrılır, Groq kullanarak yaratıcı bir logo promptu döner.
    """
    try:
        client = groq.Groq(api_key=GROQ_API_KEY)
        
        # Kullanıcıdan gelen bir stil varsa onu da hesaba katabiliriz (isteğe bağlı)
        # style = req.data.get("style", "Abstract") 
        
        system_instruction = (
            "Maximum 30 words. 1 sentence. Create a detailed, creative logo concept description. "
            "Focus on visual elements, colors, and mood. Do not include introductory text like 'Here is a logo'."
        )

        chat = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": system_instruction}]
        )

        generated_text = chat.choices[0].message.content
        
        # Tırnak işaretlerini temizleyelim
        clean_prompt = generated_text.replace('"', '').strip()

        return {"prompt": clean_prompt}

    except Exception as e:
        print(f"Groq Error: {e}")
        # Hata olursa default bir prompt dönelim ki uygulama çökmesin
        return {"prompt": "A futuristic geometric hexagon logo with neon blue glowing edges."}


# --- MEVCUT FONKSİYON: RESİM ÜRETİCİ (Aynı kalıyor) ---
def query_pollinations(prompt, width=512, height=512, seed=None, nologo=True):
    # ... (Buradaki kodların aynen kalacak) ...
    prompt_encoded = requests.utils.quote(prompt, safe="")
    url = f"{POLLINATIONS_BASE}/{prompt_encoded}?width={width}&height={height}"
    if seed is not None: url += f"&seed={seed}"
    if nologo: url += "&nologo=true"
    print(f"📸 Pollinations API request -> {url}")
    resp = requests.get(url)
    if resp.status_code == 200: return resp.content
    else: raise Exception(f"Pollinations API Error {resp.status_code}: {resp.text}")

@firestore_fn.on_document_created(
    document="artifacts/default-hexa-app/users/{userId}/jobs/{jobId}", # BURAYI KENDİ PROJE ID'NE GÖRE GÜNCELLEMEYİ UNUTMA
    timeout_sec=300,
    memory=options.MemoryOption.GB_1
)
def process_generation_job(event: firestore_fn.Event[firestore_fn.DocumentSnapshot]) -> None:
    # ... (Buradaki kodların aynen kalacak, önceki kodunla aynı) ...
    pass