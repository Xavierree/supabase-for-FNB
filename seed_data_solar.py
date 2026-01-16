import os
from supabase import create_client
from dotenv import load_dotenv

load_dotenv()

url = os.environ.get("SUPABASE_URL_A")
key = os.environ.get("SUPABASE_KEY_A")
supabase = create_client(url, key)

def seed_toko_solar():
    print("--- SEEDING TOKO SOLAR (SolarChick) dengan KATEGORI ---")
    
    # Reset Data
    try:
        supabase.table("transactions").delete().neq("id", 0).execute()
        supabase.table("command_results").delete().neq("id", 0).execute()
        supabase.table("command_requests").delete().neq("command_type", "x").execute()
    except:
        pass

    # Perhatikan kolom 'menu_category'
    data = [
        # MAIN DISHES (Chicken)
        {"store_id": "TOKO_SOLAR", "menu_category": "Main Dish", "menu_item": "SolarChick Original Crispy", "amount": 45000},
        {"store_id": "TOKO_SOLAR", "menu_category": "Main Dish", "menu_item": "SolarChick Spicy Volcano", "amount": 47000},
        {"store_id": "TOKO_SOLAR", "menu_category": "Main Dish", "menu_item": "SolarChick Rice Bowl", "amount": 39000},
        {"store_id": "TOKO_SOLAR", "menu_category": "Main Dish", "menu_item": "Solar Wings 6 pcs", "amount": 52000},
        
        # SIDE DISHES
        {"store_id": "TOKO_SOLAR", "menu_category": "Side Dish", "menu_item": "Solar Fries", "amount": 25000},
        {"store_id": "TOKO_SOLAR", "menu_category": "Side Dish", "menu_item": "Solar Cheese Fries", "amount": 29000},
        {"store_id": "TOKO_SOLAR", "menu_category": "Side Dish", "menu_item": "Solar Coleslaw", "amount": 18000},
        
        # BEVERAGES
        {"store_id": "TOKO_SOLAR", "menu_category": "Beverage", "menu_item": "Iced Lemon Tea Solar", "amount": 18000},
        {"store_id": "TOKO_SOLAR", "menu_category": "Beverage", "menu_item": "Solar Cola", "amount": 18000},
        {"store_id": "TOKO_SOLAR", "menu_category": "Beverage", "menu_item": "Mineral Water", "amount": 10000},
    ]

    try:
        supabase.table("transactions").insert(data).execute()
        print(f"✅ Sukses! {len(data)} items masuk ke Cloud SolarChick.")
    except Exception as e:
        print(f"❌ Gagal: {e}")

if __name__ == "__main__":
    seed_toko_solar()