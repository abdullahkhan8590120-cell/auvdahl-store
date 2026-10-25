"""Generates responsive WebP + AVIF variants from source-images/. Never upscales.
Run from project root:  python3 scripts/optimize-images.py   (needs Pillow with WebP+AVIF)"""
from PIL import Image
import os
WIDTHS=[400,640,960,1254]
def variants(src,outdir,stem,widths=WIDTHS,wq=84,aq=60):
    im=Image.open(src).convert('RGB'); os.makedirs(outdir,exist_ok=True); out=[]
    for w in widths:
        if w>im.width: continue
        r=im if w==im.width else im.resize((w,round(im.height*w/im.width)),Image.LANCZOS)
        r.save(f'{outdir}/{stem}-{w}.webp','WEBP',quality=wq,method=6)
        r.save(f'{outdir}/{stem}-{w}.avif','AVIF',quality=aq,speed=4)
        out.append(w)
    return out
if __name__=='__main__':
    for s in ['solaris','lyrana','noctis','ambrex','vanzer','zaffir']:
        print(s,variants(f'source-images/products/{s}.png','public/products',s))
    print('emblem',variants('source-images/brand/auvdahl-emblem-1254.png','public/brand','auvdahl-emblem'))
    # Ingredient details: native-resolution regions of the approved product photos (no upscaling)
    CROPS={'solaris':(0,590,380),'lyrana':(0,430,380),'noctis':(0,570,380),'ambrex':(0,610,380),'vanzer':(0,630,380),'zaffir':(0,610,380)}  # x,y,size: ingredient area left of each bottle
    for s,(x,y,n) in CROPS.items():
        im=Image.open(f'source-images/products/{s}.png').convert('RGB').crop((x,y,x+n,y+n))
        im.save(f'public/products/{s}-detail-{n}.webp','WEBP',quality=86,method=6)
        im.save(f'public/products/{s}-detail-{n}.avif','AVIF',quality=62,speed=4)
