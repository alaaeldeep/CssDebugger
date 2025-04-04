(() => {
    if (window.__outlineDebuggerActive) {
        removeDebugger();
        window.__outlineDebuggerActive = false;
    } else {
        activateDebugger();
        window.__outlineDebuggerActive = true;
    }

    function activateDebugger() {
        chrome.storage.local.get(
            {
                outlineColor: "#ff0000",
                outlineThickness: "1",
                outlineStyle: "solid",
                selector: "*",
                enableGrid: false,
                gridSize: "20",
                enableTooltips: false,
                enableInspector: false,
            },
            (settings) => {
                const outlineStyleEl = document.createElement("style");
                outlineStyleEl.id = "outline-debugger-outlines";
                outlineStyleEl.textContent = `${settings.selector} { outline: ${settings.outlineThickness}px ${settings.outlineStyle} ${settings.outlineColor} !important; }`;
                document.head.appendChild(outlineStyleEl);

                if (settings.enableGrid) {
                    const gridStyleEl = document.createElement("style");
                    gridStyleEl.id = "outline-debugger-grid";
                    gridStyleEl.textContent = `
          body::after {
            content: "";
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
              linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px);
            background-size: ${settings.gridSize}px ${settings.gridSize}px;
            pointer-events: none;
            z-index: 9999;
          }
        `;
                    document.head.appendChild(gridStyleEl);
                }

                if (settings.enableTooltips) {
                    const tooltip = document.createElement("div");
                    tooltip.id = "outline-debugger-tooltip";
                    tooltip.style.position = "fixed";
                    tooltip.style.background = "rgba(0, 0, 0, 0.7)";
                    tooltip.style.color = "#fff";
                    tooltip.style.padding = "4px 6px";
                    tooltip.style.fontSize = "12px";
                    tooltip.style.borderRadius = "4px";
                    tooltip.style.zIndex = "10000";
                    tooltip.style.pointerEvents = "none";
                    tooltip.style.transition = "opacity 0.2s";
                    tooltip.style.opacity = "0";
                    document.body.appendChild(tooltip);

                    function showTooltip(e) {
                        const target = e.target;
                        const rect = target.getBoundingClientRect();
                        tooltip.textContent = `W: ${Math.round(
                            rect.width
                        )}px, H: ${Math.round(rect.height)}px`;
                        tooltip.style.left = `${e.pageX + 10}px`;
                        tooltip.style.top = `${e.pageY + 10}px`;
                        tooltip.style.opacity = "1";
                    }

                    function moveTooltip(e) {
                        tooltip.style.left = `${e.pageX + 10}px`;
                        tooltip.style.top = `${e.pageY + 10}px`;
                    }

                    function hideTooltip() {
                        tooltip.style.opacity = "0";
                    }

                    document.addEventListener("mouseover", showTooltip);
                    document.addEventListener("mousemove", moveTooltip);
                    document.addEventListener("mouseout", hideTooltip);

                    window.__outlineDebuggerTooltipListeners = {
                        showTooltip,
                        moveTooltip,
                        hideTooltip,
                    };
                }

                if (settings.enableInspector) {
                    function inspectorClick(e) {
                        if (!e.shiftKey) return;
                        e.preventDefault();
                        e.stopPropagation();

                        const oldPopup = document.getElementById(
                            "outline-debugger-inspector"
                        );
                        if (oldPopup) oldPopup.remove();

                        const target = e.target;
                        const rect = target.getBoundingClientRect();
                        const computed = window.getComputedStyle(target);
                        const info = `
            Tag: ${target.tagName}
            ${target.id ? "ID: #" + target.id : ""}
            ${target.className ? "Classes: " + target.className : ""}
            Width: ${Math.round(rect.width)}px, Height: ${Math.round(
                            rect.height
                        )}px
            Margin: ${computed.margin}
          `;

                        const inspector = document.createElement("div");
                        inspector.id = "outline-debugger-inspector";
                        inspector.style.position = "fixed";
                        inspector.style.background = "rgba(0, 0, 0, 0.8)";
                        inspector.style.color = "#fff";
                        inspector.style.padding = "8px";
                        inspector.style.fontSize = "12px";
                        inspector.style.borderRadius = "4px";
                        inspector.style.zIndex = "10001";
                        inspector.style.left = `${e.pageX + 10}px`;
                        inspector.style.top = `${e.pageY + 10}px`;
                        inspector.style.maxWidth = "300px";
                        inspector.style.whiteSpace = "pre-wrap";
                        inspector.textContent = info.trim();
                        document.body.appendChild(inspector);

                        setTimeout(() => {
                            if (inspector) inspector.remove();
                        }, 4000);
                    }

                    document.addEventListener("click", inspectorClick, true);
                    window.__outlineDebuggerInspectorListener = inspectorClick;
                }

                const observer = new MutationObserver((mutationsList) => {
                    if (!document.getElementById("outline-debugger-outlines")) {
                        document.head.appendChild(outlineStyleEl);
                    }
                    if (
                        settings.enableGrid &&
                        !document.getElementById("outline-debugger-grid")
                    ) {
                        document.head.appendChild(
                            document.getElementById("outline-debugger-grid") ||
                                gridStyleEl
                        );
                    }
                });

                observer.observe(document.body, {
                    childList: true,
                    subtree: true,
                });
                window.__outlineDebuggerObserver = observer;
            }
        );
    }

    function removeDebugger() {
        const outlineStyleEl = document.getElementById(
            "outline-debugger-outlines"
        );
        if (outlineStyleEl) outlineStyleEl.remove();

        const gridStyleEl = document.getElementById("outline-debugger-grid");
        if (gridStyleEl) gridStyleEl.remove();

        const tooltip = document.getElementById("outline-debugger-tooltip");
        if (tooltip) tooltip.remove();
        if (window.__outlineDebuggerTooltipListeners) {
            document.removeEventListener(
                "mouseover",
                window.__outlineDebuggerTooltipListeners.showTooltip
            );
            document.removeEventListener(
                "mousemove",
                window.__outlineDebuggerTooltipListeners.moveTooltip
            );
            document.removeEventListener(
                "mouseout",
                window.__outlineDebuggerTooltipListeners.hideTooltip
            );
            window.__outlineDebuggerTooltipListeners = null;
        }

        if (window.__outlineDebuggerInspectorListener) {
            document.removeEventListener(
                "click",
                window.__outlineDebuggerInspectorListener,
                true
            );
            window.__outlineDebuggerInspectorListener = null;
        }

        if (window.__outlineDebuggerObserver) {
            window.__outlineDebuggerObserver.disconnect();
            window.__outlineDebuggerObserver = null;
        }

        const inspector = document.getElementById("outline-debugger-inspector");
        if (inspector) inspector.remove();
    }
})();
