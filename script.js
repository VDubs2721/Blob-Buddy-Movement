// module aliases
const Engine = Matter.Engine,
	Render = Matter.Render,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Composites = Matter.Composites,
	Composite = Matter.Composite,
	Constraint = Matter.Constraint,
	Events = Matter.Events,
	Mouse = Matter.Mouse,
	MouseConstraint = Matter.MouseConstraint;

// create an engine
const engine = Engine.create();

const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;

// create a renderer
const render = Render.create({
	canvas: document.querySelector("#canvas"),
	engine: engine,
	options: {
		width: Math.floor(screenWidth),
		height: Math.floor(screenHeight),
		wireframes: false
	}
});

// create blob and borders
const blob = Composite.create();
const blobRadius = 60; // Decrease this to make the blob smaller
const blobBodyRadius = 2; // Decrease this to make the individual bodies smaller
const blobBodyDiameter = blobBodyRadius * 2;
const bodiesInRadius = Math.floor(blobRadius / blobBodyDiameter);

// create bodies on the edge of the blob
for (let i = 0; i < 2 * Math.PI; i += (2 * Math.PI) / bodiesInRadius) {
	const x = screenWidth / 4 + blobRadius * Math.cos(i);
	const y = screenHeight / 4 + blobRadius * Math.sin(i);
	const body = Bodies.circle(x, y, blobBodyRadius, {
		density: 2,
		render: { fillStyle: "darkslateblue" }
	});
	Composite.add(blob, body);
}

// create constraints between all bodies
for (let i = 0; i < blob.bodies.length; i++) {
	for (let j = i + 1; j < blob.bodies.length; j++) {
		Composite.add(
			blob,
			Constraint.create({
				bodyA: blob.bodies[i],
				bodyB: blob.bodies[j],
				stiffness: 0.005,
				render: {
					strokeStyle: "darkslateblue"
				}
			})
		);
	}
}

const ground = Bodies.rectangle(
	screenWidth / 2,
	screenHeight,
	screenWidth,
	60,
	{ isStatic: true }
);
const topWall = Bodies.rectangle(screenWidth / 2, 0, screenWidth, 60, {
	isStatic: true
});
const leftWall = Bodies.rectangle(0, screenHeight / 2, 60, screenHeight, {
	isStatic: true
});
const rightWall = Bodies.rectangle(
	screenWidth,
	screenHeight / 2,
	60,
	screenHeight,
	{ isStatic: true }
);
const platform = Bodies.rectangle(
	screenWidth / 2,
	screenHeight / 2,
	screenWidth / 3,
	60,
	{ isStatic: true }
);

// add all of the bodies to the world
World.add(engine.world, [
	blob,
	// mouseBody,
	ground,
	topWall,
	leftWall,
	rightWall,
	platform
]);

// add mouse control
const mouse = Mouse.create(render.canvas),
	mouseConstraint = MouseConstraint.create(engine, {
		mouse: mouse,
		constraint: {
			stiffness: 0.2,
			render: {
				visible: false
			}
		}
	});

World.add(engine.world, mouseConstraint);

// keep the mouse in sync with rendering
render.mouse = mouse;

let keyState = {
	left: false,
	right: false,
	up: false,
	down: false
};

// Detect key press
window.addEventListener("keydown", (ev) => {
	if (ev.code === "ArrowLeft") {
		keyState.left = true;
	} else if (ev.code === "ArrowRight") {
		keyState.right = true;
	} else if (ev.code === "ArrowUp") {
		keyState.up = true;
	} else if (ev.code === "ArrowDown") {
		keyState.down = true;
	}
});

// Detect key release
window.addEventListener("keyup", (ev) => {
	if (ev.code === "ArrowLeft") {
		keyState.left = false;
	} else if (ev.code === "ArrowRight") {
		keyState.right = false;
	} else if (ev.code === "ArrowUp") {
		keyState.up = false;
	} else if (ev.code === "ArrowDown") {
		keyState.down = false;
	}
});

Matter.Runner.run(engine);
// engine.world.gravity.y = 2; // Change this to the desired y gravity

// Load your image
let img = new Image();
img.src = "https://logans.website/codepen-assets/cute-blob.png";

// Add an event listener to the render
Events.on(render, "afterRender", function () {
	let context = render.context;
	let blobPosition = Composite.bounds(blob);

	let centerX = (blobPosition.min.x + blobPosition.max.x) / 2;
	let centerY = (blobPosition.min.y + blobPosition.max.y) / 2;
	let blobWidth = blobPosition.max.x - blobPosition.min.x;
	let blobHeight = blobPosition.max.y - blobPosition.min.y;

	// Draw the image at the blob's current position
	context.drawImage(
		img,
		centerX - blobWidth / 2,
		centerY - blobHeight / 2,
		blobWidth,
		blobHeight
	);

	context.restore();
});

// run the renderer
Render.run(render);

// Run an update loop
const update = () => {
	if (keyState.left) {
		blob.bodies.forEach((body, i) => {
			const multiplier = i % 2 === 0 ? 1 : 0.75;
			Matter.Body.applyForce(
				body,
				{ x: body.position.x, y: body.position.y },
				{ x: -0.05 * multiplier, y: 0 }
			);
		});
	}

	if (keyState.right) {
		blob.bodies.forEach((body, i) => {
			const multiplier = i % 2 === 0 ? 1 : 0.75;
			Matter.Body.applyForce(
				body,
				{ x: body.position.x, y: body.position.y },
				{ x: 0.05 * multiplier, y: 0 }
			);
		});
	}

	if (keyState.up) {
		blob.bodies.forEach((body, i) => {
			const multiplier = i % 2 === 0 ? 1 : 1.5;
			Matter.Body.applyForce(
				body,
				{ x: body.position.x, y: body.position.y },
				{ x: 0, y: -0.1 * multiplier }
			);
		});
	}

	if (keyState.down) {
		blob.bodies.forEach((body, i) => {
			const multiplier = i % 2 === 0 ? 1 : 1.5;
			Matter.Body.applyForce(
				body,
				{ x: body.position.x, y: body.position.y },
				{ x: 0, y: 0.1 * multiplier }
			);
		});
	}

	window.requestAnimationFrame(update);
};

update();
