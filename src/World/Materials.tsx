import gsap from 'gsap'
import {
  Color,
  MeshBasicMaterial,
  RawShaderMaterial,
  ShaderMaterial,
  Vector2,
} from 'three'
import {Experience} from '../Experience'
import rgbFragmentShader from '../shader/RGB/fragment.glsl'
import blackFragmentShader from '../shader/black/fragment.glsl'
import coffeeFragmentShader from '../shader/coffee/fragment.glsl'
import coffeeVertexShader from '../shader/coffee/vertex.glsl'
import greyFragmentShader from '../shader/grey/fragment.glsl'
import fragmentShader from '../shader/textureShader/fragment.glsl'
import vertexShader from '../shader/textureShader/vertex.glsl'
import vitreFragmentShader from '../shader/vitre/fragment.glsl'

export class Materials {
  experience: Experience
  resources
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  materials: any[]

  constructor() {
    this.experience = new Experience()
    this.resources = this.experience.loaders
    this.materials = []
    this.setMaterial()
    const overlayMaterial = this.materials[12]
    this.resources?.on('closeOverlay', () => {
      gsap.to(overlayMaterial.uniforms.uAlpha, {
        duration: 3,
        value: 0,
        delay: 1,
      })
    })
  }

  setMaterial() {
    if (!this.resources) {
      return
    }
    const textures = [
      this.resources.items.baked1Texture,
      this.resources.items.baked2Texture,
      this.resources.items.baked3Texture,
      this.resources.items.leftScreenTexture,
      this.resources.items.rightScreenTexture,
      this.resources.items.phoneScreenTexture,
    ]
    textures.forEach((element) => {
      element.flipY = false
    })

    // Texture materials
    const baked1Material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: {value: this.resources.items.baked1Texture},
      },
    })
    const baked2Material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: {value: this.resources.items.baked2Texture},
      },
    })
    const baked3Material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: {value: this.resources.items.baked3Texture},
      },
    })
    const dogMaterial = new MeshBasicMaterial({
      map: this.resources.items.baked3Texture,
    })
    const screen1Material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: {value: this.resources.items.leftScreenTexture},
      },
    })
    const screen2Material = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: {value: this.resources.items.rightScreenTexture},
      },
    })
    const screenPhoneMaterial = new RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTexture: {value: this.resources.items.phoneScreenTexture},
      },
    })

    // Color shader materials
    const blackMaterial = new RawShaderMaterial({
      vertexShader,
      fragmentShader: blackFragmentShader,
    })
    const greyMaterial = new RawShaderMaterial({
      vertexShader,
      fragmentShader: greyFragmentShader,
    })
    const vitreMaterial = new RawShaderMaterial({
      vertexShader,
      fragmentShader: vitreFragmentShader,
      transparent: true,
    })
    const rgbMaterial = new RawShaderMaterial({
      uniforms: {
        color: {value: new Color(0xff0000)},
      },
      vertexShader,
      fragmentShader: rgbFragmentShader,
    })

    // Color Variation RGB Material
    const colors = [
      new Color(0x00ff2a),
      new Color(0x00ff3c),
      new Color(0x00ff6e),
      new Color(0x00ff80),
      new Color(0x00ffae),
      new Color(0x00ffbf),
      new Color(0x00ffde),
      new Color(0x00ffbf),
      new Color(0x00ffae),
      new Color(0x00ff80),
      new Color(0x00ff6e),
      new Color(0x00ff3c),
    ]

    let colorEtta = 0
    setInterval(function() {
      colorEtta = (colorEtta + 1) % 12
      rgbMaterial.uniforms.color.value = colors[colorEtta]
    }, 300)

    // Smoke Material
    const coffeeSmokeMaterial = new ShaderMaterial({
      vertexShader: coffeeVertexShader,
      fragmentShader: coffeeFragmentShader,
      transparent: true,
      depthTest: false,
      uniforms: {
        uTime: {value: 0},
        uUvFrequency: {value: new Vector2(3, 2)},
        uTimeFrequency: {value: 0.0004},
        uColor: {value: new Color('#e8d9bf')},
      },
    })

    // Overlay Material
    const overlayMaterial = new ShaderMaterial({
      transparent: true,
      uniforms: {
        uAlpha: {value: 1},
      },
      vertexShader: `
            void main()
            {
                gl_Position = vec4(position, 1.0);
            }
        `,
      fragmentShader: `
            uniform float uAlpha;
        
            void main()
            {
                gl_FragColor = vec4(0.0, 0.0, 0.0, uAlpha);
            }
        `,
    })

    this.materials = [
      baked1Material,
      baked2Material,
      baked3Material,
      dogMaterial,
      screen1Material,
      screen2Material,
      screenPhoneMaterial,
      blackMaterial,
      greyMaterial,
      vitreMaterial,
      rgbMaterial,
      coffeeSmokeMaterial,
      overlayMaterial,
    ]
  }
}
