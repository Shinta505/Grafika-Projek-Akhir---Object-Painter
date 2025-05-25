const canvas2D = document.getElementById('canvas2D');
const ctx = canvas2D.getContext('2d');

const slideLeft = document.getElementById('slideLeft');
const slideRight = document.getElementById('slideRight');
const canvas2DView = document.getElementById('canvas2D-view');
const canvas3DView = document.getElementById('canvas3D-view');

const drawYinYangBtn = document.getElementById('drawYinYang');
const drawMoonStarBtn = document.getElementById('drawMoonStar');
const drawCrossBtn = document.getElementById('drawCross');

const canvas3D = document.getElementById('canvas3D');

const drawPearBtn = document.getElementById('drawPear');
const drawMosqueDomeBtn = document.getElementById('drawMosqueDome');
const drawCapsuleBtn = document.getElementById('drawCapsule');

const resetBtn = document.getElementById('resetBtn');
const colorPicker = document.getElementById('colorPicker');

const scaleBtn = document.getElementById('scaleBtn');
const scaleForm = document.getElementById('scaleForm');
const scaleWidthInput = document.getElementById('scaleWidth');
const scaleHeightInput = document.getElementById('scaleHeight');
const applyScaleBtn = document.getElementById('applyScaleBtn');
const rotateIcon = document.getElementById('rotateIcon');
const rotate3DIcon = document.getElementById('rotate3DIcon');


let isRotating3D = false;

let isRotating = false;

let rotatingFromIcon = false;

let isScaling = false;

let currentShape = null;
let fillColor = colorPicker.value;

let scene, camera, renderer;
let pearMesh = null;
let domeMesh = null;
let capsuleMesh = null;

let currentRotation = 0;
let currentScaleX = 1;
let currentScaleY = 1;

let isTranslating = false;
let dragStart = null;

let lastScaleKey = null;

let resizingHandle = null;
let isResizing = false;

slideLeft.addEventListener('click', () => {
    canvas2DView.classList.add('active');
    canvas3DView.classList.remove('active');
});

slideRight.addEventListener('click', () => {
    canvas3DView.classList.add('active');
    canvas2DView.classList.remove('active');
});

function clearCanvas3D() {
    if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
    }
    scene = null;
    camera = null;
    renderer = null;
    pearMesh = null;
    domeMesh = null;
    capsuleMesh = null;
}

function resetCanvas() {
    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
    currentShape = null;
}

function drawWithTransform(drawFunc, x, y, options = {}) {
    const { scaleX = 1, scaleY = 1, rotation = 0 } = options;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-x, -y);
    drawFunc(x, y);
    ctx.restore();
}

