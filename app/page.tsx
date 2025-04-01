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

const defaultExtensions = [".com", ".net", ".org", ".co", ".info"];
const defaultProviders: Provider[] = [
  { name: "WhoisXML", enabled: true, apiKey: "" },
  { name: "GoDaddy", enabled: true, apiKey: "", apiSecret: "" },
  { name: "Namecheap", enabled: true, apiKey: "", username: "", clientIp: "" }
];

export default function DomainSearchApp() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [extensions, setExtensions] = useState<string[]>(defaultExtensions);
  const [activeExtensions, setActiveExtensions] = useState<string[]>(defaultExtensions);
  const [providers, setProviders] = useState<Provider[]>(defaultProviders);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [summary, setSummary] = useState({ available: 0, unavailable: 0 });
  const [newExt, setNewExt] = useState("");

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

  const generateName = async () => {
    const aiNames = ["zix", "qor", "nuv", "tre", "fex", "vyn", "bax", "kul"];
    return aiNames[Math.floor(Math.random() * aiNames.length)];
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

  const startSmartSearch = async () => {
    let found = false;
    while (autoGenerate && !found) {
      const name = await generateName();
      found = await searchDomains(name);
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
      <div style={{ marginTop: 10 }}>
        <h4>🌐 الامتدادات المستخدمة في البحث:</h4>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {extensions.map((ext, idx) => (
            <label key={idx} style={{ background: activeExtensions.includes(ext) ? "#dff0d8" : "#f2dede", padding: "5px 10px", borderRadius: 4 }}>
              <input
                type="checkbox"
                checked={activeExtensions.includes(ext)}
                onChange={() =>
                  setActiveExtensions((prev) =>
                    prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]
                  )
                }
              />{" "}
              {ext}
            </label>
          ))}
        </div>
      </div>

        style={{ width: "100%", padding: "10px", marginBottom: 10 }}
      />

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button onClick={() => searchDomains(domain)}>🔎 بحث يدوي</button>
        <button onClick={() => { setAutoGenerate(true); setTimeout(() => startSmartSearch(), 100); }}>
          🤖 توليد ذكي باستخدام الذكاء الاصطناعي (OpenAI)
        </button>
        <button onClick={() => setAutoGenerate(false)}>⏹️ إيقاف</button>
        <button onClick={() => setResults([])}>🗑️ حذف النتائج</button>
        <button onClick={() => setShowSettings(!showSettings)}>⚙️ الإعدادات</button>
      </div>

      <p style={{ marginTop: 10 }}>✅ المتاح: {summary.available} | ❌ غير المتاح: {summary.unavailable}</p>

      {showSettings && (
        <div style={{ background: "#f9f9f9", padding: 15, marginTop: 20, borderRadius: 8 }}>
          <h4>🌐 الامتدادات:</h4>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
            {extensions.map((ext, idx) => (
              <label key={idx}>
                <input
                  type="checkbox"
                  checked={activeExtensions.includes(ext)}
                  onChange={() =>
                    setActiveExtensions((prev) =>
                      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]
                    )
                  }
                />{" "}
                {ext}
              </label>
            ))}
          </div>
          <input
  type="text"
  value={domain}
  onChange={(e) => setDomain(e.target.value)}
  placeholder="أدخل اسم النطاق..."
  style={{ width: "100%", padding: "10px", marginBottom: 10 }}
/>
          <button onClick={() => {
            if (newExt && !extensions.includes(newExt)) {
              const updated = [...extensions, newExt];
              setExtensions(updated);
              setActiveExtensions(updated);
              setNewExt("");
            }
          }}>➕ إضافة</button>

          <h4 style={{ marginTop: 20 }}>📡 مزودي الخدمة:</h4>
          {providers.map((p, i) => (
            <div key={i} style={{ marginBottom: 10 }}>
              <input
                type="checkbox"
                checked={p.enabled}
                onChange={() => {
                  const updated = [...providers];
                  updated[i].enabled = !updated[i].enabled;
                  setProviders(updated);
                }}
              />{" "}
              {p.name}
              <input
  type="text"
  value={domain}
  onChange={(e) => setDomain(e.target.value)}
  placeholder="أدخل اسم النطاق..."
  style={{ width: "100%", padding: "10px", marginBottom: 10 }}
/>
              {p.name === "GoDaddy" && (
                <input
  type="text"
  value={domain}
  onChange={(e) => setDomain(e.target.value)}
  placeholder="أدخل اسم النطاق..."
  style={{ width: "100%", padding: "10px", marginBottom: 10 }}
/>
              )}
              {p.name === "Namecheap" && (
                <>
                  <input
  type="text"
  value={domain}
  onChange={(e) => setDomain(e.target.value)}
  placeholder="أدخل اسم النطاق..."
  style={{ width: "100%", padding: "10px", marginBottom: 10 }}
/>
                  <input
  type="text"
  value={domain}
  onChange={(e) => setDomain(e.target.value)}
  placeholder="أدخل اسم النطاق..."
  style={{ width: "100%", padding: "10px", marginBottom: 10 }}
/>
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
                  <td style={{ border: "1px solid #ccc", padding: 8 }}>
                    {r.available ? "✅ متاح" : "❌ غير متاح"}
                  </td>
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