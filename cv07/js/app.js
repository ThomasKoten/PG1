window.onload = function () {
	menu.style.display = 'flex';
}
var stats;

var camera, controls, scene, parent, obj, cube, box, paddle1, paddle1_bounce, paddle2, paddle2_bounce, renderer, dy, dx
let box_width, box_height, cube_size, paddle_height, y_speed, zoom_out, paddle_start, x_addon, y_addon, box_border;

var score = {
	player1: 0,
	player2: 0
};
var score_board = document.getElementById('scoreBoard');
var menu = document.getElementById('menu');
var keys = {}
const paddle_width = 0.2;

const game_modes = {
	small: {
		dy: 0.01,
		dx: 0.03,
		box_width: 6.01,
		box_height: 4.01,
		cube_size: 0.4,
		paddle_size_coeff: 3,
		speed_coeff: 13
	},
	medium: {
		dy: 0.03,
		dx: 0.05,
		box_width: 10.01,
		box_height: 10.01,
		cube_size: 0.5,
		paddle_size_coeff: 4,
		speed_coeff: 14
	},
	large: {
		dy: 0.08,
		dx: 0.06,
		box_width: 18.01,
		box_height: 15.01,
		cube_size: 0.8,
		paddle_size_coeff: 5,
		speed_coeff: 15
	}
}
let currentGameMode = game_modes.small;

function startGame(mode) {
	menu.style.display = 'none';
	currentGameMode = game_modes[mode];
	dy = currentGameMode.dy;
	max_vertical_speed = dy
	dx = currentGameMode.dx;
	box_width = currentGameMode.box_width;
	box_height = currentGameMode.box_height;
	cube_size = currentGameMode.cube_size;
	paddle_height = box_height / currentGameMode.paddle_size_coeff;
	y_speed = paddle_height / currentGameMode.speed_coeff;

	zoom_out = currentGameMode.box_height + 1
	paddle_start = (paddle_width - box_width) / 2;
	x_addon = ((box_width - 3.01) + (1 - cube_size)) / 2;
	y_addon = ((box_height - 3.01) + (1 - cube_size)) / 2;
	box_border = (box_height - paddle_height) / 2;
	init();
	animate();
}
function init() {

	camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
	camera.position.z = zoom_out; //*Rozmazává

	controls = new THREE.TrackballControls(camera);
	controls.rotateSpeed = 4.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [65, 83, 68];
	controls.addEventListener('change', render);

	// Create scene hierarchy
	scene = new THREE.Scene();
	parent = new THREE.Object3D();
	obj = new THREE.Object3D();
	box = new THREE.Object3D();
	paddle1 = new THREE.Object3D();
	paddle2 = new THREE.Object3D();
	parent.add(obj);
	parent.add(box);
	parent.add(paddle1)
	parent.add(paddle2)
	scene.add(parent);

	// Add helper object (bounding box)
	var box_geometry = new THREE.BoxGeometry(box_width, box_height, 1.01);
	var box_mesh = new THREE.Mesh(box_geometry, null);
	var bbox = new THREE.BoundingBoxHelper(box_mesh, 0xffffff);
	bbox.update();
	scene.add(bbox);

	// Instantiate a loader
	var loader = new THREE.TextureLoader();
	// Load a resource
	loader.load(
		// URL of texture
		'textures/CD.jpg',
		// Function when resource is loaded
		function (texture) {
			// Create objects using texture
			var cube_geometry = new THREE.BoxGeometry(cube_size, cube_size, cube_size);
			var tex_material = new THREE.MeshBasicMaterial({

				// Function called when download errors
				map: texture
			});

			cube = new THREE.Mesh(cube_geometry, tex_material);
			obj.add(cube);

			// Call render here, because loading of texture can
			// take lot of time
			render();
		},

		// Function called when download progresses
		function (xhr) {
			console.log((xhr.loaded / xhr.total * 100) + '% loaded');
		}, function (xhr) {
			console.log('An error happened');
		}

	);
	var paddle_geometry = new THREE.BoxGeometry(paddle_width, paddle_height, 1);
	var paddle_material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
	paddle1 = new THREE.Mesh(paddle_geometry, paddle_material);
	paddle1.position.x = paddle_start
	scene.add(paddle1);

	paddle2 = new THREE.Mesh(paddle_geometry, paddle_material);
	paddle2.position.x = -paddle_start
	scene.add(paddle2);

	// Display statistics of drawing to canvas
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	document.body.appendChild(stats.domElement);

	// renderer
	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
	controls.handleResize();
	render();
}

