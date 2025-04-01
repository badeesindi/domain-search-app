"use client";

import { useState, useEffect } from "react";

export default function DomainSearchApp() {
  const allExtensions = [".com", ".net", ".org", ".co", ".info", ".me", ".store", ".online", ".ai", ".sa"];
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [summary, setSummary] = useState({ available: 0, unavailable: 0 });
  const [selectAll, setSelectAll] = useState(true);
  const [selectedExtensions, setSelectedExtensions] = useState(allExtensions);
  const [status, setStatus] = useState("");
  const [lastIndex, setLastIndex] = useState(0);
  const [generatedList, setGeneratedList] = useState([]);

  const charset = "abcdefghijklmnopqrstuvwxyz";

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedExtensions(selectAll ? [] : allExtensions);
  };

  const toggleExtension = (ext: string) => {
    setSelectedExtensions(prev =>
      prev.includes(ext) ? prev.filter(e => e !== ext) : [...prev, ext]
    );
  };

  const generateShortNames = (length = 3, count = 100) => {
    const names = new Set();
    while (names.size < count) {
      let name = "";
      for (let i = 0; i < length; i++) {
        name += charset[Math.floor(Math.random() * charset.length)];
      }
      names.add(name);
    }
    return Array.from(names);
  };

  const simulateCheck = async (name: string) => {
    const resultList = selectedExtensions.map(ext => {
      const isAvailable = Math.random() > 0.5;
      return {
        domain: `${name}${ext}`,
        available: isAvailable,
        provider: "محاكاة",
      };
    });
    return new Promise(resolve => {
      setTimeout(() => resolve(resultList), 300);
    });
  };

  const runAutoSearch = async () => {
    setLoading(true);
    const batch = generatedList.slice(lastIndex, lastIndex + 1);

    for (const name of batch) {
      if (paused) break;
      setStatus(`جاري فحص: ${name}`);
      const results: any = await simulateCheck(name);
      const found = results.find((r: any) => r.available);
      setResults(prev => [...prev, ...results]);
      setSummary(prev => ({
        available: prev.available + results.filter((r: any) => r.available).length,
        unavailable: prev.unavailable + results.filter((r: any) => !r.available).length,
      }));
      setLastIndex(prev => prev + 1);
      if (found) {
        setStatus(`تم العثور على نطاق متاح: ${found.domain}`);
        break;
      }
    }

    setLoading(false);
    setAutoMode(false);
  };

  const startAutoMode = () => {
    const generated = generateShortNames(3, 100);
    setGeneratedList(generated);
    setLastIndex(0);
    setResults([]);
    setSummary({ available: 0, unavailable: 0 });
    setPaused(false);
    setAutoMode(true);
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

      <button onClick={() => startAutoMode()} disabled={loading}>
        توليد وبدء البحث التلقائي
      </button>
      <button onClick={() => setPaused(true)} style={{ marginRight: 10 }}>
        ⏸️ إيقاف مؤقت
      </button>
      <button onClick={() => setPaused(false)} style={{ marginRight: 10 }}>
        ▶️ استئناف
      </button>

      <div style={{ marginTop: 10 }}>
        <label>
          <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} /> تحديد كل الامتدادات
        </label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
          {allExtensions.map(ext => (
            <label key={ext}>
              <input
                type="checkbox"
                checked={selectedExtensions.includes(ext)}
                onChange={() => toggleExtension(ext)}
              />{" "}
              {ext}
            </label>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 20, color: "#555" }}>{status}</div>
      <div style={{ marginTop: 10, fontWeight: "bold" }}>
        ✅ المتاحة: {summary.available} | ❌ غير المتاحة: {summary.unavailable}
      </div>

      {results.length > 0 && (
        <div style={{ marginTop: 20 }}>
          {results.map((res, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 5,
                background: res.available ? "#e6ffe6" : "#ffe6e6",
              }}
            >
              <b>{res.domain}</b> — {res.available ? "✅ متاح" : "❌ غير متاح"} (مزود: {res.provider})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}