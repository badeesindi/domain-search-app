"use client";
import { useState, useEffect } from "react";

interface Provider {
  name: string;
  enabled: boolean;
  apiKey: string;
  apiSecret?: string;
  username?: string;
  clientIp?: string;
}

interface DomainResult {
  domain: string;
  available: boolean;
  provider: string;
  price?: number;
}

const defaultProviders: Provider[] = [
  { name: "WhoisXML", enabled: true, apiKey: "" },
  { name: "GoDaddy", enabled: true, apiKey: "", apiSecret: "" },
  { name: "Namecheap", enabled: true, apiKey: "", username: "", clientIp: "" }
];

const defaultExtensions = [".com", ".net", ".org", ".co", ".info"];

export default function DomainSearchApp() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [extensions, setExtensions] = useState<string[]>(defaultExtensions);
  const [activeExtensions, setActiveExtensions] = useState<string[]>(defaultExtensions);
  const [providers, setProviders] = useState<Provider[]>(defaultProviders);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [summary, setSummary] = useState({ available: 0, unavailable: 0 });

  useEffect(() => {
    const ext = localStorage.getItem("extensions");
    const prov = localStorage.getItem("providers");
    if (ext) {
      const parsed = JSON.parse(ext);
      setExtensions(parsed);
      setActiveExtensions(parsed);
    }
    if (prov) setProviders(JSON.parse(prov));
  }, []);

  useEffect(() => {
    localStorage.setItem("extensions", JSON.stringify(extensions));
    localStorage.setItem("providers", JSON.stringify(providers));
  }, [extensions, providers]);

  const generateName = () => {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    return Array.from({ length: 3 }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join("");
  };

  const searchDomains = async (base: string) => {
    const res: DomainResult[] = [];
    let found = false;
    for (const ext of activeExtensions) {
      const fullDomain = `${base}${ext}`;
      for (const provider of providers.filter(p => p.enabled && p.apiKey)) {
        const available = Math.random() > 0.5;
        const price = Math.floor(Math.random() * 100) + 10;
        res.push({ domain: fullDomain, available, provider: provider.name, price });
        if (available) found = true;
      }
    }
    setResults(prev => [...prev, ...res]);
    setSummary({
      available: res.filter(r => r.available).length,
      unavailable: res.filter(r => !r.available).length
    });
    return found;
  };

  const startAutoSearch = async () => {
    setResults([]);
    let found = false;
    while (autoGenerate && !found) {
      found = await searchDomains(generateName());
    }
    setAutoGenerate(false);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "auto", background: "#fff", padding: 20, borderRadius: 8 }}>
      <h2 style={{ textAlign: "center" }}>🔍 نظام البحث الذكي عن أسماء النطاقات</h2>
      <input
        type="text"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="أدخل اسم النطاق..."
        style={{ width: "100%", padding: "10px", marginBottom: 10 }}
      />
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={() => searchDomains(domain)}>🔎 بحث يدوي</button>
        <button onClick={() => { setAutoGenerate(true); startAutoSearch(); }}>🚀 بحث تلقائي</button>
        <button onClick={() => setAutoGenerate(false)}>⏹️ إيقاف</button>
        <button onClick={() => setShowSettings(!showSettings)}>⚙️ الإعدادات</button>
      </div>
      <p style={{ marginTop: 10 }}>✅ المتاح: {summary.available} | ❌ غير المتاح: {summary.unavailable}</p>

      {showSettings && (
        <div style={{ background: "#f1f1f1", padding: 10, marginTop: 20 }}>
          <h4>📡 مزودي الخدمة:</h4>
          {providers.map((p, i) => (
            <div key={i} style={{ marginBottom: 5 }}>
              <input
                type="checkbox"
                checked={p.enabled}
                onChange={() => {
                  const updated = [...providers];
                  updated[i].enabled = !updated[i].enabled;
                  setProviders(updated);
                }}
              /> {p.name}
              <input type="text" placeholder="API Key" value={p.apiKey}
                onChange={(e) => {
                  const updated = [...providers];
                  updated[i].apiKey = e.target.value;
                  setProviders(updated);
                }} style={{ marginRight: 5 }} />
              {p.name === "GoDaddy" && (
                <input type="text" placeholder="API Secret" value={p.apiSecret}
                  onChange={(e) => {
                    const updated = [...providers];
                    updated[i].apiSecret = e.target.value;
                    setProviders(updated);
                  }} style={{ marginRight: 5 }} />
              )}
              {p.name === "Namecheap" && (
                <>
                  <input type="text" placeholder="Username" value={p.username}
                    onChange={(e) => {
                      const updated = [...providers];
                      updated[i].username = e.target.value;
                      setProviders(updated);
                    }} style={{ marginRight: 5 }} />
                  <input type="text" placeholder="Client IP" value={p.clientIp}
                    onChange={(e) => {
                      const updated = [...providers];
                      updated[i].clientIp = e.target.value;
                      setProviders(updated);
                    }} style={{ marginRight: 5 }} />
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div style={{ marginTop: 30 }}>
          <h4>📋 نتائج البحث:</h4>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#eee" }}>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>النطاق</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>المزود</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>الحالة</th>
                <th style={{ border: "1px solid #ccc", padding: 8 }}>السعر</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{r.domain}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{r.provider}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{r.available ? "✅ متاح" : "❌ غير متاح"}</td>
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>{r.price} ر.س</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}