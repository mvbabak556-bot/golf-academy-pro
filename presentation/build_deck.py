# -*- coding: utf-8 -*-
"""ساخت اسلایدهای دفاع کارشناسی ارشد — تأثیر بازارپردازی بر ارتقای فروش دوو (اهواز).
داده‌ها دقیقاً از متن پایان‌نامه (فصول ۱ تا ۵) استخراج شده‌اند؛ هیچ عددی ساخته نشده است.
"""
import os
from deck_lib import *

CW = CX1 - CX0
C3 = (CW - 2 * 0.20) / 3
C4 = (CW - 3 * 0.16) / 4
C2 = (CW - 0.18) / 2
X3 = [CX1 - C3 * (i + 1) - 0.20 * i for i in range(3)]
X4 = [CX1 - C4 * (i + 1) - 0.16 * i for i in range(4)]
X2 = [CX1 - C2 * (i + 1) - 0.18 * i for i in range(2)]
P = lambda n: os.path.join(PROC, n)
TOTAL = 25


def kick(s, num, name):
    s.rect(CX1 - 0.02, 0.36, 0.09, 0.09, fill=GOLD, radius=0.02, shadow=False)
    s.text(CX0, 0.28, CW - 0.22, 0.24, f"بخش {fa(num)}  ·  {name}",
           size=10.5, role="lotus", color=TEAL_D, align="r")


def head(s, num, name, title):
    kick(s, num, name)
    s.text(CX0, 0.55, CW - 0.2, 0.52, title, size=24, role="titr",
           color=NAVY, align="r", ls=1.05)
    s.line(CX1, 1.16, CX1 - 0.62, 1.16, color=GOLD, w=2.0)
    s.line(CX1 - 0.70, 1.16, CX0, 1.16, color=HAIR, w=1.0)


def frame(s, active, sec, name, title, page, dark=False):
    if not dark:
        s.bg(IVORY)
    draw_timeline(s, active, dark=dark)
    if not dark and title is not None:
        head(s, sec, name, title)
    draw_footer(s, page, total=TOTAL, dark=dark)


def chip_tag(s, x, y, w, text, fill=NAVY, tx=WHITE, size=9.5, h=0.30):
    s.rect(x, y, w, h, fill=fill, radius=h / 2, shadow=False)
    s.text(x, y, w, h, text, size=size, role="lotus", color=tx,
           align="c", valign="m", ls=1.1)


def card_r(s, x, y, w, h, fill=CARD, line=HAIR2, radius=0.12, shadow=True):
    return s.rect(x, y, w, h, fill=fill, line=line, lw=1.0, radius=radius,
                  shadow=shadow)


def blt(s, x, y, w, text, size=11.4, color=INK, dot=TEAL, ls=1.42):
    s.rect(x + w - 0.135, y + 0.075, 0.09, 0.09, fill=dot, radius=0.02,
           shadow=False)
    return s.text(x, y, w - 0.24, 0.9, text, size=size, role="zar",
                  color=color, ls=ls) + 0.05


# ============================================================ ۱) صفحه عنوان
def s01(s):
    s.bg_image(P("bg_title.png"))
    draw_timeline(s, 1, dark=True)
    draw_footer(s, 1, total=TOTAL, dark=True)
    s.image(P("logo_pnu_light.png"), 11.42, 0.40, 0.72, 0.72)
    s.text(6.35, 0.52, 4.9, 0.34, "دانشگاه پیام نور — مرکز جویبار", size=15,
           role="lotus", color=GOLD_L, align="r")
    s.text(6.35, 0.92, 4.9, 0.28, "بخش مدیریت، اقتصاد و حسابداری",
           size=11, role="zar", color=IVORY_T, align="r")
    s.line(9.92, 2.06, 9.48, 2.06, color=GOLD, w=1.8)
    s.text(10.02, 1.90, 2.11, 0.3, "پایان‌نامهٔ کارشناسی ارشد", size=11.5,
           role="lotus", color=TEAL_T, align="r", spacing=0.6)
    s.text(6.35, 2.32, 5.78, 1.5,
           "بررسی تأثیر عملکرد بازارپردازی بر ارتقای فروش",
           size=28, role="titr", color=WHITE, align="r", ls=1.28)
    s.text(6.35, 3.72, 5.78, 0.5,
           "موردمطالعه: فروشگاه‌های لوازم خانگی دوو در شهر اهواز",
           size=13.5, role="lotus", color=GOLD_L, align="r", ls=1.4)
    s.line(12.13, 4.36, 9.05, 4.36, color=(116, 130, 146), w=1.0)
    rows = [
        ("دانشجو", "بابک مرادوند", False),
        ("استاد راهنما", "دکتر رمضان غلامی اواتی", False),
        ("مقطع و رشته", "کارشناسی ارشد مدیریت بازرگانی (بازاریابی)", False),
        ("تاریخ دفاع", "تیر ۱۴۰۵", False),
    ]
    y = 4.62
    for label, value, ph in rows:
        s.text(10.55, y, 1.58, 0.32, label + " :", size=10.5, role="zar",
               color=(178, 186, 196), align="r", valign="m")
        s.text(6.35, y, 4.05, 0.32, value, size=12, role="lotus",
               color=WHITE, align="r", valign="m")
        y += 0.37


# ============================================================ ۲) نقشه مسیر
def s02(s):
    frame(s, 1, 1, "عنوان و معرفی پژوهش", "نقشهٔ مسیر ارائه", 2)
    xs, cw = X4, C4
    ys = [1.60, 2.96, 4.32, 5.68]
    for i in range(16):
        r, c = divmod(i, 4)
        x, y, w, h = xs[c], ys[r], cw, 1.20
        active = (i == 0)
        if active:
            card_r(s, x, y, w, h, fill=NAVY, line=NAVY)
            s.line(x + w - 0.9, y + 0.22, x + 0.3, y + 0.22, color=GOLD, w=1.4)
            ncol, lcol = GOLD_L, WHITE
        else:
            card_r(s, x, y, w, h, fill=CARD, line=HAIR2)
            ncol, lcol = TEAL_D, NAVY
        s.text(x + 0.1, y + 0.16, w - 0.2, 0.34, fa(i + 1), size=15,
               role="titr", color=ncol, align="r", ls=1.0)
        s.text(x + 0.14, y + 0.60, w - 0.28, 0.5, TL[i], size=10.2,
               role="lotus", color=lcol, align="c", valign="m", ls=1.25)


# ============================================================ ۳) مقدمه
def s03(s):
    frame(s, 2, 2, "کلیات پژوهش", "مقدمه", 3)
    s.image(P("c_merch.png"), 1.85, 1.62, 4.15, 3.05)
    s.rect(1.85, 4.74, 4.15, 1.06, fill=NAVY, radius=0.12, shadow=True)
    s.text(2.05, 4.86, 3.75, 0.3, "بازارپردازی (مرچندایزینگ)", size=11,
           role="lotus", color=GOLD_L, align="r")
    s.text(2.05, 5.18, 3.75, 0.54,
           "مجموعه فعالیت‌های برنامه‌ریزی‌شده برای عرضه، نمایش و چیدمان "
           "مؤثر محصول در محل فروش، با هدف جلب توجه و افزایش فروش.",
           size=9.6, role="zar", color=IVORY_T, align="r", ls=1.4)
    bullets = [
        "تبلیغات هدفمند و متناسب با شرایط روز، از عوامل مؤثر بر قصد خرید و "
        "تغییر تصمیم مصرف‌کننده است.",
        "بازارپردازی، زبان ارتباطی برند و مشتری در نقطهٔ فروش است و "
        "«فروشندهٔ خاموش» فروشگاه به‌شمار می‌رود.",
        "با پیچیده‌تر شدن خرید و تغییر انتظار مشتریان، بهره‌گیری از راهکارهای "
        "نوین و اثربخش فروشگاهی ضرورت یافته است.",
        "این پژوهش رابطهٔ سه بُعد بازارپردازی را با میزان فروش فروشگاه‌های "
        "لوازم خانگی دوو در اهواز می‌سنجد.",
    ]
    y = 1.70
    for b in bullets:
        h = blt(s, 6.50, y, 5.86, b, size=11.6)
        y += max(0.72, h) + 0.12
    items = [("۳ بُعد مستقل", "اقلام تبلیغاتی · سازماندهی · چیدمان"),
             ("۱ متغیر وابسته", "ارتقای فروش محصولات دوو"),
             ("بستر مطالعه", "فروشگاه‌های لوازم خانگی دوو ـ اهواز")]
    kw = (CW - 2 * 0.16) / 3
    for i, (t1, t2) in enumerate(items):
        x = CX1 - kw * (i + 1) - 0.16 * i
        card_r(s, x, 6.02, kw, 0.80, fill=SOFT, line=HAIR2, shadow=False)
        s.text(x + 0.12, 6.10, kw - 0.24, 0.28, t1, size=10.5, role="lotus",
               color=TEAL_D, align="c")
        s.text(x + 0.12, 6.42, kw - 0.24, 0.32, t2, size=9.0, role="zar",
               color=MUTE, align="c")


# ============================================================ ۴) بیان مسئله
def s04(s):
    frame(s, 3, 3, "بیان مسئله", "مسئلهٔ اصلی پژوهش", 4)
    s.image(P("c_choice.png"), 1.85, 1.58, 3.45, 5.05)
    top = [
        "هزینه‌های بازارپردازی اغلب «کم‌اثر» تلقی می‌شود، چون بازخورد آن "
        "برخلاف فروش مستقیم، آنی و ملموس نیست.",
        "در نبود شناخت دقیق از مشتری و اصول علمی نمایش، چیدمان بیشتر بر "
        "سلیقهٔ شخصی انجام می‌شود تا استاندارد برند.",
    ]
    y = 1.62
    for t in top:
        h = blt(s, 5.70, y, 6.66, t, size=11.8)
        y += max(0.78, h) + 0.12
    ivs = [
        ("۱", "استقرار هدفمند اقلام تبلیغاتی در محیط فروشگاه"),
        ("۲", "سازماندهی و اثربخشی فعالیت‌های بازارپردازی"),
        ("۳", "نحوهٔ چیدمان و جانمایی بهینهٔ محصولات"),
    ]
    y = 3.20
    for n, t in ivs:
        card_r(s, 5.70, y, 6.66, 0.70)
        s.ellipse(11.80, y + 0.14, 0.42, 0.42, fill=NAVY)
        s.text(11.80, y + 0.12, 0.42, 0.42, n, size=12.5, role="titr",
               color=GOLD_L, align="c", valign="m", ls=1.0)
        s.text(6.0, y, 5.62, 0.70, t, size=11.6, role="zar", color=INK,
               align="r", valign="m", ls=1.3)
        y += 0.82
    s.rect(5.70, 5.82, 6.66, 0.86, fill=NAVY, radius=0.12, shadow=True)
    s.rect(12.26, 5.82, 0.10, 0.86, fill=GOLD, radius=0.04, shadow=False)
    s.text(5.95, 5.82, 6.10, 0.86,
           "پرسش محوری: آیا اجرای این سه بُعد با میزان فروش محصولات دوو "
           "رابطهٔ مثبت و معنادار دارد؟", size=12, role="lotus", color=WHITE,
           align="c", valign="m", ls=1.35)


