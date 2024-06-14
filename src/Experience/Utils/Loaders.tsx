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
  prevProgressRatio: number

  constructor(assets: AssetType[]) {
    super()

    // Options
    this.assets = assets

    // Setup
    this.items = {}
    this.toLoad = this.assets.length
    this.loaded = 0
    this.prevProgressRatio = 0
    this.setLoaders()
    this.startLoading()
  }

  setLoaders() {
    const loadingContainer: HTMLElement | null =
      document.querySelector('.loading-container')
    const loadingBar: HTMLElement | null =
      document.querySelector('.loading-bar')
    if (!loadingContainer || !loadingBar) {
      return
    }
    this.loaders = {}
    this.loaders.loadingManager = new LoadingManager(
        () => {
          setTimeout(() => {
            loadingContainer.classList.add('ended')
          }, 100)
        },
        (itemUrl, itemsLoaded, itemsTotal) => {
          const progressRatio = itemsLoaded / itemsTotal
          if (this.prevProgressRatio < progressRatio) {
            this.prevProgressRatio = progressRatio
          }
          loadingBar.style.transform = `scaleX(${this.prevProgressRatio})`
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
