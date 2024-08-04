import {DirectionalLight, HemisphereLight} from 'three'

import {Experience} from './Experience'

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
    const hemiLight = new HemisphereLight(0xffffff, 0x8d8d8d, 1)
    hemiLight.position.set(0, 20, 0)
    this.scene.add(hemiLight)

    const dirLight = new DirectionalLight(0xffffff, 1)
    dirLight.position.set(-3, 10, -10)
    dirLight.castShadow = true
    dirLight.shadow.camera.top = 2
    dirLight.shadow.camera.bottom = -2
    dirLight.shadow.camera.left = -2
    dirLight.shadow.camera.right = 2
    dirLight.shadow.camera.near = 0.1
    dirLight.shadow.camera.far = 40
    this.scene.add(dirLight)
  }
}
