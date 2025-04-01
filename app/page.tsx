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


const defaultProviders = [
  { name: "WhoisXML", apiUrl: "https://api.whoisxml.com/", apiKey: "" },
  { name: "GoDaddy", apiUrl: "https://api.godaddy.com/", apiKey: "" },
  { name: "Namecheap", apiUrl: "https://api.namecheap.com/", apiKey: "" },
  { name: "Google Domains", apiUrl: "https://domains.google.com/", apiKey: "" },
  { name: "Domainr", apiUrl: "https://api.domainr.com/", apiKey: "" },
  { name: "Hover", apiUrl: "https://api.hover.com/", apiKey: "" },
  { name: "Dynadot", apiUrl: "https://api.dynadot.com/", apiKey: "" },
  { name: "Gandi", apiUrl: "https://api.gandi.net/", apiKey: "" },
  { name: "Bluehost", apiUrl: "https://api.bluehost.com/", apiKey: "" },
  { name: "Porkbun", apiUrl: "https://porkbun.com/api/", apiKey: "" }
];

export default function DomainSearchApp() {
  const charset = "abcdefghijklmnopqrstuvwxyz";

  const [extensions, setExtensions] = useState<string[]>([".com", ".net", ".org"]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [newProvider, setNewProvider] = useState<Provider>({ name: "", apiUrl: "", apiKey: "" });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const [newExt, setNewExt] = useState("");
  const [editedExt, setEditedExt] = useState("");

  const [domain, setDomain] = useState("");
  const [results, setResults] = useState<DomainResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [summary, setSummary] = useState({ available: 0, unavailable: 0 });
  const [status, setStatus] = useState("");
  const [lastIndex, setLastIndex] = useState(0);
  const [generatedList, setGeneratedList] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  
const defaultProviders = [


useEffect(() => {
    if (typeof window !== "undefined") {
      const savedExt = localStorage.getItem("extensions");
      const savedProviders = localStorage.getItem("apiProviders");
      if (savedExt) setExtensions(JSON.parse(savedExt));
      if (savedProviders) { setProviders(JSON.parse(savedProviders)); } else { setProviders(defaultProviders); }
  }
    }
  }, []);

  


useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("extensions", JSON.stringify(extensions));
    }
  }, [extensions]);

  


useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("apiProviders", JSON.stringify(providers));
    }
  }, [providers]);

  const generateShortNames = (length = 3, count = 100): string[] => {
    const names = new Set<string>();
    while (names.size < count) {
      let name = "";
      for (let i = 0; i < length; i++) {
        name += charset[Math.floor(Math.random() * charset.length)];
      }
      names.add(name);
    }
    return Array.from(names);
  };

  const simulateCheck = async (name: string): Promise<DomainResult[]> => {
    return extensions.map((ext) => {
      return {
        domain: `${name}${ext}`,
        available: Math.random() > 0.5,
        provider: "محاكاة"
      };
    });
  };

  const runAutoSearch = async (): Promise<void> => {
    setLoading(true);
    const batch = generatedList.slice(lastIndex, lastIndex + 1);
    for (const name of batch) {
      if (paused) break;
      setStatus(`جاري فحص: ${name}`);
      const checkResults = await simulateCheck(name);
      const found = checkResults.find((r) => r.available);
      setResults((prev) => [...prev, ...checkResults]);
      setSummary((prev) => ({
        available: prev.available + checkResults.filter((r) => r.available).length,
        unavailable: prev.unavailable + checkResults.filter((r) => !r.available).length
      }));
      setLastIndex((prev) => prev + 1);
      if (found) {
        setStatus(`✅ تم العثور على نطاق متاح: ${found.domain}`);
        break;
      }
    }
    setLoading(false);
    setAutoMode(false);
  };

  const startAutoMode = (): void => {
    const generated = generateShortNames(3, 100);
    setGeneratedList(generated);
    setLastIndex(0);
    setResults([]);
    setSummary({ available: 0, unavailable: 0 });
    setPaused(false);
    setAutoMode(true);
  };

  const addExtension = () => {
    if (newExt && !extensions.includes(newExt)) {
      setExtensions([...extensions, newExt]);
      setNewExt("");
    }
  };

  const updateExtension = (index: number) => {
    const updated = [...extensions];
    updated[index] = editedExt;
    setExtensions(updated);
    setEditingIndex(null);
    setEditedExt("");
  };

  const deleteExtension = (index: number) => {
    const updated = extensions.filter((_, i) => i !== index);
    setExtensions(updated);
  };

  const updateProvider = (index: number) => {
    const updated = [...providers];
    updated[index] = newProvider;
    setProviders(updated);
    setEditingIndex(null);
    setNewProvider({ name: "", apiUrl: "", apiKey: "" });
  };

  const deleteProvider = (index: number) => {
    const updated = providers.filter((_, i) => i !== index);
    setProviders(updated);
  };

  const addProvider = () => {
    if (newProvider.name && newProvider.apiUrl) {
      setProviders([...providers, newProvider]);
      setNewProvider({ name: "", apiUrl: "", apiKey: "" });
    }
  };

  


