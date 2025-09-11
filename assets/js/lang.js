document.addEventListener("DOMContentLoaded", () => {
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
