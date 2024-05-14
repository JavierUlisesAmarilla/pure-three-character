import {DirectionalLight, PointLight} from 'three'
import {Experience} from './Experience'
import {LIGHT_COLOR, LIGHT_INTENSITY} from './constants'

export class Light {
  scene

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.initLight()
  }

  initLight() {
    if (!this.scene) {
      return
    }
    const directionalLight = new DirectionalLight(LIGHT_COLOR, LIGHT_INTENSITY)
    directionalLight.position.set(-5, 5, 5)
    this.scene.add(directionalLight)
    const pointLight = new PointLight(LIGHT_COLOR, LIGHT_INTENSITY, 0, 0)
    pointLight.position.set(5, 5, 5)
    pointLight.power = 10
    this.scene.add(pointLight)
  }
}
