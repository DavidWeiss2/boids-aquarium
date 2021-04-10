// Flocking
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/124-flocking-boids.html
// https://youtu.be/mhjuuHl6qHM
// https://editor.p5js.org/codingtrain/sketches/ry4XZ8OkN

"use strict";

class Boid {
  static maxForce = 1 / 25;
  static maxSpeed = 2.5;
  static r = () => 25;
  static separationPerceptionRadius = () =>
    Boid.r() * separationPerceptionSlider.value();
  static alignmentPerceptionRadius = () =>
    Boid.r() * alignmentPerceptionSlider.value();
  static cohesionPerceptionRadius = () =>
    Boid.r() * cohesionPerceptionSlider.value();
  static EIGHTH_PI = Math.PI / 8;

  constructor(colorr) {
    this.position = createVector(random(width), random(height));
    this.velocity = p5.Vector.random2D();
    this.velocity.setMag(random(2, 4));
    this.acceleration = createVector();
    this.myColor = colorr;
    this.flagsRGBforACS = [0, 0, 0];
  }

  toroidalDistance = (otherPosition) => {
    let { dx, dy } = this.ShortestDxDy(otherPosition);

    return Math.sqrt(dx ** 2 + dy ** 2);
  };

  ShortestDxDy(otherPosition) {
    let dx = otherPosition.x - this.position.x;
    let dy = otherPosition.y - this.position.y;
    let halfWidth = width / 2;
    let halfHeight = height / 2;

    //if in left side
    if (this.position.x < halfWidth) {
      if (dx > halfWidth) {
        dx = -width + dx;
      }
    } else if (dx < -halfWidth) {
      dx = width - dx;
    }

    //if in up side
    if (this.position.y < halfHeight) {
      if (dy > halfHeight) {
        dy = -height + dy;
      }
    } else if (dy < -halfHeight) {
      dy = height - dy;
    }

    let vec = createVector(dx, dy);
    return { dx, dy };
  }

  edges() {
    this.edgeChecker("x", createVector(1, 0.1), width);
    this.edgeChecker("y", createVector(0.1, 1), height);
  }

  edgeChecker(property, steeringVector, heightOrwidth) {
    const margin = -50;
    const bottomMargin = 150;
    const turnFactor = Boid.maxForce * 3;
    if(property === 'y'  && this.position[property] > heightOrwidth - bottomMargin) {
      steeringVector.mult(-turnFactor);
      this.acceleration.add(steeringVector);
    } else if (this.position[property] > heightOrwidth && margin === 0) {
      this.position[property] = 0;
    } else if (this.position[property] > heightOrwidth - margin) {
      steeringVector.mult(-turnFactor);
      this.acceleration.add(steeringVector);
    } else if (this.position[property] < 0 && margin === 0) {
      this.position[property] = heightOrwidth;
    } else if (this.position[property] < margin) {
      steeringVector.mult(turnFactor);
      this.acceleration.add(steeringVector);
    }
  }

