// --- Helper function to show messages instead of alert() ---
const messageBox = document.getElementById('messageBox');
function showMessage(message, duration = 3000) {
    messageBox.textContent = message;
    messageBox.style.display = 'block';
    setTimeout(() => {
        messageBox.style.display = 'none';
    }, duration);
}

// --- Constants for Handles ---
const HANDLE_SIZE = 8;
const ROTATE_HANDLE_OFFSET = 20;

// --- shapeClasses.js --- 
class Shape {
    constructor(x, y, size = 50, options = {}) {
        this.id = `shape_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        this.x = x;
        this.y = y;
        this.size = size;

        this.translateX = 0;
        this.translateY = 0;
        this.scaleX = 1;
        this.scaleY = 1;
        this.rotation = 0;

        this.fillColor = options.fillColor || '#000000';
        this.strokeColor = options.strokeColor || '#000000';
        this.fillColorCheck = options.fillColorCheck ?? true;
        this.strokeColorCheck = options.strokeColorCheck ?? true;
        this.strokeWidth = options.strokeWidth || 2;
    }

    get svijetX() { return this.x + this.translateX; }
    get svijetY() { return this.y + this.translateY; }

    getBoundingBox() {
        const wX = this.svijetX;
        const wY = this.svijetY;
        const s = this.size;
        const localCorners = [
            { x: -s * this.scaleX, y: -s * this.scaleY },
            { x: s * this.scaleX, y: -s * this.scaleY },
            { x: s * this.scaleX, y: s * this.scaleY },
            { x: -s * this.scaleX, y: s * this.scaleY },
        ];

        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const rad = this.rotation * Math.PI / 180;
        const cosRad = Math.cos(rad);
        const sinRad = Math.sin(rad);

        localCorners.forEach(lc => {
            const rotatedX = lc.x * cosRad - lc.y * sinRad;
            const rotatedY = lc.x * sinRad + lc.y * cosRad;
            const worldX = rotatedX + wX;
            const worldY = rotatedY + wY;
            minX = Math.min(minX, worldX);
            maxX = Math.max(maxX, worldX);
            minY = Math.min(minY, worldY);
            maxY = Math.max(maxY, worldY);
        });

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            centerX: wX,
            centerY: wY
        };
    }

    worldToLocal(px, py) {
        let localX = px - this.svijetX;
        let localY = py - this.svijetY;

        const rad = -this.rotation * Math.PI / 180;
        const cosRad = Math.cos(rad);
        const sinRad = Math.sin(rad);
        let rotatedX = localX * cosRad - localY * sinRad;
        let rotatedY = localX * sinRad + localY * cosRad;

        const localPx = this.scaleX === 0 ? rotatedX : rotatedX / this.scaleX;
        const localPy = this.scaleY === 0 ? rotatedY : rotatedY / this.scaleY;
        return { x: localPx, y: localPy };
    }

    localToWorld(localX, localY) {
        let scaledX = localX * this.scaleX;
        let scaledY = localY * this.scaleY;

        const rad = this.rotation * Math.PI / 180;
        const cosRad = Math.cos(rad);
        const sinRad = Math.sin(rad);
        let rotatedX = scaledX * cosRad - scaledY * sinRad;
        let rotatedY = scaledX * sinRad + scaledY * cosRad;

        return { x: rotatedX + this.svijetX, y: rotatedY + this.svijetY };
    }


    applyTransform(ctx) {
        ctx.translate(this.svijetX, this.svijetY);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.scale(this.scaleX, this.scaleY);
    }

    getHandles() {
        const handles = [];
        const s = this.size;

        const localCorners = [
            { id: 'top-left', x: -s, y: -s, cursor: 'nwse-resize' },
            { id: 'top-right', x: s, y: -s, cursor: 'nesw-resize' },
            { id: 'bottom-left', x: -s, y: s, cursor: 'nesw-resize' },
            { id: 'bottom-right', x: s, y: s, cursor: 'nwse-resize' },
        ];

        localCorners.forEach(lc => {
            const worldPos = this.localToWorld(lc.x, lc.y);
            handles.push({ ...lc, worldX: worldPos.x, worldY: worldPos.y });
        });

        const localRotationHandlePos = { x: 0, y: -s - (ROTATE_HANDLE_OFFSET / Math.abs(this.scaleY || 1)) };
        const worldRotationHandlePos = this.localToWorld(localRotationHandlePos.x, localRotationHandlePos.y);
        handles.push({
            id: 'rotate',
            worldX: worldRotationHandlePos.x,
            worldY: worldRotationHandlePos.y,
            cursor: 'url("data:image/svg+xml;utf8,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"16\\" height=\\"16\\" fill=\\"currentColor\\" viewBox=\\"0 0 16 16\\"><path d=\\"M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41zM.534 9h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9z\\"/><path fill-rule=\\"evenodd\\" d=\\"M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.5A5.002 5.002 0 0 0 8 3zM3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9H3.5a5.002 5.002 0 0 0 3.1 9z\\"/></svg>") 8 8, auto'
        });
        return handles;
    }

    drawSelection(ctx) {
        ctx.save();
        this.applyTransform(ctx);
        ctx.strokeStyle = 'rgba(0, 150, 255, 0.7)';
        const effectiveScale = Math.min(Math.abs(this.scaleX || 1), Math.abs(this.scaleY || 1));
        ctx.lineWidth = 1 / effectiveScale;
        ctx.setLineDash([3 / effectiveScale, 2 / effectiveScale]);
        ctx.strokeRect(-this.size, -this.size, this.size * 2, this.size * 2);
        ctx.restore();

        const handles = this.getHandles();
        handles.forEach(handle => {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 150, 255, 0.8)';
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(handle.worldX, handle.worldY, HANDLE_SIZE / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.restore();
        });
        ctx.setLineDash([]);
    }


    isPointInside(px, py) {
        const localP = this.worldToLocal(px, py);
        return localP.x >= -this.size && localP.x <= this.size &&
            localP.y >= -this.size && localP.y <= this.size;
    }

    getHandleAtPoint(worldX, worldY) {
        const handles = this.getHandles();
        for (const handle of handles) {
            const distSq = (worldX - handle.worldX) ** 2 + (worldY - handle.worldY) ** 2;
            if (distSq <= (HANDLE_SIZE) ** 2) {
                return handle;
            }
        }
        return null;
    }
}

class BrushStroke extends Shape {
    constructor(x, y, color, lineWidth, isEraser) {
        super(x, y, 0);
        this.points = [{ x, y }];
        this.color = color;
        this.lineWidth = lineWidth;
        this.isEraser = isEraser;
        this.id = `brush_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }

