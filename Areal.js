import Cell from "./Cell.js"
import { Drag } from "./Utils.js"

export default class Areal {
    settings = {
        rows: 50,
        cols: 50,
        speed: 200,
    }

    count = 0
    generation = 0
    timeStep = 0

    allCell = []
    allCell2 = []
    changeCell = []

    canvas = document.createElement('canvas')
    ctx = this.canvas.getContext('2d')

    offsetTop = 0
    offsetLeft = 0

    cellSize = 20

    constructor({ container, rows, cols, speed, count, indexLife }) {
        this.initIndexLife = indexLife
        this.container = container
        this.elCount = count

        this.settings = {
            rows: rows || this.settings.rows,
            cols: cols || this.settings.cols,
            speed: speed || this.settings.speed
        }

        for (let i = 0, index = 0; i < this.settings.rows; i++) {
            var row = []
            for (let j = 0; j < this.settings.cols; j++, index++) {
                let cell = new Cell({ index: index, row: i, col: j, Areal: this })
                row.push(cell)
                this.allCell.push(cell)
            }
            this.allCell2.push(row)
        }

        for (let i = 0; i < this.allCell.length; i++) {
            this.allCell[i].initNeighbours()
        }

        this.#initView()
    }

    start() {
        if (this.isStart) return
        this.isStart = true
        this.#run()
    }

    stop() {
        clearInterval(this.timet)
        this.isStart = false
    }

    step() {
        let changeCell = this.changeCell,
            drawCell = []

        this.changeCell = []

        const t0 = performance.now();

        changeCell.forEach(cell => {
            drawCell.push(...cell.getAndCalcLifeNeig())
        })
        drawCell.forEach(cell => cell.run())

        this.timeStep = parseInt(performance.now() - t0)
        this.generation++
        this.#setCountView()

    }

    setSpeed(speed) {
        this.settings.speed = speed
    }

    getSpeed() {
        return this.settings.speed
    }

    setCellSize(cellSize) {
        this.cellSize = cellSize
        this.#drawAreal()
    }

    getCell({ row, col, index }) {
        if (Number.isInteger(index))
            return this.allCell[index]

        if (row < 0) row = this.settings.rows - 1
        if (col < 0) col = this.settings.cols - 1
        if (row > this.settings.rows - 1) row = 0
        if (col > this.settings.cols - 1) col = 0
        return this.allCell2[row][col]
    }

    addQueue(cells) {
        this.changeCell.push(...cells)
    }

    setGeneration(isLife) {
        if (isLife)
            this.count++
        else
            this.count--
    }

    saveStep() {
        let lifeCell = this.allCell.filter(cell => cell.getIsLife())
        if (!lifeCell.length) return
        let cordCell = lifeCell.map(cell => cell.index)

        let saveData = JSON.stringify({
            ...this.settings,
            index: cordCell
        })

        let blob = new Blob([saveData], { type: 'application/json' });

        let link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = 'game ' + new Date().toLocaleString() + '.json'
        link.click()
        URL.revokeObjectURL(link.href);
    }

    #setCountView() {
        this.elCount.count.innerHTML = this.count
        this.elCount.generation.innerHTML = this.generation

