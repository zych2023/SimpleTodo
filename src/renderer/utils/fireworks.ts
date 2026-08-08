interface Position {
  x: number
  y: number
}

interface CircleOrigin {
  origin: Position
  speed: number
  color: string
  angle: number
  context: CanvasRenderingContext2D
}

class Circle {
  origin: Position
  position: Position
  color: string
  speed: number
  angle: number
  context: CanvasRenderingContext2D
  renderCount: number

  constructor({ origin, speed, color, angle, context }: CircleOrigin) {
    this.origin = origin
    this.position = { ...this.origin }
    this.color = color
    this.speed = speed
    this.angle = angle
    this.context = context
    this.renderCount = 0
  }

  draw(): void {
    this.context.fillStyle = this.color
    this.context.beginPath()
    this.context.arc(this.position.x, this.position.y, 2, 0, Math.PI * 2)
    this.context.fill()
  }

  move(): void {
    this.position.x = Math.sin(this.angle) * this.speed + this.position.x
    this.position.y =
      Math.cos(this.angle) * this.speed +
      this.position.y +
      this.renderCount * 0.3
    this.renderCount++
  }
}

interface BoomOptions {
  origin: Position
  context: CanvasRenderingContext2D
  circleCount?: number
  area: { width: number; height: number }
}

class Boom {
  origin: Position
  context: CanvasRenderingContext2D
  circleCount: number
  area: { width: number; height: number }
  stop: boolean
  circles: Circle[]

  constructor({ origin, context, circleCount = 10, area }: BoomOptions) {
    this.origin = origin
    this.context = context
    this.circleCount = circleCount
    this.area = area
    this.stop = false
    this.circles = []
  }

  randomArray<T>(range: T[]): T {
    const length = range.length
    const randomIndex = Math.floor(length * Math.random())
    return range[randomIndex]
  }

  randomColor(): string {
    const range = ['8', '9', 'A', 'B', 'C', 'D', 'E', 'F']
    return (
      '#' +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range) +
      this.randomArray(range)
    )
  }

  randomRange(start: number, end: number): number {
    return (end - start) * Math.random() + start
  }

  init(): void {
    for (let i = 0; i < this.circleCount; i++) {
      const circle = new Circle({
        context: this.context,
        origin: this.origin,
        color: this.randomColor(),
        angle: this.randomRange(Math.PI - 1, Math.PI + 1),
        speed: this.randomRange(1, 6)
      })
      this.circles.push(circle)
    }
  }

  move(): void {
    // Fix: use filter instead of forEach+splice to avoid skipping elements
    this.circles = this.circles.filter((circle) => {
      if (
        circle.position.x > this.area.width ||
        circle.position.y > this.area.height
      ) {
        return false
      }
      circle.move()
      return true
    })

    if (this.circles.length === 0) {
      this.stop = true
    }
  }

  draw(): void {
    this.circles.forEach((circle) => circle.draw())
  }
}

class CursorSpecialEffects {
  private renderCanvas: HTMLCanvasElement | null = null
  private computerCanvas: HTMLCanvasElement | null = null
  private computerContext: CanvasRenderingContext2D | null = null
  private renderContext: CanvasRenderingContext2D | null = null
  private globalWidth = 0
  private globalHeight = 0
  private booms: Boom[] = []
  private running = false
  private boundRun: () => void

  constructor() {
    // Fix: cache bound function instead of creating new one every frame
    this.boundRun = this.run.bind(this)
  }

  reset(): void {
    if (this.renderCanvas) {
      document.body.removeChild(this.renderCanvas)
    }

    this.computerCanvas = document.createElement('canvas')
    this.renderCanvas = document.createElement('canvas')

    this.computerContext = this.computerCanvas.getContext('2d')!
    this.renderContext = this.renderCanvas.getContext('2d')!

    this.globalWidth = window.innerWidth
    this.globalHeight = window.innerHeight

    this.booms = []
    this.running = false

    this.initCanvas()
  }

  handleMouseDown(e: MouseEvent): void {
    this.reset()

    const boom = new Boom({
      origin: { x: e.clientX, y: e.clientY },
      context: this.computerContext!,
      area: {
        width: this.globalWidth,
        height: this.globalHeight
      }
    })
    boom.init()
    this.booms.push(boom)

    if (!this.running) {
      this.running = true
      this.boundRun()
    }
  }

  private initCanvas(): void {
    if (!this.renderCanvas) return

    const style = this.renderCanvas.style
    style.position = 'fixed'
    style.top = style.left = '0'
    style.zIndex = '999999'
    style.pointerEvents = 'none'

    this.renderCanvas.width = this.computerCanvas!.width = this.globalWidth
    this.renderCanvas.height = this.computerCanvas!.height = this.globalHeight
    style.width = this.globalWidth + 'px'
    style.height = this.globalHeight + 'px'

    document.body.append(this.renderCanvas)
  }

  private run(): void {
    if (this.booms.length === 0) {
      this.running = false
      return
    }

    requestAnimationFrame(this.boundRun)

    if (!this.computerCanvas || !this.renderCanvas) return
    if (this.computerCanvas.width === 0 || this.computerCanvas.height === 0) {
      this.running = false
      return
    }

    this.computerContext!.clearRect(0, 0, this.globalWidth, this.globalHeight)
    this.renderContext!.clearRect(0, 0, this.globalWidth, this.globalHeight)

    this.booms = this.booms.filter((boom) => {
      if (boom.stop) return false
      boom.move()
      boom.draw()
      return true
    })

    this.renderContext!.drawImage(
      this.computerCanvas,
      0,
      0,
      this.globalWidth,
      this.globalHeight
    )
  }
}

export default new CursorSpecialEffects()
