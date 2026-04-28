import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar } from "recharts";

// ─── Brand ────────────────────────────────────────────────────
var NAVY  = "#243B55";
var TEAL  = "#20AABB";
var TEALX = "#E8F7FA";
var TEALM = "#A8DCE4";
var BG    = "#F8FAFC";
var CARD  = "#FFFFFF";
var BDR   = "#E2E8F0";
var TXT   = "#1E293B";
var SUB   = "#64748B";
var MUT   = "#94A3B8";
var GRN   = "#16A34A";
var GRNL  = "#DCFCE7";
var RED   = "#DC2626";
var REDL  = "#FEE2E2";
var AMB   = "#D97706";
var AMBL  = "#FEF3C7";
var BLU   = "#2563EB";
var BLUL  = "#EFF6FF";

// ─── Live Rates (auto-updates date daily) ─────────────────────
var _today = new Date();
var _dateStr = _today.toLocaleDateString("en-CA", { month: "long", day: "numeric", year: "numeric" });
var LR = {
  variable5:     3.35,
  fixed5insured: 4.04,
  fixed5conv:    3.99,
  fixed3:        3.84,
  prime:         4.45,
  stressFloor:   5.25,
  bPremium:      1.00,
  asOf:          _dateStr,
};
var B_RATE = LR.fixed5insured + LR.bPremium; // 5.04%

// ─── Math ──────────────────────────────────────────────────────
function calcPmt(principal, annualRate, years, freq) {
  freq = freq || "monthly";
  var nMap = { monthly: 12, biweekly: 26, biweeklyAcc: 26, weekly: 52 };
  var n = nMap[freq] || 12;
  var r = annualRate / 100 / n;
  var p = years * n;
  if (!r || !principal || principal <= 0) return 0;
  return principal * (r * Math.pow(1 + r, p)) / (Math.pow(1 + r, p) - 1);
}

function buildSched(principal, annualRate, years, freq) {
  freq = freq || "monthly";
  var nMap = { monthly: 12, biweekly: 26, biweeklyAcc: 26, weekly: 52 };
  var n = nMap[freq] || 12;
  var r = annualRate / 100 / n;
  var payment = calcPmt(principal, annualRate, years, freq);
  var bal = principal;
  var rows = [];
  for (var yr = 1; yr <= years && bal > 0.01; yr++) {
    var yP = 0, yI = 0;
    for (var pp = 0; pp < n && bal > 0.01; pp++) {
      var i = bal * r;
      var pr = Math.min(payment - i, bal);
      yI += i; yP += pr; bal = Math.max(bal - pr, 0);
    }
    rows.push({ year: yr, principal: Math.round(yP), interest: Math.round(yI), balance: Math.round(bal) });
  }
  return rows;
}

function minDP(price) {
  if (price > 1500000) return price * 0.20;
  if (price <= 500000) return price * 0.05;
  return 25000 + (price - 500000) * 0.10;
}

function cmhcIns(dp, price) {
  if (!price || price > 1500000 || dp / price >= 0.20) return 0;
  var base = price - dp;
  var ltv = base / price;
  var r = 0.04;
  if (ltv <= 0.65) r = 0.006;
  else if (ltv <= 0.75) r = 0.017;
  else if (ltv <= 0.80) r = 0.024;
  else if (ltv <= 0.85) r = 0.028;
  else if (ltv <= 0.90) r = 0.031;
  return base * r;
}

function maxByGDS(income, rate, years, gdsLimit) {
  var gl = income * gdsLimit / 12;
  var r = rate / 100 / 12;
  var n = years * 12;
  if (!r) return gl * n;
  return gl * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
}

function lttCalc(price, prov, ft) {
  var t = 0;
  if (prov === "ON") {
    if (price <= 55000) t = price * 0.005;
    else if (price <= 250000) t = 275 + (price - 55000) * 0.01;
    else if (price <= 400000) t = 2225 + (price - 250000) * 0.015;
    else if (price <= 2000000) t = 4475 + (price - 400000) * 0.02;
    else t = 36475 + (price - 2000000) * 0.025;
    if (ft) t = Math.max(0, t - 4000);
  } else if (prov === "BC") {
    if (price <= 200000) t = price * 0.01;
    else if (price <= 2000000) t = 2000 + (price - 200000) * 0.02;
    else t = 38000 + (price - 2000000) * 0.03;
    if (ft && price <= 835000) t = Math.max(0, t - 8000);
  } else if (prov === "AB") { t = 0;
  } else if (prov === "QC") {
    if (price <= 50000) t = price * 0.005;
    else if (price <= 250000) t = 250 + (price - 50000) * 0.01;
    else if (price <= 500000) t = 2250 + (price - 250000) * 0.015;
    else t = 6000 + (price - 500000) * 0.02;
  } else if (prov === "MB") {
    if (price <= 30000) t = 0;
    else if (price <= 90000) t = (price - 30000) * 0.005;
    else if (price <= 150000) t = 300 + (price - 90000) * 0.01;
    else if (price <= 200000) t = 900 + (price - 150000) * 0.015;
    else t = 1650 + (price - 200000) * 0.02;
  } else { t = price * 0.015; }
  return Math.round(t);
}

// ─── Formatting ────────────────────────────────────────────────
function cma(n) { return Math.round(n || 0).toLocaleString("en-CA"); }
function fd(n) { return "$" + cma(n); }
function fp(n, d) { return (+(n || 0)).toFixed(d !== undefined ? d : 1) + "%"; }
function mc(v, l) {
  if (l === null) return GRN;
  if (v <= l * 0.70) return GRN;
  if (v <= l) return AMB;
  return RED;
}

// ─── Styles ────────────────────────────────────────────────────
var S = {
  lbl: { display: "block", fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.7, marginBottom: 5 },
  pre: { padding: "11px 12px", background: BG, color: MUT, fontWeight: 700, fontSize: 13, borderRight: "1px solid " + BDR, userSelect: "none", flexShrink: 0 },
  suf: { padding: "11px 12px", background: BG, color: MUT, fontWeight: 600, fontSize: 12, borderLeft: "1px solid " + BDR, userSelect: "none", flexShrink: 0 },
  fld: { flex: 1, border: "none", outline: "none", padding: "11px 12px", fontSize: 15, fontWeight: 600, color: TXT, background: "transparent", minWidth: 0 },
  g2:  { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 },
};

function inputWrap(focused) {
  return { display: "flex", alignItems: "center", border: "1.5px solid " + (focused ? TEAL : BDR), borderRadius: 10, overflow: "hidden", background: "#fff", transition: "all 0.15s", boxShadow: focused ? ("0 0 0 3px " + TEALX) : "none" };
}

// ─── Inputs ────────────────────────────────────────────────────
function CurrencyInput(props) {
  var label = props.label, value = props.value, onChange = props.onChange, hint = props.hint, suf = props.suf, small = props.small;
  var focused = useState(false);
  var f = focused[0], setF = focused[1];
  var rawState = useState("");
  var raw = rawState[0], setRaw = rawState[1];

  function onFocus() { setF(true); setRaw(value === 0 ? "" : String(Math.round(value))); }
  function onBlur() { setF(false); onChange(Number(raw.replace(/,/g, "")) || 0); setRaw(""); }
  function onChg(e) { var v = e.target.value.replace(/[^0-9]/g, ""); setRaw(v); onChange(Number(v) || 0); }

  return (
    <div style={{ marginBottom: small ? 10 : 14 }}>
      {label && <label style={S.lbl}>{label}</label>}
      <div style={inputWrap(f)}>
        <span style={S.pre}>$</span>
        <input type="text" inputMode="numeric" value={f ? raw : cma(value)} onFocus={onFocus} onBlur={onBlur} onChange={onChg} style={S.fld} />
        {suf && <span style={S.suf}>{suf}</span>}
      </div>
      {hint && <div style={{ fontSize: 10, color: MUT, marginTop: 3, lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

function NumInput(props) {
  var label = props.label, value = props.value, onChange = props.onChange, suf = props.suf, pre = props.pre, hint = props.hint, min = props.min, max = props.max, small = props.small;
  if (min === undefined) min = 0;
  if (max === undefined) max = 999;
  var focused = useState(false);
  var f = focused[0], setF = focused[1];
  return (
    <div style={{ marginBottom: small ? 10 : 14 }}>
      {label && <label style={S.lbl}>{label}</label>}
      <div style={inputWrap(f)}>
        {pre && <span style={S.pre}>{pre}</span>}
        <input type="number" value={value} min={min} max={max}
          onChange={function(e) { onChange(Number(e.target.value)); }}
          onFocus={function() { setF(true); }} onBlur={function() { setF(false); }}
          style={{ flex: 1, border: "none", outline: "none", padding: "11px 14px", fontSize: 15, fontWeight: 600, color: TXT, background: "transparent", minWidth: 0 }} />
        {suf && <span style={S.suf}>{suf}</span>}
      </div>
      {hint && <div style={{ fontSize: 10, color: MUT, marginTop: 3, lineHeight: 1.4 }}>{hint}</div>}
    </div>
  );
}

function SelInput(props) {
  var label = props.label, value = props.value, onChange = props.onChange, opts = props.opts;
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={S.lbl}>{label}</label>}
      <select value={value} onChange={function(e) { onChange(e.target.value); }}
        style={{ width: "100%", border: "1.5px solid " + BDR, borderRadius: 10, padding: "11px 12px", fontSize: 14, fontWeight: 600, color: TXT, background: "#fff", outline: "none", appearance: "none", cursor: "pointer" }}>
        {opts.map(function(o) { return <option key={o.v} value={o.v}>{o.l}</option>; })}
      </select>
    </div>
  );
}

// ─── Atoms ─────────────────────────────────────────────────────
function Chips(props) {
  var value = props.value, onChange = props.onChange, opts = props.opts;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
      {opts.map(function(pair) {
        var k = pair[0], v = pair[1];
        var active = value === k;
        return (
          <button key={k} onClick={function() { onChange(k); }}
            style={{ padding: "6px 13px", borderRadius: 20, border: "1.5px solid " + (active ? TEAL : BDR), cursor: "pointer", fontSize: 12, fontWeight: 600, background: active ? TEALX : "#fff", color: active ? TEAL : SUB }}>
            {v}
          </button>
        );
      })}
    </div>
  );
}

function Toggle(props) {
  var label = props.label, value = props.value, onChange = props.onChange;
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 0" }}>
      <span style={{ fontSize: 13, color: TXT }}>{label}</span>
      <div onClick={function() { onChange(!value); }}
        style={{ width: 42, height: 24, borderRadius: 12, background: value ? TEAL : MUT, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: value ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
    </div>
  );
}

function Row(props) {
  var label = props.label, value = props.value, color = props.color, sub = props.sub, bold = props.bold, large = props.large, last = props.last;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: last ? "none" : ("1px solid " + BG) }}>
      <div>
        <div style={{ fontSize: 13, color: SUB, fontWeight: bold ? 700 : 400 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: MUT, marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ fontSize: large ? 18 : 14, fontWeight: 700, color: color || TXT }}>{value}</div>
    </div>
  );
}

function Card(props) {
  return (
    <div style={{ background: CARD, borderRadius: 14, padding: "6px 16px 8px", marginBottom: props.mb !== undefined ? props.mb : 14, border: "1px solid " + BDR }}>
      {props.children}
    </div>
  );
}

function HeroPill(props) {
  return (
    <div style={{ background: NAVY, borderRadius: 18, padding: "20px", marginBottom: 14, textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600, marginBottom: 6 }}>{props.label}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: "#fff", letterSpacing: -1.5, lineHeight: 1 }}>{props.value}</div>
      {props.sub && <div style={{ fontSize: 12, color: TEAL, marginTop: 7 }}>{props.sub}</div>}
    </div>
  );
}

function SubTabs(props) {
  var tabs = props.tabs, active = props.active, onChange = props.onChange;
  return (
    <div style={{ display: "flex", background: BG, borderRadius: 12, padding: 4, marginBottom: 18, border: "1px solid " + BDR }}>
      {tabs.map(function(pair) {
        var k = pair[0], v = pair[1];
        var isActive = active === k;
        return (
          <button key={k} onClick={function() { onChange(k); }}
            style={{ flex: 1, padding: "8px 4px", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, borderRadius: 9, background: isActive ? "#fff" : "transparent", color: isActive ? TEAL : MUT, boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}>
            {v}
          </button>
        );
      })}
    </div>
  );
}

function Alert(props) {
  var type = props.type;
  var map = { info: [BLUL, BLU, "ℹ️"], warn: [AMBL, AMB, "⚠️"], ok: [GRNL, GRN, "✅"], err: [REDL, RED, "❌"] };
  var arr = map[type] || map.info;
  return (
    <div style={{ background: arr[0], border: "1px solid " + arr[1] + "40", borderRadius: 12, padding: "11px 14px", fontSize: 12, color: arr[1], marginBottom: 14, lineHeight: 1.5 }}>
      {arr[2]} {props.children}
    </div>
  );
}

function PieTip(props) {
  var active = props.active, payload = props.payload;
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid " + BDR, borderRadius: 8, padding: "7px 12px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 700, color: payload[0].payload.color }}>{payload[0].name}</div>
      <div style={{ fontWeight: 600, color: TXT }}>{fd(payload[0].value)}</div>
    </div>
  );
}

function ChTip(props) {
  var active = props.active, payload = props.payload, label = props.label;
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid " + BDR, borderRadius: 8, padding: "8px 12px", fontSize: 11, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ fontWeight: 700, color: SUB, marginBottom: 3 }}>{"Year " + label}</div>
      {payload.map(function(p, i) { return <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name + ": " + fd(p.value)}</div>; })}
    </div>
  );
}

function RatioMeter(props) {
  var label = props.label, value = props.value, limit = props.limit, isNull = props.isNull;
  if (isNull) {
    return (
      <div style={{ marginBottom: 10, padding: "8px 12px", background: BLUL, borderRadius: 8, fontSize: 11, color: BLU }}>
        <strong>{label}:</strong> Not applicable — equity-based
      </div>
    );
  }
  var color = mc(value, limit);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: TXT }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 800, color: color }}>{fp(value) + " / " + limit + "%"}</span>
      </div>
      <div style={{ height: 6, background: BG, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: Math.min(value / limit * 100, 100) + "%", background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

// ─── Rates Banner ──────────────────────────────────────────────
function RatesBanner(props) {
  var onSelect = props.onSelect, hideBLender = props.hideBLender;
  var rates = [
    { l: "5yr Variable", v: LR.variable5, tag: "Lowest" },
    { l: "5yr Fixed (Insured)", v: LR.fixed5insured, tag: "Popular" },
    { l: "5yr Fixed (Conv.)", v: LR.fixed5conv },
    { l: "3yr Fixed", v: LR.fixed3 },
  ];
  return (
    <div style={{ background: TEALX, border: "1px solid " + TEALM, borderRadius: 14, padding: "12px 16px", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: 0.8 }}>📊 Today's Rates</span>
        <span style={{ fontSize: 10, color: MUT }}>{"Rates as of " + LR.asOf + " — tap to apply"}</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {rates.map(function(r) {
          return (
            <button key={r.l} onClick={function() { onSelect(r.v); }}
              style={{ padding: "8px 14px", borderRadius: 10, border: "1.5px solid " + TEALM, background: "#fff", cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 10, color: SUB, fontWeight: 600 }}>
                {r.l}
                {r.tag && <span style={{ marginLeft: 5, background: TEAL, color: "#fff", borderRadius: 4, padding: "1px 5px", fontSize: 9 }}>{r.tag}</span>}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: TEAL }}>{fp(r.v, 2)}</div>
            </button>
          );
        })}
        <div style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid " + BDR, background: "#fff" }}>
          <div style={{ fontSize: 10, color: SUB, fontWeight: 600 }}>Prime Rate</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: SUB }}>{fp(LR.prime, 2)}</div>
        </div>
        {!hideBLender && (
          <div style={{ padding: "8px 14px", borderRadius: 10, border: "1px solid " + AMB + "50", background: AMBL }}>
            <div style={{ fontSize: 10, color: AMB, fontWeight: 700 }}>B-Lender Fixed</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: AMB }}>{fp(B_RATE, 2)}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Lender Card ───────────────────────────────────────────────
function LenderCard(props) {
  var title = props.title, badge = props.badge, accent = props.accent;
  var rate = props.rate, stressRate = props.stressRate;
  var payment = props.payment, mortgage = props.mortgage, ins = props.ins;
  var dpAmt = props.dpAmt, dpPct = props.dpPct, totalInt = props.totalInt;
  var amortYrs = props.amortYrs, sub1 = props.sub1, sub2 = props.sub2;
  var gds = props.gds, tds = props.tds, gdsLim = props.gdsLim, tdsLim = props.tdsLim;
  var hideGDSTDS = props.hideGDSTDS, affordMode = props.affordMode, maxPrice = props.maxPrice;
  var pass = gdsLim === null ? true : (gds <= gdsLim && tds <= tdsLim);

  return (
    <div style={{ flex: 1, minWidth: 220, background: CARD, borderRadius: 16, border: "2px solid " + accent + "30", overflow: "hidden" }}>
      <div style={{ background: accent, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{title}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", marginTop: 1 }}>{"Rate: " + fp(rate, 2) + " · Stress: " + fp(stressRate, 2)}</div>
        </div>
        <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, padding: "3px 10px", fontSize: 10, fontWeight: 700, color: "#fff" }}>{badge}</div>
      </div>
      <div style={{ padding: "14px 16px 14px", textAlign: "center", borderBottom: "1px solid " + BG }}>
        {affordMode ? (
          <div>
            <div style={{ fontSize: 10, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 4 }}>Max Home Price</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: accent, letterSpacing: -1 }}>{fd(maxPrice)}</div>
            <div style={{ fontSize: 12, color: MUT, marginTop: 4 }}>{"Monthly Payment: "}<strong style={{ color: TXT }}>{fd(payment)}</strong></div>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: 10, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 4 }}>Monthly Payment</div>
            <div style={{ fontSize: 30, fontWeight: 800, color: accent, letterSpacing: -1 }}>{fd(payment)}</div>
          </div>
        )}
        {sub1 && <div style={{ fontSize: 11, color: MUT, marginTop: 3 }}>{sub1}</div>}
      </div>
      <div style={{ padding: "12px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
          {[
            ["Down Payment", fd(dpAmt) + " (" + fp(dpPct) + ")"],
            ["Mortgage", fd(mortgage)],
            ["CMHC", ins > 0 ? fd(ins) : "None"],
            affordMode ? ["Amortization", amortYrs + " yrs"] : ["Total Interest", fd(totalInt)]
          ].map(function(pair) {
            var l = pair[0], v = pair[1];
            return (
              <div key={l}>
                <div style={{ fontSize: 9, color: MUT, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{l}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: (l === "CMHC" && ins > 0) ? AMB : TXT }}>{v}</div>
              </div>
            );
          })}
        </div>
        {!hideGDSTDS && gdsLim !== undefined && (
          <div>
            <RatioMeter label="GDS" value={gds} limit={gdsLim} isNull={gdsLim === null} />
            <RatioMeter label="TDS" value={tds} limit={tdsLim} isNull={tdsLim === null} />
            {gdsLim !== null && (
              <div style={{ background: pass ? GRNL : AMBL, borderRadius: 8, padding: "7px 12px", textAlign: "center", marginTop: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: pass ? GRN : AMB }}>{pass ? "✓ Qualifies" : "⚠ Marginal"}</span>
              </div>
            )}
          </div>
        )}
        {sub2 && <div style={{ fontSize: 10, color: MUT, marginTop: 8, lineHeight: 1.5 }}>{sub2}</div>}
      </div>
    </div>
  );
}

