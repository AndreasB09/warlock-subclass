// dnd api spells
console.log("Script.js is loading");



document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded");
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

    // rules api
    //ngl, got some help on this one. Could fetch the data np but it included the entirety of the rules section. Got some AI assistance on how to trim and clean it up.
    const ruleLinks = document.querySelectorAll(".rule-link");
    const ruleTooltip = document.getElementById("rule-tooltip");

    ruleLinks.forEach(link => {
        link.addEventListener("mouseenter", async (e) => {
            const ruleId = e.target.dataset.rule;
            let response;
            let data;
            
            if (["blinded", "charmed", "deafened", "exhaustion", "frightened", "grappled", 
                "incapacitated", "invisible", "paralyzed", "petrified", "poisoned", "prone", 
                "restrained", "stunned", "unconscious"].includes(ruleId)) {
                response = await fetch(`https://www.dnd5eapi.co/api/conditions/${ruleId}`);
                if (response.ok) {
                    data = await response.json();
                    document.getElementById("rule-name").textContent = data.name;
                  
                    const desc = data.desc;
                    
                    let items = [];
                    
                    if (Array.isArray(desc)) {
                        items = desc;
                    } else if (typeof desc === 'string' && (desc.includes("\n-") || desc.trim().startsWith('-'))) {
                        items = desc.split(/\n-|^-/).filter(item => item.trim() !== "");
                    }
                    
                    if (items.length > 0) {
                        const formattedItems = items.map(item => {
                            const trimmed = item.trim();
                            return `<li>${trimmed.startsWith('-') ? trimmed.substring(1).trim() : trimmed}</li>`;
                        });
                        
                        document.getElementById("rule-description").innerHTML = `<ul>${formattedItems.join('')}</ul>`;
                    } else {
                        document.getElementById("rule-description").textContent = Array.isArray(desc) ? desc.join(' ') : desc;
                    }
                }
            } else if (ruleId === "disadvantage") {
                response = await fetch(`https://www.dnd5eapi.co/api/rule-sections/advantage-and-disadvantage`);
                if (response.ok) {
                    data = await response.json();
                    document.getElementById("rule-name").textContent = "Disadvantage";
                    
                    console.log("Advantage/Disadvantage data:", data);
                    
                    const entries = data.entries || [];
                    
                    let coreMechanicText = "";
                    
                    for (const entry of entries) {
                        if (typeof entry === 'string' && 
                            entry.toLowerCase().includes("disadvantage") && 
                            entry.toLowerCase().includes("second d20")) {
                            coreMechanicText = entry;
                            break;
                        }
                    }
                    
                    if (coreMechanicText) {
                        const cleanText = coreMechanicText
                            .replace(/^#+\s+/gm, '')
                            .replace(/^Advantage and Disadvantage\s*/i, '')
                            .trim();
                            
                        document.getElementById("rule-description").textContent = cleanText;
                    } else {
                        let fullText = data.desc || "";
                        
                        const paragraphs = fullText.split(/\n\n+/);
                        let relevantParagraph = "";
                        
                        for (const paragraph of paragraphs) {
                            if (paragraph.toLowerCase().includes("disadvantage") && 
                                paragraph.toLowerCase().includes("second d20")) {
                                relevantParagraph = paragraph;
                                break;
                            }
                        }
                        
                        if (relevantParagraph) {
                            const cleanText = relevantParagraph
                                .replace(/^#+\s+/gm, '')
                                .replace(/^Advantage and Disadvantage\s*/i, '')
                                .trim();
                                
                            document.getElementById("rule-description").textContent = cleanText;
                        } else {
                            document.getElementById("rule-description").textContent = 
                                "Sometimes a special ability or spell tells you that you have advantage or disadvantage on an ability check, a saving throw, or an attack roll. When that happens, you roll a second d20 when you make the roll. Use the lower roll if you have disadvantage.";
                        }
                    }
                }
            } else if (ruleId === "long-rest") {
                response = await fetch(`https://www.dnd5eapi.co/api/rule-sections/resting`);
                if (response.ok) {
                    data = await response.json();
                    document.getElementById("rule-name").textContent = "Long Rest";
                    
                    let fullText = "";
                    if (data.desc) {
                        fullText = data.desc;
                    } else if (data.entries && Array.isArray(data.entries)) {
                        fullText = data.entries.join("\n");
                    }
                    
                    let longRestText = "";
                    if (fullText.includes("### Long Rest")) {
                        const parts = fullText.split("### Long Rest");
                        if (parts.length > 1) {
                            let afterLongRest = parts[1].trim();
                            
                            const nextSectionMatch = afterLongRest.match(/###\s+\w/);
                            if (nextSectionMatch) {
                                afterLongRest = afterLongRest.substring(0, afterLongRest.indexOf(nextSectionMatch[0])).trim();
                            }
                            
                            longRestText = afterLongRest;
                        }
                    } else if (fullText.includes("Long Rest")) {
                        const parts = fullText.split("Long Rest");
                        if (parts.length > 1) {
                            longRestText = parts[1].trim();
                            
                            const firstSentenceEnd = longRestText.indexOf(".");
                            if (firstSentenceEnd > 0) {
                                longRestText = longRestText.substring(0, firstSentenceEnd + 1).trim();
                            }
                        }
                    } else {
                        longRestText = fullText;
                    }
                    
                    console.log("Extracted Long Rest text:", longRestText);
                    
                    document.getElementById("rule-description").textContent = longRestText;
                }
            } else {
                response = await fetch(`https://www.dnd5eapi.co/api/rule-sections/${ruleId}`);
                if (response.ok) {
                    data = await response.json();
                    document.getElementById("rule-name").textContent = data.name;
                    if (data.desc) {
                        document.getElementById("rule-description").textContent = data.desc;
                    } else if (data.entries && Array.isArray(data.entries)) {
                        document.getElementById("rule-description").textContent = data.entries.join(" ");
                    }
                }
            }
            
            if (response && response.ok) {
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const tooltipWidth = ruleTooltip.offsetWidth || 450;
                const tooltipHeight = ruleTooltip.offsetHeight || 200;

                let leftPosition = e.clientX + 15;
                let topPosition = e.clientY + 15;
                if (leftPosition + tooltipWidth > viewportWidth) {
                    leftPosition = e.clientX - tooltipWidth - 15;
                }
                if (topPosition + tooltipHeight > viewportHeight) {
                    topPosition = e.clientY - tooltipHeight - 15;
                }
                leftPos = Math.max(10, leftPosition);
                topPos = Math.max(10, topPosition);

                ruleTooltip.style.left = leftPos + "px";
                ruleTooltip.style.top = topPos + "px";
                ruleTooltip.classList.remove("hidden");
                ruleTooltip.style.visibility = "visible";
                ruleTooltip.style.display = "block";
                
                console.log("Rule data for", ruleId, ":", data);
            } else {
                console.error("Failed to fetch rule:", ruleId);
            }
        });
    
        link.addEventListener("mouseleave", () => {
            ruleTooltip.style.display = "none";
        });
    });
});