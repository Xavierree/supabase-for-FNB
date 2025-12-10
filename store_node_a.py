import time
import os
import sys
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

class StoreNodeA:
    def __init__(self):
        # KITA HARDCODE LANGSUNG JADI "B"
        self.code = "A" 
        self.store_id = "TOKO_A" 
        
        # Ambil Kredensial Cloud B
        self.url = os.environ.get("SUPABASE_URL_A")
        self.key = os.environ.get("SUPABASE_KEY_A")

        print(f"\n=== [NODE {self.store_id} AKTIF] ===")
        print(f"Mengelola Cloud Database A: {self.url}")
        
        try:
            self.supabase: Client = create_client(self.url, self.key)
            self.processed_requests = set()
        except Exception as e:
            print(f"Gagal connect ke Cloud A: {e}")
            sys.exit(1)

    def process_computation(self, menu_item, agg_type):
        print(f"   > Hitung {agg_type} untuk '{menu_item}' di Cloud A...")
        
        # Query ke database Cloud B
        response = self.supabase.table("transactions")\
            .select("amount")\
            .eq("store_id", self.store_id)\
            .ilike("menu_item", menu_item)\
            .execute()
        
        items = response.data
        values = [item['amount'] for item in items]
        
        if not values:
            return 0

        result = 0
        if agg_type == 'SUM': result = sum(values)
        elif agg_type == 'AVG': result = sum(values) / len(values)
        elif agg_type == 'MAX': result = max(values)
        elif agg_type == 'MIN': result = min(values)
        elif agg_type == 'COUNT': result = len(values)
            
        print(f"   > Hasil Lokal: {result}")
        return result

    def listen_and_process(self):
        print("Menunggu perintah dari Master (Listening)...")
        while True:
            try:
                # Dengar request dari database Cloud B
                requests = self.supabase.table("command_requests")\
                    .select("*")\
                    .order("created_at", desc=True)\
                    .limit(1)\
                    .execute()

                if requests.data:
                    req = requests.data[0]
                    req_id = req['request_id']

                    if req_id not in self.processed_requests:
                        self.processed_requests.add(req_id)
                        
                        menu = req['payload'].get('menu')
                        agg_type = req['payload'].get('agg_type', 'SUM')
                        
                        # Hitung
                        val = self.process_computation(menu, agg_type)
                        
                        # Jawab ke database Cloud B
                        self.supabase.table("command_results").insert({
                            "request_id": req_id,
                            "store_id": self.store_id,
                            "result_data": {
                                "value": val, 
                                "agg_type": agg_type
                            }
                        }).execute()
                        print(f"   > Jawaban diposting ke Cloud .\n")
                
                time.sleep(1) 

            except Exception as e:
                print(f"Error loop: {e}")
                time.sleep(5)

if __name__ == "__main__":
    # TIDAK PERLU ARGUMEN LAGI
    node = StoreNodeA()
    node.listen_and_process()