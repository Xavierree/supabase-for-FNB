import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Pastikan di .env sudah ada SUPABASE_URL_A dan SUPABASE_KEY_A
url = os.environ.get("SUPABASE_URL_A")
key = os.environ.get("SUPABASE_KEY_A")
supabase = create_client(url, key)

def seed_toko_a():
    print("--- SEEDING TOKO A ---")
    
    # Hapus data lama agar bersih
    try:
        supabase.table("transactions").delete().neq("id", 0).execute()
        supabase.table("command_requests").delete().neq("command_type", "x").execute()
        supabase.table("command_results").delete().neq("id", 0).execute()
    except Exception as e:
        print(f"Info: Tabel mungkin kosong atau error penghapusan diabaikan ({e})")

    # Data Toko A (LENGKAP DENGAN STORE_ID)
    data = [
        {"store_id": "TOKO_A", "menu_item": "Nasi Goreng", "amount": 20000},
        {"store_id": "TOKO_A", "menu_item": "Es Teh", "amount": 5000},
        {"store_id": "TOKO_A", "menu_item": "Es Teh", "amount": 5000},
        
        {"store_id": "TOKO_A", "menu_item": "Ayam Geprek", "amount": 25000},
        {"store_id": "TOKO_A", "menu_item": "Es Teh", "amount": 5000},
        {"store_id": "TOKO_A", "menu_item": "Lemon Tea", "amount": 8000},

        {"store_id": "TOKO_A", "menu_item": "Mie Ayam", "amount": 18000},
        {"store_id": "TOKO_A", "menu_item": "Jus Jeruk", "amount": 10000},
        {"store_id": "TOKO_A", "menu_item": "Lemon Tea", "amount": 8000},
        {"store_id": "TOKO_A", "menu_item": "Lemon Tea", "amount": 8000},
    ]

    try:
        supabase.table("transactions").insert(data).execute()
        print(f"✅ Sukses! {len(data)} transaksi masuk ke Cloud Toko A.")
    except Exception as e:
        print(f"❌ Gagal Insert: {e}")

if __name__ == "__main__":
    seed_toko_a()