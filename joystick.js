export class DoodleJoystick {

  constructor(baseSelector, stickSelector) {

    this.base =
      document.querySelector(baseSelector);

    this.stick =
      document.querySelector(stickSelector);

    this.x = 0;
    this.y = 0;

    this.pointerId = null;

    this.radius = 0;


    this.base.addEventListener(
      "pointerdown",
      event => this.start(event)
    );


    window.addEventListener(
      "pointermove",
      event => this.move(event),
      {
        passive: false
      }
    );


    window.addEventListener(
      "pointerup",
      event => this.end(event)
    );


    window.addEventListener(
      "pointercancel",
      event => this.end(event)
    );
  }


  start(event) {

    if (this.pointerId !== null) {
      return;
    }

    event.preventDefault();

    this.pointerId =
      event.pointerId;

    this.base.setPointerCapture(
      event.pointerId
    );

    this.update(
      event.clientX,
      event.clientY
    );
  }


  move(event) {

    if (
      event.pointerId !==
      this.pointerId
    ) {
      return;
    }

    event.preventDefault();

    this.update(
      event.clientX,
      event.clientY
    );
  }


  end(event) {

    if (
      event.pointerId !==
      this.pointerId
    ) {
      return;
    }

    this.pointerId = null;

    this.x = 0;
    this.y = 0;

    this.stick.style.transform =
      "translate(0px, 0px)";
  }


  update(x, y) {

    const rect =
      this.base.getBoundingClientRect();

    const centerX =
      rect.left +
      rect.width / 2;

    const centerY =
      rect.top +
      rect.height / 2;

    let dx =
      x - centerX;

    let dy =
      y - centerY;

    const radius =
      rect.width / 2 - 30;

    const distance =
      Math.hypot(dx, dy) || 1;


    if (distance > radius) {

      dx =
        dx / distance *
        radius;

      dy =
        dy / distance *
        radius;
    }


    this.x =
      dx / radius;

    this.y =
      dy / radius;


    if (
      Math.hypot(
        this.x,
        this.y
      ) < .08
    ) {

      this.x = 0;
      this.y = 0;
    }


    this.stick.style.transform =
      `translate(
        ${this.x * radius}px,
        ${this.y * radius}px
      )`;
  }
}
