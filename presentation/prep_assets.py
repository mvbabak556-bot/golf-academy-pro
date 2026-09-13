# -*- coding: utf-8 -*-
"""آماده‌سازی تصاویر: برش cover، گوشه‌های نرم، پس‌زمینهٔ عنوان و تشکر."""
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
import os

BASE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(BASE, "assets")
OUT = os.path.join(BASE, "assets", "proc")
os.makedirs(OUT, exist_ok=True)
DPI = 192


def cover(im, w, h, fx=0.5, fy=0.5):
    im = im.convert("RGB")
    sw, sh = im.size
    s = max(w / sw, h / sh)
    nw, nh = int(round(sw * s)), int(round(sh * s))
    im = im.resize((nw, nh), Image.LANCZOS)
    l = int((nw - w) * fx); t = int((nh - h) * fy)
    return im.crop((l, t, l + w, t + h))


def rounded(im, r):
    w, h = im.size
    m = Image.new("L", (w, h), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), radius=r, fill=255)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out.paste(im.convert("RGBA"), (0, 0), m)
    return out


def card(name, src, wi, hi, r=34, **kw):
    im = Image.open(os.path.join(SRC, src))
    im = rounded(cover(im, round(wi * DPI), round(hi * DPI), **kw), r)
    im.save(os.path.join(OUT, name))
    print("card", name, im.size)


card("c_intro.png", "img_02_intro.png", 4.15, 3.05)
card("c_merch.png", "img_12_merch.png", 4.15, 3.05, fx=0.42)
card("c_choice.png", "img_13_crossroads.png", 3.45, 5.05, fy=0.42)
card("c_theory.png", "img_04_theory.png", 4.30, 2.90)
card("c_model.png", "img_14_model.png", 4.90, 3.30)
card("c_method.png", "img_05_method.png", 4.10, 2.60, fx=0.62)
card("c_findings.png", "img_06_findings.png", 4.05, 2.90)
card("c_close.png", "img_07_conclusion.png", 2.95, 4.35, fy=0.40)
card("c_factory.png", "img_15_factory.png", 4.45, 2.95, fx=0.42)


def smooth(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)


def background(name, src, side, base, W=2560, H=1440):
    """side='right' سمت راست برای متن تیره شود؛ 'center' مرکز تیره شود."""
    im = cover(Image.open(os.path.join(SRC, src)), W, H, fx=0.45, fy=0.5).convert("RGB")
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    fx, fy = xx / W, yy / H
    if side == "right":
        g = base + (1.0 - base) * smooth((fx - 0.24) / 0.46)
        g = np.minimum(g, base + (1.0 - base) * smooth((0.30 - fy) / 0.30) * 0.55 + base * 0.45)
        gb = 0.25 * smooth((fy - 0.68) / 0.32)
        a = np.clip(255 * np.maximum(g, gb), 0, 242)
    else:
        gx = 0.55 + 0.45 * np.abs(fx - 0.5) / 0.5
        gy = 0.45 + 0.55 * smooth((fy - 0.62) / 0.38)
        a = np.clip(255 * np.maximum(base * 1.35 * np.maximum(gx, gy), base), 0, 235)
    m = Image.fromarray(a.astype(np.uint8), "L").filter(ImageFilter.GaussianBlur(8))
    ov = Image.new("RGBA", (W, H), (11, 26, 45, 255))
    Image.composite(ov, im.convert("RGBA"), m).convert("RGB").save(os.path.join(OUT, name), quality=91)
    print("bg", name)


background("bg_title.png", "img_11_hero_store.png", "right", 0.30)
background("bg_thanks.png", "img_11_hero_store.png", "center", 0.62)
print("DONE")
