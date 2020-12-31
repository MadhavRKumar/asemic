import * as THREE from 'three'
import { WEBGL } from './webgl'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

if (WEBGL.isWebGLAvailable()) {
	let camera, scene, renderer, controls;
	let mouse,
		raycaster;
	let mesh, material;
	let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
	const clock = new THREE.Clock();

	init();
	animate();

	function init() {
		camera = new THREE.PerspectiveCamera(
			45,
			window.innerWidth / window.innerHeight,
			1,
			10000
		)
		camera.position.set(0, 0, 10)
		camera.lookAt(0, 0, 0)

		scene = new THREE.Scene()
		scene.background = new THREE.Color(0x333333)

		raycaster = new THREE.Raycaster()
		mouse = new THREE.Vector2()

		var ambientLight = new THREE.AmbientLight(0x606060)
		scene.add(ambientLight)

		const points = [];
		for (let j = Math.PI/2; j> 0; j -= (2*Math.PI) / 1000) {
			points.push(Math.cos(j)*2, Math.sin(j)*2, 0);
		}

		const line = new MeshLine();
		line.setPoints(points);

		material = new MeshLineMaterial({
			color: new THREE.Color(0xf0f0f0),
			lineWidth: 0.1,
			dashArray: 1,
			dashRatio: 0,
			dashOffset: 0,
			transparent: true
		})


		mesh = new THREE.Mesh(line, material);
		scene.add(mesh);

		renderer = new THREE.WebGLRenderer({ antialias: true })
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		document.body.appendChild(renderer.domElement)
		controls = new OrbitControls(camera, renderer.domElement);
		window.addEventListener("resize", onWindowResize, false);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()

		renderer.setSize(window.innerWidth, window.innerHeight)
	}

	function animate() {
		let offset = (Math.sin(clock.getElapsedTime()) + 1)/2;
		mesh.material.uniforms.dashRatio.value = offset;	
		requestAnimationFrame(animate);
		renderer.render(scene, camera)
	}

} else {
	var warning = WEBGL.getWebGLErrorMessage()
	document.body.appendChild(warning)
}
