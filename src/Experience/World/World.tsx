import {Character} from './Character'
import {Ground} from './Ground'

export class World {
  ground: Ground
  character: Character

  constructor() {
    this.ground = new Ground()
    this.character = new Character()
  }

  update() {
    this.character.update()
  }
}
