import {Experience} from '../Experience'
import {Ground} from './Ground'

export class World {
  ground!: Ground

  constructor() {
    const experience = new Experience()
    experience.loaders?.on('ready', () => {
      this.ground = new Ground()
    })
  }

  update() {
    if (this.ground) {
      this.ground.update()
    }
  }
}
