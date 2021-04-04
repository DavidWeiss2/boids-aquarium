// Flocking
// Daniel Shiffman
// https://thecodingtrain.com

// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

"use strict";

let flocks = [];

let flocksUpdate = () => {
  let debug = true;
  for (let boid of flocks) {
    boid.edges();
    boid.flock(flocks);
    boid.update();
    boid.show(debug, flocks);
    debug = false;
  }
};

let alignSlider, cohesionSlider, separationSlider, PerceptionDagreesSlider;
let separationPerceptionSlider, alignmentPerceptionSlider, cohesionPerceptionSlider;

function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  canvas.position(0, 0);

  alignSlider = createSlider(0, 2, 1, 0.1);
  cohesionSlider = createSlider(0, 2, 0.8, 0.1);
  separationSlider = createSlider(0, 2, 1.1, 0.1);
  alignmentPerceptionSlider = createSlider(0.5, 10, 4, 0.5);
  cohesionPerceptionSlider = createSlider(0.5, 10, 5, 0.5);
  separationPerceptionSlider = createSlider(0.5, 10, 1, 0.5);
  PerceptionDagreesSlider = createSlider(PI / 180, PI+PI / 180, 1.93731546971371, PI / 180);
  let yIndex = 10;
  let xIndex = width - 150;
  alignSlider.position(xIndex, yIndex);
  yIndex += 20;
  cohesionSlider.position(xIndex, yIndex);
  yIndex += 20;
  separationSlider.position(xIndex, yIndex);
  yIndex += 20;
  alignmentPerceptionSlider.position(xIndex, yIndex);
  yIndex += 20;
  cohesionPerceptionSlider.position(xIndex, yIndex);
  yIndex += 20;
  separationPerceptionSlider.position(xIndex, yIndex);
  yIndex += 20;
  PerceptionDagreesSlider.position(xIndex, yIndex);

  let area = width * height;
  let divider = Boid.r() * 1000;
  let maxNumberOfBoids = area / divider;
  let numberOfBoids = Math.max(Math.ceil(random(maxNumberOfBoids)), 9);
  while (numberOfBoids >= flocks.length) {
    let flock = [];
    let colorr = color(random(256), random(256), random(256));
    let numberOfBoidsInTheFlock = random(2, numberOfBoids / 3);
    for (let i = 0; i < numberOfBoidsInTheFlock; i++) {
      flock.push(new Boid(colorr));
    }
    flocks = flocks.concat(flock);
  }
  return;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  let yIndex = 10;
  let xIndex = width - 150;
  alignSlider.position(xIndex, yIndex);
  yIndex += 20;
  cohesionSlider.position(xIndex, yIndex);
  yIndex += 20;
  separationSlider.position(xIndex, yIndex);
  yIndex += 20;
  alignmentPerceptionSlider.position(xIndex, yIndex);
  yIndex += 20;
  cohesionPerceptionSlider.position(xIndex, yIndex);
  yIndex += 20;
  separationPerceptionSlider.position(xIndex, yIndex);
  yIndex += 20;
  PerceptionDagreesSlider.position(xIndex, yIndex);

  let area = width * height;
  let divider = Boid.r() * 1000;
  let maxNumberOfBoids = area / divider;
  let numberOfBoids = Math.max(Math.ceil(random(maxNumberOfBoids)), 9);

  

  //remove boids
  while (numberOfBoids*1.3 < flocks.length) {
    let randomIndex = Math.floor(random(flocks.length));
    let randomBoidColor = flocks[randomIndex].myColor;
    for (let i = flocks.length-1; i >= 0; i--) {
      if (flocks[i].myColor === randomBoidColor){
        flocks.splice(i,1);
      }
    }
  }

  //add boids
  while (numberOfBoids >= flocks.length) {
    let flock = [];
    let colorr = color(random(256), random(256), random(256));
    let numberOfBoidsInTheFlock = random(2, numberOfBoids / 3);
    for (let i = 0; i < numberOfBoidsInTheFlock; i++) {
      flock.push(new Boid(colorr));
    }
    flocks = flocks.concat(flock);
  }
}

document.oncontextmenu = function () {
  return false;
}

function draw() {
  background(51);
  flocksUpdate();
}