useEffect(() => {
    if (autoMode && !paused) {
      runAutoSearch();
    }
  }, [autoMode, lastIndex, paused]);

  return (
    <div dir="rtl" style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "Arial" }}>
      <h2>🔍 تطبيق البحث عن أسماء النطاقات</h2>
      <input
        placeholder="اكتب اسم النطاق"
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 10 }}
      />
      <button onClick={startAutoMode} disabled={loading}>🚀 توليد وبدء البحث</button>
      <button onClick={() => setPaused(true)} style={{ marginRight: 10 }}>⏸️ إيقاف</button>
      <button onClick={() => setPaused(false)} style={{ marginRight: 10 }}>▶️ استئناف</button>
      <button onClick={() => setShowSettings(!showSettings)} style={{ float: "left" }}>⚙️ الخيارات</button>

      {showSettings && (
        <div style={{ marginTop: 30, padding: 20, border: "1px solid #ccc", background: "#f9f9f9" }}>
          <h3>📡 مزودي الخدمة</h3>
          {providers.map((prov, i) => (
            <div key={i} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
              {editingIndex === i ? (
                <>
                  <input placeholder="الاسم" value={newProvider.name} onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })} />
                  <input placeholder="رابط API" value={newProvider.apiUrl} onChange={(e) => setNewProvider({ ...newProvider, apiUrl: e.target.value })} />
                  <input placeholder="API Key" value={newProvider.apiKey} onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })} />
                  <button onClick={() => updateProvider(i)}>💾 حفظ</button>
                </>
              ) : (
                <>
                  <p><b>الاسم:</b> {prov.name}</p>
                  <p><b>الرابط:</b> {prov.apiUrl}</p>
                  <p><b>المفتاح:</b> {prov.apiKey}</p>
                  <button onClick={() => { setEditingIndex(i); setNewProvider(prov); }}>✏️ تعديل</button>
                  <button onClick={() => deleteProvider(i)}>❌ حذف</button>
                </>
              )}
            </div>
          ))}
          {providers.length < 10 && (
            <>
              <h4>➕ إضافة مزود</h4>
              <input placeholder="الاسم" value={newProvider.name} onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })} />
              <input placeholder="رابط API" value={newProvider.apiUrl} onChange={(e) => setNewProvider({ ...newProvider, apiUrl: e.target.value })} />
              <input placeholder="API Key" value={newProvider.apiKey} onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })} />
              <button onClick={addProvider}>➕ إضافة</button>
            </>
          )}

          <hr />
          <h3>🌐 إدارة الامتدادات</h3>
          <ul>
            {extensions.map((ext, i) => (
              <li key={i}>
                {editingIndex === i + 1000 ? (
                  <>
                    <input value={editedExt} onChange={(e) => setEditedExt(e.target.value)} />
                    <button onClick={() => updateExtension(i)}>💾 حفظ</button>
                  </>
                ) : (
                  <>
                    {ext}
                    <button onClick={() => { setEditingIndex(i + 1000); setEditedExt(ext); }}>✏️ تعديل</button>
                    <button onClick={() => deleteExtension(i)}>❌ حذف</button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <input placeholder="مثال: .ai" value={newExt} onChange={(e) => setNewExt(e.target.value)} />
          <button onClick={addExtension}>➕ إضافة</button>
        </div>
      )}

      <div style={{ marginTop: 20, color: "#555" }}>{status}</div>
      <div style={{ marginTop: 10, fontWeight: "bold" }}>
        ✅ المتاحة: {summary.available} | ❌ غير المتاحة: {summary.unavailable}
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: 20 }}>
          {results.map((res, idx) => (
            <div key={idx} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 5, background: res.available ? "#e6ffe6" : "#ffe6e6" }}>
              <b>{res.domain}</b> — {res.available ? "✅ متاح" : "❌ غير متاح"} (مزود: {res.provider})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}