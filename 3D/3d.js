// --- Helper function to show messages ---
const messageBox = document.getElementById('messageBox');
function showMessage(message, duration = 3000) {
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, duration);
}

// --- Global Three.js Variables & App State ---
let scene, camera, renderer, orbitControls, transformControls;
let animationId = null; // ID untuk mengontrol loop animasi
const appState = {
    objects: [],
    selectedObject: null,
    currentTool: 'select', // Default tool
    transformMode: 'mouse', // Default transform mode
    isTransformingWithGizmo: false,
    initialObjectProps: {} // Untuk menyimpan properti awal saat transformasi gizmo
};
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// --- DOM Element Selectors ---
const selectors = {
    canvas: document.getElementById('drawingCanvas'),
    shapeButtons: {
        createVase: document.getElementById('createVase'),
        createCapsule: document.getElementById('createCapsule'),
        createMosqueDome: document.getElementById('createMosqueDome'),
        select: document.getElementById('selectToolBtn')
    },
    inputs: {
        fillColor: document.getElementById('fillColor'),
        fillColorCheck: document.getElementById('fillColorCheck'),
        strokeColor: document.getElementById('strokeColor'),
        strokeColorCheck: document.getElementById('strokeColorCheck'),
        strokeWidth: document.getElementById('strokeWidth'),
        translateX: document.getElementById('translateX'),
        translateY: document.getElementById('translateY'),
        translateZ: document.getElementById('translateZ'),
        scaleX: document.getElementById('scaleX'),
        scaleY: document.getElementById('scaleY'),
        scaleZ: document.getElementById('scaleZ'),
        rotateX: document.getElementById('rotateX'),
        rotateY: document.getElementById('rotateY'),
        rotateZ: document.getElementById('rotateZ'),
    },
    transformButtons: {
        form: document.getElementById('transformForm'),
        mouse: document.getElementById('transformMouse'),
        keyboard: document.getElementById('transformKeyboard'),
        applyTranslate: document.getElementById('applyTranslate'),
        applyScale: document.getElementById('applyScale'),
        applyRotate: document.getElementById('applyRotate'),
        // Tombol animasi baru
        startAnimation: document.getElementById('startAnimationBtn'),
        stopAnimation: document.getElementById('stopAnimationBtn')
    },
    misc: {
        clearCanvas: document.getElementById('clearCanvas'),
        saveAsImage: document.getElementById('saveAsImage'),
        transformFormInputs: document.getElementById('transformFormInputs')
    }
};

// --- Initialization ---
function initThree() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5); // Light gray background

    // Camera
    camera = new THREE.PerspectiveCamera(75, selectors.canvas.clientWidth / selectors.canvas.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 10); // Initial camera position
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: selectors.canvas, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(selectors.canvas.clientWidth, selectors.canvas.clientHeight);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // OrbitControls
    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.05;
    orbitControls.screenSpacePanning = false;
    orbitControls.minDistance = 1;
    orbitControls.maxDistance = 500;
    orbitControls.maxPolarAngle = Math.PI / 2;
    orbitControls.addEventListener('start', () => {
        if (appState.transformMode === 'mouse' && appState.selectedObject) {
            transformControls.enabled = false;
        }
    });
    orbitControls.addEventListener('end', () => {
        if (appState.transformMode === 'mouse' && appState.selectedObject) {
            transformControls.enabled = true;
        }
    });


    // TransformControls
    transformControls = new THREE.TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('dragging-changed', function (event) {
        orbitControls.enabled = !event.value;
        appState.isTransformingWithGizmo = event.value;
        if (!event.value && appState.selectedObject) {
            updateTransformFormInputs(appState.selectedObject);
        }
    });
    transformControls.addEventListener('objectChange', function () {
        if (appState.selectedObject) {
            updateTransformFormInputs(appState.selectedObject);
        }
    });

    scene.add(transformControls);

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
    selectors.canvas.addEventListener('click', onCanvasClick, false);
    document.addEventListener('keydown', onKeyDown, false);

    // Initial tool and transform mode setup
    setTool('select');
    setTransformMode('mouse');
    updateActiveTransformButton();
    updateActiveToolButton();
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);
    orbitControls.update();
    renderer.render(scene, camera);
}


