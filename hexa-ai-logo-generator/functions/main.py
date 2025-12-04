import os
import io
import random
import requests
from PIL import Image
import groq

from firebase_functions import firestore_fn, https_fn, options
from firebase_admin import initialize_app, firestore, storage

# --- YAPILANDIRMA ---
initialize_app(options={
    'storageBucket': 'hexaai-63ae8.firebasestorage.app'
})

POLLINATIONS_BASE = "https://image.pollinations.ai/prompt"

# API Key'i ortam değişkeninden alıyoruz.
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

# --- 1. FONKSİYON: CREATIVE PROMPT GENERATOR (Groq) ---
@https_fn.on_call(memory=options.MemoryOption.MB_256)
def generate_creative_prompt(req: https_fn.CallableRequest):
    """
    Frontend'den tetiklenir. Groq AI kullanarak verilen stilde
    yaratıcı ve detaylı bir logo promptu oluşturur.
    """
    try:
        # Gelen veriyi güvenli şekilde al
        request_data = req.data if req.data else {}
        style = request_data.get("style", "highly detailed")
        
        # API Key kontrolü
        if not GROQ_API_KEY:
            print("❌ HATA: GROQ_API_KEY ortam değişkeni bulunamadı.")
            raise ValueError("GROQ API Key missing configuration.")

        client = groq.Groq(api_key=GROQ_API_KEY)
    
        system_instruction = (
            f"Create a detailed, creative logo concept description in the **{style} style**. "
            "Maximum 30 words. 1 sentence. Focus on visual elements, colors, and mood. "
            "Do not include introductory text like 'Here is a logo'."
        )
       
        chat = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": system_instruction}]
        )
       
        generated_text = chat.choices[0].message.content
        clean_prompt = generated_text.replace('"', '').strip()
        
        return {"prompt": clean_prompt}
    
    except Exception as e:
        print(f"⚠️ Groq Error: {e}")
        # Hata durumunda sistemin durmaması için varsayılan bir prompt
        return {"prompt": "A futuristic geometric hexagon logo with neon blue glowing edges."}


# --- YARDIMCI FONKSİYON: RESİM İNDİRME ---
def query_pollinations(prompt, width=512, height=512, seed=None, nologo=True):
    """Pollinations.ai API'sine istek atar ve resim verisini (bytes) döner."""
    prompt_encoded = requests.utils.quote(prompt, safe="")
    url = f"{POLLINATIONS_BASE}/{prompt_encoded}?width={width}&height={height}"
    
    if seed is not None:
        url += f"&seed={seed}"
    if nologo:
        url += "&nologo=true"
        
    print(f"📸 Pollinations API Request -> {url}")
    
    resp = requests.get(url)
    if resp.status_code == 200:
        return resp.content
    else:
        raise Exception(f"Pollinations API Error {resp.status_code}: {resp.text}")


# --- 2. FONKSİYON: ARKA PLAN İŞLEMİ (Firestore Trigger) ---
@firestore_fn.on_document_created(
    document="artifacts/default-hexa-app/users/{userId}/jobs/{jobId}",
    timeout_sec=300,
    memory=options.MemoryOption.GB_1
)
def process_generation_job(event: firestore_fn.Event[firestore_fn.DocumentSnapshot]) -> None:
    """
    Firestore'da yeni bir 'job' oluştuğunda tetiklenir.
    Resmi üretir, Storage'a yükler ve dokümanı günceller.
    """
    snapshot = event.data
    if not snapshot:
        return

    data = snapshot.to_dict()
    prompt = data.get("prompt")
    style = data.get("style")

    user_id = event.params["userId"]
    job_id = event.params["jobId"]
    job_ref = snapshot.reference

    # Prompt Doğrulaması
    if not prompt or prompt.strip() == "":
        if style and style != "No Style":
            prompt = f"{style} Logo"
            print(f"⚠️ Prompt eksik, stil kullanıldı -> {prompt}")
        else:
            print("❌ Kritik Hata: Prompt eksik!")
            job_ref.update({"status": "failed", "error_message": "Prompt missing"})
            return

    try:
        # A. Resmi Üret (Pollinations)
        image_bytes = query_pollinations(prompt)

        try:
            image = Image.open(io.BytesIO(image_bytes))
        except Exception:
            error_text = image_bytes.decode("utf-8") if image_bytes else "Empty response"
            print(f"⚠️ Resim Verisi Hatası: {error_text}")
            raise Exception(f"Invalid image data: {error_text[:100]}")

        # B. Firebase Storage'a Yükle
        bucket = storage.bucket()
        blob_path = f"generated_logos/{user_id}/{job_id}.png"
        blob = bucket.blob(blob_path)

        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        blob.upload_from_string(img_byte_arr.getvalue(), content_type="image/png")

        blob.make_public()
        image_url = blob.public_url

        # C. Random Fail Testi (Case Study için Mock Hata)
        # %20 ihtimalle başarısızlık senaryosunu test eder.
        if random.random() < 0.20:
            print("🎯 RANDOM FAIL tetiklendi (%20 ihtimal)")
            job_ref.update({
                "status": "failed",
                "completedAt": firestore.SERVER_TIMESTAMP,
                "error_message": "Randomized failure test (Mock)"
            })
            return

        # D. Başarılı Sonuç - Firestore Güncelleme
        job_ref.update({
            "status": "done",
            "logoUrl": image_url,
            "completedAt": firestore.SERVER_TIMESTAMP,
            "result_message": "Generated via Pollinations"
        })

        print(f"✅ Job {job_id} başarıyla tamamlandı!")

    except Exception as e:
        print(f"❌ İŞLEM HATASI: {e}")
        job_ref.update({
            "status": "failed",
            "completedAt": firestore.SERVER_TIMESTAMP,
            "error_message": str(e)
        })