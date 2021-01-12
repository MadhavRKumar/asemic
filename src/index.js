import * as THREE from 'three'
import { WEBGL } from './webgl'
import { MeshLine, MeshLineMaterial, MeshLineRaycast } from 'three.meshline'
import * as random from 'random'
import * as TWEEN from '@tweenjs/tween.js'
const randMean = random.normal(6, 1.5);	
const randAmp = random.normal(4, 1.2);
const randStrokeAmp = random.normal(6, 1);
const randStrokeFreq = random.normal(50, 1);

if (WEBGL.isWebGLAvailable()) {
	let camera, scene, renderer;
	let mouse,
		raycaster;
	let currentMesh, currentDash, currentTarget, currentY, targetY;
	let resolution = new THREE.Vector2(window.innerWidth, window.innerHeight);
	const clock = new THREE.Clock();
	let tween, cameraTween;

	let yList = [], meshes = [];

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
		meshes.push(mesh);
		yList.push(mesh.start.y);
		scene.add(mesh);
		currentMesh = mesh;
		currentDash = { dashRatio: 1 };
		currentTarget = { dashRatio: 1 }; 
		tween = createNewTween();

		currentY = {y: 0};
		targetY = {y: average(yList)};
		cameraTween = createCameraTween();

		renderer = new THREE.WebGLRenderer({ antialias: true })
		renderer.setPixelRatio(window.devicePixelRatio)
		renderer.setSize(window.innerWidth, window.innerHeight)
		document.body.appendChild(renderer.domElement)
		window.addEventListener("resize", onWindowResize, false);
		window.addEventListener("keydown", onKeyDown, false);
		window.addEventListener("touchstart", onKeyDown, false);
	}

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight
		camera.updateProjectionMatrix()

		resolution.set(window.innerWidth, window.innerHeight);
		renderer.setSize(window.innerWidth, window.innerHeight)

		meshes.forEach(function (m) {
			m.material.uniforms.resolution.value.copy(resolution);	
		})
	}

	function onKeyDown() {
		if(currentTarget.dashRatio > 0){
			currentTarget.dashRatio -= currentMesh.inc;	
			chainTween(tween, createNewTween);
		}
	}

	function animate() {
		requestAnimationFrame(animate);
		renderer.render(scene, camera)
		TWEEN.update();
		if(currentMesh.isComplete()) {
			const mesh = Word( { 
				start: { 
					y: currentMesh.start.y - randAmp()*1.5
				},
				amp: randAmp()
			})
			meshes.push(mesh);
			scene.add(mesh);
			currentMesh = mesh;
			currentDash = { dashRatio: 1 };
			currentTarget = { dashRatio: 1 }; 
			chainTween(tween, createNewTween );
		
			targetY.y = average(yList);
			chainTween(cameraTween, createCameraTween);
			yList.push(mesh.start.y);
		
		}
	}

	function chainTween(toChain, tweenFunc) {
			toChain.chain(tweenFunc());
	}

	function createNewTween(){
		return new TWEEN.Tween(currentDash)
				.to(currentTarget, 125)
				.easing(TWEEN.Easing.Exponential.Out)
				.start()
				.onUpdate(function () {
					currentMesh.material.uniforms.dashRatio.value = currentDash.dashRatio;	
				})
	}

	function createCameraTween() {
		return new TWEEN.Tween(currentY)
				.to(targetY, 500)
				.easing(TWEEN.Easing.Exponential.Out)
				.start()
				.onUpdate(function () {
					camera.position.set(0, currentY.y, camera.position.z);
				})
	
	}

	function average(values) {
		return 2*values.reduce((a,b) => (a+b)) / values.length;
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
		let points = generatePoints(100, amp); 
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
			let t = numPoints;
			let length = t/2;
			let phase = randPhase();
			let point = new THREE.Vector3();
			while(t > 0) {
				let mult = 1;
				let freq = randFreq();
				t -= freq*mult;
				let x = t-(Math.PI)*Math.sin(t*10 + phase) - length;
				let y = start.y + -amp*Math.sin(t*10 + phase);
				let z = 4*(Math.sin(i*10)+1) / 2;
				point.set(x,y,z);	
				points.push(point.clone());
				i++;
			}


			const curve = new THREE.CatmullRomCurve3(points);
			return new THREE.BufferGeometry().setFromPoints(curve.getPoints(5000));
		}

		mesh.inc = 1.0/20;
		mesh.target = 1;
		mesh.start = start;
		mesh.isComplete = function() {
			return mesh.material.uniforms.dashRatio.value <= 0;
		}
		return mesh;
	}

} else {
	var warning = WEBGL.getWebGLErrorMessage()
	document.body.appendChild(warning)
}
