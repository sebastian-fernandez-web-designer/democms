// assets/js/loadSection.js
(function() {
    function loadSection(sectionName, mapping) {
      fetch(`content/${sectionName}.md`)
        .then(response => {
          if (!response.ok) throw new Error(`No se pudo cargar ${sectionName}.md (${response.status})`);
          return response.text();
        })
        .then(text => {
          const data = parseFrontMatter(text);
          // =============================================================
          // NUEVA LÓGICA: CONTROL VISUAL DE FOOTER Y TEMPORIZADOR DE DEMO
          // =============================================================
          const showDemoKey = 'show_demo_timer';
          // Solo ejecutamos si es la sección 'header' (donde definiste la clave en el CMS)
          if (sectionName === 'header' && typeof data[showDemoKey] !== 'undefined') {
            
            const rawValue = String(data[showDemoKey]).trim().toLowerCase();
            const isVisible = rawValue === 'true'; 
            
            const footer = document.getElementById('demo-footer');
            const timer = document.getElementById('demo-timer');
            
            // Usamos '' para que el CSS original (position: fixed) funcione al mostrar
            const displayStyle = isVisible ? '' : 'none'; 
  
            if (footer) footer.style.display = displayStyle;
            if (timer) timer.style.display = displayStyle;
          }
          // =============================================================
  
          for (const key in mapping) {
            const elementId = mapping[key];
            const el = document.getElementById(elementId);
            if (!el || typeof data[key] === 'undefined') continue;
  
            const rawValue = String(data[key]).trim();
  
            // Manejo específico: header background mode (image | color | none)
            if (key === 'header_background_mode') {
              const header = document.getElementById('header-section');
              const img = document.getElementById('header-background');
              const mode = rawValue.toLowerCase();
  
              function applyColor(color) {
                if (!header) return;
                header.style.backgroundImage = 'none';
                header.style.backgroundColor = color || '';
                if (img) img.style.display = 'none';
              }
  
              if (mode === 'image') {
                const src = data['header_background'];
                if (src) {
                  const pre = new Image();
                  pre.src = src;
                  pre.onload = () => {
                    if (header) {
                      header.style.backgroundImage = `url("${src}")`;
                      header.style.backgroundSize = data['header_background_size'] || 'cover';
                      header.style.backgroundPosition = data['header_background_position'] || 'center';
                    }
                    if (img) img.style.display = 'none';
                  };
                  pre.onerror = () => {
                    if (img) img.style.display = '';
                  };
                } else {
                  if (img) img.style.display = '';
                }
              } else if (mode === 'color') {
                applyColor(data['header_background_color']);
              } else {
                if (header) {
                  header.style.backgroundImage = '';
                  header.style.backgroundColor = '';
                }
                if (img) img.style.display = '';
              }
              continue;
            }
  
            // --- NUEVA REGLA: Títulos, Subtítulos, Botones (Bilingües) ---
            if (key.endsWith('_es') && !key.includes('_link') && !key.includes('_color') && !key.includes('_bg')) {
              const keyEn = key.replace('_es', '_en');
  
              if (key.includes('_desc_')) {
                  // Manejo de Descripciones (generalmente sin spans de idioma o queremos solo textContent)
                  const elEs = el.querySelector('.lang-es') || el;
                  const elEn = el.querySelector('.lang-en');
                  
                  // Si no es un elemento de texto plano (como un P o DIV) usamos marked.parse (markdown)
                  if (typeof marked !== 'undefined' && !/^(BUTTON|A|SPAN|H1|H2|H3|H4|H5|H6)$/.test(el.tagName)) {
                    elEs.innerHTML = marked.parse(rawValue);
                    if (elEn) elEn.innerHTML = marked.parse(data[keyEn] || '');
                  } else {
                    elEs.textContent = rawValue;
                    if (elEn) elEn.textContent = data[keyEn] || '';
                  }
              } else {
                  // Títulos, Subtítulos y Botones: Usamos la función bilingüe
                  injectBilingualContent(el, data, key, keyEn);
              }
  
              continue;
            }
            // -------------------------------------------------------------
            
            // PRIORIDAD: claves explícitas para iconos (usa applyIconClass si viene _class)
            if (/^service_icon_\d+_class$/.test(key) || key.includes('_icon_class')) {
              if (el.tagName === 'I') applyIconClass(el, rawValue);
              continue;
            }
  
            // Regla restringida para interpretar valores como clase en <i>
            // Evita que números puros (ej. "36") o CÓDIGOS HEXADECIMALES (#HEX) se consideren clases
            if (el.tagName === 'I' && !rawValue.startsWith('#') && /[A-Za-z_-]/.test(rawValue) && !rawValue.includes('\n')) {
              applyIconClass(el, rawValue);
              continue;
            }
  
            // Tipos elementales
            if (el.tagName === 'IMG') {
              el.src = rawValue;
              continue;
            }
  
            // --- Manejo específico: iconos de servicios (color, tamaño, fondo) ---
            if (/^service_icon_\d+_color$/.test(key)) {
              if (el.tagName === 'I') {
                if (rawValue) el.style.color = rawValue;
                else el.style.color = '';
              }
              continue;
            }
  
            if (/^service_icon_\d+_size$/.test(key)) {
              if (el.tagName === 'I') {
                const px = Number(rawValue) || 0;
                if (px > 0) {
                  el.style.fontSize = px + 'px';
                  el.style.lineHeight = px + 'px';
                } else {
                  el.style.fontSize = '';
                  el.style.lineHeight = '';
                }
              }
              continue;
            }
  
            if (/^service_icon_\d+_bg$/.test(key)) {
              // La lógica para `el.closest` y `el.parentElement` ya no es necesaria si el mapeo
              // en loadSection es correcto (apuntando a service-icon-wrapper-X)
              const wrapper = el; // Ahora 'el' es el SPAN (service-icon-wrapper-X)
              if (wrapper) {
                if (rawValue) {
                  wrapper.style.backgroundColor = rawValue;
  
                  const m = key.match(/^service_icon_(\d+)_bg$/);
                  const idx = m ? m[1] : null;
                  const sizeKey = idx ? `service_icon_${idx}_size` : null;
                  // Obtenemos el tamaño del ícono (36px por defecto)
                  const iconSize = sizeKey && typeof data[sizeKey] !== 'undefined' ? Number(data[sizeKey]) : 36;
                  
                  // Nuevo factor de 3.11 para que un icono de 36px resulte en un círculo de 112px
                  const diameterFactor = 3.11; 
                  const diameter = Math.round(iconSize * diameterFactor); // 36 * 3.11 = ~112
  
                  wrapper.style.width = diameter + 'px';
                  wrapper.style.height = diameter + 'px';
                  wrapper.style.display = 'inline-flex';
                  wrapper.style.alignItems = 'center';
                  wrapper.style.justifyContent = 'center';
                  wrapper.style.borderRadius = '50%';
                } else {
                  wrapper.style.backgroundColor = '';
                  wrapper.style.width = '';
                  wrapper.style.height = '';
                  wrapper.style.display = '';
                  wrapper.style.alignItems = '';
                  wrapper.style.justifyContent = '';
                  wrapper.style.borderRadius = '';
                }
              }
              continue;
            }
  
            // PRIORIDAD: regla específica para el botón del header (evita que se trate como href)
            if (key === 'header_button_bg_color') {
              // el debe ser el <a> mapeado a header-button-link
              // Limpiar nodos de texto vacíos entre spans para evitar espacios sobrantes
              cleanWhitespaceTextNodes(el);
  
              if (rawValue) {
                el.style.backgroundColor = rawValue;
                el.style.borderColor = rawValue;
              } else {
                el.style.backgroundColor = '';
                el.style.borderColor = '';
              }
  
              const textColor = data['header_button_text_color'];
              if (textColor) {
                // La lógica de color de texto del botón ahora se maneja dentro de injectBilingualContent
                // Sin embargo, si la regla es necesaria aquí, se mantiene.
                const spans = el.querySelectorAll('.lang-es, .lang-en');
                spans.forEach(span => {
                  span.style.color = textColor;
                });
              }
              continue;
            }
  
            // Manejo genérico de enlaces (solo si no fue procesado por regla específica)
            if (el.tagName === 'A') {
              // solo asignar href si el rawValue parece una URL o ancla
              if (/^(#|https?:\/\/)/.test(rawValue)) {
                el.href = rawValue;
              }
              continue;
            }
  
            // Evitar innerHTML en descripciones de servicio (previene <p> anidados)
            // Esta regla se hace redundante con la nueva lógica bilingüe, pero se mantiene para seguridad.
            if (elementId && /^service-desc-\d+(?:-en)?$/.test(elementId)) {
              // Dejamos que la regla bilingüe maneje esto.
              continue;
            }
  
            // PRIORIDAD: regla específica para color del título o subtítulo (aplica también a la versión -en si existe)
            // ESTA REGLA SE VUELVE REDUNDANTE YA QUE LA NUEVA FUNCIÓN BILINGÜE LA MANEJA.
            // Se comenta o elimina para evitar aplicar el color dos veces.
            /*
            if (key === 'header_title_color' || key === 'header_subtitle_color' || /^services_subtitle_color(_en)?$/.test(key)) {
              const color = rawValue || '';
              if (color) {
                el.style.color = color;
                const enEl = document.getElementById(elementId + '-en');
                if (enEl) enEl.style.color = color;
              } else {
                el.style.color = '';
                const enEl = document.getElementById(elementId + '-en');
                if (enEl) enEl.style.color = '';
              }
              continue;
            }
            */
  
            if (key.includes('_background_color')) {
              el.style.backgroundColor = rawValue;
              continue;
            }
  
            // REGLA GENERAL para Color de Texto (se ejecuta solo si no hay una regla más específica)
            if (key.includes('_color')) {
              if (rawValue) el.style.color = rawValue;
              continue;
            }
  
            // SPANs: usar siempre textContent para evitar HTML/entidades añadidas
            if (el.tagName === 'SPAN') {
              removeAllChildTextNodes(el);
              el.textContent = rawValue;
              continue;
            }
  
            // Por defecto: contenido rico. Evitar parsear simples nombres de clase.
            if (/^[\w- ]+$/.test(rawValue) && !rawValue.includes('\n')) {
              el.textContent = rawValue;
            } else {
              if (typeof marked !== 'undefined' && !/^(BUTTON|A|SPAN|H1|H2|H3|H4|H5|H6)$/.test(el.tagName)) {
                el.innerHTML = marked.parse(rawValue);
              } else {
                el.textContent = rawValue;
              }
            }
          }
        })
        .catch(err => {
          console.warn(`Error al cargar la sección "${sectionName}":`, err);
        });
    }
  
  // =======================================================================================
  // NUEVA FUNCIÓN AÑADIDA: INYECCIÓN BILINGÜE
  // =======================================================================================
  // Esta función inyecta los textos ES y EN en los SPANs internos (.lang-es, .lang-en)
  // de un contenedor (el) y se asegura de que el color de texto se aplique a ambos SPANs.
  function injectBilingualContent(el, data, keyEs, keyEn) {
      const textEs = data[keyEs] || '';
      const textEn = data[keyEn] || '';
  
      const elEs = el.querySelector('.lang-es');
      const elEn = el.querySelector('.lang-en');
  
      // 1. Inyectar textos en los SPANs (textContent es seguro)
      if (elEs) elEs.textContent = textEs;
      if (elEn) elEn.textContent = textEn;
  
      // 2. Manejo de color de texto (si el color viene definido, lo aplicamos a los spans)
      const colorKey = keyEs.replace('_es', '_color');
      if (colorKey && data[colorKey]) {
          const color = data[colorKey];
          if (elEs) elEs.style.color = color;
          if (elEn) elEn.style.color = color;
      }
  }
  // =======================================================================================
  
    // Elimina nodos de texto que solo contienen espacios/retornos dentro de un elemento
    function cleanWhitespaceTextNodes(container) {
      if (!container || !container.childNodes) return;
      const toRemove = [];
      container.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && /^[\s\u00A0]*$/.test(node.nodeValue)) {
          toRemove.push(node);
        }
      });
      toRemove.forEach(n => n.parentNode.removeChild(n));
    }
  
    // Remueve nodos de texto hijos dejando intactos elementos y su texto
    function removeAllChildTextNodes(el) {
      if (!el || !el.childNodes) return;
      const toRemove = [];
      el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) toRemove.push(node);
      });
      toRemove.forEach(n => n.parentNode.removeChild(n));
    }
  
    // Elimina solo text nodes que contienen únicamente espacios o NBSP (utilidad adicional)
    function removeWhitespaceOnlyTextNodes(root) {
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      const toRemove = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (/^[\s\u00A0]*$/.test(node.nodeValue)) toRemove.push(node);
      }
      toRemove.forEach(n => n.parentNode && n.parentNode.removeChild(n));
      if (root.normalize) root.normalize();
    }
  
    // Recorta y colapsa espacios en text nodes que tienen texto (utilidad adicional)
    function trimTextNodes(root) {
      if (!root) return;
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
      const updates = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!/^[\s\u00A0]*$/.test(node.nodeValue)) {
          const trimmed = node.nodeValue.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim();
          if (trimmed !== node.nodeValue) updates.push({ node, value: trimmed });
        }
      }
      updates.forEach(u => u.node.nodeValue = u.value);
      if (root.normalize) root.normalize();
    }
  
    // Aplica clase(s) de icono de forma segura, preservando otras clases no-icono
    function applyIconClass(el, classString) {
      const newClasses = String(classString || '').trim().split(/\s+/).filter(Boolean);
      if (!newClasses.length) return;
  
      const iconClassPrefixes = ['icon-', 'fa-', 'fas', 'far', 'fab', 'fi-', 'mdi-'];
      const prefixRe = new RegExp('^(?:' + iconClassPrefixes.map(escapeForRegex).join('|') + ')');
  
      if (el.tagName === 'I') {
        // si vienen valores raros (como números) no los asignamos como clase
        const filtered = newClasses.filter(c => /[A-Za-z_-]/.test(c));
        if (!filtered.length) return;
        el.className = filtered.join(' ');
        return;
      }
  
      const kept = Array.from(el.classList).filter(c => !prefixRe.test(c));
      const final = [...kept, ...newClasses].join(' ').trim();
      el.className = final;
    }
  
    function escapeForRegex(s) {
      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
  
    function parseFrontMatter(text) {
      const match = text.match(/---\n([\s\S]*?)\n---/);
      if (!match) return {};
      const yaml = match[1];
      const lines = yaml.split("\n");
      const data = {};
      lines.forEach(line => {
        const idx = line.indexOf(':');
        if (idx === -1) return;
        const key = line.slice(0, idx).trim();
        let value = line.slice(idx + 1).trim();
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        } else if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        data[key] = value;
      });
      return data;
    }
  
    // 1) loadSection para todos los bloques de contenido (adaptado bilingüe)
    //
    const currentLang = document.body.classList.contains("lang-en") ? "en" : "es";
    // --- HEADER: Con nuevos colores ---
    
    loadSection("header", {
      header_background: "header-background",
      header_background_color: "header-section",
      header_background_mode: "header-section",
      header_title_es: "header-title",
      // header_title_en: "header-title-en", // ELIMINADO
      header_subtitle_es: "header-subtitle",
      // header_subtitle_en: "header-subtitle-en", // ELIMINADO
      header_button_link: "header-button-link",
      header_button_text_es: "header-button-link", // Mapea al mismo elemento <a>
      // header_button_text_en: "header-button-text-en", // ELIMINADO
  
      // MAPPINGS DE COLOR
      header_title_color: "header-title",
      header_subtitle_color: "header-subtitle",
      header_button_bg_color: "header-button-link"
      // header_button_text_color ya no mapea a un ID
    });
    // ---------------------------------
  
    loadSection("about", {
      // Color de fondo
      about_background_color: "about-section",
  
      // Títulos
      about_title_es: "about-title",
      // about_title_en: "about-title-en", // ELIMINADO
  
      // Subtítulos / párrafos
      about_subtitle_es: "about-subtitle",
      // about_subtitle_en: "about-subtitle-en", // ELIMINADO
  
      // Botón
      about_button_link: "about-button-link",
      about_button_text_es: "about-button-link", // Mapea al mismo elemento <a>
      // about_button_text_en: "about-button-text-en" // ELIMINADO
    });
  
  
    loadSection("portfolio", {
       // NUEVOS CAMPOS DE TÍTULO PRINCIPAL
      portfolio_subtitle_es: "portfolio-subtitle",
      portfolio_title_main_es: "portfolio-title-main",
      // Imagenes
      portfolio_img_1: "portfolio-img-1",
      portfolio_img_2: "portfolio-img-2",
      portfolio_img_3: "portfolio-img-3",
      portfolio_img_4: "portfolio-img-4",
  
      // Títulos en español
      portfolio_title_1_es: "portfolio-title-1",
      portfolio_title_2_es: "portfolio-title-2",
      portfolio_title_3_es: "portfolio-title-3",
      portfolio_title_4_es: "portfolio-title-4",
      // ELIMINADOS los 'portfolio_title_X_en'
  
      // Descripciones en español
      portfolio_desc_1_es: "portfolio-desc-1",
      portfolio_desc_2_es: "portfolio-desc-2",
      portfolio_desc_3_es: "portfolio-desc-3",
      portfolio_desc_4_es: "portfolio-desc-4",
      // ELIMINADAS las 'portfolio_desc_X_en'
    });
  
  
  loadSection("services", {
    // Color de fondo de la sección
    services_background_color: "services-section",
    
    // Clave para el color del texto del subtítulo/iconos
    services_subtitle_color: "services-subtitle",
    // services_subtitle_color_en: "services-subtitle-en", // ELIMINADO
    
    // Encabezados
    services_subtitle_es: "services-subtitle",
    // services_subtitle_en: "services-subtitle-en", // ELIMINADO
    services_title_es: "services-title",
    // services_title_en: "services-title-en", // ELIMINADO
  
    // Servicio 1
    service_icon_1_class: "service-icon-1",
    service_icon_1_color: "service-icon-1",
    service_icon_1_size: "service-icon-1",
    service_icon_1_bg: "service-icon-wrapper-1", 
    service_title_1_es: "service-title-1",
    // service_title_1_en: "service-title-1-en", // ELIMINADO
    service_desc_1_es: "service-desc-1",
    // service_desc_1_en: "service-desc-1-en", // ELIMINADO
  
    // Servicio 2
    service_icon_2_class: "service-icon-2",
    service_icon_2_color: "service-icon-2",
    service_icon_2_size: "service-icon-2",
    service_icon_2_bg: "service-icon-wrapper-2",
    service_title_2_es: "service-title-2",
    // service_title_2_en: "service-title-2-en", // ELIMINADO
    service_desc_2_es: "service-desc-2",
    // service_desc_2_en: "service-desc-2-en", // ELIMINADO
  
    // Servicio 3
    service_icon_3_class: "service-icon-3",
    service_icon_3_color: "service-icon-3",
    service_icon_3_size: "service-icon-3",
    service_icon_3_bg: "service-icon-wrapper-3",
    service_title_3_es: "service-title-3",
    // service_title_3_en: "service-title-3-en", // ELIMINADO
    service_desc_3_es: "service-desc-3",
    // service_desc_3_en: "service-desc-3-en", // ELIMINADO
  
    // Servicio 4
    service_icon_4_class: "service-icon-4",
    service_icon_4_color: "service-icon-4",
    service_icon_4_size: "service-icon-4",
    service_icon_4_bg: "service-icon-wrapper-4",
    service_title_4_es: "service-title-4",
    // service_title_4_en: "service-title-4-en", // ELIMINADO
    service_desc_4_es: "service-desc-4",
    // service_desc_4_en: "service-desc-4-en" // ELIMINADO
  });
  
    loadSection("callout", {
      // Imagen de fondo
      callout_background: "callout-background",
  
      // Títulos
      callout_title_es: "callout-title",
      // callout_title_en: "callout-title-en", // ELIMINADO
  
      // Botón
      callout_button_link: "callout-button-link",
      callout_button_text_es: "callout-button-link", // Mapea al mismo elemento <a>
      // callout_button_text_en: "callout-button-text-en" // ELIMINADO
    });
  
  