  align(boids, debug = false) {
    let steering = createVector();
    let total = 0;
    this.flagsRGBforACS[0] = 0;
    for (let other of boids) {
      if (other.myColor != this.myColor) continue;
      let d = this.toroidalDistance(other.position);
      if (other != this && d < Boid.alignmentPerceptionRadius()) {
        let { dx, dy } = this.ShortestDxDy(other.position);
        let vec = createVector(dx, dy);
        if (
          Math.abs(this.velocity.angleBetween(vec)) <
          PerceptionDagreesSlider.value()
        ) {
          steering.add(other.velocity);
          total++;
          if (debug) {
            push();
            stroke(0, 255, 0, alignSlider.value() * 100 + 30);
            line(
              this.position.x,
              this.position.y,
              this.position.x + vec.x,
              this.position.y + vec.y
            );
            pop();
          }
          this.flagsRGBforACS[0] = 1;
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

  separation(boids, debug = false) {
    let steering = createVector();
    let total = 0;
    this.flagsRGBforACS[2] = 0;
    for (let other of boids) {
      if (
        !separationOnBoidsFromOtherSpecies.checked() &&
        other.myColor != this.myColor
      )
        continue;
      let d = this.toroidalDistance(other.position);
      if (other != this && d < Boid.separationPerceptionRadius()) {
        let { dx, dy } = this.ShortestDxDy(other.position);
        let vec = createVector(dx, dy);
        if (
          Math.abs(this.velocity.angleBetween(vec)) <
          PerceptionDagreesSlider.value()
        ) {
          let diff = p5.Vector.sub(this.position, other.position);
          diff.div(d * d);
          steering.add(diff);
          total++;
          if (debug) {
            push();
            stroke(255, 0, 0, separationSlider.value() * 100 + 30);
            line(
              this.position.x,
              this.position.y,
              this.position.x + vec.x,
              this.position.y + vec.y
            );
            pop();
          }
          this.flagsRGBforACS[2] = 1;
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

  cohesion(boids, debug = false) {
    let steering = createVector();
    let total = 0;
    this.flagsRGBforACS[1] = 0;
    for (let other of boids) {
      if (other.myColor != this.myColor) continue;

      let d = this.toroidalDistance(other.position);

      if (other != this && d < Boid.cohesionPerceptionRadius()) {
        let { dx, dy } = this.ShortestDxDy(other.position);
        let vec = createVector(dx, dy);
        if (
          Math.abs(this.velocity.angleBetween(vec)) <
          PerceptionDagreesSlider.value()
        ) {
          steering.add(other.position);
          total++;
          if (debug) {
            push();
            stroke(0, 0, 255, cohesionSlider.value() * 100 + 30);
            line(
              this.position.x,
              this.position.y,
              this.position.x + vec.x,
              this.position.y + vec.y
            );
            pop();
          }
          this.flagsRGBforACS[1] = 1;
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

  flock(boids, debug = false) {
    if (!separationOnBoidsFromOtherSpecies.checked()) {
      boids = boids.filter((boid) => boid.myColor === this.myColor);
    }

    let alignment = this.align(boids, debug);
    let cohesion = this.cohesion(boids, debug);
    let separation = this.separation(boids, debug);

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
    this.acceleration.setMag(0.01);
  }

  show(debug = false) {
    let theta = this.velocity.heading() + PI;
    push();
    translate(this.position.x, this.position.y);
    rotate(theta);
    strokeWeight(2);
    stroke(
      this.flagsRGBforACS[2] * 255,
      this.flagsRGBforACS[0] * 255,
      this.flagsRGBforACS[1] * 255
    );
    fill(this.myColor);
    arc(0, 0, Boid.r(), Boid.r(), -Boid.EIGHTH_PI, Boid.EIGHTH_PI);
    if (debug) {
      fill(255, 255, 255, 30);
      rotate(PI);
      stroke(255, 0, 0, separationSlider.value() * 100 + 30);
      arc(
        0,
        0,
        Boid.separationPerceptionRadius() * 2,
        Boid.separationPerceptionRadius() * 2,
        -PerceptionDagreesSlider.value(),
        PerceptionDagreesSlider.value()
      );
      stroke(0, 255, 0, alignSlider.value() * 100 + 30);
      arc(
        0,
        0,
        Boid.alignmentPerceptionRadius() * 2,
        Boid.alignmentPerceptionRadius() * 2,
        -PerceptionDagreesSlider.value(),
        PerceptionDagreesSlider.value()
      );
      stroke(0, 0, 255, cohesionSlider.value() * 100 + 30);
      arc(
        0,
        0,
        Boid.cohesionPerceptionRadius() * 2,
        Boid.cohesionPerceptionRadius() * 2,
        -PerceptionDagreesSlider.value(),
        PerceptionDagreesSlider.value()
      );
    }
    pop();
  }
}
