import {Experience} from '../Experience'
import {Room} from './Room'

export class World {
  room!: Room

  constructor() {
    const experience = new Experience()
    experience.loaders?.on('ready', () => {
      this.room = new Room()
    })
  }

  update() {
    if (this.room) {
      this.room.update()
    }
  }
}
