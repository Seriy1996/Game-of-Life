export default class Cell {
    isLife = false
    neighbours = []

    isChangeCord = true
    isDisplay = false
    cord = []


    isChange = false

    isChangeStatus = false
    countLifeNeig = 0
    countLifeNeigNew = 0


    constructor({ row, col, index, Areal }) {
        this.Areal = Areal
        this.row = row
        this.col = col
        this.index = index
    }

    initNeighbours() {
        if (this.neighbours.length) return
        for (let i = -1; i < 2; i++) {
            for (let j = -1; j < 2; j++) {
                if (i === 0 && j === 0) continue
                this.neighbours.push(this.Areal.getCell({
                    row: this.row + i,
                    col: this.col + j
                }))
            }
        }
        return this
    }

    toggleStatus() {
        this.isLife = !this.isLife
        this.isChangeStatus = false

        this.reDraw()

        let updateNeighbours = [this]
        for (let i = 0; i < this.neighbours.length; i++) {
            this.neighbours[i].setCountLifeNeig(this.isLife)
            if (this.neighbours[i].isChangeStatus) {
                updateNeighbours.push(this.neighbours[i])
            }
        }
        this.Areal.addQueue(updateNeighbours)
        this.Areal.setGeneration(this.isLife)

        return this
    }

    calcIsChange() {
        this.isChange = this.countLifeNeig !== this.countLifeNeigNew
        this.countLifeNeig = this.countLifeNeigNew

        if (this.isLife) {
            if (!(this.countLifeNeig === 2 || this.countLifeNeig === 3)) {
                this.isChangeStatus = true
            }
        } else {
            if (this.countLifeNeig === 3) {
                this.isChangeStatus = true
            }
        }

        return this.isChangeStatus
    }

    getAndCalcLifeNeig() {
        this.calcIsChange()
        return [...this.neighbours.filter(e => e.calcIsChange()), this]

    }

    getIsLife() {
        return this.isLife
    }

    setCountLifeNeig(isLife) {
        if (isLife)
            this.countLifeNeigNew++
        else
            this.countLifeNeigNew--
    }

    run() {
        if (this.isChangeStatus) {
            this.toggleStatus()
        }
    }

    reDraw() {
        let [x, y, w, h] = this.getCoordinates()

        if (this.isDisplay) return

        if (this.isLife) {
            this.Areal.ctx.fillStyle = '#222';
            this.Areal.ctx.fillRect(x, y, w, h)
        } else {
            this.Areal.ctx.clearRect(x, y, w, h)
        }
    }

    setIsChangeCord() {
        this.isChangeCord = true
    }

    getCoordinates() {
        if (this.isChangeCord) {
            let x = this.col * this.Areal.cellSize + 2 + this.Areal.offsetLeft,
                y = this.row * this.Areal.cellSize + 2 + this.Areal.offsetTop,
                width = this.Areal.cellSize - 4

            if (width < 1)
                width = 1

            this.cord = [x, y, width, width]
            this.isDisplay = this.Areal.checkXinDispay(x) || this.Areal.checkYinDispay(y)
            this.isChangeCord = false
        }

        return this.cord
    }
}