# ============================================================ ۵) اهمیت و ضرورت
def s05(s):
    frame(s, 4, 4, "اهمیت و ضرورت پژوهش", "چرا این پژوهش؟", 5)
    cards = [
        (X2[0], C2, "ضرورت اجرایی برای صنعت و برند", [
            "تثبیت جایگاه برند و شکل‌گیری ذهنیت مثبت و ماندگار",
            "معرفی مطلوب محصولات جدید و مزیت‌های رقابتی",
            "بهبود تجربه و تصمیم خرید مشتری در نقطهٔ فروش",
            "افزایش سرعت گردش کالا و استفادهٔ بهینه از فضای فروشگاه",
            "چارچوب کاربردی برای تولیدکنندگان و فعالان لوازم خانگی",
        ], NAVY, GOLD_L),
        (X2[1], C2, "ضرورت علمی و تصمیم‌سازی", [
            "سنجش هم‌زمان هر سه بُعد بازارپردازی و رابطهٔ آن‌ها با فروش",
            "شواهد تجربی برای فروشگاه‌های دوو در بازار اهواز",
            "مبنای داده برای مدیران فروش و بازاریابی",
            "پاسخ به این خلأ که مطالعات محدود همهٔ ابعاد را یکجا سنجیده‌اند",
            "پایه‌ای برای پژوهش‌های تکمیلی در صنعت لوازم خانگی",
        ], TEAL, WHITE),
    ]
    for x, w, title, items, headc, hc in cards:
        card_r(s, x, 1.58, w, 4.06)
        s.rect(x, 1.58, w, 0.56, fill=headc, radius=0.12, shadow=False)
        s.rect(x, 1.90, w, 0.24, fill=headc, shadow=False)
        s.text(x + 0.2, 1.58, w - 0.4, 0.56, title, size=12.3, role="lotus",
               color=hc, align="c", valign="m")
        y = 2.32
        for it in items:
            s.rect(x + w - 0.30, y + 0.075, 0.085, 0.085, fill=GOLD,
                   radius=0.02, shadow=False)
            hh = s.text(x + 0.28, y, w - 0.62, 0.6, it, size=10.8,
                        role="zar", color=INK, ls=1.32)
            y += max(0.50, hh) + 0.10
    info = [("گروه کالایی", "لوازم خانگی"),
            ("موردمطالعه", "فروشگاه‌های دوو ـ اهواز"),
            ("قلمرو زمانی", "سال ۱۴۰۴ و ۱۴۰۵")]
    kw = (CW - 2 * 0.16) / 3
    for i, (a, b) in enumerate(info):
        x = CX1 - kw * (i + 1) - 0.16 * i
        card_r(s, x, 5.92, kw, 0.88, fill=SOFT, line=HAIR2, shadow=False)
        s.text(x + 0.1, 6.05, kw - 0.2, 0.28, a, size=9.8, role="zar_r",
               color=MUTE, align="c")
        s.text(x + 0.1, 6.34, kw - 0.2, 0.34, b, size=11.2, role="titr",
               color=NAVY, align="c")


# ============================================================ ۶) اهداف
def s06(s):
    frame(s, 5, 5, "اهداف و فرضیه‌ها (۱)", "اهداف پژوهش", 6)
    s.rect(CX0, 1.58, CW, 1.36, fill=NAVY, radius=0.14, shadow=True)
    chip_tag(s, CX1 - 1.55, 1.78, 1.35, "هدف اصلی", fill=GOLD, tx=NAVY, h=0.34)
    s.text(CX0 + 0.4, 2.18, CW - 0.8, 0.62,
           "بررسی تأثیر عملکرد بازارپردازی در ارتقای فروش فروشگاه‌های دوو "
           "شهر اهواز.", size=15, role="lotus", color=WHITE, align="c",
           valign="m", ls=1.4)
    subs = [
        (1, "تعیین رابطهٔ بین استقرار هدفمند اقلام تبلیغاتی در محیط و "
            "میزان فروش محصولات شرکت دوو."),
        (2, "تعیین رابطهٔ بین سازماندهی و اثربخشی فعالیت‌های بازارپردازی "
            "و میزان فروش محصولات شرکت دوو."),
        (3, "تعیین رابطهٔ بین نحوهٔ چیدمان و جانمایی بهینهٔ محصولات و "
            "میزان فروش محصولات شرکت دوو."),
    ]
    y = 3.34
    for n, t in subs:
        x = X3[n - 1]
        card_r(s, x, y, C3, 2.78)
        s.ellipse(x + C3 / 2 - 0.30, 3.58, 0.60, 0.60, fill=TEAL)
        s.text(x + C3 / 2 - 0.30, 3.56, 0.60, 0.60, fa(n), size=17,
               role="titr", color=WHITE, align="c", valign="m", ls=1.0)
        s.text(x + 0.14, 4.32, C3 - 0.28, 0.3, f"هدف فرعی {fa(n)}",
               size=10.5, role="lotus", color=GOLD, align="c")
        s.text(x + 0.24, 4.66, C3 - 0.48, 1.34, t, size=11.2, role="zar",
               color=INK, align="c", valign="t", ls=1.5)
    s.text(CX0, 6.44, CW, 0.3,
           "هر هدف فرعی، متناظر با یکی از سه بُعد بازارپردازی است.",
           size=10, role="zar_r", color=MUTE, align="c")


# ============================================================ ۷) فرضیه‌ها
def s07(s):
    frame(s, 5, 5, "اهداف و فرضیه‌ها (۲)", "فرضیه‌های پژوهش", 7)
    s.rect(CX0, 1.56, CW, 1.22, fill=NAVY, radius=0.14, shadow=True)
    chip_tag(s, CX1 - 1.68, 1.74, 1.48, "فرضیهٔ اصلی", fill=GOLD, tx=NAVY,
             h=0.34)
    s.text(CX0 + 0.4, 2.12, CW - 0.8, 0.54,
           "بین عملکرد کلی بازارپردازی و میزان فروش محصولات شرکت دوو "
           "رابطهٔ مثبت و معنادار وجود دارد.", size=14, role="lotus",
           color=WHITE, align="c", valign="m", ls=1.4)
    subs = [
        (1, "بین استقرار هدفمند اقلام تبلیغاتی در محیط و میزان فروش "
            "محصولات شرکت دوو رابطهٔ مثبت و معنادار وجود دارد."),
        (2, "بین سازماندهی و اثربخشی فعالیت‌های بازارپردازی و میزان فروش "
            "محصولات شرکت دوو رابطهٔ مثبت و معنادار وجود دارد."),
        (3, "بین نحوهٔ چیدمان و جانمایی بهینهٔ محصولات و میزان فروش "
            "محصولات شرکت دوو رابطهٔ مثبت و معنادار وجود دارد."),
    ]
    y = 3.12
    for n, t in subs:
        x = X3[n - 1]
        card_r(s, x, y, C3, 2.30)
        s.text(x + 0.22, y + 0.18, 0.9, 0.34, f"ف{fa(n)}", size=13,
               role="titr", color=TEAL_D, align="l")
        s.text(x + 0.2, y + 0.58, C3 - 0.4, 1.22, t, size=11, role="zar",
               color=INK, align="c", valign="t", ls=1.45)
        chip_tag(s, x + C3 / 2 - 0.98, y + 1.82, 1.96,
                 "رابطهٔ مثبت و معنادار", fill=(232, 242, 242), tx=TEAL_D,
                 size=8.8, h=0.32)
    s.rect(CX0 + 3.0, 5.78, CW - 6.0, 0.62, fill=SOFT, line=HAIR2,
           radius=0.31, shadow=False)
    s.text(CX0 + 3.0, 5.78, CW - 6.0, 0.62,
           "آزمون آماری فرضیه‌ها: ضریب همبستگی رتبه‌ای اسپیرمن (SPSS)",
           size=10.5, role="lotus", color=NAVY, align="c", valign="m")


# ============================================================ ۸) مدل مفهومی
def s08(s):
    frame(s, 6, 6, "مبانی نظری و پیشینه (۱)", "مدل مفهومی پژوهش", 8)
    s.rect(CX0, 1.95, 3.05, 4.0, fill=NAVY, radius=0.14, shadow=True)
    s.text(1.92, 2.28, 2.65, 0.3, "متغیر وابسته", size=11, role="lotus",
           color=GOLD_L, align="c")
    s.line(2.62, 2.70, 3.92, 2.70, color=(80, 100, 122), w=0.8)
    s.text(1.92, 3.10, 2.65, 1.1, "ارتقای فروش", size=22, role="titr",
           color=WHITE, align="c", valign="m", ls=1.2)
    s.text(1.92, 4.40, 2.65, 0.7, "محصولات شرکت دوو\n(فروشگاه‌های اهواز)",
           size=11, role="zar", color=IVORY_T, align="c", ls=1.5)
    s.text(8.0, 1.56, 4.36, 0.3, "متغیرهای مستقل — ابعاد بازارپردازی",
           size=11.5, role="lotus", color=TEAL_D, align="r")
    ivs = [
        (1, "استقرار هدفمند اقلام تبلیغاتی", "۵ گویه (پرسش ۶ تا ۱۰)"),
        (2, "سازماندهی و اثربخشی فعالیت‌ها", "۵ گویه (پرسش ۱ تا ۵)"),
        (3, "نحوهٔ چیدمان و جانمایی محصولات", "۵ گویه (پرسش ۱۱ تا ۱۵)"),
    ]
    ys = [1.92, 3.30, 4.68]
    for n, t, sub in ivs:
        y = ys[n - 1]
        card_r(s, 8.0, y, 4.36, 1.22)
        s.ellipse(11.86, y + 0.40, 0.42, 0.42, fill=TEAL)
        s.text(11.86, y + 0.38, 0.42, 0.42, fa(n), size=12, role="titr",
               color=WHITE, align="c", valign="m", ls=1.0)
        s.text(8.2, y + 0.16, 3.5, 0.4, t, size=11.2, role="lotus",
               color=NAVY, align="r", valign="m")
        s.text(8.2, y + 0.62, 3.5, 0.34, sub, size=9, role="zar_r",
               color=MUTE, align="r", valign="m")
        s.arrow_line(7.95, y + 0.61, 4.92, y + 0.61, color=GOLD, w=1.7)
    s.text(CX0, 6.28, CW, 0.3,
           "متغیر وابسته (ارتقای فروش) با ۴ گویه (پرسش ۱۶ تا ۱۹) سنجیده شد.",
           size=9.6, role="zar_r", color=MUTE, align="c")


