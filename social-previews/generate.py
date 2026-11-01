"""dotcurt GitHub social previews — Win95 desktop identity, v2 (geometry fixes)."""
from PIL import Image, ImageDraw, ImageFont

W, H = 1280, 640
TEAL = "#007C7C"; GRAY = "#C0C0C0"; NAVY = "#0636A0"; CREAM = "#F5EED7"
GOLD = "#B8900A"; BROWN = "#3B3326"; WHITE = "#FFFFFF"; DKGRAY = "#7A7A7A"; BLACK = "#1A1A1A"

FB = "C:/Windows/Fonts/arialbd.ttf"
FT = "C:/Windows/Fonts/tahoma.ttf"
FTB = "C:/Windows/Fonts/tahomabd.ttf"

CARDS = [
    ("curt-convert",  "Claude Code transcripts,",  "one .curt file.",        "npm 1.0.2"),
    ("curt-vcon",     "The IETF vCon bridge",      "for AI conversations.",  "npm 1.0.1"),
    ("curt-wildchat", "Real conversations,",       "one open format.",       "npm 1.0.1"),
    ("curt-openwith", "Double-click any .curt.",   "Windows, macOS, Linux.", "v1.0.0"),
]

def bevel(d, box, face=GRAY, out=True):
    x0, y0, x1, y1 = box
    d.rectangle(box, fill=face)
    c1, c2 = (WHITE, DKGRAY) if out else (DKGRAY, WHITE)
    d.line([x0, y0, x1 - 1, y0], fill=c1); d.line([x0, y0, x0, y1 - 1], fill=c1)
    d.line([x0 + 1, y1 - 1, x1 - 1, y1 - 1], fill=c2); d.line([x1 - 1, y0 + 1, x1 - 1, y1 - 1], fill=c2)

def folder_icon(d, cx, cy, scale=1.0):
    """The cream .curt folder: tab + body, gold dot, brown wordmark fitted inside."""
    w, h = int(340 * scale), int(260 * scale)
    x0, y0 = cx - w // 2, cy - h // 2
    tabw, tabh = int(136 * scale), int(58 * scale)
    d.rounded_rectangle([x0 + 14, y0 + tabh + 10, x0 + w + 14, y0 + h + 10], radius=int(28 * scale), fill="#5B5347")
    d.rounded_rectangle([x0, y0, x0 + tabw, y0 + tabh + 12], radius=int(16 * scale), fill="#E4DBBC")
    d.rounded_rectangle([x0, y0 + int(24 * scale), x0 + w, y0 + h], radius=int(28 * scale), fill=CREAM)
    # wordmark sized to the body: ~46% of body width for ".curt" + dot
    fs = int(w * 0.235)
    f = ImageFont.truetype(FB, fs)
    r = int(fs * 0.19)
    gap = int(fs * 0.12)
    text = ".curt"
    tw = d.textlength(text, font=f)
    total = 2 * r + gap + tw
    sx = x0 + (w - total) // 2
    cyv = y0 + int(24 * scale) + (h - int(24 * scale)) // 2
    d.ellipse([sx, cyv - r, sx + 2 * r, cyv + r], fill=GOLD)
    d.text((sx + 2 * r + gap, cyv), text, font=f, fill=BROWN, anchor="lm")

for name, sub1, sub2, badge in CARDS:
    img = Image.new("RGB", (W, H), TEAL)
    d = ImageDraw.Draw(img)

    # sparse desktop icon echo
    d.text((70, 90), "[> _]", font=ImageFont.truetype(FTB, 24), fill="#9FE0D2")
    d.text((58, 126), "Terminal", font=ImageFont.truetype(FT, 19), fill=CREAM)

    # main window
    wx0, wy0, wx1, wy1 = 230, 60, 1150, 520
    bevel(d, (wx0, wy0, wx1, wy1))
    tb_h = 40
    d.rectangle([wx0 + 6, wy0 + 6, wx1 - 6, wy0 + 6 + tb_h], fill=NAVY)
    d.text((wx0 + 18, wy0 + 13), f"{name} — C:\\dotcurt.org", font=ImageFont.truetype(FTB, 22), fill=WHITE)
    bx = wx1 - 130
    for label in ("_", "\u25a1", "\u00d7"):
        bevel(d, (bx, wy0 + 11, bx + 32, wy0 + 41), face=GRAY)
        d.text((bx + 16, wy0 + 25), label, font=ImageFont.truetype(FTB, 18), fill=BLACK, anchor="mm")
        bx += 38
    d.text((wx0 + 16, wy0 + 58), "File  Edit  View  Go  Help", font=ImageFont.truetype(FT, 19), fill=BLACK)

    # content: folder left, text column right
    folder_icon(d, wx0 + 220, wy0 + 285, scale=0.92)
    tx = wx0 + 430
    d.text((tx, wy0 + 150), sub1, font=ImageFont.truetype(FB, 36), fill=BROWN)
    d.text((tx, wy0 + 200), sub2, font=ImageFont.truetype(FB, 36), fill=BROWN)
    d.text((tx, wy0 + 282), "Reads and writes the open", font=ImageFont.truetype(FT, 26), fill=BLACK)
    d.text((tx, wy0 + 318), "single-file conversation format.", font=ImageFont.truetype(FT, 26), fill=BLACK)

    # status bar
    bevel(d, (wx0 + 6, wy1 - 40, wx1 - 6, wy1 - 8), face=GRAY)
    d.text((wx0 + 18, wy1 - 32), "1 object(s)", font=ImageFont.truetype(FT, 18), fill=BLACK)
    d.text((wx1 - 160, wy1 - 32), badge, font=ImageFont.truetype(FTB, 18), fill=BLACK)

    # taskbar
    bevel(d, (0, H - 56, W, H), face=GRAY, out=False)
    bevel(d, (16, H - 48, 190, H - 12))
    d.text((36, H - 38), "dotcurt.org", font=ImageFont.truetype(FTB, 22), fill=BLACK)
    bevel(d, (W - 170, H - 48, W - 24, H - 12), out=False)
    d.text((W - 156, H - 38), "4:20 PM", font=ImageFont.truetype(FT, 20), fill=BLACK)

    out = f"E:/dev/projects/dot_curt/social-previews/{name}.png"
    img.save(out)
    print("rendered", out)
