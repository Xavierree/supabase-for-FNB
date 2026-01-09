import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

# Pastikan di .env sudah ada SUPABASE_URL_B dan SUPABASE_KEY_B
url = os.environ.get("SUPABASE_URL_B")
key = os.environ.get("SUPABASE_KEY_B")
supabase = create_client(url, key)

def seed_toko_b():
    print("--- SEEDING TOKO B ---")

    # Hapus data lama
    try:
        supabase.table("transactions").delete().neq("id", 0).execute()
        supabase.table("command_requests").delete().neq("command_type", "x").execute()
        supabase.table("command_results").delete().neq("id", 0).execute()
    except Exception as e:
        print(f"Info: Tabel mungkin kosong atau error penghapusan diabaikan ({e})")

    # Data Toko B (LENGKAP DENGAN STORE_ID)
    data = [
        {"store_id": "TOKO_B", "menu_item": "Ayam Geprek", "amount": 25000},

        {"store_id": "TOKO_B", "menu_item": "Nasi Goreng", "amount": 20000},
        {"store_id": "TOKO_B", "menu_item": "Es Teh", "amount": 5000},
        {"store_id": "TOKO_B", "menu_item": "Es Teh", "amount": 5000},

        {"store_id": "TOKO_B", "menu_item": "Mie Ayam", "amount": 18000},
        {"store_id": "TOKO_B", "menu_item": "Es Teh", "amount": 5000},
        {"store_id": "TOKO_B", "menu_item": "Es Teh", "amount": 5000},
    ]

    try:
        supabase.table("transactions").insert(data).execute()
        print(f"✅ Sukses! {len(data)} transaksi masuk ke Cloud Toko B.")
    except Exception as e:
        print(f"❌ Gagal Insert: {e}")

if __name__ == "__main__":
    seed_toko_b()