# ============================================================ ۹) مفاهیم کلیدی (جدید)
def s09(s):
    frame(s, 6, 6, "مبانی نظری و پیشینه (۲)", "مفاهیم کلیدی پژوهش", 9)
    defs = [
        ("بازارپردازی", "مجموعه فعالیت‌های برنامه‌ریزی‌شده برای عرضه، نمایش، "
         "چیدمان و ارائهٔ مؤثر محصول در محیط فروشگاه برای جلب توجه و تسهیل خرید.",
         NAVY, GOLD_L),
        ("ارتقای فروش", "اقداماتی برای افزایش میزان فروش، تحریک تقاضا و "
         "ترغیب مشتری به خرید؛ در کوتاه‌مدت فروش و در بلندمدت وفاداری.", TEAL, WHITE),
        ("اقلام تبلیغاتی (POSM)", "جانمایی اصولی استند، پوستر، دنگلر، "
         "تابلو و برچسب برای جلب توجه در لحظهٔ تصمیم خرید.", NAVY, GOLD_L),
        ("سازماندهی فعالیت‌ها", "برنامه‌ریزی، هماهنگی، اجرا و پایش مستمر "
         "نمایش کالا، موجودی و گزارش وضعیت فروش در فروشگاه.", TEAL, WHITE),
        ("چیدمان و جانمایی", "استقرار اصولی کالا بر اساس رفتار مشتری برای "
         "افزایش مشاهده‌پذیری، دسترسی آسان و احتمال انتخاب.", NAVY, GOLD_L),
        ("نقاط داغ فروشگاه", "بخش‌های پرتردد و در دیدِ مشتری؛ مناسب‌ترین جا "
         "برای محصولات راهبردی و خریدهای لحظه‌ای.", TEAL, WHITE),
    ]
    cw = (CW - 2 * 0.18) / 3
    ch = 1.78
    for i, (t1, t2, hc, tc) in enumerate(defs):
        r, c = divmod(i, 3)
        x = CX1 - cw * (c + 1) - 0.18 * c
        y = 1.55 + r * (ch + 0.16)
        card_r(s, x, y, cw, ch)
        s.rect(x, y, 0.10, ch, fill=hc, radius=0.05, shadow=False)
        s.text(x + 0.26, y + 0.14, cw - 0.42, 0.32, t1, size=11.8,
               role="lotus", color=hc if hc == TEAL else NAVY, align="r")
        s.line(x + cw - 0.34, y + 0.52, x + 0.34, y + 0.52, color=HAIR2, w=0.8)
        s.text(x + 0.26, y + 0.58, cw - 0.46, 1.1, t2, size=9.8,
               role="zar", color=INK, align="r", ls=1.42, valign="t")
    s.rect(CX0, 5.62, CW, 1.10, fill=SOFT, line=HAIR2, radius=0.12,
           shadow=False)
    s.text(CX0 + 0.3, 5.76, CW - 0.6, 0.3, "پنج اصل بازارپردازی بصری",
           size=10.5, role="lotus", color=TEAL_D, align="r")
    five = "رنگ و هماهنگی  ·  نقطهٔ کانونی  ·  روایت‌پردازی محصول  ·  نمایش حداکثری کالا  ·  استفاده از فضاهای بلااستفاده"
    s.text(CX0 + 0.3, 6.12, CW - 0.6, 0.5, five, size=10.6, role="zar",
           color=INK, align="c", valign="m", ls=1.4)


# ============================================================ ۱۰) پیشینهٔ پژوهش
def s10(s):
    frame(s, 6, 6, "مبانی نظری و پیشینه (۳)", "پیشینه و شکاف پژوهشی", 10)
    cols = [("پژوهشگر (سال)", 2.15), ("حوزه / صنعت", 2.0),
            ("یافتهٔ کلیدی", 4.4), ("هم‌خوانی", 2.09)]
    ty = 1.50
    x = CX1
    for name, w in cols:
        x -= w
        s.rect(x, ty, w, 0.42, fill=NAVY, radius=0.001, shadow=False)
        s.text(x + 0.05, ty, w - 0.1, 0.42, name, size=9.6, role="lotus",
               color=WHITE, align="c", valign="m")
    rows = [
        ("مهراب‌پور (۱۳۹۸)", "بانکداری / خدمات",
         "مرچندایزینگ و رضایت مشتری، وفاداری مشتری را افزایش می‌دهد.",
         "نقش بازارپردازی در پیامد فروش"),
        ("منصوری‌موید و همکاران (۱۳۹۳)", "خرده‌فروشی",
         "محرک‌های اجتماعی و محیطی فروشگاه بر رفتار خرید در نقطهٔ خرید اثر دارد.",
         "اثر محیط فروشگاه بر تصمیم خرید"),
        ("سالار و ابوالفضلی (۱۳۹۲)", "فروشگاه‌های زنجیره‌ای",
         "محیط و بازاریابی درون‌فروشگاهی بر خرید ناگهانی و رضایت اثرگذار است.",
         "اثر محیط بر رفتار خرید"),
        ("کرفوت و همکاران (۲۰۱۴)", "خرده‌فروشی پوشاک",
         "بازارپردازی بصری به ساخت برند و شکل‌گیری رفتار خرید کمک می‌کند.",
         "بُعد چیدمان و نمایش بصری"),
        ("کیم شاین فام و همکاران (۲۰۱۱)", "خرده‌فروشی",
         "تبلیغات و قیمت‌گذاری درون فروشگاه، کلید موفقیت خرده‌فروشی است.",
         "بُعد اقلام تبلیغاتی"),
        ("لاوو و همکاران (۲۰۰۶)", "بازارپردازی بصری",
         "بازارپردازی بصری واکنش عاطفی مثبت و درگیری مشتری را برمی‌انگیزد.",
         "سازوکار روانی اثرگذاری"),
    ]
    rh = 0.55
    for r, row in enumerate(rows):
        y = ty + 0.42 + r * rh
        x = CX1
        widths = [w for _, w in cols]
        for ci, (name, w) in enumerate(cols):
            x -= w
            s.rect(x, y, w, rh, fill=CARD if r % 2 == 0 else SOFT,
                   line=HAIR2, lw=0.75, radius=0.001, shadow=False)
        x = CX1
        for ci, (val) in enumerate(row):
            w = widths[ci]; x -= w
            if ci == 0:
                s.text(x + 0.08, y, w - 0.16, rh, val, size=8.7,
                       role="lotus", color=TEAL_D, align="c", valign="m", ls=1.15)
            elif ci == 3:
                s.text(x + 0.08, y, w - 0.16, rh, val, size=8.4,
                       role="zar_r", color=MUTE, align="c", valign="m", ls=1.2)
            else:
                s.text(x + 0.10, y, w - 0.2, rh, val, size=8.8, role="zar",
                       color=INK, align="r", valign="m", ls=1.25)
    card_r(s, CX0, 5.30, CW, 1.46, fill=(251, 245, 232), line=GOLD)
    chip_tag(s, CX1 - 1.62, 5.48, 1.42, "شکاف پژوهشی", fill=TEAL, tx=WHITE,
             h=0.32, size=9.5)
    s.text(CX0 + 0.35, 5.88, CW - 0.7, 0.8,
           "پژوهش‌های پیشین بیشتر بر یک بُعد (محیط یا تجربهٔ مشتری) متمرکز "
           "بوده‌اند؛ این مطالعه هر سه بُعد بازارپردازی را به‌صورت هم‌زمان و "
           "کمّی در فروشگاه‌های لوازم خانگی دوو اهواز و در رابطه با فروش می‌سنجد.",
           size=10.6, role="zar", color=(90, 70, 32), align="r", ls=1.5,
           valign="m")


# ============================================================ ۱۱) بستر پژوهش (جدید)
def s11(s):
    frame(s, 6, 6, "مبانی نظری و پیشینه (۴)", "بستر پژوهش: برند دوو در ایران", 11)
    s.image(P("c_factory.png"), 1.85, 1.62, 4.45, 2.95)
    s.rect(1.85, 4.66, 4.45, 2.08, fill=NAVY, radius=0.12, shadow=True)
    s.text(2.08, 4.82, 4.0, 0.3, "دوو در ایران", size=11.5, role="lotus",
           color=GOLD_L, align="r")
    s.text(2.08, 5.18, 4.02, 1.5,
           "محصولات دوو در ایران توسط شرکت «انتخاب الکترونیک آرمان» "
           "(زیرمجموعهٔ گروه صنعتی انتخاب) تولید و عرضه می‌شود؛ کارخانه در "
           "شهرک صنعتی مورچه‌خورت اصفهان مستقر است و شبکهٔ گستردهٔ فروش و "
           "خدمات پس از فروش در سراسر کشور دارد.", size=9.8, role="zar",
           color=IVORY_T, align="r", ls=1.45, valign="t")
    s.text(6.6, 1.62, 5.76, 0.3, "نگاهی کوتاه به برند دوو (Daewoo)",
           size=12, role="lotus", color=NAVY, align="r")
    timeline = [
        (fa("1967"), "تأسیس گروه دوو در سئول توسط کیم وو چونگ؛ آغاز به‌عنوان "
                 "شرکت بازرگانی و رشد به یکی از بزرگ‌ترین گروه‌های صنعتی کره (چِبول)."),
        ("دهه‌های ۷۰–۸۰", "گسترش صنعتی و راهیابی محصولات به بازارهای بین‌المللی."),
        (fa("1999"), "بازسازی گروه دوو پس از بحران مالی آسیا و تداوم برند در "
                 "لوازم خانگی تحت مجوز شرکت‌های گوناگون."),
        ("امروز", "دوو الکترونیکس یخچال، ماشین لباسشویی، ظرف‌شویی، اجاق، "
                  "مایکروویو و تلویزیون عرضه می‌کند؛ در ایران برندی شناخته‌شده است."),
    ]
    y = 2.02
    for i, (yr, txt) in enumerate(timeline):
        s.ellipse(12.02, y + 0.04, 0.16, 0.16, fill=GOLD)
        if i < len(timeline) - 1:
            s.line(12.10, y + 0.22, 12.10, y + 1.02, color=HAIR, w=1.2)
        s.text(11.30, y, 0.66, 0.3, yr, size=10.2, role="titr",
               color=TEAL_D, align="r", ls=1.0)
        h = s.text(6.60, y, 4.55, 0.9, txt, size=9.6, role="zar",
                   color=INK, ls=1.35)
        y += max(0.78, h) + 0.20
    chips = [("محصولات", "لوازم خانگی بزرگ و کوچک"),
             ("تولید در ایران", "انتخاب الکترونیک آرمان"),
             ("مزیت رقابتی", "شبکهٔ فروش و خدمات پس از فروش")]
    kw = (5.76 - 2 * 0.14) / 3
    for i, (a, b) in enumerate(chips):
        x = 12.36 - kw * (i + 1) - 0.14 * i
        card_r(s, x, 6.04, kw, 0.78, fill=SOFT, line=HAIR2, shadow=False)
        s.text(x + 0.06, 6.12, kw - 0.12, 0.26, a, size=8.8, role="zar_r",
               color=MUTE, align="c")
        s.text(x + 0.06, 6.40, kw - 0.12, 0.34, b, size=9.0, role="lotus",
               color=NAVY, align="c")


