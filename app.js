const STORAGE_KEY = "garimpo-inteligente-products-v1";
const $ = (selector) => document.querySelector(selector);
let products = loadProducts();

function loadProducts(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]").map(p=>({...p,score:scoreProduct(p)}))}catch{return []}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(products));render()}
function money(value){return Number(value||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}
function scoreProduct(p){
  const fields = ["commissionRate","popularity","rating"];
  if(fields.some(key=>p[key]===undefined || p[key]===null || p[key]==="")) return null;
  const commission = Math.min(100,Math.max(0,Number(p.commissionRate)||0));
  const popularity = Math.min(100,Math.max(0,Number(p.popularity)||0));
  const rating = Math.min(100,Math.max(0,Number(p.rating)||0));
  const commissionScore = Math.min(100,commission*10);
  return Math.round(popularity*.40 + commissionScore*.25 + rating*.35);
}
function statusFor(p){if(p.score===null)return "incomplete";return p.score>=75?"selected":"review"}
function render(){
  const query=$("#searchInput").value.toLowerCase();
  const platform=$("#platformFilter").value;
  const status=$("#statusFilter").value;
  const visible=products.filter(p=>(p.name.toLowerCase().includes(query)||p.platform.toLowerCase().includes(query))&&(!platform||p.platform===platform)&&(!status||statusFor(p)===status)).sort((a,b)=>(b.score??-1)-(a.score??-1));
  $("#totalProducts").textContent=products.length;
  $("#selectedProducts").textContent=products.filter(p=>statusFor(p)==="selected").length;
  $("#totalClicks").textContent=products.reduce((sum,p)=>sum+(Number(p.clicks)||0),0);
  $("#totalCommission").textContent=money(products.reduce((sum,p)=>sum+(Number(p.commission)||0),0));
  $("#emptyState").hidden=products.length>0;
  const copySelect=$("#copyProduct");
  const selectedCopyId=copySelect.value;
  copySelect.innerHTML='<option value="">Selecione um produto</option>'+products.map(p=>'<option value="'+escapeAttr(p.id)+'">'+escapeHtml(p.name)+' — '+escapeHtml(p.platform)+'</option>').join("");
  if(products.some(p=>p.id===selectedCopyId))copySelect.value=selectedCopyId;
  $("#productList").innerHTML=visible.map(p=>`<article class="product-card"><div><h3>${escapeHtml(p.name)}</h3><div class="meta"><span>${escapeHtml(p.platform)}</span><span>${money(p.price)}</span><span>Comissão estimada: ${Number(p.commissionRate||0)}%</span><span>Cliques: ${Number(p.clicks)||0}</span></div><div class="product-actions">${p.url?`<a href="${escapeAttr(p.url)}" target="_blank" rel="noopener noreferrer">Abrir link</a>`:""}<button data-action="click" data-id="${p.id}">+1 clique</button><button data-action="commission" data-id="${p.id}">Registrar comissão</button><button data-action="delete" data-id="${p.id}" class="danger">Excluir</button></div></div><div class="score">${p.score===null?"—/100":p.score+"/100"}<small>${statusFor(p)==="selected"?"PONTUAÇÃO ALTA":statusFor(p)==="incomplete"?"DADOS INSUFICIENTES":"EM ANÁLISE"}</small></div></article>`).join("");
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function escapeAttr(s){return escapeHtml(s)}
$("#productForm").addEventListener("submit",event=>{
  event.preventDefault();
  const data=Object.fromEntries(new FormData(event.currentTarget).entries());
  if(data.platform==="TikTok Shop" && !/moda|femin|vestido|blusa|calça|saia|conjunto|sapato|bolsa|acessório/i.test(data.name+" "+data.notes)){
    alert("Lembrete: no seu fluxo, TikTok Shop é exclusivo para moda feminina. Confira se este produto pertence a essa categoria.");
  }
  const product={...data,id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),price:Number(data.price),originalPrice:Number(data.originalPrice)||0,coupon:String(data.coupon||"").trim(),commissionRate:Number(data.commissionRate)||0,popularity:Number(data.popularity)||0,rating:Number(data.rating)||0,clicks:0,commission:0,createdAt:new Date().toISOString()};
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
$("#generateCopy").addEventListener("click",()=>{
  const product=products.find(p=>p.id===$("#copyProduct").value);
  if(!product){alert("Cadastre ou selecione um produto primeiro.");return;}
  const price=money(product.price);
  const originalPrice=Number(product.originalPrice)||0;
  const hasRealDiscount=originalPrice>Number(product.price)&&Number(product.price)>=0;
  const savings=hasRealDiscount?originalPrice-Number(product.price):0;
  const discount=hasRealDiscount?Math.round((savings/originalPrice)*100):0;
  const coupon=String(product.coupon||"").trim();
  const link=String(product.url||"").trim();
  const openings=[
    "Olha essa opção que encontrei:",
    "Garimpei uma opção que pode valer a pena conferir:",
    "Dica de economia do dia:",
    "Pra quem está procurando isso, vale dar uma olhada:"
  ];
  const benefits=[
    "Confira os detalhes e veja se faz sentido pra você.",
    "Vale comparar as informações antes de decidir.",
    "Dá uma olhadinha nas características e no preço."
  ];
  const pick=(items)=>items[Math.floor(Math.random()*items.length)];
  const priceInfo=hasRealDiscount?"\n~~"+money(originalPrice)+"~~ por "+price+"\n🔥 Você economiza "+money(savings)+" ("+discount+"% de desconto)": "\n💰 "+price;
  const couponInfo=coupon?"\n🎟️ Cupom informado: "+coupon+"\n*Confira as regras e a validade do cupom na loja.*":"";
  const message=pick(openings)+"\n\n🛍️ "+product.name+priceInfo+couponInfo+"\n\n"+pick(benefits)+(link?"\n\n🔗 Confira aqui: "+link:"\n\nAdicione seu link de afiliado antes de publicar.")+"\n\n*Preço e disponibilidade podem mudar conforme a loja.*";
  $("#copyOutput").value=message;
});
$("#copyMessage").addEventListener("click",async()=>{
  const output=$("#copyOutput");
  if(!output.value.trim()){alert("Gere uma mensagem antes de copiar.");return;}
  try{await navigator.clipboard.writeText(output.value);alert("Mensagem copiada! Revise antes de publicar.");}
  catch{output.select();alert("Selecione o texto e copie com Ctrl+C.");}
});
$("#exportCsv").addEventListener("click",()=>{
  const header=["Produto","Plataforma","Preço","Comissão estimada (%)","Pontuação","Cliques","Comissão recebida","Link"];
  const rows=products.map(p=>[p.name,p.platform,p.price,p.commissionRate,p.score,p.clicks,p.commission,p.url]);
  const csv=[header,...rows].map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(";")).join("\n");
  const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="garimpo-inteligente-produtos.csv";a.click();URL.revokeObjectURL(url);
});
render();