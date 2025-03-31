import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";

export default function DomainSearchApp() {
  const [domain, setDomain] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ available: 0, unavailable: 0 });
  const [showSettings, setShowSettings] = useState(false);

  const allExtensions = [".com", ".net", ".org", ".co", ".info", ".me", ".store", ".online"];
  const [selectedExtensions, setSelectedExtensions] = useState(allExtensions);
  const [selectAll, setSelectAll] = useState(true);

  const [useWhoisXML, setUseWhoisXML] = useState(true);
  const [useGoDaddy, setUseGoDaddy] = useState(true);
  const [useNamecheap, setUseNamecheap] = useState(true);
  const [useDynadot, setUseDynadot] = useState(false);
  const [useNameCom, setUseNameCom] = useState(false);

  const [whoisXmlApiKey, setWhoisXmlApiKey] = useState("YOUR_WHOISXML_API_KEY");
  const [goDaddyApiKey, setGoDaddyApiKey] = useState("YOUR_GODADDY_API_KEY");
  const [goDaddyApiSecret, setGoDaddyApiSecret] = useState("YOUR_GODADDY_API_SECRET");
  const [namecheapApiKey, setNamecheapApiKey] = useState("YOUR_NAMECHEAP_API_KEY");
  const [namecheapUser, setNamecheapUser] = useState("YOUR_NAMECHEAP_USERNAME");
  const [namecheapIp, setNamecheapIp] = useState("YOUR_NAMECHEAP_CLIENT_IP");

  const toggleExtension = (ext) => {
    setSelectedExtensions(prev =>
      prev.includes(ext) ? prev.filter(e => e !== ext) : [...prev, ext]
    );
  };

  const toggleSelectAll = () => {
    setSelectAll(!selectAll);
    setSelectedExtensions(selectAll ? [] : allExtensions);
  };

  const apiEndpoints = [
    useWhoisXML && {
      name: "WhoisXML",
      url: \`https://domain-availability.whoisxmlapi.com/api/v1?apiKey=\${whoisXmlApiKey}&domainName=\`,
      headers: () => ({}),
    },
    useGoDaddy && {
      name: "GoDaddy",
      url: "https://api.godaddy.com/v1/domains/available?domain=",
      headers: () => ({
        Authorization: \`sso-key \${goDaddyApiKey}:\${goDaddyApiSecret}\`,
        Accept: "application/json",
      }),
    },
    useNamecheap && {
      name: "Namecheap",
      url: \`https://api.namecheap.com/xml.response?ApiUser=\${namecheapUser}&ApiKey=\${namecheapApiKey}&UserName=\${namecheapUser}&ClientIp=\${namecheapIp}&Command=namecheap.domains.check&DomainList=\`,
      headers: () => ({})
    },
    useDynadot && {
      name: "Dynadot",
      url: "https://api.dynadot.com/api3.json/domain/search?key=YOUR_DYNADOT_API_KEY&domain=",
      headers: () => ({})
    },
    useNameCom && {
      name: "Name.com",
      url: "https://api.name.com/v4/domains:check?domainNames=",
      headers: () => ({
        Authorization: "Basic YOUR_NAMECOM_AUTH"
      })
    }
  ].filter(Boolean);

  const searchDomain = async () => {
    setLoading(true);
    setResults([]);
    setSummary({ available: 0, unavailable: 0 });

    const checks = selectedExtensions.flatMap(ext =>
      apiEndpoints.map(async api => {
        const fullDomain = domain.endsWith(ext) ? domain : \`\${domain}\${ext}\`;
        try {
          const response = await fetch(\`\${api.url}\${fullDomain}\`, { headers: api.headers() });
          const data = await response.json();
          const available = data.available || data.DomainInfo?.domainAvailability === "AVAILABLE";
          return { provider: api.name, domain: fullDomain, available };
        } catch {
          return { provider: api.name, domain: fullDomain, error: "خطأ في الاتصال أو في إعدادات API" };
        }
      })
    );

    const responses = await Promise.all(checks);
    setResults(responses);
    setSummary({
      available: responses.filter(r => r.available).length,
      unavailable: responses.filter(r => !r.available && !r.error).length
    });
    setLoading(false);
  };

  const disabledClass = (enabled) => enabled ? "" : "opacity-50 pointer-events-none";

  return (
    <div className="max-w-xl mx-auto mt-10 space-y-4" dir="rtl">
      <Button onClick={() => setShowSettings(true)}>الإعدادات ⚙️</Button>

      {showSettings && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">الإعدادات ⚙️</h2>

            <h3 className="font-semibold">مزودو الخدمة</h3>
            <div className="flex flex-col space-y-2">
              <label><Checkbox checked={useWhoisXML} onCheckedChange={() => setUseWhoisXML(!useWhoisXML)} /> WhoisXML</label>
              <label><Checkbox checked={useGoDaddy} onCheckedChange={() => setUseGoDaddy(!useGoDaddy)} /> GoDaddy</label>
              <label><Checkbox checked={useNamecheap} onCheckedChange={() => setUseNamecheap(!useNamecheap)} /> Namecheap</label>
              <label><Checkbox checked={useDynadot} onCheckedChange={() => setUseDynadot(!useDynadot)} /> Dynadot</label>
              <label><Checkbox checked={useNameCom} onCheckedChange={() => setUseNameCom(!useNameCom)} /> Name.com</label>
            </div>

            <h3 className="font-semibold">امتدادات النطاقات</h3>
            <label><Checkbox checked={selectAll} onCheckedChange={toggleSelectAll} /> تحديد الكل</label>
            <div className="flex flex-wrap gap-2">
              {allExtensions.map(ext => (
                <label key={ext}>
                  <Checkbox checked={selectedExtensions.includes(ext)} onCheckedChange={() => toggleExtension(ext)} /> {ext}
                </label>
              ))}
            </div>

            <Button onClick={() => setShowSettings(false)}>حفظ وإغلاق</Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 space-y-4">
          <h1 className="text-xl font-semibold">البحث عن اسم نطاق</h1>

          <Input className={`text-sm ${disabledClass(useWhoisXML)}`} value={whoisXmlApiKey} onChange={(e) => setWhoisXmlApiKey(e.target.value)} placeholder="WhoisXML API Key" />
          <Input className={`text-sm ${disabledClass(useGoDaddy)}`} value={goDaddyApiKey} onChange={(e) => setGoDaddyApiKey(e.target.value)} placeholder="GoDaddy API Key" />
          <Input className={`text-sm ${disabledClass(useGoDaddy)}`} value={goDaddyApiSecret} onChange={(e) => setGoDaddyApiSecret(e.target.value)} placeholder="GoDaddy API Secret" />
          <Input className={`text-sm ${disabledClass(useNamecheap)}`} value={namecheapApiKey} onChange={(e) => setNamecheapApiKey(e.target.value)} placeholder="Namecheap API Key" />
          <Input className={`text-sm ${disabledClass(useNamecheap)}`} value={namecheapUser} onChange={(e) => setNamecheapUser(e.target.value)} placeholder="Namecheap Username" />
          <Input className={`text-sm ${disabledClass(useNamecheap)}`} value={namecheapIp} onChange={(e) => setNamecheapIp(e.target.value)} placeholder="Namecheap Client IP" />

          <Input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="أدخل اسم النطاق (مثال: example) بدون .com أو غيرها" />

          <Button onClick={searchDomain} disabled={loading}>{loading ? "جاري البحث..." : "بحث"}</Button>
          <p className="text-sm mt-2">✅ المتاح: {summary.available} | ❌ غير المتاح: {summary.unavailable}</p>
        </CardContent>
      </Card>

      {results.map((res, idx) => (
        <Card key={idx}><CardContent className="p-4"><p className="font-bold">المزود: {res.provider}</p><p className="text-sm">النطاق: {res.domain}</p><p>{res.error ? <span className="text-red-500">{res.error}</span> : res.available ? "متاح ✅" : "غير متاح ❌"}</p></CardContent></Card>
      ))}
    </div>
  );
}