// ─── Disclaimer Footer ─────────────────────────────────────────
var DISC_SHORT = "Rates and calculations are for informational purposes only and subject to change. Final approval subject to lender review and credit qualification. Miracle Financial — FSRA Lic. # 13766.";
var DISC_FULL  = "Any rates, terms, or calculations provided are for informational purposes only and subject to change without notice. This information is confidential and intended for the designated recipient only. Sharing with any third party without written consent of Miracle Financial is strictly prohibited. Final mortgage approval is always subject to full lender review, credit qualification, income verification, and supporting documentation. Miracle Financial is a licensed mortgage brokerage — FSRA Licence # 13766. Nothing displayed constitutes a commitment to lend or a guarantee of rates. © " + new Date().getFullYear() + " Miracle Financial. All rights reserved.";

function DisclaimerFooter() {
  var expanded = useState(false);
  var exp = expanded[0], setExp = expanded[1];
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200, background: "#fff", borderTop: "1px solid " + BDR, boxShadow: "0 -2px 12px rgba(0,0,0,0.06)", padding: exp ? "12px 20px 14px" : "8px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontSize: 10, color: MUT, lineHeight: 1.6, flex: 1 }}>
          <strong style={{ color: SUB, marginRight: 4 }}>DISCLAIMER:</strong>
          {exp ? DISC_FULL : DISC_SHORT}
        </div>
        <button onClick={function() { setExp(!exp); }}
          style={{ border: "1px solid " + BDR, background: BG, color: SUB, borderRadius: 6, padding: "3px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer", flexShrink: 0, marginTop: 1 }}>
          {exp ? "▾ Less" : "▸ Full"}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 1 — PURCHASE
// ══════════════════════════════════════════════════════════════
function PurchaseTab() {
  var priceState = useState(750000);  var price = priceState[0],  setPrice  = priceState[1];
  var dpState    = useState(150000);  var dp    = dpState[0],    setDp     = dpState[1];
  var dpModeS    = useState("dollar");var dpMode= dpModeS[0],   setDpMode = dpModeS[1];
  var rateState  = useState(LR.variable5); var rate = rateState[0], setRate  = rateState[1];
  var amortState = useState(30);      var amort = amortState[0], setAmort  = amortState[1];
  var termState  = useState(5);       var term  = termState[0],  setTerm   = termState[1];
  var freqState  = useState("monthly");var freq = freqState[0],  setFreq   = freqState[1];
  var viewState  = useState("term");  var view  = viewState[0],  setView   = viewState[1];

  var safePrice  = Math.max(price || 0, 1);
  var dpSafe     = Math.max(dp || 0, 0);
  var dpPct      = dpSafe / safePrice * 100;
  var ins        = cmhcIns(dpSafe, safePrice);
  var isInsured  = ins > 0;
  var maxAm      = isInsured ? 25 : 35;
  var am         = Math.min(amort, maxAm);
  var mort       = Math.max(safePrice - dpSafe + ins, 0);
  var pmtVal     = calcPmt(mort, rate, am, freq);
  var schedule   = mort > 0 ? buildSched(mort, rate, am, freq) : [];
  var totInt     = schedule.reduce(function(s, d) { return s + d.interest; }, 0);
  var sr         = Math.max(rate + 2, LR.stressFloor);
  var freqN      = { monthly: 12, biweekly: 26, biweeklyAcc: 26, weekly: 52 }[freq] || 12;
  var freqLbl    = { monthly: "Monthly", biweekly: "Bi-Weekly", biweeklyAcc: "Bi-Wkly Acc.", weekly: "Weekly" }[freq];
  var mortType   = isInsured ? "Insured" : (safePrice <= 1500000 && am <= 25 ? "Insurable" : "Conventional");
  var termRows   = schedule.slice(0, Math.min(term, schedule.length));
  var termInt    = termRows.reduce(function(s, d) { return s + d.interest; }, 0);
  var termPrin   = termRows.reduce(function(s, d) { return s + d.principal; }, 0);
  var termBal    = schedule[Math.min(term, schedule.length) - 1] ? schedule[Math.min(term, schedule.length) - 1].balance : 0;

  // Pre-compute all strings — no template literals in JSX
  var dpPctSafe  = isFinite(dpPct) ? dpPct : 0;
  var cmhcStr    = isInsured ? (" · CMHC: " + fd(ins)) : " · No CMHC";
  var minDpVal   = minDP(safePrice);
  var hintDollar = fp(dpPctSafe) + " · Min: " + fd(minDpVal) + cmhcStr;
  var hintPct    = "= " + fd(dpSafe) + " · Min: " + fp(minDpVal / safePrice * 100) + cmhcStr;
  var amHint     = isInsured ? "Max 25 yrs (insured)" : "Up to 35 yrs (conv.)";
  var srHint     = "Stress test: " + fp(sr, 2);
  var heroLabel  = freqLbl + " Payment · " + am + "yr · " + mortType;
  var rateInfo   = "Rate: " + fp(rate, 2) + " · Stress Test: " + fp(sr, 2);
  var dpDisplay  = fd(dpSafe) + " (" + fp(dpPctSafe) + ")";

  return (
    <div>
      <RatesBanner onSelect={setRate} hideBLender={true} />
      <div className="two-col">
        <div>
          <CurrencyInput label="Home Price" value={price}
            onChange={function(v) {
              var p = Math.max(v || 0, 0);
              setPrice(p);
              if (dpMode === "pct" && p > 0) setDp(Math.round(p * dpPctSafe / 100));
            }} />
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={S.lbl}>Down Payment</label>
              <div style={{ display: "flex", gap: 2, background: BG, borderRadius: 8, padding: 2, border: "1px solid " + BDR }}>
                {[["dollar", "$"], ["pct", "%"]].map(function(pair) {
                  var k = pair[0], v = pair[1];
                  return (
                    <button key={k} onClick={function() { setDpMode(k); }}
                      style={{ padding: "3px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, background: dpMode === k ? TEAL : "transparent", color: dpMode === k ? "#fff" : MUT }}>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
            {dpMode === "dollar"
              ? <CurrencyInput value={dpSafe} onChange={function(v) { setDp(Math.max(v || 0, 0)); }} hint={hintDollar} />
              : <NumInput value={parseFloat(dpPctSafe.toFixed(1))} onChange={function(v) { setDp(Math.round(safePrice * v / 100)); }} suf="%" hint={hintPct} min={0} max={100} />
            }
            {dpSafe < minDpVal && safePrice > 0 && (
              <Alert type="err">{"Min down for " + fd(safePrice) + " is " + fd(minDpVal) + " (" + fp(minDpVal / safePrice * 100) + ")"}</Alert>
            )}
          </div>
          <NumInput label="Interest Rate" value={rate} onChange={setRate} suf="%" hint={srHint} min={0.5} max={25} />
          <div style={S.g2}>
            <NumInput label="Amortization" value={am} onChange={function(v) { setAmort(v); }} suf="yrs" hint={amHint} min={5} max={35} />
            <NumInput label="Term" value={term} onChange={setTerm} suf="yrs" min={1} max={10} />
          </div>
          <div>
            <label style={S.lbl}>Payment Frequency</label>
            <Chips value={freq} onChange={setFreq} opts={[["monthly", "Monthly"], ["biweekly", "Bi-Weekly"], ["biweeklyAcc", "Bi-Wkly Acc."], ["weekly", "Weekly"]]} />
          </div>
        </div>
        <div>
          <div style={{ background: NAVY, borderRadius: 18, padding: "22px 20px", marginBottom: 14, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 600, marginBottom: 6 }}>{heroLabel}</div>
            <div style={{ fontSize: 44, fontWeight: 800, color: "#fff", letterSpacing: -2, lineHeight: 1 }}>{fd(pmtVal)}</div>
            <div style={{ fontSize: 12, color: TEAL, marginTop: 8 }}>{rateInfo}</div>
          </div>
          <Card>
            <Row label="Purchase Price" value={fd(safePrice)} />
            <Row label="Down Payment" value={dpDisplay} color={GRN} />
            {ins > 0 && <Row label="CMHC Insurance" value={fd(ins)} color={AMB} sub="Added to mortgage" />}
            <Row label="Mortgage Amount" value={fd(mort)} bold={true} last={true} />
          </Card>
          <div style={{ marginTop: 14 }}>
            <SubTabs tabs={[["term", "Term View"], ["schedule", "Schedule"], ["chart", "Chart"]]} active={view} onChange={setView} />
            {view === "term" && (
              <Card>
                <Row label={(term + "-Year Payments Total")} value={fd(pmtVal * freqN * Math.min(term, schedule.length))} />
                <Row label="Principal Paid" value={fd(termPrin)} color={GRN} />
                <Row label="Interest Paid" value={fd(termInt)} color={RED} />
                <Row label="Balance at Renewal" value={fd(termBal)} bold={true} large={true} last={true} />
              </Card>
            )}
            {view === "schedule" && (
              <div style={{ background: BG, borderRadius: 14, padding: 12, maxHeight: 280, overflowY: "auto", border: "1px solid " + BDR }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                  <thead>
                    <tr>
                      {["Year", "Principal", "Interest", "Total", "Balance"].map(function(h) {
                        return <th key={h} style={{ padding: "4px 8px", textAlign: "right", color: MUT, fontWeight: 700, fontSize: 9, textTransform: "uppercase", paddingBottom: 8 }}>{h}</th>;
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {schedule.map(function(r) {
                      return (
                        <tr key={r.year} style={{ borderBottom: "1px solid " + BDR }}>
                          <td style={{ padding: "5px 8px", textAlign: "right", color: TEAL, fontWeight: 700 }}>{r.year}</td>
                          <td style={{ padding: "5px 8px", textAlign: "right", color: GRN, fontWeight: 600 }}>{fd(r.principal)}</td>
                          <td style={{ padding: "5px 8px", textAlign: "right", color: RED }}>{fd(r.interest)}</td>
                          <td style={{ padding: "5px 8px", textAlign: "right", color: SUB }}>{fd(r.principal + r.interest)}</td>
                          <td style={{ padding: "5px 8px", textAlign: "right", color: TXT, fontWeight: 700 }}>{fd(r.balance)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {view === "chart" && (
              <div style={{ background: BG, borderRadius: 14, padding: 14, border: "1px solid " + BDR }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Annual Principal vs. Interest</div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={schedule} margin={{ top: 2, right: 4, left: -16, bottom: 0 }} barSize={8}>
                    <CartesianGrid strokeDasharray="3 3" stroke={BDR} />
                    <XAxis dataKey="year" tick={{ fontSize: 10, fill: MUT }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: MUT }} tickLine={false} axisLine={false} tickFormatter={function(v) { return "$" + Math.round(v / 1000) + "k"; }} />
                    <Tooltip content={<ChTip />} />
                    <Bar dataKey="principal" name="Principal" fill={TEAL} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="interest" name="Interest" fill={REDL} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 2 — AFFORDABILITY
// ══════════════════════════════════════════════════════════════
function AffordabilityTab() {
  var incS  = useState(120000);  var income   = incS[0],  setIncome   = incS[1];
  var coS   = useState(0);       var co       = coS[0],   setCo       = coS[1];
  var dpDS  = useState(100000);  var dpDollar = dpDS[0],  setDpDollar = dpDS[1];
  var dpPS  = useState(10);      var dpPctIn  = dpPS[0],  setDpPctIn  = dpPS[1];
  var dpMS  = useState("dollar");var dpMode   = dpMS[0],  setDpMode   = dpMS[1];
  // Separate debt inputs
  var carS  = useState(0);       var carLoan  = carS[0],  setCarLoan  = carS[1];
  var ccS   = useState(0);       var ccPmt    = ccS[0],   setCcPmt    = ccS[1];
  var stuS  = useState(0);       var stuLoan  = stuS[0],  setStuLoan  = stuS[1];
  var othS  = useState(0);       var othDebt  = othS[0],  setOthDebt  = othS[1];
  var rateS = useState(LR.variable5); var aRate = rateS[0], setARate  = rateS[1];
  var amS   = useState(30);      var amort    = amS[0],   setAmort    = amS[1];

  var debt      = carLoan + ccPmt + stuLoan + othDebt;
  var total     = income + co;
  var monthlyInc= total / 12;
  var sr_A      = Math.max(aRate + 2, LR.stressFloor);
  var sr_B      = Math.max(B_RATE + 2, LR.stressFloor);

  // Max mortgage factoring BOTH GDS (32%) and TDS (44%) constraints — take the lower
  // TDS constraint: housing can be at most (44% of income - other debts)
  var tdsRatio_A = monthlyInc > 0 ? Math.max(0, 0.44 - debt / monthlyInc) : 0.44;
  var tdsRatio_B = monthlyInc > 0 ? Math.max(0, 0.60 - debt / monthlyInc) : 0.60;
  var mm_A_gds   = maxByGDS(total, sr_A, amort, 0.32);
  var mm_A_tds   = maxByGDS(total, sr_A, amort, tdsRatio_A);
  var mm_B_gds   = maxByGDS(total, sr_B, amort, 0.60);
  var mm_B_tds   = maxByGDS(total, sr_B, amort, tdsRatio_B);
  var mm_A_base  = Math.min(mm_A_gds, mm_A_tds);
  var mm_B_base  = Math.min(mm_B_gds, mm_B_tds);

  var dp = dpMode === "dollar"
    ? dpDollar
    : Math.max(0, Math.round(mm_A_base * dpPctIn / Math.max(100 - dpPctIn, 1)));

  function handleDpDollar(v) {
    setDpDollar(v);
    var pEst = mm_A_base + v;
    if (pEst > 0) setDpPctIn(parseFloat((v / pEst * 100).toFixed(1)));
    // Auto-clamp amort to 25 when dp drops below 20%
    var newPct = pEst > 0 ? v / pEst * 100 : 0;
    if (newPct < 20 && amort > 25) setAmort(25);
  }
  function handleDpPct(v) {
    setDpPctIn(v);
    setDpDollar(Math.max(0, Math.round(mm_A_base * v / Math.max(100 - v, 1))));
    // Auto-clamp amort to 25 when dp drops below 20%
    if (v < 20 && amort > 25) setAmort(25);
  }

  // A-Lender
  var price_A_est = mm_A_base + dp;
  var isConv_A    = price_A_est > 0 && dp >= price_A_est * 0.20;
  var am_A        = isConv_A ? amort : Math.min(amort, 25);
  var mm_A_gds2   = maxByGDS(total, sr_A, am_A, 0.32);
  var mm_A_tds2   = maxByGDS(total, sr_A, am_A, tdsRatio_A);
  var mm_A        = isConv_A ? mm_A_base : Math.min(mm_A_gds2, mm_A_tds2);
  var price_A     = mm_A + dp;
  var dpPct_A     = price_A > 0 ? dp / price_A * 100 : 0;
  var mPmt_A      = mm_A > 0 ? calcPmt(mm_A, aRate, am_A, "monthly") : 0;
  var gds_A       = monthlyInc > 0 ? mPmt_A / monthlyInc * 100 : 0;
  var tds_A       = monthlyInc > 0 ? (mPmt_A + debt) / monthlyInc * 100 : 0;
  var mortType_A  = !isConv_A ? "Insured" : (am_A <= 25 && price_A <= 1500000 ? "Insurable" : "Conventional");

  // B-Lender: show when dp is >= 20% of A-lender qualifying price (practical threshold)
  var showB    = dpPct_A >= 20;
  var price_B  = mm_B_base + dp;
  var mPmt_B   = mm_B_base > 0 ? calcPmt(mm_B_base, B_RATE, amort, "monthly") : 0;
  var gds_B    = monthlyInc > 0 ? mPmt_B / monthlyInc * 100 : 0;
  var tds_B    = monthlyInc > 0 ? (mPmt_B + debt) / monthlyInc * 100 : 0;
  var dpPct_B  = price_B > 0 ? dp / price_B * 100 : 0;
  // Buying power gain
  var buyingPowerGain = price_B - price_A;

  var dpNeededB  = price_A > 0 ? Math.ceil(price_A * 0.20) : 0;
  var stressNote = "Stress test auto-applied — A: " + fp(sr_A, 2) + " · B: " + fp(sr_B, 2) + " · Combined income: " + fd(total);
  var aCardSub1  = "Max Home Price: " + fd(price_A);
  var aCardSub2  = "GDS 39% · TDS 44% · " + mortType_A + " · " + am_A + "yr";
  var bCardSub1  = "Max Home Price: " + fd(price_B);
  var bCardSub2  = "GDS 60% · TDS 60% · Conventional · " + amort + "yr";
  var bBadge     = "Fixed +" + fp(LR.bPremium, 1);
  var dpHintA    = fp(dpPct_A, 1) + " of max · " + (showB ? "B-lender unlocked ✓" : "Need " + fd(dpNeededB) + " (20%) for B-lender");
  var dpHintP    = "= " + fd(dp) + " · " + (showB ? "B-lender unlocked ✓" : "Need " + fd(dpNeededB) + " (20%) for B-lender");

  return (
    <div>
      <RatesBanner onSelect={setARate} hideBLender={true} />

      {/* Inputs */}
      <div style={{ background: CARD, borderRadius: 16, padding: "16px 20px", border: "1px solid " + BDR, marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(155px,1fr))", gap: 12, marginBottom: 14 }}>
          <CurrencyInput label="Annual Gross Income" value={income} onChange={setIncome} small={true} />
          <CurrencyInput label="Co-Applicant Income" value={co} onChange={setCo} hint="Optional" small={true} />
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <label style={S.lbl}>Down Payment</label>
              <div style={{ display: "flex", gap: 2, background: BG, borderRadius: 7, padding: 2, border: "1px solid " + BDR }}>
                {[["dollar", "$"], ["pct", "%"]].map(function(pair) {
                  var k = pair[0], v = pair[1];
                  return (
                    <button key={k} onClick={function() { setDpMode(k); }}
                      style={{ padding: "2px 9px", borderRadius: 5, border: "none", cursor: "pointer", fontSize: 10, fontWeight: 700, background: dpMode === k ? TEAL : "transparent", color: dpMode === k ? "#fff" : MUT }}>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
            {dpMode === "dollar"
              ? <CurrencyInput value={dpDollar} onChange={handleDpDollar} hint={dpHintA} small={true} />
              : <NumInput value={dpPctIn} onChange={handleDpPct} pre="%" hint={dpHintP} min={1} max={50} small={true} />
            }
          </div>
          <NumInput label="A-Lender Rate" value={aRate} onChange={setARate} suf="%" hint={"B-Lender fixed: " + fp(B_RATE, 2)} min={0.5} max={25} small={true} />
          <NumInput label="Amortization" value={am_A} onChange={setAmort} suf="yrs" hint={isConv_A ? "Up to 30 yrs (conv.)" : "Auto-set to 25 (insured) · Can increase to 30"} min={5} max={30} small={true} />
        </div>

        {/* Separate debt inputs */}
        <div style={{ borderTop: "1px solid " + BG, paddingTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>
            Monthly Debt Payments
            {debt > 0 && <span style={{ marginLeft: 8, color: AMB, fontWeight: 600, textTransform: "none", fontSize: 11 }}>{"Total: " + fd(debt) + "/mo — reduces buying power"}</span>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 10 }}>
            <CurrencyInput label="Car Loan / Lease" value={carLoan} onChange={setCarLoan} small={true} />
            <CurrencyInput label="Credit Cards" value={ccPmt} onChange={setCcPmt} small={true} />
            <CurrencyInput label="Student Loan" value={stuLoan} onChange={setStuLoan} small={true} />
            <CurrencyInput label="Other Debts" value={othDebt} onChange={setOthDebt} small={true} />
          </div>
        </div>

        <div style={{ marginTop: 10, padding: "8px 12px", background: AMBL, borderRadius: 10, fontSize: 11, color: AMB }}>{stressNote}</div>
      </div>

      {/* Lender cards — A-lender blurred when B is shown */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 220, filter: showB ? "opacity(0.65)" : "none", transition: "filter 0.3s" }}>
          <LenderCard title="A-Lender (Bank / Monoline)" badge="Standard" accent={TEAL}
            rate={aRate} stressRate={sr_A} payment={mPmt_A} mortgage={mm_A} ins={0}
            dpAmt={dp} dpPct={dpPct_A} totalInt={0}
            gds={gds_A} tds={tds_A} gdsLim={39} tdsLim={44}
            amortYrs={am_A} affordMode={true} maxPrice={price_A}
            sub1={aCardSub1} sub2={aCardSub2} />
        </div>

        {showB ? (
          <div style={{ flex: 1, minWidth: 220 }}>
            <LenderCard title="B-Lender (Alt. Lender)" badge={bBadge} accent={AMB}
              rate={B_RATE} stressRate={sr_B} payment={mPmt_B} mortgage={mm_B_base} ins={0}
              dpAmt={dp} dpPct={dpPct_B} totalInt={0}
              gds={gds_B} tds={tds_B} gdsLim={60} tdsLim={60}
              amortYrs={amort} affordMode={true} maxPrice={price_B}
              sub1={bCardSub1} sub2={bCardSub2} />
          </div>
        ) : (
          <div style={{ flex: 1, minWidth: 220, background: BG, borderRadius: 16, border: "2px dashed " + BDR, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
            <div>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🔒</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: SUB, marginBottom: 6 }}>B-Lender Requires 20% Down</div>
              <div style={{ fontSize: 11, color: MUT, lineHeight: 1.6 }}>
                {"Minimum down payment: "}
                <strong style={{ color: AMB }}>{fd(dpNeededB)}</strong>
              </div>
              <button onClick={function() { setDpMode("dollar"); setDpDollar(dpNeededB); setDpPctIn(20); }}
                style={{ marginTop: 12, padding: "7px 16px", borderRadius: 8, border: "1.5px solid " + AMB, background: AMBL, color: AMB, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                {"Set to " + fd(dpNeededB)}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* B-Lender buying power banner */}
      {showB && buyingPowerGain > 0 && (
        <div style={{ background: NAVY, borderRadius: 14, padding: "14px 20px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div>
            <div style={{ fontSize: 10, color: TEAL, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>B-Lender Buying Power</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", marginTop: 2 }}>
              {"Client qualifies for "}
              <span style={{ color: AMB }}>{fd(buyingPowerGain) + " more"}</span>
              {" with B-lender at " + fp(B_RATE, 2)}
            </div>
            <div style={{ fontSize: 11, color: MUT, marginTop: 2 }}>
              {"Monthly payment difference: " + fd(mPmt_B - mPmt_A) + "/mo more · Bridge to A-lender within 1–2 years"}
            </div>
          </div>
          <a href="https://miraclefinancial.ca/booking" target="_blank" rel="noreferrer"
            style={{ background: TEAL, color: NAVY, padding: "9px 18px", borderRadius: 10, fontSize: 12, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}>
            Discuss Options →
          </a>
        </div>
      )}

      {/* Lender info notes */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ background: TEALX, border: "1px solid " + TEALM, borderRadius: 12, padding: "12px 14px", fontSize: 12, color: TEAL }}>
          <strong>B-Lender:</strong> Higher GDS/TDS limits (60/60), flexible credit requirements, ideal for bruised credit or non-traditional income. Rates typically 1–2% above A-lender. Bridge to A-lender once established.
        </div>
        <div style={{ background: BLUL, border: "1px solid " + BLU + "20", borderRadius: 12, padding: "12px 14px", fontSize: 12, color: BLU }}>
          <strong>Private Lender:</strong> No GDS/TDS requirements. Equity-based up to 75–80% LTV. Higher rates apply. Contact Miracle Financial to discuss private lending scenarios.
        </div>
      </div>
    </div>
  );
}


// ══════════════════════════════════════════════════════════════
// TAB 3 — DEBT CONSOLIDATION
// ══════════════════════════════════════════════════════════════
var DC_COLS = [TEAL, AMB, RED, "#8B5CF6", "#06B6D4", "#10B981"];
var DC_DEF = [
  { id: "c1", label: "Credit Card 1", rate: 19.99, balance: 8000, minPmt: 240 },
  { id: "c2", label: "Credit Card 2", rate: 22.99, balance: 5500, minPmt: 165 },
  { id: "ca", label: "Car Loan",      rate: 7.99,  balance: 18000, minPmt: 380 },
  { id: "lo", label: "Line of Credit",rate: 9.50,  balance: 12000, minPmt: 120 },
];

function DebtConsolidationTab() {
  var hvS   = useState(750000);  var homeValue   = hvS[0],   setHomeValue   = hvS[1];
  var mbS   = useState(420000);  var mortBal     = mbS[0],   setMortBal     = mbS[1];
  var crS   = useState(5.74);    var currentRate = crS[0],   setCurrentRate = crS[1];
  var nrS   = useState(LR.variable5); var newRate = nrS[0],  setNewRate     = nrS[1];
  var caS   = useState(20);      var currentAmort= caS[0],   setCurrentAmort= caS[1];
  var amS   = useState(30);      var amort       = amS[0],   setAmort       = amS[1];
  var debtsS= useState(DC_DEF);  var debts       = debtsS[0], setDebts      = debtsS[1];
  var ndS   = useState({ label: "", rate: "", balance: "", minPmt: "" });
  var newDebt = ndS[0], setNewDebt = ndS[1];
  var viewS = useState("compare"); var view = viewS[0], setView = viewS[1];

  function upd(id, f, v) { setDebts(function(d) { return d.map(function(x) { return x.id === id ? Object.assign({}, x, { [f]: v }) : x; }); }); }
  function rem(id) { setDebts(function(d) { return d.filter(function(x) { return x.id !== id; }); }); }
  function add() {
    if (!newDebt.label || !newDebt.balance) return;
    setDebts(function(d) { return d.concat([Object.assign({}, newDebt, { id: "d" + Date.now() })]); });
    setNewDebt({ label: "", rate: "", balance: "", minPmt: "" });
  }

  var totalDebtBal  = debts.reduce(function(s, d) { return s + (parseFloat(d.balance) || 0); }, 0);
  var totalDebtPmt  = debts.reduce(function(s, d) { return s + (parseFloat(d.minPmt) || 0); }, 0);
  var avgDebtRate   = totalDebtBal > 0 ? debts.reduce(function(s, d) { return s + (parseFloat(d.rate) || 0) * (parseFloat(d.balance) || 0); }, 0) / totalDebtBal : 0;
  var equity        = Math.max(homeValue - mortBal, 0);
  var maxLoan       = Math.max(homeValue * 0.80, 0);
  var rawNew        = mortBal + totalDebtBal;
  var ltvExceeds    = rawNew > maxLoan && maxLoan > 0;
  var finalPrincipal= Math.max(Math.min(rawNew, maxLoan > 0 ? maxLoan : rawNew), 0);

  // Current: existing mortgage payment at current rate + all debt minimums
  var existingMortPmt = mortBal > 0 ? calcPmt(mortBal, currentRate, currentAmort, "monthly") : 0;
  var currentTotal    = totalDebtPmt + existingMortPmt;

  // New: consolidated mortgage at new rate
  var consolidatedPmt = finalPrincipal > 0 ? calcPmt(finalPrincipal, newRate, amort, "monthly") : 0;
  var savings         = isFinite(currentTotal - consolidatedPmt) ? currentTotal - consolidatedPmt : 0;

  // Rate savings on the mortgage portion alone
  var mortPmtAtNewRate = mortBal > 0 ? calcPmt(mortBal, newRate, currentAmort, "monthly") : 0;
  var mortRateSavings  = existingMortPmt - mortPmtAtNewRate;
  var rateDrop         = currentRate - newRate;

  var pieData = debts.map(function(d, i) { return { name: d.label, value: parseFloat(d.balance) || 0, color: DC_COLS[i % DC_COLS.length] }; });

  return (
    <div>
      {/* Defeat the Rate banner */}
      <div style={{ background: NAVY, borderRadius: 16, padding: "16px 22px", marginBottom: 18, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: TEAL, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 6 }}>⚡ Defeat the Rate</div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            {/* Mortgage rate drop */}
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Current Mortgage Rate</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: RED }}>{fp(currentRate, 2)}</div>
            </div>
            <div style={{ fontSize: 22, color: MUT }}>→</div>
            <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>New Rate</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: GRN }}>{fp(newRate, 2)}</div>
            </div>
            {rateDrop > 0 && (
              <div style={{ background: "rgba(32,170,187,0.15)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: TEAL, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Rate Saving</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: TEAL }}>{"-" + fp(rateDrop, 2)}</div>
              </div>
            )}
            {/* Debt rate */}
            {totalDebtBal > 0 && (
              <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "8px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Avg Debt Rate</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: AMB }}>{fp(avgDebtRate, 2)}</div>
              </div>
            )}
          </div>
          <div style={{ fontSize: 11, color: MUT, marginTop: 8 }}>
            {"Eliminating " + fd(totalDebtBal) + " in high-interest debt · 80% LTV max: " + fd(maxLoan)}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 10, color: MUT, marginBottom: 2 }}>Monthly Savings</div>
          <div style={{ fontSize: 30, fontWeight: 800, color: savings > 0 ? GRN : RED }}>{fd(Math.abs(savings))}</div>
          <div style={{ fontSize: 10, color: MUT, marginTop: 2 }}>{"vs. " + fd(currentTotal) + "/mo today"}</div>
        </div>
      </div>

      {/* 3 KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
        {[
          ["Current Monthly", fd(currentTotal), fp(currentRate, 2) + " · all debts", RED],
          ["After Consolidation", fd(consolidatedPmt), fp(newRate, 2) + " · " + amort + " yrs", GRN],
          ["Monthly Savings", fd(Math.abs(savings)), savings > 0 ? "Back in your pocket" : "Review — higher", savings > 0 ? TEAL : RED]
        ].map(function(arr) {
          return (
            <div key={arr[0]} style={{ background: CARD, borderRadius: 14, padding: "14px 16px", textAlign: "center", border: "1px solid " + BDR }}>
              <div style={{ fontSize: 9, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>{arr[0]}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: arr[3] }}>{arr[1]}</div>
              <div style={{ fontSize: 10, color: MUT, marginTop: 3 }}>{arr[2]}</div>
            </div>
          );
        })}
      </div>

      <div className="two-col">
        <div>
          {/* Home equity + rates */}
          <div style={{ background: BLUL, borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1px solid " + BLU + "20" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: BLU, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>🏠 Home Equity (Refinance — max 80% LTV)</div>
            <CurrencyInput label="Home Value" value={homeValue} onChange={setHomeValue} hint={"Available equity: " + fd(equity) + " · Max loan: " + fd(maxLoan)} small={true} />
            <CurrencyInput label="Current Mortgage Balance" value={mortBal} onChange={setMortBal} small={true} />
            <div style={S.g2}>
              <NumInput label="Current Amortization Remaining" value={currentAmort} onChange={setCurrentAmort} suf="yrs" min={1} max={35} small={true} />
              <div />
            </div>
          </div>

          {/* Rate comparison inputs */}
          <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px", marginBottom: 14, border: "1px solid " + BDR }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>📊 Rate Comparison</div>
            <div style={S.g2}>
              <div>
                <NumInput label="Current Rate" value={currentRate} onChange={setCurrentRate} suf="%" hint={"Mortgage pmt: " + fd(existingMortPmt) + "/mo"} min={0.5} max={25} small={true} />
              </div>
              <div>
                <NumInput label="New Rate" value={newRate} onChange={setNewRate} suf="%" hint={"New pmt: " + fd(mortPmtAtNewRate) + "/mo on mortgage"} min={0.5} max={25} small={true} />
              </div>
            </div>
            <RatesBanner onSelect={setNewRate} hideBLender={true} />
            <div style={S.g2}>
              <NumInput label="New Amortization" value={amort} onChange={setAmort} suf="yrs" min={5} max={35} small={true} />
              <div />
            </div>
            {rateDrop > 0 && (
              <div style={{ background: GRNL, border: "1px solid " + GRN + "40", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: GRN }}>
                {"Rate drops " + fp(rateDrop, 2) + " — saving " + fd(mortRateSavings) + "/mo on mortgage alone"}
              </div>
            )}
            {ltvExceeds && <Alert type="err">{"Exceeds 80% LTV (" + fp(rawNew / homeValue * 100) + "). Capped at " + fd(maxLoan) + "."}</Alert>}
          </div>

          <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px", border: "1px solid " + BDR }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 10 }}>💳 Debts to Consolidate</div>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.3fr 1fr 22px", gap: 4, marginBottom: 6 }}>
              {["Debt", "Rate%", "Balance", "Min Pmt", ""].map(function(h) {
                return <div key={h} style={{ fontSize: 9, fontWeight: 700, color: MUT, textTransform: "uppercase" }}>{h}</div>;
              })}
            </div>
            {debts.map(function(d) {
              return (
                <div key={d.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.3fr 1fr 22px", gap: 4, marginBottom: 5, alignItems: "center" }}>
                  {[["label", "text", d.label, TXT], ["rate", "number", d.rate, RED], ["balance", "number", d.balance, TXT], ["minPmt", "number", d.minPmt, SUB]].map(function(arr) {
                    var f = arr[0], t = arr[1], v = arr[2], col = arr[3];
                    return (
                      <input key={f} type={t} value={v}
                        onChange={function(e) { upd(d.id, f, e.target.value); }}
                        style={{ border: "1.5px solid " + BDR, borderRadius: 7, padding: "6px 7px", fontSize: 11, fontWeight: 600, color: col, outline: "none", textAlign: t === "number" ? "right" : "left", width: "100%", background: "#fff" }} />
                    );
                  })}
                  <button onClick={function() { rem(d.id); }} style={{ border: "none", background: "none", cursor: "pointer", color: MUT, fontSize: 16, fontWeight: 700, padding: 0 }}>×</button>
                </div>
              );
            })}
            <div style={{ borderTop: "1px dashed " + BDR, paddingTop: 8, marginTop: 4 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.3fr 1fr 22px", gap: 4, alignItems: "center" }}>
                {[["label", "text", "Debt name"], ["rate", "number", "Rate %"], ["balance", "number", "Balance"], ["minPmt", "number", "Min Pmt"]].map(function(arr) {
                  var f = arr[0], t = arr[1], ph = arr[2];
                  return (
                    <input key={f} type={t} placeholder={ph} value={newDebt[f]}
                      onChange={function(e) { setNewDebt(function(nd) { var copy = Object.assign({}, nd); copy[f] = e.target.value; return copy; }); }}
                      style={{ border: "1.5px dashed " + MUT, borderRadius: 7, padding: "6px 7px", fontSize: 11, color: TXT, outline: "none", textAlign: t === "number" ? "right" : "left", width: "100%", background: "#fff" }} />
                  );
                })}
                <button onClick={add} style={{ border: "none", background: TEAL, color: "#fff", cursor: "pointer", borderRadius: 7, fontSize: 14, fontWeight: 700, width: 22, height: 28, display: "grid", placeItems: "center" }}>+</button>
              </div>
            </div>
            <div style={{ borderTop: "2px solid " + BDR, marginTop: 8, paddingTop: 8, display: "grid", gridTemplateColumns: "2fr 1fr 1.3fr 1fr 22px", gap: 4 }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: TXT }}>TOTAL</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: RED, textAlign: "right" }}>{fp(avgDebtRate, 1)}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: TXT, textAlign: "right" }}>{fd(totalDebtBal)}</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textAlign: "right" }}>{fd(totalDebtPmt)}</div>
              <div />
            </div>
          </div>
        </div>

        <div>
          <SubTabs tabs={[["compare", "Before vs After"], ["overview", "Overview"]]} active={view} onChange={setView} />
          {view === "compare" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
                {[["BEFORE", currentTotal, REDL, RED], ["AFTER", consolidatedPmt, GRNL, GRN]].map(function(arr) {
                  var l = arr[0], v = arr[1], bg = arr[2], col = arr[3];
                  return (
                    <div key={l} style={{ background: bg, padding: "16px", textAlign: "center" }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>{l}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: col }}>{fd(v) + "/mo"}</div>
                    </div>
                  );
                })}
              </div>
              <Card>
                <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, padding: "8px 0 4px" }}>Before: Individual Payments</div>
                {debts.map(function(d) {
                  return <Row key={d.id} label={d.label} value={fd(parseFloat(d.minPmt) || 0) + "/mo"} sub={d.rate + "% interest"} color={RED} />;
                })}
                <Row label={"Existing Mortgage @ " + fp(currentRate, 2)} value={fd(existingMortPmt) + "/mo"} color={MUT} />
                <Row label="Total Before" value={fd(currentTotal)} color={RED} bold={true} />
                <div style={{ borderTop: "1px dashed " + BDR, margin: "8px 0", paddingTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, paddingBottom: 4 }}>After: One Payment</div>
                  <Row label={"Consolidated at " + fp(newRate, 2)} value={fd(consolidatedPmt) + "/mo"} color={GRN} />
                  <Row label="Total After" value={fd(consolidatedPmt)} color={GRN} bold={true} large={true} last={true} />
                </div>
              </Card>
              <div style={{ background: savings > 0 ? NAVY : REDL, borderRadius: 14, padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 10, color: savings > 0 ? TEAL : RED, textTransform: "uppercase", letterSpacing: 1, fontWeight: 700 }}>Monthly Savings</div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: savings > 0 ? "#fff" : RED }}>{fd(Math.abs(savings))}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 10, color: savings > 0 ? MUT : RED }}>Annually</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: savings > 0 ? GRN : RED }}>{fd(Math.abs(savings * 12))}</div>
                </div>
              </div>
            </div>
          )}
          {view === "overview" && (
            <div>
              <Card>
                <Row label="Current Mortgage Balance" value={fd(mortBal)} />
                <Row label="Total Debts to Consolidate" value={fd(totalDebtBal)} color={RED} />
                <Row label="New Mortgage (uncapped)" value={fd(rawNew)} />
                <Row label="80% LTV Cap" value={fd(maxLoan)} color={ltvExceeds ? RED : GRN} bold={true} />
                <Row label="Final Consolidated Mortgage" value={fd(finalPrincipal)} bold={true} large={true} last={true} />
              </Card>
              <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px", border: "1px solid " + BDR }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Debt Breakdown</div>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <ResponsiveContainer width={100} height={100}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={44} dataKey="value" strokeWidth={0}>
                        {pieData.map(function(d, i) { return <Cell key={i} fill={d.color} />; })}
                      </Pie>
                      <Tooltip content={<PieTip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex: 1 }}>
                    {pieData.map(function(d, i) {
                      return (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: "1px solid " + BG }}>
                          <span style={{ color: SUB }}><span style={{ color: d.color }}>● </span>{d.name}</span>
                          <span style={{ fontWeight: 700, color: TXT }}>{fd(d.value)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 4 — REFINANCE / RENEWAL
// ══════════════════════════════════════════════════════════════
function RefinanceSection() {
  var balS   = useState(450000);  var bal    = balS[0],    setBal    = balS[1];
  var curRS  = useState(5.74);    var curR   = curRS[0],   setCurR   = curRS[1];
  var newRS  = useState(LR.variable5); var newR = newRS[0], setNewR  = newRS[1];
  var amS    = useState(20);      var remAm  = amS[0],     setRemAm  = amS[1];
  var penS   = useState(false);   var showPen= penS[0],    setShowPen= penS[1];
  var pAmtS  = useState(8500);    var pen    = pAmtS[0],   setPen    = pAmtS[1];

  var curPmt = calcPmt(bal, curR, remAm, "monthly");
  var nwPmt  = calcPmt(bal, newR, remAm, "monthly");
  var sav    = curPmt - nwPmt;
  var be     = sav > 0 && showPen ? Math.ceil(pen / sav) : null;
  var cSched = buildSched(bal, curR, remAm);
  var nSched = buildSched(bal, newR, remAm);
  var cInt   = cSched.reduce(function(s, d) { return s + d.interest; }, 0);
  var nInt   = nSched.reduce(function(s, d) { return s + d.interest; }, 0);
  var chartD = cSched.map(function(d, i) {
    return {
      year: d.year,
      Current: Math.round(cSched.slice(0, i + 1).reduce(function(s, dd) { return s + dd.interest; }, 0)),
      Refinanced: Math.round(nSched.slice(0, i + 1).reduce(function(s, dd) { return s + dd.interest; }, 0))
    };
  });
  var savMsg = sav > 0
    ? fd(sav) + "/month saved · " + fd(cInt - nInt - (showPen ? pen : 0)) + " lifetime interest saved"
    : "New rate is higher — no benefit to breaking early.";

  return (
    <div>
      <RatesBanner onSelect={setNewR} hideBLender={true} />
      <div className="two-col">
        <div>
          <CurrencyInput label="Current Mortgage Balance" value={bal} onChange={setBal} />
          <div style={S.g2}>
            <NumInput label="Current Rate" value={curR} onChange={setCurR} suf="%" min={0.5} max={25} />
            <NumInput label="New Rate" value={newR} onChange={setNewR} suf="%" min={0.5} max={25} />
          </div>
          <NumInput label="Remaining Amortization" value={remAm} onChange={setRemAm} suf="yrs" min={1} max={30} />
          <div style={{ background: BG, borderRadius: 12, padding: "4px 14px 10px", marginBottom: 14, border: "1px solid " + BDR }}>
            <Toggle label="Show Break Penalty Analysis" value={showPen} onChange={setShowPen} />
            {showPen && (
              <div style={{ paddingTop: 6 }}>
                <CurrencyInput label="Break Penalty Amount" value={pen} onChange={setPen} hint="3-month interest or IRD — ask your lender" small={true} />
                {be && <Alert type="info">{"Break-even in " + be + " months (" + (be / 12).toFixed(1) + " yrs)"}</Alert>}
              </div>
            )}
          </div>
          <Alert type={sav > 0 ? "ok" : "warn"}>{savMsg}</Alert>
        </div>
        <div>
          <div style={{ background: NAVY, borderRadius: 18, padding: "18px", marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              {[["Current", curPmt, "rgba(255,255,255,0.35)"], ["New", nwPmt, TEAL]].map(function(arr) {
                var l = arr[0], v = arr[1], col = arr[2];
                return (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: col, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>{l + " Payment"}</div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{fd(v)}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>Lifetime Interest Saved</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: sav > 0 ? GRN : RED }}>{sav > 0 ? fd(cInt - nInt) : "—"}</div>
            </div>
          </div>
          <Card mb={14}>
            <Row label="Monthly Savings" value={fd(Math.abs(sav))} color={sav > 0 ? GRN : RED} />
            {showPen && <Row label="Break Penalty" value={fd(pen)} color={RED} />}
            {showPen && be && <Row label="Break-Even" value={be + " months"} bold={true} />}
            <Row label="Net Interest Saved" value={sav > 0 ? fd(cInt - nInt - (showPen ? pen : 0)) : "—"} bold={true} large={true} last={true} />
          </Card>
          <div style={{ background: BG, borderRadius: 14, padding: 14, border: "1px solid " + BDR }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: MUT, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Cumulative Interest</div>
            <ResponsiveContainer width="100%" height={130}>
              <AreaChart data={chartD} margin={{ top: 2, right: 4, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={BDR} />
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: MUT }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: MUT }} tickLine={false} axisLine={false} tickFormatter={function(v) { return "$" + Math.round(v / 1000) + "k"; }} />
                <Tooltip content={<ChTip />} />
                <Area type="monotone" dataKey="Current" stroke={MUT} fill={MUT + "20"} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Refinanced" stroke={TEAL} fill={TEAL + "20"} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function RenewalSection() {
  var balS  = useState(380000);  var bal   = balS[0],   setBal   = balS[1];
  var curRS = useState(5.74);    var curR  = curRS[0],  setCurR  = curRS[1];
  var newRS = useState(LR.variable5); var newR = newRS[0], setNewR = newRS[1];
  var amS   = useState(20);      var remAm = amS[0],    setRemAm = amS[1];
  var termS = useState(5);       var term  = termS[0],  setTerm  = termS[1];

  var curPmt    = calcPmt(bal, curR, remAm, "monthly");
  var nwPmt     = calcPmt(bal, newR, remAm, "monthly");
  var diff      = curPmt - nwPmt;
  var curSched  = buildSched(bal, curR, remAm);
  var newSched  = buildSched(bal, newR, remAm);
  var curTermInt= curSched.slice(0, term).reduce(function(s, d) { return s + d.interest; }, 0);
  var newTermInt= newSched.slice(0, term).reduce(function(s, d) { return s + d.interest; }, 0);
  var newBal    = newSched[term - 1] ? newSched[term - 1].balance : 0;
  var sr        = Math.max(newR + 2, LR.stressFloor);
  var alertMsg  = diff > 0
    ? "Save " + fd(diff) + "/month. Don't auto-renew — call Miracle Financial at 905-588-4242."
    : "New rate is " + fd(Math.abs(diff)) + "/mo higher. Consider a shorter term or variable rate.";

  return (
    <div>
      <RatesBanner onSelect={setNewR} hideBLender={true} />
      <div className="two-col">
        <div>
          <CurrencyInput label="Balance at Renewal" value={bal} onChange={setBal} hint="Outstanding balance when your term expires" />
          <div style={S.g2}>
            <NumInput label="Expiring Rate" value={curR} onChange={setCurR} suf="%" min={0.5} max={25} />
            <NumInput label="New Offered Rate" value={newR} onChange={setNewR} suf="%" min={0.5} max={25} />
          </div>
          <div style={S.g2}>
            <NumInput label="Remaining Amortization" value={remAm} onChange={setRemAm} suf="yrs" min={1} max={30} />
            <NumInput label="New Term" value={term} onChange={setTerm} suf="yrs" min={1} max={10} />
          </div>
          <Alert type="info">{"Switching lenders requires stress test at " + fp(sr, 2) + ". Same lender renewal typically does not."}</Alert>
        </div>
        <div>
          <div style={{ background: NAVY, borderRadius: 18, padding: "18px", marginBottom: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              {[["Expiring " + fp(curR, 2), curPmt, "rgba(255,255,255,0.35)"], ["New " + fp(newR, 2), nwPmt, TEAL]].map(function(arr) {
                var l = arr[0], v = arr[1], col = arr[2];
                return (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: col, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>{l}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{fd(v)}<span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>/mo</span></div>
                  </div>
                );
              })}
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>Monthly Change</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: diff > 0 ? GRN : RED }}>{(diff > 0 ? "-" : "+") + fd(Math.abs(diff)) + "/mo"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 2 }}>{term + "-yr term"}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: diff > 0 ? GRN : RED }}>{(diff > 0 ? "Save " : "Pay ") + fd(Math.abs(diff * 12 * term))}</div>
              </div>
            </div>
          </div>
          <Card>
            <Row label={term + "-Year Interest (expiring)"} value={fd(curTermInt)} color={RED} />
            <Row label={term + "-Year Interest (new rate)"} value={fd(newTermInt)} color={GRN} />
            <Row label="Interest Saved This Term" value={fd(Math.abs(curTermInt - newTermInt))} color={TEAL} bold={true} />
            <Row label="Balance After Term" value={fd(newBal)} bold={true} large={true} last={true} />
          </Card>
          <Alert type={diff > 0 ? "ok" : "warn"}>{alertMsg}</Alert>
        </div>
      </div>
    </div>
  );
}

function RefiRenewalTab() {
  var subS = useState("refinance");
  var sub = subS[0], setSub = subS[1];
  return (
    <div>
      <SubTabs tabs={[["refinance", "Refinance"], ["renewal", "Renewal"]]} active={sub} onChange={setSub} />
      {sub === "refinance" ? <RefinanceSection /> : <RenewalSection />}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TAB 5 — CLOSING COSTS
// ══════════════════════════════════════════════════════════════
function ClosingCostsTab() {
  var prS  = useState(750000);  var price    = prS[0],   setPrice    = prS[1];
  var pvS  = useState("ON");    var prov     = pvS[0],   setProv     = pvS[1];
  var ftS  = useState(false);   var ft       = ftS[0],   setFt       = ftS[1];
  var toS  = useState(false);   var toronto  = toS[0],   setToronto  = toS[1];
  var lgS  = useState(1800);    var legalFees= lgS[0],   setLegalFees= lgS[1];
  var inS  = useState(500);     var inspect  = inS[0],   setInspect  = inS[1];
  var mvS  = useState(2000);    var moving   = mvS[0],   setMoving   = mvS[1];
  var tiS  = useState(350);     var titleIns = tiS[0],   setTitleIns = tiS[1];
  var apS  = useState(500);     var apprais  = apS[0],   setApprais  = apS[1];
  var otS  = useState(0);       var other    = otS[0],   setOther    = otS[1];

  var pTax = lttCalc(price, prov, ft);
  var toTax = 0;
  if (toronto && prov === "ON") {
    if (price <= 55000) toTax = price * 0.005;
    else if (price <= 250000) toTax = 275 + (price - 55000) * 0.01;
    else if (price <= 400000) toTax = 2225 + (price - 250000) * 0.015;
    else if (price <= 2000000) toTax = 4475 + (price - 400000) * 0.02;
    else toTax = 36475 + (price - 2000000) * 0.025;
    if (ft) toTax = Math.max(0, toTax - 4475);
    toTax = Math.round(toTax);
  }
  var totalLTT  = pTax + toTax;
  var others    = legalFees + inspect + titleIns + apprais + moving + other;
  var total     = totalLTT + others;
  var breakdown = [
    { name: "Land Transfer Tax", value: totalLTT, color: TEAL },
    { name: "Legal Fees",        value: legalFees, color: AMB },
    { name: "Title Insurance",   value: titleIns,  color: "#8B5CF6" },
    { name: "Inspection",        value: inspect,   color: GRN },
    { name: "Moving",            value: moving,    color: "#06B6D4" },
    { name: "Appraisal",         value: apprais,   color: "#F97316" },
    { name: "Other",             value: other,     color: MUT },
  ].filter(function(d) { return d.value > 0; });

  return (
    <div className="two-col">
      <div>
        <CurrencyInput label="Purchase Price" value={price} onChange={setPrice} />
        <SelInput label="Province" value={prov} onChange={setProv} opts={[
          { v: "ON", l: "Ontario" }, { v: "BC", l: "British Columbia" },
          { v: "AB", l: "Alberta (No LTT)" }, { v: "QC", l: "Quebec" },
          { v: "MB", l: "Manitoba" }, { v: "NS", l: "Nova Scotia" }
        ]} />
        <div style={{ background: BG, borderRadius: 12, padding: "4px 14px 10px", marginBottom: 14, border: "1px solid " + BDR }}>
          <Toggle label="First-time home buyer rebate" value={ft} onChange={setFt} />
          {prov === "ON" && <Toggle label="Purchasing in Toronto (municipal LTT)" value={toronto} onChange={setToronto} />}
        </div>
        <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px", border: "1px solid " + BDR }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>Other Closing Costs</div>
          <CurrencyInput label="Legal Fees"      value={legalFees} onChange={setLegalFees} small={true} />
          <CurrencyInput label="Home Inspection"  value={inspect}   onChange={setInspect}   small={true} />
          <CurrencyInput label="Title Insurance"  value={titleIns}  onChange={setTitleIns}  small={true} />
          <CurrencyInput label="Appraisal Fee"    value={apprais}   onChange={setApprais}   small={true} />
          <CurrencyInput label="Moving Costs"     value={moving}    onChange={setMoving}    small={true} />
          <CurrencyInput label="Other"            value={other}     onChange={setOther}     small={true} />
        </div>
      </div>
      <div>
        <HeroPill label="Total Closing Costs" value={fd(total)} sub={fp(total / price * 100) + " of purchase price"} />
        <Card>
          <Row label="Provincial Land Transfer Tax" value={fd(pTax)} />
          {ft && pTax < lttCalc(price, prov, false) && <Row label="First-Time Buyer Rebate" value={"−" + fd(lttCalc(price, prov, false) - pTax)} color={GRN} sub="Applied above" />}
          {toronto && prov === "ON" && <Row label="Toronto Municipal LTT" value={fd(toTax)} color={RED} />}
          <Row label="Total Land Transfer Tax" value={fd(totalLTT)} bold={true} />
          <Row label="Other Closing Costs" value={fd(others)} />
          <Row label="Total Closing Costs" value={fd(total)} color={TEAL} bold={true} large={true} last={true} />
        </Card>
        <div style={{ background: CARD, borderRadius: 14, padding: "14px 16px", border: "1px solid " + BDR }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: SUB, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>Breakdown</div>
          <ResponsiveContainer width="100%" height={100}>
            <PieChart>
              <Pie data={breakdown} cx="50%" cy="50%" outerRadius={46} dataKey="value" strokeWidth={0}>
                {breakdown.map(function(d, i) { return <Cell key={i} fill={d.color} />; })}
              </Pie>
              <Tooltip content={<PieTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 8 }}>
            {breakdown.map(function(d) {
              return <span key={d.name} style={{ fontSize: 10, color: SUB }}><span style={{ color: d.color }}>● </span>{d.name}</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// APP SHELL
// ══════════════════════════════════════════════════════════════
// ─── Custom SVG Icons ─────────────────────────────────────────
function IconPurchase(props) {
  var sz = props.size || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V12h6v9"/>
      <circle cx="18" cy="6" r="3" fill="currentColor" stroke="none"/>
      <path d="M17 6h2M18 5v2" stroke="#fff" strokeWidth="1.5"/>
    </svg>
  );
}
function IconAffordability(props) {
  var sz = props.size || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
      <path d="M8 7V5a2 2 0 014 0v2"/>
      <circle cx="12" cy="13" r="2"/>
      <path d="M12 11v-1M12 16v-1"/>
    </svg>
  );
}
function IconDebt(props) {
  var sz = props.size || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2"/>
      <path d="M2 10h20"/>
      <path d="M6 15h4M14 15h4"/>
      <path d="M8 7.5V5M16 7.5V5"/>
    </svg>
  );
}
function IconRefinance(props) {
  var sz = props.size || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
      <path d="M9 21V14h6v7"/>
      <path d="M16 8a4 4 0 010 5.66" strokeDasharray="2 1.5"/>
      <path d="M18.5 5.5l-1 2.5 2.5-1"/>
    </svg>
  );
}
function IconClosing(props) {
  var sz = props.size || 18;
  return (
    <svg width={sz} height={sz} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <path d="M14 2v6h6"/>
      <path d="M8 13h8M8 17h5"/>
      <path d="M15 13l1.5 1.5L19 12"/>
    </svg>
  );
}

var TABS = [
  { id: "purchase", Icon: IconPurchase,      label: "Purchase",            shortLabel: "Purchase" },
  { id: "afford",   Icon: IconAffordability, label: "Affordability",       shortLabel: "Afford" },
  { id: "debt",     Icon: IconDebt,          label: "Debt Consolidation",  shortLabel: "Debt Consol." },
  { id: "existing", Icon: IconRefinance,     label: "Refinance / Renewal", shortLabel: "Refi / Renew" },
  { id: "closing",  Icon: IconClosing,       label: "Closing Costs",       shortLabel: "Closing" },
];

export default function App() {
  var tabS = useState("purchase");
  var tab = tabS[0], setTab = tabS[1];
  var cur = TABS.find(function(t) { return t.id === tab; });

  function renderTab() {
    if (tab === "purchase")  return <PurchaseTab />;
    if (tab === "afford")    return <AffordabilityTab />;
    if (tab === "debt")      return <DebtConsolidationTab />;
    if (tab === "existing")  return <RefiRenewalTab />;
    return <ClosingCostsTab />;
  }

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif", color: TXT, paddingBottom: 64 }}>
      <style>{"* { box-sizing: border-box; margin: 0; padding: 0; } input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } select { cursor: pointer; } .two-col { display: grid; grid-template-columns: 340px 1fr; gap: 24px; } @media(max-width:768px) { .two-col { grid-template-columns: 1fr !important; gap: 16px !important; } } .tab-bar::-webkit-scrollbar { display: none; } .tab-bar { -ms-overflow-style: none; scrollbar-width: none; }"}</style>


      <div style={{ position: "sticky", top: 0, zIndex: 100, background: NAVY, boxShadow: "0 2px 16px rgba(0,0,0,0.18)" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 62 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <a href="https://miraclefinancial.ca" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
              <svg width='38' height='38' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1'><g transform='scale(47.2705618802601) translate(1.2692889107598198, 3.568586720360649)'>                        <g fill='#ffffff'><defs xmlns='http://www.w3.org/2000/svg'/><g xmlns='http://www.w3.org/2000/svg'><path class='fil0' d='M8.5993 4.3242l0 11.759c0.8316,-0.051 1.6982,-0.08 2.5892,-0.0844l-0.0048 -9.8334 -1.9735 -1.0472 -0.0028 -2.5199 3.0405 -2.5983 0 16.0054c0.1301,0.0023 0.2597,0.005 0.3887,0.0083l0 -4.7505 1.9508 -0.9885 0 -4.8609 2.6183 2.2197 -0.0038 3.3968 -1.4942 -0.8446 -0.0482 6.0081c0.6683,0.0642 1.3071,0.1431 1.9096,0.2352l0 -3.8109 1.1148 0.7348 0 3.2696c2.056,0.4026 3.5553,0.9721 4.1633,1.6261 -5.5682,-1.7171 -17.273,-1.7189 -22.8472,0 0.7397,-0.7957 2.7982,-1.4663 5.5741,-1.8632l-0.0153 -10.1017 3.0405 -1.9595z' style='fill: #ffffff;'/></g></g>        </g></svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", letterSpacing: -0.3 }}>Miracle Financial</div>
                <div style={{ fontSize: 9, color: TEAL, letterSpacing: 1.5, textTransform: "uppercase" }}>Mortgage Calculator</div>
              </div>
            </a>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="tel:9055884242" style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", color: "#fff", padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
              </svg>
              905-588-4242
            </a>
            <a href="https://miracle-financial.mtg-app.com/signup" target="_blank" rel="noreferrer"
              style={{ background: "#FF6B1A", color: "#fff", padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 800, textDecoration: "none", boxShadow: "0 4px 14px rgba(255,107,26,0.5)", whiteSpace: "nowrap" }}>
              Get Pre-Approved →
            </a>
          </div>
        </div>
      </div>

      <div style={{ background: "#fff", borderBottom: "2px solid " + BDR, position: "sticky", top: 62, zIndex: 90 }}>
        {(function() {
          var ROW1 = TABS.slice(0, 3);
          var ROW2 = TABS.slice(3);
          function TabBtn(t) {
            var active = tab === t.id;
            return (
              <button key={t.id} onClick={function() { setTab(t.id); }}
                style={{ flex: 1, padding: "11px 6px", border: "none", background: "none", cursor: "pointer",
                  fontWeight: active ? 800 : 600, fontSize: 12, color: active ? TEAL : "#64748b",
                  borderBottom: "3px solid " + (active ? TEAL : "transparent"),
                  transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center",
                  gap: 5, whiteSpace: "nowrap" }}>
                <t.Icon size={14} />
                {t.label}
              </button>
            );
          }
          return (
            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
              <div style={{ display: "flex", borderBottom: "1px solid " + BDR }}>
                {ROW1.map(TabBtn)}
              </div>
              <div style={{ display: "flex" }}>
                {ROW2.map(function(t) {
                  var active = tab === t.id;
                  return (
                    <button key={t.id} onClick={function() { setTab(t.id); }}
                      style={{ flex: 1, padding: "11px 6px", border: "none", background: "none", cursor: "pointer",
                        fontWeight: active ? 800 : 600, fontSize: 12, color: active ? TEAL : "#64748b",
                        borderBottom: "3px solid " + (active ? TEAL : "transparent"),
                        transition: "all 0.15s", display: "flex", alignItems: "center", justifyContent: "center",
                        gap: 5, whiteSpace: "nowrap" }}>
                      <t.Icon size={14} />
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "20px 16px" }}>
        <div style={{ background: CARD, borderRadius: 20, padding: "22px 22px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.03),0 4px 16px rgba(0,0,0,0.05)", marginBottom: 14 }}>
          <div style={{ marginBottom: 18, paddingBottom: 14, borderBottom: "1px solid " + BG }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: TXT, letterSpacing: -0.4, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: TEAL }}><cur.Icon size={20} /></span>
              {cur.label}
            </h2>
          </div>
          {renderTab()}
        </div>
        <div style={{ background: NAVY, borderRadius: 16, overflow: "hidden", marginTop: 10 }}>
          <div style={{ padding: "24px 24px 20px", display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ marginBottom: 12 }}>
                <img src="data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8LCwkMEQ8SEhEPERETFhwXExQaFRERGCEYGh0dHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAIwAmwDASIAAhEBAxEB/8QAHQABAAMBAQEBAQEAAAAAAAAAAAcICQYFBAMCAf/EAFsQAAEDAgMDBQcLEQQJBQEBAAABAgMEBQYHEQgSIQkTMTdBUWFxdHV2sxQYIjI4V4GVsrTSFRYXIzU2QlJVVmJzgpGUobFyktPUJDM0Q1OEk8HRRFSDosJjJv/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCmQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFnNlzZjrsaepsW48gqLfhtd2Wlo9dya4J0oq9rIl7vBXJ0aIqOA4zZsyBv8AmxcWXKr5214Ugl3amuVNHzqnTHCiporuxXdDe+vBfc26MKWDBWPML4dwzbYrfbqbD0aMjZxVyrUT6uc5eLnL2qvFTQu2UNFbLfT263UkFHR00aRwQQsRjI2ImiNa1OCIhQ/lIOuGw+b8fzicCr4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB/cMUs8zIYY3yyyORrGMaquc5V0REROlT67DaLpfrxS2ey0FRX3CqkSOCngYrnvcvcT/v2GgezBs22rLmGDEuK2U10xYqI+PT2UNv4dEevtpO6/s6G91wcNst7LMdElJjLM+hbJVcJaOxzNRWxfivqE7XdvN9Cfharq1LgIiImiJoiAACg/KQdcNh834/nE5fgoPykHXDYfN+P5xOBV8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOky4wPiXMHE8GHcLW59ZWSeyevtY4Wdr5HdDWp3fgTVVRDyLBQpdL7b7YsvNJV1McHObuu7vuRuunbpqasZQ5aYWyvwtHYsNUe6q6OqquREWeqk09s939ETgnYgHM7PGR2G8o7NvwI244iqY0bXXN7eK9qxxJ+BHr8LulehESWQAAAAFB+Ug64bD5vx/OJy/BQflIOuGw+b8fzicCr4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2sCffxYfKVP6Vpr8Y+YOe6PF1mkb7ZtfAqeFJGmwYAAAAAAKD8pB1w2Hzfj+cTl+Cg/KQdcNh834/nE4FXwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB2mVOWGMszb2ltwrapJ2MciVFZJqympkXtkfponDX2KauXTgik5bQez9hrKPIGG6JUzXbEs90p4qiufqyNjVZIrmRRp0N1ROLtVXTsTgBWzCf31Wjx6H5aGwpj1hP76rR49D8tDYUAAAAAAFB+Ug64bD5vx/OJy/BQflIOuGw+b8fzicCr4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASPkxkxjjNS4IywW/mLYx+7UXSqRWU8XRqiL+G7j7Vuq93ROIEeU0E9TUR09NDJNNK5GRxxtVznuXgiIicVVe4WvyE2Qrld0p79me+a10K6PZZ4naVMqcFTnXf7tF/FT2X9lULHZGZC4JyqpY6mhpkud/Vmk12qmIsmqpxSNvRE3p4JxVOlVJXA87DVis2GrLT2awWylttvp27sVPTxoxje6vDpVelVXiq9JAnKGdQkHlun9HKWMK58oZ1CQeW6f0coFBMMSRw4ltcssjY42VkLnvcuiNRHoqqq9iGwVJUU9XTR1VJPFUQStR8csT0cx7V6FRU4KnfMbCQsos5Me5YVjXYbu73UCv3pbbVKslLJx4+w19iq/jNVF74GqwK+5MbVeA8cSQWvEP/8Alb0/RqMqpUdSzO6NGTcNFXuPRvcRVLAtVHNRzVRUVNUVO0D/AEAACg/KQdcNh834/nE5fgoPykHXDYfN+P5xOBV8AAAAAB39mymxXe8o6nMmyU6XC20NbLS11PEirNA1jI3c7u/hM+2cdOLdNVTTVU4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB9dottwu9zp7ZaqGprq6pejIKeniWSSR3ca1OKqfIaR7FmCML2PJixYmt9pgZervTOkra5yb0r/tjkRqOX2rdET2KaJw1XVeIEV5BbIDEbBfs1nK53B8djp5eCfr5G/JYvhcvFC4Fqt9BabdBbbXRU9FRU7EZDTwRoyONqdjWpwRD6QAAAArnyhnUJB5bp/RyljCufKGdQkHlun9HKBnmAABK+TefuYWWUkVNb7m652VmiOtdc5ZIUT/+a+2jXp9qunHiikUADS/JjaUy8zHkgtrql2H77Lo1LfXvRElcvZFL7V/cRF3XL+KTSYzmsWQcss+SGB5ppHySPsFE573uVXOVYW6qqr0qB2xQflIOuGw+b8fzicvwUH5SDrhsPm/H84nAq+AAAAA0F5OxEXIm4IqaouIKj0MBzO1Lstx3Z1XjPLOjbHcXOWWuszNGxz9qvgT8F/arOh3ZovB3T8nX1FXDzgqPQwFkgMap4ZaeeSCeJ8UsblY9j2q1zXIuioqL0Ki9h/BoztO7OVozNgmxFh3mLVi2ONfZo1Gw1+nQ2XTod2JJ8C6pppnziiwXnC9+q7DiC3T265Uj9yenmTRzV6ezgqKmioqaoqKioqoB5gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABqLsl+5zwZ4i70rzLo1F2S/c54M8Rd6V4EpgAAAABXPlDOoSDy3T+jlLGFc+UM6hIPLdP6OUDPMAAAAANX9n3qKwL5v0XoGGUBq/s+9RWBfN+i9AwDuSg/KQdcNh834/nE5fgoPykHXDYfN+P5xOBV8AAAABoNydfUVcPOCo9DAWSK28nX1FXDzgqPQwFkgBGGfmSuFs27HzNxY2gvUDdKO6wxIssf6D+jfj4+1VeHSiopJ4AyTzSy9xTltieWwYot7qeZFVYJ28YamNF0SSN34SfzToVEXgcma25pZe4XzJwxLYMUW9lTCqKsE7URJqWRU4SRu/BX+S9CoqcDOPP8AyVxPlJflhrmPuFjndpRXWKJUjk/QenHck/RVeOmqKqARcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGouyX7nPBniLvSvMujUXZJVHbOeDFaqKnqJycP1rwJTAAAAACufKGdQkHlun9HKWMK58oZ1CQeW6f0coGeYAAAAAav7PvUVgXzfovQMMoDV/Z96isC+b9F6BgHclB+Ug64bD5vx/OJy/BQflIOuGw+b8fzicCr4AAAADQbk6+oq4ecFR6GAskVt5OvqKuHnBUehgLJAAAAOQzrt9Dc8osW0twpIKuD6j1UnNzMRzUeyJzmu0XtRyIqL0oqIp15zObHVZi3yJW+geBkaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGn+x97m3B3i0vp5DMA0/2Pvc24O8Wl9PIBLIAAAAAVz5QzqEg8t0/o5SxhXPlDOoSDy3T+jlAzzAAAAADV/Z96isC+b9F6BhlAav7PvUVgXzfovQMA7koPykHXDYfN+P5xOX4KD8pB1w2Hzfj+cTgVfAAAAAaDcnX1FXDzgqPQwFkitvJ19RVw84Kj0MBZIAAABzObHVZi3yJW+gedMczmx1WYt8iVvoHgZGgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABp/sfe5twd4tL6eQzANP9j73NuDvFpfTyASyAAAAAFc+UM6hIPLdP6OUsYVz5QzqEg8t0/o5QM8wAAAAA1f2feorAvm/RegYZQGr+z71FYF836L0DAO5KD8pB1w2Hzfj+cTl+Cg/KQdcNh834/nE4FXwAAAP9RFVdETVVA0F5OvqKuHnBUehgLJFf9gqw3qwZHzQ3y1VltlqrxNVQR1MSxvfE6KFGv3V46KrXad3QsAABzuY2MrLgDCdRijET547ZTSwxzyQx846NJJGxo5WpxVEVyKumq6IuiKvA+3CuI7DiqzRXnDl2o7rb5vaT00iPbr2ovcVO1F0VO0D1Tmc2OqzFvkSt9A86Y5nNjqsxb5ErfQPAyNAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADT/Y+9zbg7xaX08hmAaf7H3ubcHeLS+nkAlkAAAAAK58oZ1CQeW6f0cpYwrnyhnUJB5bp/RygZ5gAAAABq/s+9RWBfN+i9AwygNX9n3qKwL5v0XoGAdyUH5SDrhsPm/H84nL8FB+Ug64bD5vx/OJwKvgmHJTZ2x/mdDBdKWnis9glVdLnW8GyIi6LzTE9lJxRePBuqabxdHJ7Zuy4y75mt9QfV+9R6L9ULixH7ju7HH7VneXi5PxgKc5O7M+Y2YSQV89H9blkk0d6uuLFa6Rq9scPBz+HFFXdavY4ujk5s95d5ashq6O2pd73HxW6XBqSSNd3Y2+1j726m9p0uUlsAAABB23S5ybNl+RF0R1RSIvfT1Qxf+xn9l3j3F2X96bdsJ3uqt0+qc4xjtYp0T8GSNfYvTwpw6U0XiaAbdXubb54zSfOGGbIF+MkNrzDWJPU9ozBhiw7dXrupXM19QyL31VVdEv9rVvdchOuZ1RT1eUWKKqkniqIJbDWPjliejmPasD9FRU4KnfMkju8BZtY6wXZrhYrTeZJbLcKaamqLdU6yQK2Risc5qKurHaLrq1U4omuqcAOEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADT/Y+9zbg7xaX08hmAaf7H3ubcHeLS+nkAlkAAAAAK58oZ1CQeW6f0cpYwrnyhnUJB5bp/RygZ5gAAAABq/s+9RWBfN+i9AwygNX9n3qKwL5v0XoGAdyUH5SDrhsPm/H84nL8FB+Ug64bD5vx/OJwLP7H3ubcHeLS+nkJZIm2Pvc24O8Wl9PISyAAAAAAQPt5KqbOV0RFVEWtpEXv/AG1DN80f28/c53Px6k9KhnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANP8AY+9zbg7xaX08hmAaf7H3ubcHeLS+nkAlkAAAAAK58oZ1CQeW6f0cpYwrnyhnUJB5bp/RygZ5gAAAABq/s+9RWBfN+i9AwygNX9n3qKwL5v0XoGAdyUH5SDrhsPm/H84nL8FB+Ug64bD5vx/OJwLP7H3ubcHeLS+nkJZIm2Pvc24O8Wl9PISyAAAAAAQBt9qqbPFXovTcqXX+8pnMaM7ffueavylS/KUzmAAAD0rBYrzf56inslsqrjNTU7qmWKnjV72xNVN526nFUTVFXToTVehFPNLDcn37oBvkip/qwsntAbMOE8xXVF7w+sOHMSvVXvmij/0arcvH7axOhyr+G3jxVVR/ADOYHU5lZfYty7vz7Niy0TUM3TFLpvQzt/GjenByfzToVEXgcsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANOdjNVds0YPVyqq81Upx8amMxjTnYy9zRg/8AVVPzqYCXwAAAAArnyhnUJB5bp/RyljCufKGdQkHlun9HKBnmAAAAAGr+z71FYF836L0DDKA1f2feorAvm/RegYB3JQflIOuGw+b8fzicvwUH5SDrhsPm/H84nAs/sfe5twd4tL6eQlkibY+9zbg7xaX08hLIAAAAABXrlA1VNn52i9N2ptf3PM7DRLlBFRNn9dV6bvTafueZ2gAABYbk+/dAN8kVP9WGiRnbyffugG+SKn+rDRIDxcaYUw9jOwzWLE9pprnQTJ7KOZuu6vY5q9LXJ2Kiopkdf6aKjvtwo4EVIoKmSNmq6rutcqJ/Q2LMesWffVd/HpvlqB5gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABpzsZe5owf+qqfnUxmMac7GXuaMH/AKqp+dTAS+AAAAAFc+UM6hIPLdP6OUsYVz5QzqEg8t0/o5QM8wAAAAA1f2feorAvm/RegYZQGr+z71FYF836L0DAO5KD8pB1w2Hzfj+cTl+Cg/KQdcNh834/nE4Fn9j73NuDvFpfTyEskTbH3ubcHeLS+nkJZAAAAAAK58oZ1CQeW6f0cpnmaGcoYqJkLT6r03yn0/6cpnmAAAFhuT790A3yRU/1YaJGdvJ9+6Ab5Iqf6sNEgBj1iz76rv49N8tTYUx6xZ99V38em+WoHmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGnOxl7mjB/6qp+dTGYxpzsZe5owf8Aqqn51MBL4AAAAAVz5QzqEg8t0/o5SxhXPlDOoSDy3T+jlAzzAAAH7QUtTPpzNPNLquibjFXX9x9cdivcrd6OzXF6a6atpnr/ANgPONX9n3qKwL5v0XoGGXEeFsTyN3o8OXh7e62ikVP6GpeQsM1PklginqIpIZo7DRtfG9qtc1yQt1RUXiigdqUH5SDrhsPm/H84nL8FEeUVttxq827HPSUFVURMsEaOfFC5zWr6on4KqIBZXY+9zbg7xaX08hLJFOyJFLDs5YPimjfHI2ml1a9qoqfb5OxSVgAAAAACtvKKdRVv84Kf0M5nyaC8oqqJkXbkVURVxBTonf8AtFQZ9AAABYbk+/dAN8kVP9WGiRnbyffugG+SKn+rDRIAY9Ys++q7+PTfLU2FMesWffVd/HpvlqB5gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB12DMsswcY7rsNYPvFxifppOymVsPH/APq7RifvA5EFlcI7GmZt0Rkt+uFksES+2Y+ZaiZv7Mabi/3yWsK7E+CqNGvxJiu9XaROKtpY46SNfCi77tPA5AKIH6U8E9TM2GnhkmlcujWRtVzl8CIafYb2dcmLCjFpsC2+rkanF9e59VvL3VbI5zf3IiEjWWx2SyQ8xZbPb7ZFppuUlMyFungaiAZW2HKXM6+o11rwDiOeNyatldb5I41/bciN/maMbL+Hb1hPIjDOH8Q0L6C50kc/P073NcrN6oke3VWqqe1ci9PaSUAAAAAAAfBfLLZ77RJRXy00F0pUekiQ1lOyZiOToduuRU1TVePfPvAHh0mDsI0mnqTCtjp9P+Fb4m/0aenT2+gpkRKehpoUTTTm4mt006OhD6QAAP4lljiRFkkYxF6N52gH9g/H1XS/+5h/voPVdL/7mH++gH7A/H1XS/8AuYf76H9RzwSO3Y5o3u7jXIqgfoAAAAAAADh86ssLBmxhSnw5iOquVNS09a2tjfQyMZJzjWPYmqva5FTSR3DTucSA7psQYYkR31Lx1eKbh7H1TSRzaeHdVmpbQAUdu+w/iSJV+pGPLTVp2eqqKSD5KvOLvWyBnHQIvqWmsd106PUlwRuv/Vaw0WAFJdjjKXMbAmeTa/FeFK220f1MqI/VDnMki3lVmib7HKmq6L2l2gABj1iz76rv49N8tTYUrnjPY+yyvtXUV1vrr7ZqqZ7pHc1UNliVzlVVVWyNV3SvY5AM8wWwxZsS4spd+TDGL7TdGJxbHWwvpXqncRW76KvhVPgIcxjkHm7hXfdcsEXOeBnFZ6BqVbNO6qxK5UTwogEZA/uWOSGV0Usbo5GLo5rk0VF7iofwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASNk1kvjrNSsVMO29sNujduz3OrVY6aNe1Edoqvd+i1FXu6dJdnKPZYy3wTHBWXil+uq8M0V1RXxpzDXfoQaq1E6Pbby99AKOZbZQZi5hvY7C+GayopHLotbMiQ0ze79sfoiqncbqveLK5f7EsLebqMe4udIvS6js8eif9aRNVT9hPCWexRmBgLCESx3/FljtSxJupBLVsbImnYkaLvLp3EQivE+1zk5Z1c2ir7rfXpw0oKFyJr4ZlYnwpqB3GBckMq8Gc1JZMGW31VGnsaqrYtTNr+Mj5NVav9nQkVERE0RNEQpliPbhXVzMO4ATT8GavuH9WMZ/+iNsQbX2cVz3koqqy2VF4J6joEcqfDMr+IGix+VVU09JCs9VURQRJ0vkejWp8KmVt+zszaviObcMwcQbj9d5lPVup2r3lbHupp3jh7jcK+4z8/cK6prJfx55XSO/eqgau3nNbLOz6pcsf4Zge3pj+qcTn/wB1HKv8jjLvtP5I25XNXGSVcifgUtDUSa/tbm7/ADMzABoLdds7KqlVW0dtxPXr2OjpImN/e+VF/kcrc9uKzRov1My+r6jueqLkyH5LHlJABba47cGJJNfqdgO00/c5+tkm/ojDna/bPzVqEVKe14VpE7Fjo5nL/wDaVU/kVrAE7V21nnXUa8zfrfR6/wDBtkK6f32uPErNpPO6r153HtW3X/hUlPF8mNCJABIlVnjm9UoqSZi4jbr/AMOsdH8nQ8qpzRzMqVX1RmJi6XXpR15qFT92+cgAPfnxrjKoXWfFt+lXXXV9xld/Vx8Mt8vcqIkt4uD0To3ql6/9zzgB+slTUytVslRK9F6Uc9V1PyAAAAAAAP7illiVVikexV6d1yofVFdrrFu81c62Pd9ruzuTT+Z8QA9qDFuKqfTmMTXqLTo3K+Vun7nHo0+ZOYtMutPj7FUK92O8VDf6POUAHe0uc+bVMiJHmRil2n/EucsnylU9ej2ic6aX/VZgXJ3HX7bHFL8pikVgCbaHaqzwptEkxZBVInZNa6b/APMaHvUO2Rm7T6c9Dhqr0X/fUD01/uSNK6AC1lv23MasVv1Qwbh+oTt5iSaLX97nHSWzbkgVUbc8uJGd19Pdkd/9XRJ/UpeAL82vbWy4m3W3DDmKKRy9KxxQStT4ecRf5HW2javyTrt1J8RVtuc7ThVW2bp76xtcn89DNkAar2bO3KO7bvqPMTDrVd7VtRWtp1XvaSbq68eg7O03m0XePnLTdaG4M013qaoZKmnd1aqmOp/cUkkUjZIpHRvaurXNXRU+EDZUGS1jzQzIsiolqx3iSlYmn2ttylVn91Xbv8iQMP7VOdVp3Wy4kp7pE3oZXUETv3uY1rl+FQNBMZYBwVjKNWYowtabs5U3UlqKZqytT9GT2zfgVCBsf7GWArq2SfCN2uWHKhdVbDI71XT95NHKkieHfXwEdYb23sSwaJiLA9pr+PF1DVSU3Du6PSTX96Em4Z2zcsrhux3m13+yyL7Z7oGTxJ8LHby/3QKyZl7M2a+CUlqfqKl/tzNV9VWhVm0amq6uj0SROCcV3VRO6Q1Ix8cjo5GuY9qqjmuTRUVOxTVXCmdmVGJ9xtox5ZXSP9rFUz+ppHL3EZLuuVfAh+eZ2TWW2ZkD6i/2KnfWys0ZdKNUiqU7i843g/TsR6OTvAZWAsLnhsrY1wKyovGGt/E9hj1e50DP9Lgb3XxJ7ZETpczXtVUaiFegAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAdbljNgKivK3LH1PdLlQ06axWyg0YtU/sSSRVTcj7u7q5e90nJACzF/2wsWx2+O0YDwnYMKWyBiR08bY1nfC1OxvBsaJ3txSH8YZu5m4t323/G96qon+2gZULDCv/xx7rP5HDgD/VVVXVV1VT/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAe9hbGWLcKypJhvE13tC66qlJWPia7wtRdF+FDwQBYPBe13m1YlZHdZ7ZiOnbwVK2mRkmnefFu8e+5HHNZzY3y2zLZLiOiwxV4OxYqK+ojp3Nnoa92urnOVEa6OVdVXe3VReh34yRCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFo8i9lW35k5WWfGk+M6q2yXHn9aZlA2RGc3PJF7ZXprrua9HaBVwF2fWOWr3xa34rb/AIhE20xs4T5R4Zt2IrdfJ75QTVK09W59KkS07lTWNeDnao7R6KvDRUanaBX8AAAAABbzL3YzS/4Is98vOMaq1V9fSMqZaNtuR/Mb6bzWqqvRdUaqa8E0XVD3fWOWr3xa34rb/iAUmBM21DkrS5NV9ipqbEE14S6RTSOdJSpDzfNqxNE0c7XXf/kQyAAAAF0rfsR2uqoKepXMKsas0TZN36ltXTVEXT/WHl4/2ObbhjAmIMSx48q6p9ptlTXNhdbWtSRYonP3VXnF013dNdAKggAAAWB2Zdnijzhwnc75U4pqLQ6ir/UiRR0aTI9Oba/e1V6ae2007wFfgXZ9Y5avfFrfitv+IPWOWr3xa34rb/iAUmBdn1jlq98Wt+K2/wCIeRiLYeuEdO5+HswKWpm09jDX290LVXvvY96//UCnoO6zVymx3llVsixZZX09PK5WwVsLklp5dO49Ohf0XaL3jhQAAAAAAASZs45UT5vY8kw+lwfbaOmo31VVVth5xWIio1rURVRFVXOTt6EVewCMwXZ9Y5avfFrfitv+IPWOWr3xa34rb/iAUmB6+M7BWYWxbdsN3BNKq2VktLIuiojlY5U3k17F01TvKh5AAAAAAAAPrtNtuF3uMFttVDU11bO7chp6eJZJJF7iNTioHyAs/lnsbY2vkEVbjK7UuGKd+jvUzGJU1Kp30RyMZ/eVU7U7Ca7LsbZT0UTUr6rEVzk4bzpaxkbVXvIxiKifCvhAz1BoxWbIWTc8asio71Sqqe3iuLlVP7yOT+RHOOdiOl9TSzYIxlOkzU1jprvE1yPXuLLGiadn4CgUtB2OaGWeNMtrr6gxbZZqNHuVIKlvs6efvskTgvDs4KnaiHHAAAAALfYA2ObbifAmH8SyY8q6V92tlNXOhbbWuSNZYmv3UXnE103tNdAKggulcNiO10tBUVKZhVjliidJu/Utqa6Iq6f6wpaAAAAAAAAABbfLPZAtuMMvrDimTHVXRvutBFVugbbmvSNXtRd1Hc4mumvTodF6xy1e+LW/Fbf8QCkwLs+sctXvi1vxW3/EHrHLV74tb8Vt/wAQCkwLs+sctXvi1vxW3/EHrHLV74tb8Vt/xAKTA9vH9jZhjHeIMNR1LqplpudTQtmczdWRIpXM3lTVdNd3XTU8QAAAAAAAAAAAAAAGmWxL7mLCP/O/PZzM00y2JfcxYR/5357OBMxzGa2DqLH+Xl6wjX6NjuNMrGSL/upUVHRv/ZejV+A6cAY43e31lputXarjTvp6yjnfBURP9tHIxytc1fAqKh8pZjlAsv8A63czabGVFCraDEcarNut9iyqjRrX9HRvN3Hd9d9Ss4AlTZWy/XMTOa0WueNH22hd9ULjq3VFhici7iovBUe5WMXvOXuEVmhOwLl+uGMqZMVV1O1lxxJIk0aq32TKVmqRJ+0u+/h0o5vcAseAAKT8pd928EeLVnyoin5cDlLvu3gjxas+VEU/AAADYuw/cOg8Wj+ShzOe3UhjzzbuPzaQ6aw/cOg8Wj+ShzOe3UhjzzbuPzaQDJoAAC+XJudVmI/La+giKGl8uTc6rMR+W19BEBaYAoHtf5n5iYcz/v8AZ7BjS+Wy3wR0qxU1NWPZGzepo3O0RF7VVV+EC/gMqY87s3WPR6ZjYlVUXVN6ueqfuVdCymyHtJYjxNjCnwHj6oZcJ69HJbrkkbI3pI1qu5uRGoiORURdHaa68F111QLZYjsloxHZKqy323U9xt1UxWTU87N5r0/7KnSipxRURU0UzG2lsrZsp8yp7JE+Se01TPVVsnenF0Kqqbjl7XMVFavd4LomuhqSVj5RbD8NflHasQJG31Varo1iP04pFMxyOT4XNiX4AKBgAAAABf7k9MFrZMq67FtTFu1OIar7Sqpx9Twq5jfBq9ZV76I0ofh+1Vt9vtBZLbFztbX1MdNTs/Ge9yNan71Q1zwVYKTCuELRhqg/2a2UcVLGq9LkY1G7y99dNV76geuDjs3cf2rLjDFNfbuqczPcqWhTVdETnZER7v2Y0kf+zodiioqaouqKBn/yhOC1sea9Ji2ni3aTENKiyOROHqiFEY7was5pe+u8VnNJ9t3Bi4tyIuVVTxb9bYZG3OHRE1VjEVJU17nNuc7TtViGbAAAAAAB0OXeDr7j3F9DhfDtLz9dWP0RXaoyJicXSPXsa1OKr8CaqqIaVZDZL4VylsSQ2yFtZeZ40SuukrE52Ve1rfxI9ehqd7VVXicJsL5YQ4OyyjxZcKZqXzETEnR7m6OhpF0WKNNfxv8AWL3d5v4pYgACuW1JtKUuW1TLhPCkEFxxRuIs8kqKsFAjkRU3kT28iouqN10TVFXXoWkGNMyse4yqn1GJMWXa4byqvNOqFbC3Xp3Y26Mb8CIBrYDH2yYmxHY6ttXZb/dLbUNXVJKWrfE5PhaqFodnba0u1Hc6bD2aVUldbZVSOO8c2iTU69Cc6jU0ezuu03k6V3gLl4uw3YsW2CpsOI7ZT3G3VLVbJDM3VOjg5q9LXJrwcmiovQpm1tN5K3HKHFbWwvmrcOXBznW2sensk04rFJomiPb3ehycU04ommqVVKtF6tSphWlWPnef305vc013t7o00469GhSzbH2hMG4rw1WZeYXoYb6x0zHy3Z6qkMEjHaosGnF7ulN/g3RV03kUCoAAAGsuRPUhgPzbt3zaMyaNZciepDAfm3bvm0YHT337iV/i0nyVMczYy+/cSv8AFpPkqY5gAAAAAAAAasbOHUJgfyJTejQkAj/Zw6hMD+RKb0aEgAAZNfZYzT98vGfx7U/TH2WM0/fLxn8e1P0wNZQZNfZYzT98vGfx7U/TH2WM0/fLxn8e1P0wGe3XfjzzkuPzmQ4w/evq6qvrqiurqmaqq6mV00880ivkle5dXPc5eLnKqqqqvFVU/AAAAAAAAAAAAAAAGmWxL7mLCP8Azvz2czNNMtiX3MWEf+d+ezgTMfjQ1VPXUUFbSTMnpqiNssMjF1a9jk1a5O8qKin7Fd9h7MJ2JcHXfB9wna+vw5WvZBq72T6R73Kzw7rkc3vJuAd7tNYA+yPk7eLFBEj7lCxK22rpqvqiPVUanfc3eZ+2ZZqiouipoqGy5mjtmZfLgTOi4S0sDY7TfNbjRbqaNarl+2s72j9V07GuaBweTuC6vMHMqyYSpWu0rqlEqHt4c1A32Ur9e8xHad1dE7TWK20VJbbdTW6ggZT0lLCyCCFiaNjjaiNa1O8iIiFSuToy/Sls93zIr6dyTVirb7a5ycOZaqLK9O7q9Gt17ObcnaW9A/CarpoauCkkma2eo3uaZ2u3U1cvgTVP3ofuVzw3mEuMdtussVFU87acN2Kqo40aurXVCyQrO7wo5EZ/8ffLGAUn5S77t4I8WrPlRFPy4HKXfdvBHi1Z8qIp+AAAGxdh+4dB4tH8lDmc9upDHnm3cfm0h01h+4dB4tH8lDmc9upDHnm3cfm0gGTQAAF8uTc6rMR+W19BEUNL5cm51WYj8tr6CIC0xmptxe6XxL+qo/msRpWQ7mVs4ZcZg4yrMV4gS7rcaxI0l9T1aMZoxjWN0TdXTg1AMySXdkHDN1xHn7hp9uglWC11SV9ZM1vsYYo+Psl7N52jE77i28ex9k6yRrnQ36REXVWuuHBe8ujUUmDL/AmEsA2dbThCx0tqpXuR0iR6ufK5OhXvcquevhVdAOkK88oHcYKPIF1HI5qSV91p4Y29qq3ekVf3M/mWGM7duPNakx9mBT4fsVSyosmHt+JJmLq2oqXKnOORe1qbrWovQujlRVRUAryAAAAAsNsD4LXEmdSX6ohR9DhymdVOVyaos79WRJ4eL3p+rNEivuwZgxcM5IxXmpi3KzEVS6tXVPZJC32ESeBURz0/WFgZHsjY6SRzWMaiq5zl0RETtUCj/KPYxSrxRh/A9NKix2+B1fVta7/eyexYip3Wsaq+CQsvsxYxXHGSGG7zLKslZHTJR1iuXVyzQ+wc5e+5ER/7SGcWdeLn46zVxFilXudFW1r1pt5eLYG+wiT4GNaWV5N3GG5WYlwHUS8JWtulI3vppHN+9Fi4d5QLm1lNBWUk1JVRNlgnjdHLG7oc1yaKi+FFMkM0cLVGCcw77hSp3ldba2SFjndL49dY3/tMVrvhNdCivKNYN9QY2seN6aLSG7Uy0lU5OjnofaqvfcxyIn6tQKogAAe3gGxuxNjmw4carkW53GCkVU6USSRrVX4EXU8QkrZdSN20HglJdN36qRqmvd0XT+egGpNJTwUlLDS00TYoIWNjjjamiMaiaIid5EQ5jOHFzMB5Y4gxa5jHvt1G6SFj19i+ZdGxtXvK9zU+E6wgjbwWZNnG7JEnsFrKRJf7PPN//W6BnPdK+sulyqblcKmSprKqV0080i6uke5dXOVe6qqfMAAAAHaXTNLHlyy+t+AqrEVWuHqBqsjpWu3d9u9qjZHJxe1vQ1qroiImicEOLAAAAAay5E9SGA/Nu3fNozJo1lyJ6kMB+bdu+bRgdPffuJX+LSfJUxzNjL79xK/xaT5KmOYAAAAAAAAGrGzh1CYH8iU3o0JAI/2cOoTA/kSm9GhIAGdvrPM4PxcP/GC/QHrPM4PxcP8Axgv0DRIAZ2+s8zg/Fw/8YL9A8bG+zDmdg/CdxxNeG2X1BboVmn5mtVz91FROCbqarxNKyM9qj3PONfJrvlNAyzAAAAAAAAAAAAAAAANMtiX3MWEf+d+ezmZpplsS+5iwj/zvz2cCZjL7IXMBMts/Ka/1ErmWyWrlo7kiLwWnkcqK5e7uruv0/QNQTHS/fdyv8Zk+UoGxTVRzUc1UVFTVFTtIV2v8qajNDLumis9OyS/2ysZJRuVdNY5HNZK1V7mio/8A+ND+Ni3MJ2OsmKOmrahJbtYVS3VWq+ycxqfaZF8LNE17VY4m4DxMB4at+DcGWjC1rbpSWylZTscqIivVE9k9dPwnLq5e+qnO7QGPYct8p71idVatXHFzFBGq/wCsqZPYx+FEX2Sp+K1x3pQ3lC8wlvWOqHAVBVb9DY2JPWNavB1XI3gi91WRqngV7kA8nk+pZJ9oKrnme6SWSzVL3ucvFyrJEqqpoQZ58nn19z+RKj0kRoYBSflLvu3gjxas+VEU/Lgcpd928EeLVnyoin4AAAbF2H7h0Hi0fyUOZz26kMeebdx+bSHTWH7h0Hi0fyUOZz26kMeebdx+bSAZNAAAXy5NzqsxH5bX0ERQ0vlybnVZiPy2voIgLTH8RTQyvlZFLG98L9yVrXIqsduo7Re4ujmrovYqL2n9lKszs47plHtk4kqVWerw9WsomXOha72zfUsWkrEXgkjezo1TVF6dUC6pxmbWZuFMr7FDd8Vz1kUFRIsUDaekfKskiJruaom61dNVTec3XRdNdFOjw5erXiOw0V9slbFW26uhbNTzxrwe1f5ovYqLxRUVF4ofPjTDNlxjhiuw3iGiZWW2uj5uaN3BU7Uc1elHIuioqdCogFFM/tq7EGN6Gow9gylqMO2OZFZPO96erKli/gqreETV6FRqqq/jaKqFaiTdobKC95RYv+p1Yrqu0VaufbLgjdEnYmmrXdyRuqap30VOCkZAAAAPawNh6sxbjKz4Zt7VWpudZHTMXTXd3nIiuXvImqr3kU8Us9yeGDFu+Z9xxhUw71LYaTchc5v/AKibVqaL3o0k17m8gF77LbqSz2eitNBHzVJRU8dNAzX2sbGo1qfuRDx8zrPeMQ5fX2w2Gtp6G43GikpYqidFVkSSJuudw467qu07+h0YAon6yPGn55Yf/wCnN9E7bI7ZexzltmhZsXtxZZKiGjkc2pgjbKiywvarHtTVumujtU17UQtsABE21xgz69ciL/Rww87XW6P6pUejdXb8OrnIidquj5xqd9xLJ/kjGSMdHI1r2ORUc1yaoqL2KBjQDuM+MHrgPN3EmGGxqynpaxz6TX/28mkkXh9g5qL30U4cAe/lzfG4YzAw9iN+u5bLnT1b0RNVVscjXOTTvoingADZWGWOeFk0L2yRyNRzHtXVHIqaoqKchndg9cfZUYiwmxWpPX0ipTK7oSdio+LXuJvtbqRvsTZm0+OcqKWw1dQ36uYciZRzxuX2UkCJpDKndTdTdVfxmqq9KE9AY21tNUUVZPR1kEkFTBI6KaKRqtdG9q6OaqL0KioqaH4l9tq3Zmdje4VGNsCrDBf5G71bQSKjI61U/DY7oZJp068HcF1RdVWkOK8LYkwpcHW/EtiuFpqWrpzdXA6Pe77VVNHJ301QDxwfpTwzVE7IKeKSaWRd1jGNVznL3EROlSwWQuy3jLGtwguWL6Orwzh1rkdJ6oj3KupTp3Y43cWov47kROPBHAQrJhDE0eDIcZPslYmH5qh1MyvSNVi5xumqKvZxXRFXgqoqJxRTwzYO24dsVvwvDheltVI2yw03qVtE6JHRLFporHNXVHIqdOuuuq666lNdrPZpseFrFccwcGV0FsttPo+stdS9dxqucjU5hy8eLnJ7Be7wXoaBUYAADWXInqQwH5t275tGZNGsuRPUhgPzbt3zaMDp779xK/xaT5KmOZsbemufZq1jGq5zqeRERE1VV3VMkvrIxp+aGIPi2b6IHPg6D6yMafmhiD4tm+iPrIxp+aGIPi2b6IHPg9i44WxPbaOStuOHLxR0sem/NPRSRsbqqImrlRETVVRPhPHAAADVjZw6hMD+RKb0aEgEf7OHUJgfyJTejQkADNr12Gdv5x0XxZB9Eeuwzt/OOi+LIPokP/W9f/yHc/4R/wD4H1vX/wDIdz/hH/8AgCYPXYZ2/nHRfFkH0TycX7R+bOK8M1+HL3faWe3V8Sw1EbbfCxXN1103kbqnR2Ea/W9f/wAh3P8AhH/+B9b1/wDyHc/4R/8A4A8wH9zRyQyviljdHIxytexyaK1U4Kip2KfwAAAAAAAAAAAAAADTLYl9zFhH/nfns5maW/2d9qDAOXeTtiwde7Riaor7f6o52SjpoHRO5yollTdV0zV9q9NdUTjr4QLsmOl++7lf4zJ8pS+Xr1crPyBjP+Dpv8wUIuc7Km41NTGjkZLM97Ud0oiqq8QJp2Kcwm4GznpKOtl3LViBG22p1XRrJHOTmZF8D/Y6r0I9ymk5jTG98cjZI3OY9qorXNXRUVO1C8uCNs/BlNhC1U2K7NieovkNKyOumpKaB0UsrU0V7VdM1fZaa9CaKqgWPzLxZQ4GwFecW3FN+C2UrpubRdFkf0MYi9iucrW/CZMYiu9df7/cL5c5eerbhUyVNQ/8Z73K53waqWG2sdoy0ZqYWtuGcJUV5oLe2pWpuHq+OON0zmppG1EY9+rUVXKuqpxRvDgVqAsZyefX3P5EqPSRGhhl/ssZk2LKvM2TE+IaS5VVG63S0qMoY2Pk33OYqLo97U09ivb3C0/r1crPyBjP+Dpv8wBwHKXfdvBHi1Z8qIp+Txte5yYYzfuOHanDVBeKRlshnZMlwhjYrlkVipu7kj9farrrp2EDgAABsXYfuHQeLR/JQ5nPbqQx55t3H5tIQjbNs/K6mt1NTSWHGKvihYxytpKbRVRETh9vPHzK2u8tsS5dYlw5Q2TFsdXdbRVUUD5qWnSNr5YXMarlSdVRurk10RV07FApAAABfLk3OqzEfltfQRFDSzGyTn/g7KTBd2suJLbfquorLj6qjdb4InsRnNsboqvlYuurV7FA0AM1NuL3S+Jf1VH81iLJevVys/IGM/4Om/zBUTaNxzacx837vi+x09dT0FaynbHHWMayVObhZGuqNc5Olq6cV4aAd7sh57zZaX1MOYjnklwlcJU3lVVX6nyqunOtT8Rfw2p/aTiio7RSnmhqaeOop5Y5oZWI+OSNyOa9qpqioqcFRU7TGos1sv7TrMucPSYVxrSXS62aBN62y0aMknp1VeMSo97UWPpVOOrV4aKi+xC7GZuBsPZiYQqsMYlpOfpJ03mPbwkgkT2skbuxya+BeKLqiqhmLnVlnf8AKzGs+Hb2xZIl1koa1rdI6uHXg9vcXsVvSi91NFW4/r1crPyBjP8Ag6b/ADBxGdO0Xkbmlgqow7e8OYxjl0V9FWNoKVZKSbTg9v8ApCap2K3XRU4dxUCm4P8AX7qPVGKqt14KqaKqeA/wAaXbFmDfrQyFtEk8PN1t7V10qNUTXSRE5pPBzbWLp2KqmbllW3JeKJbulQtuSojWrSnRFlWHeTf3EVUTe3ddNVRNe1C+NPtoZT09PHTwYcxjHFExGMY2ipkRrUTRET/SO4BZtyo1qucqIiJqqr2GcGYu01mjWY7vdRhnGFRQ2R1bKlvgjp4VRsCOVGLq5irqrURV1XpVSY80NsPBV6y8vtnwvaMUU14r6KSmppqqngZHEr03VermzOVFRqqqaIvFE8JSQCWvXI52/n9W/wANT/4Y9cjnb+f1b/DU/wDhkSgC9Gw3nRirHOIr/hnG18kulY2mZWUD5ImMVrWu3ZW+wREX28ap4FLYGT2RWOfscZq2PF0kc8tLRzK2rih035IHtVkiIiqiKu65VRFVE1ROKdJcj16uVn5Axn/B03+YA4XlIcGJHWYdx9TRaJMjrXWuT8ZNZIV8Kpzqa/ooU6LiZ+bTGVeZeVV4wlHZMWQ1lQxslFNNSU6MjnY5HMVypOqo1dN1VRFXRy8FKdgAAB1eVGPb7ltjaixTYJtJ4F3ZoHKqR1MS+2ieidLV0+BURU4ohpnkzmphTNTDbbth2r3aiNEStoJVRJ6V69jk7U7jk4L4dUTKE9TC2Ib5ha9Q3rDt1qrZcIF+1z08itcidqL3UXtRdUXtA2EPyqqamq4VhqqeKeNelkjEc39ylKMsNtS50dPFRZh4d+qe6mi3C2K2OZ3fdC7Rir08WuYneJuse1VkncomumxPUWyR3+6rLfOip4VY1zf5gS/brLZ7a9ZLdaaCjevS6CnZGv8AJEPvIhqtpjI+niWR+O6d6J2R0VS9V+BIyOsdbaOBrdTyRYSsd1vlXp7CSoRKWn8Oq6vXwbqeECy97uttslpqbteK6noaCljWSeonejGRtTtVVM59rLPSfNbELbTZHyw4St0m9Ssc1Wuq5dNFnenSnSqNavQiqq6KqonI5yZz46zUrEXEVxSK3Rv3oLZSIsdNGvYu7qqvd+k5VXiumicCOQAAAGsuRPUhgPzbt3zaMyaLv5a7XeW2GsusNYcrrJi2SrtVopaKd8NLTrG58ULWOVqrOiq3Vq6aoi6diAW5BWb16uVn5Axn/B03+YHr1crPyBjP+Dpv8wBZkFZvXq5WfkDGf8HTf5gevVys/IGM/wCDpv8AMAdntte5ixd/yXz2AzNLf7RG1BgHMTJ2+4OsloxNT19w9T81JWU0DYm83URSrvK2Zy+1YumiLx08JUAAAANWNnDqEwP5EpvRoSAU+ym2tMucJZZYcwxcrLiuWstduhpZ309LTujc9jURVarp0VU8KIdR69XKz8gYz/g6b/MAWZBWb16uVn5Axn/B03+YHr1crPyBjP8Ag6b/ADAFmQVm9erlZ+QMZ/wdN/mB69XKz8gYz/g6b/MAUzz2678eeclx+cyHGHQZlXulxLmLiXEdDHNHSXW71VbAyZESRrJZnPajkRVRHaOTXRVTXtU58AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD0IbJeZoklhtFwkjX8NtM9U/fofFPDLBIsc0T4np0te1UVPgUD+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABrZ9jLLb3vcJfE1P9AfYyy2973CXxNT/QOsPjvd0t9ltFXd7rVR0lDRxOmqJ5F9jGxqaq5e8iAc/9jLLb3vcJfE1P9AfYyy2973CXxNT/AEDn/s/ZN++FZf77v/A+z9k374Vl/vu/8AdB9jLLb3vcJfE1P9Aina3wJge0bPGKrjacG4dt9bDHTrFUUtshikZrUxIu65rUVNUVU4dinbfZ+yb98Ky/33f+CMdqfODLLE2QmJ7HYcZ2u4XKqjgSCnheqveraiJy6cOxGqvwAUBAAA0+yWy7y/rcnMFVtbgbDFTVVGH6CWaaa0wPfI91OxXOc5W6qqqqqqr0mYJrLkT1IYD827d82jA/K9ZaZcMs1a9mX+FGubTyKipZ6dFRd1f0DJ82Mvv3Er/FpPkqY5gAABbDk78NYcxHWY2biHD9pvCU8dEsKV1HHPze8s+u7voumuia6dxC3n2Mstve9wl8TU/0CrPJnf7djz9XQf1qC6QEE7R2QWF8X5aVkOEcMWe04hokWpoH0NHHTrO5qeyhduomqOTVE16Hbq9GuucE0UsEz4Zo3xSxuVr2PaqOa5F0VFRehTZUobt65RfW7iZMx7FTbtqvE27co428KerVNd/h0Nk0Vdfx0X8ZAKskibNNBQ3PPjCFBcqOnraOe4NbLBURNkjkbuu4Oa5FRU8JHZJuyv7obBXlJvyXAaP/AGMstve9wl8TU/0CtfKB4Rwnh7LWwVVgwxZLTUSXhI3y0NBFA9zeZkXdVWNRVTVEXTvFwCrXKRdVeHPLaeglAoYAAAAAFy9gDK2y3fDF9xlimw2+6w1VQ2it8dfSsmY1sab0kjWvRU4uc1uqfiOQpvDFJPMyGFjpJJHI1jGpqrlVdERE7prNkvhBmA8rcPYUa1iS0FG1KlW9Dp3ezld8L3OUD+/sZZbe97hL4mp/oHx3zKPLa6WWutn1jYapfVdNJBz0FpgZJFvtVu81yNRUcmuqKioqKh3AAx4xPZq3DuI7lYblHzdZbqqSlnbp+GxytXTvcDzixvKAYM+t/OWPEdPDuUeIqRs6qjdG+qI9I5E/dzbl7qvUrkAAAA7PIukpa/OjBdFXU0NVSz3yjjmhmjR8cjFmaitc1eCoqdinGHdbPvXrgXzgovTMA0y+xllt73uEvian+gfhX5UZZVtDUUc2X+F2xzxOiesVqhjeiOTRd1zWorV48FRUVOw7MAZRZ75c3DK7Mi4YXq9+WmavPW+pcmnqincq7jvCmitX9JqnCGmG11lK3M/LeSS2U7XYks6OqbcqJ7KZNPtkGv6SJw/Sa3s1M0ZGPjkdHI1zHtVUc1yaKip2KB/JpnkBl9gK45JYNrrhgjDVXVz2enfNPPaoHySOViauc5W6qvfUzMNWNnDqEwP5EpvRoB82YOXGXlNgLENRT4DwtDNFa6l8ckdoga5jkicqKiozVFRe0ywNeMyurrEvkiq9C4yHAAAAfbZLVcr3dqa02ehqK6vqpEjgp4GK98jl7ERD56Snnq6qGkpYXzTzPbHFGxNXPc5dERE7VVV0NJNlTI235W4XjuV2p4KjFtfGj6uoVqOWkaqJ/o8a9iJ+Eqe2XuoiARTktsbUraaG65o18kk7k3ks9DLutZ3pZk4qvdRmiJp7ZSz2DsvcDYPiYzDOE7Pa3MTRJYaVvOr/AGpFTfcvfVVOnOax7j3B2BKBtbi7ENDaYn6822Z+skmnTuRt1e/9lFA6U+C9WWz3umWlvNpoLlAvTFV07JmfucioQdUbXuTcVSsTKy9TsRdEljtzkavf9kqO/kd/l1nRlnj+pbR4axXST1zk4Uc7XQTu/sskRFd+zqBHGa+yVl1immlqcLRuwndVTVjqZFkpXr3HRKvBOz2Ct07i9BR/NfLjFWWWJnWLFNBzMjkV9NURrvQ1LPx43dqd1OCp2ohrQchm9l7YczcE1WGL/FoyT2dNUsRFkpZkT2MjO+mvFO1FVF6QMlge9mDhS7YHxndMKXuJGV1unWKRW67r00RWvbr+C5qtcneVDwQBZTk/LBYsQ5lX+lv9ltt2gjs/OMirqVk7Gu56NN5Eeioi6Kqa98rWWm5NzrTxH5EX08QFxvsZZbe97hL4mp/oFOOULw5h7DuJsJxYfsNrtDJqOodK2hpI4EkVHt0VyMRNVTXtL5lIOUr++rBviNT8tgFRgAAAAA0D2M8o8LxZI0F6xPhez3W4XqZ9a19fQxzOih9pG1qvauiKjd/h+OUZy+w3VYwxxZcL0e8k1zrY6beamu41zkRz9O41url7yGuNot9JabTR2qghSGko4GU8EadDI2NRrU+BERAOd+xllt73uEvian+gcXnhkvgzEGVGIrdYMG2Cgu60bpqGajtsUUvPR+zY1HMaipvK3dXvOXpJgAGM4JO2o8FpgTO/ENngi5uhnm9XUSImiczN7NGp3muVzP2CMQAAAE2bE1otV8z8t1vvVsornRvo6lzqergbNGqpGqoqtcipqikJk87BnujLZ4jV+iUC+f2Mstve9wl8TU/0CrXKF4Vwvh3DWE5cP4bs9ofNWVDZXUNDHAsiIxuiOVjU1RNe0uiVG5Sv71cG+PVPyGAUgAAGzBwG0f1C458iVPo1O/OPzts9yxDlDiux2emWquFdap4KaFHtbzkjmKiN1cqImq91QMlwTB62XPH8w5vjCl/xR62XPH8w5vjCl/xQIfBMHrZc8fzDm+MKX/FOLzGy5xnl3VUdNjKyPtU1ax0lO108Um+1qoir9rc7TiqdIHJgAAay5E9SGA/Nu3fNozJo1lyJ6kMB+bdu+bRgdPffuJX+LSfJUxzNjL79xK/xaT5KmOYAAAXG5M7/AG7Hn6ug/rUF0ilvJnf7djz9XQf1qC6QA8fGuGrRjDClxwzfaZKi33CBYZmdqa9Dmr2OauiovYqIpGVDmyy27T15yuvlQjKaupaaos8j+CMn5pN+HX9NE3m99FTpchMoGSGa2B7tl1jy5YTvLdZqOT7VMjdG1ES8WSt7zk0XvLqi8UU6TZX90Ngryk35Li4225lGmPcBLimz02/iKwROka1ieyqaVPZSR99W8Xt/aROLinOyv7obBXlJvyXAallWuUi6q8OeW09BKWlKtcpF1V4c8tp6CUChgAAAACZNjbBi4yz5srZYt+is6rdarVNU0iVObTj06yLGmnc1NNCrfJ14MdasubrjKqhVs18quZpnL208GrdU8MjpE/YQtIBAW0TnD9YeceW2HWVXN0tRWLU3hN7REp5EdTxq7uoiukf4Y29JPplltPYw+vfPDEl4il5yjiqVoqPjw5mH7Wip3nK1X/tGh2ztjH6+8mMNYikl52rkpEgrFVdV5+L7XIq9zVzVd4HIBwe3Xg3658i6u508W/W4fnbcI1T2yxe0lTwbrt9f1aGcRshc6KludtqrdWxJNS1UL4J416Hsc1WuT4UVTI3MLDdVg/HN7wvWbyzWytlpt5U032tcqNf4HN0cneUDwQAAO62fevXAvnBRemYcKd1s+9euBfOCi9MwDV4AiLajzGrsrcNYXxTStdLTJiSGnuFO3pnpn09RvtTvputcn6TW68AJdKBbd2UaYTxe3HtjplbZr7MvqxjG+xpqxeKr3kk4uT9JH94vjZLnQXqz0d3tVVHVUNbC2enmjXVsjHJqip8CnnZgYVtON8G3PC17h5yhuECxPVPbMd0te39JrkRyd9AMhDVjZw6hMD+RKb0aGZeZmDbtgDHFzwnemaVdBLuo9E0bMxeLJG95zVRe9rovFFNNNnDqEwP5EpvRoB0GZXV1iXyRVehcZDmvGZXV1iXyRVehcZDgAABZHYCy/hxRmlUYquMDZaHDUTZomubqjqt6qkS9z2KNe7uo5GKaDlbuTxtEdDkfV3Pc+3XK7zPV2nSxjGMangRUd+9SyIERbUmcUGUeB2VFIyOoxDc1dFa4JOLEVum/K9O1rEcnDtVWp0aqma+KL/esT3ypvmILlUXK41T9+aondq5y9xOxEToRE0RE4IiIS/txYnqMQ7QN2o3SOWlssUVBTt14JoxHvXTuq97k8CIQaAP7hkkhlZLFI6ORjkcx7V0VqpxRUXsU/gAXj2ONoqa/6YEzBucf1QhhV9uudQ5G8/Gxuro5XLw30aiqj19siLrxTV3z7Q21zT299ThzKx0NXUpqya9vajoo17eYavB6/pr7HuI7gpSQAfXeLlcLxc6i6XauqK6uqXrJPUVEivkkcva5y8VPkAAFpuTc608R+RF9PEVZLTcm51p4j8iL6eIC+RSDlK/vqwb4jU/LYXfKQcpX99WDfEan5bAKjAAAAALR8nbgtt3zHumM6qJHQWKl5qnVU/8AUT6t1TwRpIn7aF9SGtjTBaYNyHs3PRbldeUW61WqaL9tRObTu8I0j4d3Ulq9XGks9nrbtXyc1SUVPJUzv09rGxqucv7kUCEazOBItsamy4Wq0ta2haR7Vf7FK9yJOi9zXm0azRe1xPJklWY5u8+a0mYjXqy5uu/1UbouiNfzvOI3wJwTTuGruG7vR3/Dttvtvfv0lxpY6qBdelkjUcn8lAqryj2C0qsPWDHtNFrLRSrbqxyJx5p+r41Xh0Nej06emRCkJrVnLhGLHmV2IcJyI1X19G5sCu6GzN0fE5fA9rV+AyYnilp55IJ43RyxuVj2OTRWuRdFRU7F1A/gAACedgz3Rls8Rq/RKQMTzsGe6MtniNX6JQNHyo3KV/erg3x6p+QwtyVG5Sv71cG+PVPyGAUgAAGzABy+bOIa3CWWWI8TW6KnlrLXbpqqBlQ1XRuexqqiORqoqpw7FQDqAUA9ermn+QMGfwdT/mB69XNP8gYM/g6n/MAX/KQcpX99WDfEan5bDn/Xq5p/kDBn8HU/5givPDOHE2b1wtlbiWhtFJJbonxQpb4pGI5Hqirvb8j9V4dmgEdAAAay5E9SGA/Nu3fNozJo1lyJ6kMB+bdu+bRgdPffuJX+LSfJUxzNjL79xK/xaT5KmOYAAAXG5M7/AG7Hn6ug/rUF0ilvJnf7djz9XQf1qC6QGc23LVVNDtM1lbRzyQVNPTUUsMsbtHMe2NFa5F7FRURS5ezVmlTZrZa015escd4pFSlusDdE3ZkT26J2Nensk7nFOO6pS7bz90Zc/EaT0SHMbMmadTlXmXS3SWSRbJWq2mu0KarvQqvCRE7XMVd5O9vJ+EBqMUzxZlGuXu2LgvEFnpebw3frtzsKMboymqN1yyQ8OCIvFzU7mqJ7UuPRVNPW0cFZRzxz008bZYZY3I5sjHJq1yKnSioqLqfjc7ZQ3NKZK6mjn9S1DKmBXJxjlYvsXIvYvFU8CqnaB9ZVrlIuqvDnltPQSlpSrXKRdVeHPLaeglAoYAAB9NqoKq6XSktlBC6arq52QQRtTi973I1rU8KqiHzE+bCeDfrnzzpbpUQ79Fh+B1e9VRFasvtIk8O87fT9WBf/AC9w3TYPwNZML0m7zVsooqbeamiPc1qI5/hc7Vy99Tws/sXpgXJ7EuJWyIypp6J0dIuvHn5PtcWnd0c5F8CKd0c9j/BWGce2JtjxZbPqlbmztnSBZ5Ik32oqIqrG5qrpvLwVdP3IBkQXS5NzF+/SYlwJUSqqxubdKRi9xdI5v5pFw76kz+tlyO/MOH4wqv8AFPdwLkrllgbEDL/hXDDbZcmRuiSZlZUP9g5NHIrXyK1U8KdiASEUL5RTBiWrMa1Yzpot2C+UvM1Con/qINE1Ve/G5iJ/YUvoQ3tk4LTGeQ96SGLfrrMiXWlVE4/akXnE+GNZOHd0AzLAAA7rZ969cC+cFF6Zhwp3Wz7164F84KL0zANXis3KO9SFm85IPm1SWZKzco71IWbzkg+bVIHC8n/m42CZ+VV+qtGSufPZJJHcGu9tJB8PF7e/vp2ohdMxwtVfWWq50tzt1RJTVlJMyenmYujo5GqjmuTvoqIpqRs65m0mamWlFiBqxR3OH/R7pTsX/VTtTiqJ2Ncmjk7y6dKKBG+3LlH9euCPrzstKsmILDEqyNjTV1TSaqr2adqs1V6d7fTiqoSfs4dQmB/IlN6NCQFRFTRU1RT5LPbaG0WyC2W2mjpaOnZuQwxpo2NvY1E7ETsQDysyurrEvkiq9C4yHNeMyurrEvkiq9C4yHAAADRjYDqo6jZ6pYo1RXU1zqopOPQquR/9HoWAKYcm3i+JkmJsCTybskm7daRq9DtNI5vh/wBT8GvcLngZebW9tmte0VjGCZHJzta2pYqp0tljZImn97T4CKi7fKC5VVlzpaXM+yU7pnUMCUt3ijZq5IUcqsn4dO6rla5exN1ehqlJAAAAAk3Z1yjuubmNktMD5KS00reduVcjdUhZ0I1uvBXuXoTvKvQin7Z6ZF41yorny3Km+qNifIrae7UrFWJ3Hg2ROmJ68OC8FXXdV2iqBFgAAFpuTc608R+RF9PEVZLTcm51p4j8iL6eIC+RSDlK/vqwb4jU/LYXfKQcpX99WDfEan5bAKjAAAddk1g+XHuaGH8Jsa5Y6+sa2oVvSyBvs5XfAxrlORLd8nDgtKq/Ygx7VRIsdFEluonKmv21+j5VTuK1qMTwSKBdqCKOCCOCFjY4o2oxjWpwaiJoiIQPt2YxTDORdXa4JUZW4gnZQMRHaOSL28q+DdbuL+sJ7OPzHyywPmKtCuM7Gl1Sg3/UyOqZo0j393e4Rvaiqu63p7gGS5olsDYw+uLJJtjnl3qvD1U+lVF6eZf9sjX+b2p/YOn9bLkd+YcPxhVf4p1uXGV2BMupq2XBlhS0urmsbU7tVNIkiMVVbqj3uThvO4p3VA7IzM2ycFrgzPi8pDFuUN5VLrS6Jw+2qvOJ8EiScO5oaZlW+UTwYt2y5tWM6aLWexVXM1Coia+p59G6qvbpI1iIn6a98ChYAAE87BnujLZ4jV+iUgYnnYM90ZbPEav0SgaPlRuUr+9XBvj1T8hhbkqNylf3q4N8eqfkMApAAANmDgNo/qFxz5EqfRqd+cBtH9QuOfIlT6NQMpgAAAAAAADWXInqQwH5t275tGZNGsuRPUhgPzbt3zaMDp779xK/xaT5KmOZsZffuJX+LSfJUxzAAAC43Jnf7djz9XQf1qC6RS3kzv8Absefq6D+tQXSAzg28/dGXPxGk9EhAxPO3n7oy5+I0nokIGAvFsBZufVS0uytvlRrWUEbprPI93GWBF1fDx7Wa6p+jqnBGFtjHnDF8ueGsQ0F/s1U6luFBO2enlb+C5q68U7UXoVOhUVUNUslcwbZmbl3bsVW5WMfMzm6yna7Vaaoaic5GvbwXiir0tVq9oHaFWuUi6q8OeW09BKWlKtcpF1V4c8tp6CUChgAAGhnJ/4O+t/JqTEVRDuVeIqt06KvT6ni1jjRfh51yd56FB8JWSsxLii14et7d6ruVXFSxcFXRz3I1FXTsTXVe8hrrhu0Udgw9brFbo+bo7fSx0sDe4xjUa3+SAfecfNmplhDK+KXMfB0cjHK17HXumRWqnBUVN/gp+GfOL0wJlDiTEzZObqKaicykXXRefk0ji08D3NXwIpk+5Vc5XOVVVV1VV7QNZPssZWe+Xgz49pvpj7LGVnvl4M+Pab6Zk0ANibBe7NiC3NuVhu9vu1E5ytbU0VSyeJXJ0ojmKqaofZPFFUQSQTxtkikarHscmqOaqaKip2oU75NzGCvpsS4DqJFXm3NulG1e4ukc380hXTvqXHAyWzmwhJgPNLEOE3o7m6Csc2nV3S6B2j4lXvqxzVOQLd8o9gv1Nf7Bj2mi0jrYlt1Y5E4c6zV8Sr31ar08EaFRAB3Wz7164F84KL0zDhTutn3r1wL5wUXpmAavFZuUd6kLN5yQfNqksyVm5R3qQs3nJB82qQKAEtbLGa0uVeZcFZVzSfW/cdKa6xJqqIzX2MqJ+MxV17u6rkTpIlAGytPNFUU8dRTyslhlYj43sXVrmqmqKi9qKh/ZVPYGzcW+2B2Wd8qdbjaouctT3rxmpU6Y/DHqmn6K9xilrAOfzK6usS+SKr0LjIc14zK6usS+SKr0LjIcAAAOlyvxlc8AY8tOLbQutRb50esaro2aNU0fG7vOaqp3tdew1Uy9xfY8dYRoMT4eqm1FDWRo5PxonfhRvTsc1eCp/2MhiVNnrOzEeUV9c+j1r7DVyI64Wx7tGydnOMX8CRE7ehdERUXRNA1CmjjmifFLG2SN7Va9jk1RyLwVFTtQqtnLsdWS/3Ga75fXSDD08qq59uqI3OpFcq9LHN9lEn6Ojk7mnQTrlVmngrMy0Nr8LXeOaVGos9FLoypgXtR7On9pNWr2Kp2wGcdZsjZzwVPNRWy01TNdOdiuTEZ4fZ7rv5Hc5dbFeIaqsiqMeYiorfRIur6a2Ks07k7m+5qMZ4UR/g7l4wBz+X+DMN4Dw3Bh/C9sioKGLiqN4vlfpxe93S5y6dK/wBERD1bzT26rtNXT3iGlmt0kLkqmVKNWJY9PZb6O4bunTqfzfbvarFap7rerjS26gp270tRUypHGxO+5eBRbar2mn41pqnBeAnzU2Hn6sra9UVkte3tY1F4siXt14u6F0TVFCD865cFS5nXtcvaSSmw42dWUqOkVyPVODns14oxXaq1FVfY6dHQnGgAC03JudaeI/Ii+niKslpuTc608R+RF9PEBfIpBylf31YN8RqflsLvlIOUr++rBviNT8tgFRgAANTNl/Bf1iZIYds8sXN108Hq6t1TR3PTezVru+1Faz9gz32b8Frj3OfDuH5IlkovVKVNdw4ep4vZvRe5vaIzXuuQ1UA/KsqaejpJqysqIqemgjdJNNK9GMjY1NXOc5eCIiIqqq9ByP2WMrPfLwZ8e030yPtuPGH1rZDXCigl3Ky/SstsWi8dx2rpV8Csa5v7aGbYGsv2WMrPfLwZ8e030x9ljKz3y8GfHtN9MyaAGyNvrKO40EFfb6uCrpKiNssE8EiPjlY5NWua5ODkVOKKnSeTmFhulxhga94XrN1IbnRS028qa7jnNVGv8LXaOTvoQtsDYw+uLJJtjnl3qvD1U+lVF6eZf9sjX+b2p/YLDAY4XShqbZc6q21sSxVVJM+CZi/gvY5WuT4FRT5ie9uvBv1sZ6Vdzp4tyixBA24RqntUl9pKnh3m76/rEIEAE87BnujLZ4jV+iUgYnnYM90ZbPEav0SgaPkKbVuTd3zhs9iobRd6G2vttRLLI6qa9Uej2tRETdRe4TWAKJ+sjxp+eWH/APpzfRHrI8afnlh//pzfRL2ADNr12Gdv5x0XxZB9E83FG0rm5iXDtww/d79STW+4U76epjbb4WK5jk0VEVG6pw7UIeAAAAAAAAAAmXD201nBYLBbrFbL/SRUNupYqSmY63QOVsUbEYxFVW6roiJxUhoATfUbVedVRTyQS4io1jkYrHJ9TIE1RU0X8EhAAAAAO4ypzWxrlg+4vwdcYaJ1xSNKlZKaObeSPe3dN9F09u7oO79dhnb+cdF8WQfRIMAHRZiY0xDj/FE2JMT1cdVcpo2RvkZC2NFaxNGputRE6DnQAB3WVWbWO8sW17MH3htHFXqxaiOSBkzHK3XRyI9FRF4qmqdPwIcKAJz9dhnb+cdF8WQfROQzSzpzBzLs9LacX3WnrKSlqPVETY6OOJUfuq3XViIq8HLwI7AAAAe5gXFV4wViqjxNYJYYbnRK5aeSWFsrWK5qtVd1yKiro5dOHDpJX9dhnb+cdF8WQfRIMAEl5mZ55k5jYeZYMVXqGqt7ahtRzUVHFFq9qKiaq1qKqeyXh0dHcI0AAAADo8usbYjy/wATxYjwtWpR3GON8SPdG2RqtcmiorXIqKnh7URewlD12Gdv5x0XxZB9EgwASdmRnvmRmFhp2HcVXWkrLeszJtxtBFG5r266KjmtRU6VTwKpGIAA9HDV5r8O4ht9+tUrYq+3VMdVTPcxHI2Rjkc1VReC8UTgp5wAnP12Gdv5x0XxZB9E5TNDO7MTMqwQWLF12p6yhgqm1cbI6OKJUlax7EXVrUXoe7h3yNwAAAHp4Vv12wviOhxDYqx9HcqCZJqeZnS1yd1F4KipqiovBUVUXpJg9dhnb+cdF8WQfRIMAE1XXaizludrq7bWYho301XA+CZqW2BFVj2q1yao3hwVSFQAAAAAAD6bZX11sroq621tTRVcLkdHPTyujkYqdqOaqKik14M2rc4cOQsgqLtRX+FiaNbdabnHIn9tiseq99VUgsAWwg23cXpGiTYKsT39qsnlan7lVf6niYi2zcz6+J0VqtmHrQi9EjKd80rfhe9W/wD1K1ADpseY+xnjqtSrxbiOvuz2rqxk0mkUa/oRt0Y3p7EQ5kAAAAB1+VuZGLMtLvVXbCFdFR1dVT+p5XSU7JUVm8jtNHoqJxanE5AATn67DO3846L4sg+icBmpmhjLM2soavGFwhrJaGN0dOsdMyLda5UVfaImvFE6TiwAAAHW5X5iYoy2vdRecJVVPSV1RTrTPllpmTLzauRyom+i6aq1vR3CRvXYZ2/nHRfFkH0SDAB3OaubGOcz1t/143WOtbbuc9TMjp44WtV+7vKqMRNVXdb09w4YAAAAO1yqzSxpljU19Rg65x0T69jGVKSU7JWvRiqreD0VEVN5ePfU7712Gdv5x0XxZB9EgwAd7mrm5jjM6CghxjX0talvc91M6OjjiczfREcmrERVRd1vDvHBAADosusaYgwBieLEmGKqOluUUb42SPhbIiNemjvYuRU6DnQBOfrsM7fzjoviyD6I9dhnb+cdF8WQfRIMAE5+uwzt/OOi+LIPoj12Gdv5x0XxZB9EgwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9k=" alt="Miracle Financial" style={{ height: 52, width: "auto", display: "block" }}/>
              </div>
              <div style={{ fontSize: 11, color: TEAL, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>Turning Dreams Into Miracles</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.7 }}>
                Licensed Mortgage Broker · FSRA # 13766<br/>
                603 Millway Ave Unit 17, Vaughan, ON
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end" }}>
              <a href="https://miracle-financial.mtg-app.com/signup" target="_blank" rel="noreferrer"
                style={{ background: "#FF6B1A", color: "#fff", padding: "12px 26px", borderRadius: 10,
                  fontSize: 14, fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap",
                  boxShadow: "0 4px 18px rgba(255,107,26,0.5)" }}>
                Get Pre-Approved →
              </a>
              <a href="tel:9055884242" style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                905-588-4242
              </a>
            </div>
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "10px 24px", textAlign: "center" }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{"© " + new Date().getFullYear() + " Miracle Financial. All rights reserved."}</span>
          </div>
        </div>            
      </div>

      <DisclaimerFooter />
    </div>
  );
}