# ============================================================ ۱۲) روش تحقیق
def s12(s):
    frame(s, 7, 7, "روش‌شناسی پژوهش", "طرح کلی و روش تحقیق", 12)
    chips = [("نوع پژوهش از نظر هدف", "کاربردی"),
             ("ماهیت و روش اجرا", "توصیفی — همبستگی"),
             ("ابزار تحلیل", "نرم‌افزار SPSS")]
    for i, (a, b) in enumerate(chips):
        x = X3[i]
        card_r(s, x, 1.55, C3, 0.98)
        s.text(x + 0.12, 1.68, C3 - 0.24, 0.26, a, size=9.5, role="zar_r",
               color=MUTE, align="c")
        s.text(x + 0.12, 1.96, C3 - 0.24, 0.42, b, size=13.2, role="titr",
               color=NAVY, align="c", valign="m")
    steps = ["تعریف متغیرها و مدل", "تأیید روایی محتوایی",
             "توزیع ۱۵۰ پرسشنامه", "پایایی (آلفای کرونباخ)",
             "آزمون K-S و اسپیرمن"]
    cw = (CW - 4 * 0.10) / 5
    for i, t in enumerate(steps):
        x = CX1 - cw * (i + 1) - 0.10 * i
        s.chevron(x, 2.78, cw, 1.02, TEAL if i == 4 else NAVY, flip_h=True)
        s.text(x + 0.20, 2.90, cw - 0.42, 0.24, f"گام {fa(i + 1)}",
               size=8.5, role="lotus", color=GOLD_L, align="c")
        s.text(x + 0.26, 3.12, cw - 0.55, 0.62, t, size=9.2, role="zar",
               color=WHITE, align="c", valign="m", ls=1.25)
    s.image(P("c_method.png"), 1.80, 4.10, 4.45, 2.62)
    card_r(s, 6.55, 4.10, 5.81, 2.62)
    s.text(6.85, 4.28, 5.2, 0.3, "مسیر گردآوری و تجزیه‌وتحلیل داده‌ها",
           size=12, role="lotus", color=NAVY, align="r")
    items = [
        "گردآوری داده: مطالعات کتابخانه‌ای + پژوهش میدانی با پرسشنامه.",
        "کدگذاری پاسخ‌های لیکرت (۱ تا ۵) و ورود داده به SPSS.",
        "آزمون کولموگروف–اسمیرنوف برای بررسی نرمال بودن توزیع.",
        "به‌دلیل رتبه‌ای بودن داده و غیرنرمال بودن ابعاد، آزمون اسپیرمن.",
    ]
    y = 4.68
    for it in items:
        s.rect(12.10, y + 0.075, 0.085, 0.085, fill=TEAL, radius=0.02,
               shadow=False)
        h = s.text(6.85, y, 5.10, 0.5, it, size=10.0, role="zar",
                   color=INK, ls=1.28)
        y += max(0.44, h) + 0.06


# ============================================================ ۱۳) جامعه و نمونه
def s13(s):
    frame(s, 8, 8, "جامعه و نمونهٔ آماری", "جامعه، نمونه و روش نمونه‌گیری", 13)
    kpis = [("۲۴۵ نفر", "جامعهٔ آماری", "کارکنان فروشگاه‌های دوو اهواز"),
            ("۱۵۰", "پرسشنامهٔ تحلیل‌شده", "حجم نمونه بر اساس جدول مورگان"),
            ("ترکیبی", "روش نمونه‌گیری", "تصادفی طبقه‌ای + خوشه‌ای")]
    for i, (num, lab, sub) in enumerate(kpis):
        x = X3[i]
        card_r(s, x, 1.55, C3, 1.42)
        s.rect(x + C3 / 2 - 0.16, 1.70, 0.32, 0.045, fill=GOLD, radius=0.02,
               shadow=False)
        s.text(x + 0.1, 1.80, C3 - 0.2, 0.52, num, size=25, role="titr",
               color=NAVY, align="c", valign="m", ls=1.0)
        s.text(x + 0.12, 2.38, C3 - 0.24, 0.28, lab, size=10.2, role="lotus",
               color=INK, align="c")
        s.text(x + 0.12, 2.67, C3 - 0.24, 0.24, sub, size=8.4, role="zar_r",
               color=MUTE, align="c")
    s.rect(9.15, 3.42, 3.21, 1.86, fill=NAVY, radius=0.14, shadow=True)
    s.text(9.35, 3.60, 2.81, 0.28, "جامعهٔ آماری", size=10.5, role="lotus",
           color=GOLD_L, align="c")
    s.text(9.35, 3.90, 2.81, 0.5, "۲۴۵ نفر", size=23, role="titr",
           color=WHITE, align="c", valign="m")
    s.text(9.30, 4.50, 2.9, 0.7,
           "مدیران داخلی، فروشندگان و حسابداران فروشگاه‌های دوو در سال‌های "
           "۱۴۰۴ و ۱۴۰۵", size=8.8, role="zar_r", color=(190, 198, 208),
           align="c", ls=1.3)
    s.text(5.72, 3.06, 2.80, 0.26, "روش نمونه‌گیری ترکیبی (احتمالی)",
           size=10, role="lotus", color=TEAL_D, align="c")
    s.rect(5.72, 3.42, 2.80, 0.82, fill=CARD, line=HAIR2, radius=0.10)
    s.text(5.84, 3.42, 2.56, 0.82, "نمونه‌گیری تصادفی طبقه‌ای",
           size=10.8, role="zar", color=INK, align="c", valign="m")
    s.rect(5.72, 4.46, 2.80, 0.82, fill=CARD, line=HAIR2, radius=0.10)
    s.text(5.84, 4.46, 2.56, 0.82, "نمونه‌گیری تصادفی خوشه‌ای",
           size=10.8, role="zar", color=INK, align="c", valign="m")
    s.rect(1.72, 3.42, 3.21, 1.86, fill=TEAL, radius=0.14, shadow=True)
    s.text(1.92, 3.60, 2.81, 0.28, "نمونهٔ آماری", size=10.5, role="lotus",
           color=(224, 245, 244), align="c")
    s.text(1.92, 3.90, 2.81, 0.5, "۱۵۰ پرسشنامه", size=21, role="titr",
           color=WHITE, align="c", valign="m")
    s.text(1.92, 4.55, 2.81, 0.4, "همهٔ پرسشنامه‌ها تحلیل شد", size=9,
           role="zar_r", color=(220, 235, 235), align="c")
    s.arrow_line(9.08, 4.35, 8.62, 4.35, color=GOLD, w=1.8)
    s.arrow_line(5.64, 4.35, 5.02, 4.35, color=GOLD, w=1.8)
    card_r(s, CX0, 5.62, CW, 1.06, fill=SOFT, line=HAIR2, shadow=False)
    s.text(CX0 + 0.3, 5.76, CW - 0.6, 0.3, "مبنای برآورد حجم نمونه",
           size=10.2, role="lotus", color=TEAL_D, align="r")
    s.text(CX0 + 0.3, 6.10, CW - 0.6, 0.5,
           "به‌دلیل نبود واریانس جامعه، انحراف معیار تقریبی از دامنهٔ مقیاس "
           "لیکرت (۰٫۶۷)، با سطح اطمینان ۹۵٪ و خطای مجاز ۰٫۱۰۷ برآورد و "
           "حجم نمونه با جدول مورگان برابر ۱۵۰ تعیین شد.", size=9.8,
           role="zar", color=INK, align="c", ls=1.4, valign="m")


# ============================================================ ۱۴) ابزار و پایایی
def s14(s):
    frame(s, 9, 9, "ابزار و روش گردآوری داده‌ها (۱)", "ابزار، روایی و پایایی", 14)
    card_r(s, CX0, 1.55, 4.05, 5.22)
    d = 2.24
    gx = CX0 + (4.05 - d) / 2
    s.ellipse(gx, 1.74, d, d, fill=None, line=HAIR, lw=8)
    s.arc_gauge(gx, 1.74, d, -90, -90 + 360 * 0.922, color=TEAL, lw=0.12)
    s.text(gx, 2.36, d, 0.66, "0.922", size=30, role="titr", color=NAVY,
           align="c", valign="m", ls=1.0)
    s.text(gx, 3.02, d, 0.28, "آلفای کرونباخ کل", size=9.6,
           role="lotus", color=INK, align="c")
    chip_tag(s, CX0 + 4.05 / 2 - 0.55, 3.98, 1.10, "۹۲٫۲٪", fill=TEAL,
             tx=WHITE, h=0.34, size=12)
    # آلفای هر بُعد
    alphas = [("سازماندهی", 0.735), ("اقلام تبلیغاتی", 0.796),
              ("چیدمان", 0.793), ("میزان فروش", 0.698)]
    y = 4.50
    for name, a in alphas:
        s.text(CX0 + 0.28, y, 1.35, 0.26, name, size=9.2, role="zar",
               color=INK, align="r", valign="m")
        s.hbar(CX0 + 1.70, y + 0.02, 1.55, 0.20, a / 0.95, fill=TEAL_D)
        s.text(CX0 + 3.30, y - 0.01, 0.55, 0.26, f"{a:.3f}", size=9.2,
               role="lotus", color=NAVY, align="c", valign="m", ls=1.0)
        y += 0.37
    s.text(CX0 + 0.22, 6.04, 3.61, 0.28,
           "همهٔ ضرایب در دامنهٔ قابل‌قبول‌اند؛ آلفای بُعد فروش ۰٫۶۹۸ "
           "(مرزی و قابل‌قبول) گزارش شده است.", size=8.2, role="zar_r",
           color=MUTE, align="c", ls=1.3)
    rx, rw = 6.05, 6.31
    card_r(s, rx, 1.55, rw, 1.62)
    chip_tag(s, rx + rw - 1.55, 1.72, 1.35, "ابزار گردآوری", fill=NAVY,
             tx=GOLD_L, h=0.30, size=9.2)
    s.text(rx + 0.25, 2.04, rw - 0.5, 0.4, "پرسشنامهٔ دو بخشی", size=17,
           role="titr", color=NAVY, align="r")
    s.text(rx + 0.25, 2.50, rw - 0.5, 0.6,
           "بخش ۱: اطلاعات جمعیت‌شناختی  ·  بخش ۲: ۱۹ پرسش تخصصی در "
           "طیف پنج‌گزینه‌ای لیکرت (کاملاً مخالف=۱ تا کاملاً موافق=۵).",
           size=10, role="zar", color=INK, align="r", ls=1.4)
    card_r(s, rx, 3.32, rw, 1.36)
    chip_tag(s, rx + rw - 1.05, 3.49, 0.85, "روایی", fill=NAVY, tx=GOLD_L,
             h=0.30, size=9.2)
    s.text(rx + 0.25, 3.82, rw - 0.5, 0.78,
           "روایی محتوایی با بازبینی استاد راهنما و استادان/متخصصان حوزهٔ "
           "مدیریت بازاریابی و اعمال اصلاحات آنان تأیید شد.", size=11.0,
           role="zar", color=INK, align="r", valign="m", ls=1.5)
    card_r(s, rx, 4.83, rw, 1.94)
    chip_tag(s, rx + rw - 1.55, 5.00, 1.35, "گویه‌های پرسشنامه", fill=NAVY,
             tx=GOLD_L, h=0.30, size=8.8)
    qs = [("سازماندهی فعالیت‌ها", "۵ گویه · پرسش ۱ تا ۵"),
          ("اقلام تبلیغاتی", "۵ گویه · پرسش ۶ تا ۱۰"),
          ("چیدمان و جانمایی", "۵ گویه · پرسش ۱۱ تا ۱۵"),
          ("ارتقای فروش", "۴ گویه · پرسش ۱۶ تا ۱۹")]
    wcell = rw / 2 - 0.20
    for i, (a, b) in enumerate(qs):
        r2, c2 = divmod(i, 2)
        xc = rx + rw - 0.20 - wcell - c2 * (wcell + 0.16)
        y = 5.42 + r2 * 0.62
        s.rect(xc, y, wcell, 0.5, fill=SOFT, line=HAIR2, radius=0.08,
               shadow=False)
        s.text(xc + 0.06, y + 0.05, wcell - 0.12, 0.22, a, size=9.0,
               role="lotus", color=NAVY, align="c")
        s.text(xc + 0.06, y + 0.27, wcell - 0.12, 0.2, b, size=8.0,
               role="zar_r", color=TEAL_D, align="c")


