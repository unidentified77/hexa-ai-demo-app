from firebase_functions import firestore_fn, options
from firebase_admin import initialize_app, firestore
import time
import random

initialize_app()

# Mock logo URL'leri
MOCK_LOGO_URLS = [
    "https://placehold.co/400x400/FFFFFF/000000?text=Logo+A+Result",
    "https://placehold.co/400x400/FFFFFF/000000?text=Logo+B+Result",
    "https://placehold.co/400x400/FFFFFF/000000?text=Logo+C+Result",
]

@firestore_fn.on_document_created(
    document="artifacts/{appId}/users/{userId}/jobs/{jobId}",
    timeout_sec=300,
    memory=options.MemoryOption.MB_512
)
def process_generation_job(event: firestore_fn.Event[firestore_fn.DocumentSnapshot]) -> None:
    """
    Firestore'da yeni bir job oluşturulduğunda tetiklenir.
    """
    snapshot = event.data
    if not snapshot:
        print("No data associated with the event")
        return

    # Firestore client
    db = firestore.client()

    job_id = event.params["jobId"]
    
    job_ref = snapshot.reference

    print(f"--- Job {job_id} processing started (Firebase SDK v2) ---")

    # 1. Gecikme (Mock AI)
    delay_seconds = random.randint(2, 4)
    print(f"Simulating AI processing for {delay_seconds} seconds...")
    time.sleep(delay_seconds)

    # 2. Mock Sonuç
    is_success = random.random() < 0.5
    
    update_data = {}
    if is_success:
        mock_logo_url = random.choice(MOCK_LOGO_URLS)
        update_data = {
            "status": "done",
            "logoUrl": mock_logo_url,
            "completedAt": firestore.SERVER_TIMESTAMP,
            "result_message": "Generation successful via Firebase SDK v2."
        }
        print(f"Job {job_id} COMPLETED.")
    else:
        update_data = {
            "status": "failed",
            "completedAt": firestore.SERVER_TIMESTAMP,
            "error_message": "Mock AI failed."
        }
        print(f"Job {job_id} FAILED.")

    # 3. Güncelleme
    try:
        job_ref.set(update_data, merge=True)
        print(f"Firestore document {job_id} updated.")
    except Exception as e:
        print(f"Error updating document {job_id}: {e}")