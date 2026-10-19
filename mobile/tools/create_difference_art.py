"""Original BuddhiBox illustrated pairs. Requires Pillow; rerun only for content edits.
All A/B pixels outside the five declared ellipse regions must be identical.
"""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1] / 'assets/games/find-the-difference'
W, H = 900, 600
SCENES = [
    ('garden', [(140,105,48,48),(750,105,48,48),(260,390,53,50),(674,408,55,55),(450,268,44,49)]),
    ('harbor', [(152,117,52,52),(730,130,50,49),(389,299,59,67),(780,453,51,52),(164,444,50,53)]),
    ('night-market', [(130,112,52,53),(750,112,49,50),(274,305,55,52),(642,297,48,54),(453,476,50,49)]),
]

def flower(d,x,y,color):
    for dx,dy in ((-16,0),(16,0),(0,-16),(0,16)):
        d.ellipse((x+dx-12,y+dy-12,x+dx+12,y+dy+12),fill=color)
    d.ellipse((x-10,y-10,x+10,y+10),fill='#FFE598')

def draw_scene(scene, alternate):
    im = Image.new('RGB',(W,H), {'garden':'#B5DCE0','harbor':'#AED8E7','night-market':'#222D54'}[scene]); d=ImageDraw.Draw(im)
    if scene == 'garden':
        d.ellipse((45,32,235,222),fill='#F8D77F')
        for cx,cy in ((335,110),(540,84),(785,200)):
            d.ellipse((cx-80,cy-25,cx+80,cy+35),fill='#F4F3E2')
        d.rectangle((0,445,900,600),fill='#7BAF86');d.polygon([(0,520),(450,442),(900,525),(900,600),(0,600)],fill='#5E9A78')
        d.rectangle((330,280,580,483),fill='#F4C99F');d.polygon([(305,292),(455,170),(605,292)],fill='#8B686A')
        d.rectangle((474,355,533,483),fill='#736076');d.ellipse((510,418,520,428),fill='#F9E0A6')
        d.rectangle((347,321,416,382),fill='#4E8895');d.line((382,321,382,382),fill='#F8E9C7',width=7)
        for x,y in ((80,494),(189,527),(560,520),(806,510)):
            d.line((x,y,x,y-35),fill='#315E5F',width=7);flower(d,x,y-41,'#F1ADC2')
        # exactly five changed details
        d.polygon([(105,133),(133,73),(160,133)],fill='#FCECAE' if alternate else '#E6A971') # sun inlay
        d.ellipse((712,72,785,138),fill='#E7DBF2' if alternate else '#FBF8E9') # cloud emblem
        flower(d,260,390,'#9380E7' if alternate else '#F3879E')
        d.rectangle((640,375,707,440),fill='#718EAF' if alternate else '#E8A871');d.rectangle((652,385,695,427),fill='#F5E7CB') # wall picture
        d.ellipse((430,248,470,288),fill='#E8F0C5' if alternate else '#D86A6E') # roof ornament
    elif scene == 'harbor':
        d.rectangle((0,333,900,600),fill='#6BABC3')
        for y in (380,440,506):d.arc((40,y-18,870,y+42),0,180,fill='#CEE9DA',width=5)
        d.rectangle((0,513,900,600),fill='#E8D3A7')
        d.ellipse((80,41,230,191),fill='#FFE4A6')
        d.polygon([(325,382),(475,382),(451,414),(355,414)],fill='#513F65');d.line((405,175,405,382),fill='#695C70',width=9)
        d.polygon([(412,201),(412,350),(485,350)],fill='#F5ECE0');d.polygon([(397,204),(397,346),(339,346)],fill='#DD857E')
        d.rectangle((697,302,705,524),fill='#65525D');d.polygon([(700,312),(595,349),(700,355)],fill='#F4BE76')
        for x in (614,645,676):d.line((x,350,x+32,350),fill='#F7E1C1',width=7)
        # changed sun ornament, cloud, sail patch, beach shell, umbrella badge
        d.ellipse((131,99,173,139),fill='#F7A879' if alternate else '#FBF2CD')
        d.ellipse((697,108,765,152),fill='#FEF0D5' if alternate else '#C9E0DC')
        d.polygon([(373,295),(403,260),(403,330)],fill='#ECC176' if alternate else '#8B9CCA')
        d.ellipse((747,423,812,481),fill='#E77D83' if alternate else '#F3D9BE')
        d.ellipse((143,420,185,462),fill='#F7B84F' if alternate else '#D0E2D3')
    else:
        d.ellipse((57,38,207,188),fill='#F7D79B')
        for x in (55,225,405,575,755):
            height=240+(x%3)*30;d.rectangle((x,height,x+110,520),fill='#3A496D')
            for wx in (x+18,x+54,x+88):
                for wy in (height+30,height+85,height+140):d.rectangle((wx,wy,wx+15,wy+23),fill='#E9BFA1')
        d.rectangle((0,518,900,600),fill='#374263')
        d.rectangle((220,370,360,495),fill='#BD7E81');d.polygon([(200,370),(291,310),(378,370)],fill='#F0B77C')
        d.rectangle((556,371,707,498),fill='#947DA9');d.polygon([(540,371),(633,319),(722,371)],fill='#D7A48D')
        d.rounded_rectangle((359,430,538,520),radius=20,fill='#7496AE');d.ellipse((382,508,422,548),fill='#222838');d.ellipse((480,508,520,548),fill='#222838')
        # five changed ornaments, never alter shared scenery
        d.ellipse((105,85,157,137),fill='#9689D3' if alternate else '#FFF2B7')
        d.rectangle((721,83,777,140),fill='#F3BF86' if alternate else '#729CB7')
        d.ellipse((247,277,303,329),fill='#F7DC8D' if alternate else '#8DCBC5')
        d.rectangle((622,268,663,326),fill='#E68F93' if alternate else '#F1D99A')
        d.ellipse((429,453,479,500),fill='#FFD39B' if alternate else '#B2D6DC')
    return im

for scene,regions in SCENES:
    output=ROOT/scene;output.mkdir(parents=True,exist_ok=True)
    a,b=draw_scene(scene,False),draw_scene(scene,True)
    # Every actual changed pixel must fall inside exactly one authored region.
    changed=[0]*5
    pa,pb=a.load(),b.load()
    for y in range(H):
        for x in range(W):
            if pa[x,y]==pb[x,y]:continue
            matches=[i for i,(cx,cy,rx,ry) in enumerate(regions) if ((x-cx)/rx)**2+((y-cy)/ry)**2<=1]
            if len(matches)!=1:raise ValueError(f'{scene}: changed pixel outside/overlapping region at {x},{y}')
            changed[matches[0]]+=1
    if min(changed)<100:raise ValueError(f'{scene}: missing visible change {changed}')
    for name,img in (('a',a),('b',b)):img.save(output/f'{name}.png',optimize=True)
    print(scene,changed)
