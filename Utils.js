export class PinchZoom {
    isDown = false
    deltaStep = 20
    delta = 0

    constructor({ el, start, move, end }) {
        this.el = el
        this.start = start
        this.move = move
        this.end = end

        this.el.addEventListener('touchstart', e => this.Down(e))
        this.el.addEventListener('touchmove', e => this.Move(e))
        this.el.addEventListener('touchend', e => this.Up(e))
        this.el.addEventListener('touchcancel', e => this.Up(e))
    }

    Down(e) {
        e.preventDefault()
        if (e.touches.length < 2) return
        this.isDown = true
        this.downDelta = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY)
        if (this.start) this.start()
    }

    Move(e) {
        e.preventDefault()
        if (!this.isDown) return
        if (e.touches.length < 2) return
        this.moveDelta = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY)

        this.newDelta = Math.round((this.moveDelta - this.downDelta))

        if (Math.abs(this.newDelta) - Math.abs(this.delta) < this.deltaStep) return

        this.delta = this.newDelta

        if (this.move) this.move(this.delta)
    }

    Up(e) {
        e.preventDefault()
        this.isDown = false
        this.delta = 0
        if (this.end) this.end()
    }
}


export class Drag {
    isDown = false

    constructor({ el, start, move, end }) {
        this.el = el
        this.start = start
        this.move = move
        this.end = end

        this.el.addEventListener('mousedown', e => this.Down(e))
        this.el.addEventListener('touchstart', e => this.Down(e))
        this.el.addEventListener('mousemove', e => this.Move(e))
        this.el.addEventListener('touchmove', e => this.Move(e))
        this.el.addEventListener('mouseup', e => this.Up(e))
        this.el.addEventListener('touchend', e => this.Up(e))
        this.el.addEventListener('touchcancel', e => this.Up(e))

    }

    Down(e) {
        e.preventDefault()
        this.isDown = true

        this.cursorOld = this.el.style.cursor
        if (e?.touches?.length) {
            e = e.touches[0]
        }

        this.downX = e.clientX
        this.downY = e.clientY

        if (this.start) this.start(this)
    }

    Move(e) {
        e.preventDefault()
        if (!this.isDown) return

        this.el.style.cursor = 'grabbing'
        if (e?.touches?.length) {
            e = e.touches[0]
        }

        this.moveX = e.clientX
        this.moveY = e.clientY

        this.deltaX = Math.round(this.moveX - this.downX)
        this.deltaY = Math.round(this.moveY - this.downY)

        if (this.move) this.move(this)
    }

    Up(e) {
        e.preventDefault()
        this.isDown = false

        this.el.style.cursor = this.cursorOld
        if (e?.touches?.length) {
            e = e.touches[0]
        }

        this.upX = e.clientX
        this.upY = e.clientY

        this.deltaX = Math.round(this.upX - this.downX)
        this.deltaY = Math.round(this.upY - this.downY)

        if (this.end) this.end(this)
    }
}