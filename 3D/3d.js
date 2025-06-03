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
        applyRotate: document.getElementById('applyRotate')
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6); // Softer ambient light
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8); // Stronger directional light
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
    // orbitControls.addEventListener('change', animate); // REMOVED to prevent call stack error
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
        // animate(); // REMOVED to prevent call stack error - main loop handles rendering
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

// --- Event Handlers ---
function onWindowResize() {
    camera.aspect = selectors.canvas.clientWidth / selectors.canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(selectors.canvas.clientWidth, selectors.canvas.clientHeight);
    // animate(); // No need to call animate() here, main loop will render
}

function onCanvasClick(event) {
    if (appState.isTransformingWithGizmo) return;

    const rect = selectors.canvas.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / selectors.canvas.clientWidth) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / selectors.canvas.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(appState.objects.map(obj => obj.mesh), true); // Set recursive to true for groups

    if (intersects.length > 0) {
        // Find the parent mesh that is stored in appState.objects
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
            // If no parent in appState, check the intersected mesh itself
            clickedAppObject = appState.objects.find(obj => obj.mesh === intersects[i].object);
            if (clickedAppObject) break;
        }

        if (clickedAppObject) {
            selectObject(clickedAppObject);
        } else {
            // If the intersected object is part of a group but not the main group mesh itself,
            // try to find its root appState object. This is a fallback.
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
    // animate(); // No need to call animate() here, main loop will render
}

function onKeyDown(event) {
    if (appState.transformMode !== 'keyboard' || !appState.selectedObject) return;

    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
        return;
    }

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

        case 'delete':
        case 'backspace':
            removeObject(appState.selectedObject);
            changed = true; // removeObject calls deselect which clears form
            // No need to update form here if object is gone
            break;
    }

    if (changed) {
        event.preventDefault();
        if (appState.selectedObject) { // Check if object still exists (not deleted)
            updateTransformFormInputs(appState.selectedObject);
            if (appState.selectedObject.edges) updateEdges(appState.selectedObject);
        }
        // animate(); // No need to call animate() here, main loop will render
    }
}


// --- Object Creation ---
function createVaseMesh() {
    const points = [];
    const y_min = (0 - 5) * 0.4; // Ketinggian terendah vas

    // Tambahkan titik di pusat dasar untuk menutup bagian bawah
    points.push(new THREE.Vector2(0, y_min)); // Titik ini menutup lubang di dasar

    for (let i = 0; i < 10; i++) {
        // Titik-titik asli profil vas Anda
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

    // CylinderGeometry secara default sudah tertutup (openEnded: false)
    const cylinderGeom = new THREE.CylinderGeometry(radius, radius, height, cylinderSegments);
    // SphereGeometry juga solid
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

// Fungsi untuk membuat bulan
function createCrescentMoonMesh(radius = 0.15, thickness = 0.05, color = 0xffd700) {
    const shape = new THREE.Shape();
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);
    const hole = new THREE.Path();
    hole.absarc(thickness * 0.2, 0, radius - thickness, 0, Math.PI * 2, true);
    shape.holes.push(hole);

    const extrudeSettings = {
        depth: thickness,
        bevelEnabled: false,
        steps: 1
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    // Modifikasi material bulan sabit agar tidak terlalu mengkilap
    const material = new THREE.MeshStandardMaterial({
        color: color,
        roughness: 0.8, // Dinaikkan agar lebih matte
        metalness: 0.6, // Sedikit dikurangi, atau bisa tetap tinggi jika ingin emas matte pekat
        side: THREE.DoubleSide
    });
    const moonMesh = new THREE.Mesh(geometry, material);

    moonMesh.rotation.y = Math.PI / 2;
    return moonMesh;
}

// Fungsi utama untuk membuat kubah masjid beserta detailnya
function createMosqueDomeMesh() {
    const domeScale = 1.5;
    const radialSegments = 32;

    const DOME_BASE_RADIUS = domeScale;
    const DOME_CURVE_HEIGHT = domeScale * 0.85;

    const pillarRadius = DOME_BASE_RADIUS * 0.05;
    const actualPillarTotalHeight = DOME_CURVE_HEIGHT * 0.25;
    const pillarShaftPortion = 0.7;

    const points = [];
    // Tambahkan titik di pusat dasar kubah untuk menutup bagian bawah
    points.push(new THREE.Vector2(0, 0)); // Titik ini menutup lubang di dasar kubah

    // Titik-titik profil asli kubah Anda
    points.push(new THREE.Vector2(DOME_BASE_RADIUS, 0)); // Titik ini sekarang menjadi tepi luar dari dasar yang solid
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
        side: THREE.DoubleSide, // Atau THREE.FrontSide
        visible: selectors.inputs.fillColorCheck.checked
    });

    const domeMesh = new THREE.Mesh(domeGeom, material);
    domeMesh.position.y = 0;
    domeMesh.userData.type = 'MosqueDome';

    // Bulan sabit (tidak berubah)
    const moonBaseRadius = DOME_BASE_RADIUS * 0.12;
    const moonThickness = moonBaseRadius * 0.2;
    const moonColor = 0xffd700;
    const moonMesh = createCrescentMoonMesh(moonBaseRadius, moonThickness, moonColor); // Pastikan fungsi ini ada
    const moonPositionY = DOME_CURVE_HEIGHT + actualPillarTotalHeight + moonBaseRadius * 0.5;
    moonMesh.position.set(0, moonPositionY, 0);
    domeMesh.add(moonMesh);

    return domeMesh;
}