        if (this.timeStep > this.settings.speed)
            this.elCount.timeStep.innerHTML = '<span style="color: red">' + this.timeStep + '</span>'
        else
            this.elCount.timeStep.innerHTML = this.timeStep
    }

    #initView() {

        this.container.innerHTML = ''
        this.container.appendChild(this.canvas)
        this.#setCountView()

        this.containerWidth = this.container.clientWidth - 5
        this.containerHeight = this.container.clientHeight - 5
        window.addEventListener('resize', e => {
            this.containerWidth = this.container.clientWidth - 5
            this.containerHeight = this.container.clientHeight - 5
            this.#drawAreal()
        })


        this.canvas.width = this.containerWidth
        this.canvas.height = this.containerHeight

        this.#drawAreal()

        if (this.initIndexLife && Array.isArray(this.initIndexLife)) {
            this.initIndexLife.forEach(index => {
                this.getCell({ index }).toggleStatus()
            })
        }

        let selection = {}
        new Drag({
            el: this.canvas,
            start: me => {
                selection.offsetLeftStart = this.offsetLeft
                selection.offsetTopStart = this.offsetTop
            },
            move: me => {
                selection.deltaX = selection.offsetLeftStart + me.deltaX
                selection.deltaY = selection.offsetTopStart + me.deltaY
                this.offsetLeft = selection.deltaX
                this.offsetTop = selection.deltaY
                this.#drawAreal()
            },
            end: me => {
                let deltaClick = 5
                if (me.deltaX < deltaClick && me.deltaY < deltaClick && me.deltaX > -deltaClick && me.deltaY > -deltaClick) {
                    let canvasBounding = this.canvas.getBoundingClientRect()
                    let row = Math.trunc((me.upY - canvasBounding.y - this.offsetTop) / this.cellSize),
                        col = Math.trunc((me.upX - canvasBounding.x - this.offsetLeft) / this.cellSize)
                    this.getCell({ row, col }).toggleStatus()
                }
            }
        })
    }

    #drawAreal() {
        const t0 = performance.now();

        if (this.settings.cols * this.cellSize < this.container.clientWidth)
            this.canvas.width = this.settings.cols * this.cellSize
        else
            this.canvas.width = this.containerWidth

        if (this.settings.rows * this.cellSize < this.container.clientHeight)
            this.canvas.height = this.settings.rows * this.cellSize
        else
            this.canvas.height = this.containerHeight


        if (this.offsetLeft > 0) this.offsetLeft = 0
        if (this.offsetTop > 0) this.offsetTop = 0

        if (this.canvas.width - this.offsetLeft > this.settings.cols * this.cellSize)
            this.offsetLeft = this.canvas.width - 1 * this.settings.cols * this.cellSize

        if (this.canvas.height - this.offsetTop > this.settings.rows * this.cellSize)
            this.offsetTop = this.canvas.height - 1 * this.settings.rows * this.cellSize

        this.ctx.strokeStyle = '#333';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i <= this.settings.cols; i++) {
            let x = i * this.cellSize + this.offsetLeft
            if (x < 0) continue
            if (x > this.canvas.width) break
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }

        for (let i = 0; i <= this.settings.rows; i++) {
            let y = i * this.cellSize + this.offsetTop
            if (y < 0) continue
            if (y > this.canvas.height) break
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }

        this.ctx.stroke();

        let isStart = this.isStart
        if (isStart) {
            clearTimeout(this.timetStart)
            this.stop()
        }
        for (let i = 0; i < this.allCell.length; i++) {
            const cell = this.allCell[i];
            cell.setIsChangeCord()
            if (cell.getIsLife())
                cell.reDraw()
        }
        if (isStart) {
            this.timetStart = setTimeout(() => this.start(), 100)
        }

        const t1 = performance.now();
        console.log('Время рендра страницы: ', t1 - t0, 'ms.');
    }

    checkXinDispay(x) {
        console.log('this.cellSize', this.cellSize)
        console.log('x', x)
        return x > this.canvas.width || x < -this.cellSize
    }

    checkYinDispay(y) {
        return y > this.canvas.height || y < -this.cellSize
    }

    #run() {
        this.timeUpdate = this.settings.speed

        this.timet = setTimeout(() => {

            const t0 = performance.now();
            this.step()
            const t1 = performance.now();

            this.timeUpdate = this.settings.speed - parseInt(t1 - t0)
            if (this.timeUpdate < 0) this.timeUpdate = 0

            this.#run()
        }, this.timeUpdate)
    }

    loadGame() {
        return new Promise((resolve, reject) => {
            let input = document.createElement('input')
            input.type = 'file'
            input.accept = 'application/json'
            input.click()
            input.onchange = e => {
                let reader = new FileReader()
                reader.readAsText(input.files[0])
                reader.onload = e => {
                    let gameSettings = JSON.parse(reader.result)
                    console.log('gameSettings', gameSettings)

                    resolve(new Areal({
                        container: this.container,
                        count: this.elCount,
                        cols: gameSettings.cols || this.cols,
                        rows: gameSettings.rows || this.rows,
                        speed: gameSettings.speed || this.speed,
                        indexLife: gameSettings.index || []
                    }))
                }
                reader.onerror = reject
            }
        })
    }
}