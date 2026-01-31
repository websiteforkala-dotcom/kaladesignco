document.addEventListener("DOMContentLoaded", () => {
    const footer = document.querySelector(".savoirfaire-footer");
    console.log("Savoirfaire Footer Init. Element:", footer);
    if (!footer) {
        console.error("Savoirfaire Footer element not found!");
        return;
    }

    // Check GSAP
    if (typeof gsap === 'undefined') {
        console.error("GSAP is not loaded!");
        return;
    }

    const cursor = footer.querySelector(".cursor");
    const itemsContainer = footer.querySelector(".items-container");

    // Ensure assets are loaded or at least paths are correct
    const ASSET_PATH = "./assets/footer-assets";

    // MOUSE FOLLOW
    // Logic: The cursor is fixed/absolute. We want it to follow mouse.
    // If it's absolute within footer, it needs local coords if footer is relative.
    // If it's fixed, it needs viewport coords.
    // In CSS I set .savoirfaire-footer .cursor { position: fixed ... }
    // So we use e.clientX/Y.

    footer.addEventListener("mousemove", (e) => {
        gsap.to(cursor, {
            x: e.clientX, // Fixed position, top-left 0,0 usually requires centering if css doesn't handle transform
            y: e.clientY,
            // If CSS has transform: translate(-50%, -50%)? I didn't verify that in my CSS write.
            // Let's assume I need to center manually if not.
            // My CSS: display: flex; justify-content: center; align-items: center; 
            // It doesn't have transform: translate(-50%, -50%) on the class itself, 
            // but the original JS did: x: e.clientX - cursor.offsetWidth / 2
            x: e.clientX - (cursor.offsetWidth / 2),
            y: e.clientY - (cursor.offsetHeight / 2),
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
        });
    });

    footer.addEventListener("mouseleave", () => {
        gsap.to(cursor, { opacity: 0 });
    });

    // CLICK EFFECT
    footer.addEventListener("click", function (event) {
        // Sound
        const clickSound = new Audio(`${ASSET_PATH}/click-sfx.mp3`);
        clickSound.volume = 0.4;
        clickSound.play().catch(() => { });

        const itemType = Math.random() < 0.5 ? "video" : "image";
        let container = document.createElement("div");
        // Width reference from original code
        let elementWidth = 700;

        if (itemType === "video") {
            const videoNumber = Math.floor(Math.random() * 7) + 1;
            // Ensure videos play inline and muted to auto-play reliably
            container.innerHTML = `<div class="video-container">
                                  <video autoplay loop muted playsinline>
                                    <source src="${ASSET_PATH}/vid-${videoNumber}.mp4" type="video/mp4"/>
                                  </video>
                                </div>`;
        } else {
            const imgNumber = Math.floor(Math.random() * 6) + 1;
            container.innerHTML = `<div class="img-container">
                                  <img src="${ASSET_PATH}/img-${imgNumber}.jpg" alt="" />
                                </div>`;
        }

        const appendedElement = container.firstChild;
        itemsContainer.appendChild(appendedElement);

        // Position logic
        // items-container is absolute to footer (top:0 left:0).
        // footer is in flow.
        // We need coordinates relative to the footer.
        const footerRect = footer.getBoundingClientRect();
        const localX = event.clientX - footerRect.left;
        const localY = event.clientY - footerRect.top;

        appendedElement.style.left = `${localX - elementWidth / 2}px`;
        appendedElement.style.top = `${localY}px`;

        const randomRotation = Math.random() * 10 - 5;

        gsap.set(appendedElement, {
            scale: 0,
            rotation: randomRotation,
            transformOrigin: "center",
        });

        const tl = gsap.timeline();
        const randomScale = Math.random() * 0.5 + 0.5;

        tl.to(appendedElement, {
            scale: randomScale,
            duration: 0.5,
            delay: 0.1,
        });

        tl.to(appendedElement, {
            y: () => `-=500`,
            opacity: 1,
            duration: 4,
            ease: "none",
        }, "<")
            .to(appendedElement, {
                opacity: 0,
                duration: 1,
                onComplete: () => {
                    if (appendedElement.parentNode) {
                        appendedElement.parentNode.removeChild(appendedElement);
                    }
                },
            }, "-=0.5");
    });
});