// Fungsi gambar Yin Yang
function drawYinYang(x = 400, y = 250) {
    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
    currentShape = {
        type: 'yinYang',
        x, y,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        width: 200, // atau radius*2
        height: 200,
        selected: false
    };


    const radius = 100;
    const smallRadius = radius / 2;
    const dotRadius = radius / 10;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.arc(x, y, radius, 0.5 * Math.PI, 1.5 * Math.PI);
    ctx.arc(x, y - smallRadius, smallRadius, 1.5 * Math.PI, 0.5 * Math.PI, true);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(x, y - smallRadius, smallRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.arc(x, y + smallRadius, smallRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(x, y + smallRadius, dotRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.arc(x, y - smallRadius, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawMoonStar(x = 400, y = 250) {
    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
    currentShape = {
        type: 'moonStar',
        x, y,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        width: 200, // atau radius*2
        height: 200,
        selected: false
    };


    const moonOuterRadius = 100;
    const moonInnerRadius = 75;
    const moonOffset = 30;

    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.arc(x, y, moonOuterRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x + moonOffset, y, moonInnerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    const starRadiusOuter = 30;
    const starRadiusInner = starRadiusOuter / 2.5;
    const starX = x + 35;
    const starY = y - 10;

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        let angleOuter = (Math.PI / 2) + (i * 2 * Math.PI / 5);
        let angleInner = angleOuter + Math.PI / 5;
        let xOuter = starX + starRadiusOuter * Math.cos(angleOuter);
        let yOuter = starY - starRadiusOuter * Math.sin(angleOuter);
        let xInner = starX + starRadiusInner * Math.cos(angleInner);
        let yInner = starY - starRadiusInner * Math.sin(angleInner);
        if (i === 0) ctx.moveTo(xOuter, yOuter);
        else ctx.lineTo(xOuter, yOuter);
        ctx.lineTo(xInner, yInner);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

function drawCross(x = 400, y = 250) {
    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
    currentShape = {
        type: 'cross',
        x, y,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        width: 200, // atau radius*2
        height: 200,
        selected: false
    };


    ctx.save();
    ctx.fillStyle = fillColor;

    const verticalWidth = 30;
    const verticalHeight = 150;
    const horizontalWidth = 100;
    const horizontalHeight = 30;

    const verticalX = x - verticalWidth / 2;
    const verticalY = y - verticalHeight / 2;
    const horizontalX = x - horizontalWidth / 2;
    const horizontalY = y - verticalHeight / 2 + 40;

    ctx.fillRect(verticalX, verticalY, verticalWidth, verticalHeight);
    ctx.fillRect(horizontalX, horizontalY, horizontalWidth, horizontalHeight);

    ctx.restore();
}


function drawBoundingBox(shape) {
    const { x, y, width, height, scaleX = 1, scaleY = 1 } = shape;
    const boxWidth = width * scaleX;
    const boxHeight = height * scaleY;

    const topLeftX = x - boxWidth / 2;
    const topLeftY = y - boxHeight / 2;

    ctx.save();
    ctx.strokeStyle = 'black';
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(topLeftX, topLeftY, boxWidth, boxHeight);

    const handleSize = 8;
    const positions = [
        [topLeftX, topLeftY],
        [topLeftX + boxWidth / 2, topLeftY],
        [topLeftX + boxWidth, topLeftY],
        [topLeftX, topLeftY + boxHeight / 2],
        [topLeftX + boxWidth, topLeftY + boxHeight / 2],
        [topLeftX, topLeftY + boxHeight],
        [topLeftX + boxWidth / 2, topLeftY + boxHeight],
        [topLeftX + boxWidth, topLeftY + boxHeight]
    ];
    ctx.fillStyle = 'white';
    ctx.strokeStyle = 'black';
    positions.forEach(([px, py]) => {
        ctx.fillRect(px - handleSize / 2, py - handleSize / 2, handleSize, handleSize);
        ctx.strokeRect(px - handleSize / 2, py - handleSize / 2, handleSize, handleSize);
    });

    ctx.restore();
}


function redrawWithSelection() {
    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
    if (!currentShape) return;

    const { x, y, scaleX = 1, scaleY = 1, rotation = currentRotation } = currentShape;

    let drawFunc;
    if (currentShape.type === 'yinYang') drawFunc = drawYinYangShape;
    else if (currentShape.type === 'moonStar') drawFunc = drawMoonStarShape;
    else if (currentShape.type === 'cross') drawFunc = drawCrossShape;

    if (drawFunc) {
        drawWithTransform(drawFunc, x, y, { scaleX, scaleY, rotation });
    }

    if (currentShape.selected) {
        drawBoundingBox(currentShape);
    }
}




function drawScaledYinYang(x, y, scaleX, scaleY) {
    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
    currentShape = { type: 'yinYang', x, y, scaleX, scaleY };

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-x, -y);

    drawYinYang(x, y);

    ctx.restore();
}

function drawScaledMoonStar(x, y, scaleX, scaleY) {
    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
    currentShape = { type: 'moonStar', x, y, scaleX, scaleY };

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-x, -y);

    drawMoonStar(x, y);

    ctx.restore();
}

function drawScaledCross(x, y, scaleX, scaleY) {
    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
    currentShape = { type: 'cross', x, y, scaleX, scaleY };

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scaleX, scaleY);
    ctx.translate(-x, -y);

    drawCross(x, y);

    ctx.restore();
}


function drawYinYangShape(x, y) {
    const radius = 100;
    const smallRadius = radius / 2;
    const dotRadius = radius / 10;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.closePath();

    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.arc(x, y, radius, 0.5 * Math.PI, 1.5 * Math.PI);
    ctx.arc(x, y - smallRadius, smallRadius, 1.5 * Math.PI, 0.5 * Math.PI, true);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(x, y - smallRadius, smallRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.arc(x, y + smallRadius, smallRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = '#fff';
    ctx.arc(x, y + smallRadius, dotRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.arc(x, y - smallRadius, dotRadius, 0, 2 * Math.PI);
    ctx.fill();
}

function drawMoonStarShape(x, y) {
    const moonOuterRadius = 100;
    const moonInnerRadius = 75;
    const moonOffset = 30;

    ctx.beginPath();
    ctx.fillStyle = fillColor;
    ctx.arc(x, y, moonOuterRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x + moonOffset, y, moonInnerRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    const starRadiusOuter = 30;
    const starRadiusInner = starRadiusOuter / 2.5;
    const starX = x + 35;
    const starY = y - 10;

    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        let angleOuter = (Math.PI / 2) + (i * 2 * Math.PI / 5);
        let angleInner = angleOuter + Math.PI / 5;
        let xOuter = starX + starRadiusOuter * Math.cos(angleOuter);
        let yOuter = starY - starRadiusOuter * Math.sin(angleOuter);
        let xInner = starX + starRadiusInner * Math.cos(angleInner);
        let yInner = starY - starRadiusInner * Math.sin(angleInner);
        if (i === 0) ctx.moveTo(xOuter, yOuter);
        else ctx.lineTo(xOuter, yOuter);
        ctx.lineTo(xInner, yInner);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
}

function drawCrossShape(x, y) {
    ctx.save();
    ctx.fillStyle = fillColor;
    const verticalWidth = 30;
    const verticalHeight = 150;
    const horizontalWidth = 100;
    const horizontalHeight = 30;
    const verticalX = x - verticalWidth / 2;
    const verticalY = y - verticalHeight / 2;
    const horizontalX = x - horizontalWidth / 2;
    const horizontalY = y - verticalHeight / 2 + 40;
    ctx.fillRect(verticalX, verticalY, verticalWidth, verticalHeight);
    ctx.fillRect(horizontalX, horizontalY, horizontalWidth, horizontalHeight);
    ctx.restore();
}

function rotateObject(action) {
    if (!currentShape || ['pear', 'mosqueDome', 'capsule'].includes(currentShape.type)) return;

    const { x, y, type } = currentShape;

    switch (action) {
        case 'right': currentRotation += Math.PI / 2; break;
        case 'left': currentRotation -= Math.PI / 2; break;
        case '180': currentRotation += Math.PI; break;
        case 'flipV': currentScaleY *= -1; break;
        case 'flipH': currentScaleX *= -1; break;
    }

    ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);

    let drawFunc = null;
    if (type === 'yinYang') drawFunc = drawYinYangShape;
    else if (type === 'moonStar') drawFunc = drawMoonStarShape;
    else if (type === 'cross') drawFunc = drawCrossShape;

    if (drawFunc) {
        drawWithTransform(drawFunc, x, y, {
            rotation: currentRotation,
            scaleX: currentScaleX,
            scaleY: currentScaleY
        });
    }
}

function drawPear3D() {
    clearCanvas3D();

    currentShape = { type: 'pear' };

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, canvas2D.width / canvas2D.height, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvas2D.width, canvas2D.height);
    renderer.setClearColor(0xffffff, 1);
    canvas3D.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(3, 3, 3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    const pearGroup = new THREE.Group();
    const points = [];
    for (let i = 0; i <= 25; i++) {
        const t = i / 25; // Skala dengan benar
        const y = -1 + 2 * t;
        const x = 0.2 + 0.8 * Math.pow(Math.max(0, 1 - t), 1.5) * Math.sin(Math.PI * t);
        if (!isNaN(x) && !isNaN(y)) {
            points.push(new THREE.Vector2(x, y));
        }
    }


    const geometry = new THREE.LatheGeometry(points, 64);
    const material = new THREE.MeshPhongMaterial({ color: fillColor });
    pearMesh = new THREE.Mesh(geometry, material);
    pearGroup.add(pearMesh);

    scene.add(pearGroup);

    function animate() {
        requestAnimationFrame(animate);
        if (!renderer || !scene || !camera) return;
        pearGroup.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}

function drawMosqueDome3D() {
    clearCanvas3D();

    currentShape = { type: 'mosqueDome' };

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, canvas2D.width / canvas2D.height, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvas2D.width, canvas2D.height);
    renderer.setClearColor(0xffffff, 1);
    canvas3D.appendChild(renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(3, 3, 3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    const domeGroup = new THREE.Group();
    const points = [];
    for (let i = 0.18; i <= 1; i += 0.05) {
        const x = Math.sin(Math.PI * i) * (1 - i * 0.7);
        const y = i * 1.5;
        points.push(new THREE.Vector2(x, y));
    }

    const domeGeometry = new THREE.LatheGeometry(points, 64);
    const domeMaterial = new THREE.MeshPhongMaterial({ color: fillColor });
    domeMesh = new THREE.Mesh(domeGeometry, domeMaterial);
    domeGroup.add(domeMesh);

    scene.add(domeGroup);

    function animate() {
        requestAnimationFrame(animate);
        if (!renderer || !scene || !camera) return;
        domeGroup.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}


function drawCapsule3D() {
    clearCanvas3D();

    currentShape = { type: 'capsule' };

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, canvas2D.width / canvas2D.height, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvas2D.width, canvas2D.height);
    renderer.setClearColor(0xffffff, 1); // Tambahkan baris ini
    canvas3D.appendChild(renderer.domElement);


    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(3, 3, 3);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    const capsuleGroup = new THREE.Group();

    const geometry = new THREE.CapsuleGeometry(0.5, 1.5, 10, 32);
    const material = new THREE.MeshPhongMaterial({ color: fillColor });
    capsuleMesh = new THREE.Mesh(geometry, material);
    capsuleGroup.add(capsuleMesh);

    scene.add(capsuleGroup);

    function animate() {
        requestAnimationFrame(animate);
        if (!renderer || !scene || !camera) return;
        capsuleGroup.rotation.y += 0.01;
        renderer.render(scene, camera);
    }
    animate();
}


function update3DOverlay(mesh) {
    const overlay = document.getElementById("resizeOverlay3D");
    const canvasRect = canvas3D.getBoundingClientRect();

    const bbox = new THREE.Box3().setFromObject(mesh);
    const corners = [
        new THREE.Vector3(bbox.min.x, bbox.min.y, bbox.min.z),
        new THREE.Vector3(bbox.max.x, bbox.max.y, bbox.max.z),
    ];

    const projector = new THREE.Vector3();
    const toScreen = (vec) => {
        projector.copy(vec);
        projector.project(camera);
        return {
            x: ((projector.x + 1) / 2) * canvasRect.width + canvasRect.left,
            y: ((-projector.y + 1) / 2) * canvasRect.height + canvasRect.top,
        };
    };

    const minScreen = toScreen(corners[0]);
    const maxScreen = toScreen(corners[1]);

    overlay.style.display = 'block';
    overlay.style.left = `${minScreen.x}px`;
    overlay.style.top = `${minScreen.y}px`;
    overlay.style.width = `${maxScreen.x - minScreen.x}px`;
    overlay.style.height = `${maxScreen.y - minScreen.y}px`;

    const handlePos = [
        ['nw', 0, 0],
        ['n', 50, 0],
        ['ne', 100, 0],
        ['e', 100, 50],
        ['se', 100, 100],
        ['s', 50, 100],
        ['sw', 0, 100],
        ['w', 0, 50],
    ];

    const handles = overlay.querySelectorAll('.resize-handle');
    handles.forEach((handle, i) => {
        const [_, xPct, yPct] = [handlePos[i][0], handlePos[i][1], handlePos[i][2]];
        handle.style.left = `calc(${xPct}% - 5px)`;
        handle.style.top = `calc(${yPct}% - 5px)`;
    });
}


function rotate3D(axis) {
    if (!currentShape) return;

    let mesh = null;
    if (currentShape.type === 'pear') mesh = pearMesh;
    else if (currentShape.type === 'mosqueDome') mesh = domeMesh;
    else if (currentShape.type === 'capsule') mesh = capsuleMesh;

    if (!mesh) return;

    const angle = Math.PI / 12; // 15 derajat

    switch (axis) {
        case 'x':
            mesh.rotation.x += angle;
            break;
        case 'y':
            mesh.rotation.y += angle;
            break;
        case 'z':
            mesh.rotation.z += angle;
            break;
    }

    renderer.render(scene, camera);
}

// Event tombol
drawYinYangBtn.addEventListener('click', () => {
    resetCanvas();      // Clear canvas 2D
    drawYinYang(canvas2D.width / 2, canvas2D.height / 2);
    redrawWithSelection();
});

drawMoonStarBtn.addEventListener('click', () => {
    resetCanvas();
    drawMoonStar(canvas2D.width / 2, canvas2D.height / 2);
    redrawWithSelection();
});

drawCrossBtn.addEventListener('click', () => {
    resetCanvas();
    drawCross(canvas2D.width / 2, canvas2D.height / 2);
    redrawWithSelection();
});

// Event tombol 3D
drawPearBtn.addEventListener('click', () => {
    drawPear3D();
});
drawMosqueDomeBtn.addEventListener('click', () => {
    drawMosqueDome3D();
});
drawCapsuleBtn.addEventListener('click', () => {
    drawCapsule3D();
});
resetBtn.addEventListener('click', () => {
    resetCanvas();
    clearCanvas3D();
});

// Fungsi untuk menggambar ulang objek 2D dengan posisi baru
function redrawCurrentShape(x, y) {
    if (!currentShape) return;

    currentShape.x = x;
    currentShape.y = y;

    let drawFunc = null;
    if (currentShape.type === 'yinYang') drawFunc = drawYinYangShape;
    else if (currentShape.type === 'moonStar') drawFunc = drawMoonStarShape;
    else if (currentShape.type === 'cross') drawFunc = drawCrossShape;

    if (drawFunc) {
        ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
        drawWithTransform(drawFunc, x, y, {
            rotation: currentRotation,
            scaleX: currentShape.scaleX ?? 1,
            scaleY: currentShape.scaleY ?? 1
        });
        if (currentShape.selected) drawBoundingBox(currentShape);
    }
}


canvas2D.addEventListener('click', (e) => {
    if (!currentShape || ['pear', 'mosqueDome', 'capsule'].includes(currentShape.type)) return;

    // Toggle visibility
    if (rotateIcon.style.display === 'none') {
        const iconSize = 24;
        rotateIcon.style.left = `${canvas2D.offsetLeft + currentShape.x - iconSize / 2}px`;
        rotateIcon.style.top = `${canvas2D.offsetTop + currentShape.y - 120}px`; // posisi di atas objek
        rotateIcon.style.display = 'block';
    } else {
        rotateIcon.style.display = 'none';
    }

    const rect = canvas2D.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const { x, y, width = 200, height = 200, scaleX = 1, scaleY = 1 } = currentShape;
    const halfW = (width * scaleX) / 2;
    const halfH = (height * scaleY) / 2;

    if (
        clickX >= x - halfW && clickX <= x + halfW &&
        clickY >= y - halfH && clickY <= y + halfH
    ) {
        currentShape.selected = !currentShape.selected;
        redrawWithSelection();
    } else {
        currentShape.selected = false;
        redrawWithSelection();
    }

    // Tambahan: klik di mana pun, resize dimatikan
    isResizing = false;
    resizingHandle = null;
});

canvas3D.addEventListener('click', (e) => {
    if (!currentShape || !['pear', 'mosqueDome', 'capsule'].includes(currentShape.type)) return;

    if (rotate3DIcon.style.display === 'none') {
        const rect = canvas3D.getBoundingClientRect();
        rotate3DIcon.style.left = `${rect.left + rect.width / 2 - 25}px`;
        rotate3DIcon.style.top = `${rect.top + rect.height / 2 - 25}px`;
        rotate3DIcon.style.display = 'block';

        if (currentShape.type === 'pear' && pearMesh) {
            update3DOverlay(pearMesh);
        }
        if (currentShape.type === 'capsule' && capsuleMesh) {
            update3DOverlay(capsuleMesh);
        }
        if (currentShape.type === 'mosqueDome' && domeMesh) {
            update3DOverlay(domeMesh);
        }
    } else {
        rotate3DIcon.style.display = 'none';
        document.getElementById("resizeOverlay3D").style.display = "none";
    }
});


// Event handler drag untuk canvas 2D saat mode translate aktif
canvas2D.addEventListener('mousedown', (e) => {
    const rect = canvas2D.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    if (!currentShape || !currentShape.selected) return;

    const { x, y, width, height, scaleX = 1, scaleY = 1 } = currentShape;
    const boxWidth = width * scaleX;
    const boxHeight = height * scaleY;
    const topLeftX = x - boxWidth / 2;
    const topLeftY = y - boxHeight / 2;

    const handleSize = 10;
    const handles = [
        ['nw', topLeftX, topLeftY],
        ['n', topLeftX + boxWidth / 2, topLeftY],
        ['ne', topLeftX + boxWidth, topLeftY],
        ['w', topLeftX, topLeftY + boxHeight / 2],
        ['e', topLeftX + boxWidth, topLeftY + boxHeight / 2],
        ['sw', topLeftX, topLeftY + boxHeight],
        ['s', topLeftX + boxWidth / 2, topLeftY + boxHeight],
        ['se', topLeftX + boxWidth, topLeftY + boxHeight]
    ];

    for (let [name, hx, hy] of handles) {
        if (
            mouseX >= hx - handleSize &&
            mouseX <= hx + handleSize &&
            mouseY >= hy - handleSize &&
            mouseY <= hy + handleSize
        ) {
            resizingHandle = name;
            isResizing = true;
            e.preventDefault();
            return;
        }
    }

    // fallback: translasi jika tidak kena handle
    if (isTranslating) {
        dragStart = { x: e.offsetX, y: e.offsetY };
    }
});

rotateIcon.addEventListener('mousedown', (e) => {
    if (!currentShape) return;
    isRotating = true;
    rotatingFromIcon = true;
    rotateIcon.style.cursor = 'grabbing';

    e.stopPropagation(); // hindari triggering mousedown canvas
});

canvas2D.addEventListener('mousemove', (e) => {
    if (!currentShape) return;

    // Handle translasi
    if (isTranslating && dragStart) {
        const moveDX = e.offsetX - dragStart.x;
        const moveDY = e.offsetY - dragStart.y;

        let newX = currentShape.x + moveDX;
        let newY = currentShape.y + moveDY;

        newX = Math.min(Math.max(newX, 0), canvas2D.width);
        newY = Math.min(Math.max(newY, 0), canvas2D.height);

        redrawCurrentShape(newX, newY);

        dragStart = { x: e.offsetX, y: e.offsetY };
    }

    // Handle rotasi
    if (isRotating && currentShape) {
        const centerX = canvas2D.offsetLeft + currentShape.x;
        const centerY = canvas2D.offsetTop + currentShape.y;
        const rotateDX = e.clientX - centerX;
        const rotateDY = e.clientY - centerY;
        const angle = Math.atan2(rotateDY, rotateDX);

        currentRotation = angle;

        let drawFunc = null;
        if (currentShape.type === 'yinYang') drawFunc = drawYinYangShape;
        else if (currentShape.type === 'moonStar') drawFunc = drawMoonStarShape;
        else if (currentShape.type === 'cross') drawFunc = drawCrossShape;

        if (drawFunc) {
            ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
            drawWithTransform(drawFunc, currentShape.x, currentShape.y, {
                rotation: currentRotation,
                scaleX: currentScaleX,
                scaleY: currentScaleY
            });
        }

        // Pindahkan posisi ikon sesuai objek (agar mengikuti rotasi)
        const iconSize = 24;
        rotateIcon.style.left = `${canvas2D.offsetLeft + currentShape.x - iconSize / 2}px`;
        rotateIcon.style.top = `${canvas2D.offsetTop + currentShape.y - 120}px`;
    }

    if (!isResizing || !currentShape) return;

    const rect = canvas2D.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const dx = mouseX - currentShape.x;
    const dy = mouseY - currentShape.y;

    let newScaleX = currentShape.scaleX;
    let newScaleY = currentShape.scaleY;

    switch (resizingHandle) {
        case 'e':
        case 'ne':
        case 'se':
            newScaleX = Math.max(0.1, (dx + currentShape.width / 2) / currentShape.width);
            break;
        case 'w':
        case 'nw':
        case 'sw':
            newScaleX = Math.max(0.1, (-dx + currentShape.width / 2) / currentShape.width);
            break;
    }

    switch (resizingHandle) {
        case 's':
        case 'se':
        case 'sw':
            newScaleY = Math.max(0.1, (dy + currentShape.height / 2) / currentShape.height);
            break;
        case 'n':
        case 'ne':
        case 'nw':
            newScaleY = Math.max(0.1, (-dy + currentShape.height / 2) / currentShape.height);
            break;
    }

    currentShape.scaleX = newScaleX;
    currentShape.scaleY = newScaleY;

    redrawWithSelection();
});


canvas2D.addEventListener('mouseup', (e) => {
    if (!isTranslating) return;
    dragStart = null;

    isResizing = false;
    resizingHandle = null;
});

document.addEventListener('mouseup', () => {
    if (rotatingFromIcon) {
        isRotating = false;
        rotatingFromIcon = false;
        rotateIcon.style.cursor = 'grab';
    }
});

canvas2D.addEventListener('mouseleave', (e) => {
    if (!isTranslating) return;
    dragStart = null;
});

const translateArrowButtons = document.getElementById('translateArrowButtons');

// grid positions: 1-9 (like numpad)
// 1 2 3
// 4 5 6
// 7 8 9

const directions = [
    { label: '↖', dx: -5, dy: -5, gridPos: 1 },
    { label: '↑', dx: 0, dy: -5, gridPos: 2 },
    { label: '↗', dx: 5, dy: -5, gridPos: 3 },
    { label: '←', dx: -5, dy: 0, gridPos: 4 },
    // posisi 5 dikosongkan (tengah)
    { label: '→', dx: 5, dy: 0, gridPos: 6 },
    { label: '↙', dx: -5, dy: 5, gridPos: 7 },
    { label: '↓', dx: 0, dy: 5, gridPos: 8 },
    { label: '↘', dx: 5, dy: 5, gridPos: 9 },
];

function createTranslateButtons() {
    translateArrowButtons.innerHTML = ''; // kosongkan dulu

    // buat array 9 element, isi null
    const gridButtons = Array(9).fill(null);

    directions.forEach(dir => {
        const btn = document.createElement('button');
        btn.textContent = dir.label;
        btn.addEventListener('click', () => {
            moveCurrentShape(dir.dx, dir.dy);
        });
        gridButtons[dir.gridPos - 1] = btn;
    });

    // append sesuai urutan grid 1-9, kosongkan posisi 5 (index 4)
    gridButtons.forEach((btn, i) => {
        if (btn) {
            translateArrowButtons.appendChild(btn);
        } else {
            // buat elemen kosong agar grid tetap rapi
            const emptyDiv = document.createElement('div');
            translateArrowButtons.appendChild(emptyDiv);
        }
    });
}

createTranslateButtons();


// Fungsi untuk menggerakkan objek yang sedang dipilih
function moveCurrentShape(dx, dy) {
    if (!currentShape) return;

    // Untuk objek 2D
    if (['yinYang', 'moonStar', 'cross'].includes(currentShape.type)) {
        let newX = currentShape.x + dx;
        let newY = currentShape.y + dy;

        newX = Math.min(Math.max(newX, 0), canvas2D.width);
        newY = Math.min(Math.max(newY, 0), canvas2D.height);

        redrawCurrentShape(newX, newY);
        currentShape.x = newX;
        currentShape.y = newY;
    }
    // Untuk objek 3D
    else if (['pear', 'mosqueDome', 'capsule'].includes(currentShape.type)) {
        let mesh = null;
        if (currentShape.type === 'pear') mesh = pearMesh;
        else if (currentShape.type === 'mosqueDome') mesh = domeMesh;
        else if (currentShape.type === 'capsule') mesh = capsuleMesh;

        if (!mesh) return;

        const step3D = 0.1;

        mesh.position.x += (dx / 5) * step3D; // karena dx, dy 5 pixel, disesuaikan
        mesh.position.y -= (dy / 5) * step3D; // y dibalik (canvas ke 3D)

        renderer.render(scene, camera);
    }
}


// Fungsi translate untuk objek 3D dengan drag pada canvas3D
let isDragging3D = false;
let previousMousePosition = { x: 0, y: 0 };

let prevMousePos3D = null;

canvas3D.addEventListener('mousedown', (e) => {
    if (!isTranslating) return;
    isDragging3D = true;
    previousMousePosition = { x: e.clientX, y: e.clientY };
});
rotate3DIcon.addEventListener('mousedown', (e) => {
    if (!currentShape) return;
    isRotating3D = true;
    prevMousePos3D = { x: e.clientX, y: e.clientY };
    rotate3DIcon.style.cursor = 'grabbing';
    e.stopPropagation();
});

canvas3D.addEventListener('mousemove', (e) => {
    if (!isTranslating || !isDragging3D) return;

    const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
    };

    previousMousePosition = { x: e.clientX, y: e.clientY };

    const moveFactor = 0.01; // Sensitivitas geser

    // Geser objek 3D sesuai delta drag pada sumbu X dan Y
    if (currentShape) {
        if (currentShape.type === 'pear' && pearMesh) {
            pearMesh.position.x += deltaMove.x * moveFactor;
            pearMesh.position.y -= deltaMove.y * moveFactor;
        } else if (currentShape.type === 'mosqueDome' && domeMesh) {
            domeMesh.position.x += deltaMove.x * moveFactor;
            domeMesh.position.y -= deltaMove.y * moveFactor;
        } else if (currentShape.type === 'capsule' && capsuleMesh) {
            capsuleMesh.position.x += deltaMove.x * moveFactor;
            capsuleMesh.position.y -= deltaMove.y * moveFactor;
        }
        renderer.render(scene, camera);
    }
});
document.addEventListener('mousemove', (e) => {
    if (!isRotating3D || !currentShape || !prevMousePos3D) return;

    const deltaX = e.clientX - prevMousePos3D.x;
    const deltaY = e.clientY - prevMousePos3D.y;
    prevMousePos3D = { x: e.clientX, y: e.clientY };

    let mesh = null;
    if (currentShape.type === 'pear') mesh = pearMesh;
    else if (currentShape.type === 'mosqueDome') mesh = domeMesh;
    else if (currentShape.type === 'capsule') mesh = capsuleMesh;

    if (!mesh) return;

    const rotateSpeed = 0.01;
    mesh.rotation.y += deltaX * rotateSpeed;
    mesh.rotation.x += deltaY * rotateSpeed;

    renderer.render(scene, camera);
});

canvas3D.addEventListener('mouseup', (e) => {
    if (!isTranslating) return;
    isDragging3D = false;
});
document.addEventListener('mouseup', () => {
    if (isRotating3D) {
        isRotating3D = false;
        prevMousePos3D = null;
        rotate3DIcon.style.cursor = 'grab';
    }
});

let active3DHandle = null;
let startMouseX = 0;

document.querySelectorAll('.resize-handle').forEach(handle => {
  handle.addEventListener('mousedown', (e) => {
    e.preventDefault();
    active3DHandle = handle.dataset.dir;
    startMouseX = e.clientX;
  });
});

document.addEventListener('mousemove', (e) => {
  if (!active3DHandle || !currentShape) return;

  const dx = e.clientX - startMouseX;
  startMouseX = e.clientX;

  let mesh = null;
  if (currentShape.type === 'pear') mesh = pearMesh;
  else if (currentShape.type === 'capsule') mesh = capsuleMesh;
  else if (currentShape.type === 'mosqueDome') mesh = domeMesh;

  if (!mesh) return;

  const scaleChange = dx * 0.01;

  if (active3DHandle === 'e' || active3DHandle === 'w') {
    mesh.scale.x = Math.max(0.1, mesh.scale.x + scaleChange);
  } else if (active3DHandle === 'n' || active3DHandle === 's') {
    mesh.scale.y = Math.max(0.1, mesh.scale.y + scaleChange);
  } else {
    // handle sudut — scale uniform
    const uniform = Math.max(0.1, mesh.scale.x + scaleChange);
    mesh.scale.set(uniform, uniform, uniform);
  }

  update3DOverlay(mesh);
  renderer.render(scene, camera);
});

document.addEventListener('mouseup', () => {
  active3DHandle = null;
});


canvas3D.addEventListener('mouseleave', (e) => {
    if (!isTranslating) return;
    isDragging3D = false;
});


window.addEventListener('keydown', (e) => {
    if (!currentShape) return;

    const step2D = 5;
    const step3D = 0.1;

    // =======================
    // SCALING untuk Objek 2D
    // =======================
    if (['yinYang', 'moonStar', 'cross'].includes(currentShape.type)) {
        if (e.key.toLowerCase() === 'x') {
            lastScaleKey = 'x';
        } else if (e.key.toLowerCase() === 'y') {
            lastScaleKey = 'y';
        } else if (e.shiftKey && lastScaleKey) {
            if (lastScaleKey === 'x') {
                if (e.key === 'ArrowRight') currentScaleX += 0.1;
                else if (e.key === 'ArrowLeft') currentScaleX = Math.max(0.1, currentScaleX - 0.1);
            } else if (lastScaleKey === 'y') {
                if (e.key === 'ArrowUp') currentScaleY += 0.1;
                else if (e.key === 'ArrowDown') currentScaleY = Math.max(0.1, currentScaleY - 0.1);
            }

            const { x, y, type } = currentShape;
            let drawFunc = null;
            if (type === 'yinYang') drawFunc = drawYinYangShape;
            else if (type === 'moonStar') drawFunc = drawMoonStarShape;
            else if (type === 'cross') drawFunc = drawCrossShape;

            if (drawFunc) {
                ctx.clearRect(0, 0, canvas2D.width, canvas2D.height);
                drawWithTransform(drawFunc, x, y, {
                    rotation: currentRotation,
                    scaleX: currentScaleX,
                    scaleY: currentScaleY
                });
            }

            return; // Jangan teruskan ke blok translasi
        }
    }

    // =======================
    // SCALING untuk objek 3D
    // =======================
    if (['pear', 'mosqueDome', 'capsule'].includes(currentShape.type)) {
        if (e.key.toLowerCase() === 'x' || e.key.toLowerCase() === 'y' || e.key.toLowerCase() === 'z') {
            lastScaleKey = e.key.toLowerCase();
        } else if (e.shiftKey && lastScaleKey) {
            let mesh = null;
            if (currentShape.type === 'pear') mesh = pearMesh;
            else if (currentShape.type === 'mosqueDome') mesh = domeMesh;
            else if (currentShape.type === 'capsule') mesh = capsuleMesh;

            if (!mesh) return;

            let scale = mesh.scale.clone();
            const delta = 0.1;

            if (lastScaleKey === 'x') {
                if (e.key === 'ArrowRight') scale.x += delta;
                else if (e.key === 'ArrowLeft') scale.x = Math.max(0.1, scale.x - delta);
            } else if (lastScaleKey === 'y') {
                if (e.key === 'ArrowUp') scale.y += delta;
                else if (e.key === 'ArrowDown') scale.y = Math.max(0.1, scale.y - delta);
            } else if (lastScaleKey === 'z') {
                if (e.key === 'ArrowRight') scale.z += delta;
                else if (e.key === 'ArrowLeft') scale.z = Math.max(0.1, scale.z - delta);
            }

            mesh.scale.set(scale.x, scale.y, scale.z);
            renderer.render(scene, camera);
            return;
        }
    }


    // =======================
    // ROTASI & FLIP (2D)
    // =======================
    if (['yinYang', 'moonStar', 'cross'].includes(currentShape.type)) {
        switch (e.key.toLowerCase()) {
            case 'r':
                rotateObject('right');
                return;
            case 'l':
                rotateObject('left');
                return;
            case 'v':
                rotateObject('flipV');
                return;
            case 'h':
                rotateObject('flipH');
                return;
        }
    }

    // =======================
    // ROTASI untuk objek 3D
    // =======================
    if (['pear', 'mosqueDome', 'capsule'].includes(currentShape.type)) {
        if (e.key.toLowerCase() === 'x' || e.key.toLowerCase() === 'y' || e.key.toLowerCase() === 'z') {
            lastRotateKey = e.key.toLowerCase();
        } else if (e.ctrlKey && lastRotateKey) {
            let mesh = null;
            if (currentShape.type === 'pear') mesh = pearMesh;
            else if (currentShape.type === 'mosqueDome') mesh = domeMesh;
            else if (currentShape.type === 'capsule') mesh = capsuleMesh;

            if (!mesh) return;

            const delta = 0.1;

            if (lastRotateKey === 'x') {
                if (e.key === 'ArrowRight') mesh.rotation.x += delta;
                else if (e.key === 'ArrowLeft') mesh.rotation.x -= delta;
            } else if (lastRotateKey === 'y') {
                if (e.key === 'ArrowUp') mesh.rotation.y += delta;
                else if (e.key === 'ArrowDown') mesh.rotation.y -= delta;
            } else if (lastRotateKey === 'z') {
                if (e.key === 'ArrowRight') mesh.rotation.z += delta;
                else if (e.key === 'ArrowLeft') mesh.rotation.z -= delta;
            }

            renderer.render(scene, camera);
            return;
        }
    }


    // =======================
    // TRANSLASI (butuh mode aktif)
    // =======================
    if (!isTranslating) return;

    // Translasi untuk objek 2D
    if (['yinYang', 'moonStar', 'cross'].includes(currentShape.type)) {
        let newX = currentShape.x;
        let newY = currentShape.y;

        switch (e.key) {
            case 'ArrowUp':
                newY = Math.max(0, newY - step2D);
                break;
            case 'ArrowDown':
                newY = Math.min(canvas2D.height, newY + step2D);
                break;
            case 'ArrowLeft':
                newX = Math.max(0, newX - step2D);
                break;
            case 'ArrowRight':
                newX = Math.min(canvas2D.width, newX + step2D);
                break;
            default:
                return;
        }

        redrawCurrentShape(newX, newY);
        currentShape.x = newX;
        currentShape.y = newY;
    }

    // Translasi untuk objek 3D
    else if (['pear', 'mosqueDome', 'capsule'].includes(currentShape.type)) {
        let mesh = null;
        if (currentShape.type === 'pear') mesh = pearMesh;
        else if (currentShape.type === 'mosqueDome') mesh = domeMesh;
        else if (currentShape.type === 'capsule') mesh = capsuleMesh;

        if (!mesh) return;

        switch (e.key) {
            case 'ArrowUp':
                mesh.position.y += step3D;
                break;
            case 'ArrowDown':
                mesh.position.y -= step3D;
                break;
            case 'ArrowLeft':
                mesh.position.x -= step3D;
                break;
            case 'ArrowRight':
                mesh.position.x += step3D;
                break;
            default:
                return;
        }

        renderer.render(scene, camera);
    }
});

window.addEventListener('resize', () => {
    if (rotate3DIcon.style.display !== 'none') {
        const rect = canvas3D.getBoundingClientRect();
        rotate3DIcon.style.left = `${rect.left + rect.width / 2 - 25}px`;
        rotate3DIcon.style.top = `${rect.top + rect.height / 2 - 25}px`;
    }
});


// Event tombol Translate toggle
const translateBtn = document.getElementById('translateBtn');
translateBtn.addEventListener('click', () => {
    isTranslating = !isTranslating;

    if (isTranslating) {
        translateBtn.style.backgroundColor = 'darkblue';
        translateBtn.style.color = 'white';
        scaleBtn.disabled = true;
        rotateBtn.disabled = true;

        createTranslateButtons();          // buat tombol-tombol arah
        translateArrowButtons.style.display = 'block'; // tampilkan
    } else {
        translateBtn.style.backgroundColor = '';
        translateBtn.style.color = '';
        scaleBtn.disabled = false;
        rotateBtn.disabled = false;

        translateArrowButtons.style.display = 'none'; // sembunyikan
    }
});


// Ganti warna objek saat dipilih
colorPicker.addEventListener('input', (e) => {
    fillColor = e.target.value;

    if (!currentShape) return;

    const centerX = canvas2D.width / 2;
    const centerY = canvas2D.height / 2;

    if (currentShape.type === 'yinYang') {
        drawYinYang(centerX, centerY);
    } else if (currentShape.type === 'moonStar') {
        drawMoonStar(centerX, centerY);
    } else if (currentShape.type === 'cross') {
        drawCross(centerX, centerY);
    } else if (currentShape.type === 'pear' && pearMesh) {
        pearMesh.material.color.set(fillColor);
        renderer.render(scene, camera);
    } else if (currentShape.type === 'mosqueDome' && domeMesh) {
        domeMesh.material.color.set(fillColor);
        renderer.render(scene, camera);
    } else if (currentShape.type === 'capsule' && capsuleMesh) {
        capsuleMesh.material.color.set(fillColor);
        renderer.render(scene, camera);
    }
});

// Fungsi untuk mengubah ukuran objek
scaleBtn.addEventListener('click', () => {
    isScaling = !isScaling;
    scaleForm.style.display = isScaling ? 'flex' : 'none';

    if (currentShape) {
        const is3D = ['pear', 'mosqueDome', 'capsule'].includes(currentShape.type);
        document.getElementById('scale2DControls').style.display = is3D ? 'none' : 'block';
        document.getElementById('scale3DControls').style.display = is3D ? 'block' : 'none';
    }
});

applyScaleBtn.addEventListener('click', () => {
    if (!currentShape) return;

    const type = currentShape.type;

    if (['yinYang', 'moonStar', 'cross'].includes(type)) {
        const scaleX = parseFloat(document.getElementById('scaleX2D').value);
        const scaleY = parseFloat(document.getElementById('scaleY2D').value);
        if (isNaN(scaleX) || isNaN(scaleY)) return;

        currentShape.scaleX = scaleX;
        currentShape.scaleY = scaleY;

        const { x, y } = currentShape;
        if (type === 'yinYang') drawScaledYinYang(x, y, scaleX, scaleY);
        if (type === 'moonStar') drawScaledMoonStar(x, y, scaleX, scaleY);
        if (type === 'cross') drawScaledCross(x, y, scaleX, scaleY);
    } else if (['pear', 'mosqueDome', 'capsule'].includes(type)) {
        const sx = parseFloat(document.getElementById('scaleX').value);
        const sy = parseFloat(document.getElementById('scaleY').value);
        const sz = parseFloat(document.getElementById('scaleZ').value);
        if (isNaN(sx) || isNaN(sy) || isNaN(sz)) return;

        let mesh = null;
        if (type === 'pear') mesh = pearMesh;
        else if (type === 'mosqueDome') mesh = domeMesh;
        else if (type === 'capsule') mesh = capsuleMesh;

        if (mesh) {
            mesh.scale.set(sx, sy, sz);
            renderer.render(scene, camera);
        }
    }
});