"use client";

import { useState, useEffect } from "react";

export default function DomainSearchApp() {
  const [extensions, setExtensions] = useState<string[]>([".com", ".net", ".org", ".co"]);
  const [whoisKey, setWhoisKey] = useState("");
  const [newExt, setNewExt] = useState("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedExt, setEditedExt] = useState("");
  const [showSettings, setShowSettings] = useState(false);

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

  return (
    <div dir="rtl" style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "Arial" }}>
      <h2>🔍 تطبيق البحث عن أسماء النطاقات</h2>

      <button onClick={() => setShowSettings(!showSettings)}>
        ⚙️ الخيارات
      </button>

      {showSettings && (
        <div style={{ marginTop: 20, padding: 20, border: "1px solid #ccc", background: "#f9f9f9" }}>
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
    </div>
  );
}