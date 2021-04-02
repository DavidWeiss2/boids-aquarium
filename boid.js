// Flocking
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

"use strict";

class Boid {
  static maxForce = 1 / 30;
  static maxSpeed = 2.5;
  static r = 25;
  static separationPerceptionRadius = () => Boid.r * separationPerceptionSlider.value();
  static alignmentPerceptionRadius = () => Boid.r * alignmentPerceptionSlider.value();
  static cohesionPerceptionRadius = () => Boid.r * cohesionPerceptionSlider.value();

  constructor(colorr) {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.myColor = colorr;
  }

  edges() {
    if (this.position.x > width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = width;
    }
    if (this.position.y > height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
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
        steering.add(other.velocity);
        total++;
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
        let diff = p5.Vector.sub(this.position, other.position);
        diff.div(d * d);
        steering.add(diff);
        total++;
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
        steering.add(other.position);
        total++;
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

  show(debug = false) {
    let theta = this.velocity.heading() + radians(180);
    push();
    noStroke();
    fill(this.myColor);
    arc(this.position.x, this.position.y, Boid.r, Boid.r, theta, theta + QUARTER_PI);
    if (debug) {
      noFill();
      strokeWeight(2);
      stroke(255, 0, 0, separationSlider.value() * 100 + 30);
      ellipse(this.position.x, this.position.y, Boid.separationPerceptionRadius());
      stroke(0, 255, 0, alignSlider.value() * 100 + 30);
      ellipse(this.position.x, this.position.y, Boid.alignmentPerceptionRadius());
      stroke(0, 0, 255, cohesionSlider.value() * 100 + 30);
      ellipse(this.position.x, this.position.y, Boid.cohesionPerceptionRadius());
    }
    pop();
  }
}
