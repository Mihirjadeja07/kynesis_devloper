const root = document.documentElement;
const body = document.body;
const cursorShell = document.querySelector(".cursor-shell");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const magneticNodes = document.querySelectorAll(".magnetic");
const commandToggle = document.getElementById("commandToggle");
const commandPanel = document.getElementById("commandPanel");
const themeToggle = document.getElementById("themeToggle");
const themeToggleValue = document.getElementById("themeToggleValue");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const typingStream = document.getElementById("typingStream");
const form = document.getElementById("applicationForm");
const formStatus = document.getElementById("formStatus");
const pageName = body.dataset.page || "site";
const topbar = document.querySelector(".topbar");
const serviceModal = document.getElementById("serviceModal");
const serviceModalTitle = document.getElementById("serviceModalTitle");
const serviceModalCommand = document.getElementById("serviceModalCommand");
const serviceModalSummary = document.getElementById("serviceModalSummary");
const serviceModalList = document.getElementById("serviceModalList");
const serviceModalClose = document.getElementById("serviceModalClose");

const themeStorageKey = "kynesis-theme";
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pointerX = window.innerWidth * 0.5;
let pointerY = window.innerHeight * 0.5;
let ringX = pointerX;
let ringY = pointerY;

function getCurrentTheme() {
    return root.dataset.theme === "dark" ? "dark" : "light";
}

function syncThemeControls(theme) {
    body.dataset.theme = theme;

    if (themeToggle) {
        const currentThemeLabel = theme === "dark" ? "Dark Mode" : "Light Mode";
        themeToggle.setAttribute("aria-pressed", String(theme === "dark"));
        themeToggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
        if (themeToggleValue) {
            themeToggleValue.textContent = currentThemeLabel;
        }
    }

    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", theme === "dark" ? "#06070b" : "#fff9f4");
    }
}

function setTheme(theme, { persist = true, emit = true } = {}) {
    root.dataset.theme = theme;
    syncThemeControls(theme);

    if (persist) {
        try {
            localStorage.setItem(themeStorageKey, theme);
        } catch (error) {
            // Ignore localStorage failures and keep the runtime theme active.
        }
    }

    if (emit) {
        window.dispatchEvent(new CustomEvent("kynesis:themechange", { detail: { theme } }));
    }
}

syncThemeControls(getCurrentTheme());

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        setTheme(getCurrentTheme() === "dark" ? "light" : "dark");
    });
}

try {
    if (!localStorage.getItem(themeStorageKey)) {
        systemThemeQuery.addEventListener("change", (event) => {
            setTheme(event.matches ? "dark" : "light", { persist: false });
        });
    }
} catch (error) {
    systemThemeQuery.addEventListener("change", (event) => {
        setTheme(event.matches ? "dark" : "light", { persist: false });
    });
}

function updateCursor(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (cursorDot) {
        cursorDot.style.left = `${pointerX}px`;
        cursorDot.style.top = `${pointerY}px`;
    }
}

if (!prefersReducedMotion && cursorShell && cursorDot && cursorRing) {
    document.addEventListener("mousemove", updateCursor);

    const animateCursor = () => {
        ringX += (pointerX - ringX) * 0.14;
        ringY += (pointerY - ringY) * 0.14;
        cursorRing.style.left = `${ringX}px`;
        cursorRing.style.top = `${ringY}px`;
        window.requestAnimationFrame(animateCursor);
    };

    window.requestAnimationFrame(animateCursor);

    magneticNodes.forEach((node) => {
        node.addEventListener("mouseenter", () => cursorShell.classList.add("active"));
        node.addEventListener("mouseleave", () => {
            cursorShell.classList.remove("active");
            node.style.transform = "";
        });
        node.addEventListener("mousemove", (event) => {
            const bounds = node.getBoundingClientRect();
            const offsetX = (event.clientX - (bounds.left + bounds.width / 2)) * 0.1;
            const offsetY = (event.clientY - (bounds.top + bounds.height / 2)) * 0.1;
            node.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        });
    });
}

const pagePhrases = {
    home: [
        "exploring the studio...",
        "curating the homepage...",
        "arranging visual highlights...",
        "setting the mood..."
    ],
    about: [
        "studio notes and philosophy...",
        "reading the brand story...",
        "framing the design point of view...",
        "loading the journal..."
    ],
    services: [
        "discovering service highlights...",
        "opening featured offerings...",
        "browsing what we build...",
        "collecting service details..."
    ],
    process: [
        "from brief to launch...",
        "walking through the workflow...",
        "shaping the delivery journey...",
        "lining up the next step..."
    ],
    careers: [
        "opening the careers space...",
        "highlighting opportunities...",
        "welcoming future builders...",
        "setting up applications..."
    ],
    contact: [
        "starting a private conversation...",
        "opening the contact space...",
        "waiting for your brief...",
        "ready when you are..."
    ]
};