    addPoint(x, y) {
        this.points.push({ x, y });
    }

    draw(ctx) {
        if (this.points.length < 2 && !this.isEraser) {
            if (this.points.length === 1 && this.isEraser) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.points[0].x, this.points[0].y, this.lineWidth / 2, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(0,0,0,1)';
                ctx.globalCompositeOperation = 'destination-out';
                ctx.fill();
                ctx.globalCompositeOperation = 'source-over';
                ctx.restore();
                return;
            }
            return;
        }


        ctx.save();
        ctx.beginPath();
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
            ctx.lineTo(this.points[i].x, this.points[i].y);
        }

        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (this.isEraser) {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
        }
        ctx.stroke();
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
    }

    applyTransform(ctx) { /* Tidak melakukan apa-apa */ }
    getHandles() { return []; /* Tidak ada handle */ }
    drawSelection(ctx) { /* Tidak ada seleksi */ }
    isPointInside(px, py) { return false; /* Tidak bisa dipilih */ }
    getBoundingBox() {
        if (this.points.length === 0) return { x: 0, y: 0, width: 0, height: 0, centerX: 0, centerY: 0 };
        let minX = this.points[0].x, maxX = this.points[0].x;
        let minY = this.points[0].y, maxY = this.points[0].y;
        this.points.forEach(p => {
            minX = Math.min(minX, p.x);
            maxX = Math.max(maxX, p.x);
            minY = Math.min(minY, p.y);
            maxY = Math.max(maxY, p.y);
        });
        return { x: minX, y: minY, width: maxX - minX, height: maxY - minY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 };
    }
}


class Cross extends Shape {
    constructor(x, y, size, options = {}) {
        super(x, y, size, options);
    }

    draw(ctx) {
        ctx.save();
        this.applyTransform(ctx);

        const s = this.size;
        const vWidth = s * 0.3;
        const vHeight = s * 2;
        const hWidth = s * 2;
        const hHeight = s * 0.3;

        ctx.fillStyle = this.fillColorCheck ? this.fillColor : 'transparent';
        ctx.strokeStyle = this.strokeColorCheck ? this.strokeColor : 'transparent';
        ctx.lineWidth = this.strokeWidth;

        // Batang vertikal
        ctx.beginPath();
        ctx.rect(-vWidth / 2, -vHeight / 2, vWidth, vHeight);
        if (this.fillColorCheck) ctx.fill();
        if (this.strokeColorCheck) ctx.stroke();

        // Batang horizontal
        ctx.beginPath();
        ctx.rect(-hWidth / 2, -hHeight / 2, hWidth, hHeight);
        if (this.fillColorCheck) ctx.fill();
        if (this.strokeColorCheck) ctx.stroke();

        ctx.restore();
    }
    isPointInside(px, py) {
        const localP = this.worldToLocal(px, py);

        const s = this.size;
        const vWidth = s / 1.5;
        const vHeight = s * 2;
        const hWidth = s * 2;
        const hHeight = s / 1.5;

        const inVertical = localP.x >= -vWidth / 2 && localP.x <= vWidth / 2 &&
            localP.y >= -vHeight / 2 && localP.y <= vHeight / 2;
        const inHorizontal = localP.x >= -hWidth / 2 && localP.x <= hWidth / 2 &&
            localP.y >= -hHeight / 2 && localP.y <= hHeight / 2;
        return inVertical || inHorizontal;
    }
}

class StarCrescent extends Shape {
    constructor(x, y, size, options = {}) {
        super(x, y, size, options);
    }

    draw(ctx) {
        ctx.save();
        this.applyTransform(ctx);

        const fillColor = this.fillColorCheck ? this.fillColor : 'transparent';
        const strokeColor = this.strokeColorCheck ? this.strokeColor : 'transparent';
        const strokeWidth = this.strokeWidth;

        const outerR = this.size;
        const innerR = this.size * 0.75;
        const offset = this.size * 0.3;

        // ===== Bulan luar (full lingkaran) =====
        ctx.fillStyle = fillColor;
        ctx.beginPath();
        ctx.arc(0, 0, outerR, 0, Math.PI * 2);
        if (this.fillColorCheck) ctx.fill();
        if (this.strokeColorCheck) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }

