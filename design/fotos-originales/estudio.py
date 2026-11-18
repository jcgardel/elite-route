import os
import numpy as np
from PIL import Image, ImageFilter, ImageDraw
from rembg import remove, new_session
os.makedirs("cutouts",exist_ok=True); os.makedirs("estudio",exist_ok=True)
sess=None
def cutout(name):
    global sess
    p=f"cutouts/{name}.png"
    if os.path.exists(p): return Image.open(p)
    if sess is None: sess=new_session("isnet-general-use")
    c=remove(Image.open(f"originales/{name}.webp").convert("RGB"),session=sess,post_process_mask=True)
    c.save(p); return c

def lerp(a,b,t): return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))
def escena(W,H,hz):
    # pared: grafito con caída suave; piso: pavimento oscuro, más claro hacia la cámara
    WALL_TOP,WALL_BOT=(40,45,49),(33,38,42)        # alrededor de #24292D
    FLOOR_FAR,FLOOR_NEAR=(27,31,34),(44,49,53)
    arr=np.zeros((H,W,3),np.float32)
    band=H*0.10
    for y in range(H):
        cw=lerp(WALL_TOP,WALL_BOT,min(1,y/max(1,hz)))
        cf=lerp(FLOOR_FAR,FLOOR_NEAR,(max(0,y-hz)/max(1,H-hz))**0.8)
        t=min(1,max(0,(y-(hz-band))/(2*band))); t=t*t*(3-2*t)   # horizonte suave
        arr[y,:,:]=[cw[i]*(1-t)+cf[i]*t for i in range(3)]
    # viñeta lateral muy suave
    x=np.linspace(-1,1,W); v=1-0.18*(x**2); arr*=v[None,:,None]
    # textura de pavimento: grano fino sólo en el piso
    rng=np.random.default_rng(7); n=rng.normal(0,2.2,(H,W,1)); n[:hz]=0
    arr=np.clip(arr+n,0,255)
    img=Image.fromarray(arr.astype(np.uint8))
    # horizonte difuso
    return img.filter(ImageFilter.GaussianBlur(1.2))

def componer(name,W,H,ancho,piso,alto_max,hz_frac):
    cut=cutout(name)
    a=cut.split()[3]
    bb=a.point(lambda v:255 if v>40 else 0).getbbox()
    car=cut.crop(bb)
    s=min(W*ancho/car.width,H*alto_max/car.height)
    car=car.resize((int(car.width*s),int(car.height*s)),Image.LANCZOS)
    x=(W-car.width)//2; ground=int(H*piso); y=ground-car.height
    bg=escena(W,H,int(H*hz_frac)).convert("RGBA")
    # reflejo tenue en el pavimento
    refl=car.transpose(Image.FLIP_TOP_BOTTOM)
    ra=np.array(refl.split()[3],np.float32)
    fade=(np.linspace(1,0,refl.height)**2.6*0.18)[:,None]
    ra=(ra*fade).astype(np.uint8)
    refl.putalpha(Image.fromarray(ra)); refl=refl.filter(ImageFilter.GaussianBlur(2))
    bg.alpha_composite(refl,(x,ground-3))
    # sombras: amplia bajo la carrocería + contacto firme en la línea de llantas
    sh=Image.new("L",(W,H),0); d=ImageDraw.Draw(sh)
    d.ellipse([x-car.width*0.02, ground-H*0.06, x+car.width*1.02, ground+H*0.055], fill=150)
    d.ellipse([x+car.width*0.06, ground-H*0.035, x+car.width*0.94, ground+H*0.022], fill=225)
    sh=sh.filter(ImageFilter.GaussianBlur(H*0.026))
    # contacto que sigue el contorno inferior real: cada llanta (también las
    # traseras, más altas por la perspectiva) toca el piso en su propio punto.
    alpha=np.array(car.split()[3])
    hgt=alpha.shape[0]
    ct=Image.new("L",(W,H),0); cd=ImageDraw.Draw(ct)
    bottoms=np.full(alpha.shape[1],-1)
    for cx in range(alpha.shape[1]):
        ys=np.where(alpha[:,cx]>60)[0]
        if len(ys): bottoms[cx]=ys[-1]
    k=max(4,int(car.width*0.035))
    for cx in range(alpha.shape[1]):
        yb=bottoms[cx]
        if yb<0 or yb<hgt*0.70: continue
        win=bottoms[max(0,cx-k):cx+k+1]
        gy=y+yb
        # oclusión bajo toda la parte baja
        cd.line([(x+cx,gy-1),(x+cx,gy+int(H*0.010))],fill=110)
        # contacto firme donde el contorno toca su punto más bajo local (llantas)
        if yb>=win.max()-2:
            cd.ellipse([x+cx-4,gy-3,x+cx+4,gy+int(H*0.007)],fill=255)
    ct=ct.filter(ImageFilter.GaussianBlur(max(2.5,H*0.005)))
    shadow=Image.new("RGBA",(W,H),(6,8,10,0))
    m=np.maximum(np.array(sh,np.float32), np.array(ct,np.float32)).astype(np.uint8)
    shadow.putalpha(Image.fromarray(m))
    bg.alpha_composite(shadow)
    bg.alpha_composite(car,(x,y))
    return bg.convert("RGB")

for n in ["executive","high-suv","minivan","sedan"]:
    componer(f"flota-{n}",1400,788,0.78,0.86,0.74,0.58).save(f"estudio/flota-{n}.webp","WEBP",quality=86,method=6)
    componer(f"cotizador-{n}",800,1000,0.88,0.60,0.42,0.48).save(f"estudio/cotizador-{n}.webp","WEBP",quality=86,method=6)
    print("ok",n)
w,h=700,394
sheet=Image.new("RGB",(w*2+10,(h+10)*2),(255,255,255))
for i,n in enumerate(["high-suv","executive","minivan","sedan"]):
    sheet.paste(Image.open(f"estudio/flota-{n}.webp").convert("RGB").resize((w,h)),((i%2)*(w+10),(i//2)*(h+10)))
sheet.save("estudio-hoja.png")