// --- Animation Control Functions ---
function startObjectAnimation() {
    if (!appState.selectedObject) {
        showMessage("Pilih objek untuk dianimasikan.", 2000);
        return;
    }
    // Hentikan animasi sebelumnya jika ada
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    function animateLoop() {
        if (appState.selectedObject) {
            // Contoh animasi: rotasi objek
            appState.selectedObject.mesh.rotation.y += 0.01;
            appState.selectedObject.mesh.rotation.x += 0.005;
            // Perbarui nilai di form agar tetap sinkron
            updateTransformFormInputs(appState.selectedObject);
        }
        animationId = requestAnimationFrame(animateLoop);
    }
    animateLoop();
    showMessage("Animasi dimulai.", 1500);
}

function stopObjectAnimation() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
        showMessage("Animasi dihentikan.", 1500);
    }
}


// --- Event Handlers ---
function onWindowResize() {
    camera.aspect = selectors.canvas.clientWidth / selectors.canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(selectors.canvas.clientWidth, selectors.canvas.clientHeight);
}

function onCanvasClick(event) {
    if (appState.isTransformingWithGizmo) return;

    const rect = selectors.canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / selectors.canvas.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / selectors.canvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(appState.objects.map(obj => obj.mesh), true);

    if (intersects.length > 0) {
        let clickedAppObject = null;
        for (let i = 0; i < intersects.length; i++) {
            let intersectedMesh = intersects[i].object;
            while (intersectedMesh.parent && intersectedMesh.parent !== scene) {
                const parentInAppState = appState.objects.find(obj => obj.mesh === intersectedMesh.parent);
                if (parentInAppState) {
                    clickedAppObject = parentInAppState;
                    break;
                }
                intersectedMesh = intersectedMesh.parent;
            }
            if (clickedAppObject) break;
            clickedAppObject = appState.objects.find(obj => obj.mesh === intersects[i].object);
            if (clickedAppObject) break;
        }

        if (clickedAppObject) {
            selectObject(clickedAppObject);
        } else {
            const directHit = appState.objects.find(obj => obj.mesh === intersects[0].object);
            if (directHit) {
                selectObject(directHit);
            } else {
                deselectObject();
            }
        }
    } else {
        deselectObject();
    }
}

function onKeyDown(event) {
    // Cek jika sedang mengetik di dalam input field, jangan lakukan apa-apa
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
    }

    // Logika untuk menghapus objek (dibuat global)
    if ((event.key.toLowerCase() === 'delete' || event.key.toLowerCase() === 'backspace') && appState.selectedObject) {
        event.preventDefault(); // Mencegah browser kembali ke halaman sebelumnya saat menekan backspace
        removeObject(appState.selectedObject);
        return; // Keluar dari fungsi setelah menghapus
    }

    // Logika transformasi keyboard HANYA berjalan jika dalam mode 'keyboard'
    if (appState.transformMode !== 'keyboard' || !appState.selectedObject) return;

    const step = { move: event.shiftKey ? 0.1 : 1, scale: event.shiftKey ? 0.01 : 0.1, rotate: event.shiftKey ? 1 : 5 };
    let changed = false;
    const obj = appState.selectedObject.mesh;

    switch (event.key.toLowerCase()) {
        case 'arrowup': obj.position.y += step.move; changed = true; break;
        case 'arrowdown': obj.position.y -= step.move; changed = true; break;
        case 'arrowleft': obj.position.x -= step.move; changed = true; break;
        case 'arrowright': obj.position.x += step.move; changed = true; break;
        case 'pageup': obj.position.z += step.move; changed = true; break;
        case 'pagedown': obj.position.z -= step.move; changed = true; break;

        case 's':
            if (event.ctrlKey || event.metaKey) {
                obj.scale.x = Math.max(0.01, obj.scale.x - step.scale);
                obj.scale.y = Math.max(0.01, obj.scale.y - step.scale);
                obj.scale.z = Math.max(0.01, obj.scale.z - step.scale);
            } else {
                obj.scale.x += step.scale;
                obj.scale.y += step.scale;
                obj.scale.z += step.scale;
            }
            changed = true;
            break;
        case 'r': obj.rotation.y += THREE.MathUtils.degToRad(step.rotate); changed = true; break;
        case 'f': obj.rotation.y -= THREE.MathUtils.degToRad(step.rotate); changed = true; break;
        case 't': obj.rotation.x += THREE.MathUtils.degToRad(step.rotate); changed = true; break;
        case 'g': obj.rotation.x -= THREE.MathUtils.degToRad(step.rotate); changed = true; break;
        case 'y': obj.rotation.z += THREE.MathUtils.degToRad(step.rotate); changed = true; break;
        case 'h': obj.rotation.z -= THREE.MathUtils.degToRad(step.rotate); changed = true; break;
    }

    if (changed) {
        event.preventDefault();
        if (appState.selectedObject) { // Periksa apakah objek masih ada
            updateTransformFormInputs(appState.selectedObject);
            if (appState.selectedObject.edges) updateEdges(appState.selectedObject);
        }
    }
}


