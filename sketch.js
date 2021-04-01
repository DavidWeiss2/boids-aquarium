// Flocking
// Daniel Shiffman
// https://thecodingtrain.com

// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

let flocks = [];

flocksUpdate = () => {
  for (let boid of flocks) {
    boid.edges();
    boid.flock(flocks);
    boid.update();
    boid.show();
  }
};

let alignSlider, cohesionSlider, separationSlider;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);

  alignSlider = createSlider(0, 2, 1, 0.1);
  alignSlider.position(width/4,10);
  cohesionSlider = createSlider(0, 2, 1, 0.1);
  cohesionSlider.position(width/4*2,10);
  separationSlider = createSlider(0, 2, 1.5, 0.1);
  separationSlider.position(width/4*3,10);

  numberOfFlocks = Math.ceil(random(1, 10));
  for (let f = 0; f < numberOfFlocks; f++) {
    let flock = [];
    let colorvec = p5.Vector.random3D();
    let colorr = color(colorvec.x * 255, colorvec.y * 255, colorvec.z * 255);
    let numberOfBoids = random(50);
    for (let i = 0; i < numberOfBoids; i++) {
      flock.push(new Boid(colorr));
    }
    flocks = flocks.concat(flock);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

document.oncontextmenu = function() {
  return false;
}

function draw() {
  background(51);
  flocksUpdate();
}
