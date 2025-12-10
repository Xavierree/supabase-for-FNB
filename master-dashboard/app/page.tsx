'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- KITA BUAT 2 CLIENT BERBEDA ---
// Client A
const supabaseA = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_A!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_A!
)

// Client B
const supabaseB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_B!
)

const MENU_ITEMS = ["Nasi Goreng", "Es Teh", "Ayam Geprek", "Lemon Tea", "Mie Ayam", "Jus Jeruk"]
const AGGREGATION_TYPES = [
  { value: "SUM", label: "Total Revenue (SUM)" },
  { value: "AVG", label: "Rata-rata Harga (AVG)" },
  { value: "MAX", label: "Harga Tertinggi (MAX)" },
  { value: "MIN", label: "Harga Terendah (MIN)" },
  { value: "COUNT", label: "Jumlah Transaksi (COUNT)" }
]

export default function MasterDashboard() {
  const [menuItem, setMenuItem] = useState(MENU_ITEMS[0])
  const [aggType, setAggType] = useState('SUM')
  const [logs, setLogs] = useState<string[]>([])
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // --- LISTEN KE KEDUA CLOUD ---
  useEffect(() => {
    // Handler saat ada data masuk
    const handleNewResult = (payload: any) => {
      console.log("Data Baru Masuk:", payload.new) // Debugging Log di Browser Console

      setResults((prev) => {
        // Cek apakah data ini sudah ada di layar (berdasarkan ID dan Toko)
        // Kita pakai kombinasi ID + Store_ID sebagai kunci unik
        const exists = prev.some(r => r.id === payload.new.id && r.store_id === payload.new.store_id)

        if (exists) return prev; // Jika sudah ada, jangan tambah lagi

        return [...prev, payload.new] // Tambahkan data baru
      })

      setIsLoading(false)
    }

    // Subscribe ke Cloud A
    const channelA = supabaseA
      .channel('listener-A')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'command_results' }, handleNewResult)
      .subscribe()

    // Subscribe ke Cloud B
    const channelB = supabaseB
      .channel('listener-B')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'command_results' }, handleNewResult)
      .subscribe()

    return () => {
      supabaseA.removeChannel(channelA)
      supabaseB.removeChannel(channelB)
    }
  }, [])

  // --- KIRIM PERINTAH KE KEDUA CLOUD (BROADCAST) ---
  const sendCommand = async () => {
    setIsLoading(true)
    setResults([])
    const time = new Date().toLocaleTimeString()
    setLogs((prev) => [`[${time}] Broadcast Request: ${aggType} -> ${menuItem}`, ...prev])

    const payloadData = {
      command_type: 'CALCULATE',
      payload: { menu: menuItem, agg_type: aggType }
    }

    // Kirim Paralel ke A dan B
    await Promise.all([
      supabaseA.from('command_requests').insert(payloadData),
      supabaseB.from('command_requests').insert(payloadData)
    ])
  }

  const formatResult = (val: number, type: string) => {
    if (type === 'COUNT') return val + ' Trx';
    return 'Rp ' + val.toLocaleString('id-ID');
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
            True Distributed Dashboard
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Menghubungkan Cloud A ({process.env.NEXT_PUBLIC_SUPABASE_URL_A?.split('.')[0]}) & Cloud B ({process.env.NEXT_PUBLIC_SUPABASE_URL_B?.split('.')[0]})
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5">
              <label className="block text-xs text-gray-500 mb-2 font-semibold">Pilih Menu</label>
              <select value={menuItem} onChange={(e) => setMenuItem(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                {MENU_ITEMS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div className="md:col-span-4">
              <label className="block text-xs text-gray-500 mb-2 font-semibold">Jenis Kalkulasi</label>
              <select value={aggType} onChange={(e) => setAggType(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white">
                {AGGREGATION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
              </select>
            </div>
            <div className="md:col-span-3">
              <button onClick={sendCommand} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all">
                {isLoading ? 'Waiting Nodes...' : 'Broadcast Command'}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-sm font-bold mb-4 text-gray-400 uppercase tracking-widest border-b border-gray-800 pb-2">Responses</h3>
            <div className="space-y-3 min-h-[150px]">
              {results.map((res, idx) => (
                <div key={idx} className="flex justify-between items-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${res.store_id === 'TOKO_A' ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                    <span className="font-bold text-white">{res.store_id}</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">
                    {formatResult(res.result_data.value, res.result_data.agg_type)}
                  </div>
                </div>
              ))}
              {results.length === 0 && !isLoading && <p className="text-gray-600 text-center py-10">Siap menerima data...</p>}
            </div>
          </div>
          <div className="bg-black rounded-xl border border-gray-800 p-4 font-mono text-xs h-[300px] overflow-y-auto">
            <div className="text-gray-500 mb-2 border-b border-gray-900 pb-2">CONNECTION LOGS</div>
            {logs.map((log, i) => <div key={i} className="mb-1 text-green-400"><span className="text-gray-600 mr-2">$</span>{log}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}