// --- Object Creation ---
function createVaseMesh() {
    const points = [];
    const y_min = (0 - 5) * 0.4;
    points.push(new THREE.Vector2(0, y_min));
    for (let i = 0; i < 10; i++) {
        points.push(new THREE.Vector2(Math.sin(i * 0.2) * 0.8 + 0.5, (i - 5) * 0.4));
    }
    const geometry = new THREE.LatheGeometry(points, 32);
    const material = new THREE.MeshStandardMaterial({
        color: parseInt(selectors.inputs.fillColor.value.replace("#", "0x"), 16),
        roughness: 0.5,
        metalness: 0.2,
        side: THREE.DoubleSide,
        visible: selectors.inputs.fillColorCheck.checked
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.type = 'Vase';
    return mesh;
}

function createCapsuleMesh() {
    const radius = 0.7;
    const height = 1.5;
    const sphereSegments = 32;
    const cylinderSegments = 32;
    const cylinderGeom = new THREE.CylinderGeometry(radius, radius, height, cylinderSegments);
    const sphereGeom = new THREE.SphereGeometry(radius, sphereSegments, sphereSegments, 0, Math.PI * 2, 0, Math.PI / 2);
    const material = new THREE.MeshStandardMaterial({
        color: parseInt(selectors.inputs.fillColor.value.replace("#", "0x"), 16),
        roughness: 0.4,
        metalness: 0.1,
        side: THREE.DoubleSide,
        visible: selectors.inputs.fillColorCheck.checked
    });
    const cylinder = new THREE.Mesh(cylinderGeom, material);
    const topSphere = new THREE.Mesh(sphereGeom, material);
    topSphere.position.y = height / 2;
    const bottomSphere = new THREE.Mesh(sphereGeom, material);
    bottomSphere.position.y = -height / 2;
    bottomSphere.rotation.x = Math.PI;
    const group = new THREE.Group();
    group.add(cylinder);
    group.add(topSphere);
    group.add(bottomSphere);
    group.userData.type = 'Capsule';
    return group;
}

function createCrescentMoonMesh(radius = 0.15, thickness = 0.05, color = 0xffd700) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(thickness * 0.2, 0, radius - thickness, 0, Math.PI * 2, true);
    shape.holes.push(hole);
    const extrudeSettings = { depth: thickness, bevelEnabled: false, steps: 1 };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8,
        metalness: 0.6,
        side: THREE.DoubleSide
    });
    const moonMesh = new THREE.Mesh(geometry, material);
    moonMesh.rotation.y = Math.PI / 2;
    return moonMesh;
}

function createMosqueDomeMesh() {
    const domeScale = 1.5;
    const radialSegments = 32;
    const DOME_BASE_RADIUS = domeScale;
    const DOME_CURVE_HEIGHT = domeScale * 0.85;
    const pillarRadius = DOME_BASE_RADIUS * 0.05;
    const actualPillarTotalHeight = DOME_CURVE_HEIGHT * 0.25;
    const pillarShaftPortion = 0.7;
    const points = [];
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(DOME_BASE_RADIUS, 0));
    points.push(new THREE.Vector2(DOME_BASE_RADIUS * 0.97, DOME_CURVE_HEIGHT * 0.25));
    points.push(new THREE.Vector2(DOME_BASE_RADIUS * 0.85, DOME_CURVE_HEIGHT * 0.55));
    points.push(new THREE.Vector2(DOME_BASE_RADIUS * 0.60, DOME_CURVE_HEIGHT * 0.80));
    points.push(new THREE.Vector2(pillarRadius, DOME_CURVE_HEIGHT));
    points.push(new THREE.Vector2(pillarRadius, DOME_CURVE_HEIGHT + actualPillarTotalHeight * pillarShaftPortion));
    points.push(new THREE.Vector2(0, DOME_CURVE_HEIGHT + actualPillarTotalHeight));
    const domeGeom = new THREE.LatheGeometry(points, radialSegments);
    const material = new THREE.MeshStandardMaterial({
        color: parseInt(selectors.inputs.fillColor.value.replace("#", "0x"), 16),
        roughness: 0.8,
        metalness: 0.5,
        side: THREE.DoubleSide,
        visible: selectors.inputs.fillColorCheck.checked
    });
    const domeMesh = new THREE.Mesh(domeGeom, material);
    domeMesh.position.y = 0;
    domeMesh.userData.type = 'MosqueDome';
    const moonBaseRadius = DOME_BASE_RADIUS * 0.12;
    const moonThickness = moonBaseRadius * 0.2;
    const moonColor = 0xffd700;
    const moonMesh = createCrescentMoonMesh(moonBaseRadius, moonThickness, moonColor);
    const moonPositionY = DOME_CURVE_HEIGHT + actualPillarTotalHeight + moonBaseRadius * 0.5;
    moonMesh.position.set(0, moonPositionY, 0);
    domeMesh.add(moonMesh);
    return domeMesh;
}

