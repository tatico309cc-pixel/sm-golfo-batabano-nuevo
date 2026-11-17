const DB="sm-golfo-batabano-db", STORE="records", KEY="sm-golfo-settings";
const $=s=>document.querySelector(s);
let db=null;
let dbReady=null;

function openDB(){
  if(dbReady) return dbReady;
  dbReady=new Promise((resolve,reject)=>{
    if(!("indexedDB" in window)){reject(new Error("Este navegador no permite almacenamiento IndexedDB."));return;}
    const request=indexedDB.open(DB,1);
    request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains(STORE))request.result.createObjectStore(STORE,{keyPath:"id",autoIncrement:true});};
    request.onsuccess=()=>{db=request.result;db.onversionchange=()=>db.close();resolve(db);};
    request.onerror=()=>reject(request.error||new Error("No se pudo abrir la base de datos."));
    request.onblocked=()=>reject(new Error("La base de datos está bloqueada por otra pestaña. Cierre otras pestañas de esta aplicación y vuelva a intentarlo."));
  });
  return dbReady;
}
async function withStore(mode,action){
  await openDB();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,mode), store=tx.objectStore(STORE);
    let result;
    try{result=action(store);}catch(err){reject(err);return;}
    tx.oncomplete=()=>resolve(result);
    tx.onerror=()=>reject(tx.error||new Error("Falló la operación de almacenamiento."));
    tx.onabort=()=>reject(tx.error||new Error("La operación de almacenamiento fue cancelada."));
  });
}
function allRecords(){
  return new Promise(async(resolve,reject)=>{
    try{
      await openDB();
      const request=db.transaction(STORE,"readonly").objectStore(STORE).getAll();
      request.onsuccess=()=>resolve(request.result||[]);
      request.onerror=()=>reject(request.error||new Error("No se pudieron leer los registros."));
    }catch(err){reject(err);}
  });
}
function saveRecord(item){
  return new Promise(async(resolve,reject)=>{
    try{
      await openDB();
      const request=db.transaction(STORE,"readwrite").objectStore(STORE).add(item);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error("No se pudo guardar el registro."));
    }catch(err){reject(err);}
  });
}
function settings(){try{return JSON.parse(localStorage.getItem(KEY)||"{}")}catch{return {}}}
function saveSettings(v){localStorage.setItem(KEY,JSON.stringify(v))}
function showMessage(el,message,type="info"){
  el.textContent=message;
  el.className="notice "+(type==="error"?"error":type==="success"?"success":"");
}
function showTab(id){
  document.querySelectorAll(".pane").forEach(x=>x.classList.toggle("active",x.id===id));
  document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x.dataset.tab===id));
  if(id==="registros"){renderRecords().catch(err=>showMessage($("#storageStatus"),"No se pudieron cargar los registros: "+err.message,"error"));}
}
document.querySelectorAll("nav button").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.tab)));

