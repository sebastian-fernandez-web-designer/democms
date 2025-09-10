document.addEventListener("DOMContentLoaded", () => {
    const switchBtn = document.getElementById("lang-switch");

    switchBtn.addEventListener("click", () => {
        if (document.body.classList.contains("lang-es")) {
            document.body.classList.remove("lang-es");
            document.body.classList.add("lang-en");
            switchBtn.textContent = "Cambiar a Español";
        } else {
            document.body.classList.remove("lang-en");
            document.body.classList.add("lang-es");
            switchBtn.textContent = "Cambiar a Inglés";
        }
    });
});
