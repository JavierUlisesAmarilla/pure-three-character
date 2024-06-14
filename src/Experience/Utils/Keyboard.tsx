export class Keyboard {
  isFront
  isLeft
  isBack
  isRight
  isFast
  isJump

  constructor() {
    this.isFront = false
    this.isLeft = false
    this.isBack = false
    this.isRight = false
    this.isFast = false
    this.isJump = false

    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.isFront = true
          break
        case 'KeyA':
          this.isLeft = true
          break
        case 'KeyS':
          this.isBack = true
          break
        case 'KeyD':
          this.isRight = true
          break
        case 'ShiftLeft':
          this.isFast = true
          break
        case 'Space':
          this.isJump = true
          break
        default:
          break
      }
    })

    document.addEventListener('keyup', (event) => {
      switch (event.code) {
        case 'KeyW':
          this.isFront = false
          break
        case 'KeyA':
          this.isLeft = false
          break
        case 'KeyS':
          this.isBack = false
          break
        case 'KeyD':
          this.isRight = false
          break
        case 'ShiftLeft':
          this.isFast = false
          break
        case 'Space':
          this.isJump = false
          break
        default:
          break
      }
    })
  }
}
