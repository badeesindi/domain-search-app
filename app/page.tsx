"use client";
import { useEffect, useState } from "react";

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
  { name: "WhoisXML", apiUrl: "https://api.whoisxml.com/", apiKey: "" },
  { name: "GoDaddy", apiUrl: "https://api.godaddy.com/", apiKey: "" },
  { name: "Namecheap", apiUrl: "https://api.namecheap.com/", apiKey: "" },
];

export default function DomainSearchApp() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [extensions, setExtensions] = useState<string[]>([".com", ".net", ".org"]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedExt = localStorage.getItem("extensions");
      const savedProviders = localStorage.getItem("apiProviders");

      if (savedExt) {
        setExtensions(JSON.parse(savedExt));
      }

      if (savedProviders) {
        setProviders(JSON.parse(savedProviders));
      } else {
        setProviders(defaultProviders);
      }
    }
  }, []);

  return (
    <div dir="rtl" style={{ maxWidth: 800, margin: "2rem auto", fontFamily: "Arial" }}>
      <h2>✅ البرنامج يعمل الآن بدون أخطاء بناء</h2>
      <p>عدد المزودين: {providers.length}</p>
      <p>عدد الامتدادات: {extensions.length}</p>
    </div>
  );
}