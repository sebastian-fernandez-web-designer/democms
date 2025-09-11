document.addEventListener("DOMContentLoaded", () => {
  // evitar que el sidebar se cierre al tocar el dropdown
  const dropdownLinks = document.querySelectorAll(".dropdown-item.lang-option");

  dropdownLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.stopPropagation(); // evita que el clic cierre el sidebar
    });
  });

  // tu código de cambio de idioma
  const langOptions = document.querySelectorAll(".lang-option");
  langOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      const lang = opt.dataset.lang;
      if (lang === "en") {
        document.body.classList.remove("lang-es");
        document.body.classList.add("lang-en");
      } else {
        document.body.classList.remove("lang-en");
        document.body.classList.add("lang-es");
      }
    });
  });
});
