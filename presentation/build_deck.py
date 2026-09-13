# -*- coding: utf-8 -*-
"""ساخت ۲۲ اسلاید دفاع کارشناسی ارشد — موضوع: تأثیر بازارپردازی بر فروش دوو (اهواز)."""
import os
from deck_lib import *

# ستون‌های استاندارد RTL
CW = CX1 - CX0                      # 10.64
C3 = (CW - 2 * 0.20) / 3            # سه ستونه
C4 = (CW - 3 * 0.16) / 4            # چهار ستونه
C2 = (CW - 0.18) / 2
X3 = [CX1 - C3 * (i + 1) - 0.20 * i for i in range(3)]
X4 = [CX1 - C4 * (i + 1) - 0.16 * i for i in range(4)]
X2 = [CX1 - C2 * (i + 1) - 0.18 * i for i in range(2)]
P = lambda n: os.path.join(PROC, n)


def hline_dots(s, x, y, w, text, size=12, color=INK, dot=TEAL, h=0.9):
    return bullet(s, x, y, w, text, size=size, color=color, dot=dot)


# ================================================================= اسلاید ۱
def s01(s):
    s.bg_image(P("bg_title.png"))
    draw_timeline(s, 1, dark=True)
    draw_footer(s, 1, dark=True)
    s.text(6.35, 0.56, 5.78, 0.34, "دانشگاه پیام نور — واحد جویبار", size=15,
           role="lotus", color=GOLD_L, align="r")
    s.text(6.35, 0.94, 5.78, 0.28, "دانشکدهٔ مدیریت، اقتصاد و حسابداری",
           size=11, role="zar", color=IVORY_T, align="r")
    s.line(9.82, 2.09, 9.38, 2.09, color=GOLD, w=1.8)
    s.text(9.92, 1.94, 2.21, 0.3, "پایان‌نامهٔ کارشناسی ارشد", size=11.5,
           role="lotus", color=TEAL_T, align="r", spacing=1.4)
    s.text(6.35, 2.40, 5.78, 1.45,
           "بررسی تأثیر بازارپردازی بر ارتقای فروش محصولات شرکت دوو",
           size=28.5, role="titr", color=WHITE, align="r", ls=1.28)
    s.text(6.35, 3.92, 5.78, 0.62,
           "موردمطالعه: فروشگاه‌های لوازم خانگی شرکت دوو در شهر اهواز",
           size=13.5, role="lotus", color=GOLD_L, align="r", ls=1.4)
    s.line(12.13, 4.55, 9.05, 4.55, color=(116, 130, 146), w=1.0)
    rows = [
        ("دانشجو", "بابک مرادوند", False),
        ("استاد راهنما", "دکتر رمضان غلامی اواتی", False),
        ("استاد مشاور", "[در صورت وجود، نام استاد مشاور درج شود]", True),
        ("مقطع تحصیلی", "کارشناسی ارشد", False),
        ("رشتهٔ تحصیلی", "[نام رشته درج شود]", True),
        ("تاریخ دفاع", "[تاریخ جلسهٔ دفاع درج شود]", True),
    ]
    y = 4.82
    for label, value, ph in rows:
        s.text(10.55, y, 1.58, 0.32, label + " :", size=10.5, role="zar",
               color=(178, 186, 196), align="r", valign="m")
        s.text(6.35, y, 4.05, 0.32, value, size=12, role="lotus",
               color=(GOLD_L if ph else WHITE), align="r", valign="m")
        y += 0.362


# ================================================================= اسلاید ۲
def s02(s):
    chrome(s, 1, 1, "عنوان و معرفی پژوهش", "نقشهٔ مسیر ارائه", 2)
    xs, cw = X4, C4
    ys = [1.60, 2.96, 4.32, 5.68]
    for i in range(16):
        r, c = divmod(i, 4)
        x, y, w, h = xs[c], ys[r], cw, 1.20
        active = (i == 0)
        if active:
            card(s, x, y, w, h, fill=NAVY, line=NAVY, shadow=True)
            s.line(x + w - 0.9, y + 0.22, x + 0.3, y + 0.22, color=GOLD, w=1.4)
            ncol, lcol = GOLD_L, WHITE
        else:
            card(s, x, y, w, h, fill=CARD, line=HAIR2)
            ncol, lcol = TEAL_D, NAVY
        s.text(x + 0.1, y + 0.16, w - 0.2, 0.34, fa(i + 1), size=15,
               role="titr", color=ncol, align="r", ls=1.0)
        s.text(x + 0.14, y + 0.60, w - 0.28, 0.5, TL[i], size=10.2,
               role="lotus", color=lcol, align="c", valign="m", ls=1.25)


# ================================================================= اسلاید ۳
def s03(s):
    chrome(s, 2, 2, "کلیات پژوهش", "مقدمه", 3)
    s.image(P("c_merch.png"), 1.85, 1.62, 4.15, 3.05)
    s.rect(1.85, 4.74, 4.15, 1.04, fill=NAVY, radius=0.12, shadow=True)
    s.text(2.05, 4.86, 3.75, 0.3, "بازارپردازی (Merchandising)", size=11,
           role="lotus", color=GOLD_L, align="r")
    s.text(2.05, 5.18, 3.75, 0.5, "استفاده از همهٔ عناصر محیط فروشگاه برای "
           "معرفی و برجسته‌سازی محصول در نقطهٔ خرید.", size=9.8, role="zar",
           color=IVORY_T, align="r", ls=1.4)
    bullets = [
        "تبلیغات نوآورانه، هدفمند و متناسب با شرایط روز، از عوامل مؤثر بر "
        "شکل‌گیری قصد خرید و تغییر تصمیم مصرف‌کننده است.",
        "اجرای صحیح تبلیغات، تثبیت جایگاه برند و شکل‌گیری ذهنیت مثبت و "
        "ماندگار مشتریان را در پی دارد.",
        "با پیچیده‌تر شدن فرایند خرید و تغییر انتظارات مشتریان، سازمان‌ها "
        "به راهکارهای نوین و اثربخش بازاریابی نیاز دارند.",
        "این پژوهش رابطهٔ بازارپردازی و میزان فروش را در فروشگاه‌های "
        "لوازم خانگی شرکت دوو در اهواز بررسی می‌کند.",
    ]
    y = 1.72
    for b in bullets:
        h = hline_dots(s, 6.50, y, 5.86, b, size=11.8)
        y += max(0.74, h) + 0.14
    # نوار KPI پایین
    items = [("۳ مؤلفهٔ مستقل", "اقلام تبلیغاتی · سازماندهی · چیدمان"),
             ("۱ متغیر وابسته", "میزان فروش محصولات شرکت دوو"),
             ("بستر مطالعه", "فروشگاه‌های لوازم خانگی دوو ـ اهواز")]
    kw = (CW - 2 * 0.16) / 3
    for i, (t1, t2) in enumerate(items):
        x = CX1 - kw * (i + 1) - 0.16 * i
        card(s, x, 6.00, kw, 0.80, fill=SOFT, line=HAIR2, shadow=False)
        s.text(x + 0.12, 6.08, kw - 0.24, 0.28, t1, size=10.5, role="lotus",
               color=TEAL_D, align="c")
        s.text(x + 0.12, 6.40, kw - 0.24, 0.32, t2, size=9.2, role="zar",
               color=MUTE, align="c")


# ================================================================= اسلاید ۴
def s04(s):
    chrome(s, 3, 3, "بیان مسئله", "مسئلهٔ اصلی پژوهش", 4)
    s.image(P("c_choice.png"), 1.85, 1.58, 3.45, 5.05)
    top = [
        "الگوهای رفتاری و سطح انتظارات مصرف‌کنندگان تغییر کرده و فرایند "
        "خرید پیچیده‌تر شده است.",
        "جایگاه رقابتی برند به‌طور فزاینده‌ای به طراحی و مدیریت محیط "
        "فروشگاه وابسته شده است.",
    ]
    y = 1.62
    for t in top:
        h = hline_dots(s, 5.70, y, 6.66, t, size=12)
        y += max(0.66, h) + 0.10
    ivs = [
        ("۱", "استقرار هدفمند اقلام تبلیغاتی در محیط فروشگاه"),
        ("۲", "سازماندهی و اثربخشی فعالیت‌های بازارپردازی"),
        ("۳", "نحوهٔ چیدمان و جانمایی بهینهٔ محصولات"),
    ]
    y = 3.12
    for n, t in ivs:
        card(s, 5.70, y, 6.66, 0.72, fill=CARD, line=HAIR2)
        s.ellipse(11.78, y + 0.15, 0.42, 0.42, fill=NAVY)
        s.text(11.78, y + 0.13, 0.42, 0.42, n, size=12.5, role="titr",
               color=GOLD_L, align="c", valign="m", ls=1.0)
        s.text(6.0, y, 5.62, 0.72, t, size=11.6, role="zar", color=INK,
               align="r", valign="m", ls=1.3)
        y += 0.84
    s.rect(5.70, 5.78, 6.66, 0.92, fill=NAVY, radius=0.12, shadow=True)
    s.rect(12.26, 5.78, 0.10, 0.92, fill=GOLD, radius=0.04, shadow=False)
    s.text(5.95, 5.78, 6.10, 0.92,
           "پرسش محوری: آیا این سه مؤلفه بر میزان فروش محصولات شرکت دوو "
           "اثر مثبت و معنادار دارند؟", size=12, role="lotus", color=WHITE,
           align="c", valign="m", ls=1.35)


