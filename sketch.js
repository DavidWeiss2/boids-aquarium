// Flocking
// Daniel Shiffman
// https://thecodingtrain.com

// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

"use strict";

let flocks = [];
let area;
let divider = Boid.r() * 500;
let maxNumberOfBoids;
let minNumberOfBoids;
let numberOfBoids = -1;
let minFlockSize = 2;
let maxFlockSize = 15;
let map;

let flocksUpdate = () => {
  let debug = allDebugCheckBox.checked();

  if (freezeCheckBox.checked()) {
    for (let boid of flocks) {
      boid.flock(flocks, debug);
      boid.show(debug);
      debug = false;
    }
    return;
  }

  for (let boid of flocks) {
    boid.edges();
    boid.flock(flocks, debug);
    boid.update();
    boid.show(debug, flocks);
    debug = false;
  }
};

let alignSlider, cohesionSlider, separationSlider, PerceptionDagreesSlider;
let separationPerceptionSlider,
  alignmentPerceptionSlider,
  cohesionPerceptionSlider;
let allDebugCheckBox, freezeCheckBox, tiledCheckBox, separationOnBoidsFromOtherSpecies;
let numberOfBoidsSlider;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  map = createGraphics(width, height);
  canvas.position(0, 0);
  drawingContext.shadowOffsetX = 5;
  drawingContext.shadowOffsetY = -3;
  drawingContext.shadowBlur = 10;
  drawingContext.shadowColor = "black";

  alignSlider = createSlider(0, 2, 1, 0.1);
  cohesionSlider = createSlider(0, 2, 1, 0.1);
  separationSlider = createSlider(0, 2, 1.5, 0.1);
  alignmentPerceptionSlider = createSlider(0.5, 10, 5, 0.5);
  cohesionPerceptionSlider = createSlider(0.5, 10, 10, 0.5);
  separationPerceptionSlider = createSlider(0.5, 10, 1.5, 0.5);
  PerceptionDagreesSlider = createSlider(
    PI / 180,
    PI + PI / 180,
    PI + PI / 180, //PI - PI / 8,
    PI / 180
  );
  allDebugCheckBox = createCheckbox("All debug", false);
  freezeCheckBox = createCheckbox("freeze", false);
  tiledCheckBox = createCheckbox("tiled?", false);
  separationOnBoidsFromOtherSpecies = createCheckbox("avoid others", false);
  numberOfBoidsSlider = createSlider(0, 10, 5, 1);
  setNumberOfBoids();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  setNumberOfBoids();
}

document.oncontextmenu = function () {
  return false;
};

function setNumberOfBoids() {
  area = width * height;
  maxNumberOfBoids = (area / divider) * 2;
  minNumberOfBoids = Math.max(maxNumberOfBoids / 20, 2);
  if (numberOfBoids === -1) {
    numberOfBoids = random(minNumberOfBoids, maxNumberOfBoids);
  } else {
    numberOfBoids = Math.min(numberOfBoids, maxNumberOfBoids);
    numberOfBoids = Math.max(numberOfBoids, minNumberOfBoids);
  }
  numberOfBoidsSlider.elt.min = minNumberOfBoids;
  numberOfBoidsSlider.elt.max = maxNumberOfBoids;
  numberOfBoidsSlider.value(numberOfBoids);
}


function draw() {
  background(51);
  updateNumberOfBoids();
  flocksUpdate();

  if (tiledCheckBox.checked()) {
    map.reset();
    map.image(canvas, (width / 3) * 0, (height / 3) * 0, width / 3, height / 3);
    map.image(canvas, (width / 3) * 1, (height / 3) * 0, width / 3, height / 3);
    map.image(canvas, (width / 3) * 2, (height / 3) * 0, width / 3, height / 3);
    map.image(canvas, (width / 3) * 0, (height / 3) * 1, width / 3, height / 3);
    map.image(canvas, (width / 3) * 1, (height / 3) * 1, width / 3, height / 3);
    map.image(canvas, (width / 3) * 2, (height / 3) * 1, width / 3, height / 3);
    map.image(canvas, (width / 3) * 0, (height / 3) * 2, width / 3, height / 3);
    map.image(canvas, (width / 3) * 1, (height / 3) * 2, width / 3, height / 3);
    map.image(canvas, (width / 3) * 2, (height / 3) * 2, width / 3, height / 3);
    image(map, 0, 0);
  }
  displayControls();
}
function updateNumberOfBoids() {
  var boid = new Boid();
  const countSameColor = (accumulator, currentValue) => currentValue.myColor === boid.myColor ? ++accumulator : accumulator;

  //remove lonely boids
  for (let index = flocks.length - 1; index > -1; index--) {
    boid = flocks[index];
    let flockSize = flocks.reduce(countSameColor, 1);
    if (flockSize <= minFlockSize) {
      flocks.splice(index, 1);
    }
    if (flockSize > maxFlockSize) {
      flocks.splice(index, 1);
    }
  }

  //remove boid
  if (numberOfBoidsSlider.value() + 1 < flocks.length) {
    let randomIndex = Math.floor(random(flocks.length));
    flocks.splice(randomIndex, 1);
  }

  //add boid
  while (numberOfBoidsSlider.value() > flocks.length) {
    let flock = [];
    let colorr = color(random(256), random(256), random(256));
    let numberOfBoidsInTheFlock = random(numberOfBoids / 3, numberOfBoids / 2);
    for (let i = 0; i < numberOfBoidsInTheFlock; i++) {
      flock.push(new Boid(colorr));
    }
    flocks = flocks.concat(flock);
  }
}

function displayControls() {
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
  separationOnBoidsFromOtherSpecies.position(xIndex, yIndex);
  yIndex += 20;
  allDebugCheckBox.position(xIndex, yIndex);
  yIndex += 20;
  freezeCheckBox.position(xIndex, yIndex);
  yIndex += 20;
  tiledCheckBox.position(xIndex, yIndex);
}