# ============================================================ ۱۵) متغیرها و تحلیل
def s15(s):
    frame(s, 9, 9, "ابزار و روش گردآوری داده‌ها (۲)", "متغیرها و روش تحلیل", 15)
    cols = [("نوع", 1.18), ("بُعد / متغیر", 4.92), ("گویه", 1.0),
            ("شماره پرسش", 3.54)]
    ty, rh = 1.52, 0.62
    x = CX1
    for name, w in cols:
        x -= w
        s.rect(x, ty, w, 0.44, fill=NAVY, radius=0.001, shadow=False)
        s.text(x + 0.06, ty, w - 0.12, 0.44, name, size=9.8, role="lotus",
               color=WHITE, align="c", valign="m")
    rows = [
        ("مستقل", "سازماندهی و اثربخشی فعالیت‌های بازارپردازی", "۵", "۱ تا ۵", TEAL),
        ("مستقل", "استقرار هدفمند اقلام تبلیغاتی", "۵", "۶ تا ۱۰", TEAL),
        ("مستقل", "نحوهٔ چیدمان و جانمایی محصولات", "۵", "۱۱ تا ۱۵", TEAL),
        ("وابسته", "ارتقای (میزان) فروش محصولات شرکت دوو", "۴", "۱۶ تا ۱۹", NAVY),
    ]
    for r, (typ, var, g, qs, tc) in enumerate(rows):
        y = ty + 0.44 + r * rh
        x = CX1
        for name, w in cols:
            x -= w
            s.rect(x, y, w, rh, fill=CARD if r % 2 == 0 else SOFT,
                   line=HAIR2, lw=0.75, radius=0.001, shadow=False)
        x = CX1
        for ci, val in enumerate([typ, var, g, qs]):
            w = cols[ci][1]; x -= w
            if ci == 0:
                chip_tag(s, x + w / 2 - 0.48, y + 0.13, 0.96, val, fill=tc,
                         tx=WHITE, h=0.36, size=9.6)
            elif ci == 1:
                s.text(x + 0.16, y, w - 0.32, rh, val, size=10.2, role="zar",
                       color=INK, align="r", valign="m", ls=1.2)
            else:
                s.text(x + 0.06, y, w - 0.12, rh, val, size=9.4,
                       role="zar_r", color=(TEAL_D if ci == 2 else MUTE),
                       align="c", valign="m")
    # دو کارت پایین: K-S و اسپیرمن
    card_r(s, X2[0], 4.72, C2, 2.04)
    s.text(X2[0] + 0.3, 4.88, C2 - 0.6, 0.3, "گام ۱: آزمون نرمال بودن (K-S)",
           size=10.6, role="lotus", color=NAVY, align="r")
    ks = [
        "سطح معناداری بُعد کلی بازارپردازی برابر 0.200 (نرمال).",
        "چهار متغیر اصلی (سه بُعد و فروش) سطح معناداری زیر ۰٫۰۵ دارند؛ "
        "از این رو غیرنرمال تشخیص داده شدند.",
    ]
    y = 5.24
    for t in ks:
        h = blt(s, X2[0] + 0.28, y, C2 - 0.6, t, size=9.8, dot=GOLD)
        y += max(0.56, h) + 0.08
    card_r(s, X2[1], 4.72, C2, 2.04, fill=NAVY)
    s.text(X2[1] + 0.3, 4.88, C2 - 0.6, 0.3, "گام ۲: آزمون فرضیه‌ها",
           size=10.6, role="lotus", color=GOLD_L, align="r")
    s.text(X2[1] + 0.3, 5.26, C2 - 0.6, 0.5,
           "ضریب همبستگی رتبه‌ای اسپیرمن", size=14.5, role="titr",
           color=WHITE, align="r")
    s.text(X2[1] + 0.3, 5.82, C2 - 0.6, 0.8,
           "به‌دلیل ماهیت رتبه‌ای طیف لیکرت و غیرنرمال بودن ابعاد، به‌جای "
           "پیرسون از اسپیرمن استفاده شد؛ سطح معناداری ۰٫۰۵ و SPSS.",
           size=9.6, role="zar_r", color=IVORY_T, align="r", ls=1.4)


# ============================================================ ۱۶) یافته‌های توصیفی
def s16(s):
    frame(s, 10, 10, "یافته‌های پژوهش (۱)", "آمار توصیفی: ویژگی‌های نمونه (۱۵۰ نفر)", 16)
    # کارت راست: تحصیلات (میله افقی) + جنسیت
    card_r(s, 6.85, 1.52, 5.51, 5.26)
    s.text(7.10, 1.68, 5.0, 0.28, "توزیع جنسیت و سطح تحصیلات", size=11.2,
           role="lotus", color=NAVY, align="r")
    # جنسیت
    s.text(7.10, 2.08, 2.2, 0.24, "مرد  ۸۸٪ (۱۳۲ نفر)", size=9.6,
           role="zar", color=INK, align="r", valign="m")
    s.hbar(9.35, 2.06, 2.75, 0.24, 0.88, fill=NAVY)
    s.text(7.10, 2.42, 2.2, 0.24, "زن  ۱۲٪ (۱۸ نفر)", size=9.6,
           role="zar", color=INK, align="r", valign="m")
    s.hbar(9.35, 2.40, 2.75, 0.24, 0.12, fill=TEAL)
    s.line(7.10, 2.82, 12.1, 2.82, color=HAIR2, w=0.8)
    # تحصیلات
    edu = [("لیسانس", 48.7), ("دیپلم", 24.0), ("زیر دیپلم", 18.7),
           ("فوق لیسانس", 7.3), ("فوق دیپلم", 1.3)]
    y = 2.98
    for name, pct in edu:
        s.text(7.10, y, 1.55, 0.24, name, size=9.4, role="zar", color=INK,
               align="r", valign="m")
        s.hbar(8.72, y, 2.55, 0.22, pct / 100.0,
               fill=TEAL if name == "لیسانس" else TEAL_D)
        s.text(11.34, y - 0.01, 0.95, 0.24, fa(f"{pct:.1f}") + "٪", size=9.2,
               role="lotus", color=NAVY, align="l", valign="m")
        y += 0.36
    s.text(7.10, 4.92, 5.0, 0.24,
           "بیشترین فراوانی: مدرک لیسانس با ۴۸٫۷٪ (۷۳ نفر).", size=9,
           role="zar_r", color=MUTE, align="c")
    # کارت چپ: سن (میله عمودی)
    card_r(s, CX0, 1.52, 5.05, 5.26)
    s.text(CX0 + 0.25, 1.68, 4.5, 0.28, "توزیع سنی پاسخ‌دهندگان", size=11.2,
           role="lotus", color=NAVY, align="r")
    ages = [("۱۸–۲۵", 1.3), ("۲۶–۳۵", 14.0), ("۳۶–۴۵", 37.3),
            ("۴۶–۵۵", 10.0), ("۵۶–۶۵", 17.3), ("بالای ۶۵", 20.0)]
    ax_l, ax_r, ax_b, ax_t = 2.05, 6.45, 6.05, 2.35
    for g in range(3):
        gy = ax_b - g * (ax_b - ax_t) / 2
        s.line(ax_l, gy, ax_r, gy, color=HAIR2, w=0.7, dash=True)
    s.line(ax_l, ax_t, ax_l, ax_b, color=MUTE, w=1.0)
    s.line(ax_l, ax_b, ax_r, ax_b, color=MUTE, w=1.0)
    n = len(ages)
    slot = (ax_r - ax_l) / n
    for i, (lab, pct) in enumerate(ages):
        cx = ax_r - (i + 0.5) * slot
        bh = (ax_b - ax_t) * (pct / 100.0)
        bw = 0.42
        top = ax_b - bh
        col = GOLD if pct == max(a[1] for a in ages) else TEAL
        s.rect(cx - bw / 2, top, bw, bh, fill=col, radius=0.04, shadow=False)
        s.text(cx - 0.42, top - 0.26, 0.84, 0.22, fa(f"{pct:g}") + "٪",
               size=8.4, role="lotus", color=NAVY, align="c")
        s.text(cx - 0.5, ax_b + 0.08, 1.0, 0.22, lab, size=8.0, role="zar_r",
               color=MUTE, align="c")
    s.text(CX0 + 0.25, 6.34, 4.5, 0.3,
           "بیشترین گروه سنی: ۳۶ تا ۴۵ سال با ۳۷٫۳٪ (۵۶ نفر).", size=9,
           role="zar_r", color=MUTE, align="c")


# ============================================================ ۱۷) نمای کلی یافته‌ها + نمودار r
def s17(s):
    frame(s, 10, 10, "یافته‌های پژوهش (۲)", "آزمون فرضیه‌ها: نمای کلی", 17)
    s.rect(CX0, 1.52, CW, 0.98, fill=NAVY, radius=0.14, shadow=True)
    chip_tag(s, CX1 - 1.55, 1.84, 1.35, "یافتهٔ محوری", fill=GOLD, tx=NAVY,
             h=0.32, size=9.5)
    s.text(CX0 + 0.3, 1.52, CW - 2.1, 0.98,
           "هر چهار فرضیه تأیید شد؛ رابطهٔ کلی بازارپردازی و فروش با "
           "r = 0.775 قوی‌ترین همبستگی است.", size=13, role="lotus",
           color=WHITE, align="c", valign="m", ls=1.4)
    hyps = [
        ("فرضیهٔ اصلی", "بازارپردازی ← فروش", "0.775"),
        ("فرضیهٔ فرعی ۱", "اقلام تبلیغاتی ← فروش", "0.710"),
        ("فرضیهٔ فرعی ۲", "سازماندهی ← فروش", "0.667"),
        ("فرضیهٔ فرعی ۳", "چیدمان ← فروش", "0.710"),
    ]
    for i, (a, b, r) in enumerate(hyps):
        x = X4[i]
        card_r(s, x, 2.70, C4, 1.50)
        s.text(x + 0.1, 2.82, C4 - 0.2, 0.22, a, size=8.6, role="zar_r",
               color=MUTE, align="c")
        s.text(x + 0.1, 3.04, C4 - 0.2, 0.30, b, size=9.8, role="lotus",
               color=NAVY, align="c")
        s.text(x + 0.1, 3.34, C4 - 0.2, 0.34, "r = " + r, size=14,
               role="titr", color=(GOLD if i == 0 else TEAL_D), align="c")
        chip_tag(s, x + C4 / 2 - 0.55, 3.76, 1.10, "تأیید شد",
                 fill=TEAL, tx=WHITE, h=0.28, size=8.8)
    card_r(s, CX0, 4.38, CW, 2.38)
    s.text(CX0 + 0.28, 4.52, 6.0, 0.26,
           "مقایسهٔ ضرایب همبستگی اسپیرمن هر فرضیه با میزان فروش (N = 150)",
           size=10.2, role="lotus", color=NAVY, align="r")
    chip_tag(s, CX0 + 0.28, 4.50, 1.65, "سطح معناداری ۰٫۰۵",
             fill=(232, 242, 242), tx=TEAL_D, h=0.30, size=8.6)
    ax_l, ax_r, ax_b, ax_t = 2.30, 12.05, 6.32, 4.92
    for g in range(5):
        gy = ax_b - g * (ax_b - ax_t) / 4
        s.line(ax_l, gy, ax_r, gy, color=HAIR2, w=0.7, dash=True)
        s.text(ax_l - 0.42, gy - 0.11, 0.36, 0.22, f"{g*0.25:.2f}",
               size=7.6, role="zar_r", color=MUTE, align="c")
    s.line(ax_l, ax_t, ax_l, ax_b, color=MUTE, w=1.1)
    s.line(ax_l, ax_b, ax_r, ax_b, color=MUTE, w=1.1)
    labels = ["بازارپردازی (کل)", "اقلام تبلیغاتی", "سازماندهی", "چیدمان"]
    vals = [0.775, 0.710, 0.667, 0.710]
    n = 4
    slot = (ax_r - ax_l - 0.4) / n
    for i in range(n):
        cx = ax_r - 0.2 - i * slot - slot / 2
        bw = 0.66
        bh = (ax_b - ax_t) * vals[i]
        top = ax_b - bh
        col = GOLD if i == 0 else TEAL
        s.rect(cx - bw / 2, top, bw, bh, fill=col, radius=0.05, shadow=False)
        s.text(cx - 0.5, top - 0.28, 1.0, 0.24, f"{vals[i]:.3f}", size=9.4,
               role="titr", color=NAVY, align="c")
        s.text(cx - 0.78, ax_b + 0.10, 1.56, 0.34, labels[i], size=8.6,
               role="zar", color=INK, align="c", ls=1.15)