function add3DObject(creationFunction) {
    const mesh = creationFunction();
    const newObject = {
        id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        mesh: mesh,
        edges: null,
    };
    if (selectors.inputs.strokeColorCheck.checked) {
        if (mesh.type === 'Group') {
            mesh.children.forEach(childMesh => {
                if (childMesh.geometry) {
                    const edgesGeom = new THREE.EdgesGeometry(childMesh.geometry, 1);
                    const edgesMat = new THREE.LineBasicMaterial({
                        color: parseInt(selectors.inputs.strokeColor.value.replace("#", "0x"), 16),
                        linewidth: parseFloat(selectors.inputs.strokeWidth.value)
                    });
                    const childEdges = new THREE.LineSegments(edgesGeom, edgesMat);
                    childMesh.add(childEdges);
                    if (!newObject.edges) newObject.edges = [];
                    newObject.edges.push(childEdges);
                }
            });
        } else if (mesh.geometry) {
            const edgesGeom = new THREE.EdgesGeometry(mesh.geometry, 1);
            const edgesMat = new THREE.LineBasicMaterial({
                color: parseInt(selectors.inputs.strokeColor.value.replace("#", "0x"), 16),
                linewidth: parseFloat(selectors.inputs.strokeWidth.value)
            });
            newObject.edges = new THREE.LineSegments(edgesGeom, edgesMat);
            mesh.add(newObject.edges);
        }
    }
    scene.add(mesh);
    appState.objects.push(newObject);
    selectObject(newObject);
    showMessage(`${mesh.userData.type || 'Objek'} dibuat.`, 2000);
}

function updateEdges(appObject) {
    if (!appObject || !appObject.mesh) return;
    function removeOldEdges(targetMesh) {
        const edgesToRemove = [];
        targetMesh.children.forEach(child => {
            if (child instanceof THREE.LineSegments && child.geometry instanceof THREE.EdgesGeometry) {
                edgesToRemove.push(child);
            }
        });
        edgesToRemove.forEach(edge => {
            targetMesh.remove(edge);
            edge.geometry.dispose();
            edge.material.dispose();
        });
    }
    if (appObject.mesh.type === 'Group') {
        appObject.mesh.children.forEach(childMesh => {
            if (childMesh.geometry) removeOldEdges(childMesh);
        });
        appObject.edges = [];
    } else {
        removeOldEdges(appObject.mesh);
        appObject.edges = null;
    }
    if (selectors.inputs.strokeColorCheck.checked) {
        const edgesMat = new THREE.LineBasicMaterial({
            color: parseInt(selectors.inputs.strokeColor.value.replace("#", "0x"), 16),
            linewidth: parseFloat(selectors.inputs.strokeWidth.value)
        });
        if (appObject.mesh.type === 'Group') {
            appObject.mesh.children.forEach(childMesh => {
                if (childMesh.geometry) {
                    const edgesGeom = new THREE.EdgesGeometry(childMesh.geometry, 1);
                    const childEdges = new THREE.LineSegments(edgesGeom, edgesMat.clone());
                    childMesh.add(childEdges);
                    appObject.edges.push(childEdges);
                }
            });
        } else if (appObject.mesh.geometry) {
            const edgesGeom = new THREE.EdgesGeometry(appObject.mesh.geometry, 1);
            appObject.edges = new THREE.LineSegments(edgesGeom, edgesMat);
            appObject.mesh.add(appObject.edges);
        }
    }
}

