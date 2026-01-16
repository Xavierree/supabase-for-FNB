'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// --- KONEKSI KE DUA CLOUD SUPABASE ---
const supabaseA = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_A!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_A!
)

const supabaseB = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL_B!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY_B!
)

// --- KATEGORI SESUAI DATABASE (SQL) ---
const DB_CATEGORIES = [
  { id: "ALL", label: "💰 GRAND TOTAL" },
  { id: "Main Dish", label: "🍽️ Main Dish (Ayam/Sapi)" },
  { id: "Side Dish", label: "🍟 Side Dish" },
  { id: "Beverage", label: "🥤 Beverage" }
]

const AGGREGATION_TYPES = [
  { value: "SUM", label: "Total Revenue (SUM)" },
  { value: "AVG", label: "Average Sales (AVG)" },
  { value: "MAX", label: "Highest Sale (MAX)" },
  { value: "MIN", label: "Lowest Sale (MIN)" },
  { value: "COUNT", label: "Total Transactions (COUNT)" }
]

export default function MasterDashboard() {
  const [category, setCategory] = useState(DB_CATEGORIES[0].id)
  const [aggType, setAggType] = useState('SUM')
  const [results, setResults] = useState<any[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // --- REALTIME LISTENER ---
  useEffect(() => {
    const handleResult = (payload: any) => {
      setResults(prev => {
        // Cek duplikasi agar tidak double
        if (prev.find(r => r.id === payload.new.id && r.store_id === payload.new.store_id)) return prev
        return [...prev, payload.new]
      })
      setIsLoading(false)
    }

    const subA = supabaseA.channel('A').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'command_results' }, handleResult).subscribe()
    const subB = supabaseB.channel('B').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'command_results' }, handleResult).subscribe()

    return () => { supabaseA.removeChannel(subA); supabaseB.removeChannel(subB) }
  }, [])

  // --- KIRIM PERINTAH ---
  const sendCommand = async () => {
    setIsLoading(true);
    setResults([]) // Reset hasil lama

    const time = new Date().toLocaleTimeString()
    setLogs(prev => [`[${time}] Request: ${aggType} -> ${category}`, ...prev])

    const payload = {
      command_type: 'CALC', // Kode perintah untuk Python baru
      payload: {
        category: category,
        agg_type: aggType
      }
    }

    await Promise.all([
      supabaseA.from('command_requests').insert(payload),
      supabaseB.from('command_requests').insert(payload)
    ])
  }

  // --- HELPER: FORMAT ANGKA (YANG HILANG TADI) ---
  const formatResult = (val: number, type: string) => {
    // 1. Jika COUNT, tidak pakai Rupiah
    if (type === 'COUNT') return Math.round(val) + ' Items';

    // 2. Jika Uang, format ke Rupiah dan BULATKAN (hilangkan desimal)
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0 // Ini yang membuat Rp 19.333,33 jadi Rp 19.333
    }).format(val);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Distributed Aggregation System
        </h1>

        {/* Controls */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Kategori</label>
            <select className="w-full bg-gray-800 p-3 rounded border border-gray-700 focus:border-blue-500 outline-none" value={category} onChange={e => setCategory(e.target.value)}>
              {DB_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-xs text-gray-500 uppercase font-bold mb-1 block">Agregasi</label>
            <select className="w-full bg-gray-800 p-3 rounded border border-gray-700 focus:border-blue-500 outline-none" value={aggType} onChange={e => setAggType(e.target.value)}>
              {AGGREGATION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className="md:w-32 flex items-end">
            <button onClick={sendCommand} disabled={isLoading} className="w-full bg-blue-600 py-3 rounded font-bold hover:bg-blue-500 disabled:opacity-50 transition-all">
              {isLoading ? '...' : 'Hitung'}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Kartu Hasil */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
            <h3 className="text-gray-500 text-xs font-bold uppercase mb-4 border-b border-gray-800 pb-2">Hasil Komputasi Node</h3>
            <div className="space-y-4">
              {results.map((res, i) => (
                <div key={i} className="bg-gray-800/50 p-4 rounded border-l-4 border-green-500 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
                  <div>
                    <span className="font-bold block text-white">{res.store_id}</span>
                    <span className="text-xs text-gray-400">Node Worker</span>
                  </div>
                  {/* PANGGIL FUNGSI FORMAT DI SINI */}
                  <span className="text-xl font-mono font-bold text-green-400">
                    {formatResult(res.result_data.value, res.result_data.agg_type)}
                  </span>
                </div>
              ))}

              {results.length === 0 && !isLoading && (
                <p className="text-gray-600 text-center italic py-4">Siap menerima data...</p>
              )}
            </div>
          </div>

          {/* Logs */}
          <div className="bg-black p-4 rounded-xl h-64 overflow-y-auto font-mono text-xs text-green-400 border border-gray-800 shadow-inner">
            <div className="text-gray-500 mb-2 pb-2 border-b border-gray-900">SYSTEM LOGS_</div>
            {logs.map((l, i) => <div key={i} className="mb-1">{l}</div>)}
          </div>
        </div>
      </div>
    </div>
  )
}