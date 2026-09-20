const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const inventoryToggle = document.getElementById('inventory-toggle');
const inventoryPanel = document.getElementById('inventory-panel');
const inventoryClose = document.getElementById('inventory-close');
const inventoryList = document.getElementById('inventory-list');
const skillsList = document.getElementById('skills-list');
const mooseCoinsEl = document.getElementById('moose-coins');
const menuHelp = document.getElementById('menu-help');
const menuFrame = document.querySelector('.menu-frame');
const healthFill = document.getElementById('health-fill');
const energyFill = document.getElementById('energy-fill');
const coldFill = document.getElementById('cold-fill');
const gameOverReasonEl = document.getElementById('game-over-reason');
const menuTabs = Array.from(document.querySelectorAll('.menu-tab[data-menu-tab]'));
const menuSections = Array.from(document.querySelectorAll('.menu-section[data-menu-section]'));

// Load tree sprite and pre-tint to avoid severe performance lag 
const treeImg = new Image();
const tintedTreeCanvas = document.createElement('canvas');
const tctx = tintedTreeCanvas.getContext('2d');
treeImg.onload = () => {
    tintedTreeCanvas.width = treeImg.naturalWidth;
    tintedTreeCanvas.height = treeImg.naturalHeight;
    tctx.filter = 'brightness(0.24) saturate(0.52)';
    tctx.drawImage(treeImg, 0, 0);
};
treeImg.src = 'tree.png';

const CAR_SPRITES = [
    { color: 'grey', src: 'grey-car.png', weight: 17 },
    { color: 'white', src: 'white-car.png', weight: 17 },
    { color: 'black', src: 'black-car.png', weight: 17 },
    { color: 'green', src: 'green-car.png', weight: 11 },
    { color: 'blue', src: 'blue-car.png', weight: 11 },
    { color: 'red', src: 'red-car.png', weight: 11 },
    { color: 'yellow', src: 'yellow-car.png', weight: 6 },
    { color: 'purple', src: 'purple-car.png', weight: 6 }
].map(sprite => {
    const img = new Image();
    img.src = sprite.src;
    return { ...sprite, img };
});

const GANGSTER_CAR_SPRITE = (() => {
    const img = new Image();
    img.src = 'gangster car.png';
    return { color: 'gangster', src: 'gangster car.png', weight: 1, img };
})();

function pickCarSprite() {
    const totalWeight = CAR_SPRITES.reduce((sum, sprite) => sum + sprite.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const sprite of CAR_SPRITES) {
        roll -= sprite.weight;
        if (roll <= 0) return sprite;
    }
    return CAR_SPRITES[0];
}

const VAN_SPRITES = [
    { color: 'grey', src: 'grey-van.png', weight: 33 },
    { color: 'white', src: 'white-van.png', weight: 33 },
    { color: 'black', src: 'black-van.png', weight: 16 },
    { color: 'blue', src: 'blue-van.png', weight: 16 }
].map(sprite => {
    const img = new Image();
    img.src = sprite.src;
    return { ...sprite, img };
});

function pickVanSprite() {
    const totalWeight = VAN_SPRITES.reduce((sum, sprite) => sum + sprite.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const sprite of VAN_SPRITES) {
        roll -= sprite.weight;
        if (roll <= 0) return sprite;
    }
    return VAN_SPRITES[0];
}

const TRUCK_SPRITES = [
    { color: 'red', src: 'red-truck.png', weight: 15 },
    { color: 'green', src: 'green-truck.png', weight: 15 },
    { color: 'white', src: 'white-truck.png', weight: 15 },
    { color: 'grey', src: 'grey-truck.png', weight: 15 },
    { color: 'black', src: 'black-truck.png', weight: 15 },
    { color: 'marlboro', src: 'marlboro-truck.png', weight: 7 },
    { color: 'evergreen', src: 'evergreen-truck.png', weight: 7 },
    { color: 'debank', src: 'debank-truck.png', weight: 7 }
].map(sprite => {
    const img = new Image();
    img.src = sprite.src;
    return { ...sprite, img };
});

function pickTruckSprite() {
    const totalWeight = TRUCK_SPRITES.reduce((sum, sprite) => sum + sprite.weight, 0);
    let roll = Math.random() * totalWeight;
    for (const sprite of TRUCK_SPRITES) {
        roll -= sprite.weight;
        if (roll <= 0) return sprite;
    }
    return TRUCK_SPRITES[0];
}

function pickVehicleType() {
    if (Math.random() < 0.01) return 'gangsterCar';

    const bonusLevels = getSkillBonusLevels('truckSearcher');
    const bigVehicleBonus = Math.min(0.4, bonusLevels * 0.05);
    const vanChance = 0.20 + bigVehicleBonus * 0.6;
    const truckChance = 0.05 + bigVehicleBonus * 0.4;
    const carChance = 1 - vanChance - truckChance;
    const roll = Math.random();
    if (roll < carChance) return 'car';
    if (roll < carChance + vanChance) return 'van';
    return 'truck';
}

const roadImg = new Image();
roadImg.src = 'road.png';

const grassImg = new Image();
grassImg.src = 'grass.png';

const lanternImg = new Image();
lanternImg.src = 'lantern.png';

const mooseImgs = {
    up: [new Image(), new Image()],
    down: [new Image(), new Image()],
    left: [new Image(), new Image()],
    right: [new Image(), new Image()]
};
mooseImgs.up[0].src = 'moose_up 1.png';
mooseImgs.up[1].src = 'moose_up 2.png';
mooseImgs.down[0].src = 'moose_down 1.png';
mooseImgs.down[1].src = 'moose_down 2.png';
mooseImgs.left[0].src = 'moose_left 1.png';
mooseImgs.left[1].src = 'moose_left 2.png';
mooseImgs.right[0].src = 'moose_right 1.png';
mooseImgs.right[1].src = 'moose_right 2.png';

const smokingImgs = [new Image(), new Image(), new Image(), new Image()];
smokingImgs.forEach((img, index) => {
    img.src = `smoking ${index + 1}.png`;
});

const eatingImgs = [new Image(), new Image(), new Image()];
eatingImgs.forEach((img, index) => {
    img.src = `eating ${index + 1}.png`;
});

const gameOverEl = document.getElementById('game-over');
const restartBtn = document.getElementById('restart-btn');
const mobileControls = document.getElementById('mobile-controls');
const joystick = document.getElementById('joystick');
const joystickKnob = document.getElementById('joystick-knob');
let moose = null;

function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // center the road
    const centerY = canvas.height / 2;
    ROAD_TOP = centerY - 90;
    ROAD_BOTTOM = centerY + 90;
    LANES_Y = [centerY + 40, centerY - 50];
    START_Y = Math.min(canvas.height - MOOSE_HEIGHT - 12, ROAD_BOTTOM + 22);
    TOP_SAFE_Y = 100;

    if (typeof initTrees === 'function') initTrees();
    if (moose) {
        const maxX = Math.max(MOOSE_SCREEN_PADDING, canvas.width - moose.width - MOOSE_SCREEN_PADDING);
        moose.x = Math.max(MOOSE_SCREEN_PADDING, Math.min(maxX, moose.x));
        moose.y = Math.max(MOOSE_SCREEN_PADDING, Math.min(canvas.height - moose.height - MOOSE_SCREEN_PADDING, moose.y));
    }
}
window.addEventListener('resize', resize);

