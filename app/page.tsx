"use client";

import { useState, useEffect } from "react";

interface DomainResult {
  domain: string;
  available: boolean;
  provider: string;
}

export default function DomainSearchApp() {
  const [extensions, setExtensions] = useState<string[]>([".com", ".net", ".org"]);
  const [whoisKey, setWhoisKey] = useState("");
  const [newExt, setNewExt] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
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
  const charset = "abcdefghijklmnopqrstuvwxyz";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedExt = localStorage.getItem("extensions");
      const savedKey = localStorage.getItem("whoisKey");
      if (savedExt) setExtensions(JSON.parse(savedExt));
      if (savedKey) setWhoisKey(savedKey);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("extensions", JSON.stringify(extensions));
    }
  }, [extensions]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("whoisKey", whoisKey);
    }
  }, [whoisKey]);

  const toggleExtension = (ext: string) => {
    setExtensions((prev) =>
      prev.includes(ext) ? prev.filter((e) => e !== ext) : [...prev, ext]
    );
  };

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
    const resultList: DomainResult[] = extensions.map((ext) => {
      const isAvailable = Math.random() > 0.5;
      return {
        domain: `${name}${ext}`,
        available: isAvailable,
        provider: "محاكاة",
      };
    });
    return new Promise((resolve) => {
      setTimeout(() => resolve(resultList), 300);
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
        unavailable: prev.unavailable + checkResults.filter((r) => !r.available).length,
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

      <button onClick={startAutoMode} disabled={loading}>
        توليد وبدء البحث التلقائي
      </button>
      <button onClick={() => setPaused(true)} style={{ marginRight: 10 }}>
        ⏸️ إيقاف مؤقت
      </button>
      <button onClick={() => setPaused(false)} style={{ marginRight: 10 }}>
        ▶️ استئناف
      </button>
      <button onClick={() => setShowSettings(!showSettings)} style={{ float: "left" }}>
        ⚙️ الخيارات
      </button>

      {showSettings && (
        <div style={{ marginTop: 30, padding: 20, border: "1px solid #ccc", background: "#f9f9f9" }}>
          <h3>🔐 مفاتيح API</h3>
          <label>WhoisXML API Key:</label>
          <input
            type="text"
            value={whoisKey}
            onChange={(e) => setWhoisKey(e.target.value)}
            style={{ width: "100%", marginBottom: 10 }}
          />

          <hr />
          <h3>🌐 إدارة الامتدادات</h3>
          <ul>
            {extensions.map((ext, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                {editingIndex === i ? (
                  <>
                    <input
                      value={editedExt}
                      onChange={(e) => setEditedExt(e.target.value)}
                      style={{ marginLeft: 5 }}
                    />
                    <button onClick={() => updateExtension(i)}>💾 حفظ</button>
                  </>
                ) : (
                  <>
                    {ext}
                    <button onClick={() => { setEditingIndex(i); setEditedExt(ext); }}>✏️ تعديل</button>
                    <button onClick={() => deleteExtension(i)}>❌ حذف</button>
                  </>
                )}
              </li>
            ))}
          </ul>
          <input
            placeholder="مثال: .tech"
            value={newExt}
            onChange={(e) => setNewExt(e.target.value)}
          />
          <button onClick={addExtension}>➕ إضافة امتداد</button>
        </div>
      )}

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