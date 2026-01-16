import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL_B")
key = os.environ.get("SUPABASE_KEY_B")
supabase = create_client(url, key)

def seed_toko_gyu():
    print("--- SEEDING TOKO GYU (GyuGalaxy) dengan KATEGORI ---")
    
    try:
        supabase.table("transactions").delete().neq("id", 0).execute()
        supabase.table("command_results").delete().neq("id", 0).execute()
        supabase.table("command_requests").delete().neq("command_type", "x").execute()
    except:
        pass

    data = [
        # MAIN DISHES (Beef)
        {"store_id": "TOKO_GYU", "menu_category": "Main Dish", "menu_item": "GyuGalaxy Original Beef Bowl", "amount": 48000},
        {"store_id": "TOKO_GYU", "menu_category": "Main Dish", "menu_item": "GyuGalaxy Spicy Beef Bowl", "amount": 50000},
        {"store_id": "TOKO_GYU", "menu_category": "Main Dish", "menu_item": "Wagyu Steak Bowl", "amount": 75000},
        {"store_id": "TOKO_GYU", "menu_category": "Main Dish", "menu_item": "Double Beef Galaxy Bowl", "amount": 59000},
        
        # SIDE DISHES
        {"store_id": "TOKO_GYU", "menu_category": "Side Dish", "menu_item": "Miso Soup", "amount": 18000},
        {"store_id": "TOKO_GYU", "menu_category": "Side Dish", "menu_item": "Kimchi", "amount": 20000},
        {"store_id": "TOKO_GYU", "menu_category": "Side Dish", "menu_item": "Edamame", "amount": 20000},
        
        # BEVERAGES
        {"store_id": "TOKO_GYU", "menu_category": "Beverage", "menu_item": "Hot Ocha", "amount": 15000},
        {"store_id": "TOKO_GYU", "menu_category": "Beverage", "menu_item": "Iced Ocha", "amount": 17000},
        {"store_id": "TOKO_GYU", "menu_category": "Beverage", "menu_item": "Lychee Tea", "amount": 20000},
    ]

    try:
        supabase.table("transactions").insert(data).execute()
        print(f"✅ Sukses! {len(data)} items masuk ke Cloud GyuGalaxy.")
    except Exception as e:
        print(f"❌ Gagal: {e}")

if __name__ == "__main__":
    seed_toko_gyu()