const STORAGE_KEY = "garimpo-inteligente-products-v1";
const $ = (selector) => document.querySelector(selector);
let products = loadProducts();

function loadProducts(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return []}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(products));render()}
function money(value){return Number(value||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
function scoreProduct(p){
  const popularity = Math.min(100,Math.max(0,Number(p.popularity)||0));
  const rating = Math.min(100,Math.max(0,Number(p.rating)||0));
  const commission = Math.min(100,Math.max(0,Number(p.commissionRate)||0));
  const commissionScore = Math.min(100,commission*5);
  const priceScore = Number(p.price)>0 ? (Number(p.price)<=100?85:Number(p.price)<=300?70:55) : 0;
  const contentScore = p.platform==="TikTok Shop"?90:75;
  return Math.round(popularity*.25 + commissionScore*.20 + priceScore*.15 + rating*.15 + popularity*.15 + contentScore*.10);
}
function statusFor(p){return p.score>=70?"selected":"review"}
function render(){
  const query=$("#searchInput").value.toLowerCase();
  const platform=$("#platformFilter").value;
  const status=$("#statusFilter").value;
  const visible=products.filter(p=>(p.name.toLowerCase().includes(query)||p.platform.toLowerCase().includes(query))&&(!platform||p.platform===platform)&&(!status||statusFor(p)===status)).sort((a,b)=>b.score-a.score);
  $("#totalProducts").textContent=products.length;
  $("#selectedProducts").textContent=products.filter(p=>statusFor(p)==="selected").length;
  $("#totalClicks").textContent=products.reduce((sum,p)=>sum+(Number(p.clicks)||0),0);
  $("#totalCommission").textContent=money(products.reduce((sum,p)=>sum+(Number(p.commission)||0),0));
  $("#emptyState").hidden=products.length>0;
  $("#productList").innerHTML=visible.map(p=>`<article class="product-card"><div><h3>${escapeHtml(p.name)}</h3><div class="meta"><span>${escapeHtml(p.platform)}</span><span>${money(p.price)}</span><span>Comissão estimada: ${Number(p.commissionRate||0)}%</span><span>Cliques: ${Number(p.clicks)||0}</span></div><div class="product-actions">${p.url?`<a href="${escapeAttr(p.url)}" target="_blank" rel="noopener noreferrer">Abrir link</a>`:""}<button data-action="click" data-id="${p.id}">+1 clique</button><button data-action="commission" data-id="${p.id}">Registrar comissão</button><button data-action="delete" data-id="${p.id}" class="danger">Excluir</button></div></div><div class="score">${p.score}/100<small>${statusFor(p)==="selected"?"POTENCIAL ALTO":"EM ANÁLISE"}</small></div></article>`).join("");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s)}
$("#productForm").addEventListener("submit",event=>{
  event.preventDefault();
  const data=Object.fromEntries(new FormData(event.currentTarget).entries());
  if(data.platform==="TikTok Shop" && !/moda|femin|vestido|blusa|calça|saia|conjunto|sapato|bolsa|acessório/i.test(data.name+" "+data.notes)){
    alert("Lembrete: no seu fluxo, TikTok Shop é exclusivo para moda feminina. Confira se este produto pertence a essa categoria.");
  }
  const product={...data,id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),price:Number(data.price),commissionRate:Number(data.commissionRate)||0,popularity:Number(data.popularity)||0,rating:Number(data.rating)||0,clicks:0,commission:0,createdAt:new Date().toISOString()};
  product.score=scoreProduct(product);products.push(product);event.currentTarget.reset();save();
});
$("#productList").addEventListener("click",event=>{
  const button=event.target.closest("button[data-action]");if(!button)return;
  const product=products.find(p=>p.id===button.dataset.id);if(!product)return;
  if(button.dataset.action==="click")product.clicks=(Number(product.clicks)||0)+1;
  if(button.dataset.action==="commission"){const value=prompt("Qual comissão recebida em reais?","0,00");if(value===null)return;product.commission=(Number(product.commission)||0)+Number(value.replace(",","."));}
  if(button.dataset.action==="delete"&&!confirm("Excluir este produto?"))return;
  if(button.dataset.action==="delete")products=products.filter(p=>p.id!==product.id);
  save();
});
["searchInput","platformFilter","statusFilter"].forEach(id=>$("#"+id).addEventListener("input",render));
$("#exportCsv").addEventListener("click",()=>{
  const header=["Produto","Plataforma","Preço","Comissão estimada (%)","Pontuação","Cliques","Comissão recebida","Link"];
  const rows=products.map(p=>[p.name,p.platform,p.price,p.commissionRate,p.score,p.clicks,p.commission,p.url]);
  const csv=[header,...rows].map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(";")).join("\n");
  const blob=new Blob(["\\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="garimpo-inteligente-produtos.csv";a.click();URL.revokeObjectURL(url);
});
render();