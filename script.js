(() => {
  const menuButton=document.querySelector('.menu-button'), navigation=document.getElementById('primary-navigation');
  if(menuButton&&navigation){const close=()=>{navigation.classList.remove('open');menuButton.setAttribute('aria-expanded','false')};menuButton.addEventListener('click',()=>{const o=navigation.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(o))});navigation.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));}
  document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{const c=button.dataset.filter;document.querySelectorAll('.filter').forEach(f=>f.classList.toggle('is-active',f===button));document.querySelectorAll('.stone-card').forEach(card=>card.hidden=c!=='all'&&card.dataset.category!==c)}));

  const projectType=document.getElementById('project-type'), requests=document.getElementById('material-requests'), addButton=document.getElementById('add-material-request');
  const materials=[...document.querySelectorAll('.stone-card')].map(c=>c.dataset.material);
  const apps={residential:['Kitchens & Countertops','Bathrooms','Salons / Living Spaces','Facades','Swimming Pools','Terraces','Waterjet / Bespoke Details'],commercial:['Kitchens / Hospitality Counters','Bathrooms','Salons / Common Areas','Facades','Waterjet / Bespoke Details','Other Commercial Applications']};
  const finishes=['Not decided','Polished','Honed / Matte','Leathered','Brushed','Sandblasted','Bush Hammered','Flamed','Tumbled','Other / To discuss'];
  let requestNo=0;
  const option=(v,label=v)=>`<option value="${v}">${label}</option>`;
  function renumber(){[...requests.children].forEach((card,i)=>{card.querySelector('.request-number').textContent=String(i+1).padStart(2,'0');card.querySelector('.remove-request').hidden=requests.children.length===1;});}
  function refreshApplications(){const type=projectType.value;requests.querySelectorAll('.application-select').forEach(sel=>{const old=sel.value;sel.innerHTML='<option value="">Select application</option>'+((apps[type]||[]).map(x=>option(x)).join(''));if([...sel.options].some(o=>o.value===old))sel.value=old;});}
  function addRequest(prefill=''){
    requestNo++;const card=document.createElement('section');card.className='material-request-card';card.innerHTML=`<div class="request-card-head"><p>Material Request <span class="request-number"></span></p><button type="button" class="remove-request">Remove</button></div><div class="form-row"><label>Project area / application<select class="application-select" name="requests[${requestNo}][application]" required></select></label><label>Material<input class="request-material" name="requests[${requestNo}][material]" list="material-options" value="${prefill.replace(/"/g,'&quot;')}" placeholder="Stone name"></label></div><div class="form-row"><label>Approximate quantity<input name="requests[${requestNo}][quantity]" placeholder="e.g. 35"></label><label>Unit<select name="requests[${requestNo}][unit]"><option>m²</option><option>pieces</option><option>linear m</option><option>To discuss</option></select></label></div><div class="form-row"><label>Finish preference<select name="requests[${requestNo}][finish]">${finishes.map(x=>option(x)).join('')}</select></label><label>Area notes<input name="requests[${requestNo}][notes]" placeholder="e.g. island + countertops"></label></div>`;
    card.querySelector('.remove-request').addEventListener('click',()=>{card.remove();renumber()});requests.append(card);refreshApplications();renumber();
  }
  if(requests){const dl=document.createElement('datalist');dl.id='material-options';dl.innerHTML=materials.map(x=>option(x)).join('');requests.after(dl);addRequest();addButton.addEventListener('click',()=>addRequest());projectType.addEventListener('change',refreshApplications);}
  document.querySelectorAll('.request-stone').forEach(link=>link.addEventListener('click',()=>{if(requests)addRequest(link.dataset.material||'')}));
  const params=new URLSearchParams(location.search);if(params.has('material')&&requests){const slug=params.get('material');const found=materials.find(m=>m.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')===slug);if(found){const first=requests.querySelector('.request-material');if(first&&!first.value)first.value=found;else addRequest(found);}}

  const attachmentInput=document.getElementById('attachments'),fileList=document.getElementById('file-list');let selectedFiles=[];const max=10*1024*1024,types=new Set(['application/pdf','image/jpeg','image/png','image/webp']);
  function sync(){const dt=new DataTransfer();selectedFiles.forEach(f=>dt.items.add(f));attachmentInput.files=dt.files}function render(){fileList.replaceChildren();selectedFiles.forEach((f,i)=>{const li=document.createElement('li'),s=document.createElement('span'),b=document.createElement('button');s.textContent=`${f.name} (${Math.ceil(f.size/1024)} KB)`;b.type='button';b.textContent='Remove';b.onclick=()=>{selectedFiles.splice(i,1);sync();render()};li.append(s,b);fileList.append(li)})}
  if(attachmentInput)attachmentInput.addEventListener('change',()=>{const rejected=[];Array.from(attachmentInput.files).forEach(f=>{if(!types.has(f.type))rejected.push(`${f.name}: unsupported format`);else if(f.size>max)rejected.push(`${f.name}: exceeds 10 MB`);else if(!selectedFiles.some(s=>s.name===f.name&&s.size===f.size))selectedFiles.push(f)});sync();render();if(rejected.length)document.querySelector('.form-result').textContent=`Not added: ${rejected.join('; ')}.`});
  const form=document.getElementById('quote-form');if(form){const result=form.querySelector('.form-result');form.addEventListener('submit',e=>{e.preventDefault();if(!form.checkValidity()){form.reportValidity();result.textContent='Please complete the required fields and select a project type.';return}result.textContent=`Your enquiry with ${requests.children.length} material/area request${requests.children.length===1?'':'s'}${selectedFiles.length?` and ${selectedFiles.length} attachment${selectedFiles.length===1?'':'s'}`:''} is ready for review. This local draft does not send or store information.`})}
})();
/* Website 10 generated-gallery lightbox */
(() => {
  const imgs=[...document.querySelectorAll('.auto-gallery-grid img')];
  if(!imgs.length) return;
  const box=document.createElement('div'); box.className='w10-lightbox'; box.hidden=true;
  box.innerHTML='<button type="button" aria-label="Close image">×</button><img alt="">'; document.body.append(box);
  const big=box.querySelector('img'); const close=()=>{box.hidden=true;document.body.style.overflow=''};
  imgs.forEach(img=>img.closest('button')?.addEventListener('click',()=>{big.src=img.src;big.alt=img.alt;box.hidden=false;document.body.style.overflow='hidden'}));
  box.querySelector('button').addEventListener('click',close); box.addEventListener('click',e=>{if(e.target===box)close()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden)close()});
})();