# ================================================================= اسلاید ۵
def s05(s):
    chrome(s, 4, 4, "اهمیت و ضرورت پژوهش", "چرا این پژوهش؟", 5)
    # دو کارت بزرگ
    cards = [
        (X2[0], C2, "ضرورت اجرایی برای صنعت و برند", [
            "تثبیت جایگاه برند در ذهن مشتری",
            "ایجاد ارتباط مؤثر با طیف گسترده‌ای از مشتریان",
            "معرفی مطلوب محصولات جدید",
            "برجسته‌سازی قابلیت‌ها و مزیت‌های رقابتی",
            "ایجاد و تقویت ذهنیت مثبت، ماندگار و مطلوب نسبت به برند",
        ], NAVY, GOLD_L),
        (X2[1], C2, "ضرورت علمی و تصمیم‌سازی", [
            "سنجش هم‌زمان سه مؤلفهٔ بازارپردازی و رابطهٔ آن‌ها با فروش",
            "فراهم‌کردن شواهد تجربی برای فروشگاه‌های دوو در اهواز",
            "مبنای داده برای تصمیم مدیران فروش و بازاریابی",
            "پایه‌ای برای پژوهش‌های تکمیلی در صنعت لوازم خانگی",
        ], TEAL, WHITE),
    ]
    for x, w, title, items, head, hc in cards:
        card(s, x, 1.58, w, 4.02, fill=CARD)
        s.rect(x, 1.58, w, 0.56, fill=head, radius=0.12, shadow=False)
        s.rect(x, 1.90, w, 0.24, fill=head, shadow=False)
        s.text(x + 0.2, 1.58, w - 0.4, 0.56, title, size=12.5, role="lotus",
               color=hc, align="c", valign="m")
        y = 2.34
        for it in items:
            s.rect(x + w - 0.30, y + 0.075, 0.085, 0.085, fill=GOLD,
                   radius=0.02, shadow=False)
            hh = s.text(x + 0.28, y, w - 0.62, 0.6, it, size=11, role="zar",
                        color=INK, ls=1.35)
            y += max(0.46, hh) + 0.115
    # نوار پایین
    info = [("گروه کالایی", "لوازم خانگی"),
            ("موردمطالعه", "فروشگاه‌های دوو ـ شهر اهواز"),
            ("چارچوب متغیرها", "۳ متغیر مستقل + ۱ متغیر وابسته")]
    kw = (CW - 2 * 0.16) / 3
    for i, (a, b) in enumerate(info):
        x = CX1 - kw * (i + 1) - 0.16 * i
        card(s, x, 5.86, kw, 0.92, fill=SOFT, line=HAIR2, shadow=False)
        s.text(x + 0.1, 6.0, kw - 0.2, 0.3, a, size=10, role="lotus",
               color=MUTE, align="c")
        s.text(x + 0.1, 6.32, kw - 0.2, 0.36, b, size=11.5, role="titr",
               color=NAVY, align="c")


# ================================================================= اسلاید ۶
def s06(s):
    chrome(s, 5, 5, "اهداف و فرضیه‌ها (۱)", "اهداف پژوهش", 6)
    # هدف اصلی
    s.rect(CX0, 1.58, CW, 1.42, fill=NAVY, radius=0.14, shadow=True)
    tag(s, CX1 - 1.62, 1.78, 1.42, "هدف اصلی", fill=GOLD, tx=NAVY, h=0.34)
    s.text(CX0 + 0.4, 2.20, CW - 0.8, 0.66,
           "بررسی تأثیر عملکرد بازارپردازی بر ارتقای فروش فروشگاه‌های "
           "شرکت دوو در شهر اهواز.", size=15, role="lotus", color=WHITE,
           align="c", valign="m", ls=1.4)
    # اهداف فرعی
    subs = [
        (1, "تعیین رابطهٔ بین استقرار هدفمند اقلام تبلیغاتی در محیط و "
            "میزان فروش محصولات شرکت دوو."),
        (2, "تعیین رابطهٔ بین سازماندهی و اثربخشی فعالیت‌های "
            "بازارپردازی و میزان فروش محصولات شرکت دوو."),
        (3, "تعیین رابطهٔ بین نحوهٔ چیدمان و جانمایی بهینهٔ محصولات و "
            "میزان فروش محصولات شرکت دوو."),
    ]
    y = 3.42
    for n, t in subs:
        x = X3[n - 1]
        card(s, x, y, C3, 2.72, fill=CARD)
        s.ellipse(x + C3 / 2 - 0.30, 3.66, 0.60, 0.60, fill=TEAL)
        s.text(x + C3 / 2 - 0.30, 3.64, 0.60, 0.60, fa(n), size=17,
               role="titr", color=WHITE, align="c", valign="m", ls=1.0)
        s.text(x + 0.14, 4.38, C3 - 0.28, 0.3, f"هدف فرعی {fa(n)}",
               size=10.5, role="lotus", color=GOLD, align="c")
        s.text(x + 0.24, 4.72, C3 - 0.48, 1.3, t, size=11.3, role="zar",
               color=INK, align="c", valign="t", ls=1.5)
    s.text(CX0, 6.42, CW, 0.3,
           "هر هدف فرعی، متناظر با یکی از سه مؤلفهٔ بازارپردازی است.",
           size=10, role="zar_r", color=MUTE, align="c")


# ================================================================= اسلاید ۷
def s07(s):
    chrome(s, 5, 5, "اهداف و فرضیه‌ها (۲)", "فرضیه‌های پژوهش", 7)
    s.rect(CX0, 1.58, CW, 1.26, fill=NAVY, radius=0.14, shadow=True)
    tag(s, CX1 - 1.78, 1.76, 1.58, "فرضیهٔ اصلی", fill=GOLD, tx=NAVY, h=0.34)
    s.text(CX0 + 0.4, 2.16, CW - 0.8, 0.56,
           "بازارپردازی تأثیر مثبت و معناداری بر ارتقای فروش محصولات "
           "شرکت دوو دارد.", size=14.5, role="lotus", color=WHITE,
           align="c", valign="m", ls=1.4)
    subs = [
        (1, "بین استقرار هدفمند اقلام تبلیغاتی در محیط و میزان فروش "
            "محصولات شرکت دوو رابطهٔ مثبت و معنادار وجود دارد."),
        (2, "بین سازماندهی و اثربخشی فعالیت‌های بازارپردازی و میزان "
            "فروش محصولات شرکت دوو رابطهٔ مثبت و معنادار وجود دارد."),
        (3, "بین نحوهٔ چیدمان و جانمایی بهینهٔ محصولات و میزان فروش "
            "محصولات شرکت دوو رابطهٔ مثبت و معنادار وجود دارد."),
    ]
    y = 3.20
    for n, t in subs:
        x = X3[n - 1]
        card(s, x, y, C3, 2.34, fill=CARD)
        s.text(x + 0.22, y + 0.18, 0.9, 0.34, f"ف{fa(n)}", size=13,
               role="titr", color=TEAL_D, align="l")
        s.text(x + 0.2, y + 0.58, C3 - 0.4, 1.25, t, size=11, role="zar",
               color=INK, align="c", valign="t", ls=1.45)
        tag(s, x + C3 / 2 - 0.98, y + 1.84, 1.96, "رابطهٔ مثبت و معنادار",
            fill=(232, 242, 242), tx=TEAL_D, size=8.8, h=0.32)
    s.rect(CX0 + 3.0, 5.86, CW - 6.0, 0.62, fill=SOFT, line=HAIR2,
           radius=0.31, shadow=False)
    s.text(CX0 + 3.0, 5.86, CW - 6.0, 0.62,
           "آزمون آماری فرضیه‌ها: ضریب همبستگی اسپیرمن (نرم‌افزار SPSS)",
           size=10.5, role="lotus", color=NAVY, align="c", valign="m")


# ================================================================= اسلاید ۸
def s08(s):
    chrome(s, 6, 6, "مبانی نظری و پیشینه (۱)", "مدل مفهومی پژوهش", 8)
    # متغیر وابسته
    s.rect(CX0, 1.95, 3.05, 4.0, fill=NAVY, radius=0.14, shadow=True)
    s.text(1.92, 2.30, 2.65, 0.3, "متغیر وابسته", size=11, role="lotus",
           color=GOLD_L, align="c")
    s.line(2.62, 2.72, 3.92, 2.72, color=(80, 100, 122), w=0.8)
    s.text(1.92, 3.15, 2.65, 1.1, "میزان فروش", size=22, role="titr",
           color=WHITE, align="c", valign="m", ls=1.2)
    s.text(1.92, 4.45, 2.65, 0.7, "محصولات شرکت دوو\n(فروشگاه‌های اهواز)",
           size=11, role="zar", color=IVORY_T, align="c", ls=1.5)
    # متغیرهای مستقل
    s.text(8.0, 1.58, 4.36, 0.3, "متغیرهای مستقل — بازارپردازی",
           size=11.5, role="lotus", color=TEAL_D, align="r")
    ivs = [
        (1, "استقرار هدفمند اقلام تبلیغاتی در محیط"),
        (2, "سازماندهی و اثربخشی فعالیت‌های بازارپردازی"),
        (3, "نحوهٔ چیدمان و جانمایی بهینهٔ محصولات"),
    ]
    ys = [1.95, 3.32, 4.69]
    for n, t in ivs:
        y = ys[n - 1]
        card(s, 8.0, y, 4.36, 1.20, fill=CARD)
        s.ellipse(11.86, y + 0.39, 0.42, 0.42, fill=TEAL)
        s.text(11.86, y + 0.37, 0.42, 0.42, fa(n), size=12, role="titr",
               color=WHITE, align="c", valign="m", ls=1.0)
        s.text(8.2, y, 3.5, 1.20, t, size=11.5, role="zar", color=INK,
               align="r", valign="m", ls=1.4)
        s.arrow_line(7.95, y + 0.60, 4.92, y + 0.60, color=GOLD, w=1.7)
    s.text(CX0, 6.25, CW, 0.3,
           "مدل مفهومی: اثر هم‌زمان سه مؤلفهٔ بازارپردازی بر میزان فروش.",
           size=9.8, role="zar_r", color=MUTE, align="c")


