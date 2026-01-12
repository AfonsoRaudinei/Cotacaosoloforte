// ==================== STATE ====================
let state = {
    farmData: {
        producer: '',
        farm: '',
        area: '',
        culture: 'soja',
        plantingDate: '',
        grainPrice: '',
        dueDate: ''
    },
    insumos: [],
    consolidation: {
        unitPrices: {}
    },
    settings: {
        defaultGrainPrice: '',
        unitPreference: 'kg',
        liquidUnitPreference: 'L',
        decimalPlaces: 2,
        autoFillArea: true,
        showAreaWarnings: true,
        exportFileName: 'AgriCotacao',
        includeTimelineInPDF: false
    }
};

let insumoIdCounter = 1;

// ==================== FENOLOGY ====================
const fenology = {
    soja: {
        V2: 14,
        V4: 22,
        R1: 45,
        R5: 76
    },
    milho: {
        V4: 14,
        V8: 28,
        VT: 45,
        R1: 55
    }
};

// ==================== DOM ELEMENTS ====================
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const insumosContainer = document.getElementById('insumos-container');
const addInsumoBtn = document.getElementById('add-insumo-btn');
const addInsumoDropdown = document.getElementById('add-insumo-dropdown');
const sidecar = document.getElementById('sidecar');
const sidecarOverlay = document.getElementById('sidecar-overlay');
const closeSidecar = document.getElementById('close-sidecar');
const sidecarTitle = document.getElementById('sidecar-title');
const sidecarBody = document.getElementById('sidecar-body');
const generateTimelineBtn = document.getElementById('generate-timeline-btn');

// ==================== INIT ====================
function init() {
    loadState();
    bindEvents();
    renderFarmData();
    renderInsumos();
}

// ==================== STORAGE ====================
function saveState() {
    try {
        localStorage.setItem('agricotacao-farm', JSON.stringify(state.farmData));
        localStorage.setItem('agricotacao-insumos', JSON.stringify(state.insumos));
        localStorage.setItem('agricotacao-consolidation', JSON.stringify(state.consolidation));
        localStorage.setItem('agricotacao-settings', JSON.stringify(state.settings));
    } catch (e) {
        console.error('Erro ao salvar:', e);
    }
}

function loadState() {
    try {
        const farmData = localStorage.getItem('agricotacao-farm');
        const insumos = localStorage.getItem('agricotacao-insumos');
        const consolidation = localStorage.getItem('agricotacao-consolidation');
        const settings = localStorage.getItem('agricotacao-settings');
        
        if (farmData) {
            state.farmData = { ...state.farmData, ...JSON.parse(farmData) };
        }
        if (insumos) {
            state.insumos = JSON.parse(insumos);
            const maxId = state.insumos.reduce((max, i) => Math.max(max, i.id), 0);
            insumoIdCounter = maxId + 1;
        }
        if (consolidation) {
            state.consolidation = JSON.parse(consolidation);
        }
        if (settings) {
            state.settings = { ...state.settings, ...JSON.parse(settings) };
        }
    } catch (e) {
        console.error('Erro ao carregar:', e);
    }
}

// ==================== EVENT BINDINGS ====================
function bindEvents() {
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    document.getElementById('producer').addEventListener('input', (e) => {
        state.farmData.producer = e.target.value;
        saveState();
    });
    document.getElementById('farm').addEventListener('input', (e) => {
        state.farmData.farm = e.target.value;
        saveState();
    });
    document.getElementById('area').addEventListener('input', (e) => {
        state.farmData.area = sanitizeNumber(e.target.value);
        e.target.value = state.farmData.area;
        saveState();
        updateAllCalculations();
    });
    document.getElementById('culture').addEventListener('change', (e) => {
        state.farmData.culture = e.target.value;
        saveState();
    });
    document.getElementById('planting-date').addEventListener('change', (e) => {
        state.farmData.plantingDate = e.target.value;
        saveState();
    });

    addInsumoBtn.addEventListener('click', () => {
        addInsumoDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!addInsumoBtn.contains(e.target) && !addInsumoDropdown.contains(e.target)) {
            addInsumoDropdown.classList.remove('show');
        }
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            addInsumo(item.dataset.type);
            addInsumoDropdown.classList.remove('show');
        });
    });

    document.getElementById('export-excel-btn').addEventListener('click', exportToExcel);
    document.getElementById('export-pdf-btn').addEventListener('click', exportToPDF);
    document.getElementById('btn-settings').addEventListener('click', openSettingsPanel);
    closeSidecar.addEventListener('click', closeSidecarPanel);
    sidecarOverlay.addEventListener('click', closeSidecarPanel);
    generateTimelineBtn.addEventListener('click', generateTimeline);
}

// ==================== TAB SWITCHING ====================
function switchTab(tabId) {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');

    if (tabId === 'consolidacao') {
        renderConsolidation();
    }
}

// ==================== RENDER FARM DATA ====================
function renderFarmData() {
    document.getElementById('producer').value = state.farmData.producer;
    document.getElementById('farm').value = state.farmData.farm;
    document.getElementById('area').value = state.farmData.area;
    document.getElementById('culture').value = state.farmData.culture;
    document.getElementById('planting-date').value = state.farmData.plantingDate;
}

// ==================== NUMBER SANITIZATION ====================
function sanitizeNumber(value, inputElement) {
    if (value === '' || value === null || value === undefined) {
        if (inputElement) inputElement.classList.remove('invalid');
        return '';
    }

    const strValue = String(value).trim();
    const validPattern = /^[0-9]*\.?[0-9]*$/;
    if (!validPattern.test(strValue)) {
        if (inputElement) inputElement.classList.add('invalid');
        return '';
    }

    const decimalCount = (strValue.match(/\./g) || []).length;
    if (decimalCount > 1) {
        if (inputElement) inputElement.classList.add('invalid');
        return '';
    }

    const parts = strValue.split('.');
    let intPart = parts[0] || '';
    const decPart = parts[1] || '';

    if (intPart.length > 1 && intPart[0] === '0') {
        intPart = intPart.replace(/^0+/, '') || '0';
    }

    if (intPart.length > 7) {
        if (inputElement) inputElement.classList.add('invalid');
        return '';
    }

    let sanitized = intPart;
    if (parts.length > 1) {
        sanitized += '.' + decPart;
    }

    const numValue = parseFloat(sanitized);
    if (isNaN(numValue) || numValue < 0) {
        if (inputElement) inputElement.classList.add('invalid');
        return '';
    }

    if (inputElement) inputElement.classList.remove('invalid');
    return sanitized;
}

