//assets/js/loadSection.js
function loadSection(sectionName, mapping) {
  fetch(`content/${sectionName}.md`)
    .then(response => response.text())
    .then(text => {
      const data = parseFrontMatter(text);
      for (const key in mapping) {
        const elementId = mapping[key];
        const el = document.getElementById(elementId);
        if (el && typeof data[key] !== 'undefined') {
          if (el.tagName === "IMG") {
            el.src = data[key];
          } else if (el.tagName === "A") {
            el.href = data[key];
          } else if (el.tagName === "SPAN") { // Agregamos esta condición
            el.innerHTML = data[key]; // No aplicamos marked.parse()
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
        // **CAMBIO AQUÍ**: Quita las comillas al principio y al final del valor
        let value = rest.join(":").trim();
        if (value.startsWith("'") && value.endsWith("'")) {
          value = value.slice(1, -1);
        }
        data[key.trim()] = value;
      }
    });
    return data;
  }

  //
  // 1) loadSection para todos los bloques de contenido
  //
  loadSection("header", {
    header_background: "header-background",
    header_title: "header-title",
    header_subtitle: "header-subtitle",
    header_button_text: "header-button-text",
    header_button_link: "header-button-link"
  });

  loadSection("about", {
    about_title: "about-title",
    about_subtitle: "about-subtitle",
    about_button_text: "about-button-text",
    about_button_link: "about-button-link"
  });

  loadSection("portfolio", {
    portfolio_img_1: "portfolio-img-1",
    portfolio_img_2: "portfolio-img-2",
    portfolio_img_3: "portfolio-img-3",
    portfolio_img_4: "portfolio-img-4",
    portfolio_img_5: "portfolio-img-5",
    portfolio_img_6: "portfolio-img-6"
  });

  loadSection("services", {
    services_subtitle: "services-subtitle",
    services_title: "services-title",
    service_title_1: "service-title-1",
    service_desc_1: "service-desc-1",
    service_title_2: "service-title-2",
    service_desc_2: "service-desc-2",
    service_title_3: "service-title-3",
    service_desc_3: "service-desc-3",
    service_title_4: "service-title-4",
    service_desc_4: "service-desc-4"
  });

  loadSection("callout", {
    callout_background: "callout-background",
    callout_title: "callout-title",
    callout_button_text: "callout-button-text",
    callout_button_link: "callout-button-link"
  });

  loadSection("cta", {
    cta_title: "cta-title",
    cta_button_1_text: "cta-button-1-text",
    cta_button_1_link: "cta-button-1-link",
    cta_button_2_text: "cta-button-2-text",
    cta_button_2_link: "cta-button-2-link"
  });

  loadSection("footer", {
    footer_link_facebook: "footer-link-facebook",
    footer_link_twitter: "footer-link-twitter",
    footer_link_github: "footer-link-github",
    footer_copy_text: "footer-copy-text"
  });

  //
  // 2) Netlify Identity: redirigir si hay token en el hash
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

  //
  // 3) Dinámicamente aplicar background-color desde el front-matter
  //
  var colorSections = [{
    file: 'content/about.md',
    id: 'about-section',
    field: 'about_background_color'
  }, {
    file: 'content/cta.md',
    id: 'cta-section',
    field: 'cta_background_color'
  }, {
    file: 'content/services.md',
    id: 'services-section',
    field: 'services_background_color'
  }];

  colorSections.forEach(function(item) {
    fetch(item.file)
      .then(function(res) {
        return res.text();
      })
      .then(function(text) {
        var regex = new RegExp(
          item.field + '\\s*:\\s*[\'"]?(#[0-9A-Fa-f]{6})[\'"]?'
        );
        var match = text.match(regex);
        if (match) {
          document
            .getElementById(item.id)
            .style.backgroundColor = match[1];
        }
      })
      .catch(console.error);
  });
})();
