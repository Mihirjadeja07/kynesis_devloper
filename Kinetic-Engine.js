const body = document.body;
const cursorShell = document.querySelector(".cursor-shell");
const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
const magneticNodes = document.querySelectorAll(".magnetic");
const commandToggle = document.getElementById("commandToggle");
const commandPanel = document.getElementById("commandPanel");
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

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let pointerX = window.innerWidth * 0.5;
let pointerY = window.innerHeight * 0.5;
let ringX = pointerX;
let ringY = pointerY;

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
        "initializing network shell...",
        "mapping node mesh...",
        "routing data packet...",
        "stabilizing session..."
    ],
    about: [
        "loading system log...",
        "reading architecture manifest...",
        "tracing origin nodes...",
        "indexing mission layer..."
    ],
    services: [
        "select service module...",
        "enumerating capabilities...",
        "binding command cards...",
        "calibrating service graph..."
    ],
    process: [
        "running optimization pipeline...",
        "sequencing architecture cycle...",
        "validating output flow...",
        "syncing support layer..."
    ],
    careers: [
        "new data points welcomed...",
        "opening careers portal...",
        "aligning internship nodes...",
        "priming intake channel..."
    ],
    contact: [
        "preparing commit interface...",
        "opening secure channel...",
        "encrypting transmission layer...",
        "awaiting message payload..."
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
    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    const camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 38);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const platinumLight = new THREE.PointLight(0xffffff, 1.2, 120);
    platinumLight.position.set(12, 10, 22);
    scene.add(platinumLight);

    const goldLight = new THREE.PointLight(0xc6a66a, 1, 100);
    goldLight.position.set(-16, -10, 18);
    scene.add(goldLight);

    const cursorField = { x: 0, y: 0 };
    document.addEventListener("mousemove", (event) => {
        cursorField.x = (event.clientX / window.innerWidth) * 2 - 1;
        cursorField.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    const tokenLabels = ["const", "map()", "node", "=>", "mesh", "if", "{ }", "< />", "scale", "sync"];
    function createTokenTexture(label) {
        const size = 256;
        const textureCanvas = document.createElement("canvas");
        textureCanvas.width = size;
        textureCanvas.height = size;
        const ctx = textureCanvas.getContext("2d");

        ctx.clearRect(0, 0, size, size);
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, "rgba(255,255,255,0.95)");
        gradient.addColorStop(1, "rgba(198,166,106,0.9)");
        ctx.fillStyle = gradient;
        ctx.font = "500 72px IBM Plex Mono";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowBlur = 18;
        ctx.shadowColor = "rgba(255,255,255,0.45)";
        ctx.fillText(label, size / 2, size / 2);

        const texture = new THREE.CanvasTexture(textureCanvas);
        texture.needsUpdate = true;
        return texture;
    }

    const syntaxGroup = new THREE.Group();
    scene.add(syntaxGroup);

    const spriteMeta = [];
    for (let index = 0; index < 22; index += 1) {
        const spriteMaterial = new THREE.SpriteMaterial({
            map: createTokenTexture(tokenLabels[index % tokenLabels.length]),
            transparent: true,
            opacity: 0.84,
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
        color: 0xf4f5f8,
        size: 0.12,
        transparent: true,
        opacity: 0.9,
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
            color: index % 2 === 0 ? 0xffffff : 0xc6a66a,
            transparent: true,
            opacity: 0.18
        });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        lineSegments.push(line);
    }

    const haloGeometry = new THREE.TorusGeometry(11, 0.02, 18, 160);
    const haloMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.12
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    halo.rotation.x = Math.PI / 2.7;
    scene.add(halo);

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
        syntaxGroup.rotation.x = Math.sin(timeFactor * 0.2) * 0.08;
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
        platinumLight.position.x = 12 + cursorField.x * 8;
        platinumLight.position.y = 10 + cursorField.y * 6;
        goldLight.position.x = -16 + cursorField.x * -5;
        goldLight.position.y = -10 + cursorField.y * -4;

        camera.position.x += ((cursorField.x * 2.2) - camera.position.x) * 0.02;
        camera.position.y += ((cursorField.y * 1.4) - camera.position.y) * 0.02;
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