function validateNumberInput(input) {
    const value = input.value;
    const sanitized = sanitizeNumber(value, input);
    
    if (sanitized === '' && value !== '') {
        return false;
    }
    
    return true;
}

// ==================== AREA WARNINGS ====================
function checkAreaWarning(productArea, totalArea) {
    if (!state.settings.showAreaWarnings) return false;
    if (!totalArea || totalArea <= 0) return false;
    if (!productArea || productArea <= 0) return false;
    return productArea > totalArea;
}

function checkSumAreaWarning(insumo, totalArea) {
    if (!state.settings.showAreaWarnings) return { exceeded: false, sum: 0 };
    if (!totalArea || totalArea <= 0) return { exceeded: false, sum: 0 };
    
    let sum = 0;
    insumo.products.forEach(product => {
        const area = parseFloat(product.area) || 0;
        sum += area;
    });
    
    return {
        exceeded: sum > totalArea,
        sum: sum
    };
}

function renderAreaWarningIcon(productArea, totalArea) {
    if (checkAreaWarning(productArea, totalArea)) {
        return '<span class="area-warning-icon" title="Área maior que a área total">⚠️</span>';
    }
    return '';
}

function renderSumAreaWarning(insumo, totalArea) {
    const check = checkSumAreaWarning(insumo, totalArea);
    if (check.exceeded) {
        return `
            <div class="area-warning-msg">
                <span class="icon">⚠️</span>
                <span>Soma das áreas (${check.sum.toFixed(0)} ha) excede área total (${totalArea.toFixed(0)} ha)</span>
            </div>
        `;
    }
    return '';
}

function getAreaInputClass(productArea, totalArea) {
    if (checkAreaWarning(productArea, totalArea)) {
        return 'area-warning';
    }
    return '';
}

// ==================== INSUMO MANAGEMENT ====================
function addInsumo(type) {
    const insumo = createInsumoData(type);
    state.insumos.push(insumo);
    saveState();
    renderInsumos();
}

function createInsumoData(type) {
    const base = {
        id: insumoIdCounter++,
        type: type,
        expanded: true,
        products: []
    };

    switch (type) {
        case 'fertilizer':
            // ALTERAÇÃO: Adicionado targetS (Enxofre)
            return { ...base, targetN: '', targetP: '', targetK: '', targetS: '', calcBase: 'P' };
        case 'soy-seed':
        case 'corn-seed':
            return { ...base };
        case 'defensive':
            // ALTERAÇÃO: Adicionado applicationName
            return { ...base, stage: 'V2', applicationName: '' };
        case 'inoculant':
        case 'treatment':
            return { ...base };
    }
    return base;
}

function removeInsumo(id) {
    state.insumos = state.insumos.filter(i => i.id !== id);
    saveState();
    renderInsumos();
}

function toggleInsumo(id) {
    const insumo = state.insumos.find(i => i.id === id);
    if (insumo) {
        insumo.expanded = !insumo.expanded;
        saveState();
        renderInsumos();
    }
}

function updateInsumoField(id, field, value) {
    const insumo = state.insumos.find(i => i.id === id);
    if (insumo) {
        insumo[field] = value;
        saveState();
        if (insumo.type === 'fertilizer') {
            updateFertilizerCalculations(id);
        }
    }
}

// ==================== PRODUCT MANAGEMENT ====================
function addProduct(insumoId) {
    const insumo = state.insumos.find(i => i.id === insumoId);
    if (insumo) {
        const product = createProductData(insumo.type);
        insumo.products.push(product);
        saveState();
        renderInsumos();
        if (insumo.type === 'fertilizer') {
            updateFertilizerCalculations(insumoId);
        }
    }
}

function createProductData(type) {
    const autoArea = state.settings.autoFillArea ? (state.farmData.area || '') : '';
    
    switch (type) {
        case 'fertilizer':
            // ALTERAÇÃO: Adicionado s (Enxofre %)
            return { preset: 'outro', name: '', dose: '', n: '', p: '', k: '', s: '', area: autoArea };
        case 'soy-seed':
            return { name: '', mode: 'plantas', population: '250000', germination: '90', bagSize: '5000000', area: autoArea };
        case 'corn-seed':
            return { name: '', mode: 'plantas', population: '65000', germination: '90', bagSize: '60000', area: autoArea };
        case 'defensive':
            return { name: '', dose: '', unit: 'L', area: autoArea };
        case 'inoculant':
        case 'treatment':
            return { name: '', dose: '', unit: 'L', area: autoArea };
    }
    return { name: '' };
}

const fertilizerPresets = {
    'kcl': { name: 'KCl', n: 0, p: 0, k: 60, s: 0 },
    'outro': null
};

function convertToFinalUnit(value, unit) {
    if (unit === 'g') {
        return { value: value / 1000, unit: 'kg' };
    } else if (unit === 'ml') {
        return { value: value / 1000, unit: 'L' };
    }
    return { value, unit };
}

function removeProduct(insumoId, productIndex) {
    const insumo = state.insumos.find(i => i.id === insumoId);
    if (insumo) {
        insumo.products.splice(productIndex, 1);
        saveState();
        renderInsumos();
        if (insumo.type === 'fertilizer') {
            updateFertilizerCalculations(insumoId);
        }
    }
}

function updateProductField(insumoId, productIndex, field, value) {
    const insumo = state.insumos.find(i => i.id === insumoId);
    if (insumo && insumo.products[productIndex]) {
        insumo.products[productIndex][field] = value;
        saveState();
        if (insumo.type === 'fertilizer') {
            updateFertilizerCalculations(insumoId);
        }
    }
}

