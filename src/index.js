import * as THREE from 'three'
import { WEBGL } from './webgl'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as random from 'random'
import * as TWEEN from '@tweenjs/tween.js'
const randMean = random.normal(6, 1.5);	
const randAmp = random.normal(4, 1.2);
const randStrokeAmp = random.normal(6, 1);
const randStrokeFreq = random.normal(50, 1);

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
		camera.position.set(0, 0, 200)
		camera.lookAt(0, 0, 0)

		scene = new THREE.Scene()
		scene.background = new THREE.Color(0xf0f0f0)

		raycaster = new THREE.Raycaster()
		mouse = new THREE.Vector2()

		const mesh = Word({ start:{ y: 50}, amp: randAmp() });
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
			const mesh = Word( { 
				start: { 
					y: currentMesh.start.y - randAmp()*1.5
				},
				amp: randAmp()
			})
			scene.add(mesh);
			currentMesh = mesh;
		}
	}

	function Word(params) {
		let { 

			start,
			amp = 4 

		} = params;
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
		let points = generatePoints(50, amp); 
		const line = new MeshLine();
		let strokeAmp = randStrokeAmp();
		let strokeFreq = randStrokeFreq();
		line.setGeometry(points, p=> {
			let result = strokeAmp*((Math.sin(p*strokeFreq)+1) / 2); 
			return (result < 0.2) ? 0 : result;
		});

		
		let mesh = new THREE.Mesh(line, material);
		mesh.amp = amp;

		function generatePoints(numPoints, amp) {
			const randPhase = random.normal(Math.PI, 1);
			const randFreq = random.normal(randMean(), 7.5);
			let points = [];
			let i = 0;
			let t = Math.PI*numPoints;
			let length = t/2;
			let phase = randPhase();
			let point = new THREE.Vector3();
			while(t > 0) {
				let mult = 1;
				let freq = randFreq();
				t -= freq*mult;
				let x = t-(Math.PI)*Math.sin(t*10 + phase) - length;
				let y = start.y + -amp*Math.sin(t*10 + phase);
				let z = 2*(Math.sin(i*10)+1) / 2;
				point.set(x,y,z);	
				points.push(point.clone());
				i++;
			}


			const curve = new THREE.CatmullRomCurve3(points);
			return new THREE.BufferGeometry().setFromPoints(curve.getPoints(5000));
		}

		mesh.inc = 1.0/33;
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