// --- Selection & Deselection ---
function selectObject(appObject) {
    if (appState.selectedObject === appObject) return;
    deselectObject();
    appState.selectedObject = appObject;
    transformControls.attach(appObject.mesh);
    transformControls.visible = true;
    transformControls.enabled = appState.transformMode === 'mouse';
    updateTransformFormInputs(appObject);
    updateMaterialInputsFromObject(appObject);
    showMessage(`${appObject.mesh.userData.type || 'Objek'} terpilih.`, 1500);
}

function deselectObject() {
    stopObjectAnimation(); // Hentikan animasi saat objek tidak dipilih
    if (appState.selectedObject) {
        transformControls.detach();
        transformControls.visible = false;
        appState.selectedObject = null;
        clearTransformFormInputs();
    }
}

function removeObject(appObject) {
    if (!appObject) return;
    if (appState.selectedObject === appObject) {
        stopObjectAnimation(); // Hentikan animasi jika objek yang dihapus sedang beranimasi
        transformControls.detach();
    }
    scene.remove(appObject.mesh);
    function disposeHierarchy(object) {
        object.traverse((node) => {
            if (node.geometry) node.geometry.dispose();
            if (node.material) {
                if (Array.isArray(node.material)) {
                    node.material.forEach(m => m.dispose());
                } else {
                    node.material.dispose();
                }
            }
        });
    }
    disposeHierarchy(appObject.mesh);
    appState.objects = appState.objects.filter(obj => obj.id !== appObject.id);
    if (appState.selectedObject === appObject) {
        appState.selectedObject = null;
        clearTransformFormInputs();
    }
    showMessage(`${appObject.mesh.userData.type || 'Objek'} dihapus.`, 1500);
}

// --- UI Update Functions ---
function updateTransformFormInputs(appObject) {
    if (!appObject || !appObject.mesh) {
        clearTransformFormInputs();
        return;
    }
    const obj = appObject.mesh;
    selectors.inputs.translateX.value = obj.position.x.toFixed(2);
    selectors.inputs.translateY.value = obj.position.y.toFixed(2);
    selectors.inputs.translateZ.value = obj.position.z.toFixed(2);
    selectors.inputs.scaleX.value = obj.scale.x.toFixed(2);
    selectors.inputs.scaleY.value = obj.scale.y.toFixed(2);
    selectors.inputs.scaleZ.value = obj.scale.z.toFixed(2);
    selectors.inputs.rotateX.value = THREE.MathUtils.radToDeg(obj.rotation.x).toFixed(0);
    selectors.inputs.rotateY.value = THREE.MathUtils.radToDeg(obj.rotation.y).toFixed(0);
    selectors.inputs.rotateZ.value = THREE.MathUtils.radToDeg(obj.rotation.z).toFixed(0);
}

function clearTransformFormInputs() {
    selectors.inputs.translateX.value = 0;
    selectors.inputs.translateY.value = 0;
    selectors.inputs.translateZ.value = 0;
    selectors.inputs.scaleX.value = 1;
    selectors.inputs.scaleY.value = 1;
    selectors.inputs.scaleZ.value = 1;
    selectors.inputs.rotateX.value = 0;
    selectors.inputs.rotateY.value = 0;
    selectors.inputs.rotateZ.value = 0;
}

function updateMaterialInputsFromObject(appObject) {
    if (!appObject || !appObject.mesh) return;
    let materialToInspect;
    if (appObject.mesh.type === 'Group') {
        const firstChildWithMaterial = appObject.mesh.children.find(child => child.material);
        if (firstChildWithMaterial) materialToInspect = firstChildWithMaterial.material;
    } else {
        materialToInspect = appObject.mesh.material;
    }
    if (materialToInspect) {
        selectors.inputs.fillColorCheck.checked = materialToInspect.visible;
        selectors.inputs.fillColor.value = "#" + materialToInspect.color.getHexString();
    }
    let hasEdges = false;
    let edgeMaterialToInspect = null;
    if (appObject.mesh.type === 'Group' && appObject.edges && appObject.edges.length > 0) {
        const firstChildEdge = appObject.mesh.children.find(c => c.children.some(gc => gc instanceof THREE.LineSegments));
        if (firstChildEdge) {
            edgeMaterialToInspect = firstChildEdge.children.find(gc => gc instanceof THREE.LineSegments).material;
            hasEdges = true;
        }
    } else if (appObject.edges && appObject.mesh.type !== 'Group') {
        edgeMaterialToInspect = appObject.edges.material;
        hasEdges = true;
    }
    selectors.inputs.strokeColorCheck.checked = hasEdges && selectors.inputs.strokeColorCheck.checked;
    if (edgeMaterialToInspect) {
        selectors.inputs.strokeColor.value = "#" + edgeMaterialToInspect.color.getHexString();
        selectors.inputs.strokeWidth.value = edgeMaterialToInspect.linewidth;
    }
}

