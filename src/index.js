import * as THREE from 'three'
import { WEBGL } from './webgl'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'

if (WEBGL.isWebGLAvailable()) {
	var camera, scene, renderer
	var mouse,
		raycaster;



	init();
	animate();

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
		scene.background = new THREE.Color(0x333333)

		raycaster = new THREE.Raycaster()
		mouse = new THREE.Vector2()



		var ambientLight = new THREE.AmbientLight(0x606060)
		scene.add(ambientLight)

		renderer = new THREE.WebGLRenderer({ antialias: true })
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		document.body.appendChild(renderer.domElement)

		window.addEventListener("resize", onWindowResize, false);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()

		renderer.setSize(window.innerWidth, window.innerHeight)
	}


	function render() {
		renderer.render(scene, camera)
	}

	function animate() {
		requestAnimationFrame(animate);
		render();
	}

} else {
	var warning = WEBGL.getWebGLErrorMessage()
	document.body.appendChild(warning)
}
