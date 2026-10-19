"""Original BuddhiBox launcher/splash artwork. Requires Pillow; no third-party art."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT=Path(__file__).resolve().parents[1]/'assets'
BG='#0F1020';PURPLE='#A69CFF';TEAL='#43D9C3';GOLD='#FFCA70';WHITE='#F7F7FF'
FONT='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

def mark(size,monochrome=False):
    im=Image.new('RGBA',(size,size),(0,0,0,0));d=ImageDraw.Draw(im)
    # Keep the entire foreground inside the central safe region of Android adaptive icons.
    inset=int(size*.18);outer=(inset,inset,size-inset,size-inset)
    d.rounded_rectangle(outer,radius=int(size*.16),fill=WHITE if monochrome else PURPLE)
    gap=int(size*.027);x0=inset+int(size*.09);y0=inset+int(size*.07)
    d.rounded_rectangle((x0,y0,size-inset-int(size*.09),size-inset-int(size*.07)),radius=int(size*.09),fill=BG)
    font=ImageFont.truetype(FONT,int(size*.38))
    text='B';box=d.textbbox((0,0),text,font=font)
    x=(size-(box[2]-box[0]))/2-box[0]-int(size*.01);y=(size-(box[3]-box[1]))/2-box[1]-int(size*.01)
    d.text((x,y),text,font=font,fill=WHITE)
    # Three different puzzle-piece accents; no unrelated stock/template imagery.
    a=int(size*.032);cx=int(size*.7);cy=int(size*.3)
    d.ellipse((cx-a,cy-a,cx+a,cy+a),fill=WHITE if monochrome else TEAL)
    d.rounded_rectangle((int(size*.28),int(size*.69),int(size*.34),int(size*.75)),radius=gap,fill=WHITE if monochrome else GOLD)
    return im

# App icon: opaque platform icon. Adaptive foreground/monochrome: transparent.
icon=Image.new('RGB',(1024,1024),BG);icon.paste(mark(1024),mask=mark(1024).getchannel('A'));icon.save(OUT/'icon.png',optimize=True)
mark(1024).save(OUT/'android-icon-foreground.png',optimize=True)
mark(1024,True).save(OUT/'android-icon-monochrome.png',optimize=True)
mark(512).save(OUT/'splash-icon.png',optimize=True)
print('Wrote original BuddhiBox icon, adaptive foreground, monochrome icon and splash mark')
