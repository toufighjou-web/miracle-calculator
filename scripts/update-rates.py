#!/usr/bin/env python3
"""
Miracle Financial — Daily Rate Updater
Fetches best Canadian mortgage rates from Ratehub.ca + Bank of Canada API
Falls back silently to existing rates if any fetch fails.
"""

import re
import sys
import json
import requests
from datetime import datetime

# ── Fallback rates (used if scraping fails) ──────────────────────
FALLBACK = {
    'variable5':      3.35,
    'fixed5insured':  4.04,
    'fixed5conv':     4.29,
    'variable5conv':  3.65,
    'fixed3':         4.14,
    'prime':          4.45,
    'stressFloor':    5.25,
}

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-CA,en;q=0.9',
}

def clamp(val, lo, hi):
    return lo <= val <= hi

def fetch_boc_prime():
    """Bank of Canada official API — overnight rate → prime = overnight + 2.20"""
    try:
        url = "https://www.bankofcanada.ca/valet/observations/V39079/json?recent=1"
        r = requests.get(url, timeout=10, headers=HEADERS)
        data = r.json()
        overnight = float(data['observations'][-1]['V39079']['v'])
        prime = round(overnight + 2.20, 2)
        if clamp(prime, 2.0, 12.0):
            print(f"  BOC API: overnight={overnight}%, prime={prime}%")
            return prime
    except Exception as e:
        print(f"  BOC API failed: {e}")
    return None

def fetch_ratehub_rates():
    """
    Scrape ratehub.ca/best-mortgage-rates for key rates.
    Returns dict of whatever rates were successfully parsed.
    """
    rates = {}
    try:
        r = requests.get(
            'https://www.ratehub.ca/best-mortgage-rates',
            headers=HEADERS, timeout=20
        )
        text = r.text

        # ── 5yr Variable insured (high-ratio) ────────────────────
        patterns_var5 = [
            r'5.year.{0,10}variable.{0,300}?(\d\.\d{2})%',
            r'variable.{0,20}5.year.{0,100}?(\d\.\d{2})%',
            r'best.{0,30}variable.{0,100}?(\d\.\d{2})%',
        ]
        for p in patterns_var5:
            m = re.search(p, text, re.IGNORECASE | re.DOTALL)
            if m:
                v = float(m.group(1))
                if clamp(v, 1.5, 8.0):
                    rates['variable5'] = v
                    print(f"  Ratehub variable5: {v}%")
                    break

        # ── 5yr Fixed insured ─────────────────────────────────────
        patterns_fix5i = [
            r'high.ratio.{0,200}?5.year.{0,100}?(\d\.\d{2})%',
            r'5.year.{0,30}fixed.{0,200}?insured.{0,100}?(\d\.\d{2})%',
            r'insured.{0,300}?5.year.fixed.{0,100}?(\d\.\d{2})%',
            r'best.{0,20}5.year.fixed.{0,200}?(\d\.\d{2})%',
        ]
        for p in patterns_fix5i:
            m = re.search(p, text, re.IGNORECASE | re.DOTALL)
            if m:
                v = float(m.group(1))
                if clamp(v, 2.5, 9.0):
                    rates['fixed5insured'] = v
                    print(f"  Ratehub fixed5insured: {v}%")
                    break

        # ── 5yr Fixed conventional (typically insured + 0.20-0.30%) ─
        if 'fixed5insured' in rates:
            # Conventional is always higher than insured
            # Try to scrape, otherwise estimate spread of +0.25%
            patterns_fix5c = [
                r'conventional.{0,200}?5.year.fixed.{0,100}?(\d\.\d{2})%',
                r'uninsured.{0,200}?5.year.{0,100}?(\d\.\d{2})%',
            ]
            found_conv = False
            for p in patterns_fix5c:
                m = re.search(p, text, re.IGNORECASE | re.DOTALL)
                if m:
                    v = float(m.group(1))
                    if clamp(v, 2.5, 9.0) and v >= rates['fixed5insured']:
                        rates['fixed5conv'] = v
                        print(f"  Ratehub fixed5conv: {v}%")
                        found_conv = True
                        break
            if not found_conv:
                # Estimate: conventional = insured + 0.25%
                rates['fixed5conv'] = round(rates['fixed5insured'] + 0.25, 2)
                print(f"  Estimated fixed5conv: {rates['fixed5conv']}% (insured + 0.25%)")

        # ── 3yr Fixed ─────────────────────────────────────────────
        patterns_fix3 = [
            r'3.year.fixed.{0,100}?(\d\.\d{2})%',
            r'3-year.{0,100}?fixed.{0,100}?(\d\.\d{2})%',
        ]
        for p in patterns_fix3:
            m = re.search(p, text, re.IGNORECASE | re.DOTALL)
            if m:
                v = float(m.group(1))
                if clamp(v, 2.0, 9.0):
                    rates['fixed3'] = v
                    print(f"  Ratehub fixed3: {v}%")
                    break

    except Exception as e:
        print(f"  Ratehub fetch failed: {e}")

    return rates