        // ===== Bulan dalam (untuk membentuk sabit) =====
        ctx.save();
        ctx.beginPath();
        ctx.arc(offset, 0, innerR, 0, Math.PI * 2);
        ctx.clip();

        // Kosongkan area dalam (supaya jadi sabit)
        ctx.clearRect(-outerR * 2, -outerR * 2, outerR * 4, outerR * 4);
        ctx.restore();

        // Tambahkan outline hitam untuk bulan dalam (inner circle)
        if (this.strokeColorCheck) {
            ctx.beginPath();
            ctx.arc(offset, 0, innerR, 0, Math.PI * 2);
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }

        // ===== Bintang (presisi & potong latar) =====
        const starOuter = this.size * 0.3;
        const starInner = starOuter / 2.5;
        const starX = this.size * 0.35;
        const starY = -this.size * 0.1;

        // Bersihkan area bintang agar background transparan dulu
        ctx.save();
        ctx.beginPath();
        ctx.arc(starX, starY, starOuter + 2, 0, Math.PI * 2); // +2 supaya rapi
        ctx.clip();
        ctx.clearRect(starX - starOuter - 5, starY - starOuter - 5, starOuter * 2 + 10, starOuter * 2 + 10);
        ctx.restore();

        // Gambar bintangnya
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            let angleOuter = Math.PI / 2 + i * 2 * Math.PI / 5;
            let angleInner = angleOuter + Math.PI / 5;

            let xOuter = starX + starOuter * Math.cos(angleOuter);
            let yOuter = starY - starOuter * Math.sin(angleOuter);
            let xInner = starX + starInner * Math.cos(angleInner);
            let yInner = starY - starInner * Math.sin(angleInner);

            if (i === 0) ctx.moveTo(xOuter, yOuter);
            else ctx.lineTo(xOuter, yOuter);
            ctx.lineTo(xInner, yInner);
        }
        ctx.closePath();

        ctx.fillStyle = fillColor;
        if (this.fillColorCheck) ctx.fill();
        if (this.strokeColorCheck) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth;
            ctx.stroke();
        }

        ctx.restore();
    }

    isPointInside(px, py) {
        const localP = this.worldToLocal(px, py);
        const r = this.size;
        const offset = r * 0.3;
        const d1 = Math.sqrt(localP.x ** 2 + localP.y ** 2); // dari pusat luar
        const d2 = Math.sqrt((localP.x - offset) ** 2 + localP.y ** 2); // dari pusat dalam
        return d1 <= r && d2 >= r * 0.75; // di antara keduanya
    }
}

class YinYang extends Shape {
    constructor(x, y, size, options = {}) {
        super(x, y, size, options);
    }

