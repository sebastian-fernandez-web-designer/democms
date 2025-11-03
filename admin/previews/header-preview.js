// admin/previews/header-preview.js

// 1. Importa la lógica central (Asegúrate de que la ruta sea correcta desde el root del CMS)
import { applyDataToDOM } from '/assets/js/loadSection.js';

// 2. Define el mapeo del Header (Debe ser idéntico al de tu loadSection.js)
const HEADER_MAPPING = {
    header_background: "header-background",
    header_background_color: "header-section",
    header_background_mode: "header-section",
    header_title_es: "header-title",
    header_title_en: "header-title-en",
    header_subtitle_es: "header-subtitle",
    header_subtitle_en: "header-subtitle-en",
    header_button_link: "header-button-link",
    header_button_text_es: "header-button-text",
    header_button_text_en: "header-button-text-en",
    header_title_color: "header-title",
    header_subtitle_color: "header-subtitle",
    header_button_bg_color: "header-button-link"
};


// 3. Componente de Previsualización
const HeaderPreview = ({ entry, widgetsFor }) => {
    // 3a. Obtener los datos del CMS
    const data = entry.toJS().data;

    // 3b. Renderizar el HTML de la sección Header
    // Creamos el contenedor raíz del Preview
    const root = document.createElement('div');
    root.classList.add('preview-root-container');
    
    // NOTA: El HTML aquí debe ser exactamente el mismo que en tu sitio
    root.innerHTML = `
        <header id="header-section" class="d-flex masthead" style="position: relative; overflow: hidden;">
            <div class="lang-selector-header">...</div> 

            <img id="header-background" src="${data.header_background || ''}" alt="Fondo Header" class="header-cover" />

            <div id="header-content-container" class="container text-center my-auto">
                <h1 id="header-title" class="mb-1 lang-es">Título (ES)</h1>
                <h1 id="header-title-en" class="mb-1 lang-en">Title (EN)</h1>

                <h3 id="header-subtitle" class="mb-5 lang-es"><em>Subtítulo (ES)</em></h3>
                <h3 id="header-subtitle-en" class="mb-5 lang-en"><em>Subtitle (EN)</em></h3>

                <a id="header-button-link" class="btn btn-primary btn-xl" role="button" href="${data.header_button_link || '#'}">
                    <span id="header-button-text" class="lang-es">Texto Botón (ES)</span>
                    <span id="header-button-text-en" class="lang-en">Button Text (EN)</span>
                </a>
            </div>
        </header>
    `;

    // 3c. Llamar a la lógica central de aplicación de estilos
    // Pasamos el DOM del elemento raíz 'root' como contexto
    applyDataToDOM(data, HEADER_MAPPING, root);

    // 3d. Devolver el elemento manipulado
    return root; 
};

// 4. Registrar la plantilla de preview y el CSS del sitio
CMS.registerPreviewTemplate('header', HeaderPreview);
// Es fundamental cargar tu CSS para que el preview se vea bien
CMS.registerPreviewStyle("/assets/css/styles.css"); 
// (Asegúrate de que la ruta a tu CSS sea correcta desde la raíz del CMS)
