// rules api
//ngl, got some help on this one. Had to figure out how to extract the specific rules I wanted from the text dumps the API returns. Got some AI assistance with the regex patterns to clean up the text properly.
function setupRulesLinks() {
    const ruleLinks = document.querySelectorAll(".rule-link");
    const ruleTooltip = document.getElementById("rule-tooltip");

    ruleTooltip.addEventListener("mouseleave", () => {
        ruleTooltip.style.display = "none";
    });

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
                ruleTooltip.style.visibility = "visible";
                ruleTooltip.style.display = "block";
                ruleTooltip.style.left = "-9999px";
                ruleTooltip.style.top = "-9999px";
                
                setTimeout(() => {
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    const tooltipWidth = ruleTooltip.offsetWidth;
                    const tooltipHeight = ruleTooltip.offsetHeight;
                    
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
                    
                    leftPosition = Math.max(10, leftPosition);
                    
                    ruleTooltip.style.left = leftPosition + "px";
                    ruleTooltip.style.top = topPosition + "px";
                    
                    console.log("Rule tooltip positioned at:", {
                        left: leftPosition,
                        top: topPosition,
                        width: tooltipWidth,
                        height: tooltipHeight,
                        viewport: { width: viewportWidth, height: viewportHeight }
                    });
                }, 0);
                
                ruleTooltip.classList.remove("hidden");
            } else {
                console.error("Failed to fetch rule:", ruleId);
            }
        });
    
        link.addEventListener("mouseleave", () => {
            ruleTooltip.style.display = "none";
        });
    });
}