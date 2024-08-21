//TODO:
//      - make everything work with localstorage
//      - add color button
//      - 
//
//SETTINGS
const sectorslist = [
    { color: '#f82', label: 'British' },
    { color: '#0bf', label: 'American' },
    { color: '#9bf', label: 'Swenglish' },
    { color: '#fb0', label: 'Indian' },
]

const spinPrompt = document.querySelector('#spin-prompt')
const spinResult = document.querySelector('#spin-result')
const title = document.querySelector('#title')
const description = document.querySelector('#description')
const inputAdd = document.querySelector('#input-add')
const buttonAdd = document.querySelector('#btn-add')
const buttonEdit = document.querySelector('#btn-edit')
const buttonSave = document.querySelector('#btn-save')
const submitsContainer = document.querySelector('#container-submits')
const submits = document.querySelector('.submits')
const buttonColor = document.querySelectorAll('.btn-color')
const settingsPanel = document.querySelector('#spin-settings')

const inputTitle = document.querySelector("#input-title")
const inputDesc = document.querySelector("#input-desc")
const inputPrompt = document.querySelector("#input-prompt")

let sectors = []

buttonAdd.addEventListener('click', () => {
  if (inputAdd.value && !angVel && selectedColor) {
    const oldSectors = JSON.parse(localStorage.getItem("sectors"))
    const newSector = { color: selectedColor, label: inputAdd.value }

    if (oldSectors) {
      oldSectors.push(newSector)
      localStorage.setItem("sectors", JSON.stringify(oldSectors))
    }

    if (!oldSectors) {
      aSector = []
      aSector[0] = newSector
      localStorage.setItem("sectors", JSON.stringify(aSector))
    }

    inputAdd.value = ""
    selectedColor = ""
    clearColors()
    updateSubmits()
    sound_add.play()
  }
})

function clearColors() {
  for (let i of buttonColor) {
    i.style.border = "none"
  }
}

let selectedColor
for (let i of buttonColor) {
  i.addEventListener("click", () => {
    clearColors()
    i.style.border = "2px solid black"
    selectedColor = i.style.backgroundColor
  })
}

buttonEdit.addEventListener("click", () => {
  console.log(settingsPanel.style.display)
  if (settingsPanel.style.display == "block") {
    settingsPanel.style.display = "none"
  } else {
    settingsPanel.style.display = "block"
  }
})

buttonSave.addEventListener("click", () => {
  localStorage.setItem("title", inputTitle.value)
  localStorage.setItem("description", inputDesc.value)
  localStorage.setItem("prompt", inputPrompt.value)

  inputTitle.value = ""
  inputDesc.value = ""
  inputPrompt.value = ""

  updateInterface()
})

function updateInterface() {
  const t = localStorage.getItem("title")
  const d = localStorage.getItem("description")
  const p = localStorage.getItem("prompt")

  if (t) {
    title.innerHTML = t
    description.innerHTML = d
    spinPrompt.innerHTML = p
  }
}

function updateSubmits() {
  sectors = JSON.parse(localStorage.getItem("sectors"))
  submitsContainer.innerHTML = ""

  if (!sectors) {
    localStorage.setItem("sectors", JSON.stringify([]))
    sectors = JSON.parse(localStorage.getItem("sectors"))
  }

  if (sectors.length) {
    sectors.forEach((sector, key) => {
      const newSubmit = document.createElement("button");
      const text = sector.label
      newSubmit.id = key
      newSubmit.innerHTML = text
      newSubmit.type = "button"
      newSubmit.className = "submits"
      newSubmit.style.background = sector.color
      submitsContainer.appendChild(newSubmit)

      newSubmit.addEventListener("click", () => {
        if (!angVel) {
          oldSectors = JSON.parse(localStorage.getItem("sectors"))
          oldSectors.splice(key, 1)
          localStorage.setItem("sectors", JSON.stringify(oldSectors))
          updateSubmits()
          sound_click.play()
        }
      })
    })
  }

  ctx.clearRect(0,0, 500, 500)
  tot = sectors.length
  arc = TAU / sectors.length

  getIndex = () => Math.floor(tot - (ang / TAU) * tot) % tot

  sectors.forEach(drawSector)

  if (sectors.length == 0) {
    ctx.fillStyle = '#888'
    ctx.fill()
    ctx.fillText("", rad - 10, 10)
    spinEl.style.background = '#666'
  }
}

function playSound() {
  let effect = new Audio("pop.mp3")
  effect.play()
}

const sound_win = new Audio("win.mp3")
const sound_click = new Audio("pop2.mp3")
const sound_add = new Audio("add.mp3")

let lastIndex = 0
let clicked = 0
const rand = (m, M) => Math.random() * (M - m) + m
let tot
const spinEl = document.querySelector('#spin')
const ctx = document.querySelector('#wheel').getContext('2d')
const dia = ctx.canvas.width
const rad = dia / 2
const PI = Math.PI
const TAU = 2 * PI
let arc
const friction = 0.991 // 0.995=soft, 0.99=mid, 0.98=hard
let angVel = 0 // Angular velocity
let ang = 0 // Angle in radians

let getIndex 

function drawSector(sector, i) {
    const ang = arc * i
    ctx.save()
    // COLOR
    ctx.beginPath()
    ctx.fillStyle = sector.color
    ctx.moveTo(rad, rad)
    ctx.arc(rad, rad, rad, ang, ang + arc)
    ctx.lineTo(rad, rad)
    ctx.fill()
    // TEXT
    ctx.translate(rad, rad)
    ctx.rotate(ang + arc / 2)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 32px sans-serif'
    ctx.fillText(sector.label, rad - 10, 10)
    //
    ctx.restore()
    spinEl.style.background = sector.color
}

function rotate() {
  const sector = sectors[getIndex()]
  ctx.canvas.style.transform = `rotate(${ang - PI / 2}rad)`
  if (sector) {
    spinEl.style.background = sector.color
  }

  if ((getIndex() != lastIndex) && angVel) {
    playSound()
  }

  lastIndex = getIndex()
  
  if (!angVel && clicked) {
    document.querySelector('#spin-result').innerHTML = sector.label
    document.querySelector('#spin-result').style.color = sector.color
    sound_win.play()
    clicked = 0
  }
}

function frame() {
  if (!angVel) return
  angVel *= friction // Decrement velocity by friction
  if (angVel < 0.002) angVel = 0 // Bring to stop
  ang += angVel // Update angle
  ang %= TAU // Normalize angle
  rotate()
}

function engine() {
  frame()
  requestAnimationFrame(engine)
}

function init() {
  rotate() // Initial rotation
  engine() // Start engine
  // init localstorage if empty
  spinEl.addEventListener('click', () => {
    if (!angVel && sectors.length > 0) angVel = rand(0.45, 0.65)
    document.querySelector('#spin-result').innerHTML = ""
    clicked = 1
  })
}

updateSubmits()
updateInterface()
init()
