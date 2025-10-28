# Laboratorio de Ideas Oasis

Tablero **Kanban** ligero (HTML/CSS/JS puros) para organizar ideas y proyectos.  
Mobile-first para iPad/cel, estilo **negro/dorado**, persistencia en **localStorage**, **drag & drop**, **búsqueda**, **filtros**, **ICE score**, **exportar/importar JSON**.

## Estructura
- `index.html` – Vista principal y componentes (#Backlog #En Proceso #Hecho)
- `styles.css` – Estilos negros/dorados + responsive
- `app.js` – Lógica, localStorage, drag&drop, filtros, export/import

## Uso rápido
1. Sube la carpeta a tu repo de GitHub y habilita **GitHub Pages**.
2. Abre la URL de Pages en tu iPad/iPhone o desktop.
3. Agrega ideas desde el formulario. Arrástralas entre columnas.
4. Usa **Exportar JSON** para backup, y **Importar JSON** para restaurar/merge.

## Campos
- **Título** (obligatorio), **Descripción**
- **Categoría** (Finanzas, Diagnóstico, Marketing, Operaciones, Producto, Otros)
- **Prioridad** (Alta/Media/Baja)
- **Etiquetas** (#tag1, #tag2)
- **ICE** = (Impacto + Confianza + Facilidad) / 3
- **Fecha objetivo**

## Tips
- Usa la búsqueda para filtrar por título/tags/categoría.
- Conservarás tus ideas automáticamente en el dispositivo (localStorage).
- JSON exportado: `oasis_lab_ideas.json`.

## Firma de marca
Footer sugerido (ya incluido en la sidebar):
> **© Oasis Air Cleaner Services LLC × GPT-5 — Innovación, disciplina y tecnología como uno solo.**
