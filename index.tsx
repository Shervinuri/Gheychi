import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

// --- Constants & Data ---
const OPERATORS = [
  { k: "", v: "(همه اپراتورها)" },
  { k: "mci", v: "همراه‌اول (MCI)" },
  { k: "mtn", v: "ایرانسل (MTN)" },
  { k: "mkh", v: "مخابرات (MKH)" },
  { k: "rtl", v: "رایتل (RTL)" },
  { k: "hwb", v: "های‌وب (HWB)" },
  { k: "ast", v: "آسیاتک (AST)" },
  { k: "sht", v: "شاتل (SHT)" },
  { k: "prs", v: "پارس‌آنلاین (PRS)" },
  { k: "mbt", v: "مبین‌نت (MBT)" },
  { k: "ask", v: "اندیشه‌سبز (ASK)" },
  { k: "rsp", v: "رسپینا (RSP)" },
  { k: "afn", v: "افرانت (AFN)" },
  { k: "ztl", v: "زی‌تل (ZTL)" },
  { k: "psm", v: "پیشگامان (PSM)" },
  { k: "arx", v: "آراکس (ARX)" },
  { k: "smt", v: "سامانتل (SMT)" },
  { k: "fnv", v: "فن‌آوا (FNV)" },
  { k: "dbn", v: "دیده‌بان‌نت (DBN)" },
  { k: "apt", v: "آپتل (APT)" }
];

const COUNTRIES = [
  { code: "ir", name: "🇮🇷 Iran" },
  { code: "us", name: "🇺🇸 United States" },
  { code: "de", name: "🇩🇪 Germany" },
  { code: "tr", name: "🇹🇷 Turkey" },
  { code: "fr", name: "🇫🇷 France" },
  { code: "gb", name: "🇬🇧 United Kingdom" },
  { code: "nl", name: "🇳🇱 Netherlands" },
  { code: "ca", name: "🇨🇦 Canada" },
  { code: "ru", name: "🇷🇺 Russia" },
  { code: "ua", name: "🇺🇦 Ukraine" },
  { code: "ae", name: "🇦🇪 UAE" },
  { code: "in", name: "🇮🇳 India" },
  { code: "cn", name: "🇨🇳 China" },
  { code: "fi", name: "🇫🇮 Finland" },
  { code: "se", name: "🇸🇪 Sweden" },
  { code: "ch", name: "🇨🇭 Switzerland" },
  { code: "all", name: "🌍 All Locations" },
];

const PROTOCOLS = ["vmess", "vless", "trojan", "shadowsocks", "ss", "wireguard", "tuic", "hysteria", "hy2"];
const NET_TYPES = ["ws", "grpc", "tcp", "reality", "tls"];

// --- Components ---

const InfoIcon = ({ text }) => {
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <span className="info-wrapper" ref={ref}>
      <span className="info-icon" onClick={() => setShow(!show)}>i</span>
      {show && <div className="info-card fade-in">{text}</div>}
    </span>
  );
};

const Section = ({ title, children, isAdvanced = false }) => {
  const [isOpen, setIsOpen] = useState(!isAdvanced);
  
  return (
    <div className={`step-card ${isAdvanced ? 'advanced-card' : ''}`}>
      <div 
        className="step-header" 
        onClick={() => setIsOpen(!isOpen)}
        style={{cursor: isAdvanced ? 'pointer' : 'default'}}
      >
        <span className="step-title">{title}</span>
        <span className="step-toggle">{isOpen ? '▲' : '▼'}</span>
      </div>
      {isOpen && <div className="step-content anim-slide">{children}</div>}
    </div>
  );
};

const CheckboxGroup = ({ options, selected, onChange }) => {
  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter(x => x !== val));
    else onChange([...selected, val]);
  };
  return (
    <div className="seg" style={{justifyContent: 'center'}}>
      {options.map(opt => (
        <span
          key={opt}
          className={`chip ${selected.includes(opt) ? 'active' : ''}`}
          onClick={() => toggle(opt)}
        >
          {opt}
        </span>
      ))}
    </div>
  );
};