// Constants - SMALL SCALE
const LANE_COUNT = 2;
const LANE_HEIGHT = 60;
let LANES_Y = [400, 310];
let START_Y = 550;
let TOP_SAFE_Y = 100;

// Road boundaries for visibility logic
let ROAD_TOP = 280;
let ROAD_BOTTOM = 460;
const VISION_MARGIN = 145; // moose seen near the road, not deep in the woods

const VEHICLE_TUNING = {
    car: {
        baseSpeed: () => 10.2 + Math.random() * 6.8,
        brakeHardness: () => 0.990 + Math.random() * 0.004,
        laneSwitchSpeed: () => 1.2 + Math.random() * 0.7,
        baseSpinChance: 0.04
    },
    gangsterCar: {
        baseSpeed: () => 18.5 + Math.random() * 5.5,
        brakeHardness: () => 0.997 + Math.random() * 0.002,
        laneSwitchSpeed: () => 1.45 + Math.random() * 0.8,
        baseSpinChance: 0.035
    },
    van: {
        baseSpeed: () => 9.0 + Math.random() * 5.4,
        brakeHardness: () => 0.996 + Math.random() * 0.002,
        laneSwitchSpeed: () => 0.85 + Math.random() * 0.5,
        baseSpinChance: 0.024
    },
    truck: {
        baseSpeed: () => 7.2 + Math.random() * 4.6,
        brakeHardness: () => 0.998 + Math.random() * 0.0012,
        laneSwitchSpeed: () => 0.45 + Math.random() * 0.25,
        baseSpinChance: 0.014
    }
};

const MAX_STAT = 100;
const ENERGY_DRAIN_PER_FRAME = 0.034;
const COLD_GAIN_PER_FRAME = 0.012;
const CRASH_DAMAGE = {
    car: 28,
    gangsterCar: 36,
    van: 44,
    truck: 64
};
const CRASH_INVULNERABILITY_FRAMES = 70;
const ACTION_ANIMATION_FRAMES = 120;
const CONSUMABLE_EFFECTS = {
    burgers: { health: 24, energy: 34, cold: 0 },
    iceCream: { health: 10, energy: 16, cold: 15 },
    cigarettePacks: { health: 0, energy: 0, cold: -34 }
};

const INVENTORY_ITEMS = [
    { key: 'moneyBills', label: 'Money bills', src: 'money bill.png', value: 1 },
    { key: 'phones', label: 'Phones', src: 'phone.png', value: 50 },
    { key: 'burgers', label: 'Burgers', src: 'burger.png', value: 10 },
    { key: 'laptops', label: 'Laptops', src: 'laptop.png', value: 100 },
    { key: 'cigarettePacks', label: 'Cigarette packs', src: 'cigarettes.png', value: 30 },
    { key: 'iceCream', label: 'Ice cream', src: 'ice cream.png', value: 15 },
    { key: 'furniture', label: 'Furniture', src: 'furniture.png', value: 75 },
    { key: 'constructionMaterial', label: 'Construction material', src: 'construction material.png', value: 50 }
];
const INVENTORY_SLOT_COUNT = 15;
const SKILL_BASE_COST = 2000;
const SKILL_COST_GROWTH = 1.65;
const SKILLS = [
    {
        key: 'antlers',
        name: 'Antlers',
        description: 'They scare the drivers and make them spin more often.'
    },
    {
        key: 'speed',
        name: 'Speed',
        description: 'It makes you move faster and scare more sudden.'
    },
    {
        key: 'luck',
        name: 'Luck',
        description: 'With good luck you can get more items out of a vehicle.'
    },
    {
        key: 'seller',
        name: 'Seller',
        description: 'You can sell the products for a higher price.'
    },
    {
        key: 'truckSearcher',
        name: 'Truck searcher',
        description: 'Bigger vehicles come more often.'
    },
    {
        key: 'skin',
        name: 'Skin',
        description: 'Its better in the warm.'
    },
    {
        key: 'mass',
        name: 'Mass',
        description: 'You can ram the cars better.'
    },
    {
        key: 'efficiency',
        name: 'Efficiency',
        description: 'You dont consume much energy.'
    }
];

const inventory = Object.fromEntries(INVENTORY_ITEMS.map(item => [item.key, 0]));
const skillLevels = Object.fromEntries(SKILLS.map(skill => [skill.key, 1]));
let mooseCoins = 0;
let activeInventoryKey = null;
let activeMenuTab = 'inventory';
let vitals = {
    health: MAX_STAT,
    energy: MAX_STAT,
    cold: 0
};
let deathReason = '';
let crashInvulnerability = 0;

function clampStat(value) {
    return Math.max(0, Math.min(MAX_STAT, value));
}

function renderVitals() {
    setVitalFill(healthFill, vitals.health);
    setVitalFill(energyFill, vitals.energy);
    setVitalFill(coldFill, vitals.cold);
}

function setVitalFill(element, value) {
    if (!element) return;
    const percent = clampStat(value);
    element.style.width = '100%';
    element.style.clipPath = 'none';
    element.style.transform = `translateX(-50%) scaleY(${Math.max(0.02, percent / 100)})`;
}

function canUseInventoryItem(key) {
    return Object.prototype.hasOwnProperty.call(CONSUMABLE_EFFECTS, key);
}

function useInventoryItem(key) {
    if (!canUseInventoryItem(key) || inventory[key] <= 0 || !gameActive) return false;
    const effect = CONSUMABLE_EFFECTS[key];
    inventory[key]--;
    vitals.health = clampStat(vitals.health + effect.health);
    vitals.energy = clampStat(vitals.energy + effect.energy);
    vitals.cold = clampStat(vitals.cold + effect.cold);
    if (key === 'cigarettePacks' && moose) moose.startSmoking();
    if ((key === 'burgers' || key === 'iceCream') && moose) moose.startEating();
    if (inventory[key] <= 0 && activeInventoryKey === key) activeInventoryKey = null;
    renderVitals();
    renderInventory();
    return true;
}

function eatQuickFood() {
    if (inventory.burgers > 0) {
        useInventoryItem('burgers');
    } else if (inventory.iceCream > 0) {
        useInventoryItem('iceCream');
    }
}

function smokeQuickCigarette() {
    if (inventory.cigarettePacks > 0) useInventoryItem('cigarettePacks');
}

function checkVitalDeath() {
    if (vitals.health <= 0) gameOver('Health hit zero.');
    else if (vitals.energy <= 0) gameOver('Energy ran out.');
    else if (vitals.cold >= MAX_STAT) gameOver('The cold took over.');
}

function randomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

function lowWeightedInt(min, max) {
    const count = max - min + 1;
    const totalWeight = count * (count + 1) / 2;
    let roll = Math.random() * totalWeight;
    for (let value = min; value <= max; value++) {
        roll -= max - value + 1;
        if (roll <= 0) return value;
    }
    return min;
}

