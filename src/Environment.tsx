import {EquirectangularReflectionMapping} from 'three'
import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader'
import {Experience} from './Experience'

export class Environment {
  scene

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.initLight()
  }

  async initLight() {
    if (!this.scene) {
      return
    }
    const hdrLoader = new RGBELoader()
    const envMap = await hdrLoader.loadAsync(
        'envMap/blouberg_sunrise_2_1k.hdr',
    )
    envMap.mapping = EquirectangularReflectionMapping
    this.scene.environment = envMap
    this.scene.background = envMap
  }
}