    draw(ctx) {
        ctx.save();
        this.applyTransform(ctx);

        const r = this.size;
        const smallR = r / 2;
        const dotR = r / 10;

        const colorYang = this.fillColorCheck ? this.fillColor : 'black';
        const colorYin = '#FFFFFF';

        // Lingkaran utama
        ctx.beginPath();
        ctx.fillStyle = colorYin;
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Bagian hitam
        ctx.beginPath();
        ctx.fillStyle = colorYang;
        ctx.arc(0, 0, r, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.arc(0, -smallR, smallR, 1.5 * Math.PI, 0.5 * Math.PI, true);
        ctx.closePath();
        ctx.fill();

        // Lingkaran putih di atas
        ctx.beginPath();
        ctx.fillStyle = colorYin;
        ctx.arc(0, -smallR, smallR, 0, Math.PI * 2);
        ctx.fill();

        // Lingkaran hitam di bawah
        ctx.beginPath();
        ctx.fillStyle = colorYang;
        ctx.arc(0, smallR, smallR, 0, Math.PI * 2);
        ctx.fill();

        // Titik kecil hitam di atas
        ctx.beginPath();
        ctx.fillStyle = colorYang;
        ctx.arc(0, -smallR, dotR, 0, Math.PI * 2);
        ctx.fill();

        // Titik kecil putih di bawah
        ctx.beginPath();
        ctx.fillStyle = colorYin;
        ctx.arc(0, smallR, dotR, 0, Math.PI * 2);
        ctx.fill();

        // Stroke luar
        if (this.strokeColorCheck && this.strokeWidth > 0) {
            ctx.strokeStyle = this.strokeColor;
            ctx.lineWidth = this.strokeWidth;
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }
    isPointInside(px, py) {
        const localP = this.worldToLocal(px, py);
        return (localP.x * localP.x + localP.y * localP.y) <= (this.size * this.size);
    }
}

// --- setupCanvasEvents.js --- 
function setupCanvasEvents(canvas, ctx, selectors, state, setTool, redrawCanvasScoped, updateTransformFormInputs) {
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let initialDistToCenter = 1;
    let initialAngleToCenter = 0;
    let originalObjectState = null;

    function startBrushStroke(e, canvasCtx, localSelectors, localState) {
        localState.isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const color = localState.tool === 'brush' ? localSelectors.inputs.colorPicker.value : '#FFFFFF';
        const lineWidth = parseFloat(localSelectors.inputs.brushSize.value);
        const isEraser = localState.tool === 'eraser';

        localState.activeBrushStroke = new BrushStroke(x, y, color, lineWidth, isEraser);
        redrawCanvasScoped();
    }

    function drawBrushStroke(e, localState) {
        if (!localState.isDrawing || !localState.activeBrushStroke) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        localState.activeBrushStroke.addPoint(x, y);
        redrawCanvasScoped();
    }

    function endBrushStroke(localState) {
        if (!localState.isDrawing || !localState.activeBrushStroke) return;

        if (localState.activeBrushStroke.points.length > (localState.activeBrushStroke.isEraser ? 0 : 1)) {
            localState.objects.push(localState.activeBrushStroke);
        }
        localState.activeBrushStroke = null;
        localState.isDrawing = false;
        redrawCanvasScoped();
    }


    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        state.startX = mouseX;
        state.startY = mouseY;

        if (state.tool === 'brush' || state.tool === 'eraser') {
            startBrushStroke(e, ctx, selectors, state);
            return;
        }

        state.activeHandle = null;

        if (state.tool === 'select' && state.selected && state.transformMode === 'mouse') {
            const handle = state.selected.getHandleAtPoint(mouseX, mouseY);
            if (handle) {
                state.activeHandle = handle;
                state.isDrawing = true;
                state.isDragging = true;

                originalObjectState = {
                    x: state.selected.x,
                    y: state.selected.y,
                    translateX: state.selected.translateX,
                    translateY: state.selected.translateY,
                    scaleX: state.selected.scaleX,
                    scaleY: state.selected.scaleY,
                    rotation: state.selected.rotation,
                    svijetX: state.selected.svijetX,
                    svijetY: state.selected.svijetY,
                };

                const objPivotX = originalObjectState.svijetX;
                const objPivotY = originalObjectState.svijetY;

                if (handle.id !== 'rotate') {
                    initialDistToCenter = Math.sqrt((mouseX - objPivotX) ** 2 + (mouseY - objPivotY) ** 2);
                    if (initialDistToCenter === 0) initialDistToCenter = 1;
                } else if (handle.id === 'rotate') {
                    initialAngleToCenter = Math.atan2(mouseY - objPivotY, mouseX - objPivotX);
                }
                canvas.style.cursor = handle.cursor || 'grabbing';
                redrawCanvasScoped();
                return;
            }
        }

        state.isDrawing = true;
        state.isDragging = false;

        if (state.tool === 'select') {
            let clickedObject = null;
            for (let i = state.objects.length - 1; i >= 0; i--) {
                if (state.objects[i].isPointInside(mouseX, mouseY)) {
                    clickedObject = state.objects[i];
                    break;
                }
            }

            if (clickedObject) {
                if (state.selected !== clickedObject) {
                    state.selected = clickedObject;
                }
                if (state.transformMode === 'mouse' && !state.activeHandle) {
                    state.isDragging = true;
                    dragOffsetX = mouseX - state.selected.svijetX;
                    dragOffsetY = mouseY - state.selected.svijetY;
                    canvas.style.cursor = 'grabbing';
                }
                updateTransformFormInputs(selectors, state.selected);
            } else {
                state.selected = null;
                updateTransformFormInputs(selectors, null);
            }
        } else if (['cross', 'starCrescent', 'yinYang'].includes(state.tool)) {
            state.selected = null;
        }
        redrawCanvasScoped();
    });

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        let needsRedraw = false;

        if (state.tool === 'select' && state.selected && state.transformMode === 'mouse' && !state.isDragging) {
            const handle = state.selected.getHandleAtPoint(mouseX, mouseY);
            canvas.style.cursor = handle ? handle.cursor : (state.selected.isPointInside(mouseX, mouseY) ? 'grab' : 'default');
        } else if (state.tool === 'select' && !state.selected && !state.isDragging) {
            canvas.style.cursor = 'default';
        }


        if (state.tool === 'brush' || state.tool === 'eraser') {
            if (state.isDrawing) {
                drawBrushStroke(e, state);
            }
            return;
        }

        if (!state.isDragging) return;

        if (state.selected) {
            if (state.activeHandle && state.transformMode === 'mouse' && originalObjectState) {
                const obj = state.selected;
                const objOriginal = originalObjectState;
                const objPivotX = objOriginal.svijetX;
                const objPivotY = objOriginal.svijetY;
                if (state.activeHandle.id !== 'rotate') { // Corrected condition for scaling handles
                    const currentDistToCenter = Math.sqrt((mouseX - objPivotX) ** 2 + (mouseY - objPivotY) ** 2);
                    let scaleFactor = initialDistToCenter === 0 ? 1 : currentDistToCenter / initialDistToCenter;

                    obj.scaleX = objOriginal.scaleX * scaleFactor;
                    obj.scaleY = objOriginal.scaleY * scaleFactor;

                    const signX = objOriginal.scaleX >= 0 ? 1 : -1;
                    const signY = objOriginal.scaleY >= 0 ? 1 : -1;
                    obj.scaleX = Math.max(0.05, Math.abs(obj.scaleX)) * signX;
                    obj.scaleY = Math.max(0.05, Math.abs(obj.scaleY)) * signY;

                    needsRedraw = true;
                } else if (state.activeHandle.id === 'rotate') { // This remains the same for rotation
                    const currentAngle = Math.atan2(mouseY - objPivotY, mouseX - objPivotX);
                    const angleDelta = currentAngle - initialAngleToCenter;
                    let rawRotation = objOriginal.rotation + angleDelta * (180 / Math.PI);
                    obj.rotation = (rawRotation % 360 + 360) % 360;
                    needsRedraw = true;
                }
            } else if (!state.activeHandle && state.transformMode === 'mouse') {
                state.selected.translateX = (mouseX - dragOffsetX) - state.selected.x;
                state.selected.translateY = (mouseY - dragOffsetY) - state.selected.y;
                needsRedraw = true;
            }
        }

