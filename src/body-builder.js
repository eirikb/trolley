// The strongest there is

export default class BodyBuilder {

  constructor(instance, options) {
    this.instance = instance;
    this.boxes = [];
    this.circles = [];
    Object.assign(this, options);
  }

  box(options) {
    this.boxes.push(options);
    return this;
  }

  circle(options) {
    this.circles.push(options);
    return this;
  }

  create() {
    return this.instance.createBody(this);
  }
}