# ================================================================= اسلاید ۹
def s09(s):
    chrome(s, 6, 6, "مبانی نظری و پیشینه (۲)", "پیشینه و شکاف پژوهشی", 9)
    # سه مرحله مرور
    stages = ["مفاهیم و مبانی نظری بازارپردازی",
              "مطالعات تجربی پیشین (داخلی و خارجی)",
              "مدل مفهومی پژوهش حاضر"]
    cw = (CW - 2 * 0.12) / 3
    for i, t in enumerate(stages):
        x = CX1 - cw * (i + 1) - 0.12 * i
        fill = NAVY if i == 2 else (234, 238, 241)
        tc = WHITE if i == 2 else NAVY
        s.chevron(x, 1.55, cw, 0.80, fill, flip_h=True)
        s.text(x + 0.28, 1.55, cw - 0.5, 0.80, f"گام {fa(i + 1)}", size=8.5,
               role="lotus", color=(GOLD_L if i == 2 else TEAL_D),
               align="c", valign="t")
        s.text(x + 0.30, 1.72, cw - 0.58, 0.55, t, size=9.6, role="zar",
               color=tc, align="c", valign="m", ls=1.25)
    # جدول پیشینه
    cols = [("پژوهشگر", 1.9), ("سال", 0.85), ("جامعه / صنعت", 2.1),
            ("یافتهٔ کلیدی", 3.3), ("هم‌خوانی با پژوهش حاضر", 2.49)]
    tx, ty = CX0, 2.62
    rh = 0.62
    x = CX1
    for name, w in cols:
        x -= w
        s.rect(x, ty, w, 0.44, fill=NAVY, line=NAVY, radius=0.001,
               shadow=False)
        s.text(x + 0.06, ty, w - 0.12, 0.44, name, size=9.8, role="lotus",
               color=WHITE, align="c", valign="m")
    for r in range(3):
        y = ty + 0.44 + r * rh
        x = CX1
        for ci, (name, w) in enumerate(cols):
            x -= w
            s.rect(x, y, w, rh, fill=CARD if r % 2 == 0 else SOFT,
                   line=HAIR2, lw=0.75, radius=0.001, shadow=False)
            if name == "یافتهٔ کلیدی":
                s.text(x + 0.1, y, w - 0.2, rh, "[یافتهٔ کلیدی از منبع درج شود]",
                       size=8.8, role="zar_r", color=(165, 140, 95),
                       align="c", valign="m")
            elif name == "هم‌خوانی با پژوهش حاضر":
                s.text(x + 0.1, y, w - 0.2, rh, "[مقایسه شود]", size=8.8,
                       role="zar_r", color=(165, 140, 95), align="c",
                       valign="m")
    # شکاف پژوهشی
    card(s, CX0, 5.02, CW, 1.72, fill=CARD)
    tag(s, CX1 - 1.62, 5.20, 1.42, "شکاف پژوهشی", fill=TEAL, tx=WHITE,
        h=0.32, size=9.5)
    s.text(CX0 + 0.35, 5.62, CW - 2.1, 0.5,
           "این پژوهش هر سه مؤلفهٔ بازارپردازی را به‌صورت هم‌زمان در "
           "فروشگاه‌های لوازم خانگی شرکت دوو در اهواز می‌سنجد.",
           size=11.2, role="zar", color=INK, align="r", ls=1.4)
    s.text(CX0 + 0.35, 6.16, CW - 0.7, 0.4,
           "[جملهٔ دقیق شکاف پژوهشی، بر اساس مرور منابع فصل ۲ درج شود]",
           size=9.8, role="zar_r", color=PH_TX, align="r")