# ============================================================ ۱۸) جدول نتایج
def s18(s):
    frame(s, 10, 10, "یافته‌های پژوهش (۳)", "جدول نتایج آزمون فرضیه‌ها (اسپیرمن)", 18)
    cols = [("فرضیه", 0.95), ("شرح فرضیه", 4.05), ("r اسپیرمن", 1.35),
            ("Sig.", 1.25), ("N", 0.85), ("نتیجه", 2.19)]
    ty, rh = 1.55, 0.84
    x = CX1
    for name, w in cols:
        x -= w
        s.rect(x, ty, w, 0.46, fill=NAVY, radius=0.001, shadow=False)
        s.text(x + 0.04, ty, w - 0.08, 0.46, name, size=9.6, role="lotus",
               color=WHITE, align="c", valign="m")
    rows = [
        ("اصلی", "بازارپردازی (کل) بر ارتقای فروش", "0.775", "0.000", "150"),
        ("فرعی ۱", "استقرار اقلام تبلیغاتی بر میزان فروش", "0.710", "0.000", "150"),
        ("فرعی ۲", "سازماندهی فعالیت‌های بازارپردازی بر میزان فروش", "0.667", "0.000", "150"),
        ("فرعی ۳", "چیدمان و جانمایی محصولات بر میزان فروش", "0.710", "0.000", "150"),
    ]
    for r, row in enumerate(rows):
        y = ty + 0.46 + r * rh
        x = CX1
        for name, w in cols:
            x -= w
            s.rect(x, y, w, rh, fill=CARD if r % 2 == 0 else SOFT,
                   line=HAIR2, lw=0.75, radius=0.001, shadow=False)
        x = CX1
        for ci, val in enumerate(row):
            w = cols[ci][1]; x -= w
            if ci == 0:
                s.text(x + 0.03, y, w - 0.06, rh, val, size=9.2,
                       role="lotus", color=TEAL_D, align="c", valign="m")
            elif ci == 1:
                s.text(x + 0.14, y, w - 0.28, rh, val, size=9.8, role="zar",
                       color=INK, align="r", valign="m", ls=1.2)
            elif ci == 5:
                pass
            else:
                s.text(x + 0.04, y, w - 0.08, rh, val, size=10,
                       role="lotus", color=NAVY, align="c", valign="m", ls=1.0)
        # ستون نتیجه جداگانه
    xres = CX1 - sum(w for _, w in cols)
    wres = cols[5][1]
    for r in range(4):
        y = ty + 0.46 + r * rh
        chip_tag(s, xres + wres / 2 - 0.55, y + 0.23, 1.10, "تأیید شد",
                 fill=TEAL, tx=WHITE, h=0.38, size=9.6)
    card_r(s, CX0, 5.30, CW, 1.42, fill=NAVY)
    s.text(CX0 + 0.35, 5.46, CW - 0.7, 0.3, "تفسیر نتایج", size=10.8,
           role="lotus", color=GOLD_L, align="r")
    s.text(CX0 + 0.35, 5.80, CW - 0.7, 0.82,
           "تمام ضرایب مثبت و در سطح خطای ۰٫۰۵ معنادارند (Sig. = 0.000 < 0.05). "
           "قوی‌ترین رابطه به عملکرد کلی بازارپردازی (0.775) و سپس اقلام "
           "تبلیغاتی و چیدمان (هر دو 0.710) تعلق دارد؛ سازماندهی با 0.667 "
           "نیز رابطهٔ مستقیم و معنادار نشان می‌دهد.", size=10.2, role="zar",
           color=IVORY_T, align="c", ls=1.5, valign="m")


# ============================================================ ۱۹) تحلیل و بحث
def s19(s):
    frame(s, 11, 11, "تحلیل و بحث (۱)", "پاسخ به فرضیه‌ها در یک نگاه", 19)
    s.rect(CX0, 1.52, CW, 1.02, fill=NAVY, radius=0.14, shadow=True)
    s.rect(CX0, 1.52, 0.10, 1.02, fill=GOLD, radius=0.04, shadow=False)
    s.text(CX0 + 0.35, 1.52, CW - 0.7, 1.02,
           "هر سه بُعد بازارپردازی با فروش رابطهٔ مستقیم و معنادار دارند؛ "
           "اقلام تبلیغاتی و چیدمان (0.710) اندکی قوی‌تر از سازماندهی (0.667) هستند.",
           size=12, role="lotus", color=WHITE, align="c", valign="m", ls=1.45)
    cols = [("یافتهٔ پژوهش حاضر", 4.1), ("هم‌خوانی با پیشینه", 3.6),
            ("تفسیر", 2.94)]
    ty = 2.88
    x = CX1
    for nm, w in cols:
        x -= w
        s.rect(x, ty, w, 0.42, fill=TEAL_D, radius=0.001, shadow=False)
        s.text(x + 0.08, ty, w - 0.16, 0.42, nm, size=9.8, role="lotus",
               color=WHITE, align="c", valign="m")
    data = [
        ("اقلام تبلیغاتی ← فروش (r=0.710)، تأیید.",
         "هم‌خوان با فام و همکاران (۲۰۱۱) دربارهٔ اهمیت تبلیغات درون فروشگاه.",
         "اطلاع‌رسانی در لحظهٔ تصمیم، توجه و احتمال خرید را بالا می‌برد."),
        ("سازماندهی فعالیت‌ها ← فروش (r=0.667)، تأیید.",
         "هم‌خوان با مهراب‌پور (۱۳۹۸) بر نقش مدیریت و رضایت در پیامد فروش.",
         "پایش مستمر چیدمان و موجودی، اجرای بی‌نقص فروش را تضمین می‌کند."),
        ("چیدمان و جانمایی ← فروش (r=0.710)، تأیید.",
         "هم‌خوان با کرفوت (۲۰۱۴)، سالار (۱۳۹۲) و منصوری‌موید (۱۳۹۳).",
         "دیده‌شدن بیشتر و دسترسی آسان، مسیر مشتری تا خرید را کوتاه می‌کند."),
    ]
    for r, row in enumerate(data):
        y = ty + 0.50 + r * 0.98
        x = CX1
        for ci, (nm, w) in enumerate(cols):
            x -= w
            s.rect(x, y, w, 0.88, fill=CARD if r % 2 == 0 else SOFT,
                   line=HAIR2, lw=0.75, radius=0.001, shadow=False)
        x = CX1
        for ci, val in enumerate(row):
            w = cols[ci][1]; x -= w
            if ci == 0:
                s.rect(x + w - 0.16, y + 0.16, 0.10, 0.10, fill=TEAL,
                       radius=0.02, shadow=False)
                s.text(x + 0.14, y, w - 0.38, 0.88, val, size=9.4,
                       role="lotus", color=NAVY, align="r", valign="m", ls=1.3)
            else:
                s.text(x + 0.12, y, w - 0.24, 0.88, val, size=8.8,
                       role="zar_r", color=INK if ci == 2 else MUTE,
                       align="c", valign="m", ls=1.32)
    s.rect(CX0, 6.40, CW, 0.42, fill=(251, 245, 232), line=GOLD,
           radius=0.08, shadow=False)
    s.text(CX0 + 0.2, 6.40, CW - 0.4, 0.42,
           "یادداشت روشی: اسپیرمن رابطه را نشان می‌دهد و به‌تنهایی اثبات "
           "رابطهٔ علّی نیست.", size=9.2, role="lotus", color=(120, 90, 30),
           align="c", valign="m")


# ============================================================ ۲۰) چارچوب تفسیر
def s20(s):
    frame(s, 11, 11, "تحلیل و بحث (۲)", "زنجیرهٔ منطقی تفسیر یافته‌ها", 20)
    chain = ["اجرای هدفمند بازارپردازی در فروشگاه", "توجه و تجربهٔ مثبت مشتری",
             "شکل‌گیری قصد و تصمیم خرید", "ارتقای میزان فروش دوو"]
    cw = (CW - 3 * 0.10) / 4
    for i, t in enumerate(chain):
        x = CX1 - cw * (i + 1) - 0.10 * i
        fill = TEAL if i == 3 else NAVY
        s.chevron(x, 1.58, cw, 1.02, fill, flip_h=True)
        s.text(x + 0.26, 1.58, cw - 0.55, 1.02, f"({fa(i + 1)})  {t}",
               size=9.8, role="zar", color=WHITE, align="c", valign="m", ls=1.35)
    blocks = [
        (X2[0], "سازگاری با مبانی و پیشینه", [
            "رابطهٔ مثبت همهٔ ابعاد با نظریهٔ بازارپردازی بصری و «فروشندهٔ خاموش» سازگار است.",
            "هم‌خوان با پژوهش‌های کرفوت (۲۰۱۴)، لاوو (۲۰۰۶) و سالار (۱۳۹۲) دربارهٔ اثر محیط بر رفتار خرید.",
            "اثر سازماندهی با یافتهٔ مهراب‌پور (۱۳۹۸) بر نقش مدیریت و رضایت هم‌راستاست.",
        ]),
        (X2[1], "نکته‌های کلیدی تفسیر", [
            "بالاترین ضریب به رابطهٔ کلی (0.775) تعلق دارد؛ کل یکپارچهٔ بازارپردازی از اجزای آن اثرگذارتر است.",
            "اقلام تبلیغاتی و چیدمان با 0.710 در رتبهٔ بعدی و سازماندهی با 0.667 همراه است.",
            "این پژوهش همبستگی است؛ از تعبیر علّیِ قطعی باید پرهیز کرد.",
        ]),
    ]
    for x, title, items in blocks:
        card_r(s, x, 2.92, C2, 3.82)
        s.rect(x, 2.92, C2, 0.52, fill=NAVY, radius=0.12, shadow=False)
        s.rect(x, 3.22, C2, 0.22, fill=NAVY, shadow=False)
        s.text(x + 0.2, 2.92, C2 - 0.4, 0.52, title, size=11, role="lotus",
               color=GOLD_L, align="c", valign="m")
        y = 3.62
        for it in items:
            s.rect(x + C2 - 0.28, y + 0.08, 0.085, 0.085, fill=GOLD,
                   radius=0.02, shadow=False)
            hh = s.text(x + 0.26, y, C2 - 0.62, 0.9, it, size=9.8,
                        role="zar", color=INK, ls=1.42)
            y += max(0.72, hh) + 0.16


