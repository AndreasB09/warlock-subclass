// dnd api spells
document.addEventListener("DOMContentLoaded", () => {
    const spellLinks = document.querySelectorAll(".spell-link");
    const tooltip = document.getElementById("spell-tooltip");

    tooltip.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
    });

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

                tooltip.style.visibility = "visible";
                tooltip.style.display = "block";
                tooltip.style.left = "-9999px";
                tooltip.style.top = "-9999px";

                setTimeout(() => {
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const tooltipWidth = tooltip.offsetWidth;
                    const tooltipHeight = tooltip.offsetHeight;
                    
                    let leftPosition = e.clientX + 15;
                    let topPosition = e.clientY + 15;
                    
                    if (leftPosition + tooltipWidth > viewportWidth - 10) {
                        leftPosition = e.clientX - tooltipWidth - 15;
                    }
                
                    if (topPosition + tooltipHeight > viewportHeight - 10) {
                        topPosition = Math.max(10, viewportHeight - tooltipHeight - 10);
                        
                        if (topPosition < e.clientY - tooltipHeight - 10) {
                            topPosition = e.clientY - tooltipHeight - 10;
                        }
                    }
                    e
                    leftPosition = Math.max(10, leftPosition);
                    
                    tooltip.style.left = leftPosition + "px";
                    tooltip.style.top = topPosition + "px";
                    
                    console.log("Spell tooltip positioned at:", {
                        left: leftPosition,
                        top: topPosition,
                        width: tooltipWidth,
                        height: tooltipHeight,
                        viewport: { width: viewportWidth, height: viewportHeight }
                    });
                }, 0);
                
                tooltip.classList.remove("hidden");
            }
        });

        link.addEventListener("mouseleave", () => {
            tooltip.style.display = "none";
        });
    });
    setupRulesLinks();
});