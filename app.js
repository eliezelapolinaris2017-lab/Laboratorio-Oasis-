// ====== Utilidades ======
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const storeKey = "oasis_ideas_v1";

const uid = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);

// ICE = (impact + confidence + ease) / 3
const iceScore = (i,c,e) => {
  const n = (Number(i)||0)+(Number(c)||0)+(Number(e)||0);
  return Math.round((n/3)*10)/10; // 1 decimal
};

const load = () => JSON.parse(localStorage.getItem(storeKey) || "[]");
const save = (data) => localStorage.setItem(storeKey, JSON.stringify(data));

// ====== Estado ======
let ideas = load();

// ====== Render ======
function render() {
  // Filtros
  const q = ($("#searchInput").value || "").toLowerCase().trim();
  const fCat = $("#filterCategory").value;
  const fPri = $("#filterPriority").value;

  // Limpiar columnas
  ["backlog","doing","done"].forEach(status=>{
    $("#col-"+status).innerHTML = "";
  });

  let counts = { backlog:0, doing:0, done:0 };

  ideas
    .filter(it => {
      if (fCat && it.category !== fCat) return false;
      if (fPri && it.priority !== fPri) return false;
      if (!q) return true;
      const hay = [
        it.title, it.description, it.category, it.priority,
        (it.tags||[]).join(",")
      ].join(" ").toLowerCase();
      return hay.includes(q);
    })
    .forEach(it => {
      const card = buildCard(it);
      $("#col-"+it.status).appendChild(card);
      counts[it.status]++;
    });

  $("#count-backlog").textContent = counts.backlog;
  $("#count-doing").textContent  = counts.doing;
  $("#count-done").textContent   = counts.done;
}

function buildCard(it){
  const t = $("#cardTemplate").content.cloneNode(true);
  const el = t.querySelector(".card");

  el.dataset.id = it.id;
  el.querySelector(".title").textContent = it.title;
  t.querySelector(".priority").textContent = it.priority;
  t.querySelector(".priority").dataset.p = it.priority;
  t.querySelector(".category").textContent = it.category;
  t.querySelector(".ice").textContent = `ICE ${iceScore(it.impact,it.confidence,it.ease)}`;

  t.querySelector(".desc").textContent = it.description || "";

  const tagsBox = t.querySelector(".tags");
  (it.tags||[]).forEach(tag=>{
    const span = document.createElement("span");
    span.className = "tag";
    span.textContent = `#${tag}`;
    tagsBox.appendChild(span);
  });

  t.querySelector(".due").textContent = it.due ? `⏳ ${new Date(it.due).toLocaleDateString()}` : "";

  // Eventos card
  el.addEventListener("dragstart", onDragStart);
  el.addEventListener("dragend", onDragEnd);

  el.querySelector(".delete").addEventListener("click", ()=>{
    ideas = ideas.filter(x => x.id !== it.id);
    save(ideas); render();
  });

  el.querySelector(".edit").addEventListener("click", ()=> openEdit(it.id));

  el.querySelectorAll(".move").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const dir = btn.dataset.move;
      const order = ["backlog","doing","done"];
      let idx = order.indexOf(it.status);
      if (dir === "-1") idx = Math.max(0, idx-1);
      if (dir === "+1") idx = Math.min(order.length-1, idx+1);
      it.status = order[idx];
      save(ideas); render();
    });
  });

  return t;
}

// ====== Drag & Drop ======
let draggedId = null;
function onDragStart(e){
  draggedId = e.currentTarget.dataset.id;
  e.dataTransfer.effectAllowed = "move";
}
function onDragEnd(){
  draggedId = null;
}
$$(".dropzone").forEach(zone=>{
  zone.addEventListener("dragover", e=>{
    e.preventDefault();
    zone.classList.add("drag-over");
  });
  zone.addEventListener("dragleave", ()=> zone.classList.remove("drag-over"));
  zone.addEventListener("drop", e=>{
    e.preventDefault();
    zone.classList.remove("drag-over");
    const id = draggedId;
    if (!id) return;
    const item = ideas.find(x=>x.id===id);
    const status = zone.id.replace("col-","");
    item.status = status;
    save(ideas); render();
  });
});