function evaluate(v){
 const missing=[];
 if(v.limViento===""||v.limOlas==="")missing.push("límites operacionales");
 const wind=v.limViento!==""&&Number(v.viento)>Number(v.limViento);
 const wave=v.limOlas!==""&&Number(v.olas)>Number(v.limOlas);
 let status="INCOMPLETA", cls="warn", detail="No se puede emitir una conclusión operacional completa porque faltan límites de referencia.";
 if(!missing.length){
   if(wind||wave){status="LÍMITE EXCEDIDO";cls="bad";detail="Se excede "+[wind?"el límite de viento":"",wave?"el límite de altura de olas":""].filter(Boolean).join(" y ")+". Recomendar la suspensión o restricción de la navegación y someter la decisión a la Administración."}
   else{status="DENTRO DE LOS LÍMITES INTRODUCIDOS";cls="good";detail="Los valores introducidos no exceden los límites configurados. Esto no constituye por sí solo autorización para navegar; deben verificarse el resto de las condiciones y restricciones."}
 }
 return {status,cls,detail};
}
$("#weatherForm").addEventListener("submit",async e=>{
 e.preventDefault();
 const form=e.currentTarget;
 if(!form.reportValidity())return;
 const submit=form.querySelector('button[type="submit"]');
 submit.disabled=true;
 const f=Object.fromEntries(new FormData(form));
 const cfg=settings();
 if(!f.limViento)f.limViento=cfg.limViento??"";
 if(!f.limOlas)f.limOlas=cfg.limOlas??"";
 const ev=evaluate(f), item={...f,...ev,created:new Date().toISOString()};
 try{
   const id=await saveRecord(item);
   item.id=id;
   renderResult(item);
   $("#saveStatus").textContent="Evaluación guardada correctamente en este dispositivo. Número de registro: "+id+".";
   $("#saveStatus").className="notice success";
 }catch(err){
   $("#saveStatus").textContent="No se pudo guardar la evaluación: "+err.message;
   $("#saveStatus").className="notice error";
 }finally{submit.disabled=false;}
});
function renderResult(x){
 const el=$("#result");el.className="result "+x.cls;
 el.innerHTML=`<h3>${esc(x.status)}</h3><p>${esc(x.detail)}</p><p><b>Sector:</b> ${esc(x.sector)} · <b>Viento:</b> ${esc(x.viento)} nudos · <b>Olas:</b> ${esc(x.olas)} m</p><p><b>Sentido:</b> ${esc(x.sentido)}</p><p><b>Fundamento de referencia:</b> DSIM Instrucción 5/2008 y límites operacionales introducidos por el usuario.</p><div class="actions"><button class="primary" id="docBtn">Generar informe imprimible</button></div>`;
 $("#docBtn").onclick=()=>printReport(x);
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function printReport(x){
 const w=window.open("","_blank");
 if(!w){alert("Permita las ventanas emergentes para generar el informe.");return}
 w.document.write(`<!doctype html><html lang="es"><meta charset="utf-8"><title>Informe SM-GOLFO-BATABANÓ</title><style>body{font:12pt Arial;margin:2cm;color:#111}h1{text-align:center;font-size:17pt}h2{font-size:13pt;margin-top:24px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #555;padding:8px;text-align:left}.firma{margin-top:65px;display:flex;justify-content:space-between}</style><h1>INFORME DE EVALUACIÓN DE SEGURIDAD HIDROMETEOROLÓGICA</h1><p><b>Fecha del pronóstico:</b> ${esc(x.fecha)}<br><b>Sentido:</b> ${esc(x.sentido)}<br><b>Sector:</b> ${esc(x.sector)}</p><h2>1. Datos meteorológicos</h2><table><tr><th>Parámetro</th><th>Pronóstico</th><th>Límite aplicado</th></tr><tr><td>Viento</td><td>${esc(x.viento)} nudos; dirección ${esc(x.dirViento||"No indicada")}°</td><td>${esc(x.limViento||"No configurado")} nudos</td></tr><tr><td>Altura de olas</td><td>${esc(x.olas)} m</td><td>${esc(x.limOlas||"No configurado")} m</td></tr></table><h2>2. Evaluación</h2><p><b>${esc(x.status)}</b></p><p>${esc(x.detail)}</p><h2>3. Restricciones y observaciones</h2><p>${esc(x.restricciones||"Sin observaciones consignadas")}</p><p>${esc(x.observaciones||"Sin observaciones meteorológicas adicionales")}</p><h2>4. Referencia normativa</h2><p>DSIM Instrucción 5 de 2008 y límites operacionales de la Administración introducidos para esta evaluación. Verificar vigencia, aplicabilidad y documentación oficial antes de adoptar decisiones.</p><h2>5. Decisión de la Administración</h2><p>________________________________________________________________________</p><p>________________________________________________________________________</p><div class="firma"><span>Elaborado por: __________________</span><span>Fecha: __________</span></div><script>window.onload=()=>window.print()<\/script></html>`);
 w.document.close();
}
async function renderRecords(){
 const arr=await allRecords();
 $("#records").innerHTML=arr.length?arr.sort((a,b)=>b.id-a.id).map(x=>`<article><h3>${esc(x.status)} — ${esc(x.sector)}</h3><p>${esc(x.fecha)} · ${esc(x.sentido)} · Viento ${esc(x.viento)} kn · Olas ${esc(x.olas)} m</p><button data-id="${x.id}" class="openrec">Ver informe</button></article>`).join(""):"No hay registros guardados.";
 document.querySelectorAll(".openrec").forEach(b=>b.onclick=async()=>{
   try{const x=(await allRecords()).find(y=>y.id===Number(b.dataset.id));if(x){renderResult(x);showTab("analisis")}}
   catch(err){showMessage($("#storageStatus"),"No se pudo abrir el registro: "+err.message,"error")}
 });
}
$("#clearForm").onclick=()=>{$("#weatherForm").reset();$("#saveStatus").textContent="";};
$("#configForm").addEventListener("submit",e=>{
 e.preventDefault();
 try{saveSettings(Object.fromEntries(new FormData(e.target)));alert("Configuración guardada en este dispositivo.");}
 catch(err){alert("No se pudo guardar la configuración: "+err.message);}
});
$("#configForm").elements.limViento.value=settings().limViento??"";
$("#configForm").elements.limOlas.value=settings().limOlas??"";
$("#configForm").elements.normativa.value=settings().normativa??"DSIM Instrucción 5 de 2008";
$("#savePorts").onclick=()=>{
 try{const s=settings();s.puertos={gerona:$("#calGerona").value,batabano:$("#calBatabano").value,cayo:$("#calCayo").value};saveSettings(s);alert("Datos de puertos guardados.");}
 catch(err){alert("No se pudieron guardar los datos: "+err.message);}
};
const ports=settings().puertos||{};
$("#calGerona").value=ports.gerona||"";
$("#calBatabano").value=ports.batabano||"";
$("#calCayo").value=ports.cayo||"";

$("#exportData").onclick=async()=>{
 try{
   const payload={version:1,exported:new Date().toISOString(),settings:settings(),records:await allRecords()};
   const a=document.createElement("a"),url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
   a.href=url;a.download="respaldo-SM-GOLFO-BATABANO.json";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch(err){showMessage($("#storageStatus"),"No se pudo crear el respaldo: "+err.message,"error");}
};
$("#importData").onchange=async e=>{
 const f=e.target.files[0];if(!f)return;
 try{
   const p=JSON.parse(await f.text());
   if(!Array.isArray(p.records))throw Error("Formato no válido");
   if(!confirm("La importación añadirá los registros al dispositivo. ¿Continuar?"))return;
   if(p.settings)saveSettings(p.settings);
   for(const r of p.records){const {id,...rest}=r;await saveRecord(rest);}
   alert("Respaldo importado.");await renderRecords();
 }catch(err){alert("No se pudo importar: "+err.message);}
 e.target.value="";
};

// Prueba aislada: escribe, lee y elimina inmediatamente un registro técnico temporal.
$("#testStorage").onclick=async()=>{
 const button=$("#testStorage");button.disabled=true;
 const status=$("#storageStatus");showMessage(status,"Ejecutando prueba de almacenamiento…");
 let testId=null;
 try{
   await openDB();
   const marker="SM-TEST-"+Date.now()+"-"+Math.random().toString(16).slice(2);
   testId=await saveRecord({tipo:"PRUEBA_TECNICA_TEMPORAL",marker,created:new Date().toISOString()});
   const read=await new Promise((resolve,reject)=>{
     const req=db.transaction(STORE,"readonly").objectStore(STORE).get(testId);
     req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
   });
   if(!read||read.marker!==marker)throw new Error("El dato escrito no coincide con el dato recuperado.");
   await new Promise((resolve,reject)=>{
     const req=db.transaction(STORE,"readwrite").objectStore(STORE).delete(testId);
     req.onsuccess=()=>resolve();req.onerror=()=>reject(req.error);
   });
   testId=null;
   showMessage(status,"Prueba satisfactoria: el almacenamiento escribió, recuperó y eliminó el dato temporal. No se conservó ningún registro de prueba.","success");
 }catch(err){
   if(testId!==null){try{await new Promise(resolve=>{const req=db.transaction(STORE,"readwrite").objectStore(STORE).delete(testId);req.onsuccess=req.onerror=()=>resolve();});}catch{}}
   showMessage(status,"Prueba de almacenamiento fallida: "+err.message,"error");
 }finally{button.disabled=false;}
};

function net(){const on=navigator.onLine;$("#net").textContent=on?"Con conexión":"Sin conexión";$("#net").style.color=on?"#d8e9f4":"#ffd28a";}
addEventListener("online",net);addEventListener("offline",net);net();
openDB().then(()=>showMessage($("#storageStatus"),"Almacenamiento local disponible.","success")).catch(err=>showMessage($("#storageStatus"),"Error al iniciar el almacenamiento: "+err.message,"error"));
if("serviceWorker" in navigator){navigator.serviceWorker.register("./sw.js").catch(e=>console.error("SW",e));}
