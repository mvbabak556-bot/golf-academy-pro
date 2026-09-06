# -*- coding: utf-8 -*-
"""جاسازی فونت وزیرمتن داخل فایل‌های pptx (PPTX font embedding) — استاندارد OOXML."""
import os
import zipfile
import shutil
from lxml import etree

BASE = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(BASE, "fonts")
TYPEFACE = "Vazirmatn"

P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
PR_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
REL_TYPE = "http://schemas.openxmlformats.org/officeDocument/2006/relationships/font"

P = lambda tag: f"{{{P_NS}}}{tag}"


def _parse(b):
    return etree.fromstring(b)


def _dump(root):
    return etree.tostring(root, xml_declaration=True, encoding="UTF-8", standalone=True)


def embed_fonts(pptx_path):
    tmp = pptx_path + ".tmp"
    fonts = {
        "regular": os.path.join(FONT_DIR, "Vazirmatn-Regular.ttf"),
        "bold": os.path.join(FONT_DIR, "Vazirmatn-Bold.ttf"),
    }
    for p in fonts.values():
        if not os.path.exists(p):
            raise FileNotFoundError(p)

    with zipfile.ZipFile(pptx_path, "r") as zin:
        names = zin.namelist()
        data = {n: zin.read(n) for n in names}

    # 1) [Content_Types].xml : register fntdata Default (before any Override)
    ct_name = "[Content_Types].xml"
    root = _parse(data[ct_name])
    if not any(el.get("Extension") == "fntdata" for el in root.findall(f"{{{CT_NS}}}Default")):
        d = etree.Element(f"{{{CT_NS}}}Default")
        d.set("Extension", "fntdata")
        d.set("ContentType", "application/x-fontdata")
        ov = root.findall(f"{{{CT_NS}}}Override")
        (ov[0].addprevious(d) if ov else root.append(d))
    data[ct_name] = _dump(root)

    # 2) presentation.xml.rels : add font relationships
    rels_name = "ppt/_rels/presentation.xml.rels"
    rroot = _parse(data[rels_name])
    existing = {r.get("Id") for r in rroot.findall(f"{{{PR_NS}}}Relationship")}
    style_part = {}
    n = 1
    for style, path in fonts.items():
        while f"rId{n}" in existing:
            n += 1
        rid = f"rId{n}"; existing.add(rid); n += 1
        fname = f"font_{rid}.fntdata"
        rel = etree.SubElement(rroot, f"{{{PR_NS}}}Relationship")
        rel.set("Id", rid)
        rel.set("Type", REL_TYPE)
        rel.set("Target", f"fonts/{fname}")
        style_part[style] = (rid, f"ppt/fonts/{fname}")
        data[f"ppt/fonts/{fname}"] = open(path, "rb").read()
    data[rels_name] = _dump(rroot)

    # 3) presentation.xml : embedTrueTypeFonts flag + embeddedFontLst
    pres_name = "ppt/presentation.xml"
    proot = _parse(data[pres_name])
    proot.set("embedTrueTypeFonts", "1")
    for el in proot.findall(P("embeddedFontLst")):
        proot.remove(el)
    efl = etree.Element(P("embeddedFontLst"))
    ef = etree.SubElement(efl, P("embeddedFont"))
    font = etree.SubElement(ef, P("font"))
    font.set("typeface", TYPEFACE)
    font.set("charset", "178")
    font.set("pitchFamily", "34")
    for style in ("regular", "bold"):
        rid, _ = style_part[style]
        el = etree.SubElement(ef, P(style))
        el.set(f"{{{R_NS}}}id", rid)
    # Schema order (CT_Presentation): ...sldSz, notesSz, ..., embeddedFontLst,
    # ...defaultTextStyle... -> insert immediately before defaultTextStyle,
    # else after notesSz, else after sldSz, else append.
    dts = proot.find(P("defaultTextStyle"))
    if dts is not None:
        dts.addprevious(efl)
    else:
        anchor = proot.find(P("notesSz"))
        if anchor is None:
            anchor = proot.find(P("sldSz"))
        if anchor is not None:
            anchor.addnext(efl)
        else:
            proot.append(efl)
    data[pres_name] = _dump(proot)

    # 4) repackage
    extra = [k for k in data if k.startswith("ppt/fonts/") and k not in names]
    with zipfile.ZipFile(tmp, "w", zipfile.ZIP_DEFLATED) as zout:
        for name in names:
            zout.writestr(name, data[name])
        for k in extra:
            zout.writestr(k, data[k])
    shutil.move(tmp, pptx_path)
    return pptx_path


if __name__ == "__main__":
    import glob
    for f in sorted(glob.glob(os.path.join(BASE, "0*.pptx"))):
        embed_fonts(f)
        print("embedded:", os.path.basename(f))
