// Flocking
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

"use strict";

class Boid {
  static maxForce = 1 / 30;
  static maxSpeed = 1;
  static r = () => 25;
  static separationPerceptionRadius = () => Boid.r() * separationPerceptionSlider.value();
  static alignmentPerceptionRadius = () => Boid.r() * alignmentPerceptionSlider.value();
  static cohesionPerceptionRadius = () => Boid.r() * cohesionPerceptionSlider.value();
  static EIGHTH_PI = Math.PI / 8;

  constructor(colorr) {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.myColor = colorr;
  }

  edges() {
    if (this.position.x - Boid.r() > width) {
      this.position.x = 0;
    } else if (this.position.x < 0 - Boid.r()) {
      this.position.x = width;
    }
    if (this.position.y - Boid.r() > height) {
      this.position.y = 0;
    } else if (this.position.y < 0 - Boid.r()) {
      this.position.y = height;
    }
  }

  align(boids) {
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      if (other.myColor != this.myColor) continue;
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < Boid.alignmentPerceptionRadius()) {
        let dx = other.position.x - this.position.x;
        let dy = other.position.y - this.position.y;
        let vec = createVector(dx, dy);
        if (Math.abs(this.velocity.angleBetween(vec)) < PerceptionDagreesSlider.value()) {
          steering.add(other.velocity);
          total++;
        }
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(Boid.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(Boid.maxForce);
    }
    return steering;
  }

  separation(boids) {
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );
      if (other != this && d < Boid.separationPerceptionRadius()) {
        let dx = other.position.x - this.position.x;
        let dy = other.position.y - this.position.y;
        let vec = createVector(dx, dy);
        if (Math.abs(this.velocity.angleBetween(vec)) < PerceptionDagreesSlider.value()) {
          let diff = p5.Vector.sub(this.position, other.position);
          diff.div(d * d);
          steering.add(diff);
          total++;
        }
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(Boid.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(Boid.maxForce);
    }
    return steering;
  }

  cohesion(boids) {
    let steering = createVector();
    let total = 0;
    for (let other of boids) {
      if (other.myColor != this.myColor) continue;

      let d = dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );

      if (other != this && d < Boid.cohesionPerceptionRadius()) {
        let dx = other.position.x - this.position.x;
        let dy = other.position.y - this.position.y;
        let vec = createVector(dx, dy);
        if (Math.abs(this.velocity.angleBetween(vec)) < PerceptionDagreesSlider.value()) {
          steering.add(other.position);
          total++;
        }
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(this.position);
      steering.setMag(Boid.maxSpeed);
      steering.sub(this.velocity);
      steering.limit(Boid.maxForce);
    }
    return steering;
  }

  flock(boids) {
    let alignment = this.align(boids);
    let cohesion = this.cohesion(boids);
    let separation = this.separation(boids);

    alignment.mult(alignSlider.value());
    cohesion.mult(cohesionSlider.value());
    separation.mult(separationSlider.value());

    this.acceleration.add(alignment);
    this.acceleration.add(cohesion);
    this.acceleration.add(separation);
  }

  update() {
    this.position.add(this.velocity);
    this.velocity.add(this.acceleration);
    this.velocity.limit(Boid.maxSpeed);
    this.acceleration.mult(0);
  }

  show(debug = false, boids = []) {
    let theta = this.velocity.heading() + PI;
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    noStroke();
    fill(this.myColor);
    arc(0, 0, Boid.r(), Boid.r(), - Boid.EIGHTH_PI, Boid.EIGHTH_PI);
    if (debug) {
      let maxParception = Math.max(Boid.separationPerceptionRadius()*2, Boid.alignmentPerceptionRadius()*2, Boid.cohesionPerceptionRadius()*2);
      noFill();
      strokeWeight(2);
      stroke(255, 0, 0, separationSlider.value() * 100 + 30);
      ellipse(0, 0, Boid.separationPerceptionRadius() * 2);
      stroke(0, 255, 0, alignSlider.value() * 100 + 30);
      ellipse(0, 0, Boid.alignmentPerceptionRadius() * 2);
      stroke(0, 0, 255, cohesionSlider.value() * 100 + 30);
      ellipse(0, 0, Boid.cohesionPerceptionRadius() * 2);
      stroke(255, 255, 255, PerceptionDagreesSlider.value() + 70);
      fill(255, 255, 255, PerceptionDagreesSlider.value() + 70);
      rotate(PI);
      arc(0, 0, maxParception, maxParception, -PerceptionDagreesSlider.value(), PerceptionDagreesSlider.value());
      pop();
      push();
      for (let other of boids) {

        let d = dist(
          this.position.x,
          this.position.y,
          other.position.x,
          other.position.y
        );
        if (other != this && d < Boid.cohesionPerceptionRadius()) {
          let dx = other.position.x - this.position.x;
          let dy = other.position.y - this.position.y;
          let vec = createVector(dx, dy);
          let angleFromPos = atan2(dy, dx);
          if (Math.abs(this.velocity.angleBetween(vec)) < PerceptionDagreesSlider.value()) {

            let x = other.position.x - cos(angleFromPos) * d;
            let y = other.position.y - sin(angleFromPos) * d;
            push();
            translate(x, y);
            rotate(angleFromPos);
            stroke(0, 0, 255, cohesionSlider.value() * 100 + 30);
            line(0, 0, d, 0);
            pop();
          }
        }
      }
      push();
    }
    pop();
  }
}