// ==================== FERTILIZER CALCULATIONS ====================
function updateFertilizerCalculations(insumoId) {
    const insumo = state.insumos.find(i => i.id === insumoId);
    if (!insumo || insumo.type !== 'fertilizer') return;

    const targetN = parseFloat(insumo.targetN) || 0;
    const targetP = parseFloat(insumo.targetP) || 0;
    const targetK = parseFloat(insumo.targetK) || 0;
    const calcBase = insumo.calcBase || 'P';

    let appliedN = 0, appliedP = 0, appliedK = 0;

    insumo.products.forEach((product, index) => {
        const n = parseFloat(product.n) || 0;
        const p = parseFloat(product.p) || 0;
        const k = parseFloat(product.k) || 0;

        let targetValue = 0;
        let percentValue = 0;

        if (index === 0) {
            switch (calcBase) {
                case 'N':
                    targetValue = targetN - appliedN;
                    percentValue = n;
                    break;
                case 'P':
                    targetValue = targetP - appliedP;
                    percentValue = p;
                    break;
                case 'K':
                    targetValue = targetK - appliedK;
                    percentValue = k;
                    break;
            }
        } else {
            if (k > 0 && (targetK - appliedK) > 0) {
                targetValue = targetK - appliedK;
                percentValue = k;
            } else if (p > 0 && (targetP - appliedP) > 0) {
                targetValue = targetP - appliedP;
                percentValue = p;
            } else if (n > 0 && (targetN - appliedN) > 0) {
                targetValue = targetN - appliedN;
                percentValue = n;
            }
        }

        if (percentValue > 0 && targetValue > 0) {
            const calculatedDose = (100 * targetValue) / percentValue;
            product.dose = calculatedDose.toFixed(2);
        } else if (percentValue === 0) {
            product.dose = '';
        }

        const dose = parseFloat(product.dose) || 0;
        appliedN += (dose * n) / 100;
        appliedP += (dose * p) / 100;
        appliedK += (dose * k) / 100;
    });

    saveState();
    renderInsumos();
}

function recalculateDose(insumoId) {
    const btn = document.querySelector(`[data-refresh-insumo="${insumoId}"]`);
    if (btn) {
        btn.classList.add('calculating');
        setTimeout(() => btn.classList.remove('calculating'), 500);
    }
    updateFertilizerCalculations(insumoId);
}

function calculateNPKSummary(insumo) {
    const targetN = parseFloat(insumo.targetN) || 0;
    const targetP = parseFloat(insumo.targetP) || 0;
    const targetK = parseFloat(insumo.targetK) || 0;
    const targetS = parseFloat(insumo.targetS) || 0; // ALTERAÇÃO: Adicionado S

    let appliedN = 0, appliedP = 0, appliedK = 0, appliedS = 0; // ALTERAÇÃO: Adicionado S

    insumo.products.forEach(product => {
        const dose = parseFloat(product.dose) || 0;
        const n = parseFloat(product.n) || 0;
        const p = parseFloat(product.p) || 0;
        const k = parseFloat(product.k) || 0;
        const s = parseFloat(product.s) || 0; // ALTERAÇÃO: Adicionado S

        appliedN += (dose * n) / 100;
        appliedP += (dose * p) / 100;
        appliedK += (dose * k) / 100;
        appliedS += (dose * s) / 100; // ALTERAÇÃO: Adicionado S
    });

    const missingN = Math.max(0, targetN - appliedN);
    const missingP = Math.max(0, targetP - appliedP);
    const missingK = Math.max(0, targetK - appliedK);
    const missingS = Math.max(0, targetS - appliedS); // ALTERAÇÃO: Adicionado S

    const kclPerHa = missingK / 0.6;
    const area = parseFloat(state.farmData.area) || 0;
    const kclTotal = kclPerHa * area;

    return {
        appliedN: appliedN.toFixed(1),
        appliedP: appliedP.toFixed(1),
        appliedK: appliedK.toFixed(1),
        appliedS: appliedS.toFixed(1), // ALTERAÇÃO: Adicionado S
        targetN: targetN.toFixed(1),
        targetP: targetP.toFixed(1),
        targetK: targetK.toFixed(1),
        targetS: targetS.toFixed(1), // ALTERAÇÃO: Adicionado S
        missingN: missingN.toFixed(1),
        missingP: missingP.toFixed(1),
        missingK: missingK.toFixed(1),
        missingS: missingS.toFixed(1), // ALTERAÇÃO: Adicionado S
        kclPerHa: kclPerHa.toFixed(1),
        kclTotal: kclTotal.toFixed(1)
    };
}

function updateAllCalculations() {
    state.insumos.forEach(insumo => {
        if (insumo.type === 'fertilizer') {
            updateFertilizerCalculations(insumo.id);
        }
    });
}

// ==================== RENDER INSUMOS ====================
function renderInsumos() {
    insumosContainer.innerHTML = state.insumos.map(insumo => renderInsumoCard(insumo)).join('');
    bindInsumoEvents();
}

function renderInsumoCard(insumo) {
    const typeInfo = getInsumoTypeInfo(insumo.type);
    const expandedClass = insumo.expanded ? 'expanded' : '';

    return `
        <div class="insumo-card ${expandedClass}" data-id="${insumo.id}">
            <div class="insumo-header" onclick="toggleInsumo(${insumo.id})">
                <div class="insumo-title">
                    <span>${typeInfo.icon}</span>
                    <span>${typeInfo.name}</span>
                </div>
                <div class="insumo-actions">
                    <button class="btn-icon danger" onclick="event.stopPropagation(); removeInsumo(${insumo.id})" title="Remover">✕</button>
                    <span class="expand-icon">▼</span>
                </div>
            </div>
            <div class="insumo-body">
                ${renderInsumoBody(insumo)}
            </div>
        </div>
    `;
}

function getInsumoTypeInfo(type) {
    const types = {
        'fertilizer': { icon: '🌱', name: 'Fertilizante', category: 'Fertilizante' },
        'soy-seed': { icon: '🌾', name: 'Semente de Soja', category: 'Semente' },
        'corn-seed': { icon: '🌽', name: 'Semente de Milho', category: 'Semente' },
        'defensive': { icon: '🛡️', name: 'Defensivo', category: 'Defensivo' },
        'inoculant': { icon: '🧪', name: 'Inoculante', category: 'Inoculante' },
        'treatment': { icon: '💉', name: 'Tratamento de Sementes', category: 'Tratamento' }
    };
    return types[type] || { icon: '📦', name: 'Insumo', category: 'Outro' };
}

function renderInsumoBody(insumo) {
    switch (insumo.type) {
        case 'fertilizer':
            return renderFertilizerBody(insumo);
        case 'soy-seed':
        case 'corn-seed':
            return renderSeedBody(insumo);
        case 'defensive':
            return renderDefensiveBody(insumo);
        case 'inoculant':
        case 'treatment':
            return renderInoculantBody(insumo);
    }
    return '';
}