function applyMaterialChanges() {
    if (!appState.selectedObject) return;
    const appObj = appState.selectedObject;
    const fillColor = parseInt(selectors.inputs.fillColor.value.replace("#", "0x"), 16);
    const fillVisible = selectors.inputs.fillColorCheck.checked;
    function updateSingleMeshMaterial(mesh) {
        if (Array.isArray(mesh.material)) {
            mesh.material.forEach(m => {
                m.color.setHex(fillColor);
                m.visible = fillVisible;
            });
        } else if (mesh.material) {
            mesh.material.color.setHex(fillColor);
            mesh.material.visible = fillVisible;
        }
    }
    if (appObj.mesh.type === 'Group') {
        appObj.mesh.children.forEach(child => {
            if (child.isMesh) updateSingleMeshMaterial(child);
        });
    } else {
        updateSingleMeshMaterial(appObj.mesh);
    }
    updateEdges(appObj);
}

function setTool(toolName) {
    appState.currentTool = toolName;
    if (toolName === 'select') {
        orbitControls.enabled = true;
        if (appState.selectedObject) {
            transformControls.attach(appState.selectedObject.mesh);
            transformControls.visible = true;
            transformControls.enabled = appState.transformMode === 'mouse';
        } else {
            transformControls.detach();
            transformControls.visible = false;
        }
        selectors.canvas.style.cursor = 'grab';
    } else {
        deselectObject();
        orbitControls.enabled = true;
        transformControls.detach();
        transformControls.visible = false;
        selectors.canvas.style.cursor = 'crosshair';
    }
    updateActiveToolButton();
}

function setTransformMode(mode) {
    appState.transformMode = mode;
    if (appState.selectedObject) {
        transformControls.enabled = mode === 'mouse';
        transformControls.visible = mode === 'mouse';
    } else {
        transformControls.enabled = false;
        transformControls.visible = false;
    }
    selectors.misc.transformFormInputs.style.display = mode === 'form' ? 'block' : 'none';
    if (mode === 'form' && appState.selectedObject) {
        updateTransformFormInputs(appState.selectedObject);
    } else if (mode === 'form' && !appState.selectedObject) {
        clearTransformFormInputs();
    }
    updateActiveTransformButton();
    showMessage(`Mode Transformasi: ${mode.charAt(0).toUpperCase() + mode.slice(1)} aktif.`, 2000);
}

function updateActiveToolButton() {
    Object.values(selectors.shapeButtons).forEach(btn => btn.classList.remove('active'));
    const createToolActive = ['createVase', 'createCapsule', 'createMosqueDome'].includes(appState.currentTool);
    if (appState.currentTool === 'select' && selectors.shapeButtons.select) {
        selectors.shapeButtons.select.classList.add('active');
    } else if (selectors.shapeButtons[appState.currentTool]) {
        selectors.shapeButtons[appState.currentTool].classList.add('active');
    }
}
function updateActiveTransformButton() {
    // This needs adjustment to not include animation buttons in the active state logic for transform modes
    ['form', 'mouse', 'keyboard'].forEach(mode => {
        if (selectors.transformButtons[mode]) {
            selectors.transformButtons[mode].classList.remove('active');
        }
    });
    if (selectors.transformButtons[appState.transformMode]) {
        selectors.transformButtons[appState.transformMode].classList.add('active');
    }
}

// --- Toolbar Event Listeners ---
selectors.shapeButtons.createVase.addEventListener('click', () => { setTool('createVase'); add3DObject(createVaseMesh); });
selectors.shapeButtons.createCapsule.addEventListener('click', () => { setTool('createCapsule'); add3DObject(createCapsuleMesh); });
selectors.shapeButtons.createMosqueDome.addEventListener('click', () => { setTool('createMosqueDome'); add3DObject(createMosqueDomeMesh); });
selectors.shapeButtons.select.addEventListener('click', () => setTool('select'));

