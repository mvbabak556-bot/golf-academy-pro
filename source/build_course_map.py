#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""GolfAcademy PRO — course map page builder.

Reads the master SVG of the MIS Golf Club course (source/assets/course_map_src.svg),
validates every hole (geometry + tee label + scorecard + totals), then renders the
interactive, printable, fully self-contained page `course-map.html` at repo root.

The page has zero external dependencies: open it by double-clicking the file, or serve
it over HTTP. The map, the scorecard table and the hole card are all generated from the
same parsed data, so they can never drift apart.

Usage:
    python3 source/build_course_map.py            # build + verify course-map.html
    python3 source/build_course_map.py --check    # verify only (no write)
"""
import json
import os
import re
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source', 'assets', 'course_map_src.svg')
OUT = os.path.join(ROOT, 'course-map.html')

SVG = '{http://www.w3.org/2000/svg}'
# scale bar in the sheet: 85 px == 100 m
PX_PER_M = 85.0 / 100.0
M_PER_YARD = 0.9144

FA_DIGITS = str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹')


def fa(n):
    """1234 -> '۱٬۲۳۴' (Persian digits, Persian thousands separator)."""
    return f'{n:,}'.replace(',', '٬').translate(FA_DIGITS)


def num(v):
    """325.0 -> '325', 514.4 -> '514.4' (keeps the source formatting)."""
    s = f'{float(v):.1f}'
    return s[:-2] if s.endswith('.0') else s


def classes(el):
    return (el.get('class') or '').split()


# ────────────────────────────────────────── parse ──────────────────────────────────────────
def parse(path):
    with open(path, encoding='utf-8') as fh:
        text = fh.read()
    root = ET.fromstring(text)

    def groups_with(attr, value):
        return [g for g in root.iter(SVG + 'g') if g.get(attr) == value]

    fairway_edge = groups_with('stroke', '#7fae6a')
    fairway_turf = groups_with('stroke', '#cde3b4')
    tee_group = groups_with('fill', '#1f4e79')

    d = {
        'lines': [[float(l.get(k)) for k in ('x1', 'y1', 'x2', 'y2')] for l in fairway_edge[0]],
        'lines_turf': [[float(l.get(k)) for k in ('x1', 'y1', 'x2', 'y2')] for l in fairway_turf[0]],
        'tees': [{k: float(r.get(k)) for k in ('x', 'y', 'width', 'height', 'rx')} for r in tee_group[0]],
        'teelabels': [{'x': float(t.get('x')), 'y': float(t.get('y')),
                       'anchor': t.get('text-anchor'), 'text': (t.text or '').strip()}
                      for t in root.iter(SVG + 'text') if 'tl' in classes(t)],
        'greens': [{'cx': float(c.get('cx')), 'cy': float(c.get('cy')), 'r': float(c.get('r'))}
                   for c in root.iter(SVG + 'circle')
                   if c.get('fill') == '#3f9b4f' and c.get('stroke') == '#245c2e'],
        'gn': [{'x': float(t.get('x')), 'y': float(t.get('y')), 'text': (t.text or '').strip()}
               for t in root.iter(SVG + 'text') if 'gn' in classes(t)],
        'hl': [{'x': float(t.get('x')), 'y': float(t.get('y')), 'anchor': t.get('text-anchor'),
                'text': (t.text or '').strip()}
               for t in root.iter(SVG + 'text') if 'hl' in classes(t)],
    }

    rows, totals = [], []
    for g in root.iter(SVG + 'g'):
        texts = [t for t in g if t.tag == SVG + 'text']
        if 'td' in classes(g):
            vals = [(t.text or '').strip() for t in texts]
            rows = [vals[i:i + 3] for i in range(0, len(vals), 3)]
        elif 'tb' in classes(g):
            totals = [[(t.text or '').strip() for t in texts][i:i + 3]
                      for i in range(0, len(texts), 3)]
    d['rows'], d['totals'] = rows, totals
    d['title'] = next(t.text for t in root.iter(SVG + 'text') if 't' in classes(t)).strip()
    return text, d


# ───────────────────────────────────────── validate ────────────────────────────────────────
def validate(d):
    errs = []
    for key in ('lines', 'lines_turf', 'tees', 'teelabels', 'greens', 'gn', 'hl', 'rows'):
        if len(d[key]) != 18:
            errs.append(f'{key}: expected 18 items, got {len(d[key])}')
    if errs:
        return errs

    for i in range(18):
        n = i + 1
        x1, y1, x2, y2 = d['lines'][i]
        tee, grn = d['tees'][i], d['greens'][i]
        # tee box centre sits on the start of the fairway line
        if abs(tee['x'] + tee['width'] / 2 - x1) > 0.06 or abs(tee['y'] + tee['height'] / 2 - y1) > 0.06:
            errs.append(f'hole {n}: tee box is not on the fairway start')
        # green sits on the end of the fairway line
        if abs(grn['cx'] - x2) > 0.06 or abs(grn['cy'] - y2) > 0.06:
            errs.append(f'hole {n}: green is not on the fairway end')
        if d['lines_turf'][i] != d['lines'][i]:
            errs.append(f'hole {n}: turf line differs from edge line')
        # green number + "Hole n" caption
        if d['gn'][i]['text'] != str(n):
            errs.append(f'hole {n}: green number reads {d["gn"][i]["text"]!r}')
        if d['hl'][i]['text'] != f'Hole {n}':
            errs.append(f'hole {n}: caption reads {d["hl"][i]["text"]!r}')
        # flag geometry follows the green centre
        if abs(d['gn'][i]['y'] - (grn['cy'] + 3.2)) > 0.06:
            errs.append(f'hole {n}: number baseline is off the green')
        # tee label  ==  T.n-<yards>Y-Par<par>  ==  scorecard row
        m = re.fullmatch(r'T\.(\d+)-(\d+)Y-Par(\d)', d['teelabels'][i]['text'])
        if not m:
            errs.append(f'hole {n}: cannot read tee label {d["teelabels"][i]["text"]!r}')
            continue
        ln, yards, par = int(m.group(1)), int(m.group(2)), int(m.group(3))
        if ln != n:
            errs.append(f'hole {n}: tee label is numbered {ln}')
        row = d['rows'][i]
        if [int(row[0]), int(row[1]), int(row[2])] != [n, yards, par]:
            errs.append(f'hole {n}: scorecard row {row} disagrees with tee label {yards}/{par}')
        if not 2 <= par <= 5:
            errs.append(f'hole {n}: impossible par {par}')

    out_y = sum(int(r[1]) for r in d['rows'][:9]);  out_p = sum(int(r[2]) for r in d['rows'][:9])
    in_y = sum(int(r[1]) for r in d['rows'][9:]);   in_p = sum(int(r[2]) for r in d['rows'][9:])
    expect = {'OUT': (out_y, out_p), 'IN': (in_y, in_p), 'TOTAL': (out_y + in_y, out_p + in_p)}
    for label, y, p in d['totals']:
        if label not in expect:
            errs.append(f'unknown total row {label!r}')
        elif (int(y), int(p)) != expect[label]:
            errs.append(f'{label} total {y}/{p} should be {expect[label][0]}/{expect[label][1]}')
    if len(d['totals']) != 3:
        errs.append(f'expected 3 total rows, got {len(d["totals"])}')
    return errs


def holes(d):
    """One flat record per hole — the single source of truth for the page."""
    out = []
    for i in range(18):
        x1, y1, x2, y2 = d['lines'][i]
        m = re.fullmatch(r'T\.(\d+)-(\d+)Y-Par(\d)', d['teelabels'][i]['text'])
        yards, par = int(m.group(2)), int(m.group(3))
        out.append({
            'n': i + 1, 'yards': yards, 'par': par,
            'm': round(yards * M_PER_YARD),
            'tee': [x1, y1], 'green': [x2, y2],
        })
    return out


# ────────────────────────────────────────── emit svg ───────────────────────────────────────
def fairway_layer(d, stroke, width, id_prefix):
    rows = []
    for i, (x1, y1, x2, y2) in enumerate(d['lines']):
        rows.append(
            f'<line id="{id_prefix}-{i+1}" class="fw" data-n="{i+1}" '
            f'x1="{num(x1)}" y1="{num(y1)}" x2="{num(x2)}" y2="{num(y2)}"/>')
    return (f'<g stroke="{stroke}" stroke-width="{width}" stroke-linecap="round">\n'
            + '\n'.join(rows) + '\n</g>')


def tee_layer(d):
    rows = []
    for i, t in enumerate(d['tees']):
        rows.append(
            f'<rect id="tee-{i+1}" class="tee" data-n="{i+1}" x="{num(t["x"])}" y="{num(t["y"])}" '
            f'width="{num(t["width"])}" height="{num(t["height"])}" rx="{num(t["rx"])}"/>')
    return ('<g fill="#1f4e79" stroke="#fff" stroke-width="1.2">\n' + '\n'.join(rows) + '\n</g>')


def teelabel_layer(d):
    rows = []
    for i, t in enumerate(d['teelabels']):
        anchor = f' text-anchor="{t["anchor"]}"' if t['anchor'] else ''
        rows.append(f'<text id="teelabel-{i+1}" class="tl teelabel" data-n="{i+1}" x="{num(t["x"])}" '
                    f'y="{num(t["y"])}"{anchor}>{t["text"]}</text>')
    return '<!-- Tee labels -->\n' + '\n'.join(rows)


def hole_layer(d):
    rows = []
    for i in range(18):
        n = i + 1
        cx, cy = d['greens'][i]['cx'], d['greens'][i]['cy']
        hl = d['hl'][i]
        anchor = f' text-anchor="{hl["anchor"]}"' if hl['anchor'] else ''
        # flag pole/flag are derived from the green centre — identical to the source sheet
        pole = (cx, cy - 7, cx, cy - 17)
        flag = f'M{num(cx)},{num(cy - 17)} L{num(cx + 9)},{num(cy - 14)} L{num(cx)},{num(cy - 11)} Z'
        rows.append(
            f'<g id="hole-{n}" class="hole" data-n="{n}">'
            f'<circle class="halo" cx="{num(cx)}" cy="{num(cy)}" r="15" fill="none" '
            f'stroke="#c62828" stroke-width="2.5"/>'
            f'<circle class="grn" cx="{num(cx)}" cy="{num(cy)}" r="7" fill="#3f9b4f" '
            f'stroke="#245c2e" stroke-width="1.5"/>'
            f'<line x1="{num(pole[0])}" y1="{num(pole[1])}" x2="{num(pole[2])}" y2="{num(pole[3])}" stroke="#333"/>'
            f'<path d="{flag}" fill="#c62828"/>'
            f'<text x="{num(d["gn"][i]["x"])}" y="{num(d["gn"][i]["y"])}" class="gn" '
            f'text-anchor="middle">{n}</text>'
            f'<text x="{num(hl["x"])}" y="{num(hl["y"])}" class="hl"{anchor}>Hole {n}</text>'
            f'</g>')
    return '<!-- Greens + flags + hole labels -->\n<g>\n' + '\n'.join(rows) + '\n</g>'


def route_layer(H):
    pts = []
    for h in H:
        pts.append(f'{num(h["tee"][0])},{num(h["tee"][1])}')
        pts.append(f'{num(h["green"][0])},{num(h["green"][1])}')
    return ('<!-- Walking route 1..18 (tee -> green -> next tee) -->\n'
            f'<polyline id="route" points="{" ".join(pts)}" fill="none" stroke="#c62828" '
            'stroke-width="2" stroke-dasharray="7 5" stroke-linejoin="round" opacity=".8"/>')


def build_svg(text, d, H):
    """Splice the generated layers into the master sheet, keeping the static chrome verbatim."""
    head, rest = text.split('<!-- Fairways (edge + turf) -->', 1)
    head = head.replace('<svg ', '<svg id="map-svg" ', 1)
    _, rest = rest.split('<!-- Tee boxes -->', 1)
    _, rest = rest.split('<!-- Tee labels -->', 1)
    _, rest = rest.split('<!-- Greens + flags + hole labels -->', 1)
    _, rest = rest.split('<!-- North arrow & scale -->', 1)
    tail = '<!-- North arrow & scale -->' + rest

    # wrap scorecard + legend so the page can toggle them without touching the sheet itself
    sc_head, sc_rest = tail.split('<!-- Scorecard -->', 1)
    sc_body, sc_tail = sc_rest.split('<!-- Legend -->', 1)
    lg_body, lg_tail = sc_tail.split('<text x="40" y="766"', 1)
    tail = (sc_head + '<!-- Scorecard -->\n<g id="svg-scorecard">' + sc_body + '</g>\n'
            + '<!-- Legend -->\n<g id="svg-legend">' + lg_body + '</g>\n'
            + '<text x="40" y="766"' + lg_tail)

    return (head
            + route_layer(H) + '\n'
            + '<!-- Fairways (edge + turf) -->\n'
            + fairway_layer(d, '#7fae6a', 24, 'fwe') + '\n'
            + fairway_layer(d, '#cde3b4', 19, 'fw') + '\n'
            + '<!-- Tee boxes -->\n' + tee_layer(d) + '\n'
            + teelabel_layer(d) + '\n'
            + hole_layer(d) + '\n'
            + tail)


# ──────────────────────────────────────── emit table ───────────────────────────────────────
def build_table(d, H):
    rows = []
    for h in H:
        rows.append(
            f'<tr data-n="{h["n"]}" tabindex="0" title="هول {fa(h["n"])} — برای زوم کلیک کنید">'
            f'<th scope="row">{fa(h["n"])}</th><td>{fa(h["yards"])}</td>'
            f'<td>{fa(h["m"])}</td><td>{fa(h["par"])}</td></tr>')
        if h['n'] in (9, 18):
            part = H[:9] if h['n'] == 9 else H[9:]
            key = 'OUT' if h['n'] == 9 else 'IN'
            label = 'OUT (۱–۹)' if h['n'] == 9 else 'IN (۱۰–۱۸)'
            rows.append(f'<tr class="sub" data-part="{key}">'
                        f'<th scope="row">{label}</th>'
                        f'<td>{fa(sum(x["yards"] for x in part))}</td>'
                        f'<td>{fa(round(sum(x["m"] for x in part)))}</td>'
                        f'<td>{fa(sum(x["par"] for x in part))}</td></tr>')
    return '\n'.join(rows)


# ───────────────────────────────────────── page shell ──────────────────────────────────────
CSS = """
:root{
  --bg:#0B0F14; --panel:#131C29; --panel2:#18202D; --sheet:#f6faf2;
  --green:#007A5A; --green-l:#1EBB8A; --gold:#D4AF37; --gold-l:#E9C766;
  --white:#F8FAFC; --muted:#8A93A6; --line:rgba(212,175,55,.22); --line-soft:rgba(248,250,252,.08);
  --red:#E74C3C; --radius:16px;
  --font:'Vazirmatn','Segoe UI',Tahoma,Arial,sans-serif;
}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:var(--font);background:
  radial-gradient(900px 600px at 88% -8%, rgba(0,122,90,.28), transparent 60%),
  radial-gradient(760px 560px at -8% 24%, rgba(212,175,55,.13), transparent 55%), var(--bg);
  color:var(--white);min-height:100vh;-webkit-font-smoothing:antialiased}