function reset() {
	obj.position.set(0, 0, 0)
	dy *= Math.random() < 0.5 ? -1 : 1
	dx *= Math.random() < 0.5 ? 1 : -1
}
function isPastPaddle1() {
	// console.log(paddle1.position.x + 2 * paddle_width)
	return obj.position.x <= paddle1.position.x + paddle_width;
}
function isPastPaddle2() {
	return obj.position.x >= paddle2.position.x - paddle_width;
}

function isPaddleCollision(paddle) {
	const half_paddle = paddle_height / 2;
	const half_cube = cube_size / 2;
	var paddle_y = paddle.position.y;
	var cube_y = obj.position.y;
	return (paddle_y - half_paddle) <= (cube_y + half_cube) && (cube_y - half_cube) <= (paddle_y + half_paddle)
}
function calculateCollision(paddle) {
	//* Užitek nebo škoda?
	const relative_position = obj.position.y - paddle.position.y;
	const normalized_position = relative_position / (paddle_height / 4);
	return normalized_position;
}

function addPoint(playerName) {
	score[playerName]++;
	console.log(score);
}
function updateScoreBoard(playerName) {
	addPoint(playerName);
	score_board.innerText = score["player1"] + " : " + score["player2"]
	reset();
}


function animate() {
	//OBJ kdyžtak změň na cube
	requestAnimationFrame(animate);
	// Test of object animation
	if ((obj.position.y - y_addon) >= 1.0 || (obj.position.y + y_addon) <= -1.0) {
		dy = -dy;
	};
	obj.position.y += dy;
	paddle1_bounce = -1;
	paddle2_bounce = -1;
	if (isPastPaddle1()) {
		updateScoreBoard("player2");
	}
	if (isPastPaddle2()) {
		updateScoreBoard("player1");
	}
	if (isPaddleCollision(paddle1) && (obj.position.x + x_addon - paddle_width) <= -1.0) {
		dx = -dx;
		const collisionPoint = calculateCollision(paddle1);
		dy = collisionPoint * max_vertical_speed
		console.log(collisionPoint)
	}

	if (isPaddleCollision(paddle2) && (obj.position.x - x_addon + paddle_width) >= 1.0) {
		dx = -dx;
		const collisionPoint = calculateCollision(paddle2);
		dy = collisionPoint * max_vertical_speed
	}
	// console.log(paddle1.position.y)
	// console.log(obj.position.x)
	// console.log(paddle1.position.y - (paddle_height / 2))
	// console.log(paddle1.position.y + (paddle_height / 2))
	obj.position.x += dx;

	// Update position of camera
	controls.update();
	// Render scene
	render();
}

document.addEventListener('keydown', (event) => {
	if (event.defaultPrevented) {
		return; // Do nothing if the event was already processed
	}

	keys[event.key] = true;

	// Handle key press
	handleKeyPress();

	event.preventDefault();
}, true);

document.addEventListener('keyup', (event) => {
	if (event.defaultPrevented) {
		return; // Do nothing if the event was already processed
	}

	keys[event.key] = false;
	handleKeyPress();

	event.preventDefault();
}, true);

function handleKeyPress() {
	if (keys["s"] && (paddle1.position.y + box_border) > 0.01) {
		paddle1.position.y -= y_speed;
	}
	if (keys["w"] && (box_border - paddle1.position.y) > 0.01) {
		paddle1.position.y += y_speed;
	}
	if (keys["ArrowDown"] && (paddle2.position.y + box_border) > 0.01) {
		paddle2.position.y -= y_speed;
	}
	if (keys["ArrowUp"] && (box_border - paddle2.position.y) > 0.01) {
		paddle2.position.y += y_speed;
	}
}

function render() {
	renderer.render(scene, camera);
	// Update draw statistics
	stats.update();
}