const typePhrases = pagePhrases[pageName] || pagePhrases.home;
let phraseIndex = 0;
function cycleTypingStream() {
    if (!typingStream) return;
    typingStream.textContent = typePhrases[phraseIndex];
    phraseIndex = (phraseIndex + 1) % typePhrases.length;
}

cycleTypingStream();
window.setInterval(cycleTypingStream, 2400);

if (commandToggle && commandPanel) {
    if (topbar && commandToggle.parentElement !== topbar) {
        topbar.appendChild(commandToggle.parentElement);
    }

    commandToggle.addEventListener("click", () => {
        const isOpen = commandPanel.classList.toggle("open");
        body.classList.toggle("menu-open", isOpen);
        commandToggle.setAttribute("aria-expanded", String(isOpen));
        commandPanel.setAttribute("aria-hidden", String(!isOpen));
    });

    document.addEventListener("click", (event) => {
        if (!commandPanel.contains(event.target) && !commandToggle.contains(event.target)) {
            commandPanel.classList.remove("open");
            body.classList.remove("menu-open");
            commandToggle.setAttribute("aria-expanded", "false");
            commandPanel.setAttribute("aria-hidden", "true");
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            commandPanel.classList.remove("open");
            body.classList.remove("menu-open");
            commandToggle.setAttribute("aria-expanded", "false");
            commandPanel.setAttribute("aria-hidden", "true");
        }
    });

    commandPanel.querySelectorAll("a").forEach((anchor) => {
        anchor.addEventListener("click", () => {
            commandPanel.classList.remove("open");
            body.classList.remove("menu-open");
            commandToggle.setAttribute("aria-expanded", "false");
            commandPanel.setAttribute("aria-hidden", "true");
        });
    });
}

if (serviceModal && serviceModalTitle && serviceModalCommand && serviceModalSummary && serviceModalList) {
    const serviceTriggers = document.querySelectorAll(".service-detail-trigger");

    const closeServiceModal = () => {
        serviceModal.classList.remove("open");
        serviceModal.setAttribute("aria-hidden", "true");
        body.classList.remove("menu-open");
    };

    serviceTriggers.forEach((trigger) => {
        const openServiceModal = () => {
            serviceModalTitle.textContent = trigger.dataset.serviceTitle || "Service Module";
            serviceModalCommand.textContent = trigger.dataset.serviceCommand || "[module]";
            serviceModalSummary.textContent = trigger.dataset.serviceSummary || "";

            const items = (trigger.dataset.serviceItems || "")
                .split("|")
                .map((item) => item.trim())
                .filter(Boolean);

            serviceModalList.innerHTML = "";
            items.forEach((item) => {
                const li = document.createElement("li");
                li.textContent = item;
                serviceModalList.appendChild(li);
            });

            serviceModal.classList.add("open");
            serviceModal.setAttribute("aria-hidden", "false");
            body.classList.add("menu-open");
        };

        trigger.addEventListener("click", openServiceModal);
        trigger.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openServiceModal();
            }
        });
    });

    serviceModal.querySelectorAll("[data-service-close]").forEach((node) => {
        node.addEventListener("click", closeServiceModal);
    });

    if (serviceModalClose) {
        serviceModalClose.addEventListener("click", closeServiceModal);
    }

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && serviceModal.classList.contains("open")) {
            closeServiceModal();
        }
    });
}

const reveals = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15 }
);
reveals.forEach((node) => revealObserver.observe(node));

