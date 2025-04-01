"use client";
import { useState, useEffect } from "react";

interface Provider {
  name: string;
  apiUrl: string;
  apiKey: string;
  enabled: boolean;
}

interface DomainResult {
  domain: string;
  available: boolean;
  provider: string;
}

const defaultProviders: Provider[] = [
  { name: "WhoisXML", apiUrl: "", apiKey: "", enabled: true },
  { name: "GoDaddy", apiUrl: "", apiKey: "", enabled: true },
  { name: "Namecheap", apiUrl: "", apiKey: "", enabled: true },
  { name: "Google Domains", apiUrl: "", apiKey: "", enabled: true },
  { name: "Dynadot", apiUrl: "", apiKey: "", enabled: true },
  { name: "Hover", apiUrl: "", apiKey: "", enabled: true },
  { name: "Gandi", apiUrl: "", apiKey: "", enabled: true },
  { name: "Bluehost", apiUrl: "", apiKey: "", enabled: true },
  { name: "Porkbun", apiUrl: "", apiKey: "", enabled: true },
  { name: "Domainr", apiUrl: "", apiKey: "", enabled: true }
];

const defaultExtensions = [".com", ".net", ".org", ".co", ".info", ".me", ".store", ".online"];

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
    if (typeof window !== "undefined") {
      const ext = localStorage.getItem("extensions");
      const prov = localStorage.getItem("providers");
      if (ext) {
        const parsed = JSON.parse(ext);
        setExtensions(parsed);
        setActiveExtensions(parsed);
      }
      if (prov) setProviders(JSON.parse(prov));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("extensions", JSON.stringify(extensions));
      localStorage.setItem("providers", JSON.stringify(providers));
    }
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
        res.push({ domain: fullDomain, available, provider: provider.name });
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
  };

  return (
    <div dir="rtl" style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "Arial" }}>
      <h2>🔍 نظام البحث عن أسماء النطاقات القصيرة</h2>
      <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="أدخل اسم النطاق..." style={{ width: "100%", padding: "10px" }} />
      <div style={{ marginTop: 10 }}>
        <button onClick={() => searchDomains(domain)}>🔎 بحث يدوي</button>
        <button onClick={() => { setAutoGenerate(true); startAutoSearch(); }}>🚀 بحث تلقائي</button>
        <button onClick={() => setAutoGenerate(false)}>⏹️ إيقاف</button>
        <button onClick={() => setShowSettings(!showSettings)}>⚙️ الإعدادات</button>
      </div>
      <p>✅ المتاح: {summary.available} | ❌ غير المتاح: {summary.unavailable}</p>

      <h4>🌐 الامتدادات:</h4>
      {extensions.map((ext, i) => (
        <label key={i} style={{ marginInlineEnd: 10 }}>
          <input
            type="checkbox"
            checked={activeExtensions.includes(ext)}
            onChange={() => {
              setActiveExtensions(prev =>
                prev.includes(ext) ? prev.filter(e => e !== ext) : [...prev, ext]
              );
            }}
          />{" "}{ext}
        </label>
      ))}

      {showSettings && (
        <div style={{ background: "#f9f9f9", padding: 10, marginTop: 20 }}>
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
              />{" "}
              {p.name}
              <input
                type="text"
                placeholder="API Key"
                value={p.apiKey}
                onChange={(e) => {
                  const updated = [...providers];
                  updated[i].apiKey = e.target.value;
                  setProviders(updated);
                }}
                style={{ marginRight: 10, padding: 4 }}
              />
            </div>
          ))}

          <h4>🌐 إدارة الامتدادات:</h4>
          {extensions.map((ext, i) => (
            <div key={i}>
              {ext} <button onClick={() => {
                const newList = extensions.filter((_, idx) => idx !== i);
                setExtensions(newList);
                setActiveExtensions(activeExtensions.filter(e => e !== ext));
              }}>🗑️</button>
            </div>
          ))}
          <button onClick={() => {
            const newExt = prompt("أدخل امتداد جديد");
            if (newExt && !extensions.includes(newExt)) {
              setExtensions([...extensions, newExt]);
              setActiveExtensions([...activeExtensions, newExt]);
            }
          }}>➕ إضافة امتداد</button>
        </div>
      )}

      <h4 style={{ marginTop: "20px" }}>📋 النتائج:</h4>
      {results.map((r, i) => (
        <div key={i}>{r.domain} - {r.provider} - {r.available ? "✅" : "❌"}</div>
      ))}
    </div>
  );
}