/* ── نوار بالا ── */
.topbar{display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;
  padding:16px 20px;border-bottom:1px solid var(--line);
  background:linear-gradient(180deg,rgba(19,28,41,.92),rgba(11,15,20,.55));backdrop-filter:blur(8px);
  position:sticky;top:0;z-index:20}
.brand{display:flex;align-items:center;gap:12px}
.brand .mark{width:46px;height:46px;border-radius:14px;display:grid;place-items:center;font-size:24px;
  background:radial-gradient(circle at 30% 28%,#1d3348,#0c1420);border:1px solid var(--line);
  box-shadow:0 0 22px rgba(212,175,55,.28)}
.brand h1{font-size:19px;font-weight:900;letter-spacing:.2px;
  background:linear-gradient(90deg,var(--gold-l),#fff,var(--gold));-webkit-background-clip:text;
  background-clip:text;color:transparent}
.brand .sub{font-size:11px;color:var(--muted);letter-spacing:1.6px;margin-top:3px;direction:ltr}
.stats{display:flex;flex-wrap:wrap;gap:8px}
.chip{font-size:12px;color:#cfd7e4;background:var(--panel);border:1px solid var(--line-soft);
  border-radius:999px;padding:6px 12px;white-space:nowrap}
.chip b{color:var(--gold-l);font-weight:900}

/* ── ابزار ── */
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;padding:12px 20px;
  border-bottom:1px solid var(--line-soft);position:sticky;top:78px;z-index:19;
  background:rgba(11,15,20,.82);backdrop-filter:blur(8px)}
.toolbar .group{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.toolbar .group+.group{border-inline-start:1px solid var(--line-soft);padding-inline-start:10px}
button,.tgl{font-family:var(--font);font-size:12.5px;color:var(--white);background:var(--panel2);
  border:1px solid var(--line-soft);border-radius:10px;padding:7px 11px;cursor:pointer;
  transition:.16s ease;user-select:none}
button:hover,.tgl:hover{border-color:var(--gold);transform:translateY(-1px);
  box-shadow:0 6px 18px rgba(0,0,0,.35)}
button:active{transform:translateY(0)}
button:focus-visible,.tgl:focus-within,#scorecard tbody tr:focus-visible{outline:2px solid var(--gold-l);outline-offset:2px}
#zoom-val{font-size:12px;color:var(--muted);min-width:52px;text-align:center}
.tgl{display:inline-flex;gap:7px;align-items:center;color:#cfd7e4}
.tgl input{accent-color:var(--green-l);width:14px;height:14px}

/* ── چیدمان ── */
.layout{display:grid;grid-template-columns:minmax(0,1fr) 336px;gap:16px;padding:16px 20px 26px;
  align-items:start}
.mapwrap{background:var(--panel);border:1px solid var(--line-soft);border-radius:var(--radius);
  padding:12px;box-shadow:0 10px 40px rgba(0,0,0,.45)}
#map-viewport{position:relative;overflow:hidden;border-radius:12px;background:
  repeating-conic-gradient(#141d29 0 25%, #101925 0 50%) 0 0/22px 22px;
  height:min(72vh,760px);touch-action:none;cursor:grab}
#map-viewport.drag{cursor:grabbing}
#map-stage{position:absolute;top:0;left:0;width:1123px;height:794px;transform-origin:0 0;
  will-change:transform}
#map-svg{width:1123px;height:794px;display:block;background:#fff;
  box-shadow:0 0 0 1px rgba(0,0,0,.35),0 18px 50px rgba(0,0,0,.5)}
.hint{font-size:11.5px;color:var(--muted);margin-top:9px;text-align:center}

/* ── نقشه: حالت‌ها ── */
#route{display:none}
body.show-route #route{display:inline}
body.no-labels .tl,body.no-labels .hl{display:none}
body.no-card #svg-scorecard{display:none}
body.no-legend #svg-legend{display:none}
.hole{cursor:pointer}
.hole .halo{opacity:0;transition:opacity .18s}
.hole:hover .halo{opacity:.55}
.hole.on .halo{opacity:1;animation:pulse 1.6s ease-out infinite}
.hole.on .grn{stroke:#c62828;stroke-width:2.4}
@keyframes pulse{0%{r:15;opacity:1}70%{r:26;opacity:0}100%{r:26;opacity:0}}
.fw.on{stroke:#e0a020}
.tee.on{fill:#c62828}
.teelabel.on,.hole.on .hl{fill:#c62828}
.dimmed .hole:not(.on){opacity:.42}
.dimmed .fw:not(.on){opacity:.5}

/* ── پنل‌ها ── */
.side{display:grid;gap:14px;position:sticky;top:140px}
.panel{background:var(--panel);border:1px solid var(--line-soft);border-radius:var(--radius);
  padding:14px;box-shadow:0 10px 40px rgba(0,0,0,.35)}
.panel h2{font-size:14px;font-weight:900;color:var(--gold-l);margin-bottom:10px;
  display:flex;align-items:center;gap:8px}
.holecart{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}
.holecart .box{background:var(--panel2);border:1px solid var(--line-soft);border-radius:12px;
  padding:9px 10px}
.holecart .box span{display:block;font-size:10.5px;color:var(--muted);margin-bottom:3px}
.holecart .box b{font-size:17px;font-weight:900;color:var(--white)}
.holecart .box b.gold{color:var(--gold-l)}
.holecart .wide{grid-column:1/-1;font-size:11.5px;color:#c3ccd9;line-height:1.9}
.navrow{display:flex;gap:6px;margin-top:10px}
.navrow button{flex:1}

table{width:100%;border-collapse:collapse;font-size:12.5px}
caption{caption-side:bottom;font-size:11px;color:var(--muted);padding-top:8px;text-align:start}
thead th{font-size:11px;color:var(--muted);font-weight:700;text-align:center;
  border-bottom:1px solid var(--line);padding:0 4px 7px}
tbody th,tbody td{padding:5px 4px;text-align:center;border-bottom:1px solid var(--line-soft)}
tbody th{color:#e6ebf2;font-weight:700}
tbody tr[data-n]{cursor:pointer}
tbody tr[data-n]:hover{background:rgba(30,187,138,.12)}
tbody tr.on{background:rgba(212,175,55,.18);box-shadow:inset 3px 0 0 var(--gold)}
tbody tr.sub th,tbody tr.sub td{color:var(--green-l);font-weight:700;
  background:rgba(0,122,90,.14)}
tfoot th,tfoot td{padding:8px 4px;text-align:center;font-size:13px;font-weight:900;
  color:var(--gold-l);border-top:1px solid var(--line)}
.legend{font-size:11.5px;color:#c3ccd9;line-height:2}
.legend i{display:inline-block;width:13px;height:13px;border-radius:3px;vertical-align:-2px;
  margin-inline-end:6px}
.legend .dot{border-radius:50%}
footer{padding:0 20px 26px;color:var(--muted);font-size:11px;line-height:2;text-align:center}

@media (max-width:1080px){
  .layout{grid-template-columns:1fr}
  .side{position:static}
  #map-viewport{height:62vh}
  .toolbar{top:auto;position:static}
}
@media (max-width:560px){
  .brand h1{font-size:16px}.stats .chip{font-size:11px;padding:5px 9px}
  #map-viewport{height:52vh}
}

/* ── چاپ: دقیقاً A4 افقی ── */
@page{size:A4 landscape;margin:0}
@media print{
  body{background:#fff}
  .topbar,.toolbar,.side,.hint,footer{display:none!important}
  .layout{display:block;padding:0}
  .mapwrap{background:#fff;border:0;padding:0;box-shadow:none;border-radius:0}
  #map-viewport{overflow:visible;height:auto;background:#fff;border-radius:0}
  #map-stage{position:static;width:auto;height:auto;transform:none!important}
  #map-svg{width:297mm;height:210mm;box-shadow:none}
  body.no-card #svg-scorecard,body.no-legend #svg-legend{display:none}
}
"""

JS = """
(function () {
  'use strict';
  var svg = document.getElementById('map-svg');
  var stage = document.getElementById('map-stage');
  var vp = document.getElementById('map-viewport');
  if (!svg || !stage || !vp) return;

  var W = 1123, H = 794;
  var PX_PER_M = __PX_PER_M__;            // نقشه: ۸۵ پیکسل = ۱۰۰ متر
  var HOLES = __HOLES_JSON__;
  var FA = {'0':'۰','1':'۱','2':'۲','3':'۳','4':'۴','5':'۵','6':'۶','7':'۷','8':'۸','9':'۹'};
  function fa(v) {
    return String(Math.round(v)).replace(/\\B(?=(\\d{3})+(?!\\d))/g, '٬').replace(/[0-9]/g, function (c) { return FA[c]; });
  }

  var k = 1, tx = 0, ty = 0, active = 0;
  var zoomVal = document.getElementById('zoom-val');

  function apply() {
    stage.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + k + ')';
    if (zoomVal) zoomVal.textContent = fa(k * 100) + '٪';
  }
  function clamp() {
    var w = W * k, h = H * k, vw = vp.clientWidth, vh = vp.clientHeight;
    var mx = Math.max(vw * 0.15, 40), my = Math.max(vh * 0.15, 40);
    tx = (w <= vw) ? (vw - w) / 2 : Math.min(mx, Math.max(tx, vw - w - mx));
    ty = (h <= vh) ? (vh - h) / 2 : Math.min(my, Math.max(ty, vh - h - my));
  }
  function setZoom(nk, cx, cy) {
    nk = Math.min(6, Math.max(0.2, nk));
    if (cx == null) { cx = vp.clientWidth / 2; cy = vp.clientHeight / 2; }
    var mx = (cx - tx) / k, my = (cy - ty) / k;   // نقطهٔ زیر نشانگر روی نقشه
    k = nk; tx = cx - k * mx; ty = cy - k * my;   // همان نقطه زیر نشانگر می‌ماند
    clamp(); apply();
  }
  function fit() {
    var vw = vp.clientWidth, vh = vp.clientHeight;
    if (!vw || !vh) return;
    k = Math.min(vw / W, vh / H) * 0.98;
    tx = (vw - W * k) / 2; ty = (vh - H * k) / 2;
    apply();
  }
  function centerOn(x, y, nk) {
    k = nk;
    tx = vp.clientWidth / 2 - k * x;
    ty = vp.clientHeight / 2 - k * y;
    clamp(); apply();
  }

  /* ── انتخاب هول ── */
  function setActive(n, zoom) {
    if (!n) { clear(); return; }
    active = n;
    document.body.classList.add('dimmed');
    ['hole', 'tee', 'teelabel', 'fw'].forEach(function (p) {
      document.querySelectorAll('#map-svg .' + p).forEach(function (el) {
        el.classList.toggle('on', +el.getAttribute('data-n') === n);
      });
    });
    document.querySelectorAll('#scorecard tbody tr[data-n]').forEach(function (tr) {
      tr.classList.toggle('on', +tr.getAttribute('data-n') === n);
    });
    paintCard();
    if (zoom) { var h = HOLES[n - 1]; centerOn(h.green[0], h.green[1], 3); }
  }
  function clear() {
    active = 0;
    document.body.classList.remove('dimmed');
    document.querySelectorAll('#map-svg .on').forEach(function (el) { el.classList.remove('on'); });
    document.querySelectorAll('#scorecard tbody tr.on').forEach(function (el) { el.classList.remove('on'); });
    paintCard();
  }
  function paintCard() {
    var h = active ? HOLES[active - 1] : null;
    var el = document.getElementById('hole-card');
    if (!el) return;
    if (!h) {
      el.innerHTML = '<div class="holecart"><div class="wide">روی نقشه یا جدول یک هول را انتخاب کنید '
        + 'تا مشخصاتش اینجا بیاید.<br>کلیدهای ← → هم بین هول‌ها جابه‌جا می‌شوند و Esc انتخاب را پاک می‌کند.</div></div>';
      return;
    }
    var dx = h.green[0] - h.tee[0], dy = h.green[1] - h.tee[1];
    var mapY = Math.sqrt(dx * dx + dy * dy) / PX_PER_M / 0.9144;
    el.innerHTML =
      '<div class="holecart">'
      + '<div class="box"><span>هول</span><b class="gold">' + fa(h.n) + '</b></div>'
      + '<div class="box"><span>پار</span><b>' + fa(h.par) + '</b></div>'
      + '<div class="box"><span>یارد (تی تا گرین)</span><b>' + fa(h.yards) + '</b></div>'
      + '<div class="box"><span>متر</span><b>' + fa(h.m) + '</b></div>'
      + '<div class="box wide">طول خط‌کشی‌شده روی نقشه ≈ <b>' + fa(mapY) + '</b> یارد '
      + '(مقیاس ≈ ۱:۸٬۵۰۰ — برای مقایسه با یارد رسمی).</div>'
      + '</div>'
      + '<div class="navrow"><button id="h-prev">◀ هول قبلی</button><button id="h-next">هول بعدی ▶</button></div>';
    var prev = document.getElementById('h-prev'), next = document.getElementById('h-next');
    if (prev) prev.addEventListener('click', function () { setActive(active > 1 ? active - 1 : 18, true); });
    if (next) next.addEventListener('click', function () { setActive(active < 18 ? active + 1 : 1, true); });
  }

  /* ── رویدادها ── */
  vp.addEventListener('pointerdown', function (e) {
    if (e.target.closest && e.target.closest('.hole')) return;
    vp.classList.add('drag');
    var sx = e.clientX, sy = e.clientY, ox = tx, oy = ty, moved = 0;
    function mv(ev) {
      tx = ox + (ev.clientX - sx); ty = oy + (ev.clientY - sy);
      moved = Math.max(moved, Math.abs(ev.clientX - sx) + Math.abs(ev.clientY - sy));
      clamp(); apply();
    }
    function up() {
      vp.classList.remove('drag');
      window.removeEventListener('pointermove', mv);
      window.removeEventListener('pointerup', up);
      if (moved < 5 && active) clear();
    }
    window.addEventListener('pointermove', mv);
    window.addEventListener('pointerup', up);
  });
  vp.addEventListener('wheel', function (e) {
    e.preventDefault();
    var r = vp.getBoundingClientRect();
    setZoom(k * (e.deltaY < 0 ? 1.16 : 1 / 1.16), e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  svg.addEventListener('click', function (e) {
    var g = e.target.closest ? e.target.closest('.hole') : null;
    if (g) { e.stopPropagation(); setActive(+g.getAttribute('data-n'), true); }
  });

  document.querySelectorAll('#scorecard tbody tr[data-n]').forEach(function (tr) {
    var n = +tr.getAttribute('data-n');
    tr.addEventListener('click', function () { setActive(n, true); });
    tr.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(n, true); }
    });
    tr.addEventListener('mouseenter', function () {
      var g = document.getElementById('hole-' + n);
      if (g && !active) g.classList.add('on');
    });
    tr.addEventListener('mouseleave', function () {
      var g = document.getElementById('hole-' + n);
      if (g && !active) g.classList.remove('on');
    });
  });

  document.addEventListener('keydown', function (e) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    if (e.key === 'ArrowLeft') { setActive(active < 18 ? active + 1 : 1, true); }
    else if (e.key === 'ArrowRight') { setActive(active > 1 ? active - 1 : 18, true); }
    else if (e.key === 'Escape') { clear(); fit(); }
    else if (e.key === '+' || e.key === '=') { setZoom(k * 1.2); }
    else if (e.key === '-') { setZoom(k / 1.2); }
  });

  function bind(id, fn) { var b = document.getElementById(id); if (b) b.addEventListener('click', fn); }
  bind('btn-zoom-in', function () { setZoom(k * 1.25); });
  bind('btn-zoom-out', function () { setZoom(k / 1.25); });
  bind('btn-fit', fit);
  bind('btn-100', function () { centerOn(W / 2, H / 2, 1); });
  bind('btn-print', function () { window.print(); });
  bind('btn-fs', function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  });

  function toggle(id, cls, invert) {
    var c = document.getElementById(id);
    if (!c) return;
    var set = function () { document.body.classList.toggle(cls, invert ? !c.checked : c.checked); };
    c.addEventListener('change', set); set();
  }
  toggle('tg-labels', 'no-labels', true);
  toggle('tg-route', 'show-route', false);
  toggle('tg-card', 'no-card', true);
  toggle('tg-legend', 'no-legend', true);

  /* ── خروجی فایل ── */
  function svgSource() {
    var c = svg.cloneNode(true);
    c.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    c.querySelectorAll('.halo').forEach(function (e) { e.remove(); });
    c.querySelectorAll('.on').forEach(function (e) { e.classList.remove('on'); });
    c.setAttribute('width', '297mm'); c.setAttribute('height', '210mm');
    return '<?xml version="1.0" encoding="UTF-8"?>\\n' + c.outerHTML;
  }
  function save(name, blob) {
    if (!window.URL || !URL.createObjectURL) return;
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  bind('btn-svg', function () {
    save('MIS-Golf-Map-Masjed-Soleyman.svg', new Blob([svgSource()], { type: 'image/svg+xml;charset=utf-8' }));
  });
  bind('btn-png', function () {
    var scale = 2, img = new Image();
    var blob = new Blob([svgSource()], { type: 'image/svg+xml;charset=utf-8' });
    if (!window.URL || !URL.createObjectURL) return;
    img.onload = function () {
      var cv = document.createElement('canvas');
      cv.width = W * scale; cv.height = H * scale;
      var cx = cv.getContext('2d');
      cx.fillStyle = '#fff'; cx.fillRect(0, 0, cv.width, cv.height);
      cx.drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(img.src);
      cv.toBlob(function (b) { if (b) save('MIS-Golf-Map-Masjed-Soleyman.png', b); }, 'image/png');
    };
    img.src = URL.createObjectURL(blob);
  });

  window.addEventListener('resize', function () { clamp(); apply(); });
  fit(); paintCard();

  window.CourseMap = {
    HOLES: HOLES, setActive: setActive, clear: clear, fit: fit,
    zoom: function (n) { setZoom(n); }, state: function () { return { k: k, tx: tx, ty: ty, active: active }; },
    svgSource: svgSource
  };
})();
"""

PAGE = """<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>نقشهٔ زمین گلف مسجدسلیمان — MIS GOLF CLUB</title>
<meta name="description" content="__DESC__">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='30' fill='%23f6e27a' stroke='%23b58c1c' stroke-width='3'/%3E%3Cg fill='%23c9a227'%3E%3Ccircle cx='24' cy='24' r='3'/%3E%3Ccircle cx='40' cy='24' r='3'/%3E%3Ccircle cx='32' cy='34' r='3'/%3E%3Ccircle cx='22' cy='42' r='3'/%3E%3Ccircle cx='42' cy='42' r='3'/%3E%3C/g%3E%3C/svg%3E">
<style>__CSS__</style>
</head>
<body>

<header class="topbar">
  <div class="brand">
    <div class="mark">⛳</div>
    <div>
      <h1>باشگاه گلف MIS — مسجدسلیمان</h1>
      <div class="sub">__TITLE__</div>
    </div>
  </div>
  <div class="stats">
    <span class="chip"><b>__N_HOLES__</b> هول</span>
    <span class="chip">مجموع پار <b>__PAR__</b></span>
    <span class="chip"><b>__YARDS__</b> یارد</span>
    <span class="chip">OUT <b>__OUT_Y__</b> / پار <b>__OUT_P__</b></span>
    <span class="chip">IN <b>__IN_Y__</b> / پار <b>__IN_P__</b></span>
  </div>
</header>

<div class="toolbar" role="toolbar" aria-label="ابزار نقشه">
  <div class="group">
    <button type="button" id="btn-zoom-out" title="کوچک‌نمایی (−)">−</button>
    <span id="zoom-val">۱۰۰٪</span>
    <button type="button" id="btn-zoom-in" title="بزرگ‌نمایی (+)">+</button>
    <button type="button" id="btn-fit">کل نقشه</button>
    <button type="button" id="btn-100">۱:۱</button>
  </div>
  <div class="group">
    <label class="tgl"><input type="checkbox" id="tg-labels" checked> برچسب‌ها</label>
    <label class="tgl"><input type="checkbox" id="tg-route"> مسیر ۱۸ هول</label>
    <label class="tgl"><input type="checkbox" id="tg-card" checked> کارت امتیاز روی نقشه</label>
    <label class="tgl"><input type="checkbox" id="tg-legend" checked> راهنما</label>
  </div>
  <div class="group">
    <button type="button" id="btn-print">🖨️ چاپ A4</button>
    <button type="button" id="btn-svg">⬇️ SVG</button>
    <button type="button" id="btn-png">⬇️ PNG</button>
    <button type="button" id="btn-fs">⛶ تمام‌صفحه</button>
  </div>
</div>

<main class="layout">
  <section class="mapwrap">
    <div id="map-viewport">
      <div id="map-stage">
__SVG__
      </div>
    </div>
    <p class="hint">نقشه را با ماوس بکشید • اسکرول = بزرگ‌نمایی • کلیک روی هول = زوم روی آن • Esc = بازگشت</p>
  </section>

  <aside class="side">
    <div class="panel">
      <h2>🎯 هول انتخاب‌شده</h2>
      <div id="hole-card"></div>
    </div>

    <div class="panel">
      <h2>📋 کارت امتیاز</h2>
      <table id="scorecard">
        <thead>
          <tr><th scope="col">هول</th><th scope="col">یارد</th><th scope="col">متر</th><th scope="col">پار</th></tr>
        </thead>
        <tbody>
__TABLE__
        </tbody>
        <tfoot>
          <tr><th scope="row">TOTAL</th><td>__YARDS__</td><td>__METERS__</td><td>__PAR__</td></tr>
        </tfoot>
        <caption>یارد از تی‌باکس تا گرین • متر = یارد × ۰٫۹۱۴۴</caption>
      </table>
    </div>

    <div class="panel legend">
      <h2>🗺️ راهنمای نقشه</h2>
      <div><i style="background:#1f4e79"></i> تی‌باکس (Tee box) — T.n</div>
      <div><i class="dot" style="background:#3f9b4f"></i> گرین و سوراخ (Green &amp; hole)</div>
      <div><i style="background:#cde3b4;border-radius:999px"></i> فیروی (Fairway)</div>
      <div><i style="background:transparent;border-top:2px dashed #c62828;border-radius:0;height:0"></i> مسیر پیمایش ۱۸ هول</div>
      <div>T = تی‌باکس • n = شمارهٔ هول • Y = یارد • Par = پار هول</div>
      <div>مبنای نقشه: نقاط GPS فایل KML — Source: Puttvision / MIS-Golf Map.kml</div>
    </div>
  </aside>
</main>

<footer>
  __FOOTER__<br>
  این صفحه تک‌فایلی و آفلاین است — برای چاپ A4 افقی، دکمهٔ «چاپ A4» را بزنید (حاشیهٔ چاپ را روی «بدون حاشیه» بگذارید).
</footer>

<script>__JS__</script>
</body>
</html>
"""


def build(write=True):
    text, d = parse(SRC)
    errs = validate(d)
    if errs:
        for e in errs:
            print('  ✗ ' + e)
        raise SystemExit(f'validation failed: {len(errs)} problem(s) in {os.path.relpath(SRC, ROOT)}')

    H = holes(d)
    svg = build_svg(text, d, H)
    table = build_table(d, H)
    out_y = sum(h['yards'] for h in H[:9]);  out_p = sum(h['par'] for h in H[:9])
    in_y = sum(h['yards'] for h in H[9:]);   in_p = sum(h['par'] for h in H[9:])
    tot_y = out_y + in_y;                    tot_p = out_p + in_p

    js = (JS.replace('__PX_PER_M__', repr(PX_PER_M))
            .replace('__HOLES_JSON__', json.dumps(H, ensure_ascii=False)))
    page = (PAGE.replace('__CSS__', CSS).replace('__JS__', js)
                .replace('__SVG__', '        ' + svg.replace('\n', '\n        '))
                .replace('__TABLE__', '          ' + table.replace('\n', '\n          '))
                .replace('__TITLE__', d['title'])
                .replace('__DESC__', 'نقشهٔ تعاملی ۱۸ هول باشگاه گلف MIS مسجدسلیمان — '
                                     f'مجموع پار {tot_p} و {tot_y} یارد، با کارت امتیاز و چاپ A4 افقی.')
                .replace('__FOOTER__', f'MIS Golf Club, Masjed Soleyman, Iran — {len(H)} holes • '
                                       'WGS84 placemarks → local metric projection')
                .replace('__N_HOLES__', fa(len(H)))
                .replace('__OUT_Y__', fa(out_y)).replace('__OUT_P__', fa(out_p))
                .replace('__IN_Y__', fa(in_y)).replace('__IN_P__', fa(in_p))
                .replace('__YARDS__', fa(tot_y)).replace('__METERS__', fa(round(tot_y * M_PER_YARD)))
                .replace('__PAR__', fa(tot_p)))

    if write:
        with open(OUT, 'w', encoding='utf-8') as fh:
            fh.write(page)
    return page, H, (out_y, out_p, in_y, in_p, tot_y, tot_p)


# ───────────────────────────────── verify the artifact ─────────────────────────────────────
def verify(page, H, totals):
    """Re-read what was just written and check the shipped page against the master data."""
    errs = []
    m = re.search(r'<svg id="map-svg".*?</svg>', page, re.S)
    if not m:
        raise SystemExit('verify: no #map-svg found in the page')
    svg = ET.fromstring(m.group(0))
    out_y, out_p, in_y, in_p, tot_y, tot_p = totals
    for i, h in enumerate(H):
        n = h['n']
        gid = f'{SVG}g'
        g = svg.find(f'.//*[@id="hole-{n}"]')
        if g is None or g.tag != gid:
            errs.append(f'page: missing <g id="hole-{n}">'); continue
        grn = g.find(f'{SVG}circle[@class="grn"]')
        if [float(grn.get('cx')), float(grn.get('cy'))] != h['green']:
            errs.append(f'page: hole {n} green moved off the master position')
        if g.find(f'{SVG}circle[@class="halo"]') is None:
            errs.append(f'page: hole {n} has no highlight halo')
        tee = svg.find(f'.//*[@id="tee-{n}"]')
        if tee is None or [float(tee.get('x')) + 4.5, float(tee.get('y')) + 4.5] != h['tee']:
            errs.append(f'page: tee {n} is not on the master position')
        tl = svg.find(f'.//*[@id="teelabel-{n}"]')
        if tl is None or tl.text != f'T.{n}-{h["yards"]}Y-Par{h["par"]}':
            errs.append(f'page: tee label {n} is {None if tl is None else tl.text!r}')
        fw = svg.find(f'.//*[@id="fw-{n}"]')
        if fw is None or [float(fw.get(k)) for k in ('x1', 'y1', 'x2', 'y2')] != h['tee'] + h['green']:
            errs.append(f'page: fairway {n} does not run tee → green')

    route = svg.find(f'.//*[@id="route"]')
    pts = route.get('points').split() if route is not None else []
    if len(pts) != 36:
        errs.append(f'page: route polyline has {len(pts)} points, expected 36 (18 tee + 18 green)')

    rows = re.findall(r'<tr data-n="(\d+)"[^>]*>.*?</tr>', page, re.S)
    if len(rows) != 18 or [int(r) for r in rows] != [h['n'] for h in H]:
        errs.append(f'page: scorecard table has {len(rows)} rows')
    for h in H:
        cells = re.findall(r'<t[hd][^>]*>([^<]*)</t[hd]>',
                           re.search(rf'<tr data-n="{h["n"]}"[^>]*>(.*?)</tr>', page, re.S).group(1))
        digits = lambda s: int(s.translate(str.maketrans('۰۱۲۳۴۵۶۷۸۹', '0123456789')).replace('٬', ''))
        if digits(cells[1]) != h['yards'] or digits(cells[3]) != h['par']:
            errs.append(f'page: table row {h["n"]} = {cells}, expected {h["yards"]}/{h["par"]}')
    # OUT / IN / TOTAL rows of the HTML card must carry the same sums as the SVG sheet
    subs = {k: (a, b) for k, a, b in
            re.findall(r'<tr class="sub" data-part="(\w+)">.*?<td>([^<]+)</td><td>[^<]+</td><td>([^<]+)</td>',
                       page, re.S)}
    for lab, y, p in (('OUT', out_y, out_p), ('IN', in_y, in_p)):
        got = subs.get(lab)
        if not got or [got[0], got[1]] != [fa(y), fa(p)]:
            errs.append(f'page: {lab} row shows {got}, expected {fa(y)}/{fa(p)}')
    for token in (fa(tot_y), fa(tot_p)):
        if token not in page:
            errs.append(f'page: total {token} not shown in Persian digits')
    if svg.find(f'.//*[@id="svg-scorecard"]') is None:
        errs.append('page: in-map scorecard is not wrapped for toggling')
    if svg.find(f'.//*[@id="svg-legend"]') is None:
        errs.append('page: in-map legend is not wrapped for toggling')
    for hook in ('id="map-viewport"', 'id="tg-route"', 'id="btn-print"', 'window.CourseMap'):
        if hook not in page:
            errs.append(f'page: missing {hook}')
    return errs


def main():
    write = '--check' not in sys.argv
    page, H, totals = build(write=write)
    errs = verify(page, H, totals)
    out_y, out_p, in_y, in_p, tot_y, tot_p = totals
    print(f'  holes            : {len(H)}')
    print(f'  OUT (1-9)        : {out_y} yards / par {out_p}')
    print(f'  IN  (10-18)      : {in_y} yards / par {in_p}')
    print(f'  TOTAL            : {tot_y} yards / par {tot_p}')
    print(f'  page             : {len(page):,} bytes -> {os.path.relpath(OUT, ROOT)}'
          + (' (not written, --check)' if not write else ''))
    if errs:
        for e in errs:
            print('  ✗ ' + e)
        raise SystemExit(f'verification failed: {len(errs)} problem(s)')
    print('  ✔ map, scorecard table and totals all agree with the master SVG')


if __name__ == '__main__':
    main()