function addRangeDrop(drop, key, min, max, weighted = false) {
    drop[key] = (drop[key] || 0) + (weighted ? lowWeightedInt(min, max) : randomInt(min, max));
}

function addChanceOrRangeDrop(drop, key, zeroChance, fallbackAmount, min, max) {
    if (Math.random() < zeroChance) {
        drop[key] = (drop[key] || 0) + fallbackAmount;
        return;
    }
    addRangeDrop(drop, key, min, max, true);
}

function rollVehicleLoot(vehicle) {
    const drop = {};
    const spriteColor = vehicle.sprite ? vehicle.sprite.color : '';

    if (vehicle.vehicleType === 'gangsterCar') {
        addRangeDrop(drop, 'moneyBills', 2000, 5000);
        addRangeDrop(drop, 'cigarettePacks', 20, 50);
        addRangeDrop(drop, 'phones', 5, 10);
        addRangeDrop(drop, 'laptops', 2, 10);
    } else if (vehicle.vehicleType === 'truck' && spriteColor === 'debank') {
        addRangeDrop(drop, 'moneyBills', 200, 500);
        addRangeDrop(drop, 'phones', 1, 1);
        addRangeDrop(drop, 'laptops', 5, 10, true);
    } else if (vehicle.vehicleType === 'truck' && spriteColor === 'marlboro') {
        addRangeDrop(drop, 'moneyBills', 100, 250);
        addRangeDrop(drop, 'phones', 1, 1);
        addRangeDrop(drop, 'cigarettePacks', 30, 50);
    } else if (vehicle.vehicleType === 'truck' && spriteColor === 'evergreen') {
        addRangeDrop(drop, 'moneyBills', 100, 250);
        addRangeDrop(drop, 'burgers', 20, 50, true);
        addRangeDrop(drop, 'constructionMaterial', 20, 50, true);
    } else if (vehicle.vehicleType === 'truck') {
        addRangeDrop(drop, 'moneyBills', 60, 200);
        addChanceOrRangeDrop(drop, 'phones', 0.8, 1, 10, 20);
        addChanceOrRangeDrop(drop, 'burgers', 0.75, 3, 10, 30);
        addChanceOrRangeDrop(drop, 'laptops', 0.75, 1, 5, 10);
        addRangeDrop(drop, 'cigarettePacks', 3, 7);
        addChanceOrRangeDrop(drop, 'furniture', 0.75, 0, 5, 10);
        addRangeDrop(drop, 'constructionMaterial', 10, 20, true);
    } else if (vehicle.vehicleType === 'van') {
        addRangeDrop(drop, 'moneyBills', 30, 100);
        addRangeDrop(drop, 'phones', 1, 2, true);
        addRangeDrop(drop, 'burgers', 1, 20, true);
        addRangeDrop(drop, 'laptops', 0, 2, true);
        addRangeDrop(drop, 'cigarettePacks', 1, 4);
        addChanceOrRangeDrop(drop, 'iceCream', 0.75, 0, 10, 20);
        addRangeDrop(drop, 'furniture', 0, 3);
    } else {
        addRangeDrop(drop, 'moneyBills', 10, 50);
        addRangeDrop(drop, 'phones', 1, 3, true);
        addRangeDrop(drop, 'burgers', 0, 2, true);
        addRangeDrop(drop, 'laptops', 0, 1, true);
        addRangeDrop(drop, 'cigarettePacks', 0, 2);
    }

    return applyLuckToDrop(drop);
}

function getSkillBonusLevels(key) {
    return Math.max(0, (skillLevels[key] || 1) - 1);
}

function getMooseSpeed() {
    return 3.5 + getSkillBonusLevels('speed') * 0.2;
}

function getVehicleBaseSpinChance(vehicleType) {
    return VEHICLE_TUNING[vehicleType].baseSpinChance + getSkillBonusLevels('antlers') * 0.002;
}

function getSellMultiplier() {
    return 1 + getSkillBonusLevels('seller') * 0.1;
}

function getItemSellValue(item) {
    return Math.max(1, Math.round(item.value * getSellMultiplier()));
}

function getColdGain() {
    return COLD_GAIN_PER_FRAME * Math.max(0.35, 1 - getSkillBonusLevels('skin') * 0.08);
}

function getEnergyDrain() {
    return ENERGY_DRAIN_PER_FRAME * Math.max(0.35, 1 - getSkillBonusLevels('efficiency') * 0.08);
}

function getCrashDamageMultiplier() {
    return Math.max(0.35, 1 - getSkillBonusLevels('mass') * 0.09);
}

function applyLuckToDrop(drop) {
    const bonusLevels = getSkillBonusLevels('luck');
    if (bonusLevels <= 0) return drop;

    const bonusRate = Math.min(0.5, bonusLevels * 0.04);
    const boostedDrop = {};
    for (const [key, amount] of Object.entries(drop)) {
        const guaranteedBonus = Math.floor(amount * bonusRate);
        const chanceBonus = Math.random() < ((amount * bonusRate) % 1) ? 1 : 0;
        boostedDrop[key] = amount + guaranteedBonus + chanceBonus;
    }
    return boostedDrop;
}

function addLootToInventory(drop) {
    for (const [key, amount] of Object.entries(drop)) {
        inventory[key] += amount;
    }
    renderInventory();
}

function getInventoryItem(key) {
    return INVENTORY_ITEMS.find(item => item.key === key);
}

function renderMooseCoins() {
    if (mooseCoinsEl) mooseCoinsEl.textContent = `${mooseCoins} MC`;
}

function getSkillUpgradeCost(key) {
    const level = skillLevels[key] || 1;
    return Math.round((SKILL_BASE_COST * Math.pow(SKILL_COST_GROWTH, level - 1)) / 25) * 25;
}