function renderFertilizerBody(insumo) {
    const summary = calculateNPKSummary(insumo);
    const calcBase = insumo.calcBase || 'P';
    const area = parseFloat(state.farmData.area) || 0;
    
    // Verifica se cada nutriente atingiu a meta
    const nComplete = parseFloat(summary.appliedN) >= parseFloat(summary.targetN);
    const pComplete = parseFloat(summary.appliedP) >= parseFloat(summary.targetP);
    const kComplete = parseFloat(summary.appliedK) >= parseFloat(summary.targetK);
    const sComplete = parseFloat(summary.appliedS) >= parseFloat(summary.targetS);
    
    return `
        <div class="form-grid form-grid-4">
            <div class="form-group">
                <label>N desejado (kg/ha) ${nComplete ? '✅' : ''}</label>
                <input type="number" value="${insumo.targetN}" 
                       oninput="updateInsumoField(${insumo.id}, 'targetN', sanitizeNumber(this.value))"
                       placeholder="0">
            </div>
            <div class="form-group">
                <label>P₂O₅ desejado (kg/ha) ${pComplete ? '✅' : ''}</label>
                <input type="number" value="${insumo.targetP}" 
                       oninput="updateInsumoField(${insumo.id}, 'targetP', sanitizeNumber(this.value))"
                       placeholder="0">
            </div>
            <div class="form-group">
                <label>K₂O desejado (kg/ha) ${kComplete ? '✅' : ''}</label>
                <input type="number" value="${insumo.targetK}" 
                       oninput="updateInsumoField(${insumo.id}, 'targetK', sanitizeNumber(this.value))"
                       placeholder="0">
            </div>
            <div class="form-group">
                <label>S desejado (kg/ha) ${sComplete ? '✅' : ''}</label>
                <input type="number" value="${insumo.targetS}" 
                       oninput="updateInsumoField(${insumo.id}, 'targetS', sanitizeNumber(this.value))"
                       placeholder="0">
            </div>
        </div>

        <div style="display: inline-flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.85em;">
            <span style="color: var(--text-secondary);">Calcular 1º por:</span>
            <select style="padding: 4px 20px 4px 8px; font-size: 0.85em; min-width: 80px; border: 1px solid var(--border); border-radius: 6px;" onchange="updateInsumoField(${insumo.id}, 'calcBase', this.value); updateFertilizerCalculations(${insumo.id})">
                <option value="N" ${calcBase === 'N' ? 'selected' : ''}>N</option>
                <option value="P" ${calcBase === 'P' ? 'selected' : ''}>P₂O₅</option>
                <option value="K" ${calcBase === 'K' ? 'selected' : ''}>K₂O</option>
            </select>
        </div>

        <div class="products-list" style="margin-top: 8px;">
            ${insumo.products.map((product, index) => renderFertilizerProduct(insumo.id, product, index, area)).join('')}
        </div>
        <button class="btn-add-inline" onclick="addProduct(${insumo.id})">+ Fertilizante</button>
        ${renderSumAreaWarning(insumo, area)}
    `;
}

function renderFertilizerProduct(insumoId, product, index, totalArea) {
    const preset = product.preset || 'outro';
    const isKcl = preset === 'kcl';
    const dose = parseFloat(product.dose) || 0;
    const productArea = parseFloat(product.area) || 0;
    const total = dose * productArea;
    const areaWarningClass = getAreaInputClass(productArea, totalArea);

    return `
        <div class="fertilizer-row">
            <div class="fields">
                <div class="form-group">
                    <label>Tipo</label>
                    <select style="min-width: 80px;" onchange="setFertilizerPreset(${insumoId}, ${index}, this.value)">
                        <option value="outro" ${preset === 'outro' ? 'selected' : ''}>Outro</option>
                        <option value="kcl" ${preset === 'kcl' ? 'selected' : ''}>KCl 60%</option>
                    </select>
                </div>
                ${preset === 'outro' ? `
                    <div class="form-group" style="flex: 2;">
                        <label>Nome</label>
                        <input type="text" value="${product.name}" 
                               onchange="updateProductField(${insumoId}, ${index}, 'name', this.value)"
                               placeholder="Ex: MAP 11-52-00">
                    </div>
                ` : ''}
                <div class="form-group">
                    <label>Área ${renderAreaWarningIcon(productArea, totalArea)}</label>
                    <input type="number" value="${product.area}" 
                           oninput="updateProductField(${insumoId}, ${index}, 'area', sanitizeNumber(this.value, this))"
                           placeholder="${totalArea || '0'}"
                           class="${areaWarningClass}"
                           style="width: 65px;">
                </div>
                <div class="form-group">
                    <label>Dose</label>
                    <div class="dose-field">
                        <input type="number" value="${product.dose}" readonly style="background: var(--bg-tertiary); width: 60px;" placeholder="auto">
                        <button class="btn-refresh" data-refresh-insumo="${insumoId}" onclick="recalculateDose(${insumoId})" title="Recalcular">↻</button>
                    </div>
                </div>
                ${preset === 'outro' ? `
                    <div class="form-group">
                        <label>N%</label>
                        <input type="number" value="${product.n}" 
                               oninput="updateProductField(${insumoId}, ${index}, 'n', sanitizeNumber(this.value, this))"
                               placeholder="0" style="width: 45px;">
                    </div>
                    <div class="form-group">
                        <label>P%</label>
                        <input type="number" value="${product.p}" 
                               oninput="updateProductField(${insumoId}, ${index}, 'p', sanitizeNumber(this.value, this))"
                               placeholder="0" style="width: 45px;">
                    </div>
                    <div class="form-group">
                        <label>K%</label>
                        <input type="number" value="${product.k}" 
                               oninput="updateProductField(${insumoId}, ${index}, 'k', sanitizeNumber(this.value, this))"
                               placeholder="0" style="width: 45px;">
                    </div>
                    <div class="form-group">
                        <label>S%</label>
                        <input type="number" value="${product.s}" 
                               oninput="updateProductField(${insumoId}, ${index}, 's', sanitizeNumber(this.value, this))"
                               placeholder="0" style="width: 45px;">
                    </div>
                ` : `
                    <div class="form-group">
                        <label>K%</label>
                        <input type="number" value="${product.k}" readonly style="background: var(--bg-tertiary); width: 45px;" placeholder="60">
                    </div>
                `}
                ${productArea > 0 && dose > 0 ? `
                    <div class="form-group">
                        <label>Total</label>
                        <div class="total-display">${formatToneladas(total)}</div>
                    </div>
                ` : ''}
            </div>
            <button class="btn-icon danger" style="margin-top: 18px;" onclick="removeProduct(${insumoId}, ${index})" title="Remover">✕</button>
        </div>
    `;
}

function setFertilizerPreset(insumoId, productIndex, presetKey) {
    const insumo = state.insumos.find(i => i.id === insumoId);
    if (!insumo || !insumo.products[productIndex]) return;

    const product = insumo.products[productIndex];
    product.preset = presetKey;

    if (presetKey === 'kcl') {
        product.name = 'KCl';
        product.n = '0';
        product.p = '0';
        product.k = '60';
        product.s = '0';
    } else {
        product.name = '';
        product.n = '';
        product.p = '';
        product.k = '';
        product.s = '';
    }

    saveState();
    updateFertilizerCalculations(insumoId);
}

