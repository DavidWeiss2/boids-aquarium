"use strict";

function Boid(boidPosition) {


    this.acceleration = createVector(0, 0);
    this.velocity = createVector(0, 0);
    this.position = boidPosition;
    this.size = 1.0;
    this.mass = size ** 2;
    this.millis = (new Date).getTime();
    this.color;
    this.dna = {
        'Food': 1,
        'Fear': 1,
        'perception': 1

    }
}

Boid.maxVelocity = 3.0;
Boid.maxAcceleration = 1;
Boid.maxSteering = 0.5;
Boid.foodPlus = 0.55;
Boid.mutationRate = 0.2;
// TODO add health Boid.frameMinus = 0.00005;

Boid.prototype.update = () => {
    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxVelocity);
    this.position.add(this.velocity);
    // Reset acceleration to 0 each cycle
    this.acceleration.mult(0);
};

Boid.prototype.applyForce = (force) => {
    // We could add mass here if we want A = F / M
    this.acceleration.add(force);
};

Boid.prototype.boundaries = () => {
    var desired = null;
    if (this.position.x < margin) {
        desired = p.createVector(this.maxspeed, this.velocity.y);
    }
    else if (this.position.x > p.width - margin) {
        desired = p.createVector(-this.maxspeed, this.velocity.y);
    }

    if (this.position.y < margin) {
        desired = p.createVector(this.velocity.x, this.maxspeed);
    }
    else if (this.position.y > p.height - margin) {
        desired = p.createVector(this.velocity.x, -this.maxspeed);
    }

    if (desired !== null) {
        desired.normalize();
        desired.mult(this.maxspeed);
        var steer = p5.Vector.sub(desired, this.velocity);
        steer.limit(this.maxforce);
        this.applyForce(steer);
    }
};

Boid.prototype.behaviours = function (food, boids) {
    var biggerBoids = boids.filter(boid => boid.health *
        sketch.eatHealthToSelfRatio > this.health);

    var steerB = this.fear(biggerBoids, this.dna[2]);
    steerB.mult(this.dna[1]);
    this.applyForce(steerB);

    if (this.hunger >= sketch.HungerToEat) {
        return;
    }

    if (this.health < sketch.HealthUntilStopEatingFood) {
        var steerG = this.eatFood(food, foodPlus, this.dna[2]);
    }
    else {
        //					var steerG = this.eatFood(food, foodPlus, this.dna[2]);
        var steerG = this.eatBoids(boids, this.dna[2]);
    }
    steerG.mult(this.dna[0]);
    this.applyForce(steerG);
};

Boid.prototype.fear = (list, perception) => {
    var record = Infinity;
    var closest = null;
    for (var i = list.length - 1; i >= 0; --i) {
        var d = p.dist(this.position.x, this.position.y, list[i].position.x, list[i].position.y);

        if (d < record && d < perception) {
            record = d;
            closest = list[i];
        }
    }

    if (closest !== null) {
        return this.seek(closest);
    }

    return p.createVector(0, 0);
};

Boid.prototype.eat = (list, nutrition, perception) => {
    var record = Infinity;
    var closest = null;
    for (var i = list.length - 1; i >= 0; --i) {
        var d = p.dist(this.position.x, this.position.y, list[i].position.x, list[i].position.y);

        if (d < this.maxspeed) {
            list.splice(i, 1);
            this.health += nutrition;
            this.hunger += nutrition;
            return p.createVector(0, 0);
        } else {
            if (d < record && d < perception) {
                record = d;
                closest = list[i];
            }
        }
    }

    if (closest !== null) {
        return this.seek(closest);
    }

    return p.createVector(0, 0);
};


Boid.prototype.clone = function () {
    var p = sketch.p;

    if (p.random(1) < 0.0005) {
        return new p5.Boid(this.position.x, this.position.y, this.dna);
    } else return null;
};

/*Boid.prototype.dead = function () {
    return (this.health < 0);
};*/

Boid.prototype.seek = function (target) {
    // A vector pointing from the location to the target
    //var desired = p5.Vector.sub(target, this.position);
    var dx = target.position.x - this.position.x;
    var dy = target.position.y - this.position.y;

    var desired = p.createVector(dx, dy);

    // Scale to maximum speed
    desired.setMag(this.maxspeed);

    // Steering = Desired minus velocity
    var steer = p5.Vector.sub(desired, this.velocity);
    // Limit to maximum steering force
    steer.limit(this.maxforce);

    return steer;
};

Boid.prototype.display = function (isBest) {
    // Draw a triangle rotated in the direction of velocity
    var theta = this.velocity.heading() + p.PI / 2;
    let sizeFromHealth = Math.sqrt(this.health) + 0.3;
    sizeFromHealth = sizeFromHealth * 0.7;

    p.push();
    if (sketch.debug || isBest) {
        p.textAlign(p.CENTER);
        p.text(this.health.toFixed(2), this.position.x, this.position.y - 15);
    }
    p.translate(this.position.x, this.position.y);
    p.rotate(theta);
    const rd = p.color(255, 0, 0);

    if (sketch.debug || isBest) {
        p.noFill();
        p.stroke(sketch.foodCol);
        p.strokeWeight(1);
        p.line(0, 0, 0, -this.dna[0] * 25);
        p.stroke(this.color);
        p.strokeWeight(0.5);
        p.ellipse(0, 0, this.dna[2] * 2);


        p.stroke(rd);
        p.strokeWeight(1.2);
        p.line(0, 0, 0, -this.dna[1] * 25);
        p.strokeWeight(1);
        p.stroke(255);
    }

    p.fill(this.color);
    p.stroke(this.color);
    p.strokeWeight(1);
    p.beginShape();
    p.vertex(0, -this.r * 2 * sizeFromHealth);
    p.vertex(-this.r * sizeFromHealth, this.r * 2 * sizeFromHealth);
    p.vertex(this.r * sizeFromHealth, this.r * 2 * sizeFromHealth);
    p.endShape(p.CLOSE);
    p.pop();
};