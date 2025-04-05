// dnd api spells
document.addEventListener("DOMContentLoaded", () => {
    const spellLinks = document.querySelectorAll(".spell-link");
    const tooltip = document.getElementById("spell-tooltip");

    spellLinks.forEach(link => {
        link.addEventListener("mouseenter", async (e) => {
            const spellId = e.target.dataset.spell;
            const response = await fetch(
              `https://www.dnd5eapi.co/api/spells/${spellId}`
            );
            if (response.ok) {
                const data = await response.json();
                document.getElementById("spell-name").textContent = data.name;
                document.getElementById("spell-level").textContent = data.level;
                document.getElementById("spell-school").textContent = data.school.name;
                document.getElementById("spell-duration").textContent = data.duration;
                document.getElementById("spell-casting-time").textContent = data.casting_time;
                document.getElementById("spell-description").textContent = data.desc.join(" ");

                tooltip.style.left = e.clientX + 15 + "px";
                tooltip.style.top = e.clientY + 15 + "px";
                tooltip.classList.remove("hidden");
                tooltip.style.visibility = "visible";
                tooltip.style.display = "block";
            }
        });

        link.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });
    });
    setupRulesLinks();
});