function renderInventory() {
    if (!inventoryList) return;
    const collectedItems = INVENTORY_ITEMS.filter(item => inventory[item.key] > 0);
    const slots = Array.from({ length: INVENTORY_SLOT_COUNT }, (_, index) => collectedItems[index] || null);
    inventoryList.innerHTML = slots.map(item => {
        if (!item) return '<div class="inventory-slot empty"></div>';
        const sellValue = getItemSellValue(item);
        const sellOnePrice = sellValue;
        const sellTenAmount = Math.min(10, inventory[item.key]);
        const sellTenPrice = sellTenAmount * sellValue;
        const sellAllAmount = inventory[item.key];
        const sellAllPrice = sellAllAmount * sellValue;
        const useButton = canUseInventoryItem(item.key)
            ? `<button class="inventory-use-action" type="button" data-use-item="${item.key}">Use</button>`
            : '';
        return `<div class="inventory-slot item-${item.key}" role="button" tabindex="0" data-key="${item.key}" aria-label="${item.label}, ${inventory[item.key]} available, ${sellValue} MC each">
            <span class="inventory-icon-frame">
                <img src="${item.src}" alt="" class="inventory-icon">
            </span>
            <span class="inventory-count">${inventory[item.key]}</span>
            <span class="inventory-hover-info">
                <span class="inventory-name">${item.label}</span>
                ${useButton}
                <button class="inventory-sell-action" type="button" data-sell-amount="1">Sell 1: ${sellOnePrice} MC</button>
                <button class="inventory-sell-action" type="button" data-sell-amount="10">Sell 10: ${sellTenPrice} MC</button>
                <button class="inventory-sell-action" type="button" data-sell-amount="all">Sell all: ${sellAllPrice} MC</button>
            </span>
        </div>`;
    }).join('');

    inventoryList.querySelectorAll('.inventory-slot[data-key]').forEach(slot => {
        slot.addEventListener('mouseenter', () => activeInventoryKey = slot.dataset.key);
        slot.addEventListener('mouseleave', () => {
            if (activeInventoryKey === slot.dataset.key) activeInventoryKey = null;
        });
        slot.addEventListener('focus', () => activeInventoryKey = slot.dataset.key);
        slot.addEventListener('blur', () => {
            if (activeInventoryKey === slot.dataset.key) activeInventoryKey = null;
        });
        slot.addEventListener('click', e => {
            if (e.target.closest('.inventory-sell-action')) return;
            activeInventoryKey = slot.dataset.key;
            slot.focus();
        });
        slot.addEventListener('keydown', e => {
            if (e.code !== 'Enter' && e.code !== 'Space') return;
            e.preventDefault();
            activeInventoryKey = slot.dataset.key;
            slot.focus();
        });
    });
    inventoryList.querySelectorAll('.inventory-sell-action').forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();
            const slot = button.closest('.inventory-slot[data-key]');
            if (!slot) return;
            const amount = button.dataset.sellAmount === 'all' ? inventory[slot.dataset.key] : Number(button.dataset.sellAmount);
            activeInventoryKey = slot.dataset.key;
            sellInventoryItem(slot.dataset.key, amount);
        });
    });
    inventoryList.querySelectorAll('.inventory-use-action').forEach(button => {
        button.addEventListener('click', e => {
            e.stopPropagation();
            activeInventoryKey = button.dataset.useItem;
            useInventoryItem(button.dataset.useItem);
        });
    });
    renderMooseCoins();
    renderSkills();
}

function renderSkills() {
    if (!skillsList) return;
    skillsList.innerHTML = SKILLS.map(skill => {
        const level = skillLevels[skill.key] || 1;
        const cost = getSkillUpgradeCost(skill.key);
        const canAfford = mooseCoins >= cost;
        return `<article class="skill-card">
            <h3 class="skill-title">${skill.name}</h3>
            <span class="skill-level">Level ${level}</span>
            <p class="skill-description">${skill.description}</p>
            <div class="skill-footer">
                <span class="skill-price">${cost} MC</span>
                <button class="skill-upgrade" type="button" data-skill="${skill.key}" ${canAfford ? '' : 'disabled'}>Upgrade</button>
            </div>
        </article>`;
    }).join('');

    skillsList.querySelectorAll('.skill-upgrade[data-skill]').forEach(button => {
        button.addEventListener('click', () => upgradeSkill(button.dataset.skill));
    });
}

function upgradeSkill(key) {
    if (!Object.prototype.hasOwnProperty.call(skillLevels, key)) return;
    const cost = getSkillUpgradeCost(key);
    if (mooseCoins < cost) return;
    mooseCoins -= cost;
    skillLevels[key]++;
    renderInventory();
}

function sellInventoryItem(key, amount) {
    const item = getInventoryItem(key);
    if (!item || inventory[key] <= 0) return;
    const sold = Math.min(amount, inventory[key]);
    inventory[key] -= sold;
    mooseCoins += sold * getItemSellValue(item);
    if (inventory[key] <= 0 && activeInventoryKey === key) activeInventoryKey = null;
    renderInventory();
}

function getCrashDamage(car) {
    const baseDamage = CRASH_DAMAGE[car.vehicleType] || CRASH_DAMAGE.car;
    const speedFactor = Math.max(0.75, car.currentSpeed / 10);
    return Math.round(baseDamage * speedFactor * getCrashDamageMultiplier());
}

function damageMooseFromCrash(car) {
    if (crashInvulnerability > 0) return;
    vitals.health = clampStat(vitals.health - getCrashDamage(car));
    crashInvulnerability = CRASH_INVULNERABILITY_FRAMES;
    renderVitals();
    checkVitalDeath();
}

function isInventoryOpen() {
    return inventoryPanel ? !inventoryPanel.classList.contains('hidden') : false;
}

function setInventoryOpen(isOpen) {
    if (!inventoryPanel || !inventoryToggle) return;
    inventoryPanel.classList.toggle('hidden', !isOpen);
    inventoryToggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
        Object.keys(keys).forEach(key => keys[key] = false);
        resetJoystick();
    } else {
        activeInventoryKey = null;
    }
}

function setMenuTab(tabName) {
    activeMenuTab = tabName;
    if (menuFrame) menuFrame.dataset.activeTab = tabName;
    menuTabs.forEach(tab => {
        const isActive = tab.dataset.menuTab === tabName;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
    });
    menuSections.forEach(section => {
        section.classList.toggle('active', section.dataset.menuSection === tabName);
    });
    if (menuHelp) {
        menuHelp.textContent = tabName === 'inventory'
            ? 'Hover item: U uses / E sells 1 / F sells 10 / T sells all'
            : tabName === 'skills'
                ? 'Buy upgrades with MC from selling scavenged items'
                : 'More menu pages coming soon';
    }
}

function toggleInventory() {
    setInventoryOpen(inventoryPanel.classList.contains('hidden'));
}

const MOOSE_WIDTH = 32;
const MOOSE_HEIGHT = 26;
const CAR_WIDTH = 68;
const CAR_HEIGHT = 34;
const MOOSE_SCREEN_PADDING = 8;
const LANTERN_BLOCK_RADIUS = 32;

let gameActive = true;
let cars = [];
let trees = [];
let frame = 0;
let spawnedVehicleCount = 0;
const keys = {};
const joystickInput = {
    active: false,
    pointerId: null,
    x: 0,
    y: 0
};

// Initialize BIGGER ALLEY TREES
function initTrees() {
    trees = [];
    if (!canvas || canvas.height === 0) return;

    // Top forest
    for (let y = ROAD_TOP - 30; y > -400; y -= 65) {
        let gap;
        const dist = ROAD_TOP - y;
        if (dist <= 30) gap = 150;
        else if (dist < 150) gap = 450;
        else gap = Math.max(70, 150 - dist * 0.6);

        for (let x = -200; x < canvas.width + 200; x += gap * (0.8 + Math.random() * 0.4)) {
            trees.push({ x: x + Math.random() * 20, y: y + Math.random() * 20, size: 60 + Math.random() * 40 });
        }
    }
    // Bottom forest
    for (let y = ROAD_BOTTOM + 180; y < canvas.height + 400; y += 65) {
        let gap;
        const dist = y - ROAD_BOTTOM - 150;
        if (dist <= 30) gap = 150;
        else if (dist < 150) gap = 450;
        else gap = Math.max(70, 150 - dist * 0.6);

        for (let x = -200; x < canvas.width + 200; x += gap * (0.8 + Math.random() * 0.4)) {
            trees.push({ x: x + Math.random() * 20, y: y + Math.random() * 20, size: 60 + Math.random() * 40 });
        }
    }

    for (let x = -200; x < canvas.width + 400; x += 700) {
        trees.push({ x: x, y: ROAD_TOP + 45, isLantern: true });
        trees.push({ x: x + 350, y: ROAD_BOTTOM + 40, isLantern: true });
    }
}
resize();