loadSection("cta", {
    // Color de fondo y color de texto (sin cambios)
    cta_background_color: "cta-section",
    cta_title_text_color: "cta-title", // Mapea al ID unificado del título

    // Título (Solo _es)
    cta_title_es: "cta-title",
    // cta_title_en: "cta-title-en", // ELIMINADO

    // Botón 1
    cta_button_1_text_es: "cta-button-1-link", // Mapea al ID del enlace (correcto)
    // cta_button_1_text_en: "cta-button-1-text-en", // ELIMINADO
    cta_button_1_link: "cta-button-1-link",

    // Botón 2
    cta_button_2_text_es: "cta-button-2-link", // Mapea al ID del enlace (correcto)
    // cta_button_2_text_en: "cta-button-2-text-en", // ELIMINADO
    cta_button_2_link: "cta-button-2-link"
});
  
  
    loadSection("footer", {
      // Redes sociales
      footer_link_facebook: "footer-link-facebook",
      footer_link_twitter: "footer-link-twitter",
      footer_link_github: "footer-link-github",
  
      // Texto legal
      footer_copy_text_es: "footer-copy-text",
      // footer_copy_text_en: "footer-copy-text-en" // ELIMINADO
});
// ... (otras llamadas a loadSection aquí)
// 
// 1) loadSection para todos los bloques de contenido (adaptado bilingüe)
//
// ...