        if (needsRedraw) {
            updateTransformFormInputs(selectors, state.selected);
            redrawCanvasScoped();
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (state.tool === 'brush' || state.tool === 'eraser') {
            if (state.isDrawing) {
                endBrushStroke(state);
            }
            if (state.tool === 'select') canvas.style.cursor = 'default';
            else if (state.tool === 'brush') canvas.style.cursor = 'crosshair';
            return;
        }

        if (state.isDrawing && !state.isDragging && !state.activeHandle && ['cross', 'starCrescent', 'yinYang'].includes(state.tool)) {
            const rect = canvas.getBoundingClientRect();
            const endX = e.clientX - rect.left;
            const endY = e.clientY - rect.top;

            const shapeX = (state.startX + endX) / 2;
            const shapeY = (state.startY + endY) / 2;
            const size = Math.max(Math.abs(endX - state.startX), Math.abs(endY - state.startY)) / 2;

            if (size >= 5) {
                const shapeMap = {
                    cross: (opt) => new Cross(shapeX, shapeY, size, opt),
                    starCrescent: (opt) => new StarCrescent(shapeX, shapeY, size, opt),
                    yinYang: (opt) => new YinYang(shapeX, shapeY, size, opt)
                };

                const options = {
                    fillColor: selectors.inputs.fillColor.value,
                    strokeColor: selectors.inputs.strokeColor.value,
                    fillColorCheck: selectors.inputs.fillColorCheck.checked,
                    strokeColorCheck: selectors.inputs.strokeColorCheck.checked,
                    strokeWidth: parseFloat(selectors.inputs.strokeWidth.value)
                };

                const newShape = shapeMap[state.tool]();
                state.objects.push(newShape);
                state.selected = newShape;
                updateTransformFormInputs(selectors, newShape);
                setTool('select');
            } else {
                setTool('select');
            }
        }

        if (state.isDragging) {
            if (state.selected && state.transformMode === 'mouse' && !state.activeHandle) {
                canvas.style.cursor = 'grab';
            } else {
                canvas.style.cursor = 'default';
                if (state.selected && state.tool === 'select' && state.transformMode === 'mouse') {
                    const rect = canvas.getBoundingClientRect();
                    const mouseX = e.clientX - rect.left;
                    const mouseY = e.clientY - rect.top;
                    const handle = state.selected.getHandleAtPoint(mouseX, mouseY);
                    canvas.style.cursor = handle ? handle.cursor : (state.selected.isPointInside(mouseX, mouseY) ? 'grab' : 'default');
                }
            }
        }

        state.isDrawing = false;
        state.isDragging = false;
        state.activeHandle = null;
        originalObjectState = null;
        redrawCanvasScoped();
    });

    canvas.addEventListener('mouseout', (e) => {
        if ((state.tool === 'brush' || state.tool === 'eraser') && state.isDrawing) {
            endBrushStroke(state);
        }
        if (state.isDragging) {
            state.isDrawing = false;
            state.isDragging = false;
            state.activeHandle = null;
            originalObjectState = null;
            canvas.style.cursor = 'default';
            redrawCanvasScoped();
        }
    });
}

function setupToolButtons(selectors, state, setTool, redrawCanvasScoped) {
    selectors.tools.brush.addEventListener('click', () => setTool('brush'));
    selectors.tools.eraser.addEventListener('click', () => setTool('eraser'));

    if (selectors.shapeButtons.select) {
        selectors.shapeButtons.select.addEventListener('click', () => {
            setTool('select');
            if (state.transformMode === 'form') {
                selectors.misc.transformFormInputs.style.display = 'block';
            } else {
                selectors.misc.transformFormInputs.style.display = 'none';
            }
        });
    }

    selectors.shapeButtons.cross.addEventListener('click', () => setTool('cross'));
    selectors.shapeButtons.starCrescent.addEventListener('click', () => setTool('starCrescent'));
    selectors.shapeButtons.yinYang.addEventListener('click', () => setTool('yinYang'));
}