function isPointInsideLantern(x, y, padding = 0) {
    return trees.some(tree => tree.isLantern && Math.hypot(x - tree.x, y - tree.y) < LANTERN_BLOCK_RADIUS + padding);
}

function findSafeMooseSpawn() {
    const spawnY = START_Y;
    const centerX = canvas.width / 2 - MOOSE_WIDTH / 2;
    const candidates = [0, 1, -1, 2, -2, 3, -3, 4, -4].flatMap(step => [
        centerX + step * 36,
        centerX + step * 58
    ]);

    for (const candidateX of candidates) {
        const clampedX = Math.max(MOOSE_SCREEN_PADDING, Math.min(canvas.width - MOOSE_WIDTH - MOOSE_SCREEN_PADDING, candidateX));
        const center = {
            x: clampedX + MOOSE_WIDTH / 2,
            y: spawnY + MOOSE_HEIGHT / 2
        };
        if (!isPointInsideLantern(center.x, center.y, 8)) return { x: clampedX, y: spawnY };
    }

    return {
        x: Math.max(MOOSE_SCREEN_PADDING, Math.min(canvas.width - MOOSE_WIDTH - MOOSE_SCREEN_PADDING, centerX)),
        y: spawnY
    };
}

moose = {
    x: 0,
    y: START_Y,
    width: MOOSE_WIDTH,
    height: MOOSE_HEIGHT,
    color: '#bc6c25',
    direction: 'up',
    renderAngle: 0,
    moving: false,
    smokingFramesLeft: 0,
    eatingFramesLeft: 0,
    startSmoking() {
        this.eatingFramesLeft = 0;
        this.smokingFramesLeft = ACTION_ANIMATION_FRAMES;
    },
    startEating() {
        this.smokingFramesLeft = 0;
        this.eatingFramesLeft = ACTION_ANIMATION_FRAMES;
    },
    isActionAnimating() {
        return this.smokingFramesLeft > 0 || this.eatingFramesLeft > 0;
    },
    update() {
        const speed = getMooseSpeed();
        let dx = 0; let dy = 0;

        if (keys['KeyA'] || keys['ArrowLeft']) dx -= speed;
        if (keys['KeyD'] || keys['ArrowRight']) dx += speed;
        if (keys['KeyW'] || keys['ArrowUp']) dy -= speed;
        if (keys['KeyS'] || keys['ArrowDown']) dy += speed;
        if (joystickInput.active) {
            dx += joystickInput.x * speed;
            dy += joystickInput.y * speed;
        }

        if (dx !== 0 || dy !== 0) {
            this.moving = true;
            if (dx > 0 && dy === 0) { this.direction = 'right'; this.renderAngle = 0; }
            else if (dx < 0 && dy === 0) { this.direction = 'left'; this.renderAngle = 0; }
            else if (dx === 0 && dy > 0) { this.direction = 'down'; this.renderAngle = 0; }
            else if (dx === 0 && dy < 0) { this.direction = 'up'; this.renderAngle = 0; }
            else if (dx > 0 && dy < 0) { this.direction = 'up'; this.renderAngle = Math.PI / 4; }
            else if (dx < 0 && dy < 0) { this.direction = 'up'; this.renderAngle = -Math.PI / 4; }
            else if (dx > 0 && dy > 0) { this.direction = 'down'; this.renderAngle = -Math.PI / 4; }
            else if (dx < 0 && dy > 0) { this.direction = 'down'; this.renderAngle = Math.PI / 4; }
        } else {
            this.moving = false;
        }

        const previousX = this.x;
        const previousY = this.y;
        this.x = Math.max(MOOSE_SCREEN_PADDING, Math.min(canvas.width - this.width - MOOSE_SCREEN_PADDING, this.x + dx));
        this.y = Math.max(MOOSE_SCREEN_PADDING, Math.min(canvas.height - this.height - MOOSE_SCREEN_PADDING, this.y + dy));

        if (isMooseTouchingLantern(this)) {
            this.x = previousX;
            this.y = previousY;
        }
        if (this.moving && (this.x !== previousX || this.y !== previousY)) {
            vitals.energy = clampStat(vitals.energy - getEnergyDrain());
        }

        // SCAVENGING
        for (let i = cars.length - 1; i >= 0; i--) {
            const car = cars[i];
            if (car.wrecked && car.hasPoint) {
                const dist = Math.hypot(this.x + this.width / 2 - (car.x + car.width / 2), this.y + this.height / 2 - (car.currentY + car.height / 2));
                if (dist < 50) {
                    car.hasPoint = false;
                    this.collectWreck(car);
                    cars.splice(i, 1); // Disappear when collected
                }
            }
        }
    },
    collectWreck(car) {
        addLootToInventory(rollVehicleLoot(car));
    },
    draw() {
        const frames = mooseImgs[this.direction];
        const isSmoking = this.smokingFramesLeft > 0;
        const isEating = this.eatingFramesLeft > 0;
        const actionImgs = isSmoking ? smokingImgs : isEating ? eatingImgs : null;
        const actionFramesLeft = isSmoking ? this.smokingFramesLeft : this.eatingFramesLeft;
        const actionFrame = actionImgs
            ? Math.min(
                actionImgs.length - 1,
                Math.floor((ACTION_ANIMATION_FRAMES - actionFramesLeft) / (ACTION_ANIMATION_FRAMES / actionImgs.length))
            )
            : 0;
        const baseImg = (this.moving && frame % 40 < 20) ? frames[1] : frames[0];
        const img = actionImgs ? actionImgs[actionFrame] : baseImg;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(actionImgs ? 0 : this.renderAngle);

        if (img && img.complete && img.naturalWidth > 0) {
            const sizeSource = actionImgs && baseImg && baseImg.complete && baseImg.naturalWidth > 0 ? baseImg : img;
            const maxDim = Math.max(sizeSource.naturalWidth, sizeSource.naturalHeight);
            const scale = 60 / maxDim;
            const w = sizeSource.naturalWidth * scale;
            const h = sizeSource.naturalHeight * scale;
            ctx.drawImage(img, -w / 2, -h / 2 - 10, w, h);
            if (isSmoking) this.smokingFramesLeft--;
            if (isEating) this.eatingFramesLeft--;
        } else {
            ctx.translate(-this.width / 2, -this.height / 2);
            ctx.strokeStyle = '#8b4513';
            ctx.lineWidth = 2;
            ctx.beginPath();
            const legOffset = Math.sin(frame * 0.2) * 5;
            ctx.moveTo(6, this.height);
            ctx.lineTo(4 - legOffset, this.height + 8);
            ctx.moveTo(18, this.height);
            ctx.lineTo(20 + legOffset, this.height + 8);
            ctx.stroke();
            ctx.fillStyle = this.color;
            ctx.fillRect(0, 0, this.width, this.height);
            ctx.fillStyle = '#dda15e';
            ctx.fillRect(this.width - 2, -6, 10, 8);
            if (isSmoking) this.smokingFramesLeft--;
            if (isEating) this.eatingFramesLeft--;
        }
        ctx.restore();
    }
};

