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
  const [providers, setProviders] = useState<Provider[]>(defaultProviders);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [summary, setSummary] = useState({ available: 0, unavailable: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ext = localStorage.getItem("extensions");
      const prov = localStorage.getItem("providers");
      if (ext) setExtensions(JSON.parse(ext));
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
    for (const ext of extensions) {
      const fullDomain = `${base}${ext}`;
      for (const provider of providers.filter(p => p.enabled)) {
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
      <button onClick={() => searchDomains(domain)}>🔎 بحث يدوي</button>
      <button onClick={() => { setAutoGenerate(true); startAutoSearch(); }}>🚀 بحث تلقائي</button>
      <button onClick={() => setAutoGenerate(false)}>⏹️ إيقاف</button>
      <p>✅ المتاح: {summary.available} | ❌ غير المتاح: {summary.unavailable}</p>

      <hr />
      <h4>📡 مزودي الخدمة:</h4>
      {providers.map((p, i) => (
        <div key={i}>
          <input type="checkbox" checked={p.enabled} onChange={() => {
            const updated = [...providers];
            updated[i].enabled = !updated[i].enabled;
            setProviders(updated);
          }} /> {p.name}
        </div>
      ))}

      <h4>🌐 الامتدادات:</h4>
      {extensions.map((ext, i) => (
        <div key={i}>{ext} <button onClick={() => setExtensions(extensions.filter((_, idx) => idx !== i))}>🗑️</button></div>
      ))}
      <button onClick={() => {
        const newExt = prompt("أدخل امتداد جديد");
        if (newExt && !extensions.includes(newExt)) {
          setExtensions([...extensions, newExt]);
        }
      }}>➕ إضافة امتداد</button>

      <h4>📋 النتائج:</h4>
      {results.map((r, i) => (
        <div key={i}>{r.domain} - {r.provider} - {r.available ? "✅" : "❌"}</div>
      ))}
    </div>
  );
}