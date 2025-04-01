"use client";

import { useState, useEffect } from "react";

interface Provider {
  name: string;
  apiUrl: string;
  apiKey: string;
}

export default function DomainSearchApp() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newProvider, setNewProvider] = useState<Provider>({ name: "", apiUrl: "", apiKey: "" });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("apiProviders");
      if (saved) setProviders(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("apiProviders", JSON.stringify(providers));
    }
  }, [providers]);

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

  return (
    <div dir="rtl" style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "Arial" }}>
      <h2>🔧 إدارة مزودي الخدمة (API)</h2>
      <button onClick={() => setShowSettings(!showSettings)}>
        ⚙️ عرض / إخفاء الإعدادات
      </button>

      {showSettings && (
        <div style={{ marginTop: 20, padding: 20, border: "1px solid #ccc", background: "#f9f9f9" }}>
          <h3>📡 مزودو API</h3>
          {providers.map((prov, i) => (
            <div key={i} style={{ border: "1px solid #ddd", padding: 10, marginBottom: 10 }}>
              {editingIndex === i ? (
                <>
                  <input
                    placeholder="الاسم"
                    value={newProvider.name}
                    onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                    style={{ marginBottom: 5, width: "100%" }}
                  />
                  <input
                    placeholder="رابط API"
                    value={newProvider.apiUrl}
                    onChange={(e) => setNewProvider({ ...newProvider, apiUrl: e.target.value })}
                    style={{ marginBottom: 5, width: "100%" }}
                  />
                  <input
                    placeholder="API Key"
                    value={newProvider.apiKey}
                    onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                    style={{ marginBottom: 5, width: "100%" }}
                  />
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
              <h4>➕ إضافة مزود جديد</h4>
              <input
                placeholder="الاسم"
                value={newProvider.name}
                onChange={(e) => setNewProvider({ ...newProvider, name: e.target.value })}
                style={{ marginBottom: 5, width: "100%" }}
              />
              <input
                placeholder="رابط API"
                value={newProvider.apiUrl}
                onChange={(e) => setNewProvider({ ...newProvider, apiUrl: e.target.value })}
                style={{ marginBottom: 5, width: "100%" }}
              />
              <input
                placeholder="API Key"
                value={newProvider.apiKey}
                onChange={(e) => setNewProvider({ ...newProvider, apiKey: e.target.value })}
                style={{ marginBottom: 5, width: "100%" }}
              />
              <button onClick={addProvider}>➕ إضافة</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}