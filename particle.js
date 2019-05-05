class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        this.accX = 0;
        this.accY = 0;

        this.velX = 0;
        this.velY = 0;
        this.damping = 0.9;

    }

    addForce(forceX, forceY) {
        this.accX += forceX;
        this.accY += forceY;
    }

    update() {
        this.accX *= this.damping;
        this.accY *= this.damping;
        this.velX = this.accX;
        this.velY = this.accY;

        this.x += this.velX / frameRate();
        this.y += this.velY / frameRate();
    }
}