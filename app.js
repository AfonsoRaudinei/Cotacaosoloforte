// ==================== STATE ====================
let state = {
    farmData: {
        producer: '',
        farm: '',
        area: '',
        culture: 'soja',
        plantingDate: '',
        dueDate: '',
        grainPrice: ''
    },
    catalog: {
        products: [],
        search: '',
        categoryFilter: ''
    },
    wallet: {
        clients: [],
        search: ''
    },
    insumos: [],
    consolidation: {
        unitPrices: {},
        quantities: {}
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

const soyPhenologyData = [
    { code: 'VE', fullName: 'Emergencia', description: 'Plantula rompe o solo', day: 0, phase: 'vegetative', info: { diseases: ['Tombamento de plantulas', 'Podridoes de raiz e colo', 'Patogenos transmitidos via semente'], pests: ['Coros', 'Larvas de Diabrotica', 'Lesmas e caracois', 'Cupins'], nutrients: ['Fase inicial - foco em qualidade da semente'] } },
    { code: 'VC', fullName: 'Cotiledones', description: 'Cotiledones abertos', day: 3, phase: 'vegetative', info: { diseases: ['Protecao inicial contra tombamento'], pests: ['Monitoramento preventivo de solo'], nutrients: ['Inicio da absorcao radicular'] } },
    { code: 'V1', fullName: '1a Folha', description: '1a folha trifoliolada', day: 8, phase: 'vegetative', info: { diseases: ['Fase inicial de desenvolvimento'], pests: ['Monitoramento preventivo'], nutrients: ['Crescimento vegetativo inicial'] } },
    { code: 'V2', fullName: '2a Folha', description: '2a folha trifoliolada', day: 16, phase: 'vegetative', info: { diseases: ['Crestamento Bacteriano (5,0%)'], pests: ['Tripes comecam a aparecer'], nutrients: ['Absorcao ainda moderada'] } },
    { code: 'V4', fullName: '4a Folha', description: '4a folha trifoliolada', day: 20, phase: 'vegetative', info: { diseases: ['Mildio (15,0%)', 'Crestamento Bacteriano (12,0%)', 'Pustula Bacteriana (4,0%)'], pests: ['Aumento de tripes e lagartas'], nutrients: ['CRITICO: Primeira explosao de demanda (N:9%, P:13%, Ca:16%, Mg:15%)'] } },
    { code: 'R1', fullName: 'Inicio do Florescimento', description: '1 flor visivel', day: 25, phase: 'flowering', info: { diseases: ['Mildio (25,0% - pico)', 'Crestamento Bacteriano (15,0%)', 'Oidio (20,25%)'], pests: ['Tripes (56/m2)', 'Lagartas (15,2/m2)', 'Mosca-branca (32/m2 - pico)'], nutrients: ['CRITICO: 50-60% dos nutrientes ja absorvidos (Ca:62%, Fe:57%, N:54%, B:47%)'] } },
    { code: 'R2', fullName: 'Flor Aberta', description: 'Flor aberta no terco superior da planta', day: 62, phase: 'flowering', info: { diseases: ['Mildio (20,0%)', 'Pustula Bacteriana (15,0%)', 'Mofo Branco (12,0%)'], pests: ['Tripes (43/m2)', 'Lagartas (25,8/m2)', 'Percevejos (0,46/m2)'], nutrients: ['Monitoramento intensivo - risco de Fe, K, Mg'] } },
    { code: 'R4', fullName: 'Vagem de 5mm', description: 'Vagem de 5mm em um dos 4 primeiros nos', day: 72, phase: 'podding', info: { diseases: ['Ferrugem Asiatica (65,0%)', 'Mofo Branco (45,0%)', 'Mancha Parda (8,0%)'], pests: ['Lagartas (49,86/m2 - pico absoluto)', 'Percevejos (8,5/m2)', '95% do consumo foliar ocorre aqui'], nutrients: ['Ultima chance para correcoes foliares - Cu e Ni criticos'] } },
    { code: 'R5.1', fullName: 'Enchimento de Graos', description: 'Inicio do enchimento de graos', day: 85, phase: 'grain', info: { diseases: ['Ferrugem Asiatica (85,0%)', 'Oidio (73,75%)', 'Mancha Parda (20,0%)'], pests: ['Lagartas (42,3/m2)', 'Percevejos (12,7/m2 - crescimento rapido)'], nutrients: ['CRITICO: 90-99% absorvido (Fe:99%, B:94%, Ca:99%)'] } },
    { code: 'R6', fullName: 'Graos Formados', description: 'Graos totalmente formados', day: 95, phase: 'grain', info: { diseases: ['Ferrugem Asiatica (95,0% - pico)', 'Mancha Parda (45,0%)', 'Cercospora (55,0%)'], pests: ['Lagartas (28,7/m2)', 'Percevejos (16,2/m2 - ascensao forte)'], nutrients: ['Fim da absorcao radicular - apenas redistribuicao interna'] } },
    { code: 'R7', fullName: 'Inicio da Maturacao', description: 'Primeira vagem madura', day: 105, phase: 'maturity', info: { diseases: ['Macrophomina (75,0%)', 'Mancha Parda (70,0%)', 'Cercospora (60,0%)'], pests: ['Percevejos (10,5/m2)', 'Declinio geral de pragas foliares'], nutrients: ['Translocacao final - foco em qualidade dos graos'] } },
    { code: 'R8', fullName: 'Maturacao Plena', description: '95% das vagens maduras', day: 110, phase: 'maturity', info: { diseases: ['Macrophomina (85,0%)', 'Mancha Parda (85,0%)', 'Oidio (98,75% - pico)'], pests: ['Percevejos (12,1/m2)', 'Todas as pragas em declinio natural'], nutrients: ['Translocacao de nutrientes para graos - acompanhamento apenas'] } },
    { code: 'R9', fullName: 'Colheita', description: 'Ponto de colheita', day: 115, phase: 'maturity', info: { diseases: ['Macrophomina em residuos', 'Cercospora em folhas secas', 'Mancha Parda em residuos', 'Fusarium e Phomopsis nas materias secas', 'Aspergillus e Penicillium em graos armazenados'], pests: ['Percevejos remanescentes', 'Larvas de Sitophilus e Zabrotes em armazenamento', 'Tribolium e coleopteros de armazenamento'], nutrients: ['Importancia do manejo: regulagem da colheitadeira, enterrar residuos, rotacao de culturas, limpeza de maquinas e armazenamento correto'] } }
];

const WALLET_SEED_VERSION = 'wallet-seed-cotacao-cpt-v2';
const PRODUCT_SEED_VERSION = 'product-seed-cotacao-cpt-v1';
const PRODUCT_SEED_FILE = './.tmp_products_seed.json';
const WALLET_SEED_FILE = './.tmp_wallet_seed.json';
const walletSeedClients = [
    { producer: 'Adriano Cassol Izoton', consultant: 'Raudinei', consultantPrivate: '', city: 'Brejinho de Nazare', state: 'TO', phone: '(63)-9 8474-9743', email: '', farm: 'Sem Nome', hectareSoy: '815', hectareCorn: '' },
    { producer: 'Adriano Gomes', consultant: 'Raudinei', consultantPrivate: '', city: 'Pugmil', state: 'TO', phone: '', email: '', farm: 'Santa helena', hectareSoy: '100', hectareCorn: '' },
    { producer: 'Adriel Pasqualli', consultant: 'Raudinei', consultantPrivate: '', city: 'Brejinho de Nazare', state: 'TO', phone: '(82)-9 8474-9743', email: '', farm: 'Fazenda Sao Domingos', hectareSoy: '1800', hectareCorn: '' },
    { producer: 'Alan Ferreira Borges', consultant: 'Raudinei Afonso', consultantPrivate: 'sim, nao lemnro o nom', city: 'Crixas do tocantins', state: 'TO', phone: '', email: '', farm: 'Crixas', hectareSoy: '2000', hectareCorn: '1000' },
    { producer: 'Alceu', consultant: 'Raudinei', consultantPrivate: '', city: 'Pium', state: 'TO', phone: '', email: '', farm: '', hectareSoy: '250', hectareCorn: '' },
    { producer: 'Alessandro - Nidelira', consultant: 'Raudinei', consultantPrivate: '', city: 'Brejinho de Nazare', state: 'TO', phone: '', email: '', farm: 'Fazenda', hectareSoy: '540', hectareCorn: '' },
    { producer: 'Alexandro Denizete Izebe', consultant: 'Raudinei', consultantPrivate: '', city: 'Santa Rita', state: 'TO', phone: '(64)-9 8474-9743', email: '', farm: 'Vaca Morta', hectareSoy: '1400', hectareCorn: '' },
    { producer: 'Alexandro Fonseca (revenda)', consultant: 'Rodrigo', consultantPrivate: '', city: 'Santa Rita', state: 'TO', phone: '(65)-9 8474-9743', email: '', farm: 'Santa Maria', hectareSoy: '1600', hectareCorn: '' },
    { producer: 'Alonso Gomes', consultant: 'Raudinei', consultantPrivate: '', city: 'Pugmil', state: 'TO', phone: '', email: '', farm: 'Pugmil', hectareSoy: '', hectareCorn: '' },
    { producer: 'Anderson Marques', consultant: 'Rafael Gurupi', consultantPrivate: '', city: 'Crixas', state: 'TO', phone: '(66)-9 8474-9743', email: '', farm: 'Agro Barreirinha', hectareSoy: '1200', hectareCorn: '' },
    { producer: 'Andre Braganholo', consultant: 'Jaelson', consultantPrivate: '', city: 'Santa Rita', state: 'TO', phone: '(67)-9 8474-9743', email: '', farm: 'Jardim', hectareSoy: '240', hectareCorn: '' },
    { producer: 'Andre Humberto de Oliveira', consultant: 'Raudinei', consultantPrivate: '', city: 'Fatima', state: 'TO', phone: '(68)-9 8474-9743', email: '', farm: 'Nossa Senhora Da Abadia', hectareSoy: '500', hectareCorn: '' },
    { producer: 'Andre Siqueira', consultant: '', consultantPrivate: '', city: 'Porto Nacional', state: 'TO', phone: '', email: '', farm: 'Fazenda Moema', hectareSoy: '640', hectareCorn: '' },
    { producer: 'ANDREIAS MILLA', consultant: 'Raudinei', consultantPrivate: '', city: 'Santa Rita', state: 'TO', phone: '', email: '', farm: '', hectareSoy: '740', hectareCorn: '' },
    { producer: 'Angelo Fernandes', consultant: 'Raudinei', consultantPrivate: '', city: 'Fatima', state: 'TO', phone: '(69)-9 8474-9743', email: '', farm: 'Nossa Senhora de Fatima', hectareSoy: '500', hectareCorn: '' }
];

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
const consolidationFarmData = document.getElementById('consolidation-farm-data');
const phenologyDataContent = document.getElementById('phenology-data-content');
const catalogContent = document.getElementById('catalog-content');
const catalogProductsDatalist = document.getElementById('catalog-products');
const walletContent = document.getElementById('wallet-content');

// ==================== INIT ====================
function init() {
    loadState();
    ensureWalletSeedFromFile();
    ensureSeedCatalogProducts();
    bindEvents();
    renderFarmData();
    renderInsumos();
}

// ==================== STORAGE ====================
function saveState() {
    try {
        localStorage.setItem('agricotacao-farm', JSON.stringify(state.farmData));
        localStorage.setItem('agricotacao-catalog', JSON.stringify(state.catalog));
        localStorage.setItem('agricotacao-wallet', JSON.stringify(state.wallet));
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
        const catalog = localStorage.getItem('agricotacao-catalog');
        const wallet = localStorage.getItem('agricotacao-wallet');
        const insumos = localStorage.getItem('agricotacao-insumos');
        const consolidation = localStorage.getItem('agricotacao-consolidation');
        const settings = localStorage.getItem('agricotacao-settings');
        
        if (farmData) {
            state.farmData = { ...state.farmData, ...JSON.parse(farmData) };
        }
        if (catalog) {
            state.catalog = { ...state.catalog, ...JSON.parse(catalog) };
        }
        if (wallet) {
            state.wallet = { ...state.wallet, ...JSON.parse(wallet) };
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

function ensureSeedWalletClients() {
    try {
        const seedApplied = localStorage.getItem(WALLET_SEED_VERSION);
        if (seedApplied === '1') return;

        if (!Array.isArray(state.wallet.clients)) {
            state.wallet.clients = [];
        }

        const existingKeys = new Set(
            state.wallet.clients.map(client => `${(client.producer || '').toLowerCase()}::${(client.farm || '').toLowerCase()}`)
        );

        walletSeedClients.forEach(client => {
            const key = `${client.producer.toLowerCase()}::${(client.farm || '').toLowerCase()}`;
            if (existingKeys.has(key)) return;

            const id = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
                ? globalThis.crypto.randomUUID()
                : String(Date.now() + Math.random());

            state.wallet.clients.push({
                id,
                producer: client.producer,
                consultant: client.consultant,
                consultantPrivate: client.consultantPrivate,
                city: client.city,
                state: client.state,
                phone: client.phone,
                email: client.email,
                farm: client.farm,
                hectareSoy: client.hectareSoy,
                hectareCorn: client.hectareCorn
            });
            existingKeys.add(key);
        });

        saveState();
        localStorage.setItem(WALLET_SEED_VERSION, '1');
    } catch (e) {
        console.error('Erro ao aplicar seed da carteira:', e);
    }
}

async function ensureWalletSeedFromFile() {
    try {
        const seedApplied = localStorage.getItem(WALLET_SEED_VERSION);
        if (seedApplied === '1') return;

        if (!Array.isArray(state.wallet.clients)) {
            state.wallet.clients = [];
        }

        const response = await fetch(WALLET_SEED_FILE, { cache: 'no-store' });
        if (!response.ok) {
            ensureSeedWalletClients();
            return;
        }

        const imported = await response.json();
        if (!Array.isArray(imported) || !imported.length) {
            ensureSeedWalletClients();
            return;
        }

        const existingKeys = new Set(
            state.wallet.clients.map(client => `${(client.producer || '').toLowerCase()}::${(client.farm || '').toLowerCase()}`)
        );

        imported.forEach(client => {
            const producer = normalizeCatalogName(client?.producer);
            if (!producer) return;

            const farm = normalizeCatalogName(client?.farm);
            const key = `${producer.toLowerCase()}::${farm.toLowerCase()}`;
            if (existingKeys.has(key)) return;

            const id = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
                ? globalThis.crypto.randomUUID()
                : String(Date.now() + Math.random());

            state.wallet.clients.push({
                id,
                producer,
                consultant: normalizeCatalogName(client?.consultant),
                consultantPrivate: normalizeCatalogName(client?.consultantPrivate),
                city: normalizeCatalogName(client?.city),
                state: normalizeCatalogName(client?.state).toUpperCase(),
                phone: normalizeCatalogName(client?.phone),
                email: normalizeCatalogName(client?.email),
                farm,
                hectareSoy: normalizeHa(client?.hectareSoy),
                hectareCorn: normalizeHa(client?.hectareCorn)
            });
            existingKeys.add(key);
        });

        saveState();
        localStorage.setItem(WALLET_SEED_VERSION, '1');

        const activeTab = document.querySelector('.tab-content.active')?.id;
        if (activeTab === 'carteira') {
            renderWallet();
        }
    } catch (e) {
        console.error('Erro ao aplicar seed da carteira por arquivo:', e);
        ensureSeedWalletClients();
    }
}

async function ensureSeedCatalogProducts() {
    try {
        const seedApplied = localStorage.getItem(PRODUCT_SEED_VERSION);
        if (seedApplied === '1') return;

        if (!Array.isArray(state.catalog.products)) {
            state.catalog.products = [];
        }

        const response = await fetch(PRODUCT_SEED_FILE, { cache: 'no-store' });
        if (!response.ok) return;

        const imported = await response.json();
        if (!Array.isArray(imported) || !imported.length) return;

        ensureCatalogIds();
        const existingKeys = new Set(
            state.catalog.products.map(product =>
                `${normalizeCatalogName(product.name).toLowerCase()}::${normalizeCatalogCategory(product.category).toLowerCase()}`
            )
        );

        imported.forEach(item => {
            const name = normalizeCatalogName(item?.name);
            const category = normalizeCatalogCategory(item?.category);
            if (!name) return;

            const key = `${name.toLowerCase()}::${category.toLowerCase()}`;
            if (existingKeys.has(key)) return;

            const id = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
                ? globalThis.crypto.randomUUID()
                : String(Date.now() + Math.random());

            state.catalog.products.push({
                id,
                name,
                category,
                unit: ''
            });
            existingKeys.add(key);
        });

        saveState();
        localStorage.setItem(PRODUCT_SEED_VERSION, '1');
        renderCatalogDatalist();

        const activeTab = document.querySelector('.tab-content.active')?.id;
        if (activeTab === 'produtos') {
            renderCatalog();
        }
    } catch (e) {
        console.error('Erro ao aplicar seed de produtos:', e);
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
        renderConsolidationFarmData();
        renderPhenologyDataTab();
        renderInsumos();
    });
    document.getElementById('due-date').addEventListener('change', (e) => {
        state.farmData.dueDate = e.target.value;
        saveState();
    });
    document.getElementById('grain-price').addEventListener('input', (e) => {
        state.farmData.grainPrice = sanitizeNumber(e.target.value);
        e.target.value = state.farmData.grainPrice;
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

    if (tabId === 'dados') {
        renderPhenologyDataTab();
    }
    if (tabId === 'produtos') {
        renderCatalog();
        renderCatalogDatalist();
    }
    if (tabId === 'carteira') {
        renderWallet();
    }
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
    document.getElementById('due-date').value = state.farmData.dueDate || '';
    document.getElementById('grain-price').value = state.farmData.grainPrice || '';
    renderConsolidationFarmData();
    renderPhenologyDataTab();
    renderWallet();
}

function getPhenologyDataset() {
    if (state.farmData.culture === 'soja') {
        return soyPhenologyData;
    }
    return [];
}

function getPhenologyStage(stageCode) {
    return getPhenologyDataset().find(stage => stage.code === stageCode) || null;
}

function getPhenologyPhaseColors(phase = 'vegetative') {
    const palette = {
        vegetative: { start: '#5DBB63', end: '#2F8F46' },
        flowering: { start: '#F5B54C', end: '#D88411' },
        podding: { start: '#E57C52', end: '#BC4B27' },
        grain: { start: '#9C71D9', end: '#6740B5' },
        maturity: { start: '#58A3E3', end: '#2A6FB4' }
    };
    return palette[phase] || palette.vegetative;
}

function buildStageImageDataUri(stage) {
    const colors = getPhenologyPhaseColors(stage?.phase);
    const label = stage?.code || '?';
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
            <defs>
                <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="${colors.start}" />
                    <stop offset="100%" stop-color="${colors.end}" />
                </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="56" fill="url(#bg)" />
            <circle cx="60" cy="60" r="47" fill="rgba(255,255,255,0.16)" />
            <path d="M43 77c6-17 18-27 37-31-2 16-10 30-24 36-4 2-9 2-13 1 0-2 0-4 0-6Z" fill="rgba(255,255,255,0.35)"/>
            <path d="M78 42c-11 4-18 11-21 22" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="3" stroke-linecap="round"/>
            <text x="60" y="70" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#ffffff">${label}</text>
        </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeStageCodeForAsset(stageCode) {
    if (!stageCode) return '';
    return String(stageCode).trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getStageAssetPath(stageCode) {
    const normalized = normalizeStageCodeForAsset(stageCode);
    if (!normalized) return null;
    // User will add real images to GitHub; keep a stable convention and fallback to SVG if missing.
    if (state?.farmData?.culture === 'soja') {
        return `assets/phenology/soja_${normalized}.png`;
    }
    return null;
}

function renderStageImage(stageCode, className = 'stage-thumb-image') {
    const stage = getPhenologyStage(stageCode);
    const stageFallback = stage || { code: stageCode || '?', fullName: stageCode || '?', phase: 'vegetative' };
    const fallbackSrc = buildStageImageDataUri(stageFallback).replace(/'/g, '%27');
    const alt = stage ? `${stage.code} - ${stage.fullName}` : `Estadio ${stageCode || ''}`.trim();
    const assetPath = getStageAssetPath(stageCode);

    if (assetPath) {
        return `<img src="${assetPath}" alt="${alt}" class="${className}" onerror="this.onerror=null; this.src='${fallbackSrc}'">`;
    }

    return `<img src="${fallbackSrc}" alt="${alt}" class="${className}">`;
}

function renderPhenologyDetailSections(stage) {
    if (!stage) return '';

    return `
        <div class="stage-detail-sections">
            <div class="stage-detail-section">
                <h4>Doencas Principais</h4>
                <ul>${stage.info.diseases.map(item => `<li>${item}</li>`).join('')}</ul>
            </div>
            <div class="stage-detail-section">
                <h4>Pragas</h4>
                <ul>${stage.info.pests.map(item => `<li>${item}</li>`).join('')}</ul>
            </div>
            <div class="stage-detail-section">
                <h4>Nutricao</h4>
                <ul>${stage.info.nutrients.map(item => `<li>${item}</li>`).join('')}</ul>
            </div>
        </div>
    `;
}

function renderPhenologyDataTab() {
    if (!phenologyDataContent) return;

    const stages = getPhenologyDataset();
    if (!stages.length) {
        phenologyDataContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌿</div>
                <div class="empty-state-text">Dados fenologicos disponiveis apenas para soja.</div>
            </div>
        `;
        return;
    }

    phenologyDataContent.innerHTML = `
        <div class="phenology-grid">
            ${stages.map(stage => `
                <article class="phenology-data-card ${stage.phase}">
                    <div class="phenology-data-head">
                        <div class="phenology-data-image">${renderStageImage(stage.code, 'phenology-data-image-tag')}</div>
                        <div>
                            <h3>${stage.code} - ${stage.fullName}</h3>
                            <p>${stage.description} | Dia ${stage.day}</p>
                        </div>
                    </div>
                    ${renderPhenologyDetailSections(stage)}
                </article>
            `).join('')}
        </div>
    `;
}

function getCatalogProducts() {
    const products = Array.isArray(state.catalog?.products) ? state.catalog.products : [];
    return products.filter(p => p && typeof p.name === 'string' && p.name.trim().length > 0);
}

function normalizeCatalogName(name) {
    return String(name || '').trim();
}

function ensureCatalogIds() {
    if (!state.catalog || !Array.isArray(state.catalog.products)) return;

    const makeId = () => (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
        ? globalThis.crypto.randomUUID()
        : String(Date.now() + Math.random());

    let changed = false;
    state.catalog.products = state.catalog.products.map(product => {
        if (!product || typeof product !== 'object') return product;
        if (product.id) return product;
        changed = true;
        return { ...product, id: makeId() };
    });

    if (changed) {
        saveState();
    }
}

function renderCatalogDatalist() {
    if (!catalogProductsDatalist) return;

    const names = Array.from(new Set(getCatalogProducts().map(p => p.name).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
    catalogProductsDatalist.innerHTML = names.map(name => `<option value="${escapeHtml(name)}"></option>`).join('');
}

function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function renderCatalog() {
    if (!catalogContent) return;

    ensureCatalogIds();

    const searchValue = state.catalog?.search || '';
    const categoryFilter = state.catalog?.categoryFilter || '';
    const allProducts = getCatalogProducts();
    const categoryOptions = Array.from(new Set(allProducts.map(p => normalizeCatalogCategory(p.category || '')).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const products = getCatalogProducts()
        .filter(p => {
            if (!searchValue) return true;
            const query = searchValue.toLowerCase();
            return (p.name || '').toLowerCase().includes(query) || (p.category || '').toLowerCase().includes(query);
        })
        .filter(p => !categoryFilter || normalizeCatalogCategory(p.category || '') === categoryFilter)
        .sort((a, b) => (a.name || '').localeCompare((b.name || ''), 'pt-BR'));

    catalogContent.innerHTML = `
        <div class="catalog-toolbar">
            <div class="catalog-search">
                <input type="text" placeholder="Buscar produto..." value="${escapeHtml(searchValue)}"
                       oninput="updateCatalogSearch(this.value)">
            </div>
            <div class="catalog-search category-filter">
                <select onchange="updateCatalogCategoryFilter(this.value)">
                    <option value="">Todas as categorias</option>
                    ${categoryOptions.map(option => `
                        <option value="${escapeHtml(option)}" ${categoryFilter === option ? 'selected' : ''}>${escapeHtml(formatCatalogCategoryLabel(option))}</option>
                    `).join('')}
                </select>
            </div>
            <div class="catalog-actions">
                <button class="btn btn-secondary btn-sm" onclick="openCatalogImport()">Importar</button>
                <button class="btn btn-primary btn-sm" onclick="openCatalogEditor()">+ Produto</button>
            </div>
        </div>

        ${products.length ? `
            <div class="catalog-table-wrapper">
                <table class="catalog-table">
                    <thead>
                        <tr>
                            <th>Categoria</th>
                            <th>Nome</th>
                            <th>Unid.</th>
                            <th style="text-align: right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${products.map(p => `
                            <tr>
                                <td>${escapeHtml(p.category || '-')}</td>
                                <td style="font-weight: 600;">${escapeHtml(p.name)}</td>
                                <td>${escapeHtml(p.unit || '-')}</td>
                                <td style="text-align: right;">
                                    <button class="btn-icon" onclick="openCatalogEditor('${p.id}')" title="Editar">✎</button>
                                    <button class="btn-icon danger" onclick="deleteCatalogProduct('${p.id}')" title="Excluir">✕</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        ` : `
            <div class="empty-state" style="padding: 24px 10px;">
                <div class="empty-state-icon">🧾</div>
                <div class="empty-state-text">Nenhum produto cadastrado. Clique em "+ Produto".</div>
            </div>
        `}
    `;
}

function updateCatalogSearch(value) {
    state.catalog.search = value;
    saveState();
    renderCatalog();
}

function updateCatalogCategoryFilter(value) {
    state.catalog.categoryFilter = value;
    saveState();
    renderCatalog();
}

function formatCatalogCategoryLabel(category) {
    const labels = {
        fertilizante: 'Fertilizante',
        semente: 'Semente',
        herbicida: 'Herbicida',
        fungicida: 'Fungicida',
        inseticida: 'Inseticida',
        adjuvante: 'Adjuvante',
        nutricao: 'Nutrição',
        biologico: 'Biológico',
        defensivo: 'Defensivo',
        inoculante: 'Inoculante',
        tratamento: 'Tratamento',
        outro: 'Outro'
    };
    return labels[category] || category;
}

function normalizeCatalogCategory(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return 'outro';

    if (raw.includes('fert')) return 'fertilizante';
    if (raw.includes('semen')) return 'semente';
    if (raw.includes('milho') || raw.includes('soja')) return 'semente';
    if (raw.includes('herb')) return 'herbicida';
    if (raw.includes('fung')) return 'fungicida';
    if (raw.includes('inset')) return 'inseticida';
    if (raw.includes('adju')) return 'adjuvante';
    if (raw.includes('nutri')) return 'nutricao';
    if (raw.includes('biolo')) return 'biologico';
    if (raw.includes('def')) return 'defensivo';
    if (raw.includes('inoc')) return 'inoculante';
    if (raw.includes('trat')) return 'tratamento';
    return 'outro';
}

function normalizeCatalogUnit(value) {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const lower = raw.toLowerCase();
    if (lower === 'l') return 'L';
    if (lower === 'ml') return 'ml';
    if (lower === 'kg') return 'kg';
    if (lower === 'g') return 'g';
    if (lower === 't') return 't';
    if (lower === 'sc') return 'sc';
    if (lower === 'bag' || lower === 'saco' || lower === 'saca') return 'bag';
    return raw;
}

function splitDelimitedLine(line, delimiter) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i += 1) {
        const char = line[i];
        const next = line[i + 1];

        if (char === '"') {
            if (inQuotes && next === '"') {
                current += '"';
                i += 1;
            } else {
                inQuotes = !inQuotes;
            }
            continue;
        }

        if (char === delimiter && !inQuotes) {
            values.push(current.trim());
            current = '';
            continue;
        }

        current += char;
    }

    values.push(current.trim());
    return values;
}

function parseCatalogImportText(text) {
    const lines = String(text || '')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);

    if (!lines.length) return [];

    const delimiter = lines.some(line => line.includes('\t'))
        ? '\t'
        : (lines.some(line => line.includes(';')) ? ';' : ',');

    const rows = lines.map(line => splitDelimitedLine(line, delimiter));
    const firstRow = rows[0].map(cell => cell.toLowerCase());
    const hasHeader = firstRow.some(cell =>
        cell.includes('categoria') ||
        cell.includes('produto') ||
        cell.includes('nome') ||
        cell.includes('unid')
    );

    const dataRows = hasHeader ? rows.slice(1) : rows;
    const headerMap = hasHeader ? {
        category: firstRow.findIndex(cell => cell.includes('categoria') || cell.includes('grupo') || cell.includes('tipo')),
        name: firstRow.findIndex(cell => cell.includes('produto') || cell.includes('nome')),
        unit: firstRow.findIndex(cell => cell.includes('unid'))
    } : { category: 0, name: 1, unit: 2 };

    return dataRows
        .map(row => {
            const category = normalizeCatalogCategory(row[headerMap.category] || '');
            const name = normalizeCatalogName(row[headerMap.name] || row[0] || '');
            const unit = normalizeCatalogUnit(row[headerMap.unit] || '');

            if (!name) return null;
            return { category, name, unit };
        })
        .filter(Boolean);
}

function openCatalogImport() {
    sidecarTitle.textContent = 'Importar Produtos';
    sidecarBody.innerHTML = `
        <div class="settings-panel">
            <div class="setting-group">
                <label>Colar planilha</label>
                <textarea id="catalog-import-text" rows="14" placeholder="Cole aqui linhas copiadas do Excel ou CSV.\n\nFormatos aceitos:\nCategoria[TAB]Nome[TAB]Unidade\nou\nNome[TAB]Categoria[TAB]Unidade"></textarea>
            </div>
            <div class="setting-group" style="display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="importCatalogFromText()">Importar</button>
                <button class="btn btn-secondary" onclick="closeSidecarPanel()">Cancelar</button>
            </div>
        </div>
    `;

    openSidecarPanel();
}

function importCatalogFromText() {
    const text = document.getElementById('catalog-import-text')?.value || '';
    const imported = parseCatalogImportText(text);

    if (!imported.length) {
        alert('Nenhum produto valido encontrado para importar.');
        return;
    }

    ensureCatalogIds();
    const existing = getCatalogProducts();
    const seen = new Set(existing.map(p => `${(p.category || '').toLowerCase()}::${(p.name || '').toLowerCase()}`));

    imported.forEach(item => {
        const key = `${item.category.toLowerCase()}::${item.name.toLowerCase()}`;
        if (seen.has(key)) return;

        const id = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
            ? globalThis.crypto.randomUUID()
            : String(Date.now() + Math.random());

        state.catalog.products.push({
            id,
            category: item.category,
            name: item.name,
            unit: item.unit
        });
        seen.add(key);
    });

    saveState();
    closeSidecarPanel();
    renderCatalog();
    renderCatalogDatalist();
}

function openCatalogEditor(productId = null) {
    ensureCatalogIds();

    const editing = productId ? getCatalogProducts().find(p => p.id === productId) : null;
    const title = editing ? 'Editar Produto' : 'Novo Produto';

    const category = editing?.category || 'defensivo';
    const name = editing?.name || '';
    const unit = editing?.unit || 'L';

    sidecarTitle.textContent = title;
    sidecarBody.innerHTML = `
        <div class="settings-panel">
            <div class="setting-group">
                <label>Categoria</label>
                <select id="catalog-edit-category">
                    <option value="fertilizante" ${category === 'fertilizante' ? 'selected' : ''}>Fertilizante</option>
                    <option value="semente" ${category === 'semente' ? 'selected' : ''}>Semente</option>
                    <option value="herbicida" ${category === 'herbicida' ? 'selected' : ''}>Herbicida</option>
                    <option value="fungicida" ${category === 'fungicida' ? 'selected' : ''}>Fungicida</option>
                    <option value="inseticida" ${category === 'inseticida' ? 'selected' : ''}>Inseticida</option>
                    <option value="adjuvante" ${category === 'adjuvante' ? 'selected' : ''}>Adjuvante</option>
                    <option value="nutricao" ${category === 'nutricao' ? 'selected' : ''}>Nutrição</option>
                    <option value="biologico" ${category === 'biologico' ? 'selected' : ''}>Biológico</option>
                    <option value="defensivo" ${category === 'defensivo' ? 'selected' : ''}>Defensivo</option>
                    <option value="inoculante" ${category === 'inoculante' ? 'selected' : ''}>Inoculante</option>
                    <option value="tratamento" ${category === 'tratamento' ? 'selected' : ''}>Tratamento</option>
                    <option value="outro" ${category === 'outro' ? 'selected' : ''}>Outro</option>
                </select>
            </div>
            <div class="setting-group">
                <label>Nome</label>
                <input id="catalog-edit-name" type="text" value="${escapeHtml(name)}" placeholder="Ex: Glifosato">
            </div>
            <div class="setting-group">
                <label>Unidade padrao</label>
                <select id="catalog-edit-unit">
                    <option value="L" ${unit === 'L' ? 'selected' : ''}>L</option>
                    <option value="ml" ${unit === 'ml' ? 'selected' : ''}>ml</option>
                    <option value="kg" ${unit === 'kg' ? 'selected' : ''}>kg</option>
                    <option value="g" ${unit === 'g' ? 'selected' : ''}>g</option>
                    <option value="t" ${unit === 't' ? 'selected' : ''}>t</option>
                    <option value="sc" ${unit === 'sc' ? 'selected' : ''}>sc</option>
                    <option value="bag" ${unit === 'bag' ? 'selected' : ''}>bag</option>
                </select>
            </div>
            <div class="setting-group" style="display: flex; gap: 10px;">
                <button class="btn btn-primary" onclick="saveCatalogProduct(${editing ? `'${editing.id}'` : 'null'})">Salvar</button>
                <button class="btn btn-secondary" onclick="closeSidecarPanel()">Cancelar</button>
            </div>
        </div>
    `;

    openSidecarPanel();
}

function saveCatalogProduct(productId) {
    const categoryEl = document.getElementById('catalog-edit-category');
    const nameEl = document.getElementById('catalog-edit-name');
    const unitEl = document.getElementById('catalog-edit-unit');

    const name = normalizeCatalogName(nameEl?.value);
    if (!name) {
        alert('Informe o nome do produto.');
        return;
    }

    const category = categoryEl?.value || 'outro';
    const unit = unitEl?.value || '';

    ensureCatalogIds();
    const products = getCatalogProducts();

    const existsSame = products.some(p => p.id !== productId && (p.name || '').toLowerCase() === name.toLowerCase() && (p.category || '') === category);
    if (existsSame) {
        alert('Ja existe um produto com esse nome e categoria.');
        return;
    }

    if (!Array.isArray(state.catalog.products)) state.catalog.products = [];

    if (productId) {
        state.catalog.products = state.catalog.products.map(p => (p?.id === productId ? { ...p, name, category, unit } : p));
    } else {
        const id = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
            ? globalThis.crypto.randomUUID()
            : String(Date.now() + Math.random());
        state.catalog.products.push({
            id,
            name,
            category,
            unit
        });
    }

    saveState();
    closeSidecarPanel();
    renderCatalog();
    renderCatalogDatalist();
}

function deleteCatalogProduct(productId) {
    if (!productId) return;

    const confirmed = window.confirm('Excluir este produto do catalogo?');
    if (!confirmed) return;

    state.catalog.products = getCatalogProducts().filter(p => p.id !== productId);
    saveState();
    renderCatalog();
    renderCatalogDatalist();
}

function getWalletClients() {
    const clients = Array.isArray(state.wallet?.clients) ? state.wallet.clients : [];
    return clients.filter(c => c && typeof c.producer === 'string' && c.producer.trim().length > 0);
}

function normalizeHa(value) {
    const str = String(value || '').trim().toLowerCase();
    if (!str) return '';
    const cleaned = str.replaceAll('ha', '').replaceAll(' ', '').replaceAll('.', '').replaceAll(',', '.');
    const parsed = parseFloat(cleaned);
    if (Number.isNaN(parsed)) return '';
    return String(parsed);
}

function formatHa(value) {
    const num = parseFloat(value);
    if (Number.isNaN(num) || num <= 0) return '-';
    return `${formatConsolidationNumber(num, 2)} ha`;
}

function ensureWalletIds() {
    if (!state.wallet || !Array.isArray(state.wallet.clients)) return;

    const makeId = () => (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
        ? globalThis.crypto.randomUUID()
        : String(Date.now() + Math.random());

    let changed = false;
    state.wallet.clients = state.wallet.clients.map(client => {
        if (!client || typeof client !== 'object') return client;
        if (client.id) return client;
        changed = true;
        return { ...client, id: makeId() };
    });

    if (changed) saveState();
}

function renderWallet() {
    if (!walletContent) return;

    ensureWalletIds();
    const query = (state.wallet?.search || '').trim().toLowerCase();
    const clients = getWalletClients()
        .filter(c => {
            if (!query) return true;
            const haystack = [
                c.producer, c.consultant, c.consultantPrivate, c.city, c.state,
                c.phone, c.email, c.farm
            ].join(' ').toLowerCase();
            return haystack.includes(query);
        })
        .sort((a, b) => (a.producer || '').localeCompare((b.producer || ''), 'pt-BR'));

    const totals = clients.reduce(
        (acc, c) => {
            const soy = parseFloat(c.hectareSoy) || 0;
            const corn = parseFloat(c.hectareCorn) || 0;
            acc.soy += soy;
            acc.corn += corn;
            return acc;
        },
        { soy: 0, corn: 0 }
    );

    walletContent.innerHTML = `
        <div class="catalog-toolbar">
            <div class="catalog-search">
                <input type="text" placeholder="Buscar produtor/fazenda/cidade..." value="${escapeHtml(state.wallet?.search || '')}"
                       oninput="updateWalletSearch(this.value)">
            </div>
            <div class="catalog-actions">
                <button class="btn btn-secondary btn-sm" onclick="openWalletImport()">Importar</button>
                <button class="btn btn-primary btn-sm" onclick="openWalletEditor()">+ Registro</button>
            </div>
        </div>

        ${clients.length ? `
            <div class="catalog-table-wrapper">
                <table class="catalog-table wallet-table">
                    <thead>
                        <tr>
                            <th>Produtor</th>
                            <th>Consultor</th>
                            <th>Cidade</th>
                            <th>UF</th>
                            <th>Telefone</th>
                            <th>E-mail</th>
                            <th>Fazenda</th>
                            <th style="text-align:right;">Hectare soja</th>
                            <th style="text-align:right;">Hectare milho</th>
                            <th style="text-align:right;">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clients.map(c => `
                            <tr>
                                <td style="font-weight:600;">${escapeHtml(c.producer)}</td>
                                <td>${escapeHtml(c.consultant || '-')}${c.consultantPrivate ? `<div class="subtle">Part.: ${escapeHtml(c.consultantPrivate)}</div>` : ''}</td>
                                <td>${escapeHtml(c.city || '-')}</td>
                                <td>${escapeHtml(c.state || '-')}</td>
                                <td>${escapeHtml(c.phone || '-')}</td>
                                <td>${escapeHtml(c.email || '-')}</td>
                                <td>${escapeHtml(c.farm || '-')}</td>
                                <td style="text-align:right; font-variant-numeric: tabular-nums;">${formatHa(c.hectareSoy)}</td>
                                <td style="text-align:right; font-variant-numeric: tabular-nums;">${formatHa(c.hectareCorn)}</td>
                                <td style="text-align:right;">
                                    <button class="btn-icon" onclick="openWalletEditor('${c.id}')" title="Editar">✎</button>
                                    <button class="btn-icon danger" onclick="deleteWalletClient('${c.id}')" title="Excluir">✕</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="7" style="text-align:right; font-weight:600;">Total (filtro atual):</td>
                            <td style="text-align:right; font-weight:600;">${formatHa(String(totals.soy))}</td>
                            <td style="text-align:right; font-weight:600;">${formatHa(String(totals.corn))}</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        ` : `
            <div class="empty-state" style="padding: 24px 10px;">
                <div class="empty-state-icon">💼</div>
                <div class="empty-state-text">Nenhum registro na carteira. Use "Importar" ou "+ Registro".</div>
            </div>
        `}
    `;
}

function updateWalletSearch(value) {
    state.wallet.search = value;
    saveState();
    renderWallet();
}

function openWalletEditor(clientId = null) {
    ensureWalletIds();
    const existing = clientId ? getWalletClients().find(c => c.id === clientId) : null;

    const initial = existing || {
        id: null,
        producer: '',
        consultant: '',
        consultantPrivate: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        farm: '',
        hectareSoy: '',
        hectareCorn: ''
    };

    sidecarTitle.textContent = existing ? 'Editar Carteira' : 'Novo Registro';
    sidecarBody.innerHTML = `
        <div class="settings-panel">
            <div class="form-grid">
                <div class="form-group">
                    <label>Produtor</label>
                    <input id="wallet-producer" type="text" value="${escapeHtml(initial.producer)}" placeholder="Nome do produtor">
                </div>
                <div class="form-group">
                    <label>Consultor</label>
                    <input id="wallet-consultant" type="text" value="${escapeHtml(initial.consultant)}" placeholder="Consultor">
                </div>
                <div class="form-group">
                    <label>Consultor particular</label>
                    <input id="wallet-consultant-private" type="text" value="${escapeHtml(initial.consultantPrivate)}" placeholder="Opcional">
                </div>
                <div class="form-group">
                    <label>Cidade</label>
                    <input id="wallet-city" type="text" value="${escapeHtml(initial.city)}" placeholder="Cidade">
                </div>
                <div class="form-group">
                    <label>Estado (UF)</label>
                    <input id="wallet-state" type="text" value="${escapeHtml(initial.state)}" placeholder="TO" maxlength="2">
                </div>
                <div class="form-group">
                    <label>Telefone</label>
                    <input id="wallet-phone" type="text" value="${escapeHtml(initial.phone)}" placeholder="(xx) xxxxx-xxxx">
                </div>
                <div class="form-group">
                    <label>E-mail</label>
                    <input id="wallet-email" type="text" value="${escapeHtml(initial.email)}" placeholder="email@exemplo.com">
                </div>
                <div class="form-group">
                    <label>Fazenda</label>
                    <input id="wallet-farm" type="text" value="${escapeHtml(initial.farm)}" placeholder="Nome da fazenda">
                </div>
                <div class="form-group">
                    <label>Hectare soja</label>
                    <input id="wallet-soy" type="text" value="${escapeHtml(initial.hectareSoy)}" placeholder="0 ha">
                </div>
                <div class="form-group">
                    <label>Hectare milho</label>
                    <input id="wallet-corn" type="text" value="${escapeHtml(initial.hectareCorn)}" placeholder="0 ha">
                </div>
            </div>

            <div class="setting-group" style="display:flex; gap: 10px; margin-top: 12px;">
                <button class="btn btn-primary" onclick="saveWalletClient(${existing ? `'${existing.id}'` : 'null'})">Salvar</button>
                <button class="btn btn-secondary" onclick="closeSidecarPanel()">Cancelar</button>
            </div>
        </div>
    `;
    openSidecarPanel();
}

function saveWalletClient(clientId) {
    const producer = normalizeCatalogName(document.getElementById('wallet-producer')?.value);
    if (!producer) {
        alert('Informe o produtor.');
        return;
    }

    const consultant = normalizeCatalogName(document.getElementById('wallet-consultant')?.value);
    const consultantPrivate = normalizeCatalogName(document.getElementById('wallet-consultant-private')?.value);
    const city = normalizeCatalogName(document.getElementById('wallet-city')?.value);
    const stateUf = normalizeCatalogName(document.getElementById('wallet-state')?.value).toUpperCase();
    const phone = normalizeCatalogName(document.getElementById('wallet-phone')?.value);
    const email = normalizeCatalogName(document.getElementById('wallet-email')?.value);
    const farm = normalizeCatalogName(document.getElementById('wallet-farm')?.value);
    const hectareSoy = normalizeHa(document.getElementById('wallet-soy')?.value);
    const hectareCorn = normalizeHa(document.getElementById('wallet-corn')?.value);

    ensureWalletIds();
    if (!Array.isArray(state.wallet.clients)) state.wallet.clients = [];

    if (clientId) {
        state.wallet.clients = state.wallet.clients.map(c => (c?.id === clientId ? {
            ...c,
            producer,
            consultant,
            consultantPrivate,
            city,
            state: stateUf,
            phone,
            email,
            farm,
            hectareSoy,
            hectareCorn
        } : c));
    } else {
        const id = (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
            ? globalThis.crypto.randomUUID()
            : String(Date.now() + Math.random());
        state.wallet.clients.push({
            id,
            producer,
            consultant,
            consultantPrivate,
            city,
            state: stateUf,
            phone,
            email,
            farm,
            hectareSoy,
            hectareCorn
        });
    }

    saveState();
    closeSidecarPanel();
    renderWallet();
}

function deleteWalletClient(clientId) {
    if (!clientId) return;
    const confirmed = window.confirm('Excluir este registro da carteira?');
    if (!confirmed) return;

    state.wallet.clients = getWalletClients().filter(c => c.id !== clientId);
    saveState();
    renderWallet();
}

function openWalletImport() {
    sidecarTitle.textContent = 'Importar Carteira';
    sidecarBody.innerHTML = `
        <div class="settings-panel">
            <div class="setting-group">
                <p style="color: var(--text-secondary); font-size: 0.9em;">
                    Cole aqui linhas copiadas do Excel (recomendado) ou CSV. Colunas esperadas (nesta ordem):
                    Produtor, Consultor, Consultor particular, Cidade, Estado, Telefone, E-mail, Fazenda, Hectare soja, Hectare milho.
                </p>
            </div>
            <div class="setting-group">
                <textarea id="wallet-import-text" rows="10" style="width: 100%; padding: 10px; border-radius: 8px; border: 1px solid var(--border); font-family: inherit;"
                    placeholder="Cole aqui..."></textarea>
            </div>
            <div class="setting-group" style="display:flex; gap: 10px;">
                <button class="btn btn-primary" onclick="importWalletFromText()">Importar</button>
                <button class="btn btn-secondary" onclick="closeSidecarPanel()">Cancelar</button>
            </div>
        </div>
    `;
    openSidecarPanel();
}

function splitRowByDelimiter(line) {
    if (line.includes('\\t')) return line.split('\\t');
    if (line.includes(';')) return line.split(';');
    return line.split(',');
}

function importWalletFromText() {
    const text = document.getElementById('wallet-import-text')?.value || '';
    const lines = text.split(/\\r?\\n/).map(l => l.trim()).filter(Boolean);
    if (!lines.length) {
        alert('Nada para importar.');
        return;
    }

    const parsed = lines.map(line => splitRowByDelimiter(line).map(cell => String(cell || '').trim()));
    const looksLikeHeader = parsed[0].some(cell => cell.toLowerCase().includes('produtor') || cell.toLowerCase().includes('consultor'));
    const rows = looksLikeHeader ? parsed.slice(1) : parsed;

    const toClient = (cols) => {
        const producer = normalizeCatalogName(cols[0]);
        if (!producer) return null;
        return {
            id: (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function')
                ? globalThis.crypto.randomUUID()
                : String(Date.now() + Math.random()),
            producer,
            consultant: normalizeCatalogName(cols[1]),
            consultantPrivate: normalizeCatalogName(cols[2]),
            city: normalizeCatalogName(cols[3]),
            state: normalizeCatalogName(cols[4]).toUpperCase(),
            phone: normalizeCatalogName(cols[5]),
            email: normalizeCatalogName(cols[6]),
            farm: normalizeCatalogName(cols[7]),
            hectareSoy: normalizeHa(cols[8]),
            hectareCorn: normalizeHa(cols[9])
        };
    };

    const imported = rows.map(toClient).filter(Boolean);
    if (!imported.length) {
        alert('Nenhuma linha valida encontrada.');
        return;
    }

    if (!Array.isArray(state.wallet.clients)) state.wallet.clients = [];
    state.wallet.clients.push(...imported);
    saveState();
    closeSidecarPanel();
    renderWallet();
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

function shouldValidateSummedArea(insumo) {
    return insumo?.type === 'soy-seed' || insumo?.type === 'corn-seed';
}

function captureInsumoFocus() {
    const activeElement = document.activeElement;

    if (!activeElement || !insumosContainer.contains(activeElement)) {
        return null;
    }

    const focusKey = activeElement.dataset.focusKey;
    if (!focusKey) {
        return null;
    }

    const snapshot = { focusKey };

    if (typeof activeElement.selectionStart === 'number' && typeof activeElement.selectionEnd === 'number') {
        snapshot.selectionStart = activeElement.selectionStart;
        snapshot.selectionEnd = activeElement.selectionEnd;
    }

    return snapshot;
}

function restoreInsumoFocus(snapshot) {
    if (!snapshot?.focusKey) {
        return;
    }

    requestAnimationFrame(() => {
        const target = insumosContainer.querySelector(`[data-focus-key="${snapshot.focusKey}"]`);
        if (!target) {
            return;
        }

        target.focus();

        if (
            typeof snapshot.selectionStart === 'number' &&
            typeof snapshot.selectionEnd === 'number' &&
            typeof target.setSelectionRange === 'function'
        ) {
            const valueLength = target.value?.length || 0;
            const selectionStart = Math.min(snapshot.selectionStart, valueLength);
            const selectionEnd = Math.min(snapshot.selectionEnd, valueLength);
            target.setSelectionRange(selectionStart, selectionEnd);
        }
    });
}

// ==================== AREA WARNINGS ====================
function checkAreaWarning(productArea, totalArea) {
    if (!state.settings.showAreaWarnings) return false;
    if (!totalArea || totalArea <= 0) return false;
    if (!productArea || productArea <= 0) return false;
    return productArea > totalArea;
}

function checkSumAreaWarning(insumo, totalArea) {
    if (!shouldValidateSummedArea(insumo)) return { exceeded: false, sum: 0 };
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

function clearPlanning() {
    const confirmed = window.confirm(
        'Isso vai limpar todo o planejamento atual.\n\nSerão removidos:\n- dados da propriedade\n- todos os insumos cadastrados\n- valores unitários informados na consolidação\n\nAs configurações do sistema serão mantidas.\n\nDeseja continuar?'
    );

    if (!confirmed) return;

    state.farmData = {
        producer: '',
        farm: '',
        area: '',
        culture: 'soja',
        plantingDate: '',
        dueDate: '',
        grainPrice: ''
    };
    state.insumos = [];
    state.consolidation = {
        unitPrices: {},
        quantities: {}
    };

    saveState();
    renderFarmData();
    renderInsumos();
    renderConsolidation();
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

function updateFertilizerDraftField(id, field, value) {
    const insumo = state.insumos.find(i => i.id === id);
    if (!insumo || insumo.type !== 'fertilizer') return;

    insumo[field] = value;
    saveState();
}

function commitFertilizerField(id, field, value) {
    updateFertilizerDraftField(id, field, value);
    updateFertilizerCalculations(id);
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
            return;
        }

        renderInsumos();
    }
}

function updateFertilizerProductDraftField(insumoId, productIndex, field, value) {
    const insumo = state.insumos.find(i => i.id === insumoId);
    if (!insumo || insumo.type !== 'fertilizer' || !insumo.products[productIndex]) return;

    insumo.products[productIndex][field] = value;
    saveState();
}

function commitFertilizerProductField(insumoId, productIndex, field, value) {
    updateFertilizerProductDraftField(insumoId, productIndex, field, value);
    updateFertilizerCalculations(insumoId);
}

// ==================== FERTILIZER CALCULATIONS ====================
function updateFertilizerCalculations(insumoId, options = {}) {
    const insumo = state.insumos.find(i => i.id === insumoId);
    if (!insumo || insumo.type !== 'fertilizer') return;
    const { render = true } = options;

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
    if (render) {
        renderInsumos();
    }
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
            updateFertilizerCalculations(insumo.id, { render: false });
        }
    });

    renderInsumos();
}

// ==================== RENDER INSUMOS ====================
function renderInsumos() {
    const focusSnapshot = captureInsumoFocus();
    insumosContainer.innerHTML = state.insumos.map(insumo => renderInsumoCard(insumo)).join('');
    bindInsumoEvents();
    restoreInsumoFocus(focusSnapshot);
}

function shouldShowInsumoAvatar(insumoType) {
    return ['fertilizer', 'soy-seed', 'corn-seed', 'defensive'].includes(insumoType);
}

function getInsumoAvatarFallbackLabel(insumo) {
    if (!insumo) return 'IMG';
    if (insumo.type === 'defensive') return insumo.stage || 'V2';
    if (insumo.type === 'soy-seed' || insumo.type === 'corn-seed') return 'VE';
    return 'IMG';
}

function renderInsumoAvatar(insumo) {
    if (!shouldShowInsumoAvatar(insumo.type)) return '';

    const stageCode = getInsumoStageCode(insumo);
    const fallbackLabel = getInsumoAvatarFallbackLabel(insumo);

    return `
        <div class="insumo-avatar" aria-hidden="true">
            <div class="item-image-circle">
                ${stageCode ? renderStageImage(stageCode) : `<span class="item-image-fallback">${fallbackLabel}</span>`}
            </div>
        </div>
    `;
}

function renderInsumoCard(insumo) {
    const typeInfo = getInsumoTypeInfo(insumo.type);
    const expandedClass = insumo.expanded ? 'expanded' : '';
    const hasAvatarClass = shouldShowInsumoAvatar(insumo.type) ? 'has-avatar' : '';

    return `
        <div class="insumo-card ${expandedClass} ${hasAvatarClass}" data-id="${insumo.id}">
            ${renderInsumoAvatar(insumo)}
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
                <label>N desejado (kg/ha)</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="number" value="${insumo.targetN}" 
                           data-focus-key="insumo-${insumo.id}-targetN"
                           oninput="updateFertilizerDraftField(${insumo.id}, 'targetN', sanitizeNumber(this.value))"
                           onchange="commitFertilizerField(${insumo.id}, 'targetN', sanitizeNumber(this.value))"
                           placeholder="0" style="flex: 1;">
                    ${nComplete ? '<span style="color: #34C759; font-size: 1.2em;">✅</span>' : ''}
                </div>
            </div>
            <div class="form-group">
                <label>P₂O₅ desejado (kg/ha)</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="number" value="${insumo.targetP}" 
                           data-focus-key="insumo-${insumo.id}-targetP"
                           oninput="updateFertilizerDraftField(${insumo.id}, 'targetP', sanitizeNumber(this.value))"
                           onchange="commitFertilizerField(${insumo.id}, 'targetP', sanitizeNumber(this.value))"
                           placeholder="0" style="flex: 1;">
                    ${pComplete ? '<span style="color: #34C759; font-size: 1.2em;">✅</span>' : ''}
                </div>
            </div>
            <div class="form-group">
                <label>K₂O desejado (kg/ha)</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="number" value="${insumo.targetK}" 
                           data-focus-key="insumo-${insumo.id}-targetK"
                           oninput="updateFertilizerDraftField(${insumo.id}, 'targetK', sanitizeNumber(this.value))"
                           onchange="commitFertilizerField(${insumo.id}, 'targetK', sanitizeNumber(this.value))"
                           placeholder="0" style="flex: 1;">
                    ${kComplete ? '<span style="color: #34C759; font-size: 1.2em;">✅</span>' : ''}
                </div>
            </div>
            <div class="form-group">
                <label>S desejado (kg/ha)</label>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <input type="number" value="${insumo.targetS}" 
                           data-focus-key="insumo-${insumo.id}-targetS"
                           oninput="updateFertilizerDraftField(${insumo.id}, 'targetS', sanitizeNumber(this.value))"
                           onchange="commitFertilizerField(${insumo.id}, 'targetS', sanitizeNumber(this.value))"
                           placeholder="0" style="flex: 1;">
                    ${sComplete ? '<span style="color: #34C759; font-size: 1.2em;">✅</span>' : ''}
                </div>
            </div>
        </div>

        <div style="display: inline-flex; align-items: center; gap: 8px; margin: 12px 0; font-size: 0.85em;">
            <span style="color: var(--text-secondary);">Calcular 1º por:</span>
            <select data-focus-key="insumo-${insumo.id}-calcBase" style="padding: 4px 20px 4px 8px; font-size: 0.85em; min-width: 80px; border: 1px solid var(--border); border-radius: 6px;" onchange="updateInsumoField(${insumo.id}, 'calcBase', this.value); updateFertilizerCalculations(${insumo.id})">
                <option value="N" ${calcBase === 'N' ? 'selected' : ''}>N</option>
                <option value="P" ${calcBase === 'P' ? 'selected' : ''}>P₂O₅</option>
                <option value="K" ${calcBase === 'K' ? 'selected' : ''}>K₂O</option>
            </select>
        </div>

        <div class="products-list" style="margin-top: 8px;">
            ${insumo.products.map((product, index) => renderFertilizerProduct(insumo.id, product, index, area)).join('')}
        </div>
        <button class="btn-add-inline" onclick="addProduct(${insumo.id})">+ Fertilizante</button>
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
                    <select data-focus-key="insumo-${insumoId}-product-${index}-preset" style="min-width: 80px;" onchange="setFertilizerPreset(${insumoId}, ${index}, this.value)">
                        <option value="outro" ${preset === 'outro' ? 'selected' : ''}>Outro</option>
                        <option value="kcl" ${preset === 'kcl' ? 'selected' : ''}>KCl 60%</option>
                    </select>
                </div>
                ${preset === 'outro' ? `
                    <div class="form-group" style="flex: 2;">
                        <label>Nome</label>
                        <input type="text" value="${product.name}" 
                               data-focus-key="insumo-${insumoId}-product-${index}-name"
                               list="catalog-products"
                               onchange="updateProductField(${insumoId}, ${index}, 'name', this.value)"
                               placeholder="Ex: MAP 11-52-00">
                    </div>
                ` : ''}
                <div class="form-group">
                    <label>Área ${renderAreaWarningIcon(productArea, totalArea)}</label>
                    <input type="number" value="${product.area}" 
                           data-focus-key="insumo-${insumoId}-product-${index}-area"
                           oninput="updateFertilizerProductDraftField(${insumoId}, ${index}, 'area', sanitizeNumber(this.value, this))"
                           onchange="commitFertilizerProductField(${insumoId}, ${index}, 'area', sanitizeNumber(this.value, this))"
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
                               data-focus-key="insumo-${insumoId}-product-${index}-n"
                               oninput="updateFertilizerProductDraftField(${insumoId}, ${index}, 'n', sanitizeNumber(this.value, this))"
                               onchange="commitFertilizerProductField(${insumoId}, ${index}, 'n', sanitizeNumber(this.value, this))"
                               placeholder="0" style="width: 45px;">
                    </div>
                    <div class="form-group">
                        <label>P%</label>
                        <input type="number" value="${product.p}" 
                               data-focus-key="insumo-${insumoId}-product-${index}-p"
                               oninput="updateFertilizerProductDraftField(${insumoId}, ${index}, 'p', sanitizeNumber(this.value, this))"
                               onchange="commitFertilizerProductField(${insumoId}, ${index}, 'p', sanitizeNumber(this.value, this))"
                               placeholder="0" style="width: 45px;">
                    </div>
                    <div class="form-group">
                        <label>K%</label>
                        <input type="number" value="${product.k}" 
                               data-focus-key="insumo-${insumoId}-product-${index}-k"
                               oninput="updateFertilizerProductDraftField(${insumoId}, ${index}, 'k', sanitizeNumber(this.value, this))"
                               onchange="commitFertilizerProductField(${insumoId}, ${index}, 'k', sanitizeNumber(this.value, this))"
                               placeholder="0" style="width: 45px;">
                    </div>
                    <div class="form-group">
                        <label>S%</label>
                        <input type="number" value="${product.s}" 
                               data-focus-key="insumo-${insumoId}-product-${index}-s"
                               oninput="updateFertilizerProductDraftField(${insumoId}, ${index}, 's', sanitizeNumber(this.value, this))"
                               onchange="commitFertilizerProductField(${insumoId}, ${index}, 's', sanitizeNumber(this.value, this))"
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
                        <div class="seed-row-content">
                            <div class="seed-row-header">
                                <input type="text" value="${product.name}" 
                                       data-focus-key="insumo-${insumo.id}-product-${index}-name"
                                       list="catalog-products"
                                       onchange="updateProductField(${insumo.id}, ${index}, 'name', this.value)"
                                       placeholder="${isSoy ? 'Cultivar (ex: TMG 133)' : 'Híbrido (ex: 30F53)'}"
                                       class="seed-name-input">
                                <button class="btn-icon danger" onclick="removeProduct(${insumo.id}, ${index})" title="Remover">✕</button>
                            </div>
                            <div class="seed-fields">
                                <div class="seed-field">
                                    <label>Área ${renderAreaWarningIcon(area, totalArea)}</label>
                                    <input type="number" value="${product.area}" 
                                           data-focus-key="insumo-${insumo.id}-product-${index}-area"
                                           oninput="updateProductField(${insumo.id}, ${index}, 'area', sanitizeNumber(this.value, this))"
                                           placeholder="${totalArea || '0'}"
                                           class="${areaWarningClass}">
                                </div>
                                <div class="seed-field">
                                    <label>Modo</label>
                                    <select data-focus-key="insumo-${insumo.id}-product-${index}-mode" onchange="updateProductField(${insumo.id}, ${index}, 'mode', this.value)">
                                        <option value="plantas" ${mode === 'plantas' ? 'selected' : ''}>Plantas</option>
                                        <option value="sementes" ${mode === 'sementes' ? 'selected' : ''}>Sementes</option>
                                    </select>
                                </div>
                                <div class="seed-field">
                                    <label>/ha</label>
                                    <input type="number" value="${product.population}" 
                                           data-focus-key="insumo-${insumo.id}-product-${index}-population"
                                           oninput="updateProductField(${insumo.id}, ${index}, 'population', sanitizeNumber(this.value, this))"
                                           placeholder="${isSoy ? '250000' : '65000'}">
                                </div>
                                ${mode === 'plantas' ? `
                                    <div class="seed-field">
                                        <label>Germ%</label>
                                        <input type="number" value="${product.germination}" 
                                               data-focus-key="insumo-${insumo.id}-product-${index}-germination"
                                               oninput="updateProductField(${insumo.id}, ${index}, 'germination', sanitizeNumber(this.value, this))"
                                               placeholder="90" style="width: 50px;">
                                    </div>
                                ` : ''}
                                <div class="seed-field">
                                    <label>Emb.</label>
                                    <select data-focus-key="insumo-${insumo.id}-product-${index}-bagSize" onchange="updateProductField(${insumo.id}, ${index}, 'bagSize', this.value)">
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
                    </div>
                `;
            }).join('')}
        </div>
        <button class="btn-add-inline" onclick="addProduct(${insumo.id})">+ ${isSoy ? 'Cultivar' : 'Híbrido'}</button>
        ${renderSumAreaWarning(insumo, totalArea)}
        ${renderInsumoStageReference(insumo)}
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
                <select onchange="updateInsumoField(${insumo.id}, 'stage', this.value); renderInsumos();">
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
                                       data-focus-key="insumo-${insumo.id}-product-${index}-name"
                                       list="catalog-products"
                                       onchange="updateProductField(${insumo.id}, ${index}, 'name', this.value)"
                                       placeholder="Ex: Glifosato">
                            </div>
                            <div class="field-group">
                                <label>Área ${renderAreaWarningIcon(area, totalArea)}</label>
                                <input type="number" value="${product.area}" 
                                       data-focus-key="insumo-${insumo.id}-product-${index}-area"
                                       oninput="updateProductField(${insumo.id}, ${index}, 'area', sanitizeNumber(this.value, this))"
                                       placeholder="${totalArea || '0'}"
                                       class="${areaWarningClass}"
                                       style="width: 70px;">
                            </div>
                            <div class="field-group">
                                <label>Dose/ha</label>
                                <input type="number" value="${product.dose}" 
                                       data-focus-key="insumo-${insumo.id}-product-${index}-dose"
                                       oninput="updateProductField(${insumo.id}, ${index}, 'dose', sanitizeNumber(this.value, this))"
                                       placeholder="0" style="width: 60px;">
                            </div>
                            <div class="field-group">
                                <label>Unid.</label>
                                <select data-focus-key="insumo-${insumo.id}-product-${index}-unit" onchange="updateProductField(${insumo.id}, ${index}, 'unit', this.value)" style="width: 55px;">
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
        ${renderInsumoStageReference(insumo)}
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
                                       data-focus-key="insumo-${insumo.id}-product-${index}-name"
                                       list="catalog-products"
                                       onchange="updateProductField(${insumo.id}, ${index}, 'name', this.value)"
                                       placeholder="${isInoculant ? 'Ex: Masterfix' : 'Ex: Standak Top'}">
                            </div>
                            <div class="field-group">
                                <label>Área ${renderAreaWarningIcon(area, totalArea)}</label>
                                <input type="number" value="${product.area}" 
                                       data-focus-key="insumo-${insumo.id}-product-${index}-area"
                                       oninput="updateProductField(${insumo.id}, ${index}, 'area', sanitizeNumber(this.value, this))"
                                       placeholder="${totalArea || '0'}"
                                       class="${areaWarningClass}"
                                       style="width: 70px;">
                            </div>
                            <div class="field-group">
                                <label>Dose/ha</label>
                                <input type="number" value="${product.dose}" 
                                       data-focus-key="insumo-${insumo.id}-product-${index}-dose"
                                       oninput="updateProductField(${insumo.id}, ${index}, 'dose', sanitizeNumber(this.value, this))"
                                       placeholder="0" step="0.01" style="width: 60px;">
                            </div>
                            <div class="field-group">
                                <label>Unid.</label>
                                <select data-focus-key="insumo-${insumo.id}-product-${index}-unit" onchange="updateProductField(${insumo.id}, ${index}, 'unit', this.value)" style="width: 55px;">
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

function getInsumoStageCode(insumo) {
    if (!insumo) return null;
    if (insumo.type === 'soy-seed' || insumo.type === 'corn-seed') return 'VE';
    if (insumo.type === 'defensive') return insumo.stage || 'V2';
    return null;
}

function renderItemImageSlot(stageCode, fallbackLabel = 'Imagem') {
    const stage = getPhenologyStage(stageCode);

    return `
        <div class="item-image-slot" aria-label="${stage ? `Estadio ${stage.code}` : fallbackLabel}">
            <div class="item-image-circle">
                ${stage ? renderStageImage(stage.code) : `<span class="item-image-fallback">${fallbackLabel}</span>`}
            </div>
        </div>
    `;
}

function renderInsumoStageReference(insumo) {
    const stageCode = getInsumoStageCode(insumo);
    const stage = getPhenologyStage(stageCode);

    if (!stage) {
        return '';
    }

    return `
        <details class="stage-note ${stage.phase}">
            <summary>
                <span class="stage-note-code">${stage.code}</span>
                <span class="stage-note-meta">${stage.fullName} | Dia ${stage.day}</span>
            </summary>
            <div class="stage-note-body">
                ${renderPhenologyDetailSections(stage)}
            </div>
        </details>
    `;
}

function renderConsolidationFarmData() {
    if (!consolidationFarmData) return;

    const producer = state.farmData.producer || '-';
    const farm = state.farmData.farm || '-';
    const area = state.farmData.area ? `${formatConsolidationNumber(state.farmData.area, 2)} ha` : '-';
    const culture = state.farmData.culture === 'milho' ? 'Milho' : 'Soja';
    const dueDate = state.farmData.dueDate || '-';
    const grainPrice = state.farmData.grainPrice || '';

    consolidationFarmData.innerHTML = `
        <div class="card consolidation-order-card">
            <div class="card-header">
                <span class="card-title">Cabeçalho do Pedido</span>
                <span class="card-icon">📋</span>
            </div>
            <div class="consolidation-order-grid">
                <div class="consolidation-order-item">
                    <span class="label">Produtor</span>
                    <span class="value">${producer}</span>
                </div>
                <div class="consolidation-order-item">
                    <span class="label">Fazenda</span>
                    <span class="value">${farm}</span>
                </div>
                <div class="consolidation-order-item">
                    <span class="label">Área</span>
                    <span class="value">${area}</span>
                </div>
                <div class="consolidation-order-item">
                    <span class="label">Cultura</span>
                    <span class="value">${culture}</span>
                </div>
                <div class="consolidation-order-item">
                    <span class="label">Data de Vencimento</span>
                    <span class="value">${dueDate}</span>
                </div>
                <div class="consolidation-order-item">
                    <span class="label">Valor do Grão</span>
                    <div class="consolidation-order-price">
                        <span class="prefix">R$</span>
                        <input type="number"
                               value="${grainPrice}"
                               placeholder="0,00"
                               oninput="updateConsolidationGrainPriceDraft(this.value)"
                               onchange="updateConsolidationGrainPrice(this.value)"
                               step="0.01"
                               min="0">
                        <span class="suffix">/saca</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateConsolidationGrainPriceDraft(value) {
    state.farmData.grainPrice = sanitizeNumber(value);
    saveState();
}

function updateConsolidationGrainPrice(value) {
    state.farmData.grainPrice = sanitizeNumber(value);
    const planningInput = document.getElementById('grain-price');
    if (planningInput) {
        planningInput.value = state.farmData.grainPrice;
    }
    saveState();
    renderConsolidation();
    renderConsolidationFarmData();
}

function formatConsolidationNumber(value, decimals = 2) {
    return Number(value || 0).toLocaleString('pt-BR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals
    });
}

function formatFertilizerComposition(product) {
    const n = parseFloat(product.n) || 0;
    const p = parseFloat(product.p) || 0;
    const k = parseFloat(product.k) || 0;
    const s = parseFloat(product.s) || 0;

    return [n, p, k, s]
        .map(value => formatConsolidationNumber(value, 2))
        .join('-');
}

function buildConsolidationDescriptor(insumo, product) {
    const name = product.name || 'Sem nome';
    const dose = parseFloat(product.dose) || 0;

    if (insumo.type === 'fertilizer') {
        const composition = formatFertilizerComposition(product);
        return {
            name,
            meta: `Composição ${composition}${dose > 0 ? ` | Dose ${formatConsolidationNumber(dose, 2)} kg/ha` : ''}`,
            key: `${name}|${composition}`
        };
    }

    if (insumo.type === 'soy-seed' || insumo.type === 'corn-seed') {
        const population = parseFloat(product.population) || 0;
        const mode = product.mode === 'sementes' ? 'Sementes' : 'Plantas';
        const bagSize = parseFloat(product.bagSize) || 0;
        const bagLabel = bagSize >= 1000000
            ? `${formatConsolidationNumber(bagSize / 1000000, 1)}M`
            : formatConsolidationNumber(bagSize, 0);

        return {
            name,
            meta: `${mode} ${formatConsolidationNumber(population, 0)}/ha${bagSize > 0 ? ` | Emb. ${bagLabel}` : ''}`,
            key: `${name}|${mode}|${population}|${bagSize}`
        };
    }

    const unit = product.unit || 'L';
    return {
        name,
        meta: dose > 0 ? `Dose ${formatConsolidationNumber(dose, 2)} ${unit}/ha` : '',
        key: `${name}|${unit}|${dose}`
    };
}

// ==================== CONSOLIDATION ====================
function renderConsolidation() {
    const consolidationContent = document.getElementById('consolidation-content');
    
    // Agrupa produtos por nome
    const productMap = {};
    
    state.insumos.forEach(insumo => {
        insumo.products.forEach(product => {
            const descriptor = buildConsolidationDescriptor(insumo, product);
            if (!descriptor.name || descriptor.name === 'Sem nome') return;
            
            const area = parseFloat(product.area) || 0;
            const dose = parseFloat(product.dose) || 0;
            
            let quantity = 0;
            let unit = '';
            
            // Fertilizantes
            if (insumo.type === 'fertilizer') {
                quantity = dose * area; // kg
                unit = 't'; // Converter para toneladas
                quantity = quantity / 1000;
            }
            // Sementes
            else if (insumo.type === 'soy-seed' || insumo.type === 'corn-seed') {
                const population = parseFloat(product.population) || 0;
                const germination = parseFloat(product.germination) || 90;
                const bagSize = parseFloat(product.bagSize) || 1;
                const mode = product.mode || 'plantas';
                
                if (population > 0 && bagSize > 0 && area > 0) {
                    const seedsPerHa = mode === 'plantas' ? population / (germination / 100) : population;
                    const haPerBag = bagSize / seedsPerHa;
                    quantity = area / haPerBag;
                    
                    // Determina unidade baseada no tamanho da embalagem
                    if (bagSize >= 1000000) {
                        unit = 'bag';
                    } else {
                        unit = 'sc';
                    }
                }
            }
            // Defensivos, Inoculantes, Tratamentos
            else {
                const productUnit = product.unit || 'L';
                quantity = dose * area;
                
                // Conversões
                if (productUnit === 'ml') {
                    quantity = quantity / 1000;
                    unit = 'L';
                } else if (productUnit === 'g') {
                    quantity = quantity / 1000;
                    unit = 'kg';
                } else {
                    unit = productUnit;
                }
            }
            
            if (quantity > 0) {
                const key = `${descriptor.key}|${unit}`;
                
                if (productMap[key]) {
                    productMap[key].quantity += quantity;
                } else {
                    productMap[key] = {
                        key,
                        name: descriptor.name,
                        meta: descriptor.meta,
                        quantity,
                        unit,
                        unitPrice: state.consolidation.unitPrices[key] || ''
                    };
                }
            }
        });
    });
    
    const products = Object.values(productMap);
    
    if (products.length === 0) {
        consolidationContent.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">Adicione insumos no planejamento para ver a consolidação</div>
            </div>
        `;
        return;
    }
    
    // Calcula totais
    let grandTotal = 0;
    products.forEach(p => {
        const unitPrice = parseFloat(p.unitPrice) || 0;
        const total = p.quantity * unitPrice;
        grandTotal += total;
    });
    
    const area = parseFloat(state.farmData.area) || 0;
    const grainPrice = parseFloat(state.farmData.grainPrice) || 0;
    let sacasPerHa = 0;
    
    if (area > 0 && grainPrice > 0) {
        sacasPerHa = grandTotal / area / grainPrice;
    }
    
    // Renderiza tabela
    let html = `
        <div class="consolidation-table-wrapper">
            <table class="consolidation-table">
                <thead>
                    <tr>
                        <th style="text-align: left; width: 40%;">Produto</th>
                        <th style="text-align: right; width: 20%;">Quantidade</th>
                        <th style="text-align: right; width: 20%;">Valor Unitário</th>
                        <th style="text-align: right; width: 20%;">Valor Total</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    products.forEach(product => {
        const unitPrice = parseFloat(product.unitPrice) || 0;
        const totalValue = product.quantity * unitPrice;
        const key = product.key;
        
        html += `
            <tr>
                <td>
                    <div class="consolidation-product">
                        <span class="consolidation-product-name">${product.name}</span>
                        ${product.meta ? `<span class="consolidation-product-meta">${product.meta}</span>` : ''}
                    </div>
                </td>
                <td style="text-align: right;">
                    <div class="quantity-cell static">
                        <span class="quantity-value">${formatConsolidationNumber(product.quantity, 3)}</span>
                        <span class="quantity-unit">${product.unit}</span>
                    </div>
                </td>
                <td class="money-cell">
                    <input type="number" 
                           class="price-input-table"
                           value="${product.unitPrice}" 
                           placeholder="0.00"
                           oninput="updateConsolidationUnitPriceDraft('${key}', this.value)"
                           onchange="updateConsolidationUnitPrice('${key}', this.value)"
                           step="0.01"
                           style="width: 100px; text-align: right;">
                </td>
                <td class="money-cell" style="font-weight: 500;">
                    ${unitPrice > 0 ? 'R$ ' + totalValue.toFixed(2) : '-'}
                </td>
            </tr>
        `;
    });
    
    html += `
                </tbody>
                <tfoot>
                    <tr class="total-row">
                        <td colspan="3" style="text-align: right; font-weight: 600;">TOTAL:</td>
                        <td style="text-align: right; font-weight: 600; font-size: 1.1em;">R$ ${grandTotal.toFixed(2)}</td>
                    </tr>
                    ${area > 0 && grainPrice > 0 ? `
                        <tr class="summary-row">
                            <td colspan="3" style="text-align: right; font-weight: 600;">SACAS/HA:</td>
                            <td style="text-align: right; font-weight: 600; color: var(--primary);">${sacasPerHa.toFixed(2)} sc/ha</td>
                        </tr>
                    ` : ''}
                </tfoot>
            </table>
        </div>
    `;
    
    consolidationContent.innerHTML = html;
}

function updateConsolidationUnitPriceDraft(key, value) {
    state.consolidation.unitPrices[key] = value;
    saveState();
}

function updateConsolidationUnitPrice(key, value) {
    state.consolidation.unitPrices[key] = value;
    saveState();
    renderConsolidation();
}

function updateConsolidationQuantity(key, value) {
    state.consolidation.quantities[key] = value;
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