// ====== Formulario nueva idea ======
$("#ideaForm").addEventListener("submit", e=>{
  e.preventDefault();
  const fd = new FormData(e.currentTarget);
  const idea = {
    id: uid(),
    title: (fd.get("title")||"").toString().trim(),
    description: (fd.get("description")||"").toString().trim(),
    category: fd.get("category").toString(),
    priority: fd.get("priority").toString(),
    tags: (fd.get("tags")||"").toString().split(",").map(s=>s.trim()).filter(Boolean),
    impact: Number(fd.get("impact")||0),
    confidence: Number(fd.get("confidence")||0),
    ease: Number(fd.get("ease")||0),
    due: fd.get("due") || "",
    status: "backlog",
    createdAt: Date.now()
  };
  if (!idea.title) return;
  ideas.unshift(idea);
  save(ideas); render();
  e.currentTarget.reset();
});

// ====== Editar ======
const editDialog = $("#editDialog");
function openEdit(id){
  const it = ideas.find(x=>x.id===id);
  if(!it) return;
  const f = $("#editForm");
  f.id.value = it.id;
  f.title.value = it.title;
  f.description.value = it.description || "";
  f.category.value = it.category;
  f.priority.value = it.priority;
  f.tags.value = (it.tags||[]).join(", ");
  f.impact.value = it.impact;
  f.confidence.value = it.confidence;
  f.ease.value = it.ease;
  f.due.value = it.due || "";
  editDialog.showModal();
}

$("#editForm").addEventListener("submit", e=>{
  e.preventDefault();
  const btn = document.activeElement?.value || "cancel";
  if (btn !== "save"){ editDialog.close(); return; }
  const fd = new FormData(e.currentTarget);
  const id = fd.get("id");
  const it = ideas.find(x=>x.id===id);
  if(!it) return;
  it.title = fd.get("title").toString().trim();
  it.description = (fd.get("description")||"").toString().trim();
  it.category = fd.get("category").toString();
  it.priority = fd.get("priority").toString();
  it.tags = (fd.get("tags")||"").toString().split(",").map(s=>s.trim()).filter(Boolean);
  it.impact = Number(fd.get("impact")||0);
  it.confidence = Number(fd.get("confidence")||0);
  it.ease = Number(fd.get("ease")||0);
  it.due = fd.get("due") || "";
  save(ideas); render(); editDialog.close();
});

// ====== Filtros, búsqueda, acciones ======
$("#searchInput").addEventListener("input", render);
$("#filterCategory").addEventListener("change", render);
$("#filterPriority").addEventListener("change", render);

$("#btnExport").addEventListener("click", ()=>{
  const data = JSON.stringify(ideas, null, 2);
  const blob = new Blob([data], {type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), {
    href:url, download:"oasis_lab_ideas.json"
  });
  document.body.appendChild(a); a.click();
  setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
});

$("#fileImport").addEventListener("change", async (e)=>{
  const file = e.target.files?.[0];
  if(!file) return;
  try{
    const text = await file.text();
    const data = JSON.parse(text);
    if(!Array.isArray(data)) throw new Error("Formato inválido");
    // Merge conservando IDs existentes; evita duplicados por id
    const map = new Map(ideas.map(i=>[i.id,i]));
    data.forEach(d=>{
      if(!d.id) d.id = uid();
      map.set(d.id, {...map.get(d.id), ...d});
    });
    ideas = Array.from(map.values());
    save(ideas); render();
  }catch(err){
    alert("Error al importar JSON: " + err.message);
  }finally{
    e.target.value = "";
  }
});

$("#btnClear").addEventListener("click", ()=>{
  if(!confirm("¿Borrar TODO el laboratorio de ideas?")) return;
  ideas = []; save(ideas); render();
});

// ====== Seed opcional la primera vez ======
if(ideas.length === 0){
  ideas = [
    {
      id: uid(),
      title: "Firma unificada en todas las apps (footer dorado)",
      description: "Reutilizar el footer Oasis × GPT-5 con animación sutil.",
      category: "Producto", priority: "Media",
      tags: ["branding","UI"],
      impact: 6, confidence: 9, ease: 9, due: "", status: "done",
      createdAt: Date.now()
    },
    {
      id: uid(),
      title: "Agenda con bloqueo de horario y WhatsApp",
      description: "Calendario con selección por hora, bloqueo y confirmación por WhatsApp.",
      category: "Operaciones", priority: "Alta",
      tags: ["agenda","whatsapp","clients"],
      impact: 9, confidence: 8, ease: 6, due: "", status: "doing",
      createdAt: Date.now()
    },
    {
      id: uid(),
      title: "Base masiva de códigos de error (SQLite / JSON)",
      description: "Integrar búsqueda, marcas AirMax, Gree, Midea, etc.",
      category: "Diagnóstico", priority: "Alta",
      tags: ["códigos","HVAC","db"],
      impact: 10, confidence: 9, ease: 5, due: "", status: "backlog",
      createdAt: Date.now()
    }
  ];
  save(ideas);
}

// ====== Go ======
render();