# ============================================================ ۲۱) نتیجه‌گیری
def s21(s):
    frame(s, 12, 12, "نتیجه‌گیری", "مهم‌ترین یافته‌های پژوهش", 21)
    s.image(P("c_close.png"), 1.85, 1.60, 2.95, 4.30)
    s.rect(5.20, 1.60, 7.16, 1.06, fill=NAVY, radius=0.14, shadow=True)
    chip_tag(s, 5.42, 1.80, 1.18, "نتیجهٔ اصلی", fill=GOLD, tx=NAVY,
             h=0.32, size=9.2)
    s.text(6.80, 1.60, 5.36, 1.06,
           "عملکرد کلی بازارپردازی با ارتقای فروش رابطهٔ مثبت و معنادار "
           "دارد (r = 0.775).", size=13, role="lotus", color=WHITE,
           align="c", valign="m", ls=1.45)
    finds = [
        ("۱", "استقرار هدفمند اقلام تبلیغاتی", "r = 0.710  ·  رابطهٔ مثبت و معنادار"),
        ("۲", "سازماندهی فعالیت‌های بازارپردازی", "r = 0.667  ·  رابطهٔ مثبت و معنادار"),
        ("۳", "چیدمان و جانمایی بهینهٔ محصولات", "r = 0.710  ·  رابطهٔ مثبت و معنادار"),
    ]
    y = 2.90
    for n, t, r in finds:
        s.rect(5.20, y, 7.16, 0.86, fill=CARD, line=HAIR2, radius=0.12,
               shadow=True)
        s.ellipse(11.76, y + 0.19, 0.48, 0.48, fill=TEAL)
        s.text(11.76, y + 0.17, 0.48, 0.48, fa(n), size=14, role="titr",
               color=WHITE, align="c", valign="m", ls=1.0)
        s.text(5.5, y + 0.10, 5.6, 0.36, t, size=11.2, role="lotus",
               color=NAVY, align="r", valign="m")
        s.text(5.5, y + 0.48, 5.6, 0.30, r, size=9.6, role="zar",
               color=TEAL_D, align="r", valign="m")
        y += 0.98
    s.rect(5.20, 5.92, 7.16, 0.82, fill=SOFT, line=HAIR2, radius=0.10,
           shadow=False)
    s.text(5.45, 5.92, 6.7, 0.82,
           "پایایی ابزار: آلفای کل 0.922  ·  حجم نمونه: ۱۵۰  ·  همهٔ "
           "فرضیه‌ها در سطح خطای ۰٫۰۵ تأیید شدند.", size=9.8, role="lotus",
           color=NAVY, align="c", valign="m", ls=1.4)


# ============================================================ ۲۲) پیشنهادهای کاربردی
def s22(s):
    frame(s, 13, 13, "پیشنهادها (۱)", "پیشنهادهای کاربردی", 22)
    groups = [
        ("اقلام تبلیغاتی", NAVY, GOLD_L, [
            "طراحی و نصب اقلام متناسب با هر محصول و گروه هدف.",
            "گزینش محل نصب بر اساس دید مشتری و نقاط پرتردد.",
            "پیام‌های ساده، خوانا و هماهنگ با هویت بصری دوو.",
            "بازبینی دوره‌ای و تعویض اقلام فرسوده و قدیمی.",
        ]),
        ("سازماندهی فعالیت‌ها", TEAL, WHITE, [
            "برنامهٔ منظم بازدید و ارزیابی دوره‌ای فروشگاه‌ها.",
            "کنترل اجرای دستورالعمل‌های بازارپردازی و موجودی.",
            "آموزش بازارپردازان و کارکنان دربارهٔ اصول و ارتباط با مشتری.",
            "انتقال بازخورد فروشندگان و گزارش منظم فروش به شرکت.",
        ]),
        ("چیدمان و جانمایی", NAVY, GOLD_L, [
            "جانمایی محصولات پرفروش در نقاط داغ و در معرض دید.",
            "طراحی مسیر حرکت مشتری برای دسترسی بدون مانع.",
            "گروه‌بندی منسجم کالا و پرهیز از ازدحام بصری.",
            "بازبینی دوره‌ای چیدمان متناسب با رفتار مشتری.",
        ]),
    ]
    cw = (CW - 2 * 0.18) / 3
    for i, (title, hc, tc, items) in enumerate(groups):
        x = CX1 - cw * (i + 1) - 0.18 * i
        card_r(s, x, 1.55, cw, 5.20)
        s.rect(x, 1.55, cw, 0.58, fill=hc, radius=0.12, shadow=False)
        s.rect(x, 1.90, cw, 0.23, fill=hc, shadow=False)
        s.text(x + 0.15, 1.55, cw - 0.3, 0.58, title, size=11.5,
               role="lotus", color=tc, align="c", valign="m")
        y = 2.36
        for it in items:
            s.rect(x + cw - 0.26, y + 0.08, 0.085, 0.085, fill=GOLD,
                   radius=0.02, shadow=False)
            h = s.text(x + 0.22, y, cw - 0.56, 0.9, it, size=9.8,
                       role="zar", color=INK, ls=1.38)
            y += max(0.72, h) + 0.18


# ============================================================ ۲۳) پیشنهاد آتی + محدودیت‌ها
def s23(s):
    frame(s, 14, 14, "محدودیت‌ها", "پیشنهادهای پژوهشی و محدودیت‌ها", 23)
    card_r(s, X2[0], 1.55, C2, 5.24)
    s.rect(X2[0], 1.55, C2, 0.54, fill=TEAL, radius=0.12, shadow=False)
    s.rect(X2[0], 1.87, C2, 0.22, fill=TEAL, shadow=False)
    s.text(X2[0] + 0.2, 1.55, C2 - 0.4, 0.54, "پیشنهادهایی برای تحقیقات آتی",
           size=11.2, role="lotus", color=WHITE, align="c", valign="m")
    future = [
        "بررسی رابطهٔ بازارپردازی با رفتار و تصمیم خرید مصرف‌کننده.",
        "سنجش ابعاد نورپردازی، رنگ، موسیقی و طراحی ویترین.",
        "نقش میانجی رضایت و تجربهٔ خرید در رابطهٔ بازارپردازی–فروش.",
        "تکرار پژوهش در سایر برندها، شهرها و با حجم نمونهٔ بزرگ‌تر.",
        "استفاده از روش‌های آماری پیشرفته‌تر و داده‌های واقعی فروش.",
    ]
    y = 2.30
    for i, it in enumerate(future, 1):
        s.ellipse(X2[0] + C2 - 0.36, y + 0.02, 0.30, 0.30, fill=TEAL)
        s.text(X2[0] + C2 - 0.36, y, 0.30, 0.30, fa(i), size=9.5,
               role="titr", color=WHITE, align="c", valign="m", ls=1.0)
        h = s.text(X2[0] + 0.22, y, C2 - 0.72, 0.8, it, size=9.8,
                   role="zar", color=INK, ls=1.35)
        y += max(0.62, h) + 0.14
    card_r(s, X2[1], 1.55, C2, 5.24)
    s.rect(X2[1], 1.55, C2, 0.54, fill=NAVY, radius=0.12, shadow=False)
    s.rect(X2[1], 1.87, C2, 0.22, fill=NAVY, shadow=False)
    s.text(X2[1] + 0.2, 1.55, C2 - 0.4, 0.54, "محدودیت‌های پژوهش",
           size=11.2, role="lotus", color=GOLD_L, align="c", valign="m")
    limits = [
        ("ابزار", "اتکا به پرسشنامه و احتمال سوگیری یا پاسخ‌های محافظه‌کارانه."),
        ("پاسخ‌دهندگان", "احتمال بی‌دقتی یا برداشت متفاوت از پرسش‌ها به‌رغم توضیح."),
        ("مکانی", "محدود به فروشگاه‌های دوو اهواز؛ تعمیم با احتیاط."),
        ("منابع", "دسترسی محدود به برخی منابع و داده‌های داخلی فروشگاه."),
        ("روش", "طرح همبستگی، اثبات رابطهٔ علّی قطعی را ممکن نمی‌سازد."),
    ]
    y = 2.30
    for name, t in limits:
        card_r(s, X2[1] + 0.22, y, C2 - 0.44, 0.74, fill=SOFT, line=HAIR2,
               shadow=False)
        s.text(X2[1] + 0.38, y + 0.08, 1.25, 0.28, name, size=9.6,
               role="lotus", color=TEAL_D, align="r")
        s.text(X2[1] + 1.55, y + 0.06, C2 - 1.85, 0.64, t, size=8.9,
               role="zar", color=INK, align="r", valign="m", ls=1.3)
        y += 0.82


# ============================================================ ۲۴) جمع‌بندی نهایی
def s24(s):
    frame(s, 15, 15, "جمع‌بندی", "جمع‌بندی نهایی", 24)
    s.image(P("c_findings.png"), 1.85, 1.62, 4.05, 2.90)
    # چهار KPI بزرگ
    kpis = [("۲۴۵", "جامعهٔ آماری"), ("۱۵۰", "نمونه (پرسشنامه)"),
            ("0.922", "آلفای کرونباخ کل"), ("0.775", "همبستگی کل با فروش")]
    kw = (5.6 - 0.2) / 2
    for i, (num, lab) in enumerate(kpis):
        r, c = divmod(i, 2)
        x = 12.36 - kw * (c + 1) - 0.2 * c - 1.10
        y = 1.62 + r * 1.42
        card_r(s, x, y, kw, 1.28)
        s.text(x + 0.1, y + 0.20, kw - 0.2, 0.52, num, size=23, role="titr",
               color=(GOLD if i == 3 else NAVY), align="c", valign="m", ls=1.0)
        s.text(x + 0.1, y + 0.78, kw - 0.2, 0.3, lab, size=9.8,
               role="lotus", color=INK, align="c")
    s.rect(CX0, 4.78, CW, 1.96, fill=NAVY, radius=0.14, shadow=True)
    s.text(CX0 + 0.4, 4.96, CW - 0.8, 0.32, "پیام کلیدی پژوهش", size=12,
           role="lotus", color=GOLD_L, align="c")
    s.text(CX0 + 0.6, 5.34, CW - 1.2, 1.25,
           "طراحی هدفمند محیط فروشگاه — استقرار اقلام تبلیغاتی، سازماندهی "
           "فعالیت‌ها و چیدمان بهینه — اهرمی اثربخش برای ارتقای فروش است؛ "
           "هرچه اجرای یکپارچهٔ بازارپردازی مطلوب‌تر باشد، میزان فروش نیز "
           "رابطهٔ مثبت و مستقیمی با آن نشان می‌دهد.", size=12.5, role="lotus",
           color=WHITE, align="c", valign="m", ls=1.6)


