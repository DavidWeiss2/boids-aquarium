// Flocking
// Daniel Shiffman
// https://thecodingtrain.com

// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

"use strict";

let flocks = [];

let area;
let divider;
let maxNumberOfBoids;
let minNumberOfBoids;
let numberOfBoids;
let minFlockSize = 3;

let flocksUpdate = () => {
  let debug = allDebugCheckBox.checked();

  if (freezeCheckBox.checked()) {
    for (let boid of flocks) {
      boid.flock(flocks);
      boid.show(debug, flocks);
      debug = false;
    }
    return;
  }

  for (let boid of flocks) {
    boid.edges();
    boid.flock(flocks);
    boid.update();
    boid.show(debug, flocks);
    debug = false;
  }
};

let alignSlider, cohesionSlider, separationSlider, PerceptionDagreesSlider;
let separationPerceptionSlider,
  alignmentPerceptionSlider,
  cohesionPerceptionSlider;
let allDebugCheckBox, freezeCheckBox;
let numberOfBoidsSlider;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);

  area = width * height;
  divider = Boid.r() * 1000;
  maxNumberOfBoids = area / divider;
  minNumberOfBoids = 9;
  numberOfBoids = Math.max(Math.ceil(random(maxNumberOfBoids)), 9);

  alignSlider = createSlider(0, 2, 1, 0.1);
  cohesionSlider = createSlider(0, 2, 0.8, 0.1);
  separationSlider = createSlider(0, 2, 1.5, 0.1);
  alignmentPerceptionSlider = createSlider(0.5, 10, 4, 0.5);
  cohesionPerceptionSlider = createSlider(0.5, 10, 6, 0.5);
  separationPerceptionSlider = createSlider(0.5, 10, 2, 0.5);
  PerceptionDagreesSlider = createSlider(
    PI / 180,
    PI + PI / 180,
    PI - PI / 8,
    PI / 180
  );
  allDebugCheckBox = createCheckbox("All debug", false);
  freezeCheckBox = createCheckbox("freeze", false);
  numberOfBoidsSlider = createSlider(
    minNumberOfBoids,
    maxNumberOfBoids,
    numberOfBoids,
    1
  );
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  area = width * height;
  divider = Boid.r() * 1000;
  maxNumberOfBoids = area / divider;
  minNumberOfBoids = 9;
  numberOfBoids = Math.min(numberOfBoids, maxNumberOfBoids);
  numberOfBoids = Math.max(numberOfBoids, minNumberOfBoids);
  numberOfBoidsSlider.elt.min = minNumberOfBoids;
  numberOfBoidsSlider.elt.max = maxNumberOfBoids;
  numberOfBoidsSlider.value(numberOfBoids);
}

document.oncontextmenu = function () {
  return false;
};

function draw() {
  background(51);

  let yIndex = 10;
  let xIndex = width - 150;
  textSize(12);
  textStyle(BOLD);
  text("Number of boids", xIndex, yIndex + 15);
  yIndex += 20;
  numberOfBoidsSlider.position(xIndex, yIndex);
  yIndex += 20;
  text("Perception dagrees", xIndex, yIndex + 15);
  yIndex += 20;
  PerceptionDagreesSlider.position(xIndex, yIndex);
  yIndex += 20;
  text("Alignment controls", xIndex, yIndex + 15);
  yIndex += 20;
  alignSlider.position(xIndex, yIndex);
  yIndex += 20;
  alignmentPerceptionSlider.position(xIndex, yIndex);
  yIndex += 20;
  text("Cohesion controls", xIndex, yIndex + 15);
  yIndex += 20;
  cohesionSlider.position(xIndex, yIndex);
  yIndex += 20;
  cohesionPerceptionSlider.position(xIndex, yIndex);
  yIndex += 20;
  text("Separation controls", xIndex, yIndex + 15);
  yIndex += 20;
  separationSlider.position(xIndex, yIndex);
  yIndex += 20;
  separationPerceptionSlider.position(xIndex, yIndex);
  yIndex += 20;
  allDebugCheckBox.position(xIndex, yIndex);
  yIndex += 20;
  freezeCheckBox.position(xIndex, yIndex);

  //remove boid
  if (numberOfBoidsSlider.value() * 1.3 < flocks.length) {
    let randomIndex = Math.floor(random(flocks.length));
    flocks.splice(randomIndex, 1);
  }
  var boid = new Boid();
  const countSameColor = (accumulator, currentValue) =>
    currentValue.myColor === boid.myColor ? ++accumulator : accumulator;
  //remove lonely boids
  for (let index = flocks.length - 1; index > -1; index--) {
    boid = flocks[index];
    let flockSize = flocks.reduce(countSameColor, 1);
    if (flockSize <= minFlockSize) {
      flocks.splice(index, 1);
    }
  }

  //add boid
  while (numberOfBoidsSlider.value() > flocks.length) {
    let flock = [];
    let colorr = color(random(256), random(256), random(256));
    let numberOfBoidsInTheFlock = random(minFlockSize, numberOfBoids / 3);
    for (let i = 0; i < numberOfBoidsInTheFlock; i++) {
      flock.push(new Boid(colorr));
    }
    flocks = flocks.concat(flock);
  }

  flocksUpdate();
}
