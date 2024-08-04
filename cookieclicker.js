// Autoplay bg music after first interaction with the page
document.addEventListener('click', _ => {
  const bgAudio = document.querySelector('#bg-music')
  bgAudio.play();
  bgAudio.addEventListener('pause', e => e.target.play());
}, { once: true });

const Game = loadFromStorage() ?? {
  counter: 0,
  buildings: {
    maker: { id: 'pingasMakerCounter', cost: 50, quantity: 0, pps: 0.2 },
    factory: { id: 'pingasFactoryCounter', cost: 150, quantity: 0, pps: 0.5 },
    asylum: { id: 'pingasAsylumCounter', cost: 250, quantity: 0, pps: 1 },
    kirpingas: { id: 'kirpingasCounter', cost: 325, quantity: 0, pps: 1.7 },
    makerDoubler: { id: 'pingasMakerEnchantCounter', cost: 500, quantity: 0, pps: 0.0, purchased: false},
    factoryDoubler: { id: 'pingasFactoryEnchantCounter', cost: 500, quantity: 0, pps: 0.0, purchased: false},
    asylumDoubler: { id: 'pingasAsylumEnchantCounter', cost: 900, quantity: 0, pps: 0.0, purchased: false},
    portal: { id: 'pingasPortalCounter', cost: 1200, quantity: 0, pps: 3 },
    pingasberg: { id: 'pingasbergCounter', cost: 2300, quantity: 0, pps: 5 },
    mtpingas: { id: 'mtpingasCounter', cost: 5000, quantity: 0, pps: 10 },
    portalDoubler: { id: 'pingasPortalEnchantCounter', cost: 6666, quantity: 0, pps: 0.0, purchased: false},
    mtpingasDoubler: { id: 'mtpingasEnchantCounter', cost: 10000, quantity: 0, pps: 0.0, purchased: false},
    pingasship: { id: 'pingasshipUnlockCounter', cost: 12500, quantity: 0, pps: 0.0, purchased: false, unlockClass: 'aliens'},
    pingalien: { id: 'pingalienCounter', cost: 15000, quantity: 0, pps: 100 },
    pingtsunemiku: { id: 'pingtsunemikuCounter', cost: 17500, quantity: 0, pps: 123 },
    pingalienDoubler: { id: 'pingalienEnchantCounter', cost: 20000, quantity: 0, pps: 0.0, purchased: false},
    pingasstation: { id: 'pingasstationCounter', cost: 26000, quantity: 0, pps: 200 },
    pingasmeteorite: { id: 'pingasmeteoriteCounter', cost: 37000, quantity: 0, pps: 350 },
    pingalienprime: { id: 'pingalienprimeCounter', cost: 50000, quantity: 0, pps: 500 },
    stationDoubler: { id: 'stationEnchantCounter', cost: 65000, quantity: 0, pps: 0.0, purchased: false},
    pingaskey: { id: 'pingaskeyUnlockCounter', cost: 90000, quantity: 0, pps: 0.0, purchased: false, unlockClass: 'endgame'},
    pingasking: { id: 'pingaskingCounter', cost: 100000, quantity: 0, pps: 1000 },
    pingascity: { id: 'pingascityCounter', cost: 130000, quantity: 0, pps: 1234 },
    pingasbrother: { id: 'pingasbrotherCounter', cost: 200000, quantity: 0, pps: 1900 },
    cityDoubler: { id: 'cityEnchantCounter', cost: 222222, quantity: 0, pps: 0.0, purchased: false},
    pingsaneteto: { id: 'pingsanetetoCounter', cost: 500000, quantity: 0, pps: 4500},
    pingastrophy: { id: 'pingastrophyCounter', cost: 1000000, quantity: 0, pps: 10000},
    trophyDoubler: { id: 'trophyEnchantCounter', cost: 5000000, quantity: 0, pps: 0.0, purchased: false},
    scholarship: { id: 'scholarshipCounter', cost: 10000000, quantity: 0, pps: 0.0},
  }
};

Game.getPPS = function() {
  return Object.values(this.buildings).reduce((acc, building) => acc += building.pps * building.quantity, 0);
}

function initialUiUpdate() {
  Object.values(Game.buildings).forEach(building => updateBuildingInfo(building));
  updateCounter();
  updatePPS();
}

initialUiUpdate();

function updateBuildingInfo(building) {
  const counterCell = document.getElementById(building.id);
  counterCell.innerHTML = building.quantity;
  if(building.purchased)
  {
    const buttonId = building.id + 'Button';
    const button = document.getElementById(buttonId);
    button.disabled = true;

    const buttonsToUnlockList = document.querySelectorAll('.'+building.unlockClass);
    buttonsToUnlockList.forEach(btn => {
      btn.disabled = false;
    });
  }
}