Object.assign(moose, findSafeMooseSpawn());

class Car {
    constructor(laneIndex, forcedType = null) {
        this.laneIndex = laneIndex;
        this.direction = laneIndex === 0 ? 1 : -1;
        this.vehicleType = forcedType || pickVehicleType();
        this.isGangsterCar = this.vehicleType === 'gangsterCar';
        this.isVan = this.vehicleType === 'van';
        this.isTruck = this.vehicleType === 'truck';
        this.tuning = VEHICLE_TUNING[this.vehicleType];
        this.width = this.isTruck ? 118 + Math.random() * 18 : this.isVan ? 84 + Math.random() * 12 : this.isGangsterCar ? CAR_WIDTH + 10 + Math.random() * 8 : CAR_WIDTH + Math.random() * 8;
        this.height = this.isTruck ? 44 : this.isVan ? 36 : CAR_HEIGHT;
        this.x = this.direction === 1 ? -200 : canvas.width + 200;
        this.currentY = LANES_Y[laneIndex];
        this.baseSpeed = this.tuning.baseSpeed();
        this.currentSpeed = this.baseSpeed;
        this.sprite = this.isTruck ? pickTruckSprite() : this.isVan ? pickVanSprite() : this.isGangsterCar ? GANGSTER_CAR_SPRITE : pickCarSprite();
        this.color = this.isTruck || this.isVan ? `hsl(${Math.random() * 360}, 10%, 60%)` : `hsl(${Math.random() * 360}, 50%, 40%)`;

        this.reactionDistance = this.isTruck ? 760 + Math.random() * 300 : this.isVan ? 660 + Math.random() * 280 : this.isGangsterCar ? 620 + Math.random() * 260 : 560 + Math.random() * 240;
        this.brakeHardness = this.tuning.brakeHardness();
        this.laneSwitchSpeed = this.tuning.laneSwitchSpeed();
        this.reactionTimer = Math.floor(10 + Math.random() * 15);
        this.reactionFrames = 0;

        this.hasSeenMoose = false;
        this.isReacting = false;
        this.isSpinning = false;
        this.rotation = 0;
        this.targetRotation = 0;
        this.rotVelocity = 0;
        this.driftY = 0;
        this.wrecked = false;
        this.hasPoint = true;
        this.wreckTimer = 900; // 15 seconds @ 60fps
    }
    update() {
        if (this.wrecked) {
            this.wreckTimer--;
            return;
        }

        const dx = moose.x - this.x;
        const dy = moose.y - this.currentY;

        // Visibility Logic - Moose seen if it is in the grassy margins but NOT deep in the woods!
        const mooseSpotted = moose.y > (ROAD_TOP - VISION_MARGIN) && moose.y < (ROAD_BOTTOM + VISION_MARGIN);

        if (mooseSpotted && !this.hasSeenMoose) {
            if ((this.direction === 1 && dx > 0 && dx < this.reactionDistance) ||
                (this.direction === -1 && dx < 0 && dx > -this.reactionDistance)) {
                this.hasSeenMoose = true;
            }
        }

        if (this.hasSeenMoose && !this.isReacting && !this.isSpinning) {
            if (this.reactionTimer > 0) {
                this.reactionTimer--;
            } else {
                this.isReacting = true;
            }
        }

        if (this.isSpinning) {
            this.rotVelocity += (this.targetRotation > 0 ? 0.0008 : -0.0008);
            this.rotation += this.rotVelocity;
            if (Math.abs(this.rotation) > Math.abs(this.targetRotation)) {
                this.rotation = this.targetRotation;
            }
            this.currentSpeed *= 0.97;
            this.currentY += this.driftY;
            // Clamp drift so they don't exit screen too far
            this.currentY = Math.max(ROAD_TOP - 90, Math.min(ROAD_BOTTOM + 60, this.currentY));
            if (this.currentSpeed < 0.5) this.wrecked = true;
        } else if (this.isReacting) {
            const dist = Math.hypot(dx, dy);
            const distFactor = Math.min(1, Math.max(0, dist / this.reactionDistance));
            const effectiveBrakeHardness = this.brakeHardness + (1 - this.brakeHardness) * distFactor;

            this.currentSpeed = Math.max(this.baseSpeed * 0.4, this.currentSpeed * effectiveBrakeHardness);
            const inDanger = mooseSpotted && ((this.direction === 1 && dx > -20) || (this.direction === -1 && dx < 20));
            if (inDanger) {
                const otherLaneY = LANES_Y[1 - this.laneIndex];
                const awayDirection = moose.y > this.currentY ? -1 : 1;
                const laneDirection = Math.sign(otherLaneY - this.currentY) || awayDirection;
                const steerDirection = Math.abs(otherLaneY - moose.y) > Math.abs(this.currentY - moose.y) ? laneDirection : awayDirection;
                const lanePull = Math.abs(otherLaneY - this.currentY) > 3 ? 0.45 : 0;
                this.currentY += (steerDirection * this.laneSwitchSpeed) + ((otherLaneY - this.currentY) * 0.022 * lanePull);
                // Clamp wide dodges to not leave the road
                this.currentY = Math.max(ROAD_TOP + 10, Math.min(ROAD_BOTTOM - 30, this.currentY));

                // Dynamic Spin Chance while reacting
                this.reactionFrames++;
                const brakeSpinChance = Math.max(0, 0.995 - effectiveBrakeHardness) * 0.34; // Harder brake = higher chance
                const timeSpinChance = this.reactionFrames * 0.00004;       // Longer braking = higher chance

                let baseSpinCh = getVehicleBaseSpinChance(this.vehicleType);
                const distMultiplier = Math.pow(1 - distFactor, 2.4);

                if (Math.random() < (baseSpinCh + brakeSpinChance + timeSpinChance) * distMultiplier) {
                    this.isReacting = false;
                    this.isSpinning = true;
                    this.targetRotation = (Math.random() > 0.5 ? 1 : -1) * (0.8 + Math.random() * 0.8);
                    this.driftY = this.currentY > (LANES_Y[0] + LANES_Y[1]) / 2 ? 1.5 : -1.5;
                }
            } else {
                this.isReacting = false;
                this.hasSeenMoose = false;
                this.reactionFrames = 0;
            }
        } else {
            if (this.currentSpeed < this.baseSpeed) this.currentSpeed += 0.08;
            const targetY = LANES_Y[this.laneIndex];
            this.currentY += (targetY - this.currentY) * 0.04;
        }

        this.x += this.currentSpeed * this.direction;
    }
    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.currentY + this.height / 2);
        ctx.rotate(this.rotation);
        if (this.direction === -1) ctx.scale(-1, 1);
        ctx.translate(-this.width / 2, -this.height / 2);

        if (!this.wrecked) {
            const beamLength = this.isReacting ? 280 : 240;
            const alpha = this.isReacting ? 0.8 : 0.62;
            const beamColor = this.isReacting ? `rgba(255, 170, 150, ${alpha})` : `rgba(255, 252, 220, ${alpha})`;
            const grd = ctx.createLinearGradient(this.width, this.height / 2, this.width + beamLength, this.height / 2);
            grd.addColorStop(0, beamColor);
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.setLineDash([]);
            ctx.beginPath();
            ctx.moveTo(this.width - 5, 5);
            ctx.lineTo(this.width + beamLength, -46);
            ctx.lineTo(this.width + beamLength, 76);
            ctx.lineTo(this.width - 5, this.height - 5);
            ctx.fill();
        }

        if (this.isVan || this.isTruck) {
            if (this.sprite && this.sprite.img && this.sprite.img.complete && this.sprite.img.naturalWidth > 0) {
                const aspect = this.sprite.img.naturalWidth / this.sprite.img.naturalHeight;
                const w = this.width * (this.isTruck ? 1.22 : 1.28);
                const h = w / aspect;
                ctx.save();
                ctx.translate(this.width / 2, this.height / 2);
                ctx.rotate(Math.PI);
                if (this.isTruck && this.laneIndex === 1) ctx.scale(1, -1);
                ctx.drawImage(this.sprite.img, -w / 2, -h / 2, w, h);
                ctx.restore();
            }
        } else {
            const img = this.sprite && this.sprite.img;
            if (img && img.complete && img.naturalWidth > 0) {
                const aspect = img.naturalWidth / img.naturalHeight;
                const w = this.width * 1.16;
                const h = w / aspect;
                ctx.save();
                ctx.translate(this.width / 2, this.height / 2);
                ctx.rotate(Math.PI);
                ctx.drawImage(img, -w / 2, -h / 2, w, h);
                ctx.restore();
            } else {
                ctx.fillStyle = this.color;
                ctx.fillRect(0, 0, this.width, this.height);
                ctx.fillStyle = '#1e293b';
                ctx.fillRect(this.width - 15, 4, 12, 10);
            }
        }

        if (this.wrecked && this.hasPoint) {
            const pulse = 0.5 + Math.sin(frame * 0.1) * 0.5;
            ctx.strokeStyle = `rgba(255, 215, 0, ${pulse})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(-4, -4, this.width + 8, this.height + 8);
            ctx.fillStyle = '#ffd700';
            ctx.beginPath();
            ctx.arc(this.width / 2, -15, 6, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

function spawnCars() {
    if (frame % 284 === 0) {
        const lane = Math.floor(Math.random() * LANE_COUNT);
        const forcedTypes = ['truck', 'car', 'van'];
        const forcedType = spawnedVehicleCount < forcedTypes.length ? forcedTypes[spawnedVehicleCount] : null;
        cars.push(new Car(lane, forcedType));
        spawnedVehicleCount++;
    }
}

function checkCollision(a, b) {
    const padding = 5;
    return a.x + padding < b.x + b.width - padding &&
        a.x + a.width - padding > b.x + padding &&
        a.y + padding < b.currentY + b.height - padding &&
        a.y + a.height - padding > b.currentY + padding;
}

function isMooseTouchingLantern(target) {
    const centerX = target.x + target.width / 2;
    const centerY = target.y + target.height / 2;
    return trees.some(tree => {
        if (!tree.isLantern) return false;
        return Math.hypot(centerX - tree.x, centerY - tree.y) < LANTERN_BLOCK_RADIUS;
    });
}

function drawBackground() {
    // Fill everything with grass to avoid any black gaps
    ctx.fillStyle = '#183323';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (grassImg.complete && grassImg.naturalWidth > 0) {
        const tileSize = 96;
        for (let y = 0; y < canvas.height; y += tileSize) {
            for (let x = 0; x < canvas.width; x += tileSize) {
                ctx.drawImage(grassImg, x, y, tileSize, tileSize);
            }
        }
    }

    ctx.fillStyle = '#080a09';
    ctx.fillRect(0, ROAD_TOP + 25, canvas.width, ROAD_BOTTOM - ROAD_TOP);

    if (roadImg.complete && roadImg.naturalWidth > 0) {
        const h = ROAD_BOTTOM - ROAD_TOP;
        // Since you've fixed the road image, we can just draw it to precisely fill the physical road box height (1x scale)!
        const drawH = h;
        const w = drawH * (roadImg.naturalWidth / roadImg.naturalHeight);

        // The new image shouldn't need the 50% transparent padding scaling. We'll lay them directly edge-to-edge!
        const distance = w - 1; // -1 to prevent 1px transparent lines due to scaling decimal rendering gaps

        const drawY = ROAD_TOP + 25; // Adjusted a bit down as requested
        ctx.save();
        ctx.globalAlpha = 0.5;
        for (let x = 0; x < canvas.width; x += distance) {
            ctx.drawImage(roadImg, x, drawY, w, drawH);
        }
        ctx.restore();
    } else {
        ctx.fillStyle = '#050506';
        ctx.fillRect(0, ROAD_TOP, canvas.width, ROAD_BOTTOM - ROAD_TOP);
    }
}

function drawTree(tree) {
    if (tree.isLantern) {
        if (lanternImg.complete && lanternImg.naturalHeight > 0) {
            const aspect = lanternImg.naturalWidth / lanternImg.naturalHeight;
            const h = 120;
            const w = h * aspect;
            ctx.drawImage(lanternImg, tree.x - w / 2, tree.y - h, w, h);

            const gradient = ctx.createRadialGradient(tree.x, tree.y - h * 0.82, 8, tree.x, tree.y - h * 0.82, 72);
            gradient.addColorStop(0, 'rgba(255, 175, 90, 0.16)');
            gradient.addColorStop(1, 'rgba(255, 230, 150, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(tree.x, tree.y - h * 0.82, 72, 0, Math.PI * 2);
            ctx.fill();
        }
        return;
    }

    ctx.save();
    ctx.translate(tree.x, tree.y);
    if (tintedTreeCanvas.width > 0) {
        const aspect = tintedTreeCanvas.width / tintedTreeCanvas.height;
        const h = tree.size * 2.2;
        const w = h * aspect;
        ctx.drawImage(tintedTreeCanvas, -w / 2, -h + 15, w, h);
    } else {
        ctx.fillStyle = '#1a120b';
        ctx.fillRect(-4, 0, 8, 15);
        ctx.fillStyle = '#051b11';
        ctx.beginPath();
        ctx.moveTo(0, -tree.size);
        ctx.lineTo(-tree.size / 2.2, 0);
        ctx.lineTo(tree.size / 2.2, 0);
        ctx.fill();
    }
    ctx.restore();
}

function update() {
    if (!gameActive || isInventoryOpen()) return;
    if (moose && moose.isActionAnimating()) return;
    frame++;
    if (crashInvulnerability > 0) crashInvulnerability--;
    vitals.cold = clampStat(vitals.cold + getColdGain());
    moose.update();
    spawnCars();
    for (let i = cars.length - 1; i >= 0; i--) {
        const car = cars[i];
        car.update();
        // ONLY collide with non-wrecked cars
        if (!car.wrecked && checkCollision(moose, car)) damageMooseFromCrash(car);
        // Remove if too far or wreck expired
        if (car.x < -800 || car.x > canvas.width + 800 || (car.wrecked && car.wreckTimer <= 0)) {
            cars.splice(i, 1);
        }
    }
    renderVitals();
    checkVitalDeath();
}

function renderScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    const all = [moose, ...cars, ...trees].sort((a, b) => {
        const yA = a.y !== undefined ? a.y : a.currentY;
        const yB = b.y !== undefined ? b.y : b.currentY;
        return yA - yB;
    });
    all.forEach(obj => {
        if (obj.draw) obj.draw();
        else drawTree(obj);
    });

    const gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 160, canvas.width / 2, canvas.height / 2, canvas.width * 0.78);
    gradient.addColorStop(0, 'rgba(1, 2, 8, 0.34)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.76)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    renderScene();
    requestAnimationFrame(() => {
        update();
        draw();
    });
}

function gameOver(reason = 'The moose needs a break.') {
    deathReason = reason;
    gameActive = false;
    if (gameOverReasonEl) gameOverReasonEl.textContent = reason;
    gameOverEl.classList.remove('hidden');
}

function restart() {
    gameActive = true;
    cars = [];
    frame = 0;
    spawnedVehicleCount = 0;
    mooseCoins = 0;
    activeInventoryKey = null;
    vitals = {
        health: MAX_STAT,
        energy: MAX_STAT,
        cold: 0
    };
    deathReason = '';
    crashInvulnerability = 0;
    for (const key of Object.keys(skillLevels)) {
        skillLevels[key] = 1;
    }
    for (const key of Object.keys(inventory)) {
        inventory[key] = 0;
    }
    renderInventory();
    setInventoryOpen(false);
    const spawn = findSafeMooseSpawn();
    moose.y = spawn.y;
    moose.x = spawn.x;
    moose.smokingFramesLeft = 0;
    moose.eatingFramesLeft = 0;
    renderVitals();
    gameOverEl.classList.add('hidden');
}

function renderGameToText() {
    return JSON.stringify({
        coordinateSystem: 'origin top-left, x right, y down',
        gameActive,
        deathReason,
        paused: isInventoryOpen(),
        inventoryOpen: isInventoryOpen(),
        mooseCoins,
        hoveredInventoryItem: activeInventoryKey,
        inventory: { ...inventory },
        skills: { ...skillLevels },
        vitals: {
            health: Number(vitals.health.toFixed(1)),
            energy: Number(vitals.energy.toFixed(1)),
            cold: Number(vitals.cold.toFixed(1)),
            crashInvulnerability
        },
        moose: {
            x: Math.round(moose.x),
            y: Math.round(moose.y),
            width: moose.width,
            height: moose.height,
            direction: moose.direction,
            smokingFramesLeft: moose.smokingFramesLeft,
            eatingFramesLeft: moose.eatingFramesLeft,
            actionPaused: moose.isActionAnimating()
        },
        road: {
            top: ROAD_TOP,
            bottom: ROAD_BOTTOM,
            lanesY: LANES_Y,
            visionMargin: VISION_MARGIN
        },
        cars: cars.slice(0, 8).map(car => ({
            x: Math.round(car.x),
            y: Math.round(car.currentY),
            laneIndex: car.laneIndex,
            direction: car.direction,
            speed: Number(car.currentSpeed.toFixed(2)),
            reactionDistance: Math.round(car.reactionDistance),
            sprite: car.sprite ? car.sprite.color : 'unknown',
            vehicleType: car.vehicleType,
            hasSeenMoose: car.hasSeenMoose,
            isReacting: car.isReacting,
            isSpinning: car.isSpinning,
            wrecked: car.wrecked
        }))
    });
}

window.render_game_to_text = renderGameToText;
window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.round(ms / (1000 / 60)));
    for (let i = 0; i < steps; i++) update();
    renderScene();
};

function updateJoystick(pointerX, pointerY) {
    const rect = joystick.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = rect.width * 0.36;
    const rawX = pointerX - centerX;
    const rawY = pointerY - centerY;
    const distance = Math.hypot(rawX, rawY);
    const clampedDistance = Math.min(distance, radius);
    const angle = Math.atan2(rawY, rawX);
    const knobX = Math.cos(angle) * clampedDistance;
    const knobY = Math.sin(angle) * clampedDistance;

    joystickInput.x = radius > 0 ? knobX / radius : 0;
    joystickInput.y = radius > 0 ? knobY / radius : 0;
    joystickKnob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
}

function resetJoystick() {
    joystickInput.active = false;
    joystickInput.pointerId = null;
    joystickInput.x = 0;
    joystickInput.y = 0;
    joystickKnob.style.transform = 'translate(-50%, -50%)';
}

if (joystick && joystickKnob && mobileControls) {
    joystick.addEventListener('pointerdown', e => {
        joystickInput.active = true;
        joystickInput.pointerId = e.pointerId;
        joystick.setPointerCapture(e.pointerId);
        updateJoystick(e.clientX, e.clientY);
    });

    joystick.addEventListener('pointermove', e => {
        if (!joystickInput.active || joystickInput.pointerId !== e.pointerId) return;
        updateJoystick(e.clientX, e.clientY);
    });

    joystick.addEventListener('pointerup', resetJoystick);
    joystick.addEventListener('pointercancel', resetJoystick);
    joystick.addEventListener('lostpointercapture', resetJoystick);
}

renderInventory();
setMenuTab(activeMenuTab);

window.addEventListener('keydown', e => {
    if (e.code === 'KeyI' && !e.repeat) {
        toggleInventory();
        return;
    }
    if (isInventoryOpen() && !e.repeat && (e.code === 'KeyE' || e.code === 'KeyF' || e.code === 'KeyT')) {
        e.preventDefault();
        const sellAmount = e.code === 'KeyT' ? inventory[activeInventoryKey] : e.code === 'KeyF' ? 10 : 1;
        sellInventoryItem(activeInventoryKey, sellAmount);
        return;
    }
    if (isInventoryOpen() && !e.repeat && e.code === 'KeyU') {
        e.preventDefault();
        useInventoryItem(activeInventoryKey);
        return;
    }
    if (isInventoryOpen()) {
        e.preventDefault();
        return;
    }
    if (!e.repeat && e.code === 'KeyE') {
        eatQuickFood();
        return;
    }
    if (!e.repeat && e.code === 'KeyC') {
        smokeQuickCigarette();
        return;
    }
    keys[e.code] = true;
});
window.addEventListener('keyup', e => keys[e.code] = false);
restartBtn.addEventListener('click', restart);
if (inventoryToggle) inventoryToggle.addEventListener('click', toggleInventory);
if (inventoryClose) inventoryClose.addEventListener('click', () => setInventoryOpen(false));
menuTabs.forEach(tab => tab.addEventListener('click', () => setMenuTab(tab.dataset.menuTab)));
renderVitals();
draw();