// --- Main App ---

const App = () => {
  // State
  // Core Settings
  const [baseUrl, setBaseUrl] = useState("https://v2.alicivil.workers.dev");
  const [count, setCount] = useState("256");
  const [shuffle, setShuffle] = useState("true");
  const [unique, setUnique] = useState("false");

  // Source (List/MyLinks)
  const [sourceMode, setSourceMode] = useState("country"); // Default to country for better UX
  const [listVal, setListVal] = useState("all");
  const [myLinkUrl, setMyLinkUrl] = useState("");
  const [onFileSkip, setOnFileSkip] = useState("");
  const [onFileTake, setOnFileTake] = useState("");

  // IP Settings
  const [ipMode, setIpMode] = useState("none");
  const [ipVal, setIpVal] = useState("");
  const [ipRangeVal, setIpRangeVal] = useState(""); 
  const [ipCount, setIpCount] = useState("");
  const [ipNot, setIpNot] = useState("");

  // Filters & Tech
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedProtocols, setSelectedProtocols] = useState([]);
  const [operator, setOperator] = useState("");
  const [locationFilter, setLocationFilter] = useState(""); 
  const [only, setOnly] = useState("");
  
  // Advanced Network
  const [sni, setSni] = useState("");
  const [port, setPort] = useState("");
  const [address, setAddress] = useState("");
  const [streamSecurity, setStreamSecurity] = useState(""); 

  // Output
  const [target, setTarget] = useState(""); 
  const [configUrl, setConfigUrl] = useState("");

  const [finalUrl, setFinalUrl] = useState("");
  const [jsonParams, setJsonParams] = useState("{}");
  const [isDownloading, setIsDownloading] = useState(false);

  // Builder Logic
  useEffect(() => {
    const params = new URLSearchParams();
    const paramsObj = {};

    const add = (k, v) => {
        if (!v) return;
        const cleanV = v.toString().trim();
        if (!cleanV) return;
        params.set(k, cleanV);
        paramsObj[k] = cleanV;
    };

    // 1. Core
    add("count", count);
    if (shuffle === "true") add("shuffle", "true");
    if (unique === "true") add("unique", "true");

    // 2. Source
    if (sourceMode === "mylinks") {
      // Ensure myLinkUrl is cleaned
      const cleanLink = myLinkUrl.trim();
      let val = "onfile";
      
      const skip = onFileSkip ? onFileSkip.trim() : "";
      const take = onFileTake ? onFileTake.trim() : "";

      if (skip || take) {
        // onfile-SKIP-TAKE-URL
        val += `-${skip || 0}-${take || ''}-${cleanLink}`;
      } else {
        // onfile-URL
        val += `-${cleanLink}`;
      }
      
      if (cleanLink) add("mylinks", val);
    } else if (sourceMode === "country") {
      add("list", listVal || "all");
    } else {
      add("list", listVal || "100");
    }

    // 3. IP
    if (ipMode === "manual") {
      add("ip", ipVal);
    } else if (ipMode === "range") {
      add("ip", ipRangeVal ? `range/${ipRangeVal}` : "range");
    } else if (ipMode === "host") {
      add("ip", "host");
    } else if (ipMode === "file") {
      add("ip", ipVal);
    }
    
    add("ipcount", ipCount);
    add("ipnot", ipNot);

    // 4. Filters & Tech
    if (selectedTypes.length > 0) add("type", selectedTypes.join(","));
    if (selectedProtocols.length > 0) add("protocol", selectedProtocols.join(","));
    add("operator", operator);
    add("locations", locationFilter);
    add("only", only);

    // 5. Advanced
    add("sni", sni);
    add("port", port);
    add("address", address);
    add("streamsecurity", streamSecurity);

    // 6. Output
    if (target && target !== 'hiddify') {
        add("target", target);
    }
    
    add("config", configUrl);

    // Construct
    const qs = params.toString();
    const cleanBase = baseUrl.trim().replace(/\/+$/, "");
    setFinalUrl(qs ? `${cleanBase}/?${qs}` : cleanBase);
    setJsonParams(JSON.stringify(paramsObj, null, 2));

  }, [
    baseUrl, count, shuffle, unique,
    sourceMode, listVal, myLinkUrl, onFileSkip, onFileTake,
    ipMode, ipVal, ipRangeVal, ipCount, ipNot,
    selectedTypes, selectedProtocols, operator, locationFilter, only,
    sni, port, address, streamSecurity,
    target, configUrl
  ]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalUrl).then(() => {
      alert("لینک کپی شد");
    });
  };

  const openLink = () => {
    if (!finalUrl) return;
    
    if (target === 'hiddify') {
        // Hiddify needs the URL to Import
        const hiddifyLink = `hiddify://import/${encodeURIComponent(finalUrl)}#V2.AliCivil-${operator || 'Config'}`;
        window.location.href = hiddifyLink;
    } else {
        // Browser needs to open the URL to show content
        window.open(finalUrl, "_blank");
    }
  };

  const downloadTxt = async () => {
    if (!finalUrl) return;
    setIsDownloading(true);
    try {
      // Step 1: Fetch the content from the generated URL
      const response = await fetch(finalUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const text = await response.text();

      // Step 2: Create a blob from the CONTENT
      const element = document.createElement("a");
      const file = new Blob([text], {type: 'text/plain;charset=utf-8'});
      element.href = URL.createObjectURL(file);
      element.download = "config.txt";
      document.body.appendChild(element); 
      element.click();
      document.body.removeChild(element);
    } catch (e) {
      alert("خطا در دانلود کانفیگ:\n" + e.message + "\n\nممکن است آدرس ورکر یا لینک شما مشکل داشته باشد.");
      console.error(e);
    } finally {
      setIsDownloading(false);
    }
  };

  const reset = () => {
    setCount("256");
    setShuffle("true");
    setUnique("false");
    setSourceMode("country");
    setListVal("all");
    setIpMode("none");
    setOperator("");
    setSelectedTypes([]);
    setSelectedProtocols([]);
    setTarget("");
    setMyLinkUrl("");
  };

  return (
    <div className="wrap">
      <div className="header">
        <h1 className="title">V2.AliCivil Generator</h1>
        <p className="sub">
          ابزار ساخت سابسکریپشن هوشمند
        </p>
      </div>

      <div className="grid">
        {/* LEFT COLUMN: Steps */}
        <div className="col">
          
          <div className="card simple-card" style={{marginBottom:15}}>
             <label className="center-label">
                آدرس سرویس (Base URL)
                <InfoIcon text="آدرس ورکر کلودفلر که اسکریپت روی آن نصب شده است." />
             </label>
             <input value={baseUrl} onChange={e => setBaseUrl(e.target.value)} style={{direction:'ltr', textAlign:'center'}} />
          </div>

          {/* STEP 1: WHAT (Protocols) */}
          <Section title="۱. فیلتر پروتکل و شبکه (Network)">
             <label className="center-label">
                پروتکل‌ها (Protocol)
                <InfoIcon text="انتخاب پروتکل‌های خاص. اگر انتخاب نکنید، همه پروتکل‌ها دریافت می‌شوند." />
             </label>
             <CheckboxGroup options={PROTOCOLS} selected={selectedProtocols} onChange={setSelectedProtocols} />

             <div className="separator"></div>

             <label className="center-label">
                نوع شبکه (Network Type)
                <InfoIcon text="نوع بستر ارتباطی کانفیگ‌ها مثل WS یا Reality." />
             </label>
             <CheckboxGroup options={NET_TYPES} selected={selectedTypes} onChange={setSelectedTypes} />
          </Section>

          {/* STEP 2: WHERE & WHO (Location/Operator) */}
          <Section title="۲. موقعیت و اپراتور (Location & Operator)">
            <label className="center-label">منبع کانفیگ (Source)</label>
            <div className="seg" style={{justifyContent:'center', marginBottom:10}}>
                <span className={`chip ${sourceMode === 'country' ? 'active' : ''}`} onClick={() => setSourceMode('country')}>کشور (Country)</span>
                <span className={`chip ${sourceMode === 'list' ? 'active' : ''}`} onClick={() => setSourceMode('list')}>شماره لیست (List ID)</span>
            </div>

            {sourceMode === 'country' && (
                <select value={listVal} onChange={e => setListVal(e.target.value)} className="center-input">
                    <option value="all">همه کشورها (All)</option>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                </select>
            )}

            {sourceMode === 'list' && (
                <div>
                    <input value={listVal} onChange={e => setListVal(e.target.value)} placeholder="مثلاً 100 یا 1-5" className="center-input" />
                    <div style={{fontSize:9, color:'#666', marginTop:4, textAlign:'center'}}>شماره لیست (List ID) یا بازه عددی را وارد کنید.</div>
                </div>
            )}

            <div style={{marginTop:15}}>
                <label className="center-label">
                    اپراتور (ISP)
                    <InfoIcon text="فقط کانفیگ‌هایی که روی اینترنت این اپراتور سالم هستند را نمایش می‌دهد." />
                </label>
                <select value={operator} onChange={e => setOperator(e.target.value)} className="center-input">
                    {OPERATORS.map(op => <option key={op.k} value={op.k}>{op.v}</option>)}
                </select>
            </div>
          </Section>

          {/* STEP 3: HOW MANY (Count/Params) */}
          <Section title="۳. تنظیمات عمومی (General Settings)">
             <div className="row">
                <div>
                   <label className="center-label">تعداد (Count)</label>
                   <input type="number" value={count} onChange={e => setCount(e.target.value)} className="center-input"/>
                </div>
                <div>
                   <label className="center-label">
                      ترکیب (Shuffle)
                      <InfoIcon text="ترکیب تصادفی کانفیگ‌ها برای جلوگیری از تکراری بودن ترتیب." />
                   </label>
                   <select value={shuffle} onChange={e => setShuffle(e.target.value)} className="center-input">
                      <option value="true">بله</option>
                      <option value="false">خیر</option>
                   </select>
                </div>
             </div>
          </Section>

          {/* STEP 4: ADVANCED (Hidden by default) */}
          <Section title="۴. تنظیمات تخصصی (Advanced)" isAdvanced={true}>
             <label className="center-label">حالت منبع پیشرفته</label>
             <div className="seg" style={{justifyContent:'center'}}>
                <span className={`chip ${sourceMode === 'mylinks' ? 'active' : ''}`} onClick={() => setSourceMode('mylinks')}>لینک شخصی (MyLinks)</span>
                <span className="chip" onClick={() => setSourceMode('country')}>حالت عادی</span>
             </div>

             {sourceMode === 'mylinks' && (
                <div className="anim-fade" style={{marginTop:10, padding:10, border:'1px dashed #333', borderRadius:8}}>
                  <label className="center-label">لینک فایل ساب</label>
                  <input value={myLinkUrl} onChange={e => setMyLinkUrl(e.target.value)} placeholder="https://..." style={{direction:'ltr'}} />
                  <div className="row" style={{marginTop:5}}>
                    <input type="number" placeholder="Skip" value={onFileSkip} onChange={e => setOnFileSkip(e.target.value)} className="center-input"/>
                    <input type="number" placeholder="Take" value={onFileTake} onChange={e => setOnFileTake(e.target.value)} className="center-input"/>
                  </div>
                </div>
             )}
             
             <div className="separator"></div>

             <label className="center-label">استراتژی IP</label>
             <select value={ipMode} onChange={e => setIpMode(e.target.value)} className="center-input">
                <option value="none">غیرفعال</option>
                <option value="range">Range (رنج تصادفی)</option>
                <option value="manual">Manual (دستی)</option>
                <option value="host">Host (دامنه رندوم)</option>
             </select>

             {ipMode !== 'none' && (
                 <div className="anim-fade" style={{marginTop:10}}>
                     {ipMode === 'manual' && <input value={ipVal} onChange={e => setIpVal(e.target.value)} placeholder="IPs: 1.1.1.1, ..." className="center-input" />}
                     {ipMode === 'range' && <input value={ipRangeVal} onChange={e => setIpRangeVal(e.target.value)} placeholder="مثال: 100" className="center-input" />}
                     <div className="row" style={{marginTop:5}}>
                        <input value={ipCount} onChange={e => setIpCount(e.target.value)} placeholder="تعداد IP" className="center-input"/>
                        <input value={ipNot} onChange={e => setIpNot(e.target.value)} placeholder="IP Not" className="center-input"/>
                     </div>
                 </div>
             )}

             <div className="separator"></div>

             <div className="row">
                <div>
                   <label className="center-label">SNI سفارشی</label>
                   <input value={sni} onChange={e => setSni(e.target.value)} className="center-input" placeholder="google.com" />
                </div>
                <div>
                   <label className="center-label">Port</label>
                   <input value={port} onChange={e => setPort(e.target.value)} className="center-input" placeholder="443" />
                </div>
             </div>
             <div style={{marginTop:10}}>
                <label className="center-label">Stream Security</label>
                <select value={streamSecurity} onChange={e => setStreamSecurity(e.target.value)} className="center-input">
                    <option value="">(پیش‌فرض)</option>
                    <option value="tls">TLS</option>
                    <option value="reality">Reality</option>
                </select>
             </div>
          </Section>

        </div>

        {/* RIGHT COLUMN: Output (Sticky) */}
        <div className="col">
          <div className="card sticky-card">
            <label className="center-label">
                ۵. فرمت خروجی (Export)
                <InfoIcon text="انتخاب کنید لینک برای چه برنامه‌ای ساخته شود." />
            </label>
            <select value={target} onChange={e => setTarget(e.target.value)} className="center-input" style={{marginBottom:15}}>
                <option value="">لینک سابسکریپشن (V2Ray/Neko)</option>
                <option value="hiddify">Hiddify (نصب مستقیم)</option>
                <option value="clash">Clash Meta</option>
                <option value="singbox">Sing-box</option>
            </select>

            <div className="out">{finalUrl}</div>

            <div className="btns-stack">
                <button onClick={copyToClipboard}>کپی لینک</button>
                <button className="secondary" onClick={openLink}>
                    {target === 'hiddify' ? 'افزودن به هیدیفای' : 'باز کردن / تست'}
                </button>
                <button 
                  className="secondary" 
                  onClick={downloadTxt} 
                  disabled={isDownloading} 
                  style={{opacity: isDownloading ? 0.7 : 1}}
                >
                    {isDownloading ? 'در حال دانلود...' : 'دانلود فایل (TXT)'}
                </button>
                <button className="secondary danger" onClick={reset}>ریست تنظیمات</button>
            </div>

            <div className="monitor-box">
                <div className="monitor-header">
                    <span>System Monitor</span>
                    <span className="blink">● Live</span>
                </div>
                <div className="monitor-content">
                    <div className="monitor-row"><span>COUNT:</span> {count}</div>
                    <div className="monitor-row"><span>SOURCE:</span> {sourceMode.toUpperCase()}</div>
                    <div className="monitor-row"><span>CLIENT:</span> {target ? target.toUpperCase() : 'RAW'}</div>
                    <div className="monitor-row"><span>PARAMS:</span></div>
                    <pre style={{fontSize:9, whiteSpace:'pre-wrap'}}>{jsonParams}</pre>
                </div>
            </div>

            <div className="footer-pro">
                <div className="footer-line"></div>
                
                <div className="footer-links">
                    <div className="powered">
                        Powered by : <a href="https://t.me/gheychiamoozesh" target="_blank">Gheychi</a>
                    </div>
                    
                    <div className="exclusive">
                        <a href="https://t.me/shervinuri" target="_blank">☬ Exclusive SHΞN™ made</a>
                    </div>
                    
                    <div className="tutorials">
                        <a href="https://t.me/gheychiamoozesh/16" target="_blank">لیست آموزش‌ها + دانلود اپ</a>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById('root'));
root.render(<App />);