# ================================================================ اسلاید ۱۰
def s10(s):
    chrome(s, 7, 7, "روش‌شناسی پژوهش", "طرح کلی و روش تحقیق", 10)
    chips = [("نوع پژوهش از نظر هدف", "کاربردی"),
             ("روش گردآوری داده", "توصیفی از نوع همبستگی"),
             ("ابزار تحلیل", "نرم‌افزار SPSS")]
    for i, (a, b) in enumerate(chips):
        x = X3[i]
        card(s, x, 1.55, C3, 0.98, fill=CARD)
        s.text(x + 0.12, 1.68, C3 - 0.24, 0.26, a, size=9.5, role="zar_r",
               color=MUTE, align="c")
        s.text(x + 0.12, 1.96, C3 - 0.24, 0.42, b, size=13.5, role="titr",
               color=NAVY, align="c", valign="m")
    # پنج گام
    steps = ["تعریف متغیرها و مدل", "تأیید روایی پرسشنامه",
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
    card(s, 6.55, 4.10, 5.81, 2.62, fill=CARD)
    s.text(6.85, 4.30, 5.2, 0.3, "مسیر تجزیه‌وتحلیل داده‌ها", size=12.5,
           role="lotus", color=NAVY, align="r")
    items = [
        "بررسی نرمال بودن توزیع داده‌ها با آزمون کولموگروف–اسمیرنوف.",
        "نتایج آزمون K-S از نرمال بودن همهٔ مؤلفه‌ها حکایت داشت.",
        "آزمون فرضیه‌ها با محاسبهٔ ضریب همبستگی اسپیرمن در SPSS.",
        "قضاوت دربارهٔ فرضیه‌ها بر اساس سطح معناداری به‌دست‌آمده.",
    ]
    y = 4.72
    for it in items:
        s.rect(12.10, y + 0.075, 0.085, 0.085, fill=TEAL, radius=0.02,
               shadow=False)
        hh = s.text(6.85, y, 5.10, 0.5, it, size=10.2, role="zar",
                    color=INK, ls=1.3)
        y += max(0.42, hh) + 0.07


# ================================================================ اسلاید ۱۱
def s11(s):
    chrome(s, 8, 8, "جامعه و نمونهٔ آماری", "جامعه، نمونه و روش نمونه‌گیری", 11)
    kpis = [("۲۴۵ نفر", "جامعهٔ آماری", None),
            ("۱۵۰", "پرسشنامهٔ توزیع‌شده", "حجم نمونه بر اساس جدول مورگان"),
            ("ترکیبی", "روش نمونه‌گیری", "تصادفی طبقه‌ای + خوشه‌ای")]
    for i, (num, lab, sub) in enumerate(kpis):
        x = X3[i]
        kpi(s, x, 1.55, C3, 1.40, num, lab, sub=sub,
            num_size=(26 if i != 2 else 21))
    # نمودار جریان نمونه‌گیری
    s.rect(9.15, 3.40, 3.21, 1.72, fill=NAVY, radius=0.14, shadow=True)
    s.text(9.35, 3.60, 2.81, 0.28, "جامعهٔ آماری", size=10.5, role="lotus",
           color=GOLD_L, align="c")
    s.text(9.35, 3.92, 2.81, 0.55, "۲۴۵ نفر", size=24, role="titr",
           color=WHITE, align="c", valign="m")
    s.text(9.35, 4.55, 2.81, 0.4, "[ویژگی‌های تفصیلی جامعه]", size=8.6,
           role="zar_r", color=(168, 178, 190), align="c")
    s.text(5.72, 3.06, 2.80, 0.26, "روش نمونه‌گیری ترکیبی (احتمالی)",
           size=10, role="lotus", color=TEAL_D, align="c")
    s.rect(5.72, 3.40, 2.80, 0.80, fill=CARD, line=HAIR2, radius=0.10)
    s.text(5.84, 3.40, 2.56, 0.80, "نمونه‌گیری تصادفی طبقه‌ای",
           size=10.8, role="zar", color=INK, align="c", valign="m")
    s.rect(5.72, 4.32, 2.80, 0.80, fill=CARD, line=HAIR2, radius=0.10)
    s.text(5.84, 4.32, 2.56, 0.80, "نمونه‌گیری تصادفی خوشه‌ای",
           size=10.8, role="zar", color=INK, align="c", valign="m")
    s.rect(1.72, 3.40, 3.21, 1.72, fill=TEAL, radius=0.14, shadow=True)
    s.text(1.92, 3.60, 2.81, 0.28, "نمونهٔ آماری", size=10.5, role="lotus",
           color=(224, 245, 244), align="c")
    s.text(1.92, 3.92, 2.81, 0.55, "۱۵۰ پرسشنامه", size=22, role="titr",
           color=WHITE, align="c", valign="m")
    s.text(1.92, 4.55, 2.81, 0.4, "توزیع میان نمونه‌های منتخب", size=9,
           role="zar_r", color=(220, 235, 235), align="c")
    s.arrow_line(9.08, 4.26, 8.62, 4.26, color=GOLD, w=1.8)
    s.arrow_line(5.64, 4.26, 5.02, 4.26, color=GOLD, w=1.8)
    placeholder_card(s, CX0, 5.52, CW, 1.12,
                     "[معیارهای طبقه‌بندی طبقات و خوشه‌ها و ویژگی‌های "
                     "تفصیلی جامعه بر اساس فصل ۳ تکمیل شود]", size=10)


# ================================================================ اسلاید ۱۲
def s12(s):
    chrome(s, 9, 9, "ابزار و روش گردآوری داده‌ها", "ابزار، روایی و پایایی", 12)
    # کارت گیج پایایی
    card(s, CX0, 1.55, 4.05, 5.18, fill=CARD)
    d = 2.55
    gx = CX0 + (4.05 - d) / 2
    s.ellipse(gx, 1.92, d, d, fill=None, line=HAIR, lw=8)
    s.arc_gauge(gx, 1.92, d, -90, -90 + 360 * 0.922, color=TEAL, lw=0.13)
    s.text(gx, 2.78, d, 0.7, "۰/۹۲۲", size=34, role="titr", color=NAVY,
           align="c", valign="m", ls=1.0)
    s.text(gx, 3.46, d, 0.3, "ضریب آلفای کرونباخ", size=10.5, role="lotus",
           color=INK, align="c")
    s.text(CX0 + 0.25, 4.66, 3.55, 0.3, "پایایی پرسشنامه", size=13,
           role="lotus", color=NAVY, align="c")
    s.text(CX0 + 0.25, 5.00, 3.55, 0.28, "محاسبه‌شده در نرم‌افزار SPSS",
           size=9.8, role="zar_r", color=MUTE, align="c")
    tag(s, CX0 + 4.05 / 2 - 0.55, 5.55, 1.10, "۹۲٫۲٪", fill=TEAL,
        tx=WHITE, h=0.38, size=12)
    s.text(CX0 + 0.25, 6.16, 3.55, 0.3,
           "مقدار بزرگ‌تر از ۰/۷ → پایایی مطلوب و قابل‌اعتماد",
           size=8.8, role="zar_r", color=MUTE, align="c")
    # کارت‌های راست
    rx, rw = 6.05, 6.31
    card(s, rx, 1.55, rw, 1.50, fill=CARD)
    tag(s, rx + rw - 1.55, 1.72, 1.35, "ابزار گردآوری", fill=NAVY,
        tx=GOLD_L, h=0.30, size=9.2)
    s.text(rx + 0.25, 2.06, rw - 0.5, 0.4, "پرسشنامه", size=18,
           role="titr", color=NAVY, align="r")
    s.text(rx + 0.25, 2.52, rw - 0.5, 0.4,
           "[تعداد گویه‌ها، طیف پاسخ (مانند لیکرت) و جزئیات آن بر اساس "
           "فصل ۳ درج شود]", size=9.3, role="zar_r", color=PH_TX,
           align="r", ls=1.3)
    card(s, rx, 3.20, rw, 1.50, fill=CARD)
    tag(s, rx + rw - 1.35, 3.37, 1.15, "روایی", fill=NAVY, tx=GOLD_L,
        h=0.30, size=9.2)
    s.text(rx + 0.25, 3.72, rw - 0.5, 0.75,
           "روایی پرسشنامه با نظر استاد راهنما، استاد مشاور و خبرگان "
           "صنعت بررسی و تأیید شد.", size=11.3, role="zar", color=INK,
           align="r", valign="m", ls=1.5)
    card(s, rx, 4.85, rw, 1.88, fill=CARD)
    tag(s, rx + rw - 1.85, 5.02, 1.65, "نرمال‌بودن داده‌ها", fill=NAVY,
        tx=GOLD_L, h=0.30, size=9.2)
    s.text(rx + 0.25, 5.42, rw - 0.5, 0.36,
           "آزمون کولموگروف–اسمیرنوف (K-S)", size=13.5, role="titr",
           color=NAVY, align="r")
    tag(s, rx + rw / 2 - 1.95, 5.95, 3.90,
        "نتیجه: نرمال بودن تمامی مؤلفه‌های پژوهش", fill=(232, 242, 242),
        tx=TEAL_D, h=0.38, size=10.5)


# ================================================================ اسلاید ۱۳
def s13(s):
    chrome(s, 9, 9, "ابزار و روش گردآوری داده‌ها", "متغیرها و روش تحلیل", 13)
    cols = [("نوع", 1.30), ("متغیر", 5.60), ("نقش در مدل", 3.74)]
    ty, rh = 1.58, 0.74
    x = CX1
    for name, w in cols:
        x -= w
        s.rect(x, ty, w, 0.46, fill=NAVY, radius=0.001, shadow=False)
        s.text(x + 0.08, ty, w - 0.16, 0.46, name, size=10.5, role="lotus",
               color=WHITE, align="c", valign="m")
    rows = [
        ("مستقل", "استقرار هدفمند اقلام تبلیغاتی در محیط", "مؤلفهٔ ۱ بازارپردازی"),
        ("مستقل", "سازماندهی و اثربخشی فعالیت‌های بازارپردازی", "مؤلفهٔ ۲ بازارپردازی"),
        ("مستقل", "نحوهٔ چیدمان و جانمایی بهینهٔ محصولات", "مؤلفهٔ ۳ بازارپردازی"),
        ("وابسته", "میزان فروش محصولات شرکت دوو", "متغیر پیامد"),
    ]
    for r, (typ, var, role) in enumerate(rows):
        y = ty + 0.46 + r * rh
        x = CX1
        widths = [w for _, w in cols]
        vals = [typ, var, role]
        for ci, (name, w) in enumerate(cols):
            x -= w
            s.rect(x, y, w, rh, fill=CARD if r % 2 == 0 else SOFT,
                   line=HAIR2, lw=0.75, radius=0.001, shadow=False)
        # متن‌ها
        xr = CX1
        for ci, val in enumerate(vals):
            w = widths[ci]; xr -= w
            if ci == 0:
                fillc = NAVY if typ == "وابسته" else TEAL
                tag(s, xr + w / 2 - 0.48, y + 0.19, 0.96, typ,
                    fill=fillc, tx=WHITE, h=0.36, size=10)
            elif ci == 1:
                s.text(xr + 0.18, y, w - 0.36, rh, val, size=10.8,
                       role="zar", color=INK, align="r", valign="m", ls=1.3)
            else:
                s.text(xr + 0.12, y, w - 0.24, rh, val, size=9.8,
                       role="zar_r", color=MUTE, align="c", valign="m")
    # دو کارت پایین
    card(s, X2[0], 5.14, C2, 1.60, fill=NAVY)
    s.text(X2[0] + 0.3, 5.28, C2 - 0.6, 0.3, "نتیجهٔ کلی آزمون‌ها",
           size=10.5, role="lotus", color=GOLD_L, align="r")
    s.text(X2[0] + 0.3, 5.62, C2 - 0.6, 1.0,
           "بر اساس نتایج اسپیرمن، بین متغیرهای پژوهش در تمامی فرضیه‌ها "
           "رابطه‌ای معنادار وجود دارد.", size=12, role="lotus",
           color=WHITE, align="r", ls=1.5, valign="t")
    card(s, X2[1], 5.14, C2, 1.60, fill=CARD)
    s.text(X2[1] + 0.3, 5.28, C2 - 0.6, 0.3, "روش آزمون فرضیه‌ها",
           size=10.5, role="lotus", color=TEAL_D, align="r")
    s.text(X2[1] + 0.3, 5.58, C2 - 0.6, 0.5, "ضریب همبستگی اسپیرمن",
           size=14, role="titr", color=NAVY, align="r")
    s.text(X2[1] + 0.3, 6.12, C2 - 0.6, 0.5,
           "محاسبه در SPSS و قضاوت بر اساس سطح معناداری (p-value).",
           size=9.6, role="zar_r", color=MUTE, align="r", ls=1.35)


# ================================================================ اسلاید ۱۴
def s14(s):
    chrome(s, 10, 10, "یافته‌های پژوهش (۱)", "نمای کلی یافته‌ها", 14)
    s.rect(CX0, 1.55, CW, 0.98, fill=NAVY, radius=0.14, shadow=True)
    tag(s, CX1 - 1.55, 1.86, 1.35, "یافتهٔ محوری", fill=GOLD, tx=NAVY,
        h=0.32, size=9.5)
    s.text(CX0 + 0.3, 1.55, CW - 2.1, 0.98,
           "نتایج آزمون اسپیرمن: میان متغیرهای پژوهش، در هر چهار فرضیه، "
           "رابطهٔ معنادار مشاهده شد.", size=13, role="lotus", color=WHITE,
           align="c", valign="m", ls=1.4)
    hyps = [
        ("فرضیهٔ اصلی", "بازارپردازی بر فروش"),
        ("فرضیهٔ فرعی ۱", "اقلام تبلیغاتی بر فروش"),
        ("فرضیهٔ فرعی ۲", "سازماندهی بر فروش"),
        ("فرضیهٔ فرعی ۳", "چیدمان بر فروش"),
    ]
    for i, (a, b) in enumerate(hyps):
        x = X4[i]
        card(s, x, 2.72, C4, 1.48, fill=CARD)
        s.text(x + 0.1, 2.86, C4 - 0.2, 0.24, a, size=8.8, role="zar_r",
               color=MUTE, align="c")
        s.text(x + 0.1, 3.12, C4 - 0.2, 0.34, b, size=10.8, role="lotus",
               color=NAVY, align="c")
        tag(s, x + C4 / 2 - 0.62, 3.56, 1.24, "معنادار ✓",
            fill=(232, 242, 242), tx=TEAL_D, h=0.30, size=9.2)
        s.text(x + 0.1, 3.90, C4 - 0.2, 0.24, "r = …    p = …", size=9,
               role="zar_r", color=(165, 140, 95), align="c")
    # چارچوب نمودار
    card(s, CX0, 4.38, CW, 2.38, fill=CARD)
    s.text(7.10, 4.55, 5.0, 0.26, "نمودار مقایسهٔ ضرایب همبستگی اسپیرمن",
           size=10.2, role="lotus", color=NAVY, align="r")
    tag(s, CX0 + 0.28, 4.53, 3.05, "مقادیر r دقیق از خروجی SPSS درج شود",
         fill=PH_BG, tx=PH_TX, h=0.30, size=8.4)
    ax_l, ax_r, ax_b, ax_t = 2.35, 12.05, 6.30, 4.95
    for g in range(4):
        gy = ax_b - g * (ax_b - ax_t) / 3
        s.line(ax_l, gy, ax_r, gy, color=HAIR2, w=0.75, dash=True)
    s.line(ax_l, ax_t, ax_l, ax_b, color=MUTE, w=1.1)
    s.line(ax_l, ax_b, ax_r, ax_b, color=MUTE, w=1.1)
    s.text(1.78, ax_t - 0.05, 0.55, 0.3, "r", size=10, role="lotus",
           color=MUTE, align="c")
    labels = ["بازارپردازی", "اقلام تبلیغاتی", "سازماندهی", "چیدمان"]
    n = 4; slot = (ax_r - ax_l - 0.5) / n
    for i in range(n):           # راست‌به‌چپ
        cx = ax_r - 0.25 - i * slot - slot / 2
        bw = 0.62
        s.rect(cx - bw / 2, ax_b - 1.05, bw, 1.05, fill=PH_BG, line=GOLD,
               lw=0.9, radius=0.05, shadow=False, dash=True)
        s.text(cx - 0.45, ax_b - 0.80, 0.9, 0.3, "[r]", size=9.5,
               role="lotus", color=PH_TX, align="c", valign="m")
        s.text(cx - 0.62, ax_b + 0.10, 1.24, 0.26, labels[i], size=8.6,
               role="zar", color=INK, align="c")


# ================================================================ اسلاید ۱۵
def s15(s):
    chrome(s, 10, 10, "یافته‌های پژوهش (۲)", "جدول نتایج آزمون فرضیه‌ها", 15)
    cols = [("فرضیه", 1.0), ("شرح فرضیه", 4.6), ("ضریب r اسپیرمن", 1.5),
            ("سطح معناداری p", 1.7), ("نتیجهٔ آزمون", 1.84)]
    ty, rh = 1.58, 0.78
    x = CX1
    for name, w in cols:
        x -= w
        s.rect(x, ty, w, 0.46, fill=NAVY, radius=0.001, shadow=False)
        s.text(x + 0.05, ty, w - 0.1, 0.46, name, size=9.4, role="lotus",
               color=WHITE, align="c", valign="m", ls=1.2)
    rows = [
        ("اصلی", "بازارپردازی بر ارتقای فروش محصولات شرکت دوو"),
        ("فرعی ۱", "استقرار اقلام تبلیغاتی در محیط بر میزان فروش"),
        ("فرعی ۲", "سازماندهی فعالیت‌های بازارپردازی بر میزان فروش"),
        ("فرعی ۳", "چیدمان و جانمایی بهینهٔ محصولات بر میزان فروش"),
    ]
    for r, (fn, desc) in enumerate(rows):
        y = ty + 0.46 + r * rh
        x = CX1
        for name, w in cols:
            x -= w
            s.rect(x, y, w, rh, fill=CARD if r % 2 == 0 else SOFT,
                   line=HAIR2, lw=0.75, radius=0.001, shadow=False)
        # مختصات ستون‌ها از راست
        x0 = CX1
        c = {}
        for nm, w in cols:
            x0 -= w; c[nm] = (x0, w)
        x_, w_ = c["فرضیه"]
        s.text(x_ + 0.05, y, w_ - 0.1, rh, fn, size=9.8, role="lotus",
               color=TEAL_D, align="c", valign="m")
        x_, w_ = c["شرح فرضیه"]
        s.text(x_ + 0.16, y, w_ - 0.32, rh, desc, size=10.2, role="zar",
               color=INK, align="r", valign="m", ls=1.3)
        for key in ("ضریب r اسپیرمن", "سطح معناداری p"):
            x_, w_ = c[key]
            s.text(x_ + 0.05, y, w_ - 0.1, rh, "[ درج ]", size=9,
                   role="zar_r", color=PH_TX, align="c", valign="m")
        x_, w_ = c["نتیجهٔ آزمون"]
        tag(s, x_ + w_ / 2 - 0.52, y + 0.20, 1.04, "تأیید شد",
            fill=TEAL, tx=WHITE, h=0.38, size=9.6)
    card(s, CX0, 5.30, CW, 1.42, fill=PH_BG, line=GOLD, lw=1.0, dash=True)
    s.text(CX0 + 0.35, 5.48, CW - 0.7, 0.3, "راهنمای جای‌گذاری داده‌ها",
           size=10.5, role="lotus", color=PH_TX, align="r")
    s.text(CX0 + 0.35, 5.82, CW - 0.7, 0.8,
           "ستون‌های ضریب همبستگی (r) و سطح معناداری (p) دقیقاً از "
           "جدول‌های خروجی SPSS در فصل ۴ استخراج و جای‌گذاری شوند؛ از درج "
           "اعداد تقریبی یا حدسی خودداری گردد. سطح خطای آزمون (آلفا) و علامت‌گذاری "
           "معناداری طبق رساله تنظیم شود.", size=9.8, role="zar",
           color=(110, 84, 36), align="r", ls=1.45)


# ================================================================ اسلاید ۱۶
def s16(s):
    chrome(s, 10, 10, "یافته‌های پژوهش (۳)", "یافته‌های توصیفی (چارچوب درج داده)", 16)
    # کارت جدول شاخص‌ها
    card(s, 6.95, 1.55, 5.41, 5.18, fill=CARD)
    s.text(7.2, 1.74, 4.9, 0.28, "جدول شاخص‌های توصیفی متغیرها",
           size=11.5, role="lotus", color=NAVY, align="r")
    hcols = ["شاخص", "اقلام تبلیغاتی", "سازماندهی", "چیدمان", "فروش"]
    hw = [1.0, 1.10, 1.10, 1.0, 1.21]
    ty = 2.18
    x = 12.36
    for nm, w in zip(hcols, hw):
        x -= w
        s.rect(x, ty, w, 0.62, fill=NAVY, radius=0.001, shadow=False)
        s.text(x + 0.03, ty, w - 0.06, 0.62, nm, size=8.2, role="lotus",
               color=WHITE, align="c", valign="m", ls=1.15)
    stats = ["میانگین", "انحراف معیار", "کمینه", "بیشینه"]
    for r, st in enumerate(stats):
        y = ty + 0.62 + r * 0.72
        x = 12.36
        for ci, (nm, w) in enumerate(zip(hcols, hw)):
            x -= w
            s.rect(x, y, w, 0.72,
                   fill=CARD if r % 2 == 0 else SOFT, line=HAIR2,
                   lw=0.7, radius=0.001, shadow=False)
            if ci == 0:
                s.text(x + 0.05, y, w - 0.1, 0.72, st, size=8.8,
                       role="zar", color=INK, align="c", valign="m")
            else:
                s.text(x + 0.05, y, w - 0.1, 0.72, "—", size=9.5,
                       role="zar_r", color=(180, 150, 100),
                       align="c", valign="m")
    placeholder_card(s, 7.2, 5.78, 4.92, 0.72,
                     "اعداد از جدول توصیفی SPSS فصل ۴ درج شود.", size=9.3)
    # نمودارهای جمعیت‌شناختی
    card(s, CX0, 1.55, 5.05, 2.48, fill=CARD)
    s.text(4.9, 1.72, 1.6, 0.5, "ویژگی‌های جمعیت‌شناختی نمونه",
           size=10.2, role="lotus", color=NAVY, align="r", ls=1.35,
           valign="m")
    s.ellipse(2.15, 1.95, 1.35, 1.35, fill=None, line=HAIR, lw=2.2)
    s.ellipse(2.15, 1.95, 1.35, 1.35, fill=None, line=GOLD, lw=2.2,
              ) if False else None
    s.arc_gauge(2.15, 1.95, 1.35, -90, 60, color=TEAL, lw=0.085)
    s.arc_gauge(2.15, 1.95, 1.35, 70, 180, color=GOLD, lw=0.085)
    s.text(2.15, 2.40, 1.35, 0.45, "[٪]", size=13, role="lotus",
           color=PH_TX, align="c", valign="m")
    s.text(2.0, 3.45, 2.2, 0.3, "جنسیت · سن · تحصیلات", size=8.8,
           role="zar_r", color=MUTE, align="c")
    card(s, CX0, 4.20, 5.05, 2.53, fill=CARD)
    s.text(CX0 + 0.25, 4.38, 4.5, 0.28, "سایر نمودارهای توصیفی فصل ۴",
           size=10.2, role="lotus", color=NAVY, align="r")
    ax_l, ax_r, ax_b, ax_t = 2.15, 6.2, 6.35, 4.9
    s.line(ax_l, ax_t, ax_l, ax_b, color=MUTE, w=1.0)
    s.line(ax_l, ax_b, ax_r, ax_b, color=MUTE, w=1.0)
    for i in range(5):
        cx = ax_r - 0.2 - i * 0.78 - 0.28
        s.rect(cx - 0.2, ax_b - 0.95 + i * 0.05, 0.4, 0.95 - i * 0.05,
               fill=PH_BG, line=GOLD, lw=0.9, radius=0.04, shadow=False,
               dash=True)
    s.text(CX0 + 0.25, 6.44, 4.5, 0.24,
           "[محورها و عناوین بر اساس خروجی فصل ۴ تنظیم شود]", size=8.4,
           role="zar_r", color=PH_TX, align="c")


# ================================================================ اسلاید ۱۷
def s17(s):
    chrome(s, 11, 11, "تحلیل و بحث (۱)", "پاسخ به فرضیه‌ها در یک نگاه", 17)
    s.rect(CX0, 1.55, CW, 1.05, fill=NAVY, radius=0.14, shadow=True)
    s.rect(CX0, 1.55, 0.10, 1.05, fill=GOLD, radius=0.04, shadow=False)
    s.text(CX0 + 0.35, 1.55, CW - 0.7, 1.05,
           "مهم‌ترین یافته: هر سه مؤلفهٔ بازارپردازی با میزان فروش رابطهٔ "
           "مثبت و معنادار دارند؛ هر چهار فرضیهٔ پژوهش تأیید شدند.",
           size=12.5, role="lotus", color=WHITE, align="c", valign="m",
           ls=1.45)
    cols = [("یافتهٔ پژوهش", 4.2), ("مقایسه با پیشینه", 3.5),
            ("تفسیر و دلیل", 2.94)]
    ty = 2.90
    x = CX1
    for nm, w in cols:
        x -= w
        s.rect(x, ty, w, 0.42, fill=TEAL_D, radius=0.001, shadow=False)
        s.text(x + 0.08, ty, w - 0.16, 0.42, nm, size=9.8, role="lotus",
               color=WHITE, align="c", valign="m")
    findings = [
        "اقلام تبلیغاتی: رابطهٔ مثبت و معنادار با فروش تأیید شد.",
        "سازماندهی فعالیت‌های بازارپردازی: رابطهٔ مثبت و معنادار تأیید شد.",
        "چیدمان و جانمایی محصولات: رابطهٔ مثبت و معنادار تأیید شد.",
    ]
    for r, fnd in enumerate(findings):
        y = ty + 0.50 + r * 1.0
        x = CX1
        for ci, (nm, w) in enumerate(cols):
            x -= w
            s.rect(x, y, w, 0.90, fill=CARD if r % 2 == 0 else SOFT,
                   line=HAIR2, lw=0.75, radius=0.001, shadow=False)
            if ci == 0:
                s.rect(x + w - 0.16, y + 0.16, 0.10, 0.10, fill=TEAL,
                       radius=0.02, shadow=False)
                s.text(x + 0.14, y, w - 0.38, 0.90, fnd, size=10,
                       role="zar", color=INK, align="r", valign="m", ls=1.35)
            elif ci == 1:
                s.text(x + 0.12, y, w - 0.24, 0.90,
                       "[با یافتهٔ پژوهش … مطابقت/تفاوت]", size=9,
                       role="zar_r", color=PH_TX, align="c", valign="m",
                       ls=1.3)
            else:
                s.text(x + 0.12, y, w - 0.24, 0.90,
                       "[تفسیر مبتنی بر فصل ۵]", size=9, role="zar_r",
                       color=PH_TX, align="c", valign="m", ls=1.3)
    s.text(CX0, 6.55, CW, 0.24,
           "در زمان درج متن فصل ۵، منابع هم‌خوان و ناهم‌خوان برای هر ردیف "
           "مشخص شوند.", size=8.8, role="zar_r", color=MUTE, align="c")


# ================================================================ اسلاید ۱۸
def s18(s):
    chrome(s, 11, 11, "تحلیل و بحث (۲)", "چارچوب تفسیر یافته‌ها", 18)
    s.text(CX0, 1.45, CW, 0.26,
           "چارچوب تفسیر — بر اساس بحث فصل ۵ ویرایش و تکمیل شود.",
           size=9.8, role="lotus", color=PH_TX, align="r")
    chain = ["اقدامات بازارپردازی در فروشگاه", "توجه و تجربهٔ مثبت مشتری",
             "شکل‌گیری قصد و تصمیم خرید", "ارتقای میزان فروش"]
    cw = (CW - 3 * 0.10) / 4
    for i, t in enumerate(chain):
        x = CX1 - cw * (i + 1) - 0.10 * i
        fill = TEAL if i == 3 else NAVY
        s.chevron(x, 1.85, cw, 1.02, fill, flip_h=True)
        s.text(x + 0.26, 1.85, cw - 0.55, 1.02, f"({fa(i + 1)})  {t}",
               size=9.8, role="zar", color=WHITE, align="c", valign="m",
               ls=1.3)
    blocks = [
        (X2[0], "سازگاری یافته‌ها با مبانی نظری", [
            "[انطباق با نظریه/مدل … در زمینهٔ اثر تبلیغات محیطی]",
            "[انطباق با نقش چیدمان در تصمیم خرید — از منابع فصل ۲]",
            "[سایر موارد هم‌خوان با پیشینهٔ نظری]",
        ]),
        (X2[1], "تبیین تفاوت‌های احتمالی با پیشینه", [
            "[تفاوت در شدت ضرایب و دلیل احتمالی آن]",
            "[نقش ویژگی‌های صنعت لوازم خانگی و بازار اهواز]",
            "[سایر موارد اختلاف و تبیین آن]",
        ]),
    ]
    for x, title, items in blocks:
        card(s, x, 3.20, C2, 3.50, fill=CARD)
        s.rect(x, 3.20, C2, 0.52, fill=NAVY, radius=0.12, shadow=False)
        s.rect(x, 3.50, C2, 0.22, fill=NAVY, shadow=False)
        s.text(x + 0.2, 3.20, C2 - 0.4, 0.52, title, size=11, role="lotus",
               color=GOLD_L, align="c", valign="m")
        y = 3.92
        for it in items:
            s.rect(x + C2 - 0.22, y + 0.08, 0.085, 0.085, fill=GOLD,
                   radius=0.02, shadow=False)
            hh = s.text(x + 0.26, y, C2 - 0.56, 0.7, it, size=9.8,
                        role="zar", color=PH_TX, ls=1.4)
            y += max(0.62, hh) + 0.18


# ================================================================ اسلاید ۱۹
def s19(s):
    chrome(s, 12, 12, "نتیجه‌گیری", "مهم‌ترین یافته‌ها", 19)
    s.image(P("c_close.png"), 1.85, 1.60, 2.95, 4.30)
    s.rect(5.20, 1.62, 7.16, 1.18, fill=NAVY, radius=0.14, shadow=True)
    tag(s, 5.42, 1.82, 1.18, "نتیجهٔ اصلی", fill=GOLD, tx=NAVY,
        h=0.32, size=9.2)
    s.text(6.80, 1.62, 5.36, 1.18,
           "بازارپردازی بر ارتقای فروش محصولات شرکت دوو تأثیر مثبت و "
           "معنادار دارد.", size=13.2, role="lotus", color=WHITE,
           align="c", valign="m", ls=1.45)
    finds = [
        ("۱", "استقرار هدفمند اقلام تبلیغاتی", "رابطهٔ مثبت و معنادار با میزان فروش"),
        ("۲", "سازماندهی فعالیت‌های بازارپردازی", "رابطهٔ مثبت و معنادار با میزان فروش"),
        ("۳", "چیدمان و جانمایی بهینهٔ محصولات", "رابطهٔ مثبت و معنادار با میزان فروش"),
    ]
    y = 3.05
    for n, t, r in finds:
        s.rect(5.20, y, 7.16, 0.92, fill=CARD, line=HAIR2, radius=0.12,
               shadow=True)
        s.ellipse(11.78, y + 0.22, 0.48, 0.48, fill=TEAL)
        s.text(11.78, y + 0.20, 0.48, 0.48, n, size=14, role="titr",
               color=WHITE, align="c", valign="m", ls=1.0)
        s.text(5.5, y + 0.10, 6.0, 0.36, t, size=11.5, role="lotus",
               color=NAVY, align="r", valign="m")
        s.text(5.5, y + 0.48, 6.0, 0.32, r, size=9.8, role="zar",
               color=TEAL_D, align="r", valign="m")
        y += 1.04
    s.text(5.2, 6.30, 7.16, 0.3,
           "یافته‌های آماری تفصیلی در فصل ۴ و تحلیل آن‌ها در فصل ۵ ارائه "
           "شده است.", size=9.4, role="zar_r", color=MUTE, align="c")


# ================================================================ اسلاید ۲۰
def s20(s):
    chrome(s, 13, 13, "پیشنهادها", "پیشنهادهای کاربردی و پژوهشی", 20)
    s.text(CX0, 1.42, CW, 0.26,
           "پیش‌نویس قابل ویرایش — متن نهایی پیشنهادها از فصل ۵ جایگزین شود.",
           size=9.4, role="lotus", color=PH_TX, align="r")
    heads = [
        (X2[0], "پیشنهادهای کاربردی برای فروشگاه‌های دوو", NAVY, GOLD_L),
        (X2[1], "پیشنهادهای پژوهشی", TEAL, WHITE),
    ]
    for x, h, hc, tc in heads:
        s.rect(x, 1.78, C2, 0.50, fill=hc, radius=0.10, shadow=True)
        s.text(x + 0.2, 1.78, C2 - 0.4, 0.50, h, size=11.2, role="lotus",
               color=tc, align="c", valign="m")
    app = [
        ("۱", "بهینه‌سازی استقرار هدفمند اقلام تبلیغاتی در محیط فروشگاه",
         "[اقدام اجرایی دقیق بر پایهٔ نتایج درج شود]"),
        ("۲", "ساماندهی و اثربخش‌کردن فعالیت‌های بازارپردازی",
         "[اقدام اجرایی دقیق بر پایهٔ نتایج درج شود]"),
        ("۳", "بهبود چیدمان و جانمایی محصولات در نقاط کلیدی فروشگاه",
         "[اقدام اجرایی دقیق بر پایهٔ نتایج درج شود]"),
    ]
    res = [
        ("۱", "تکرار مطالعه در سایر شهرها و فروشگاه‌های زنجیره‌ای"),
        ("۲", "بررسی متغیرهای میانجی: تجربهٔ مشتری و قصد خرید"),
        ("۳", "تکمیل پژوهش با داده‌های واقعی فروش و روش‌های آماری "
              "پیشرفته‌تر"),
    ]
    y0 = 2.42
    for i in range(3):
        y = y0 + i * 1.42
        x = X2[0]
        s.rect(x, y, C2, 1.28, fill=CARD, line=HAIR2, radius=0.12,
               shadow=True)
        s.ellipse(x + C2 - 0.52, y + 0.18, 0.40, 0.40, fill=GOLD)
        s.text(x + C2 - 0.52, y + 0.16, 0.40, 0.40, fa(i + 1), size=12,
               role="titr", color=NAVY, align="c", valign="m", ls=1.0)
        s.text(x + 0.22, y + 0.14, C2 - 0.85, 0.55, app[i][1], size=10.3,
               role="lotus", color=NAVY, align="r", valign="m", ls=1.3)
        s.text(x + 0.22, y + 0.74, C2 - 0.5, 0.42, app[i][2], size=8.8,
               role="zar_r", color=PH_TX, align="r", ls=1.25)
        x = X2[1]
        s.rect(x, y, C2, 1.28, fill=CARD, line=HAIR2, radius=0.12,
               shadow=True)
        s.ellipse(x + C2 - 0.52, y + 0.18, 0.40, 0.40, fill=TEAL)
        s.text(x + C2 - 0.52, y + 0.16, 0.40, 0.40, fa(i + 1), size=12,
               role="titr", color=WHITE, align="c", valign="m", ls=1.0)
        s.text(x + 0.22, y + 0.10, C2 - 0.85, 1.1, res[i][1], size=10.3,
               role="zar", color=INK, align="r", valign="m", ls=1.4)
    tag(s, X2[1] + C2 - 1.7, y0 + 3 * 1.42 + 0.06, 1.5,
        "پیشنهاد پژوهشی", fill=(232, 242, 242), tx=TEAL_D, h=0.30, size=8.6) \
        if False else None


# ================================================================ اسلاید ۲۱
def s21(s):
    chrome(s, 14, 14, "محدودیت‌ها و جمع‌بندی", "محدودیت‌ها و جمع‌بندی نهایی", 21)
    # محدودیت‌ها
    card(s, 6.95, 1.55, 5.41, 5.18, fill=CARD)
    s.rect(6.95, 1.55, 5.41, 0.52, fill=NAVY, radius=0.12, shadow=False)
    s.rect(6.95, 1.85, 5.41, 0.22, fill=NAVY, shadow=False)
    s.text(7.15, 1.55, 5.01, 0.52,
           "محدودیت‌های پژوهش (بازبینی بر اساس فصل ۵)", size=10.8,
           role="lotus", color=GOLD_L, align="c", valign="m")
    lim = [
        "محدود بودن قلمرو مکانی به فروشگاه‌های دوو در اهواز و لزوم احتیاط "
        "در تعمیم نتایج.",
        "اتکا به داده‌های خودگزارشیِ گردآوری‌شده با پرسشنامه.",
    ]
    y = 2.32
    for t in lim:
        s.rect(12.18, y + 0.08, 0.085, 0.085, fill=TEAL, radius=0.02,
               shadow=False)
        hh = s.text(7.2, y, 4.78, 0.9, t, size=10.6, role="zar", color=INK,
                    ls=1.45)
        y += max(0.78, hh) + 0.14
    placeholder_card(s, 7.2, 5.35, 4.92, 1.05,
                     "[سایر محدودیت‌های زمانی، منابع و روش‌شناختی از "
                     "فصل ۵ درج شود]", size=9.6)
    # جمع‌بندی
    s.rect(CX0, 1.55, 5.05, 5.18, fill=NAVY, radius=0.14, shadow=True)
    tag(s, CX0 + 5.05 / 2 - 0.85, 1.80, 1.70, "جمع‌بندی نهایی",
        fill=GOLD, tx=NAVY, h=0.34, size=10)
    chain = [(1, "۳ مؤلفهٔ بازارپردازی"),
             (2, "رابطهٔ مثبت و معنادار با فروش"),
             (3, "ارتقای فروش محصولات دوو")]
    y = 2.42
    for n, t in chain:
        s.rect(2.12, y, 4.25, 0.66, fill=NAVY3, line=(60, 84, 110),
               lw=0.8, radius=0.10, shadow=False)
        s.ellipse(5.78, y + 0.14, 0.38, 0.38, fill=TEAL)
        s.text(5.78, y + 0.12, 0.38, 0.38, fa(n), size=11, role="titr",
               color=WHITE, align="c", valign="m", ls=1.0)
        s.text(2.30, y, 3.3, 0.66, t, size=10.8, role="lotus",
               color=WHITE, align="c", valign="m")
        if n != 3:
            s.line(4.245, y + 0.70, 4.245, y + 0.86, color=GOLD_L, w=1.4)
        y += 0.90
    s.line(2.35, 5.20, 6.12, 5.20, color=(70, 92, 116), w=0.9)
    s.text(1.98, 5.34, 4.55, 1.2,
           "پیام کلیدی: طراحی هدفمند محیط فروشگاه — اقلام تبلیغاتی، "
           "فعالیت‌های بازارپردازی و چیدمان — اهرمی اثرگذار برای ارتقای "
           "فروش است.", size=10.3, role="zar", color=IVORY_T,
           align="c", ls=1.55)


# ================================================================ اسلاید ۲۲
def s22(s):
    s.bg_image(P("bg_thanks.png"))
    draw_timeline(s, 16, dark=True)
    draw_footer(s, 22, dark=True)
    s.text(3.0, 1.42, 6.8, 0.3,
           "دانشگاه پیام نور واحد جویبار — دانشکدهٔ مدیریت، اقتصاد و حسابداری",
           size=10.5, role="lotus", color=GOLD_L, align="c")
    s.text(2.4, 2.62, 8.0, 0.9, "سپاسگزارم از توجه شما", size=38,
           role="titr", color=WHITE, align="c", ls=1.1)
    s.line(5.75, 3.72, 7.05, 3.72, color=GOLD, w=2.0)
    s.ellipse(6.32, 3.63, 0.16, 0.16, fill=GOLD)
    s.text(2.4, 3.92, 8.0, 0.5, "پرسش و پاسخ", size=22, role="lotus",
           color=GOLD_L, align="c")
    s.rect(4.35, 5.35, 4.10, 1.12, fill=(26, 48, 74), line=(90, 110, 132),
           lw=0.8, radius=0.12, shadow=False)
    s.text(4.55, 5.52, 3.7, 0.32, "دانشجو: بابک مرادوند", size=11,
           role="zar", color=IVORY_T, align="c")
    s.text(4.55, 5.92, 3.7, 0.32,
           "استاد راهنما: دکتر رمضان غلامی اواتی", size=11, role="zar",
           color=IVORY_T, align="c")


SLIDES = [s01, s02, s03, s04, s05, s06, s07, s08, s09, s10, s11,
          s12, s13, s14, s15, s16, s17, s18, s19, s20, s21, s22]


NOTES = [
    "سلام و احترام به استادان محترم راهنما، مشاور و داوران. موضوع پایان‌نامه: «بررسی تأثیر بازارپردازی بر ارتقای فروش محصولات شرکت دوو» در فروشگاه‌های لوازم خانگی دوو در شهر اهواز. ابتدا نقشهٔ مسیر ارائه مرور می‌شود و سپس مبانی، روش، یافته‌ها و جمع‌بندی ارائه خواهد شد.",
    "این اسلاید نقشهٔ مسیر ارائه را نشان می‌دهد؛ ۱۶ بخش از معرفی پژوهش تا پرسش و پاسخ. در تمام اسلایدها، بخش فعال در نوار پیشرفت کناری با رنگ متمایز مشخص است.",
    "تبلیغات نوآورانه و هدفمند بر شکل‌گیری قصد خرید و تغییر تصمیم مصرف‌کننده اثرگذار است. بازارپردازی یعنی استفاده از همهٔ عناصر محیط فروشگاه برای برجسته‌سازی محصول در نقطهٔ خرید. این پژوهش سه مؤلفهٔ مستقل (اقلام تبلیغاتی، سازماندهی فعالیت‌ها، چیدمان) و یک متغیر وابسته (میزان فروش) را می‌سنجد.",
    "با تغییر الگوهای رفتاری و انتظارات مشتریان و پیچیده‌تر شدن خرید، جایگاه رقابتی برند به مدیریت محیط فروشگاه وابسته‌تر شده است. سه مؤلفهٔ مستقل پژوهش معرفی می‌شوند و پرسش محوری این است: آیا این سه مؤلفه بر میزان فروش محصولات دوو اثر مثبت و معنادار دارند؟",
    "اهمیت در دو سطح است: برای صنعت، بازارپردازی به تثبیت برند، ارتباط با مشتریان، معرفی محصولات جدید، برجسته‌سازی مزیت رقابتی و ذهنیت مثبت کمک می‌کند؛ برای علم و تصمیم‌سازی، شواهد تجربی هم‌زمان دربارهٔ هر سه مؤلفه و مبنای داده برای مدیران فراهم می‌شود.",
    "هدف اصلی: بررسی تأثیر عملکرد بازارپردازی بر ارتقای فروش فروشگاه‌های دوو در اهواز. سه هدف فرعی متناظر با سه مؤلفهٔ بازارپردازی تعریف شده است.",
    "فرضیهٔ اصلی: بازارپردازی بر ارتقای فروش محصولات دوو تأثیر مثبت و معنادار دارد. سه فرضیهٔ فرعی، رابطهٔ مثبت و معنادار هر یک از مؤلفه‌ها را با میزان فروش مطرح می‌کنند. آزمون آماری با ضریب همبستگی اسپیرمن در SPSS انجام شده است.",
    "مدل مفهومی پژوهش: سه متغیر مستقل (استقرار اقلام تبلیغاتی، سازماندهی فعالیت‌های بازارپردازی، چیدمان و جانمایی) به‌صورت هم‌زمان بر متغیر وابستهٔ میزان فروش اثر می‌گذارند.",
    "مسیر مرور مبانی و پیشینه در سه گام است: مفاهیم نظری، مطالعات تجربی پیشین، و مدل پژوهش حاضر. جدول بالای اسلاید برای مرور مهم‌ترین پژوهش‌های پیشین و مقایسهٔ یافته‌ها آماده شده است. شکاف پژوهشی: سنجش هم‌زمان هر سه مؤلفه در فروشگاه‌های لوازم خانگی دوو در اهواز.",
    "پژوهش از نظر هدف کاربردی و از نظر روش گردآوری داده، توصیفی از نوع همبستگی است. مسیر کار: تعریف مدل، تأیید روایی، توزیع پرسشنامه، محاسبهٔ پایایی، آزمون نرمال‌بودن K-S و در نهایت آزمون اسپیرمن در SPSS.",
    "جامعهٔ آماری ۲۴۵ نفر است و بر اساس جدول مورگان، ۱۵۰ پرسشنامه توزیع شد. نمونه‌گیری به روش ترکیبیِ احتمالی شامل تصادفی طبقه‌ای و تصادفی خوشه‌ای انجام شده است. معیارهای طبقات و خوشه‌ها بر اساس فصل ۳ تکمیل می‌شود.",
    "ابزار گردآوری پرسشنامه است؛ روایی آن با نظر استاد راهنما، استاد مشاور و خبرگان صنعت تأیید شد. پایایی با آلفای کرونباخ برابر ۰/۹۲۲ (۹۲٫۲٪) به دست آمد که پایایی مطلوب را نشان می‌دهد. آزمون کولموگروف–اسمیرنوف از نرمال بودن همهٔ مؤلفه‌ها حکایت داشت.",
    "این اسلاید متغیرهای پژوهش و نقش آن‌ها را خلاصه می‌کند. متغیر وابسته، میزان فروش محصولات دوو است. آزمون فرضیه‌ها با ضریب همبستگی اسپیرمن انجام شد و نتیجهٔ کلی، وجود رابطهٔ معنادار در تمامی فرضیه‌هاست.",
    "نمای کلی یافته‌ها: نتیجهٔ اسپیرمن نشان داد در هر چهار فرضیه رابطهٔ معنادار وجود دارد. نمودار پایین چارچوب آمادهٔ درج ضرایب r از خروجی SPSS است؛ مقادیر دقیق بدون گرد کردن یا حدس‌زدن از جدول‌های فصل ۴ جای‌گذاری شود.",
    "جدول نتایج آزمون فرضیه‌ها: ستون‌های ضریب همبستگی r و سطح معناداری p دقیقاً از خروجی SPSS فصل ۴ درج شود. بر اساس یافتهٔ گزارش‌شده در رساله، هر چهار فرضیه تأیید شده‌اند.",
    "این اسلاید چارچوب جدول شاخص‌های توصیفی و نمودارهای جمعیت‌شناختی (جنسیت، سن، تحصیلات) را آماده می‌کند؛ اعداد میانگین، انحراف معیار، کمینه و بیشینه از جدول‌های توصیفی فصل ۴ درج شود.",
    "پاسخ فرضیه‌ها در یک نگاه: هر سه مؤلفه رابطهٔ مثبت و معنادار با فروش دارند. ستون مقایسه با پیشینه و ستون تفسیر و دلیل، هنگام درج متن فصل ۵ بر پایهٔ منابع تکمیل شود.",
    "زنجیرهٔ پیشنهادی تفسیر: اقدامات بازارپردازی در فروشگاه به توجه و تجربهٔ مثبت مشتری، سپس شکل‌گیری قصد و تصمیم خرید و در نهایت ارتقای فروش می‌انجامد. سازگاری با مبانی نظری و تبیین تفاوت‌های احتمالی با پیشینه بر اساس فصل ۵ نوشته شود.",
    "مهم‌ترین یافته: بازارپردازی بر ارتقای فروش محصولات دوو تأثیر مثبت و معنادار دارد و هر سه مؤلفه — اقلام تبلیغاتی، سازماندهی و چیدمان — با میزان فروش رابطهٔ مثبت و معنادار دارند.",
    "پیشنهادهای کاربردی به بهینه‌سازی سه مؤلفه در فروشگاه‌های دوو می‌پردازند و متن دقیق هر اقدام بر پایهٔ نتایج نوشته می‌شود. پیشنهادهای پژوهشی شامل تکرار مطالعه در شهرهای دیگر، سنجش متغیرهای میانجی و تکمیل پژوهش با داده‌های واقعی فروش است.",
    "محدودیت‌ها: محدود بودن قلمرو مکانی به اهواز و لزوم احتیاط در تعمیم، و اتکا به داده‌های خودگزارشی پرسشنامه؛ سایر موارد از فصل ۵ تکمیل شود. جمع‌بندی: سه مؤلفهٔ بازارپردازی رابطهٔ مثبت و معنادار با فروش دارند و طراحی هدفمند محیط فروشگاه اهرمی اثرگذار برای ارتقای فروش است.",
    "از توجه استادان محترم و حاضران گرامی سپاسگزارم. آمادهٔ دریافت پرسش‌ها و دیدگاه‌های ارزشمند شما هستم.",
]


def build_pptx(path):
    prs = Presentation()
    prs.slide_width = Inches(12.8)
    prs.slide_height = Inches(7.5)
    cp = prs.core_properties
    cp.title = "بررسی تأثیر بازارپردازی بر ارتقای فروش محصولات شرکت دوو"
    cp.subject = "پایان‌نامهٔ کارشناسی ارشد — جلسهٔ دفاع"
    cp.author = "بابک مرادوند"
    cp.keywords = "بازارپردازی؛ ارتقای فروش؛ فروشگاه‌های دوو؛ اهواز؛ اسپیرمن"
    cp.category = "پایان‌نامهٔ کارشناسی ارشد"
    cp.comments = ("راهنما: متن‌های داخل براکت و خانه‌های خط‌چین‌شده، جای‌نمای "
                   "داده‌های پایان‌نامه هستند و باید با داده‌های دقیق فصل‌های ۳، ۴ و ۵ جایگزین شوند.")
    for i, fn in enumerate(SLIDES):
        sl = PptxSlide(prs)
        fn(sl)
        ns = sl.s.notes_slide
        ns.notes_text_frame.text = NOTES[i]
    prs.save(path)
    print("PPTX saved:", path)


def build_qa(outdir):
    os.makedirs(outdir, exist_ok=True)
    for i, fn in enumerate(SLIDES, 1):
        sl = QASlide()
        fn(sl)
        p = os.path.join(outdir, f"s{i:02d}.png")
        sl.save(p)
        print("QA", p)


if __name__ == "__main__":
    build_qa(os.path.join(BASE, "qa", "slides"))
    build_pptx(os.path.join(BASE, "دفاع_بازارپردازی_دوو_بابک_مرادوند.pptx"))