# ============================================================ ۲۵) تشکر
def s25(s):
    s.bg_image(P("bg_thanks.png"))
    draw_timeline(s, 16, dark=True)
    draw_footer(s, 25, total=TOTAL, dark=True)
    s.image(P("logo_pnu_light.png"), 6.03, 1.18, 0.74, 0.74)
    s.text(3.0, 2.02, 6.8, 0.3,
           "دانشگاه پیام نور مرکز جویبار — بخش مدیریت، اقتصاد و حسابداری",
           size=10.5, role="lotus", color=GOLD_L, align="c")
    s.text(2.4, 2.62, 8.0, 0.9, "سپاسگزارم از توجه شما", size=38,
           role="titr", color=WHITE, align="c", ls=1.1)
    s.line(5.75, 3.72, 7.05, 3.72, color=GOLD, w=2.0)
    s.ellipse(6.32, 3.63, 0.16, 0.16, fill=GOLD)
    s.text(2.4, 3.92, 8.0, 0.5, "پرسش و پاسخ", size=22, role="lotus",
           color=GOLD_L, align="c")
    s.rect(4.35, 5.40, 4.10, 1.06, fill=(26, 48, 74), line=(90, 110, 132),
           lw=0.8, radius=0.12, shadow=False)
    s.text(4.55, 5.55, 3.7, 0.32, "دانشجو: بابک مرادوند", size=11,
           role="zar", color=IVORY_T, align="c")
    s.text(4.55, 5.95, 3.7, 0.32,
           "استاد راهنما: دکتر رمضان غلامی اواتی", size=11, role="zar",
           color=IVORY_T, align="c")


SLIDES = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11, s12,
          s13, s14, s15, s16, s17, s18, s19, s20, s21, s22, s23, s24, s25]

NOTES = [
    "سلام و احترام به استاد راهنمای محترم و داوران گرامی. موضوع پایان‌نامه: بررسی تأثیر عملکرد بازارپردازی بر ارتقای فروش فروشگاه‌های دوو شهر اهواز، در مقطع کارشناسی ارشد مدیریت بازرگانی گرایش بازاریابی. ابتدا نقشه مسیر و سپس مبانی، روش، یافته‌ها و جمع‌بندی ارائه می‌شود.",
    "نقشه مسیر ارائه در ۱۶ بخش؛ نوار پیشرفت کناری در همه اسلایدها بخش فعال را نشان می‌دهد.",
    "بازارپردازی مجموعه فعالیت‌های برنامه‌ریزی شده برای نمایش و چیدمان موثر محصول در نقطه فروش است و آن را فروشنده خاموش می‌نامند. این پژوهش سه بُعد مستقل و یک متغیر وابسته (ارتقای فروش) را می‌سنجد.",
    "مسئله اصلی: هزینه‌های بازارپردازی به‌دلیل بازخورد غیرآنی اغلب کم‌اثر تلقی می‌شود و چیدمان در بسیاری فروشگاه‌ها سلیقه‌ای است؛ سه بُعد اصلی معرفی و پرسش محوری درباره رابطه آن‌ها با فروش مطرح می‌شود.",
    "اهمیت در دو سطح اجرایی (تثبیت برند، تجربه مشتری، گردش کالا) و علمی (سنجش همزمان هر سه بُعد و خلأ مطالعاتی در صنعت لوازم خانگی دوو اهواز) است.",
    "هدف اصلی بررسی تأثیر بازارپردازی بر ارتقای فروش و سه هدف فرعی متناظر با سه بُعد است.",
    "فرضیه اصلی رابطه مثبت و معنادار بازارپردازی و فروش و سه فرضیه فرعی برای ابعاد؛ آزمون با اسپیرمن در SPSS.",
    "مدل مفهومی: سه بُعد مستقل (اقلام تبلیغاتی ۵ گویه، سازماندهی ۵ گویه، چیدمان ۵ گویه) بر ارتقای فروش (۴ گویه) اثر می‌گذارند؛ مجموع ۱۹ پرسش تخصصی.",
    "مرور تعاریف کلیدی: بازارپردازی، ارتقای فروش، اقلام تبلیغاتی POSM، سازماندهی، چیدمان و نقاط داغ؛ و پنج اصل بازارپردازی بصری.",
    "جدول پیشینه داخلی و خارجی: مهراب‌پور ۱۳۹۸، منصوری‌موید ۱۳۹۳، سالار ۱۳۹۲، کرفوت ۲۰۱۴، فام ۲۰۱۱ و لاوو ۲۰۰۶. شکاف پژوهشی: سنجش همزمان و کمی هر سه بُعد در فروشگاه‌های لوازم خانگی دوو.",
    "معرفی بستر: برند دوو در ۱۹۶۷ در سئول تأسیس شد، پس از بحران ۱۹۹۹ بازسازی شد و در ایران محصولات آن توسط شرکت انتخاب الکترونیک آرمان (گروه صنعتی انتخاب) در کارخانه مورچه‌خورت اصفهان تولید و با شبکه گسترده خدمات عرضه می‌شود.",
    "پژوهش کاربردی و توصیفی-همبستگی است؛ داده با مطالعه کتابخانه‌ای و پرسشنامه گردآوری و در SPSS تحلیل شد. مسیر: مدل، روایی، ۱۵۰ پرسشنامه، آلفا، آزمون K-S و اسپیرمن.",
    "جامعه ۲۴۵ نفر از کارکنان (مدیران، فروشندگان، حسابداران) فروشگاه‌های دوو اهواز در ۱۴۰۴-۱۴۰۵ است؛ نمونه ۱۵۰ نفری بر اساس مورگان با روش ترکیبی طبقه‌ای و خوشه‌ای. انحراف معیار تقریبی ۰٫۶۷، اطمینان ۹۵ درصد و خطای ۰٫۱۰۷ لحاظ شد.",
    "ابزار پرسشنامه دو بخشی با ۱۹ پرسش لیکرت ۱ تا ۵ است. روایی محتوایی تایید و آلفای کرونباخ کل ۰٫۹۲۲ شد؛ آلفای ابعاد ۰٫۷۳۵، ۰٫۷۹۶، ۰٫۷۹۳ و فروش ۰٫۶۹۸ است که همگی قابل قبول‌اند.",
    "جدول متغیرها و گویه‌ها. آزمون K-S نشان داد بُعد کلی بازارپردازی نرمال (۰٫۲۰۰) اما چهار متغیر اصلی غیرنرمال‌اند؛ به همین دلیل با توجه به داده رتبه‌ای لیکرت از اسپیرمن استفاده شد.",
    "آمار توصیفی: ۸۸ درصد مرد، ۱۲ درصد زن؛ بیشترین تحصیلات لیسانس ۴۸٫۷ درصد؛ بیشترین گروه سنی ۳۶ تا ۴۵ سال با ۳۷٫۳ درصد.",
    "نمای کلی یافته‌ها: هر چهار فرضیه تایید شد. ضرایب اسپیرمن به ترتیب ۰٫۷۷۵ برای کل، ۰٫۷۱۰ اقلام، ۰٫۶۶۷ سازماندهی و ۰٫۷۱۰ چیدمان است.",
    "جدول کامل نتایج با سطح معناداری ۰٫۰۰۰ و N برابر ۱۵۰؛ همه روابط مثبت و معنادارند و قوی‌ترین رابطه به کل بازارپردازی تعلق دارد.",
    "مقایسه یافته‌ها با پیشینه: اقلام تبلیغاتی با فام ۲۰۱۱، سازماندهی با مهراب‌پور ۱۳۹۸ و چیدمان با کرفوت ۲۰۱۴ و مطالعات داخلی هم‌خوان است. یادآوری: همبستگی به‌تنهایی اثبات علیت نیست.",
    "زنجیره تفسیر: اجرای بازارپردازی، تجربه مثبت مشتری، قصد خرید و در نهایت ارتقای فروش. کل یکپارچه بازارپردازی (۰٫۷۷۵) از هر یک از اجزا اثرگذارتر است.",
    "مهم‌ترین یافته: بازارپردازی با ۰٫۷۷۵ رابطه مثبت و نسبتا قوی با فروش دارد و هر سه بُعد معنادارند؛ پایایی کل ۰٫۹۲۲ و همه فرضیه‌ها تایید شدند.",
    "پیشنهادهای کاربردی در سه گروه اقلام تبلیغاتی، سازماندهی و چیدمان، برگرفته از فصل پنجم پایان‌نامه.",
    "پیشنهادهای پژوهشی آینده شامل سنجش نورپردازی و رنگ، نقش میانجی تجربه مشتری، تکرار در شهرها و برندهای دیگر و روش‌های پیشرفته‌تر. محدودیت‌ها: ابزار پرسشنامه، پاسخ‌دهندگان، مکان، منابع و روش همبستگی.",
    "جمع‌بندی: شاخص‌های کلیدی ۲۴۵ نفر جامعه، ۱۵۰ نمونه، آلفای ۰٫۹۲۲ و همبستگی ۰٫۷۷۵؛ پیام کلیدی این است که طراحی هدفمند محیط فروشگاه اهرمی اثربخش برای ارتقای فروش است.",
    "از توجه استاد راهنمای محترم و داوران گرامی سپاسگزارم؛ آماده دریافت پرسش‌ها و دیدگاه‌های ارزشمند هستم.",
]


def build_pptx(path):
    prs = Presentation()
    prs.slide_width = Inches(12.8)
    prs.slide_height = Inches(7.5)
    cp = prs.core_properties
    cp.title = "بررسی تأثیر عملکرد بازارپردازی در ارتقای فروش (فروشگاه‌های دوو اهواز)"
    cp.subject = "پایان‌نامهٔ کارشناسی ارشد مدیریت بازرگانی (بازاریابی) — جلسهٔ دفاع"
    cp.author = "بابک مرادوند"
    cp.keywords = "بازارپردازی؛ مرچندایزینگ؛ ارتقای فروش؛ فروشگاه‌های دوو؛ اسپیرمن"
    cp.category = "پایان‌نامهٔ کارشناسی ارشد"
    for i, fn in enumerate(SLIDES):
        sl = PptxSlide(prs)
        fn(sl)
        sl.s.notes_slide.notes_text_frame.text = NOTES[i]
    prs.save(path)
    print("PPTX saved:", path)


def build_qa(outdir):
    os.makedirs(outdir, exist_ok=True)
    for i, fn in enumerate(SLIDES, 1):
        sl = QASlide()
        fn(sl)
        sl.save(os.path.join(outdir, f"s{i:02d}.png"))
    print("QA renders saved:", outdir)


if __name__ == "__main__":
    build_qa(os.path.join(BASE, "qa", "slides"))
    build_pptx(os.path.join(BASE, "دفاع_بازارپردازی_دوو_بابک_مرادوند.pptx"))
    build_pptx(os.path.join(BASE, "Thesis_Defense_Merchandising_Daewoo_BabakMoradvand.pptx"))
