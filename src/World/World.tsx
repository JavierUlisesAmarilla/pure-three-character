import {Experience} from '../Experience'
import {Character} from './Character'
import {Ground} from './Ground'

export class World {
  ground!: Ground
  character!: Character

  constructor() {
    const experience = new Experience()
    experience.loaders?.on('ready', () => {
      this.ground = new Ground()
      this.ground = new Character()
    })
  }

  update() {
    if (this.ground) {
      this.ground.update()
    }
  }
}
