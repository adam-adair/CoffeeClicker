/* eslint-disable no-alert */

/**************
 *   SLICE 1
 **************/

function updateCoffeeView(coffeeQty) {
  document.getElementById('coffee_counter').innerText = coffeeQty
}

function clickCoffee(data) {
  data.coffee += data.clickValue ? data.clickValue : 1
  updateCoffeeView(data.coffee)
  renderProducers(data)
}

/**************
 *   SLICE 2
 **************/

function unlockProducers(producers, coffeeCount) {
  for(let prod of producers) {
    if(!prod.unlocked && coffeeCount >= prod.price/2) {prod.unlocked = true}
  }
}

function getUnlockedProducers(data) {
  return data.producers.filter(prod => prod.unlocked)
}

function makeDisplayNameFromId(id) {
  return id.split('_').map(word => word[0].toUpperCase() + word.slice(1)).join(' ')
}

// You shouldn't need to edit this function-- its tests should pass once you've written makeDisplayNameFromId
function makeProducerDiv(producer, coffee) {
  const containerDiv = document.createElement('div');
  containerDiv.className = 'producer';
  const displayName = makeDisplayNameFromId(producer.id);
  const currentCost = producer.price;
  let buyable
  if (coffee) {
    buyable = coffee >= currentCost ? '' : 'disabled'
  } else {
    buyable = ''
  }
  const sellable = producer.qty > 0 ? '' : 'hidden'
  const html = `
  <div class="producer-column">
    <div class="producer-title">${displayName}</div>
    <button type="button" ${buyable} id="buy_${producer.id}">Buy</button>
    <button type="button" ${sellable} id="sell_${producer.id}">Sell</button>
  </div>
  <div class="producer-column">
    <div>Quantity: ${producer.qty}</div>
    <div>Coffee/second: ${producer.cps}</div>
    <div>Cost: ${currentCost} coffee</div>
    <div ${sellable}>Sale Price: ${Math.ceil(currentCost/2)} coffee</div>
  </div>
  `;
  containerDiv.innerHTML = html;
  return containerDiv;
}

function deleteAllChildNodes(parent) {
  [...parent.childNodes].map(child => parent.removeChild(child))
}

function renderProducers(data) {
  let producerContainer = document.getElementById('producer_container')
  deleteAllChildNodes(producerContainer)
  unlockProducers(data.producers, data.coffee)
  let unlockedProducers = getUnlockedProducers(data)
  unlockedProducers.map(prod => producerContainer.appendChild(makeProducerDiv(prod, data.coffee)))
  let upgradeContainer = document.getElementById('upgrade-container')

  if(upgradeContainer !== null) {
    if(data.clickValue === 1 && data.coffee >= 100) {
     upgradeContainer.style.backgroundColor = 'white'
    } else {
      upgradeContainer.style.backgroundColor = 'grey'
    }
    if(data.clickValue === 2) {
      document.querySelector('#upgrade-container > span:nth-child(2)').innerText = '✅'
    } else {
      document.querySelector('#upgrade-container > span:nth-child(2)').innerText = '(100c)'
    }
  }
}

/**************
 *   SLICE 3
 **************/

function getProducerById(data, producerId) {
  return data.producers.filter(prod => prod.id === producerId)[0]
}

function canAffordProducer(data, producerId) {
  return data.coffee >= getProducerById(data, producerId).price
}

function updateCPSView(cps) {
  document.getElementById('cps').innerText = cps
}

function updatePrice(oldPrice) {
  return Math.floor(oldPrice * 1.25)
}

function attemptToBuyProducer(data, producerId) {
  if (canAffordProducer(data, producerId)) {
    let boughtProducer = getProducerById(data, producerId);
    boughtProducer.qty++
    data.coffee -= boughtProducer.price
    boughtProducer.price = updatePrice(boughtProducer.price)
    data.totalCPS += boughtProducer.cps
    //updateCPSView(data.totalCPS)
    return true
  } else {
    return false
  }
}

function buyButtonClick(event, data) {
  let clickedProducer = event.target
  if (clickedProducer.tagName === 'BUTTON') {
    if (attemptToBuyProducer(data, clickedProducer.id.replace('buy_',''))) {
      renderProducers(data)
      updateCoffeeView(data.coffee)
      updateCPSView(data.totalCPS)
    } else {
      window.alert('Not enough coffee!')
    }
  }
}