function formatToneladas(kg) {
    return (kg / 1000).toFixed(3) + ' t';
}

function renderSeedBody(insumo) {
    const isSoy = insumo.type === 'soy-seed';
    const totalArea = parseFloat(state.farmData.area) || 0;

    return `
        <div class="products-list" style="margin-top: 0;">
            ${insumo.products.map((product, index) => {
                const mode = product.mode || 'plantas';
                const population = parseFloat(product.population) || 0;
                const germination = parseFloat(product.germination) || 90;
                const bagSize = parseFloat(product.bagSize) || (isSoy ? 5000000 : 60000);
                const area = parseFloat(product.area) || 0;
                const areaWarningClass = getAreaInputClass(area, totalArea);
                
                let seedsPerHa = 0;
                let haPerBag = 0;
                let totalBags = 0;
                
                if (population > 0) {
                    seedsPerHa = mode === 'plantas' ? population / (germination / 100) : population;
                    haPerBag = bagSize / seedsPerHa;
                    totalBags = area > 0 ? area / haPerBag : 0;
                }

                return `
                    <div class="seed-row">
                        <div class="seed-row-header">
                            <input type="text" value="${product.name}" 
                                   onchange="updateProductField(${insumo.id}, ${index}, 'name', this.value)"
                                   placeholder="${isSoy ? 'Cultivar (ex: TMG 133)' : 'Híbrido (ex: 30F53)'}"
                                   class="seed-name-input">
                            <button class="btn-icon danger" onclick="removeProduct(${insumo.id}, ${index})" title="Remover">✕</button>
                        </div>
                        <div class="seed-fields">
                            <div class="seed-field">
                                <label>Área ${renderAreaWarningIcon(area, totalArea)}</label>
                                <input type="number" value="${product.area}" 
                                       oninput="updateProductField(${insumo.id}, ${index}, 'area', sanitizeNumber(this.value, this))"
                                       placeholder="${totalArea || '0'}"
                                       class="${areaWarningClass}">
                            </div>
                            <div class="seed-field">
                                <label>Modo</label>
                                <select oninput="updateProductField(${insumo.id}, ${index}, 'mode', this.value)">
                                    <option value="plantas" ${mode === 'plantas' ? 'selected' : ''}>Plantas</option>
                                    <option value="sementes" ${mode === 'sementes' ? 'selected' : ''}>Sementes</option>
                                </select>
                            </div>
                            <div class="seed-field">
                                <label>/ha</label>
                                <input type="number" value="${product.population}" 
                                       oninput="updateProductField(${insumo.id}, ${index}, 'population', sanitizeNumber(this.value, this))"
                                       placeholder="${isSoy ? '250000' : '65000'}">
                            </div>
                            ${mode === 'plantas' ? `
                                <div class="seed-field">
                                    <label>Germ%</label>
                                    <input type="number" value="${product.germination}" 
                                           oninput="updateProductField(${insumo.id}, ${index}, 'germination', sanitizeNumber(this.value, this))"
                                           placeholder="90" style="width: 50px;">
                                </div>
                            ` : ''}
                            <div class="seed-field">
                                <label>Emb.</label>
                                <select oninput="updateProductField(${insumo.id}, ${index}, 'bagSize', this.value)">
                                    ${isSoy ? `
                                        <option value="5000000" ${product.bagSize === '5000000' ? 'selected' : ''}>5M</option>
                                        <option value="2500000" ${product.bagSize === '2500000' ? 'selected' : ''}>2.5M</option>
                                        <option value="1000000" ${product.bagSize === '1000000' ? 'selected' : ''}>1M</option>
                                    ` : `
                                        <option value="60000" ${product.bagSize === '60000' ? 'selected' : ''}>60k</option>
                                        <option value="80000" ${product.bagSize === '80000' ? 'selected' : ''}>80k</option>
                                    `}
                                </select>
                            </div>
                            ${population > 0 && area > 0 ? `
                                <div class="seed-field result highlight">
                                    <label>Total</label>
                                    <span class="result-value">${totalBags.toFixed(2)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
        <button class="btn-add-inline" onclick="addProduct(${insumo.id})">+ ${isSoy ? 'Cultivar' : 'Híbrido'}</button>
        ${renderSumAreaWarning(insumo, totalArea)}
    `;
}

function renderDefensiveBody(insumo) {
    const culture = state.farmData.culture;
    const stages = Object.keys(fenology[culture] || fenology.soja);
    const totalArea = parseFloat(state.farmData.area) || 0;

    return `
        <div class="form-grid" style="margin-bottom: 10px;">
            <div class="form-group">
                <label>Estágio</label>
                <select onchange="updateInsumoField(${insumo.id}, 'stage', this.value)">
                    ${stages.map(s => `<option value="${s}" ${insumo.stage === s ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Nome da Aplicação</label>
                <input type="text" value="${insumo.applicationName || ''}" 
                       oninput="updateInsumoField(${insumo.id}, 'applicationName', this.value)"
                       placeholder="Ex: Dessecação, Pós-emergência">
            </div>
        </div>

        <div class="products-list" style="margin-top: 0;">
            ${insumo.products.map((product, index) => {
                const dose = parseFloat(product.dose) || 0;
                const unit = product.unit || 'L';
                const area = parseFloat(product.area) || 0;
                const areaWarningClass = getAreaInputClass(area, totalArea);
                
                let totalValue = dose * area;
                let finalUnit = unit;
                
                if (unit === 'g') {
                    totalValue = totalValue / 1000;
                    finalUnit = 'kg';
                } else if (unit === 'ml') {
                    totalValue = totalValue / 1000;
                    finalUnit = 'L';
                }

                return `
                    <div class="product-row">
                        <div class="product-fields">
                            <div class="field-group" style="flex: 2;">
                                <label>Produto</label>
                                <input type="text" value="${product.name}" 
                                       onchange="updateProductField(${insumo.id}, ${index}, 'name', this.value)"
                                       placeholder="Ex: Glifosato">
                            </div>
                            <div class="field-group">
                                <label>Área ${renderAreaWarningIcon(area, totalArea)}</label>
                                <input type="number" value="${product.area}" 
                                       oninput="updateProductField(${insumo.id}, ${index}, 'area', sanitizeNumber(this.value, this))"
                                       placeholder="${totalArea || '0'}"
                                       class="${areaWarningClass}"
                                       style="width: 70px;">
                            </div>
                            <div class="field-group">
                                <label>Dose/ha</label>
                                <input type="number" value="${product.dose}" 
                                       oninput="updateProductField(${insumo.id}, ${index}, 'dose', sanitizeNumber(this.value, this))"
                                       placeholder="0" style="width: 60px;">
                            </div>
                            <div class="field-group">
                                <label>Unid.</label>
                                <select oninput="updateProductField(${insumo.id}, ${index}, 'unit', this.value)" style="width: 55px;">
                                    <option value="L" ${unit === 'L' ? 'selected' : ''}>L</option>
                                    <option value="ml" ${unit === 'ml' ? 'selected' : ''}>ml</option>
                                    <option value="kg" ${unit === 'kg' ? 'selected' : ''}>kg</option>
                                    <option value="g" ${unit === 'g' ? 'selected' : ''}>g</option>
                                </select>
                            </div>
                            ${dose > 0 && area > 0 ? `
                                <div class="field-group result">
                                    <label>Total</label>
                                    <span class="result-value">${totalValue.toFixed(2)} ${finalUnit}</span>
                                </div>
                            ` : ''}
                        </div>
                        <button class="btn-icon danger" onclick="removeProduct(${insumo.id}, ${index})" title="Remover">✕</button>
                    </div>
                `;
            }).join('')}
        </div>
        <button class="btn-add-inline" onclick="addProduct(${insumo.id})">+ Defensivo</button>
        ${renderSumAreaWarning(insumo, totalArea)}
    `;
}

function renderInoculantBody(insumo) {
    const isInoculant = insumo.type === 'inoculant';
    const label = isInoculant ? 'Inoculante' : 'Tratamento';
    const totalArea = parseFloat(state.farmData.area) || 0;

    return `
        <div class="products-list" style="margin-top: 0;">
            ${insumo.products.map((product, index) => {
                const dose = parseFloat(product.dose) || 0;
                const unit = product.unit || 'L';
                const area = parseFloat(product.area) || 0;
                const areaWarningClass = getAreaInputClass(area, totalArea);
                
                let totalValue = dose * area;
                let finalUnit = unit;
                
                if (unit === 'ml') {
                    totalValue = totalValue / 1000;
                    finalUnit = 'L';
                }

                return `
                    <div class="product-row">
                        <div class="product-fields">
                            <div class="field-group" style="flex: 2;">
                                <label>${label}</label>
                                <input type="text" value="${product.name}" 
                                       onchange="updateProductField(${insumo.id}, ${index}, 'name', this.value)"
                                       placeholder="${isInoculant ? 'Ex: Masterfix' : 'Ex: Standak Top'}">
                            </div>
                            <div class="field-group">
                                <label>Área ${renderAreaWarningIcon(area, totalArea)}</label>
                                <input type="number" value="${product.area}" 
                                       oninput="updateProductField(${insumo.id}, ${index}, 'area', sanitizeNumber(this.value, this))"
                                       placeholder="${totalArea || '0'}"
                                       class="${areaWarningClass}"
                                       style="width: 70px;">
                            </div>
                            <div class="field-group">
                                <label>Dose/ha</label>
                                <input type="number" value="${product.dose}" 
                                       oninput="updateProductField(${insumo.id}, ${index}, 'dose', sanitizeNumber(this.value, this))"
                                       placeholder="0" step="0.01" style="width: 60px;">
                            </div>
                            <div class="field-group">
                                <label>Unid.</label>
                                <select oninput="updateProductField(${insumo.id}, ${index}, 'unit', this.value)" style="width: 55px;">
                                    <option value="L" ${unit === 'L' ? 'selected' : ''}>L</option>
                                    <option value="ml" ${unit === 'ml' ? 'selected' : ''}>ml</option>
                                </select>
                            </div>
                            ${dose > 0 && area > 0 ? `
                                <div class="field-group result">
                                    <label>Total</label>
                                    <span class="result-value">${totalValue.toFixed(2)} ${finalUnit}</span>
                                </div>
                            ` : ''}
                        </div>
                        <button class="btn-icon danger" onclick="removeProduct(${insumo.id}, ${index})" title="Remover">✕</button>
                    </div>
                `;
            }).join('')}
        </div>
        <button class="btn-add-inline" onclick="addProduct(${insumo.id})">+ ${label}</button>
        ${renderSumAreaWarning(insumo, totalArea)}
    `;
}

function bindInsumoEvents() {
    // Events are bound inline in the HTML
}


// ==================== CONSOLIDATION ====================
function renderConsolidation() {
    const consolidationContent = document.getElementById('consolidation-content');
    
    const grouped = {};
    
    state.insumos.forEach(insumo => {
        const typeInfo = getInsumoTypeInfo(insumo.type);
        const category = typeInfo.category;
        
        if (!grouped[category]) {
            grouped[category] = [];
        }
        
        insumo.products.forEach(product => {
            const name = product.name || 'Sem nome';
            const area = parseFloat(product.area) || 0;
            const dose = parseFloat(product.dose) || 0;
            const unit = product.unit || 'kg';
            
            let total = 0;
            let finalUnit = unit;
            
            if (insumo.type === 'fertilizer') {
                total = dose * area;
                finalUnit = 'kg';
            } else if (insumo.type === 'soy-seed' || insumo.type === 'corn-seed') {
                const population = parseFloat(product.population) || 0;
                const germination = parseFloat(product.germination) || 90;
                const bagSize = parseFloat(product.bagSize) || 1;
                const mode = product.mode || 'plantas';
                
                if (population > 0 && bagSize > 0) {
                    const seedsPerHa = mode === 'plantas' ? population / (germination / 100) : population;
                    const haPerBag = bagSize / seedsPerHa;
                    total = area / haPerBag;
                    finalUnit = 'unid';
                }
            } else {
                total = dose * area;
                if (unit === 'g') {
                    total = total / 1000;
                    finalUnit = 'kg';
                } else if (unit === 'ml') {
                    total = total / 1000;
                    finalUnit = 'L';
                }
            }
            
            if (total > 0) {
                const existing = grouped[category].find(item => 
                    item.name === name && item.unit === finalUnit
                );
                
                if (existing) {
                    existing.total += total;
                } else {
                    grouped[category].push({
                        name,
                        total,
                        unit: finalUnit,
                        unitPrice: state.consolidation.unitPrices[name] || ''
                    });
                }
            }
        });
    });
    
    let html = '';
    
    Object.keys(grouped).sort().forEach(category => {
        const items = grouped[category];
        if (items.length === 0) return;
        
        html += `
            <div class="consolidation-category">
                <h3 class="category-title">${category}</h3>
                <div class="consolidation-table">
                    ${items.map(item => {
                        const unitPrice = parseFloat(item.unitPrice) || 0;
                        const totalPrice = unitPrice * item.total;
                        
                        return `
                            <div class="consolidation-row">
                                <div class="row-name">${item.name}</div>
                                <div class="row-quantity">${item.total.toFixed(2)} ${item.unit}</div>
                                <div class="row-price">
                                    <input type="number" 
                                           value="${item.unitPrice}" 
                                           placeholder="R$ /${item.unit}"
                                           oninput="updateUnitPrice('${item.name}', this.value)"
                                           class="price-input">
                                    ${unitPrice > 0 ? `<span class="total-price">R$ ${totalPrice.toFixed(2)}</span>` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    if (html === '') {
        html = '<div class="empty-state">Nenhum insumo cadastrado ainda.</div>';
    }
    
    consolidationContent.innerHTML = html;
}

function updateUnitPrice(productName, value) {
    state.consolidation.unitPrices[productName] = value;
    saveState();
    renderConsolidation();
}

// ==================== TIMELINE ====================
function generateTimeline() {
    const plantingDate = state.farmData.plantingDate;
    if (!plantingDate) {
        alert('Por favor, defina a data de plantio primeiro.');
        return;
    }
    
    const culture = state.farmData.culture;
    const stages = fenology[culture];
    
    const timeline = [];
    const plantDate = new Date(plantingDate + 'T00:00:00');
    
    state.insumos.forEach(insumo => {
        if (insumo.type === 'defensive' && insumo.stage) {
            const daysAfterPlanting = stages[insumo.stage] || 0;
            const applicationDate = new Date(plantDate);
            applicationDate.setDate(applicationDate.getDate() + daysAfterPlanting);
            
            const applicationName = insumo.applicationName || insumo.stage;
            
            insumo.products.forEach(product => {
                if (product.name) {
                    timeline.push({
                        date: applicationDate,
                        stage: insumo.stage,
                        applicationName: applicationName,
                        product: product.name,
                        dose: product.dose,
                        unit: product.unit,
                        area: product.area
                    });
                }
            });
        }
    });
    
    timeline.sort((a, b) => a.date - b.date);
    
    let html = '<h3>Cronograma de Aplicações</h3>';
    
    if (timeline.length === 0) {
        html += '<div class="empty-state">Nenhuma aplicação de defensivo cadastrada.</div>';
    } else {
        html += '<div class="timeline-list">';
        timeline.forEach(item => {
            const dateStr = item.date.toLocaleDateString('pt-BR');
            html += `
                <div class="timeline-item">
                    <div class="timeline-date">${dateStr}</div>
                    <div class="timeline-stage">${item.applicationName}</div>
                    <div class="timeline-product">${item.product}</div>
                    <div class="timeline-dose">${item.dose} ${item.unit}/ha × ${item.area} ha</div>
                </div>
            `;
        });
        html += '</div>';
    }
    
    sidecarTitle.textContent = 'Cronograma';
    sidecarBody.innerHTML = html;
    openSidecarPanel();
}

// ==================== SETTINGS ====================
function openSettingsPanel() {
    sidecarTitle.textContent = 'Configurações';
    sidecarBody.innerHTML = `
        <div class="settings-panel">
            <div class="setting-group">
                <label>
                    <input type="checkbox" ${state.settings.autoFillArea ? 'checked' : ''} 
                           onchange="updateSetting('autoFillArea', this.checked)">
                    Preencher área automaticamente
                </label>
            </div>
            <div class="setting-group">
                <label>
                    <input type="checkbox" ${state.settings.showAreaWarnings ? 'checked' : ''} 
                           onchange="updateSetting('showAreaWarnings', this.checked)">
                    Mostrar avisos de área
                </label>
            </div>
            <div class="setting-group">
                <label>Casas decimais</label>
                <input type="number" min="0" max="4" value="${state.settings.decimalPlaces}" 
                       onchange="updateSetting('decimalPlaces', parseInt(this.value))">
            </div>
            <div class="setting-group">
                <label>Nome padrão do arquivo</label>
                <input type="text" value="${state.settings.exportFileName}" 
                       onchange="updateSetting('exportFileName', this.value)">
            </div>
            <div class="setting-group">
                <button class="btn-danger" onclick="clearAllData()">Limpar todos os dados</button>
            </div>
        </div>
    `;
    openSidecarPanel();
}

function updateSetting(key, value) {
    state.settings[key] = value;
    saveState();
    if (key === 'showAreaWarnings') {
        renderInsumos();
    }
}

function clearAllData() {
    if (confirm('Tem certeza? Todos os dados serão perdidos permanentemente.')) {
        localStorage.clear();
        location.reload();
    }
}

// ==================== SIDECAR ====================
function openSidecarPanel() {
    sidecar.classList.add('open');
    sidecarOverlay.classList.add('visible');
}

function closeSidecarPanel() {
    sidecar.classList.remove('open');
    sidecarOverlay.classList.remove('visible');
}

// ==================== EXPORT EXCEL ====================
function exportToExcel() {
    const wb = XLSX.utils.book_new();
    
    // PLANO DE INSUMOS
    const planData = [
        ['AGROCOTAÇÃO PRO - PLANO DE INSUMOS'],
        ['SOLOFORTE'],
        [],
        ['Produtor:', state.farmData.producer],
        ['Fazenda:', state.farmData.farm],
        ['Área:', state.farmData.area + ' ha'],
        ['Cultura:', state.farmData.culture.toUpperCase()],
        ['Data de Plantio:', state.farmData.plantingDate],
        []
    ];
    
    state.insumos.forEach(insumo => {
        const typeInfo = getInsumoTypeInfo(insumo.type);
        planData.push([typeInfo.category.toUpperCase()]);
        
        if (insumo.type === 'fertilizer') {
            planData.push(['Meta NPK-S:', `N=${insumo.targetN}  P=${insumo.targetP}  K=${insumo.targetK}  S=${insumo.targetS}`]);
            planData.push(['Produto', 'Dose (kg/ha)', 'N%', 'P%', 'K%', 'S%', 'Área (ha)', 'Total (kg)']);
            
            insumo.products.forEach(product => {
                const dose = parseFloat(product.dose) || 0;
                const area = parseFloat(product.area) || 0;
                const total = dose * area;
                planData.push([
                    product.name,
                    dose,
                    product.n,
                    product.p,
                    product.k,
                    product.s,
                    area,
                    total.toFixed(2)
                ]);
            });
            
            const summary = calculateNPKSummary(insumo);
            planData.push([]);
            planData.push(['Aplicado:', `N=${summary.appliedN}  P=${summary.appliedP}  K=${summary.appliedK}  S=${summary.appliedS}`]);
            planData.push(['Faltando:', `N=${summary.missingN}  P=${summary.missingP}  K=${summary.missingK}  S=${summary.missingS}`]);
        } else {
            planData.push(['Produto', 'Dose/ha', 'Unid.', 'Área (ha)', 'Total']);
            
            insumo.products.forEach(product => {
                const dose = parseFloat(product.dose) || 0;
                const area = parseFloat(product.area) || 0;
                const unit = product.unit || 'kg';
                let total = dose * area;
                let finalUnit = unit;
                
                if (unit === 'g') {
                    total = total / 1000;
                    finalUnit = 'kg';
                } else if (unit === 'ml') {
                    total = total / 1000;
                    finalUnit = 'L';
                }
                
                planData.push([
                    product.name,
                    dose,
                    unit,
                    area,
                    `${total.toFixed(2)} ${finalUnit}`
                ]);
            });
        }
        
        planData.push([]);
    });
    
    const wsPlan = XLSX.utils.aoa_to_sheet(planData);
    
    // ALTERAÇÃO: Link SOLOFORTE com hyperlink
    wsPlan['A2'] = { 
        t: 's', 
        v: 'SOLOFORTE',
        l: { Target: 'https://afonsoraudinei.github.io/Cotacaosoloforte/' }
    };
    
    // Larguras de colunas
    wsPlan['!cols'] = [
        { wch: 30 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(wb, wsPlan, 'Plano de Insumos');
    
    // CONSOLIDAÇÃO
    const consolidationData = [
        ['CONSOLIDAÇÃO DE INSUMOS'],
        [],
        ['Produto', 'Quantidade', 'Unidade', 'Preço Unit.', 'Total (R$)']
    ];
    
    const grouped = {};
    state.insumos.forEach(insumo => {
        const typeInfo = getInsumoTypeInfo(insumo.type);
        const category = typeInfo.category;
        
        if (!grouped[category]) grouped[category] = [];
        
        insumo.products.forEach(product => {
            const name = product.name || 'Sem nome';
            const area = parseFloat(product.area) || 0;
            const dose = parseFloat(product.dose) || 0;
            const unit = product.unit || 'kg';
            
            let total = 0;
            let finalUnit = unit;
            
            if (insumo.type === 'fertilizer') {
                total = dose * area;
                finalUnit = 'kg';
            } else {
                total = dose * area;
                if (unit === 'g') {
                    total = total / 1000;
                    finalUnit = 'kg';
                } else if (unit === 'ml') {
                    total = total / 1000;
                    finalUnit = 'L';
                }
            }
            
            if (total > 0) {
                const existing = grouped[category].find(item => 
                    item.name === name && item.unit === finalUnit
                );
                
                if (existing) {
                    existing.total += total;
                } else {
                    grouped[category].push({
                        name,
                        total,
                        unit: finalUnit,
                        unitPrice: state.consolidation.unitPrices[name] || ''
                    });
                }
            }
        });
    });
    
    Object.keys(grouped).sort().forEach(category => {
        consolidationData.push([category]);
        grouped[category].forEach(item => {
            const unitPrice = parseFloat(item.unitPrice) || 0;
            const totalPrice = unitPrice * item.total;
            consolidationData.push([
                item.name,
                item.total.toFixed(2),
                item.unit,
                unitPrice > 0 ? unitPrice.toFixed(2) : '',
                totalPrice > 0 ? totalPrice.toFixed(2) : ''
            ]);
        });
        consolidationData.push([]);
    });
    
    const wsConsolidation = XLSX.utils.aoa_to_sheet(consolidationData);
    wsConsolidation['!cols'] = [
        { wch: 30 },
        { wch: 15 },
        { wch: 10 },
        { wch: 15 },
        { wch: 15 }
    ];
    
    XLSX.utils.book_append_sheet(wb, wsConsolidation, 'Consolidação');
    
    const filename = `${state.settings.exportFileName || 'AgriCotacao'}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, filename);
}

// ==================== EXPORT PDF ====================
function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    let y = 20;
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('AGROCOTAÇÃO PRO', 105, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Produtor: ${state.farmData.producer}`, 20, y);
    y += 6;
    doc.text(`Fazenda: ${state.farmData.farm}`, 20, y);
    y += 6;
    doc.text(`Área: ${state.farmData.area} ha`, 20, y);
    y += 6;
    doc.text(`Cultura: ${state.farmData.culture.toUpperCase()}`, 20, y);
    y += 10;
    
    state.insumos.forEach(insumo => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        const typeInfo = getInsumoTypeInfo(insumo.type);
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text(typeInfo.category.toUpperCase(), 20, y);
        y += 8;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        
        if (insumo.type === 'fertilizer') {
            doc.text(`Meta: N=${insumo.targetN}  P=${insumo.targetP}  K=${insumo.targetK}  S=${insumo.targetS}`, 20, y);
            y += 6;
            
            insumo.products.forEach(product => {
                const dose = parseFloat(product.dose) || 0;
                const area = parseFloat(product.area) || 0;
                const total = dose * area;
                doc.text(`${product.name} - ${dose} kg/ha × ${area} ha = ${total.toFixed(2)} kg`, 25, y);
                y += 5;
            });
            
            const summary = calculateNPKSummary(insumo);
            doc.text(`Aplicado: N=${summary.appliedN}  P=${summary.appliedP}  K=${summary.appliedK}  S=${summary.appliedS}`, 25, y);
            y += 8;
        } else {
            insumo.products.forEach(product => {
                const dose = parseFloat(product.dose) || 0;
                const area = parseFloat(product.area) || 0;
                const unit = product.unit || 'kg';
                let total = dose * area;
                let finalUnit = unit;
                
                if (unit === 'g') {
                    total = total / 1000;
                    finalUnit = 'kg';
                } else if (unit === 'ml') {
                    total = total / 1000;
                    finalUnit = 'L';
                }
                
                doc.text(`${product.name} - ${dose} ${unit}/ha × ${area} ha = ${total.toFixed(2)} ${finalUnit}`, 25, y);
                y += 5;
            });
            y += 3;
        }
    });
    
    const filename = `${state.settings.exportFileName || 'AgriCotacao'}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
}

// ==================== START APP ====================
document.addEventListener('DOMContentLoaded', init);