if (form && formStatus) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitButton = form.querySelector(".submit-button");
        const payload = Object.fromEntries(new FormData(form).entries());
        const successLabel = form.dataset.successLabel || "Transmission complete";
        const configuredEndpoint = form.dataset.endpoint;
        const endpointCandidates = [];

        if (configuredEndpoint) {
            endpointCandidates.push(configuredEndpoint);
        }

        endpointCandidates.push("/api/apply", "api/apply.php");

        if (!payload.role && form.dataset.roleDefault) {
            payload.role = form.dataset.roleDefault;
        }
        if (!payload.github) {
            payload.github = "";
        }

        submitButton.disabled = true;
        submitButton.textContent = "Transmitting...";
        formStatus.textContent = "Encrypting your payload and opening a secure channel.";

        try {
            let lastError = new Error("Transmission failed.");
            let responseData = null;

            for (const endpoint of [...new Set(endpointCandidates)]) {
                try {
                    const response = await fetch(endpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });

                    const contentType = response.headers.get("content-type") || "";
                    if (!contentType.includes("application/json")) {
                        throw new Error(`Endpoint ${endpoint} returned non-JSON response.`);
                    }

                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.message || `Transmission failed via ${endpoint}.`);
                    }

                    responseData = data;
                    break;
                } catch (endpointError) {
                    lastError = endpointError;
                }
            }

            if (!responseData) {
                throw lastError;
            }

            form.reset();
            formStatus.textContent = `${successLabel}. Reference ID ${responseData.id}.`;
        } catch (error) {
            formStatus.textContent = error.message || "Connection to the backend could not be established.";
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = submitButton.dataset.defaultLabel || submitButton.textContent.replace("Transmitting...", "").trim() || submitButton.textContent;
        }
    });

    const submitButton = form.querySelector(".submit-button");
    if (submitButton) {
        submitButton.dataset.defaultLabel = submitButton.textContent;
    }
}

