import {AnimationMixer, DoubleSide, Mesh, PlaneGeometry} from 'three'
import {Experience} from '../Experience'
import {Materials} from './Materials'

export class Room {
  scene
  materials
  time
  resource
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  ventilo1: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  ventilo2: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  ventilo3: any
  groupVentilo1
  groupVentilo2
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  model: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  smokeCoffee: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  animation: any

  constructor() {
    const experience = new Experience()
    this.scene = experience.scene
    this.time = experience.time
    this.materials = new Materials()
    this.resource = experience.loaders?.items.fullModel
    this.setModel()
    this.setAnimation()
    this.groupVentilo1 = [this.ventilo1]
    this.groupVentilo2 = [this.ventilo2, this.ventilo3]
  }

  setModel() {
    if (!this.scene) {
      return
    }
    const overlayGeometry = new PlaneGeometry(2, 2, 1, 1)
    const overlay = new Mesh(overlayGeometry, this.materials.materials[12])
    this.scene.add(overlay)
    this.model = this.resource.scene
    this.scene.add(this.model)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
    this.model.traverse((child: any) => {
      if (child.name.includes('Touche')) {
        child.material = this.materials.materials[0]
      }

      switch (child.name) {
        case 'Piano':
        case 'Interface':
        case 'Feuille':
        case 'Souris':
          child.material = this.materials.materials[0]
          child.material.side = DoubleSide
          break
        case 'AlimRed':
        case 'Bitcoin':
        case 'Box':
        case 'ButtonTour':
        case 'Chaise':
        case 'Clavier':
        case 'Ecrans':
        case 'ETH':
        case 'Lampe':
        case 'OrangeButtonEcran':
        case 'Plante':
        case 'Pot001':
          child.material = this.materials.materials[1]
          child.material.side = DoubleSide
          break
        case 'MapMonde':
        case 'Etagere':
        case 'Telephone':
        case 'Bureau':
        case 'Enceinte1':
        case 'Enceinte2':
        case 'Tasse':
        case 'Pot':
        case 'Terre':
        case 'Tige':
        case 'Mur1':
        case 'Mur2':
        case 'Sol':
        case 'Plainte1':
        case 'Plainte2':
          child.material = this.materials.materials[2]
          break
        case 'Tour':
          child.material = this.materials.materials[2]
          child.material.side = DoubleSide
          break
        case 'Dog':
        case 'Langue':
        case 'Queue':
          child.material = this.materials.materials[3]
          child.frustumCulled = false
          child.material.side = DoubleSide
          break
        case 'EcranTelephone':
          child.material = this.materials.materials[6]
          break
        case 'ImgEcran2':
          child.material = this.materials.materials[4]
          break
        case 'ImgEcran1':
          child.material = this.materials.materials[5]
          break
        case 'ComputerButton':
        case 'RGB':
          child.material = this.materials.materials[10]
          child.material.side = DoubleSide
          break
        case 'Ventilo':
          this.ventilo1 = child
        // eslint-disable-next-line no-fallthrough -- TODO
        case 'Ventilo2':
          this.ventilo2 = child
        // eslint-disable-next-line no-fallthrough -- TODO
        case 'Ventilo3':
          this.ventilo3 = child
        // eslint-disable-next-line no-fallthrough -- TODO
        case 'alim':
        case 'Armature':
        case 'BlackCgu':
        case 'Composantmotherboard':
        case 'cpu':
        case 'Ram':
        case 'Tapis':
        case 'WaterCooling':
          child.material = this.materials.materials[7]
          break
        case 'GreyCgu':
        case 'motherboard':
          child.material = this.materials.materials[8]
          break
        case 'vitre':
          child.material = this.materials.materials[9]
          child.material.side = DoubleSide
          break
        case 'SmokeCoffee':
          this.smokeCoffee = child
          child.material = this.materials.materials[11]
          break
        default:
          break
      }
    })
  }

  setAnimation() {
    this.animation = {}
    this.animation.mixer = new AnimationMixer(this.model)
    this.animation.action = this.animation.mixer.clipAction(
        this.resource.animations[0],
    )
    this.animation.action.play()
  }

  update() {
    if (!this.time) {
      return
    }
    this.animation.mixer.update(this.time.delta * 0.001)
    this.smokeCoffee.material.uniforms.uTime.value = this.time.elapsed
    if (this.groupVentilo1[0]) {
      this.groupVentilo1[0].rotation.x = this.time.elapsed
    }

    if (this.groupVentilo2[0]) {
      this.groupVentilo2[0].rotation.y = this.time.elapsed
      this.groupVentilo2[1].rotation.y = this.time.elapsed
    }
  }
}