def read_current_rates(app_jsx):
    """Read existing rates from App.jsx as fallback."""
    current = {}
    patterns = {
        'variable5':     r"variable5:\s*([\d.]+)",
        'fixed5insured': r"fixed5insured:\s*([\d.]+)",
        'fixed5conv':    r"fixed5conv:\s*([\d.]+)",
        'fixed3':        r"fixed3:\s*([\d.]+)",
        'prime':         r"prime:\s*([\d.]+)",
        'stressFloor':   r"stressFloor:\s*([\d.]+)",
    }
    for key, pat in patterns.items():
        m = re.search(pat, app_jsx)
        if m:
            current[key] = float(m.group(1))
    return current

def update_app_jsx(rates):
    """Write updated rates back into App.jsx."""
    with open('src/App.jsx', 'r') as f:
        content = f.read()

    # Get current rates as the true fallback
    current = read_current_rates(content)
    final = {**FALLBACK, **current, **rates}

    # Ensure logical ordering: insured < conventional, variable5 < fixed5insured
    if final['fixed5insured'] >= final['fixed5conv']:
        final['fixed5conv'] = round(final['fixed5insured'] + 0.25, 2)
    if final['variable5'] >= final['fixed5insured']:
        final['variable5'] = round(final['fixed5insured'] - 0.60, 2)

    # Stress floor is always max(rate+2, 5.25)
    final['stressFloor'] = max(round(final['fixed5conv'] + 2.0, 2), 5.25)

    today = datetime.now().strftime("%B %d, %Y").replace(" 0", " ")

    # Replace rate block in App.jsx
    new_block = f"""var LR = {{
  variable5:     {final['variable5']},
  fixed5insured: {final['fixed5insured']},
  fixed5conv:    {final['fixed5conv']},
  fixed3:        {final['fixed3']},
  prime:         {final['prime']},
  stressFloor:   {final['stressFloor']},
  bPremium:      1.00,
  asOf:          _dateStr,
}};"""

    content = re.sub(
        r'var LR = \{.*?\};',
        new_block,
        content,
        flags=re.DOTALL
    )

    with open('src/App.jsx', 'w') as f:
        f.write(content)

    print(f"\n✅ App.jsx updated with rates as of {today}:")
    for k, v in final.items():
        if k != 'stressFloor' or True:
            print(f"   {k}: {v}%")

if __name__ == '__main__':
    print("🏦 Miracle Financial Rate Updater")
    print("=" * 40)

    scraped = {}

    # 1. Try Bank of Canada for prime rate
    print("\n📡 Fetching prime rate from Bank of Canada...")
    prime = fetch_boc_prime()
    if prime:
        scraped['prime'] = prime

    # 2. Try Ratehub for mortgage rates
    print("\n📡 Fetching mortgage rates from Ratehub.ca...")
    rh_rates = fetch_ratehub_rates()
    scraped.update(rh_rates)

    if not scraped:
        print("\n⚠️  All sources failed — keeping existing rates unchanged.")
        sys.exit(0)

    # 3. Update App.jsx
    print("\n✍️  Updating src/App.jsx...")
    update_app_jsx(scraped)
    print("\nDone! GitHub Actions will commit and redeploy if rates changed.")
