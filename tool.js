(function () {
    "use strict";

    console.log("✅ Custom Discord Script Loaded");

    // ==== TEXT REPLACEMENTS ====
    const replacements = {
        "scarning": "no",
        "ok_uh": "ok",
        "anonymousdoxbinuser": "end",
        "teriblys": "oh"
    };

    const dateReplacements = {
        "Feb 27, 2024": "September 10, 2020",
        "Feb 16, 2025": "November 20, 2016",
        "Feb 18, 2024": "May 13, 2015"
    };

    function replaceTextInNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.nodeValue;

            for (const [orig, repl] of Object.entries(replacements)) {
                text = text.replaceAll(orig, repl);
            }

            for (const [orig, repl] of Object.entries(dateReplacements)) {
                text = text.replaceAll(orig, repl);
            }

            node.nodeValue = text;

        } else if (node.nodeType === Node.ELEMENT_NODE) {

            if (node.placeholder) {
                for (const [orig, repl] of Object.entries(replacements)) {
                    node.placeholder = node.placeholder.replaceAll(orig, repl);
                }
            }

            if (node.hasAttribute && node.hasAttribute("aria-label")) {
                let label = node.getAttribute("aria-label");

                for (const [orig, repl] of Object.entries(replacements)) {
                    label = label.replaceAll(orig, repl);
                }

                node.setAttribute("aria-label", label);
            }

            node.childNodes.forEach(replaceTextInNode);
        }
    }

    function scanAndReplace(root = document.body) {
        replaceTextInNode(root);
    }

    // ==== FONT INJECTION (gg sans) ====
    const fontLink = document.createElement("link");
    fontLink.href = "https://cdn.jsdelivr.net/gh/dsrkafuu/gg-sans/css/ggsans.css";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);

    const style = document.createElement("style");
    style.innerHTML = `
        * {
            font-family: 'gg sans', 'Segoe UI', 'Helvetica Neue', sans-serif !important;
        }
    `;
    document.head.appendChild(style);

    // ==== INITIAL RUN ====
    window.addEventListener("load", () => {
        scanAndReplace();
    });

    // ==== OBSERVER FOR LIVE UPDATES ====
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    scanAndReplace(node);
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
