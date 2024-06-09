import Areal from "./Areal.js"
import { PinchZoom } from "./Utils.js"

const
    btnStart = document.querySelector('.start'),
    btnStop = document.querySelector('.stop'),
    btnStep = document.querySelector('.step'),
    btnPause = document.querySelector('.pause'),
    btnSpeed = document.querySelector('.speed'),
    spanZoom = document.querySelector('.zoom-info'),
    inputZoom = document.querySelector('.zoom'),

    gameCont = document.querySelector('.game'),

    settingsDialog = document.querySelector('#settings'),
    saveGame = document.querySelector('#saveGame'),
    loadGame = document.querySelector('#loadGame')

let areal = new Areal({
    container: gameCont,
    count: {
        generation: document.querySelector('.generation'),
        count: document.querySelector('.count'),
        timeStep: document.querySelector('.timeStep')
    }
})

btnStart.addEventListener('click', e => {
    btnStart.classList.add('active')
    btnPause.classList.remove('active')
    areal.start()
})

btnPause.addEventListener('click', e => {
    btnStart.classList.remove('active')
    btnPause.classList.add('active')
    areal.stop()
})

btnStep.addEventListener('click', e => {
    btnStart.classList.remove('active')
    btnPause.classList.remove('active')
    btnStep.classList.add('active')
    areal.stop()
    areal.step()
    btnPause.classList.add('active')
    btnStep.classList.remove('active')
})

btnSpeed.addEventListener('click', e => {
    if (btnSpeed.classList.contains('active')) {
        btnSpeed.classList.remove('active')
        areal.setSpeed(areal.getSpeed() * 2)
    } else {
        btnSpeed.classList.add('active')
        areal.setSpeed(areal.getSpeed() / 2)
    }
})


inputZoom.addEventListener('change', e => {
    areal.setCellSize(inputZoom.value)
})
inputZoom.addEventListener('input', e => {
    spanZoom.innerHTML = inputZoom.value
})
inputZoom.addEventListener('wheel', e => {
    let val = e.deltaY > 0 ? -(-inputZoom.step) : (-inputZoom.step)
    zoom(inputZoom.value - val)
})
gameCont.addEventListener('wheel', e => {
    let val = e.deltaY > 0 ? -(-inputZoom.step) : (-inputZoom.step)
    zoom(inputZoom.value - val)
})
function zoom(newVal) {
    if (newVal > inputZoom.max && newVal < inputZoom.min) return
    inputZoom.value = newVal
    spanZoom.innerHTML = inputZoom.value
    areal.setCellSize(inputZoom.value)
}
new PinchZoom({
    el: gameCont,
    move(delta) {
        let val = delta > 0 ? -(-inputZoom.step) : (-inputZoom.step)
        zoom(inputZoom.value - -val)
    }
})

btnStop.addEventListener('click', e => {
    btnStop.classList.remove('active')
    btnStop.classList.remove('active')
    btnPause.click()
    settingsDialog.showModal()
})

settingsForm.addEventListener('submit', e => {
    let formData = new FormData(e.target),
        settings = {}

    formData.forEach((value, name) => {
        settings[name] = value
    })

    inputZoom.value = 20
    spanZoom.innerHTML = 20
    btnSpeed.classList.remove('active')

    if (settings.randomCell) {
        let length = (settings.rows * settings.cols) - 1
        settings.indexLife = [...new Array(Math.round(length * .2))].map(() => Math.round(Math.random() * length))
    }

    areal = new Areal({
        ...settings,
        container: gameCont,
        count: areal.elCount
    })
})

saveGame.addEventListener('click', e => {
    areal.saveStep()
})

loadGame.addEventListener('click', async e => {
    // settingsDialog.classList.add('loader')
    areal = await areal.loadGame()
    settingsDialog.close()
    // settingsDialog.classList.remove('loader')

    inputZoom.value = 20
    spanZoom.innerHTML = 20
})
