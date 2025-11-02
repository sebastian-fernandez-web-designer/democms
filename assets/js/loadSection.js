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

          // PRIORIDAD: claves explícitas para iconos (usa applyIconClass si viene _class)
          if (/^service_icon_\d+_class$/.test(key) || key.includes('_icon_class')) {
            if (el.tagName === 'I') applyIconClass(el, rawValue);
            continue;
          }

          // Regla restringida para interpretar valores como clase en <i>
          // Evita que números puros (ej. "36") se consideren clases
          if (el.tagName === 'I' && /[A-Za-z_-]/.test(rawValue) && !rawValue.includes('\n')) {
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
            const wrapper = el.closest('.service-icon') || (el.parentElement && el.parentElement.classList.contains('service-icon') ? el.parentElement : null);
            if (wrapper) {
              if (rawValue) {
                wrapper.style.backgroundColor = rawValue;

                const m = key.match(/^service_icon_(\d+)_bg$/);
                const idx = m ? m[1] : null;
                const sizeKey = idx ? `service_icon_${idx}_size` : null;
                const sizeVal = sizeKey && typeof data[sizeKey] !== 'undefined' ? Number(data[sizeKey]) : NaN;
                const baseSize = (sizeVal && sizeVal > 0) ? sizeVal : 36;
                const diameter = Math.round(baseSize * 1.8);

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
              const spans = el.querySelectorAll('span');
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
          if (elementId && /^service-desc-\d+(?:-en)?$/.test(elementId)) {
            el.textContent = rawValue;
            continue;
          }

          // PRIORIDAD: regla específica para color del título o subtítulo (aplica también a la versión -en si existe)
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
    header_title_en: "header-title-en",
    header_subtitle_es: "header-subtitle",
    header_subtitle_en: "header-subtitle-en",
    header_button_link: "header-button-link",
    header_button_text_es: "header-button-text",
    header_button_text_en: "header-button-text-en",

    // NUEVOS MAPPINGS DE COLOR (colores separados):
    header_title_color: "header-title",             // color específico del título
    header_subtitle_color: "header-subtitle",       // color específico del subtítulo
    header_button_bg_color: "header-button-link"
    // header_button_text_color ya no mapea a un ID, su valor es leído internamente
  });
  // ---------------------------------

  loadSection("about", {
    // Color de fondo
    about_background_color: "about-section",

    // Títulos
    about_title_es: "about-title",
    about_title_en: "about-title-en",

    // Subtítulos / párrafos
    about_subtitle_es: "about-subtitle",
    about_subtitle_en: "about-subtitle-en",

    // Botón
    about_button_link: "about-button-link",
    about_button_text_es: "about-button-text",
    about_button_text_en: "about-button-text-en"
  });


  loadSection("portfolio", {
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

    // Títulos en inglés
    portfolio_title_1_en: "portfolio-title-1-en",
    portfolio_title_2_en: "portfolio-title-2-en",
    portfolio_title_3_en: "portfolio-title-3-en",
    portfolio_title_4_en: "portfolio-title-4-en",

    // Descripciones en español
    portfolio_desc_1_es: "portfolio-desc-1",
    portfolio_desc_2_es: "portfolio-desc-2",
    portfolio_desc_3_es: "portfolio-desc-3",
    portfolio_desc_4_es: "portfolio-desc-4",

    // Descripciones en inglés
    portfolio_desc_1_en: "portfolio-desc-1-en",
    portfolio_desc_2_en: "portfolio-desc-2-en",
    portfolio_desc_3_en: "portfolio-desc-3-en",
    portfolio_desc_4_en: "portfolio-desc-4-en"
  });


loadSection("services", {
  // Color de fondo de la sección
  services_background_color: "services-section",
  
  // Clave para el color del texto del subtítulo/iconos
  services_subtitle_color: "services-subtitle",
  services_subtitle_color_en: "services-subtitle-en",
  
  // Encabezados
  services_subtitle_es: "services-subtitle",
  services_subtitle_en: "services-subtitle-en",
  services_title_es: "services-title",
  services_title_en: "services-title-en",

  // Servicio 1
  service_icon_1_class: "service-icon-1",
  service_icon_1_color: "service-icon-1",
  service_icon_1_size: "service-icon-1",
  service_icon_1_bg: "service-icon-wrapper-1", // <-- ¡CORREGIDO! Apunta al SPAN
  service_title_1_es: "service-title-1",
  service_title_1_en: "service-title-1-en",
  service_desc_1_es: "service-desc-1",
  service_desc_1_en: "service-desc-1-en",

  // Servicio 2
  service_icon_2_class: "service-icon-2",
  service_icon_2_color: "service-icon-2",
  service_icon_2_size: "service-icon-2",
  service_icon_2_bg: "service-icon-wrapper-2", // <-- ¡CORREGIDO! Apunta al SPAN
  service_title_2_es: "service-title-2",
  service_title_2_en: "service-title-2-en",
  service_desc_2_es: "service-desc-2",
  service_desc_2_en: "service-desc-2-en",

  // Servicio 3
  service_icon_3_class: "service-icon-3",
  service_icon_3_color: "service-icon-3",
  service_icon_3_size: "service-icon-3",
  service_icon_3_bg: "service-icon-wrapper-3", // <-- ¡CORREGIDO! Apunta al SPAN
  service_title_3_es: "service-title-3",
  service_title_3_en: "service-title-3-en",
  service_desc_3_es: "service-desc-3",
  service_desc_3_en: "service-desc-3-en",

  // Servicio 4
  service_icon_4_class: "service-icon-4",
  service_icon_4_color: "service-icon-4",
  service_icon_4_size: "service-icon-4",
  service_icon_4_bg: "service-icon-wrapper-4", // <-- ¡CORREGIDO! Apunta al SPAN
  service_title_4_es: "service-title-4",
  service_title_4_en: "service-title-4-en",
  service_desc_4_es: "service-desc-4",
  service_desc_4_en: "service-desc-4-en"
});

  loadSection("callout", {
    // Imagen de fondo
    callout_background: "callout-background",

    // Títulos
    callout_title_es: "callout-title",
    callout_title_en: "callout-title-en",

    // Botón
    callout_button_link: "callout-button-link",
    callout_button_text_es: "callout-button-text",
    callout_button_text_en: "callout-button-text-en"
  });


  loadSection("cta", {
    // Color de fondo y color de texto
    cta_background_color: "cta-section",
    cta_title_text_color: "cta-title",

    // Título
    cta_title_es: "cta-title",
    cta_title_en: "cta-title-en",

    // Botón 1
    cta_button_1_text_es: "cta-button-1-text",
    cta_button_1_text_en: "cta-button-1-text-en",
    cta_button_1_link: "cta-button-1-link",

    // Botón 2
    cta_button_2_text_es: "cta-button-2-text",
    cta_button_2_text_en: "cta-button-2-text-en",
    cta_button_2_link: "cta-button-2-link"
  });


  loadSection("footer", {
    // Redes sociales
    footer_link_facebook: "footer-link-facebook",
    footer_link_twitter: "footer-link-twitter",
    footer_link_github: "footer-link-github",

    // Texto legal
    footer_copy_text_es: "footer-copy-text",
    footer_copy_text_en: "footer-copy-text-en"
  });


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