function setupTransformControls(selectors, state, redrawCanvasScoped, safeNumber, updateTransformFormInputs, localSetTool, localClearTransformFormInputs) {
    const { form, mouse, keyboard, applyTranslate, applyScale, applyRotate } = selectors.transformButtons;
    const inputs = selectors.inputs;

    function setActiveTransformButton(mode) {
        [form, mouse, keyboard].forEach(btn => btn.classList.remove('active'));
        if (mode === 'form') form.classList.add('active');
        else if (mode === 'mouse') mouse.classList.add('active');
        else if (mode === 'keyboard') keyboard.classList.add('active');
    }

    form.addEventListener('click', () => {
        state.transformMode = 'form';
        selectors.misc.transformFormInputs.style.display = 'block';
        setActiveTransformButton('form');
        if (state.selected) updateTransformFormInputs(selectors, state.selected);
        else localClearTransformFormInputs(selectors);
        localSetTool('select');
        showMessage("Mode Transformasi: Form aktif. Gunakan input di bawah.", 2000);
        redrawCanvasScoped();
    });

    mouse.addEventListener('click', () => {
        state.transformMode = 'mouse';
        selectors.misc.transformFormInputs.style.display = 'none';
        setActiveTransformButton('mouse');
        localSetTool('select');
        showMessage("Mode Transformasi: Mouse aktif. Klik & seret objek/handle.", 2000);
        redrawCanvasScoped();
    });

    keyboard.addEventListener('click', () => {
        state.transformMode = 'keyboard';
        selectors.misc.transformFormInputs.style.display = 'none';
        setActiveTransformButton('keyboard');
        localSetTool('select');
        showMessage("Mode Transformasi: Keyboard aktif. Pilih objek, lalu gunakan panah (translasi), +/- (skala), R/T (rotasi).", 3000);
        redrawCanvasScoped();
    });

    applyTranslate.addEventListener('click', () => {
        if (state.selected) {
            state.selected.translateX = safeNumber(inputs.translateX.value, state.selected.translateX);
            state.selected.translateY = safeNumber(inputs.translateY.value, state.selected.translateY);
            redrawCanvasScoped();
        } else showMessage("Pilih objek terlebih dahulu.", 2000);
    });

    applyScale.addEventListener('click', () => {
        if (state.selected) {
            let newScaleX = safeNumber(inputs.scaleX.value, state.selected.scaleX, true);
            let newScaleY = safeNumber(inputs.scaleY.value, state.selected.scaleY, true);
            state.selected.scaleX = newScaleX === 0 ? (state.selected.scaleX > 0 ? 0.01 : -0.01) : newScaleX;
            state.selected.scaleY = newScaleY === 0 ? (state.selected.scaleY > 0 ? 0.01 : -0.01) : newScaleY;
            redrawCanvasScoped();
        } else showMessage("Pilih objek terlebih dahulu.", 2000);
    });

    applyRotate.addEventListener('click', () => {
        if (state.selected) {
            let rawRotation = safeNumber(inputs.rotation.value, state.selected.rotation);
            state.selected.rotation = (rawRotation % 360 + 360) % 360;
            redrawCanvasScoped();
        } else showMessage("Pilih objek terlebih dahulu.", 2000);
    });
}

function setupKeyboardShortcuts(selectors, state, redrawCanvasScoped, updateTransformFormInputs, localClearTransformFormInputs) {
    document.addEventListener('keydown', (e) => {
        if (!state.selected || state.transformMode !== 'keyboard') return;

        if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
            return;
        }

        const step = { move: e.shiftKey ? 1 : 10, scale: e.shiftKey ? 0.01 : 0.1, rotate: e.shiftKey ? 1 : 5 };
        let changed = false;

        switch (e.key) {
            case 'ArrowUp': state.selected.translateY -= step.move; changed = true; break;
            case 'ArrowDown': state.selected.translateY += step.move; changed = true; break;
            case 'ArrowLeft': state.selected.translateX -= step.move; changed = true; break;
            case 'ArrowRight': state.selected.translateX += step.move; changed = true; break;
            case 'Delete':
            case 'Backspace':
                if (state.selected) {
                    // Hapus objek dari array
                    state.objects = state.objects.filter(obj => obj.id !== state.selected.id);
                    state.selected = null;
                    localClearTransformFormInputs(selectors);
                    changed = true;
                }
                break;
            case '+': case '=':
                let currentScaleXPlus = state.selected.scaleX + step.scale;
                let currentScaleYPlus = state.selected.scaleY + step.scale;
                if (e.ctrlKey || e.metaKey) {
                    state.selected.scaleY = parseFloat(Math.max(0.01, currentScaleYPlus).toFixed(2));
                } else {
                    state.selected.scaleX = parseFloat(Math.max(0.01, currentScaleXPlus).toFixed(2));
                }
                changed = true;
                break;
            case '-': case '_':
                let currentScaleXMinus = state.selected.scaleX - step.scale;
                let currentScaleYMinus = state.selected.scaleY - step.scale;
                if (e.ctrlKey || e.metaKey) {
                    state.selected.scaleY = parseFloat(Math.max(0.01, currentScaleYMinus).toFixed(2));
                } else {
                    state.selected.scaleX = parseFloat(Math.max(0.01, currentScaleXMinus).toFixed(2));
                }
                changed = true;
                break;
            case 'r': case 'R':
                state.selected.rotation = (state.selected.rotation + step.rotate + 360) % 360;
                changed = true;
                break;
            case 't': case 'T':
                state.selected.rotation = (state.selected.rotation - step.rotate + 360) % 360;
                changed = true;
                break;
            case 'Delete': case 'Backspace':
                if (state.selected) {
                    state.objects = state.objects.filter(obj => obj.id !== state.selected.id);
                    state.selected = null;
                    localClearTransformFormInputs(selectors);
                    changed = true;
                }
                break;
        }

        if (changed) {
            e.preventDefault();
            updateTransformFormInputs(selectors, state.selected);
            redrawCanvasScoped();
        }
    });
}