const canvas = document.getElementById("heroCanvas");
if (canvas && typeof THREE !== "undefined") {
    const sceneThemes = {
        light: {
            fogColor: 0xf7f2ee,
            fogDensity: 0.018,
            ambientColor: 0xffffff,
            ambientIntensity: 1.2,
            keyLightColor: 0xff4f87,
            keyLightIntensity: 1.4,
            fillLightColor: 0xff8f57,
            fillLightIntensity: 1,
            rimLightColor: 0x49a6ff,
            rimLightIntensity: 0.8,
            filamentColor: 0xff8f57,
            filamentOpacity: 0.52,
            filamentSize: 0.14,
            haloColor: 0xff4f87,
            haloOpacity: 0.08,
            lineColors: [0xff4f87, 0xff8f57, 0x49a6ff],
            lineOpacity: 0.1,
            spriteOpacity: 0.78,
            orbPalettes: [
                ["rgba(255,215,107,0.95)", "rgba(255,143,87,0.78)", "rgba(255,255,255,0.34)"],
                ["rgba(255,79,135,0.95)", "rgba(124,92,255,0.72)", "rgba(255,255,255,0.34)"],
                ["rgba(73,166,255,0.92)", "rgba(124,92,255,0.65)", "rgba(255,255,255,0.32)"],
                ["rgba(255,255,255,0.98)", "rgba(255,79,135,0.28)", "rgba(255,255,255,0.28)"]
            ]
        },
        dark: {
            fogColor: 0x08090d,
            fogDensity: 0.015,
            ambientColor: 0xecf3ff,
            ambientIntensity: 0.74,
            keyLightColor: 0x7bdcff,
            keyLightIntensity: 0.96,
            fillLightColor: 0xd9e6ff,
            fillLightIntensity: 0.78,
            rimLightColor: 0x7daeff,
            rimLightIntensity: 0.72,
            filamentColor: 0x74ccff,
            filamentOpacity: 0.42,
            filamentSize: 0.15,
            haloColor: 0xd9e6ff,
            haloOpacity: 0.07,
            lineColors: [0x67c5ff, 0xbcd4ff, 0x7daeff],
            lineOpacity: 0.08,
            spriteOpacity: 0.62,
            orbPalettes: [
                ["rgba(123,220,255,0.72)", "rgba(103,197,255,0.28)", "rgba(255,255,255,0.2)"],
                ["rgba(217,230,255,0.66)", "rgba(125,174,255,0.24)", "rgba(255,255,255,0.2)"],
                ["rgba(244,248,255,0.58)", "rgba(143,225,255,0.14)", "rgba(255,255,255,0.16)"],
                ["rgba(125,174,255,0.56)", "rgba(103,197,255,0.18)", "rgba(255,255,255,0.18)"]
            ]
        }
    };

    const getSceneTheme = (themeName) => sceneThemes[themeName === "dark" ? "dark" : "light"];
    const initialTheme = getSceneTheme(getCurrentTheme());
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(initialTheme.fogColor, initialTheme.fogDensity);

    const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 38);

    const ambientLight = new THREE.AmbientLight(initialTheme.ambientColor, initialTheme.ambientIntensity);
    scene.add(ambientLight);

    const pinkLight = new THREE.PointLight(initialTheme.keyLightColor, initialTheme.keyLightIntensity, 120);
    pinkLight.position.set(12, 10, 22);
    scene.add(pinkLight);

    const warmLight = new THREE.PointLight(initialTheme.fillLightColor, initialTheme.fillLightIntensity, 100);
    warmLight.position.set(-16, -10, 18);
    scene.add(warmLight);

    const coolLight = new THREE.PointLight(initialTheme.rimLightColor, initialTheme.rimLightIntensity, 90);
    coolLight.position.set(0, 14, 16);
    scene.add(coolLight);

    const cursorField = { x: 0, y: 0 };
    document.addEventListener("mousemove", (event) => {
        cursorField.x = (event.clientX / window.innerWidth) * 2 - 1;
        cursorField.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    function createOrbTexture(colors) {
        const size = 256;
        const textureCanvas = document.createElement("canvas");
        textureCanvas.width = size;
        textureCanvas.height = size;
        const ctx = textureCanvas.getContext("2d");

        ctx.clearRect(0, 0, size, size);
        const gradient = ctx.createRadialGradient(size * 0.42, size * 0.38, size * 0.08, size / 2, size / 2, size * 0.42);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.45, colors[1]);
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.36, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = colors[2] || "rgba(255,255,255,0.34)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size * 0.23, 0, Math.PI * 2);
        ctx.stroke();

        const texture = new THREE.CanvasTexture(textureCanvas);
        texture.needsUpdate = true;
        return texture;
    }

    const syntaxGroup = new THREE.Group();
    scene.add(syntaxGroup);

    const spriteMeta = [];
    for (let index = 0; index < 22; index += 1) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: createOrbTexture(initialTheme.orbPalettes[index % initialTheme.orbPalettes.length]),
            transparent: true,
            opacity: initialTheme.spriteOpacity,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        const radius = 10 + Math.random() * 18;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 14;
        sprite.position.set(Math.cos(angle) * radius, height, Math.sin(angle) * radius * 0.55);
        const scale = 2.2 + Math.random() * 2.6;
        sprite.scale.set(scale, scale, scale);
        syntaxGroup.add(sprite);
        spriteMeta.push({
            sprite,
            baseX: sprite.position.x,
            baseY: sprite.position.y,
            baseZ: sprite.position.z,
            drift: Math.random() * Math.PI * 2,
            speed: 0.002 + Math.random() * 0.004
        });
    }

    const filamentCount = 170;
    const filamentPositions = new Float32Array(filamentCount * 3);
    const filamentOffsets = [];
    for (let index = 0; index < filamentCount; index += 1) {
        filamentPositions[index * 3] = (Math.random() - 0.5) * 42;
        filamentPositions[index * 3 + 1] = (Math.random() - 0.5) * 22;
        filamentPositions[index * 3 + 2] = (Math.random() - 0.5) * 30;
        filamentOffsets.push(Math.random() * Math.PI * 2);
    }

    const filamentGeometry = new THREE.BufferGeometry();
    filamentGeometry.setAttribute("position", new THREE.BufferAttribute(filamentPositions, 3));
    const filamentMaterial = new THREE.PointsMaterial({
        color: initialTheme.filamentColor,
        size: initialTheme.filamentSize,
        transparent: true,
        opacity: initialTheme.filamentOpacity,
        sizeAttenuation: true
    });
    const filamentCloud = new THREE.Points(filamentGeometry, filamentMaterial);
    scene.add(filamentCloud);

    const lineSegments = [];
    for (let index = 0; index < 26; index += 1) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6);
        geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        const material = new THREE.LineBasicMaterial({
            color: initialTheme.lineColors[index % initialTheme.lineColors.length],
            transparent: true,
            opacity: initialTheme.lineOpacity
        });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        lineSegments.push(line);
    }

    const haloGeometry = new THREE.TorusGeometry(11, 0.02, 18, 160);
    const haloMaterial = new THREE.MeshBasicMaterial({
        color: initialTheme.haloColor,
        transparent: true,
        opacity: initialTheme.haloOpacity
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.x = Math.PI / 2.7;
    scene.add(halo);

    function applySceneTheme(themeName) {
        const theme = getSceneTheme(themeName);

        scene.fog.color.setHex(theme.fogColor);
        scene.fog.density = theme.fogDensity;

        ambientLight.color.setHex(theme.ambientColor);
        ambientLight.intensity = theme.ambientIntensity;

        pinkLight.color.setHex(theme.keyLightColor);
        pinkLight.intensity = theme.keyLightIntensity;

        warmLight.color.setHex(theme.fillLightColor);
        warmLight.intensity = theme.fillLightIntensity;

        coolLight.color.setHex(theme.rimLightColor);
        coolLight.intensity = theme.rimLightIntensity;

        filamentMaterial.color.setHex(theme.filamentColor);
        filamentMaterial.opacity = theme.filamentOpacity;
        filamentMaterial.size = theme.filamentSize;

        haloMaterial.color.setHex(theme.haloColor);
        haloMaterial.opacity = theme.haloOpacity;

        lineSegments.forEach((line, index) => {
            line.material.color.setHex(theme.lineColors[index % theme.lineColors.length]);
            line.material.opacity = theme.lineOpacity;
        });

        spriteMeta.forEach((meta, index) => {
            const spriteTheme = theme.orbPalettes[index % theme.orbPalettes.length];
            if (meta.sprite.material.map) {
                meta.sprite.material.map.dispose();
            }
            meta.sprite.material.map = createOrbTexture(spriteTheme);
            meta.sprite.material.opacity = theme.spriteOpacity;
            meta.sprite.material.needsUpdate = true;
        });
    }

    applySceneTheme(getCurrentTheme());
    window.addEventListener("kynesis:themechange", (event) => applySceneTheme(event.detail.theme));

    function updateFilaments(time) {
        const positions = filamentGeometry.attributes.position.array;
        for (let index = 0; index < filamentCount; index += 1) {
            const stride = index * 3;
            positions[stride] += Math.sin(time * 0.0005 + filamentOffsets[index]) * 0.0025;
            positions[stride + 1] += Math.cos(time * 0.0004 + filamentOffsets[index]) * 0.002;
            positions[stride + 2] += Math.sin(time * 0.00035 + filamentOffsets[index]) * 0.0018;

            if (positions[stride] > 21) positions[stride] = -21;
            if (positions[stride] < -21) positions[stride] = 21;
            if (positions[stride + 1] > 12) positions[stride + 1] = -12;
            if (positions[stride + 1] < -12) positions[stride + 1] = 12;
            if (positions[stride + 2] > 15) positions[stride + 2] = -15;
            if (positions[stride + 2] < -15) positions[stride + 2] = 15;
        }

        filamentGeometry.attributes.position.needsUpdate = true;

        for (let index = 0; index < lineSegments.length; index += 1) {
            const start = (index * 5) % filamentCount;
            const end = (start + 17) % filamentCount;
            const positionsArray = lineSegments[index].geometry.attributes.position.array;
            positionsArray[0] = positions[start * 3];
            positionsArray[1] = positions[start * 3 + 1];
            positionsArray[2] = positions[start * 3 + 2];
            positionsArray[3] = positions[end * 3];
            positionsArray[4] = positions[end * 3 + 1];
            positionsArray[5] = positions[end * 3 + 2];
            lineSegments[index].geometry.attributes.position.needsUpdate = true;
        }
    }

    function animateScene(time) {
        const timeFactor = time * 0.001;
        syntaxGroup.rotation.y = timeFactor * 0.12;
        syntaxGroup.rotation.x = Math.sin(timeFactor * 0.18) * 0.05;
        halo.rotation.z = timeFactor * 0.08;

        spriteMeta.forEach((meta, index) => {
            const influenceX = cursorField.x * (index % 3 === 0 ? 1.4 : 0.85);
            const influenceY = cursorField.y * (index % 2 === 0 ? 1.2 : 0.7);
            meta.sprite.position.x = meta.baseX + Math.sin(time * meta.speed + meta.drift) * 1.2 + influenceX;
            meta.sprite.position.y = meta.baseY + Math.cos(time * meta.speed + meta.drift) * 0.9 + influenceY;
            meta.sprite.position.z = meta.baseZ + Math.sin(time * meta.speed * 0.6) * 1.6;
            meta.sprite.material.opacity = 0.55 + Math.sin(timeFactor + meta.drift) * 0.18;
        });

        updateFilaments(time);
        pinkLight.position.x = 12 + cursorField.x * 6;
        pinkLight.position.y = 10 + cursorField.y * 4;
        warmLight.position.x = -16 + cursorField.x * -4;
        warmLight.position.y = -10 + cursorField.y * -3;
        coolLight.position.x = cursorField.x * 5;
        coolLight.position.y = 14 + cursorField.y * 3;

        camera.position.x += ((cursorField.x * 1.4) - camera.position.x) * 0.02;
        camera.position.y += ((cursorField.y * 1.1) - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
        window.requestAnimationFrame(animateScene);
    }

    window.requestAnimationFrame(animateScene);

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