function sellButtonClick(event, data) {
  let clickedProducer = event.target
  if (clickedProducer.tagName === 'BUTTON') {
    let soldProducer = getProducerById(data, clickedProducer.id.replace('sell_',''));
    soldProducer.qty--
    data.totalCPS -= soldProducer.cps
    data.coffee += Math.ceil(soldProducer.price/2)
    renderProducers(data)
    updateCoffeeView(data.coffee)
    updateCPSView(data.totalCPS)
  }
}

function tick(data) {
  data.coffee += data.totalCPS
  renderProducers(data)
  updateCoffeeView(data.coffee)
}

function save(data) {
  localStorage.setItem('data', JSON.stringify(data));
}

function resetGame(data, source) {
  data.load(source)
  renderProducers(data)
  updateCoffeeView(data.coffee)
  updateCPSView(data.totalCPS)
}

function upgradeClicks(data) {
  if(data.coffee >= 100 && data.clickValue !== 2) {
    data.coffee -= 100
    data.clickValue = 2
    renderProducers(data)
    updateCoffeeView(data.coffee)
    updateCPSView(data.totalCPS)
  }
}
/*************************
 *  Start your engines!
 *************************/

// You don't need to edit any of the code below
// But it is worth reading so you know what it does!

// So far we've just defined some functions; we haven't actually
// called any of them. Now it's time to get things moving.

// We'll begin with a check to see if we're in a web browser; if we're just running this code in node for purposes of testing, we don't want to 'start the engines'.

// How does this check work? Node gives us access to a global variable /// called `process`, but this variable is undefined in the browser. So,
// we can see if we're in node by checking to see if `process` exists.
if (typeof process === 'undefined') {
  // Get starting data from the window object
  // (This comes from data.js)

  // let data = window.data

  //creates a data object from an input object; can change definitions in data.js
  class Data {
    constructor () {
      this.coffee = 0
      this.totalCPS = 0
      this.clickValue = 1
      this.producers = []
    }
    //loads values into data object
    load(source) {
      this.coffee = source.coffee
      this.totalCPS = source.totalCPS
      this.clickValue = source.clickValue ? source.clickValue : 1
      this.producers = []
      source.producers.map((prod, ix) => {
        this.producers[ix] = {}
        this.producers[ix].id = prod.id
        this.producers[ix].price = prod.price
        this.producers[ix].unlocked = prod.unlocked
        this.producers[ix].qty = prod.qty
        this.producers[ix].cps = prod.cps
      })
    }
  }

  // loads data from localstorage if it exists, otherwise uses window.data as template
  const popData = localStorage.data ? JSON.parse(localStorage.data) : window.data
  const data = new Data()
  data.load(popData)

  //draws whatever's been loaded for the first time
  renderProducers(data)
  updateCoffeeView(data.coffee)
  updateCPSView(data.totalCPS)

  // Add an event listener to the giant coffee emoji
  const bigCoffee = document.getElementById('big_coffee');
  bigCoffee.addEventListener('click', () => clickCoffee(data));

  // Add an event listener to the container that holds all of the producers
  // Pass in the browser event and our data object to the event listener
  const producerContainer = document.getElementById('producer_container');
  producerContainer.addEventListener('click', event => {
    if (event.target.id.slice(0,4) === 'buy_') {
      buyButtonClick(event, data);
    } else {
      sellButtonClick(event, data);
    }
  });

  const reset = document.getElementById('reset');
  reset.addEventListener('click', () => resetGame(data, window.data));

  const upgrade = document.getElementById('upgrade-container');
  upgrade.addEventListener('click', () => upgradeClicks(data));

  // Call the tick function passing in the data object once per second
  setInterval(() => tick(data), 1000);

  // save the data to localstorage every 15 seconds
  setInterval(() => save(data), 15000);

}
// Meanwhile, if we aren't in a browser and are instead in node
// we'll need to exports the code written here so we can import and
// Don't worry if it's not clear exactly what's going on here;
// We just need this to run the tests in Mocha.
else if (process) {
  module.exports = {
    updateCoffeeView,
    clickCoffee,
    unlockProducers,
    getUnlockedProducers,
    makeDisplayNameFromId,
    makeProducerDiv,
    deleteAllChildNodes,
    renderProducers,
    updateCPSView,
    getProducerById,
    canAffordProducer,
    updatePrice,
    attemptToBuyProducer,
    buyButtonClick,
    tick
  };
}
