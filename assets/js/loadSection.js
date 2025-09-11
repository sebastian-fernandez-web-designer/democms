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
            } else if (key.includes('_text_color')) { // <-- NUEVO CÓDIGO AQUÍ
              el.style.color = data[key];
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
    services_background_color: "services-section",
    [`services_subtitle_${currentLang}`]: "services-subtitle",
    [`services_title_${currentLang}`]: "services-title",
    [`service_title_1_${currentLang}`]: "service-title-1",
    [`service_desc_1_${currentLang}`]: "service-desc-1",
    [`service_title_2_${currentLang}`]: "service-title-2",
    [`service_desc_2_${currentLang}`]: "service-desc-2",
    [`service_title_3_${currentLang}`]: "service-title-3",
    [`service_desc_3_${currentLang}`]: "service-desc-3",
    [`service_title_4_${currentLang}`]: "service-title-4",
    [`service_desc_4_${currentLang}`]: "service-desc-4"
  });

  loadSection("callout", {
    callout_background: "callout-background",
    [`callout_title_${currentLang}`]: "callout-title",
    callout_button_link: "callout-button-link",
    [`callout_button_text_${currentLang}`]: "callout-button-text"
  });

  loadSection("cta", {
    cta_background_color: "cta-section",
    [`cta_title_${currentLang}`]: "cta-title",
    cta_title_text_color: "cta-title",
    [`cta_button_1_text_${currentLang}`]: "cta-button-1-text",
    cta_button_1_link: "cta-button-1-link",
    [`cta_button_2_text_${currentLang}`]: "cta-button-2-text",
    cta_button_2_link: "cta-button-2-link"
  });

  loadSection("footer", {
    footer_link_facebook: "footer-link-facebook",
    footer_link_twitter: "footer-link-twitter",
    footer_link_github: "footer-link-github",
    [`footer_copy_text_${currentLang}`]: "footer-copy-text"
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
