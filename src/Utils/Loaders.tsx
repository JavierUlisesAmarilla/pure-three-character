import {LoadingManager, TextureLoader} from 'three'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {AssetType} from '../types'
import {EventEmitter} from './EventEmitter'

export class Loaders extends EventEmitter {
  assets: AssetType[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  items: { [key: string]: any }
  toLoad: number
  loaded: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  loaders: any

  constructor(assets: AssetType[]) {
    super()

    // Options
    this.assets = assets

    // Setup
    this.items = {}
    this.toLoad = this.assets.length
    this.loaded = 0
    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    const loadingBar: HTMLElement | null =
      document.querySelector('.loading-bar')
    const loadingLogo: HTMLElement | null =
      document.querySelector('.loading-logo')
    if (!loadingBar || !loadingLogo) {
      return
    }
    this.loaders = {}
    this.loaders.loadingManager = new LoadingManager(
        () => {
          setTimeout(() => {
            this.trigger('closeOverlay')
            loadingBar.classList.add('ended')
            loadingLogo.classList.add('ended')
            loadingBar.style.transform = ''
          }, 2000)
        },
        (itemUrl, itemsLoaded, itemsTotal) => {
          const progressRatio = itemsLoaded / itemsTotal
          loadingBar.style.transform = `scaleX(${progressRatio})`
        },
    )
    this.loaders.dracoLoader = new DRACOLoader(this.loaders.loadingManager)
    this.loaders.dracoLoader.setDecoderPath('draco/')
    this.loaders.gltfLoader = new GLTFLoader(this.loaders.loadingManager)
    this.loaders.gltfLoader.setDRACOLoader(this.loaders.dracoLoader)
    this.loaders.textureLoader = new TextureLoader(this.loaders.loadingManager)
  }

  startLoading() {
    for (const asset of this.assets) {
      if (asset.type === 'model') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
        this.loaders.gltfLoader.load(asset.path, (file: any) => {
          this.sourceLoaded(asset, file)
        })
      } else if (asset.type === 'texture') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
        this.loaders.textureLoader.load(asset.path, (file: any) => {
          this.sourceLoaded(asset, file)
        })
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  sourceLoaded(asset: AssetType, file: any) {
    this.items[asset.name] = file
    this.loaded++
    if (this.loaded === this.toLoad) {
      this.trigger('ready')
    }
  }
}