// Material options
selectors.inputs.fillColor.addEventListener('input', applyMaterialChanges);
selectors.inputs.fillColorCheck.addEventListener('change', applyMaterialChanges);
selectors.inputs.strokeColor.addEventListener('input', applyMaterialChanges);
selectors.inputs.strokeColorCheck.addEventListener('change', applyMaterialChanges);
selectors.inputs.strokeWidth.addEventListener('input', applyMaterialChanges);

// Transform mode buttons
selectors.transformButtons.mouse.addEventListener('click', () => setTransformMode('mouse'));
selectors.transformButtons.keyboard.addEventListener('click', () => setTransformMode('keyboard'));
selectors.transformButtons.form.addEventListener('click', () => setTransformMode('form'));

// Animation buttons
selectors.transformButtons.startAnimation.addEventListener('click', startObjectAnimation);
selectors.transformButtons.stopAnimation.addEventListener('click', stopObjectAnimation);


// Apply transform from form
selectors.transformButtons.applyTranslate.addEventListener('click', () => {
    if (appState.selectedObject) {
        appState.selectedObject.mesh.position.set(
            parseFloat(selectors.inputs.translateX.value),
            parseFloat(selectors.inputs.translateY.value),
            parseFloat(selectors.inputs.translateZ.value)
        );
        if (appState.selectedObject.edges) updateEdges(appState.selectedObject);
    } else showMessage("Pilih objek terlebih dahulu.", 2000);
});
selectors.transformButtons.applyScale.addEventListener('click', () => {
    if (appState.selectedObject) {
        appState.selectedObject.mesh.scale.set(
            Math.max(0.01, parseFloat(selectors.inputs.scaleX.value)),
            Math.max(0.01, parseFloat(selectors.inputs.scaleY.value)),
            Math.max(0.01, parseFloat(selectors.inputs.scaleZ.value))
        );
        if (appState.selectedObject.edges) updateEdges(appState.selectedObject);
    } else showMessage("Pilih objek terlebih dahulu.", 2000);
});
selectors.transformButtons.applyRotate.addEventListener('click', () => {
    if (appState.selectedObject) {
        appState.selectedObject.mesh.rotation.set(
            THREE.MathUtils.degToRad(parseFloat(selectors.inputs.rotateX.value)),
            THREE.MathUtils.degToRad(parseFloat(selectors.inputs.rotateY.value)),
            THREE.MathUtils.degToRad(parseFloat(selectors.inputs.rotateZ.value))
        );
        if (appState.selectedObject.edges) updateEdges(appState.selectedObject);
    } else showMessage("Pilih objek terlebih dahulu.", 2000);
});

// Misc buttons
selectors.misc.clearCanvas.addEventListener('click', () => {
    while (appState.objects.length > 0) {
        removeObject(appState.objects[0]);
    }
    if (transformControls.object) {
        transformControls.detach();
    }
    appState.selectedObject = null;
    clearTransformFormInputs();
    showMessage("Kanvas dibersihkan.", 1500);
});

selectors.misc.saveAsImage.addEventListener('click', () => {
    try {
        const imageName = prompt("Masukkan nama file gambar:", "gambar-3d.png");
        if (imageName) {
            stopObjectAnimation(); // Hentikan animasi sebelum menyimpan
            const tcVisible = transformControls.visible;
            transformControls.visible = false;
            renderer.render(scene, camera);
            setTimeout(() => {
                const dataURL = renderer.domElement.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = imageName;
                link.href = dataURL;
                link.click();
                transformControls.visible = tcVisible;
                showMessage(`Gambar disimpan sebagai ${imageName}`, 2000);
            }, 100);
        }
    } catch (e) {
        showMessage("Gagal menyimpan gambar. Browser Anda mungkin tidak mendukung fitur ini atau ada isu keamanan (CORS jika canvas tainted).", 5000);
        console.error("Save image error:", e);
    }
});

// --- Start the application ---
initThree();
animate();
showMessage("Selamat datang di Aplikasi Menggambar 3D! Pilih bentuk atau alat.", 3500);
onWindowResize();

document.getElementById('showHelp').addEventListener('click', () => {
    document.getElementById('helpOverlay').style.display = 'block';
});
