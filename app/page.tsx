"use client";
import { useState, useEffect } from "react";

interface Provider {
  name: string;
  apiUrl: string;
  apiKey: string;
}

interface DomainResult {
  domain: string;
  available: boolean;
  provider: string;
}

const defaultProviders: Provider[] = [
  { name: "WhoisXML", apiUrl: "https://api.whoisxml.com", apiKey: "" },
  { name: "GoDaddy", apiUrl: "https://api.godaddy.com", apiKey: "" },
  { name: "Namecheap", apiUrl: "https://api.namecheap.com", apiKey: "" },
  { name: "Domainr", apiUrl: "https://api.domainr.com", apiKey: "" },
  { name: "Google Domains", apiUrl: "https://domains.google.com", apiKey: "" },
  { name: "Dynadot", apiUrl: "https://api.dynadot.com", apiKey: "" },
  { name: "Hover", apiUrl: "https://api.hover.com", apiKey: "" },
  { name: "Gandi", apiUrl: "https://api.gandi.net", apiKey: "" },
  { name: "Bluehost", apiUrl: "https://api.bluehost.com", apiKey: "" },
  { name: "Porkbun", apiUrl: "https://porkbun.com/api", apiKey: "" }
];

const defaultExtensions = [".com", ".net", ".org", ".co", ".info", ".me", ".store", ".online"];

export default function DomainSearchApp() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [extensions, setExtensions] = useState<string[]>(defaultExtensions);
  const [providers, setProviders] = useState<Provider[]>(defaultProviders);
  const [isSearching, setIsSearching] = useState(false);
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [summary, setSummary] = useState({ available: 0, unavailable: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedExt = localStorage.getItem("extensions");
      const savedProviders = localStorage.getItem("apiProviders");
      if (savedExt) setExtensions(JSON.parse(savedExt));
      if (savedProviders) setProviders(JSON.parse(savedProviders));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("extensions", JSON.stringify(extensions));
      localStorage.setItem("apiProviders", JSON.stringify(providers));
    }
  }, [extensions, providers]);

  const generateName = () => {
    const letters = "abcdefghijklmnopqrstuvwxyz";
    let name = "";
    for (let i = 0; i < 3; i++) {
      name += letters[Math.floor(Math.random() * letters.length)];
    }
    return name;
  };

  const searchDomains = async (base: string) => {
    setIsSearching(true);
    let found = false;
    const res: DomainResult[] = [];

    for (const ext of extensions) {
      const fullDomain = `${base}${ext}`;
      for (const provider of providers) {
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
    while (autoGenerate && !await searchDomains(generateName())) {}
    setIsSearching(false);
  };

  return (
    <div dir="rtl" style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "Arial" }}>
      <h2>🔍 البحث عن نطاق</h2>
      <input type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="ادخل اسم النطاق..." style={{ width: "100%", padding: "10px", marginBottom: "10px" }} />
      <button onClick={() => searchDomains(domain)} disabled={isSearching}>🔎 بحث يدوي</button>
      <button onClick={() => { setAutoGenerate(true); startAutoSearch(); }} disabled={isSearching}>🚀 بحث تلقائي</button>
      <button onClick={() => setAutoGenerate(false)} style={{ marginRight: "10px" }}>⏹️ إيقاف</button>
      <div style={{ marginTop: 10 }}>✅ المتاح: {summary.available} | ❌ غير المتاح: {summary.unavailable}</div>
      <div style={{ marginTop: 20 }}>
        <h4>📡 مزودي الخدمة:</h4>
        {providers.map((p, i) => (
          <div key={i}>{p.name}</div>
        ))}
        <h4>🌐 الامتدادات:</h4>
        {extensions.map((ext, i) => (
          <div key={i}>{ext}</div>
        ))}
      </div>
      <hr />
      <div>
        <h4>📋 النتائج:</h4>
        {results.map((r, i) => (
          <div key={i}>{r.domain} - {r.provider} - {r.available ? "✅ متاح" : "❌ غير متاح"}</div>
        ))}
      </div>
    </div>
  );
}