function setupMiscUtilities(selectors, canvas, state, redrawCanvasScoped, clearTransformFormInputs) {
    selectors.misc.clearCanvas.addEventListener('click', () => {
        state.objects = [];
        state.selected = null;
        clearTransformFormInputs(selectors);
        redrawCanvasScoped();
        showMessage("Kanvas dibersihkan.", 1500);
    });

    selectors.misc.saveAsImage.addEventListener('click', () => {
        const imageName = prompt("Masukkan nama file gambar:", "gambar-grafika.png");
        if (imageName) {
            const link = document.createElement('a');
            link.download = imageName;

            const tempSelected = state.selected;
            const tempActiveHandle = state.activeHandle;
            state.selected = null;
            state.activeHandle = null;
            redrawCanvasScoped();

            setTimeout(() => {
                link.href = canvas.toDataURL('image/png');
                link.click();
                state.selected = tempSelected;
                state.activeHandle = tempActiveHandle;
                redrawCanvasScoped();
                showMessage(`Gambar disimpan sebagai ${imageName}`, 2000);
            }, 100);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded, script starting."); // DEBUG
    const canvas = document.getElementById('drawingCanvas');
    if (!canvas) {
        console.error("FATAL: Canvas element #drawingCanvas not found in HTML.");
        showMessage("Error Kritis: Elemen canvas tidak ditemukan!", 10000);
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error("FATAL: Could not get 2D context from canvas.");
        showMessage("Error Kritis: Tidak bisa mendapatkan konteks 2D canvas!", 10000);
        return;
    }


    const selectors = {
        shapeButtons: {
            cross: document.getElementById('drawCross'),
            starCrescent: document.getElementById('drawStarCrescent'),
            yinYang: document.getElementById('drawYinYang'),
            select: document.getElementById('selectToolBtn')
        },
        tools: {
            brush: document.getElementById('brushTool'),
            eraser: document.getElementById('eraserTool')
        },
        inputs: {
            fillColor: document.getElementById('fillColor'),
            fillColorCheck: document.getElementById('fillColorCheck'),
            strokeColor: document.getElementById('strokeColor'),
            strokeColorCheck: document.getElementById('strokeColorCheck'),
            strokeWidth: document.getElementById('strokeWidth'),
            brushSize: document.getElementById('brushSize'),
            colorPicker: document.getElementById('colorPicker'),
            translateX: document.getElementById('translateX'),
            translateY: document.getElementById('translateY'),
            scaleX: document.getElementById('scaleX'),
            scaleY: document.getElementById('scaleY'),
            rotation: document.getElementById('rotation')
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

    const appState = {
        tool: 'select',
        transformMode: 'form',
        isDrawing: false,
        isDragging: false,
        startX: 0,
        startY: 0,
        objects: [],
        selected: null,
        activeHandle: null,
        activeBrushStroke: null,
    };

    function safeNumber(val, fallback = 0, allowFloat = false) {
        const n = allowFloat ? parseFloat(val) : parseInt(val, 10);
        return isNaN(n) ? fallback : n;
    }

    function updateTransformFormInputs(selectors, obj) {
        if (obj && !(obj instanceof BrushStroke)) {
            selectors.inputs.translateX.value = obj.translateX.toFixed(0);
            selectors.inputs.translateY.value = obj.translateY.toFixed(0);
            selectors.inputs.scaleX.value = obj.scaleX.toFixed(2);
            selectors.inputs.scaleY.value = obj.scaleY.toFixed(2);
            selectors.inputs.rotation.value = obj.rotation.toFixed(0);
        } else {
            clearTransformFormInputs(selectors);
        }
    }
    function clearTransformFormInputs(selectors) {
        selectors.inputs.translateX.value = 0;
        selectors.inputs.translateY.value = 0;
        selectors.inputs.scaleX.value = 1;
        selectors.inputs.scaleY.value = 1;
        selectors.inputs.rotation.value = 0;
    }

    function setTool(toolName) {
        appState.tool = toolName;
        appState.activeHandle = null;
        appState.activeBrushStroke = null;
        document.querySelectorAll('.toolbar button').forEach(btn => btn.classList.remove('active'));
        const toolButtonMap = {
            ...selectors.shapeButtons,
            ...selectors.tools
        };
        if (toolName === 'select' && toolButtonMap.select) {
            toolButtonMap.select.classList.add('active');
        } else if (toolButtonMap[toolName]) {
            toolButtonMap[toolName].classList.add('active');
        }

        if (toolName === 'select') {
            canvas.style.cursor = 'default';
            if (appState.transformMode === 'form') {
                selectors.misc.transformFormInputs.style.display = 'block';
                if (appState.selected && !(appState.selected instanceof BrushStroke)) updateTransformFormInputs(selectors, appState.selected);
                else clearTransformFormInputs(selectors);
            } else {
                selectors.misc.transformFormInputs.style.display = 'none';
            }
        } else if (toolName === 'brush') {
            canvas.style.cursor = 'crosshair';
            selectors.misc.transformFormInputs.style.display = 'none';
        } else if (toolName === 'eraser') {
            canvas.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${selectors.inputs.brushSize.value}' height='${selectors.inputs.brushSize.value}' viewport='0 0 ${selectors.inputs.brushSize.value} ${selectors.inputs.brushSize.value}'><rect width='100%' height='100%' fill='white' stroke='black' stroke-width='1'/></svg>") ${selectors.inputs.brushSize.value / 2} ${selectors.inputs.brushSize.value / 2}, auto`;
            selectors.misc.transformFormInputs.style.display = 'none';
        } else {
            canvas.style.cursor = 'crosshair';
            selectors.misc.transformFormInputs.style.display = 'none';
        }
        redrawCanvasScoped();
    }
    selectors.inputs.brushSize.addEventListener('input', () => {
        if (appState.tool === 'eraser' || appState.tool === 'brush') setTool(appState.tool);
    });

    // Update fillColor saat dipilih di color picker
    selectors.inputs.fillColor.addEventListener('input', () => {
        if (appState.selected && !(appState.selected instanceof BrushStroke)) {
            appState.selected.fillColor = selectors.inputs.fillColor.value;
            redrawCanvasScoped();
        }
    });

    // Update strokeColor
    selectors.inputs.strokeColor.addEventListener('input', () => {
        if (appState.selected && !(appState.selected instanceof BrushStroke)) {
            appState.selected.strokeColor = selectors.inputs.strokeColor.value;
            redrawCanvasScoped();
        }
    });

    // Update fillColorCheck (checkbox)
    selectors.inputs.fillColorCheck.addEventListener('change', () => {
        if (appState.selected && !(appState.selected instanceof BrushStroke)) {
            appState.selected.fillColorCheck = selectors.inputs.fillColorCheck.checked;
            redrawCanvasScoped();
        }
    });

    // Update strokeColorCheck (checkbox)
    selectors.inputs.strokeColorCheck.addEventListener('change', () => {
        if (appState.selected && !(appState.selected instanceof BrushStroke)) {
            appState.selected.strokeColorCheck = selectors.inputs.strokeColorCheck.checked;
            redrawCanvasScoped();
        }
    });

    // Update strokeWidth
    selectors.inputs.strokeWidth.addEventListener('input', () => {
        if (appState.selected && !(appState.selected instanceof BrushStroke)) {
            appState.selected.strokeWidth = parseFloat(selectors.inputs.strokeWidth.value);
            redrawCanvasScoped();
        }
    });

    function redrawCanvasScoped() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const drawOptions = {
            fillColor: selectors.inputs.fillColor.value,
            fillColorCheck: selectors.inputs.fillColorCheck.checked,
            strokeColor: selectors.inputs.strokeColor.value,
            strokeColorCheck: selectors.inputs.strokeColorCheck.checked,
            strokeWidth: parseFloat(selectors.inputs.strokeWidth.value)
        };

        appState.objects.forEach(obj => {
            obj.draw(ctx);
        });

        if (appState.activeBrushStroke) {
            appState.activeBrushStroke.draw(ctx);
        }

        if (appState.selected && !(appState.selected instanceof BrushStroke) && appState.tool === 'select') {
            if (appState.transformMode === 'mouse') {
                appState.selected.drawSelection(ctx);
            } else {
                ctx.save();
                appState.selected.applyTransform(ctx);
                ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                const effectiveScaleRedraw = Math.min(Math.abs(appState.selected.scaleX || 1), Math.abs(appState.selected.scaleY || 1));
                ctx.lineWidth = 1.5 / effectiveScaleRedraw;
                ctx.setLineDash([4 / effectiveScaleRedraw, 2 / effectiveScaleRedraw]);
                ctx.strokeRect(-appState.selected.size, -appState.selected.size, appState.selected.size * 2, appState.selected.size * 2);
                ctx.restore();
                ctx.setLineDash([]);
            }
        }
    }

    function resizeCanvas() {
        if (!canvas || !selectors.misc.transformFormInputs) {
            console.error("resizeCanvas: Canvas or critical selector not found.");
            return;
        }

        const computedCanvasStyle = getComputedStyle(canvas);
        const cssWidth = parseFloat(computedCanvasStyle.width);
        const cssHeight = parseFloat(computedCanvasStyle.height);

        canvas.width = Math.max(50, cssWidth);
        canvas.height = Math.max(50, cssHeight);

        console.log(`Canvas CSS computed: ${cssWidth}x${cssHeight}, Set canvas drawing surface: ${canvas.width}x${canvas.height}`);

        redrawCanvasScoped();
    }


    setupCanvasEvents(canvas, ctx, selectors, appState, setTool, redrawCanvasScoped, updateTransformFormInputs);
    setupToolButtons(selectors, appState, setTool, redrawCanvasScoped);
    setupTransformControls(selectors, appState, redrawCanvasScoped, safeNumber, updateTransformFormInputs, setTool, clearTransformFormInputs);
    setupKeyboardShortcuts(selectors, appState, redrawCanvasScoped, updateTransformFormInputs, clearTransformFormInputs);
    setupMiscUtilities(selectors, canvas, appState, redrawCanvasScoped, clearTransformFormInputs);

    [selectors.inputs.fillColor, selectors.inputs.strokeColor, selectors.inputs.strokeWidth].forEach(input => {
        input.addEventListener('input', redrawCanvasScoped);
    });
    [selectors.inputs.fillColorCheck, selectors.inputs.strokeColorCheck].forEach(input => {
        input.addEventListener('change', redrawCanvasScoped);
    });

    window.addEventListener('resize', resizeCanvas);

    setTimeout(() => {
        resizeCanvas();
        setTool('select');
        const transformFormButton = selectors.transformButtons.form;
        if (transformFormButton) {
            appState.transformMode = 'form';
            selectors.misc.transformFormInputs.style.display = 'block';
            [selectors.transformButtons.mouse, selectors.transformButtons.keyboard].forEach(btn => btn.classList.remove('active'));
            transformFormButton.classList.add('active');
        }
        clearTransformFormInputs(selectors);
        showMessage("Selamat datang! Mode Mouse Transform sekarang mendukung translasi, rotasi, dan skala.", 3500);
        console.log("Initial setup complete."); // DEBUG
    }, 100);

});