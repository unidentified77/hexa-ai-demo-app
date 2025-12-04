from firebase_functions import firestore_fn, options
from firebase_admin import initialize_app, firestore, storage
import requests
import io
from PIL import Image
import random

# --- AYARLAR ---
POLLINATIONS_BASE = "https://image.pollinations.ai/prompt"

# Firebase Başlatma
initialize_app(options={
    'storageBucket': 'hexaai-63ae8.firebasestorage.app'
})

def query_pollinations(prompt, width=512, height=512, seed=None, nologo=True):
    """
    Pollinations API'ye istek atıp image bytes döndürür.
    """
    prompt_encoded = requests.utils.quote(prompt, safe="")
    url = f"{POLLINATIONS_BASE}/{prompt_encoded}?width={width}&height={height}"

    if seed is not None:
        url += f"&seed={seed}"
    if nologo:
        url += "&nologo=true"

    print(f"📸 Pollinations API request -> {url}")

    resp = requests.get(url)
    if resp.status_code == 200:
        return resp.content
    else:
        raise Exception(f"Pollinations API Error {resp.status_code}: {resp.text}")


@firestore_fn.on_document_created(
    document="artifacts/default-hexa-app/users/{userId}/jobs/{jobId}",
    timeout_sec=300,
    memory=options.MemoryOption.GB_1
)
def process_generation_job(event: firestore_fn.Event[firestore_fn.DocumentSnapshot]) -> None:
    snapshot = event.data
    if not snapshot:
        return

    data = snapshot.to_dict()
    prompt = data.get("prompt")
    style = data.get("style")

    user_id = event.params["userId"]
    job_id = event.params["jobId"]
    job_ref = snapshot.reference

    # Prompt kontrol
    if not prompt or prompt.strip() == "":
        if style and style != "No Style":
            prompt = f"{style} Logo"
            print(f"⚠️ Prompt boş — style kullanıldı -> {prompt}")
        else:
            print("❌ Prompt eksik!")
            job_ref.update({"status": "failed", "error_message": "Prompt missing"})
            return

    try:
        # --- 1. Pollinations ile çizim ---
        image_bytes = query_pollinations(prompt)

        try:
            image = Image.open(io.BytesIO(image_bytes))
        except Exception:
            # Pollinations bazen JSON dökebilir
            error_text = image_bytes.decode("utf-8") if image_bytes else "Empty response"
            print(f"⚠️ Pollinations Response Error: {error_text}")
            raise Exception(f"Invalid image data: {error_text[:100]}")

        # --- 2. Firebase Storage'a yükle ---
        bucket = storage.bucket()
        blob_path = f"generated_logos/{user_id}/{job_id}.png"
        blob = bucket.blob(blob_path)

        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        blob.upload_from_string(img_byte_arr.getvalue(), content_type="image/png")

        blob.make_public()
        image_url = blob.public_url

        # 🔥 --- 3. RANDOM %40 FAIL TESTİ --- 🔥
        if random.random() < 0.40:
            print("🎯 RANDOM FAIL tetiklendi (%40 ihtimal)")
            job_ref.update({
                "status": "failed",
                "completedAt": firestore.SERVER_TIMESTAMP,
                "error_message": "Randomized failure test"
            })
            return

        # --- 4. Firestore Güncelle ---
        job_ref.update({
            "status": "done",
            "logoUrl": image_url,
            "completedAt": firestore.SERVER_TIMESTAMP,
            "result_message": "Generated via Pollinations"
        })

        print(f"✅ Job {job_id} tamamlandı!")

    except Exception as e:
        print(f"❌ ERROR: {e}")
        job_ref.update({
            "status": "failed",
            "completedAt": firestore.SERVER_TIMESTAMP,
            "error_message": str(e)
        })
