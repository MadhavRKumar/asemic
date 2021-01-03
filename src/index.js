import * as THREE from 'three'
import { WEBGL } from './webgl'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

if (WEBGL.isWebGLAvailable()) {
	let camera, scene, renderer, controls;
	let mouse,
		raycaster;
	let currentMesh;
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
		scene.background = new THREE.Color(0xf0f0f0)

		raycaster = new THREE.Raycaster()
		mouse = new THREE.Vector2()

		const mesh = Word({ start:{y:0} });
		scene.add(mesh);
		currentMesh = mesh;

		renderer = new THREE.WebGLRenderer({ antialias: true })
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		document.body.appendChild(renderer.domElement)
		controls = new OrbitControls(camera, renderer.domElement);
		window.addEventListener("resize", onWindowResize, false);
		window.addEventListener("keydown", onKeyDown, false);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()

		renderer.setSize(window.innerWidth, window.innerHeight)
		resolution.set(window.innerWidth, window.innerHeight);
	}

	function onKeyDown() {
		if(currentMesh.target > 0){
			currentMesh.target -= currentMesh.inc;	
		}
	}

	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera)
		if(!currentMesh.update()) {
			const mesh = Word({ start: { y: currentMesh.start.y - (Math.random()) * 1.5 }})
			scene.add(mesh);
			currentMesh = mesh;
		}
	}

	function Word(params) {
		let { start } = params
		const material = new MeshLineMaterial({
			color: new THREE.Color(0x222222),
			lineWidth: 0.1,
			dashArray: 1.0,
			dashRatio: 1,
			dashOffset: 0,
			transparent: true,
			resolution,
			depthTest: false,
		})
		let points = generatePoints(40); 
		const line = new MeshLine();
		let off = Math.random()*0.75;
		let mult = Math.random()*15;
		line.setGeometry(points, p => off+Math.sin(mult*p));

		
		let mesh = new THREE.Mesh(line, material);

		function generatePoints(numPoints) {
			let points = [];
			let inc = 10.0/numPoints;

			for(let x=5; x >= -5; x -= Math.random()*inc){
				let y = start.y + 2*(Math.random() + 1) / 2;
				points.push(new THREE.Vector3(x, y, Math.random()));
			}

			const curve = new THREE.CatmullRomCurve3(points);
			return new THREE.BufferGeometry().setFromPoints(curve.getPoints(1000));
		}

		mesh.inc = 3.0/50;
		mesh.target = 1;
		mesh.start = start;
		mesh.update = function() {
			if(mesh.material.uniforms.dashRatio.value > mesh.target){
				mesh.material.uniforms.dashRatio.value -= 0.01;	
				return true;
			}

			return mesh.material.uniforms.dashRatio.value > 0;
		}
		return mesh;
	}

} else {
	var warning = WEBGL.getWebGLErrorMessage()
	document.body.appendChild(warning)
}
