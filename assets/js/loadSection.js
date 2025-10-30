//assets/js/loadSection.js
(function() {
  function loadSection(sectionName, mapping) {
    fetch(`content/${sectionName}.md`)
      .then(response => response.text())
      .then(text => {
        const data = parseFrontMatter(text);
        for (const key in mapping) {
          const elementId = mapping[key];
          const el = document.getElementById(elementId);
          if (el && typeof data[key] !== 'undefined') {
            // Manejar diferentes tipos de elementos y propiedades
            if (el.tagName === "IMG") {
              el.src = data[key];
            } else if (el.tagName === "A") {
              el.href = data[key];
            } else if (key.includes('_background_color')) { // Nuevo manejo para colores de fondo
              el.style.backgroundColor = data[key];
            } else if (key.includes('_color')) { // <-- NUEVO CÓDIGO AQUÍ
              el.style.color = data[key];
            } else if (key.includes('_icon_class')) { // 🚨 NUEVA LÓGICA PARA ICONos
              el.className = data[key];
            } else if (el.tagName === "SPAN") {
              el.innerHTML = data[key].trim();
            } else {
              el.innerHTML = marked.parse(data[key]);
            }
          }
        }
      });
  }

  function parseFrontMatter(text) {
    const match = text.match(/---\n([\s\S]*?)\n---/);
    const yaml = match ? match[1] : "";
    const lines = yaml.split("\n");
    const data = {};
    lines.forEach(line => {
      const [key, ...rest] = line.split(":");
      if (key && rest.length) {
        let value = rest.join(":").trim();
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        data[key.trim()] = value;
      }
    });
    return data;
  }

  // 1) loadSection para todos los bloques de contenido (adaptado bilingüe)
  //
  const currentLang = document.body.classList.contains("lang-en") ? "en" : "es";

loadSection("header", {
  header_background: "header-background",
  header_title_es: "header-title",
  header_title_en: "header-title-en",
  header_subtitle_es: "header-subtitle",
  header_subtitle_en: "header-subtitle-en",
  header_button_link: "header-button-link",
  header_button_text_es: "header-button-text",
  header_button_text_en: "header-button-text-en"
});


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
  // Color de fondo
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
  service_icon_1_class: "service-icon-1", // 🚨 NUEVOS MAPEOS
  service_title_1_es: "service-title-1",
  service_title_1_en: "service-title-1-en",
  service_desc_1_es: "service-desc-1",
  service_desc_1_en: "service-desc-1-en",

  // Servicio 2
  service_icon_2_class: "service-icon-2", // 🚨 NUEVOS MAPEOS
  service_title_2_es: "service-title-2",
  service_title_2_en: "service-title-2-en",
  service_desc_2_es: "service-desc-2",
  service_desc_2_en: "service-desc-2-en",

  // Servicio 3
  service_icon_3_class: "service-icon-3", // 🚨 NUEVOS MAPEOS
  service_title_3_es: "service-title-3",
  service_title_3_en: "service-title-3-en",
  service_desc_3_es: "service-desc-3",
  service_desc_3_en: "service-desc-3-en",

  // Servicio 4
  service_icon_4_class: "service-icon-4", // 🚨 NUEVOS MAPEOS
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