// NUEVA CARGA DE NAVEGACIÓN
loadSection("navigation", {
    // LINK 1: Inicio
    nav_link_1_text_es: "nav-link-1", // Carga texto ES/EN usando la lógica bilingüe
    nav_link_1_href: "nav-link-1",   // Carga el atributo href
    
    // LINK 2: Acerca
    nav_link_2_text_es: "nav-link-2",
    nav_link_2_href: "nav-link-2",
    
    // LINK 3: Servicios
    nav_link_3_text_es: "nav-link-3",
    nav_link_3_href: "nav-link-3",
    
    // LINK 4: Portafolio
    nav_link_4_text_es: "nav-link-4",
    nav_link_4_href: "nav-link-4",
    
    // LINK 5: Contacto
    nav_link_5_text_es: "nav-link-5",
    nav_link_5_href: "nav-link-5"
});

// ------------------------------------------------------------------
// LÓGICA DEL PRELOADER: ¡AQUÍ!
// ------------------------------------------------------------------

function hidePreloader() {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.classList.add('hidden-preloader');
        // Elimina el elemento del DOM al finalizar la transición CSS
        preloader.addEventListener('transitionend', function() {
            preloader.remove();
        });
    }
}

// Retraso de 50ms para asegurar que el DOM ha terminado de renderizar el contenido inyectado
setTimeout(hidePreloader, 350); 

// ------------------------------------------------------------------

// Netlify Identity: redirigir si hay token en el hash
//
 (function() {
   var hash = window.location.hash;
   if (!hash) return;
   var tokens = ['invite_token', 'recovery_token', 'confirmation_token'];
   var shouldRedirect = tokens.some(function(t) {
     return hash.includes(t);
   });
   if (shouldRedirect) {
     window.location.href = '/admin/' + hash;
   }
 })();
})();
