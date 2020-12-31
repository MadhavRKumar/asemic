import * as THREE from 'three'
import { WEBGL } from './webgl'

if (WEBGL.isWebGLAvailable()) {
  var camera, scene, renderer
  var mouse,
    raycaster;


  var objects = []

  init()
  render()

  function init() {
    camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      10000
    )
    camera.position.set(500, 800, 1300)
    camera.lookAt(0, 0, 0)

    scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf0f0f0)

    raycaster = new THREE.Raycaster()
    mouse = new THREE.Vector2()

    

    var ambientLight = new THREE.AmbientLight(0x606060)
    scene.add(ambientLight)

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)

  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }


  function render() {
    renderer.render(scene, camera)
  }

} else {
  var warning = WEBGL.getWebGLErrorMessage()
  document.body.appendChild(warning)
}