function add3DObject(creationFunction) {
    const mesh = creationFunction(); // This can be a Mesh or a Group
    const newObject = {
        id: `obj_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        mesh: mesh,
        edges: null,
    };

    // Add edges. For Groups, add edges to its children if applicable.
    if (selectors.inputs.strokeColorCheck.checked) {
        if (mesh.type === 'Group') {
            mesh.children.forEach(childMesh => {
                if (childMesh.geometry) { // Ensure child has geometry
                    const edgesGeom = new THREE.EdgesGeometry(childMesh.geometry, 1);
                    const edgesMat = new THREE.LineBasicMaterial({
                        color: parseInt(selectors.inputs.strokeColor.value.replace("#", "0x"), 16),
                        linewidth: parseFloat(selectors.inputs.strokeWidth.value)
                    });
                    const childEdges = new THREE.LineSegments(edgesGeom, edgesMat);
                    childMesh.add(childEdges); // Add edges to the child mesh
                    if (!newObject.edges) newObject.edges = []; // Store edges if needed for group management
                    newObject.edges.push(childEdges);
                }
            });
        } else if (mesh.geometry) { // For single Meshes
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
    // animate(); // No need to call animate() here, main loop will render
}

function updateEdges(appObject) {
    if (!appObject || !appObject.mesh) return;

    // Function to remove old edges from a mesh
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
        appObject.edges = []; // Reset group's edge store
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
    // animate(); // No need to call animate() here, main loop will render
}


// --- Selection & Deselection ---
function selectObject(appObject) {
    if (appState.selectedObject === appObject) return;

    deselectObject();
    appState.selectedObject = appObject;
    transformControls.attach(appObject.mesh); // Attach to the main mesh/group
    transformControls.visible = true;
    transformControls.enabled = appState.transformMode === 'mouse';

    updateTransformFormInputs(appObject);
    updateMaterialInputsFromObject(appObject);
    showMessage(`${appObject.mesh.userData.type || 'Objek'} terpilih.`, 1500);
}

function deselectObject() {
    if (appState.selectedObject) {
        transformControls.detach();
        transformControls.visible = false;
        appState.selectedObject = null;
        clearTransformFormInputs();
    }
}

function removeObject(appObject) {
    if (!appObject) return;

    if (appState.selectedObject === appObject) { // Detach controls if selected object is being removed
        transformControls.detach();
    }

    scene.remove(appObject.mesh); // Remove the main mesh or group from scene

    // Dispose geometries and materials of the main mesh and its children (if group)
    function disposeHierarchy(object) {
        object.traverse((node) => {
            if (node.geometry) {
                node.geometry.dispose();
            }
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
        appState.selectedObject = null; // Clear selection
        clearTransformFormInputs();
    }
    showMessage(`${appObject.mesh.userData.type || 'Objek'} dihapus.`, 1500);
    // animate(); // No need to call animate() here, main loop will render
}

// --- UI Update Functions ---
function updateTransformFormInputs(appObject) {
    if (!appObject || !appObject.mesh) {
        clearTransformFormInputs();
        return;
    }
    const obj = appObject.mesh; // Transform the group or mesh directly
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
    // For groups (like Capsule), get material from the first child with a material
    if (appObject.mesh.type === 'Group') {
        const firstChildWithMaterial = appObject.mesh.children.find(child => child.material);
        if (firstChildWithMaterial) {
            materialToInspect = firstChildWithMaterial.material;
        }
    } else {
        materialToInspect = appObject.mesh.material;
    }


    if (materialToInspect) {
        selectors.inputs.fillColorCheck.checked = materialToInspect.visible;
        selectors.inputs.fillColor.value = "#" + materialToInspect.color.getHexString();
    }

    // Check edges status
    // For groups, edges might be an array or handled differently. For simplicity, check the first child's edges.
    let hasEdges = false;
    let edgeMaterialToInspect = null;

    if (appObject.mesh.type === 'Group' && appObject.edges && appObject.edges.length > 0) {
        // Assuming appObject.edges stores an array of LineSegments for group children
        // We'll check the first one for properties
        const firstChildEdge = appObject.mesh.children.find(c => c.children.some(gc => gc instanceof THREE.LineSegments));
        if (firstChildEdge) {
            edgeMaterialToInspect = firstChildEdge.children.find(gc => gc instanceof THREE.LineSegments).material;
            hasEdges = true;
        }

    } else if (appObject.edges && appObject.mesh.type !== 'Group') { // Single mesh with edges
        edgeMaterialToInspect = appObject.edges.material;
        hasEdges = true;
    }


    selectors.inputs.strokeColorCheck.checked = hasEdges && selectors.inputs.strokeColorCheck.checked; // Preserve user's check if edges exist
    if (edgeMaterialToInspect) {
        selectors.inputs.strokeColor.value = "#" + edgeMaterialToInspect.color.getHexString();
        selectors.inputs.strokeWidth.value = edgeMaterialToInspect.linewidth;
    } else if (!hasEdges) {
        // If no edges, perhaps reset stroke width or keep current UI value
        // selectors.inputs.strokeWidth.value = 2; // Default or last user set
    }
}


function applyMaterialChanges() {
    if (!appState.selectedObject) return;

    const appObj = appState.selectedObject;
    const fillColor = parseInt(selectors.inputs.fillColor.value.replace("#", "0x"), 16);
    const fillVisible = selectors.inputs.fillColorCheck.checked;

    function updateSingleMeshMaterial(mesh) {
        if (Array.isArray(mesh.material)) { // Should not happen with MeshStandardMaterial
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
            if (child.isMesh) updateSingleMeshMaterial(child); // Apply to mesh children of the group
        });
    } else { // Single Mesh
        updateSingleMeshMaterial(appObj.mesh);
    }

    updateEdges(appObj);
    // animate(); // No need to call animate() here, main loop will render
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
    // animate(); // No need to call animate() here, main loop will render
}

function updateActiveToolButton() {
    Object.values(selectors.shapeButtons).forEach(btn => btn.classList.remove('active'));
    // Special handling for create buttons vs select tool
    const createToolActive = ['createVase', 'createCapsule', 'createMosqueDome'].includes(appState.currentTool);
    if (appState.currentTool === 'select' && selectors.shapeButtons.select) {
        selectors.shapeButtons.select.classList.add('active');
    } else if (selectors.shapeButtons[appState.currentTool]) { // For create buttons
        selectors.shapeButtons[appState.currentTool].classList.add('active');
    }
}
function updateActiveTransformButton() {
    Object.values(selectors.transformButtons).forEach(btn => {
        if (btn.id.startsWith('apply')) return;
        btn.classList.remove('active');
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

// Apply transform from form
selectors.transformButtons.applyTranslate.addEventListener('click', () => {
    if (appState.selectedObject) {
        appState.selectedObject.mesh.position.set(
            parseFloat(selectors.inputs.translateX.value),
            parseFloat(selectors.inputs.translateY.value),
            parseFloat(selectors.inputs.translateZ.value)
        );
        if (appState.selectedObject.edges) updateEdges(appState.selectedObject);
        // animate(); // No need to call animate() here
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
        // animate(); // No need to call animate() here
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
        // animate(); // No need to call animate() here
    } else showMessage("Pilih objek terlebih dahulu.", 2000);
});

// Misc buttons
selectors.misc.clearCanvas.addEventListener('click', () => {
    while (appState.objects.length > 0) {
        removeObject(appState.objects[0]); // removeObject will handle deselection if needed
    }
    if (transformControls.object) { // Ensure controls are detached if anything was attached
        transformControls.detach();
    }
    appState.selectedObject = null;
    clearTransformFormInputs();
    showMessage("Kanvas dibersihkan.", 1500);
    // animate(); // No need to call animate() here
});

selectors.misc.saveAsImage.addEventListener('click', () => {
    try {
        const imageName = prompt("Masukkan nama file gambar:", "gambar-3d.png");
        if (imageName) {
            const tcVisible = transformControls.visible;
            transformControls.visible = false;
            renderer.render(scene, camera); // Render one frame without controls

            setTimeout(() => {
                const dataURL = renderer.domElement.toDataURL('image/png');
                const link = document.createElement('a');
                link.download = imageName;
                link.href = dataURL;
                link.click();
                transformControls.visible = tcVisible;
                // animate(); // No need to call animate() here if main loop is running
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
animate(); // Start the main animation loop ONCE.
showMessage("Selamat datang di Aplikasi Menggambar 3D! Pilih bentuk atau alat.", 3500);
onWindowResize(); // Call once to set initial size after everything is ready.

document.getElementById('showHelp').addEventListener('click', () => {
    document.getElementById('helpOverlay').style.display = 'block';
});
