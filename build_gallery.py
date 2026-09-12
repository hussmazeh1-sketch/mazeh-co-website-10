"""Website 10 gallery builder.
Drop JPG/JPEG/PNG/WEBP files into content-images/<category>/ and run this file.
Netlify runs it automatically before every deploy.
"""
from pathlib import Path
import json,re,html
ROOT=Path(__file__).resolve().parent
CFG=json.loads((ROOT/'gallery-config.json').read_text(encoding='utf-8'))
EXTS={'.jpg','.jpeg','.png','.webp','.avif'}

def images(folder):
    p=ROOT/'content-images'/folder
    return sorted([x for x in p.iterdir() if x.is_file() and x.suffix.lower() in EXTS], key=lambda x:x.name.lower()) if p.exists() else []

def gallery_markup(files, page_depth=1):
    if not files:
        return '<div class="empty-gallery auto-gallery-empty"><strong>Gallery ready for your images</strong><p>Add approved images to the matching <code>content-images</code> folder. They will appear here automatically on the next build/deploy.</p></div>'
    figs=[]
    for f in files:
        rel=f.relative_to(ROOT).as_posix(); src='../'+rel if page_depth else rel
        label=html.escape(f.stem.replace('-',' ').replace('_',' ').strip().title())
        figs.append(f'<figure><button class="gallery-zoom" type="button" aria-label="Open {label}"><img src="{src}" alt="{label}" loading="lazy"></button></figure>')
    return '<div class="auto-gallery-grid">'+''.join(figs)+'</div>'

def replace_generated(text, markup):
    start='<!-- AUTO-GALLERY:START -->'; end='<!-- AUTO-GALLERY:END -->'
    block=start+markup+end
    if start in text and end in text:
        return re.sub(re.escape(start)+r'.*?'+re.escape(end),block,text,flags=re.S)
    # application pages: replace empty gallery once
    text,n=re.subn(r'<div class="empty-gallery">.*?</div>',block,text,count=1,flags=re.S)
    return text if n else text.replace('</section><section class="detail-cta',block+'</section><section class="detail-cta',1)

for slug,folder in CFG['applications'].items():
    p=ROOT/'applications'/f'{slug}.html'
    if p.exists(): p.write_text(replace_generated(p.read_text(encoding='utf-8'),gallery_markup(images(folder))),encoding='utf-8')

for finish in CFG['finishes']:
    p=ROOT/'finishes'/f'{finish}.html'
    if not p.exists(): continue
    text=p.read_text(encoding='utf-8'); fs=images('finishes/'+finish)
    if fs:
        markup=gallery_markup(fs)
        start='<!-- AUTO-GALLERY:START -->'; end='<!-- AUTO-GALLERY:END -->'; block=start+markup+end
        if start in text and end in text: text=re.sub(re.escape(start)+r'.*?'+re.escape(end),block,text,flags=re.S)
        else: text=re.sub(r'<div class="finish-gallery-grid">.*?</div>',block,text,count=1,flags=re.S)
        p.write_text(text,encoding='utf-8')
print('Website 10 galleries built successfully.')