function loadFromStorage() {
  const gameStr = localStorage.getItem('gameStateSave');
  if(!gameStr) { 
    return null;
  }
  const gameObj = JSON.parse(gameStr);
  if(!gameObj) {
    return null;
  }
  return gameObj;
}

// Autosave every 5s
setInterval(saveToStorage, 5000);

function saveToStorage() {
  localStorage.setItem('gameStateSave', JSON.stringify(Game));
  console.log("Game saved to local storage");
}

// Refresh every 17ms = ~58.8fps
setInterval(updateGame, 17);
let lastTickTime = new Date().getTime();

function updateGame() {
  const timeNow = new Date().getTime();
  const dt = timeNow - lastTickTime;
  lastTickTime = timeNow;

  let ppsSum = Game.getPPS();
  const deltaPingas = ppsSum*(dt/1000);

  addToPingas(deltaPingas);
}

function incrementCounter() {
  var PINGAS = new Audio('public/audio/pingas.mp3');
  addToPingas(1);
  PINGAS.play();
}

function purchaseBuilding(buildingName) {
  if(Game.buildings[buildingName] === undefined) {
    console.log(`No building named ${buildingName}`);
    return;
  }
  const building = Game.buildings[buildingName];
  if (Game.counter < building.cost) {
    return;
  }

  new Audio('public/audio/boonpurchase.mp3').play();
  building.quantity += 1;
  Game.counter -= building.cost;
  document.getElementById(building.id).innerHTML = building.quantity+'';
  updatePPS();
}

function purchaseEnchant(enchantBuilding, targetBuilding, button, enchantAmount) {
  if (!Game.buildings[enchantBuilding]) {
    console.log(`No building named ${enchantBuilding}`);
    return;
  }
  if (!Game.buildings[targetBuilding]) {
    console.log(`No building named ${targetBuilding}`);
    return;
  }

  const enchant = Game.buildings[enchantBuilding];
  const target = Game.buildings[targetBuilding];

  if (enchant.purchased)
  {
    console.log('Enchant already purchased');
    return;
  }

  if (Game.counter < enchant.cost) {
    console.log('Not enough pingas to purchase enchantment');
    return;
  }

  new Audio('public/audio/boonpurchase.mp3').play();
  enchant.quantity += 1;
  Game.counter -= enchant.cost;
  document.getElementById(enchant.id).innerHTML = enchant.quantity+'';
  target.pps *= enchantAmount;
  enchant.purchased = true;
  button.disabled = true;

  updatePPS();
}

function purchaseUnlock(buildingName, buttonUnlock, buttonOtherClass) {
  if (Game.buildings[buildingName] === undefined) {
    console.log(`No building named ${buildingName}`);
    return; 
  }
  const building = Game.buildings[buildingName];
  if (building.purchased)
    {
      console.log('Unlock already purchased');
      return;
    }
  if (Game.counter < building.cost) {
    return;
  }

  new Audio('public/audio/boonpurchase.mp3').play();
  building.quantity += 1;
  Game.counter -= building.cost;
  document.getElementById(building.id).innerHTML = building.quantity + '';
  buttonUnlock.disabled = true;
  building.purchased = true;
  
  const buttonsOther = document.querySelectorAll(`.${buttonOtherClass}`);
  buttonsOther.forEach(button => {
    button.disabled = false;
  });
  
  updatePPS();
}

function purchaseWin(buildingName) {
  if(Game.buildings[buildingName] === undefined) {
    console.log(`No building named ${buildingName}`);
    return;
  }
  const building = Game.buildings[buildingName];
  if (Game.counter < building.cost) {
    return;
  }

  building.quantity += 1;
  Game.counter -= building.cost;
  document.getElementById(building.id).innerHTML = building.quantity+'';
  updatePPS();
  localStorage.clear('gameStateSave');
  window.location.assign('cookieclicker2.html');
}

function addToPingas(amount) {
  if(amount === 0) {
    return;
  }
  Game.counter += amount;
  updateCounter();
}

function updatePPS() {
  const ppsElem = document.querySelector('#pps');
  const ppsSum = Game.getPPS();
  ppsElem.innerHTML = ppsSum.toFixed(1);
}

function updateCounter() {
  const counterSpan = document.querySelector('#pingas-counter');
  counterSpan.innerHTML = Game.counter.toFixed(1);
}

