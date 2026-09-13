# -*- coding: utf-8 -*-
"""
موتور مشترک ساخت اسلایدها — یک‌بار تعریف المان‌ها، دو خروجی:
  ۱) فایل PowerPoint (python-pptx) با فونت‌های B Titr / B Lotus / B Zar
  ۲) رندر پیش‌نمایش PIL (با فونت وزیرمتن) برای بازبینی چیدمان و راست‌به‌چپ
مختصات همه بر حسب اینچ؛ مبدا بالا-چپ؛ تراز متن‌ها راست (RTL) هندل می‌شود.
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from arabic_reshaper import reshape
from bidi.algorithm import get_display

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.oxml.ns import qn
from lxml import etree

BASE = os.path.dirname(os.path.abspath(__file__))
PROC = os.path.join(BASE, "assets", "proc")

# ---------------------------------------------------------------- پالت رنگی
NAVY = (13, 33, 55)
NAVY2 = (18, 44, 73)
NAVY3 = (24, 54, 88)
TEAL = (46, 125, 129)
TEAL_D = (30, 94, 98)
GOLD = (184, 144, 62)
GOLD_L = (214, 184, 120)
IVORY = (244, 241, 234)
CARD = (255, 255, 255)
INK = (34, 49, 64)
MUTE = (107, 119, 133)
HAIR = (218, 223, 229)
HAIR2 = (231, 235, 239)
SOFT = (248, 249, 250)
PH_BG = (251, 245, 232)
PH_TX = (138, 102, 40)
WHITE = (255, 255, 255)
IVORY_T = (236, 232, 222)
TEAL_T = (127, 191, 191)

# فونت‌های نهایی PowerPoint (روی سیستم کاربر باید نصب باشند)
F_TITR = "B Titr"
F_LOTUS = "B Lotus"
F_ZAR = "B Zar"

# فونت‌های رندر پیش‌نمایش
_QF = {
    "titr": os.path.join(BASE, "qa_fonts", "Vazirmatn-Black.ttf"),
    "lotus": os.path.join(BASE, "qa_fonts", "Vazirmatn-SemiBold.ttf"),
    "zar": os.path.join(BASE, "qa_fonts", "Vazirmatn-Medium.ttf"),
    "zar_r": os.path.join(BASE, "qa_fonts", "Vazirmatn-Regular.ttf"),
}

EM, IN = 914400, 72
SCALE = 160  # پیکسل بر اینچ در رندر پیش‌نمایش (12.8in → 2048px)

_meas_font_cache = {}


def _meas_font(role, size):
    key = (role, round(size, 1))
    if key not in _meas_font_cache:
        path = _QF.get(role if role in ("titr", "lotus") else
                       ("zar" if role == "zar" else "zar_r"))
        _meas_font_cache[key] = ImageFont.truetype(path, max(8, int(size * SCALE / 72.0)))
    return _meas_font_cache[key]


def shape_lines(text, font, max_w_px):
    if not text:
        return [""]
    words = text.split(" ")
    lines, cur = [], ""

    def meas(t):
        return font.getlength(get_display(reshape(t)))

    for word in words:
        test = word if not cur else cur + " " + word
        if meas(test) <= max_w_px or not cur:
            cur = test
        else:
            lines.append(cur); cur = word
    if cur:
        lines.append(cur)
    return lines


def text_height(text, size, role, w_in, ls=1.42):
    """تخمین ارتفاع متن بر حسب اینچ (برای چیدمان هر دو بک‌اند)."""
    font = _meas_font(role, size)
    max_w = int(w_in * SCALE)
    n = 0
    for para in str(text).split("\n"):
        n += len(shape_lines(para, font, max_w) or [""])
    return n * (size / 72.0) * ls

PERSIAN_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")


def fa(s):
    return str(s).translate(PERSIAN_DIGITS)


# ============================================================= رندر PIL (QA)
class QASlide:
    def __init__(self, W=12.8, H=7.5, dark=False):
        self.W, self.H = W, H
        self.img = Image.new("RGB", (round(W * SCALE), round(H * SCALE)), IVORY)
        self.d = ImageDraw.Draw(self.img)
        self._fonts = {}

    def _font(self, role, size):
        key = (role, round(size, 1))
        if key not in self._fonts:
            self._fonts[key] = ImageFont.truetype(_QF.get(role, _QF["zar"]),
                                                  max(8, int(size * SCALE / 72.0)))
        return self._fonts[key]

    def _xy(self, x, y):
        return int(round(x * SCALE)), int(round(y * SCALE))

    def bg_image(self, path):
        im = Image.open(path).convert("RGB").resize(self.img.size, Image.LANCZOS)
        self.img.paste(im, (0, 0))
        self.d = ImageDraw.Draw(self.img)

    def bg(self, color):
        self.d.rectangle([0, 0, self.img.size[0], self.img.size[1]], fill=color)

    def image(self, path, x, y, w, h):
        im = Image.open(path).convert("RGBA").resize(
            (int(w * SCALE), int(h * SCALE)), Image.LANCZOS)
        self.img.paste(im, self._xy(x, y), im)

    def _rrect(self, d, box, r, **kw):
        x1, y1, x2, y2 = box
        r = int(r * SCALE)
        d.rounded_rectangle([int(x1), int(y1), int(x2), int(y2)], radius=r, **kw)

    def rect(self, x, y, w, h, fill=CARD, line=None, lw=1.0, radius=0.10,
             shadow=False, dash=None):
        (x1, y1), (x2, y2) = self._xy(x, y), self._xy(x + w, y + h)
        box = [x1, y1, x2, y2]
        if shadow:
            pad = int(0.32 * SCALE)
            sh = Image.new("RGBA", self.img.size, (0, 0, 0, 0))
            sd = ImageDraw.Draw(sh)
            sd.rounded_rectangle([box[0] + 4, box[1] + int(0.075 * SCALE),
                                  box[2] + 4, box[3] + int(0.075 * SCALE)],
                                 radius=int(radius * SCALE),
                                 fill=(13, 33, 55, 46))
            sh = sh.filter(ImageFilter.GaussianBlur(9))
            self.img.paste(sh, (0, 0), sh)
            self.d = ImageDraw.Draw(self.img)
        kw = {}
        if fill is not None:
            kw["fill"] = fill
        if line is not None:
            kw["outline"] = line
            kw["width"] = max(1, int(lw * SCALE / 72))
        if dash:
            # خط‌چین با رسم لبه‌ها
            self._rrect(self.d, box, radius, fill=fill)
            self._dashed_rrect(box, radius, line or MUTE, lw)
        else:
            self._rrect(self.d, box, radius, **kw)

    def _dashed_rrect(self, box, r, color, lw):
        x1, y1, x2, y2 = [int(v) for v in box]
        rr = int(r * SCALE)
        for a, b in [(x1, x2), (y1, y2)]:
            pass
        d = self.d
        dl, gap = int(0.075 * SCALE), int(0.045 * SCALE)
        wpx = max(1, int(lw * SCALE / 72))
        # خطوط افقی بالا/پایین
        for y in (y1, y2 - wpx):
            x = x1 + rr
            while x < x2 - rr:
                d.line([x, y, min(x + dl, x2 - rr), y], fill=color, width=wpx)
                x += dl + gap
        for x in (x1, x2 - wpx):
            yy = y1 + rr
            while yy < y2 - rr:
                d.line([x, yy, x, min(yy + dl, y2 - rr)], fill=color, width=wpx)
                yy += dl + gap
        d.arc([x1, y1, x1 + 2 * rr, y1 + 2 * rr], 90, 180, fill=color, width=wpx)
        d.arc([x2 - 2 * rr, y1, x2, y1 + 2 * rr], 0, 90, fill=color, width=wpx)
        d.arc([x1, y2 - 2 * rr, x1 + 2 * rr, y2], 180, 270, fill=color, width=wpx)
        d.arc([x2 - 2 * rr, y2 - 2 * rr, x2, y2], 270, 360, fill=color, width=wpx)

    def ellipse(self, x, y, w, h, fill=None, line=None, lw=1.0):
        box = [*self._xy(x, y), *self._xy(x + w, y + h)]
        self.d.ellipse(box, fill=fill, outline=line,
                       width=max(1, int(lw * SCALE / 72)) if line else 1)

    def line(self, x1, y1, x2, y2, color=NAVY, w=1.0, dash=None):
        ln = max(1, int(w * SCALE / 72))
        if dash:
            self._dashed_line(x1, y1, x2, y2, color, w)
        else:
            self.d.line([*self._xy(x1, y1), *self._xy(x2, y2)], fill=color, width=ln)

    def _dashed_line(self, x1, y1, x2, y2, color, w):
        import math
        p1, p2 = self._xy(x1, y1), self._xy(x2, y2)
        dx, dy = p2[0] - p1[0], p2[1] - p1[1]
        L = math.hypot(dx, dy)
        if L == 0:
            return
        ux, uy = dx / L, dy / L
        dl, gap, i = int(0.07 * SCALE), int(0.05 * SCALE), 0
        d = self.d
        ln = max(1, int(w * SCALE / 72))
        c = i * (dl + gap)
        while c < L:
            a = (p1[0] + ux * c, p1[1] + uy * c)
            b = (p1[0] + ux * min(c + dl, L), p1[1] + uy * min(c + dl, L))
            d.line([a, b], fill=color, width=ln)
            c += dl + gap; i += 1

    def polygon(self, points, fill=TEAL, line=None):
        pts = [self._xy(x, y) for x, y in points]
        self.d.polygon(pts, fill=fill, outline=line)

    def arc_gauge(self, x, y, d, start_deg, end_deg, color, lw=0.11):
        box = [*self._xy(x, y), *self._xy(x + d, y + d)]
        self.d.arc(box, start_deg, end_deg, fill=color,
                   width=int(lw * SCALE))  # زاویهٔ صلح ساعت‌گرد از راست-۳‌ساعت

    def hbar(self, x, y, w, h, frac, track=(231, 235, 239), fill=TEAL):
        """میلهٔ افقی RTL؛ مقدار از لبهٔ راست پر می‌شود."""
        frac = max(0.0, min(1.0, frac))
        self.rect(x, y, w, h, fill=track, radius=h / 2, shadow=False)
        fw = w * frac
        if fw > 0.02:
            self.rect(x + w - fw, y, fw, h, fill=fill, radius=h / 2,
                      shadow=False)

    def chevron(self, x, y, w, h, fill, flip_h=False):
        a = min(0.26, w * 0.16)
        # فلش پیش‌فرض رو به راست
        pts = [(x + a, y), (x + w, y), (x + w - a, y + h / 2),
               (x + w, y + h), (x + a, y + h), (x, y + h / 2)]
        if flip_h:
            pts = [(x + w - (px - x), py) for px, py in pts]
        self.polygon(pts, fill=fill)

    def arrow_line(self, x1, y1, x2, y2, color=GOLD, w=1.6):
        import math
        self.line(x1, y1, x2, y2, color=color, w=w)
        s = 0.115
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy)
        ux, uy = dx / L, dy / L
        px, py = -uy, ux
        tip = (x2, y2)
        b1 = (x2 - ux * s + px * s * 0.52, y2 - uy * s + py * s * 0.52)
        b2 = (x2 - ux * s - px * s * 0.52, y2 - uy * s - py * s * 0.52)
        self.polygon([tip, b1, b2], fill=color)

    # --- متن ---
    def text(self, x, y, w, h, s, size=12, role="zar", color=INK,
             align="r", valign="t", ls=1.42, bold=False, spacing=0.0):
        font = self._font(role if role in ("titr", "lotus") else
                          ("zar" if bold else "zar_r"), size)
        max_w = int(w * SCALE)
        paras = str(s).split("\n")
        wrapped = []
        for p in paras:
            wrapped.extend(shape_lines(p, font, max_w) or [""])
        line_h = size * SCALE / 72.0 * ls
        total_h = len(wrapped) * line_h
        box_h = h * SCALE
        if valign == "m":
            yy = y * SCALE + (box_h - total_h) / 2
        elif valign == "b":
            yy = y * SCALE + box_h - total_h
        else:
            yy = y * SCALE
        for ln_text in wrapped:
            vis = get_display(reshape(ln_text))
            tw = font.getlength(vis)
            if align == "r":
                xx = (x + w) * SCALE - tw
            elif align == "c":
                xx = x * SCALE + (max_w - tw) / 2
            else:
                xx = x * SCALE
            self.d.text((xx, yy - size * SCALE / 72.0 * 0.18), vis,
                        font=font, fill=color)
            yy += line_h
        return total_h / SCALE

    def save(self, path):
        self.img.save(path, quality=92)


# ============================================================ خروجی PowerPoint
def _set_run_font(run, name, size, color, bold=False):
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = RGBColor(*color)
    rPr = run._r.get_or_add_rPr()
    rPr.set("lang", "fa-IR")
    rPr.set("altLang", "en-US")
    rPr.set("dirty", "0")
    for tag, exists in (("a:latin", False), ("a:ea", False), ("a:cs", False)):
        e = rPr.find(qn(tag))
        if e is None:
            e = etree.SubElement(rPr, qn(tag))
        e.set("typeface", name)


class PptxSlide:
    def __init__(self, prs):
        self.s = prs.slides.add_slide(prs.slide_layouts[6])
        self.sh = self.s.shapes

    def bg_image(self, path):
        self.sh.add_picture(path, 0, 0, Inches(12.8), Inches(7.5))

    def bg(self, color):
        shp = self._shape(MSO_SHAPE.RECTANGLE, 0, 0, 12.8, 7.5)
        shp.fill.solid(); shp.fill.fore_color.rgb = RGBColor(*color)
        shp.line.fill.background()
        shp.shadow.inherit = False
        self._send_back(shp)

    def image(self, path, x, y, w, h):
        self.sh.add_picture(path, Inches(x), Inches(y), Inches(w), Inches(h))

    def _shape(self, kind, x, y, w, h, flip_h=False):
        sp = self.sh.add_shape(kind, Inches(x), Inches(y), Inches(w), Inches(h))
        if flip_h:
            sp.rotation = 0
            xfrm = sp._element.spPr.find(qn("a:xfrm"))
            xfrm.set("flipH", "1")
        sp.shadow.inherit = False
        return sp

    @staticmethod
    def _send_back(shp):
        spTree = shp._element.getparent()
        spTree.remove(shp._element)
        spTree.insert(2, shp._element)

    @staticmethod
    def _no_shadow(shp):
        spPr = shp._element.spPr
        if spPr.find(qn("a:effectLst")) is None:
            etree.SubElement(spPr, qn("a:effectLst"))

    def rect(self, x, y, w, h, fill=CARD, line=None, lw=1.0, radius=0.10,
             shadow=False, dash=None):
        adj = min(0.5, max(0.0, radius / min(w, h) * 2.0))
        shp = self._shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius > 0.001
                          else MSO_SHAPE.RECTANGLE, x, y, w, h)
        try:
            shp.adjustments[0] = adj
        except Exception:
            pass
        if fill is None:
            shp.fill.background()
        else:
            shp.fill.solid(); shp.fill.fore_color.rgb = RGBColor(*fill)
        if line is None:
            shp.line.fill.background()
        else:
            shp.line.color.rgb = RGBColor(*line)
            shp.line.width = Pt(lw)
            if dash:
                ln = shp.line._get_or_add_ln()
                d = ln.find(qn("a:prstDash"))
                if d is None:
                    d = etree.SubElement(ln, qn("a:prstDash"))
                d.set("val", "dash")
        self._no_shadow(shp)
        return shp

    def ellipse(self, x, y, w, h, fill=None, line=None, lw=1.0):
        shp = self._shape(MSO_SHAPE.OVAL, x, y, w, h)
        if fill is None:
            shp.fill.background()
        else:
            shp.fill.solid(); shp.fill.fore_color.rgb = RGBColor(*fill)
        if line is None:
            shp.line.fill.background()
        else:
            shp.line.color.rgb = RGBColor(*line); shp.line.width = Pt(lw)
        self._no_shadow(shp)
        return shp

    def line(self, x1, y1, x2, y2, color=NAVY, w=1.0, dash=None):
        c = self.sh.add_connector(MSO_CONNECTOR.STRAIGHT,
                                  Inches(x1), Inches(y1), Inches(x2), Inches(y2))
        c.line.color.rgb = RGBColor(*color)
        c.line.width = Pt(w)
        ln = c.line._get_or_add_ln()
        if dash:
            d = etree.SubElement(ln, qn("a:prstDash")); d.set("val", "dash")
        self._no_shadow(c)
        return c

    def arrow_line(self, x1, y1, x2, y2, color=GOLD, w=1.6):
        """خط با پیکان در مقصد (x2,y2)."""
        c = self.line(x1, y1, x2, y2, color, w)
        ln = c.line._get_or_add_ln()
        tail = etree.SubElement(ln, qn("a:tailEnd"))
        tail.set("type", "triangle"); tail.set("w", "med"); tail.set("len", "med")
        return c

    def polygon(self, points, fill=TEAL, line=None):
        fb = self.sh.build_freeform(Emu(int(points[0][0] * EM)),
                                    Emu(int(points[0][1] * EM)), scale=1)
        fb.add_line_segments([(Emu(int(x * EM)), Emu(int(y * EM)))
                              for x, y in points[1:]], close=True)
        shp = fb.convert_to_shape()
        shp.fill.solid(); shp.fill.fore_color.rgb = RGBColor(*fill)
        if line is None:
            shp.line.fill.background()
        else:
            shp.line.color.rgb = RGBColor(*line)
        self._no_shadow(shp)
        return shp

    def arc_gauge(self, x, y, d, start_deg, end_deg, color=TEAL, lw=0.11):
        """کمان برای نشانگر دایره‌ای (زاویه‌ها مدرج، ساعت‌گرد از ساعت ۳)."""
        a0 = start_deg % 360
        a1 = end_deg % 360
        if a1 <= a0:
            a1 += 360
        shp = self._shape(MSO_SHAPE.BLOCK_ARC, x, y, d, d)
        shp.adjustments[0] = a0 * 60000
        shp.adjustments[1] = a1 * 60000
        shp.adjustments[2] = 22000
        shp.fill.solid(); shp.fill.fore_color.rgb = RGBColor(*color)
        shp.line.fill.background()
        self._no_shadow(shp)
        return shp

    def hbar(self, x, y, w, h, frac, track=(231, 235, 239), fill=TEAL):
        frac = max(0.0, min(1.0, frac))
        self.rect(x, y, w, h, fill=track, radius=h / 2, shadow=False)
        fw = w * frac
        if fw > 0.02:
            self.rect(x + w - fw, y, fw, h, fill=fill, radius=h / 2,
                      shadow=False)

    def chevron(self, x, y, w, h, fill, flip_h=False):
        shp = self._shape(MSO_SHAPE.CHEVRON, x, y, w, h, flip_h=flip_h)
        shp.fill.solid(); shp.fill.fore_color.rgb = RGBColor(*fill)
        shp.line.fill.background()
        self._no_shadow(shp)
        return shp

    def text(self, x, y, w, h, s, size=12, role="zar", color=INK,
             align="r", valign="t", ls=1.42, bold=False, spacing=0.0):
        eff_role = role
        total_h = text_height(s, size, eff_role, w, ls)
        tb = self.sh.add_textbox(Inches(x), Inches(y), Inches(w), Inches(h))
        tf = tb.text_frame
        tf.word_wrap = True
        for m in ("margin_left", "margin_right", "margin_top", "margin_bottom"):
            setattr(tf, m, 0)
        tf.auto_size = None
        tf.vertical_anchor = {"t": MSO_ANCHOR.TOP, "m": MSO_ANCHOR.MIDDLE,
                              "b": MSO_ANCHOR.BOTTOM}[valign]
        name = {"titr": F_TITR, "lotus": F_LOTUS, "zar": F_ZAR,
                "zar_r": F_ZAR}[role]
        if role == "zar":
            bold = bold
        al = {"r": PP_ALIGN.RIGHT, "c": PP_ALIGN.CENTER, "l": PP_ALIGN.LEFT}[align]
        for i, para in enumerate(str(s).split("\n")):
            p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
            p.alignment = al
            p.line_spacing = ls
            pPr = p._pPr if p._pPr is not None else p._p.get_or_add_pPr()
            pPr.set("rtl", "1")
            r = p.add_run(); r.text = para
            _set_run_font(r, name, size, color,
                          bold=(bold or role == "titr"))
            if spacing:
                r._r.get_or_add_rPr().set("spc", str(int(spacing * 100)))
        return total_h


# ----------------------------------------------------------- قاب مشترک اسلاید
TL = [
    "عنوان و معرفی", "کلیات پژوهش", "بیان مسئله", "اهمیت و ضرورت",
    "اهداف و فرضیه‌ها", "مبانی و پیشینه", "روش‌شناسی", "جامعه و نمونه",
    "ابزار گردآوری", "یافته‌ها", "تحلیل و بحث", "نتیجه‌گیری",
    "پیشنهادها", "محدودیت‌ها", "جمع‌بندی", "تشکر و پاسخ",
]
RAIL_X = 0.46
Y0, Y1 = 0.66, 6.92
CX0, CX1 = 1.72, 12.36   # محتوای افقی


def _rail_geom():
    step = (Y1 - Y0) / 15
    return [(RAIL_X, Y0 + i * step) for i in range(16)], step


def draw_timeline(s, active, dark=False, backend="qa", total=22, page=None):
    pts, step = _rail_geom()
    base = IVORY_T if dark else HAIR
    gold = GOLD_L if dark else GOLD
    mute = (150, 160, 172) if dark else MUTE
    # خط زمینه
    s.line(RAIL_X, Y0 - 0.06, RAIL_X, Y1 + 0.06, color=base, w=1.1)
    ay = pts[active - 1][1]
    if active > 1:
        s.line(RAIL_X, Y0 - 0.06, RAIL_X, ay, color=(gold if dark else TEAL), w=1.7)
    for i, (cx, cy) in enumerate(pts, start=1):
        if i == active:
            d = 0.21
            s.ellipse(cx - d / 2, cy - d / 2, d, d, fill=(NAVY if dark else CARD),
                      line=(GOLD_L if dark else TEAL), lw=2.0)
            s.ellipse(cx - 0.045, cy - 0.045, 0.09, 0.09, fill=gold)
            col = GOLD_L if dark else TEAL_D
            s.text(0.66, cy - 0.115, 1.05, 0.23, TL[i - 1], size=8.6,
                   role="lotus", color=col, valign="m")
        else:
            done = i < active
            d = 0.105
            s.ellipse(cx - d / 2, cy - d / 2, d, d,
                      fill=(gold if done else ((34, 52, 74) if dark else CARD)),
                      line=(GOLD if done else (mute if dark else HAIR)), lw=0.9)
            s.text(0.66, cy - 0.10, 1.02, 0.20, TL[i - 1], size=7.7,
                   role="zar_r", color=(IVORY_T if dark else (TEAL_D if done else MUTE)),
                   valign="m")


def draw_header(s, section_num, section_name, title, page):
    # نوار بالا-راست
    s.rect(CX1 - 0.02, 0.36, 0.09, 0.09, fill=GOLD, radius=0.02, shadow=False)
    s.text(CX0, 0.28, CX1 - CX0 - 0.22, 0.24,
           f"بخش {fa(section_num)}  ·  {section_name}", size=10.5, role="lotus",
           color=TEAL_D, align="r")
    s.text(CX0, 0.55, CX1 - CX0 - 0.2, 0.52, title, size=24, role="titr",
           color=NAVY, align="r", ls=1.05)
    # خطوط ظریف زیر عنوان
    s.line(CX1, 1.16, CX1 - 0.62, 1.16, color=GOLD, w=2.0)
    s.line(CX1 - 0.70, 1.16, CX0, 1.16, color=HAIR, w=1.0)


def draw_footer(s, page, total=22, dark=False):
    col = (170, 178, 188) if dark else MUTE
    s.text(2.1, 7.12, 7.6, 0.22,
           "دانشگاه پیام نور واحد جویبار  ·  دانشکدهٔ مدیریت، اقتصاد و حسابداری  ·  دفاع از پایان‌نامهٔ کارشناسی ارشد",
           size=7.4, role="zar_r", color=col, align="c", valign="m")
    s.text(11.45, 7.10, 0.91, 0.24, f"{fa(page)} / {fa(total)}", size=8.5,
           role="lotus", color=(GOLD_L if dark else NAVY), align="r", valign="m")


def chrome(s, active, section_num, section_name, title, page, dark=False):
    if not dark:
        s.bg(IVORY)
    draw_timeline(s, active, dark=dark, page=page)
    if not dark and title is not None:
        draw_header(s, section_num, section_name, title, page)
    draw_footer(s, page, dark=dark)


# ----------------------------------------------------------- المان‌های ترکیبی
def card(s, x, y, w, h, fill=CARD, line=HAIR2, radius=0.12, shadow=True, lw=1.0,
         dash=None):
    return s.rect(x, y, w, h, fill=fill, line=line, lw=lw, radius=radius,
                  shadow=shadow, dash=dash)


def tag(s, x, y, w, text, fill=NAVY, tx=WHITE, size=9.5, h=0.30):
    s.rect(x, y, w, h, fill=fill, radius=h / 2, shadow=False)
    s.text(x, y, w, h, text, size=size, role="lotus", color=tx,
           align="c", valign="m", ls=1.1)


def placeholder_card(s, x, y, w, h, text, size=10.5):
    s.rect(x, y, w, h, fill=PH_BG, line=GOLD, lw=1.1, radius=0.10,
           shadow=False, dash=True)
    s.text(x + 0.14, y, w - 0.28, h, text, size=size, role="zar",
           color=PH_TX, align="c", valign="m", ls=1.4)


def kpi(s, x, y, w, h, number, label, sub=None, fill=CARD, num_color=NAVY,
        num_size=30):
    card(s, x, y, w, h, fill=fill)
    s.rect(x + w / 2 - 0.16, y + 0.15, 0.32, 0.045, fill=GOLD, radius=0.02,
           shadow=False)
    s.text(x + 0.1, y + 0.24, w - 0.2, 0.54, number, size=num_size, role="titr",
           color=num_color, align="c", valign="m", ls=1.0)
    s.text(x + 0.12, y + h - 0.60, w - 0.24, 0.28, label, size=10.5,
           role="lotus", color=INK, align="c", valign="m")
    if sub:
        s.text(x + 0.12, y + h - 0.30, w - 0.24, 0.24, sub, size=8.4,
               role="zar_r", color=MUTE, align="c", valign="m")


def bullet(s, x, y, w, text, size=12, color=INK, dot=TEAL, ls=1.45,
           dot_shape="square"):
    if dot_shape == "square":
        s.rect(x + w - 0.135, y + 0.075, 0.09, 0.09, fill=dot, radius=0.02,
               shadow=False)
    else:
        s.ellipse(x + w - 0.125, y + 0.07, 0.07, 0.07, fill=dot)
    return s.text(x, y, w - 0.24, 0.9, text, size=size, role="zar", color=color,
                  ls=ls) + 0.06


def numbered_chip(s, x, y, d, n, fill=NAVY, tx=WHITE):
    s.ellipse(x, y, d, d, fill=fill)
    s.text(x, y - 0.005, d, d, fa(n), size=12, role="titr", color=tx,
           align="c", valign="m", ls=1.0)
