import * as THREE from "three";
import { DoodleJoystick } from "./joystick.js";


/* =================================
   SCENE
================================= */

const scene =
  new THREE.Scene();

scene.background =
  new THREE.Color(0xc9edf5);

scene.fog =
  new THREE.Fog(
    0xc9edf5,
    35,
    130
  );


/* =================================
   CAMERA
================================= */

const camera =
  new THREE.PerspectiveCamera(
    68,
    innerWidth / innerHeight,
    0.1,
    300
  );


/* =================================
   RENDERER
================================= */

const renderer =
  new THREE.WebGLRenderer({
    antialias: true
  });

renderer.setPixelRatio(
  Math.min(
    devicePixelRatio,
    2
  )
);

renderer.setSize(
  innerWidth,
  innerHeight
);

renderer.shadowMap.enabled =
  true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

document.body.appendChild(
  renderer.domElement
);


/* =================================
   LIGHTING
================================= */

scene.add(
  new THREE.HemisphereLight(
    0xffffff,
    0x668060,
    2
  )
);


const sun =
  new THREE.DirectionalLight(
    0xffffff,
    2
  );

sun.position.set(
  20,
  40,
  20
);

sun.castShadow = true;

sun.shadow.mapSize.width =
  2048;

sun.shadow.mapSize.height =
  2048;

scene.add(sun);


/* =================================
   GROUND
================================= */

const ground =
  new THREE.Mesh(
    new THREE.PlaneGeometry(
      180,
      180
    ),

    new THREE.MeshStandardMaterial({
      color: 0xa8d58e,
      roughness: 1
    })
  );

ground.rotation.x =
  -Math.PI / 2;

ground.receiveShadow = true;

scene.add(ground);


/* =================================
   PLATFORM HELPER
================================= */

function createBox(
  x,
  y,
  z,
  width,
  height,
  depth,
  color = 0xf1d49a
) {

  const material =
    new THREE.MeshStandardMaterial({
      color,
      roughness: .9
    });

  const mesh =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        width,
        height,
        depth
      ),
      material
    );

  mesh.position.set(
    x,
    y,
    z
  );

  mesh.castShadow = true;
  mesh.receiveShadow = true;

  scene.add(mesh);

  return mesh;
}


/* =================================
   PLATFORMS
================================= */

[
  [0, 1, -12, 12, 1, 9],
  [13, 3, -23, 10, 1, 8],
  [-12, 5, -34, 10, 1, 8],
  [4, 7, -47, 13, 1, 9],
  [18, 10, -60, 12, 1, 9],
  [0, 13, -75, 14, 1, 10]
].forEach(data => {
  createBox(...data);
});


/* =================================
   TREES
================================= */

for (
  let i = 0;
  i < 45;
  i++
) {

  const tree =
    new THREE.Group();


  const trunk =
    new THREE.Mesh(
      new THREE.CylinderGeometry(
        .3,
        .4,
        2.2,
        7
      ),

      new THREE.MeshStandardMaterial({
        color: 0x79533d
      })
    );


  const leaves =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        1.7,
        9,
        7
      ),

      new THREE.MeshStandardMaterial({
        color: 0x5fa95b
      })
    );


  trunk.position.y =
    1.1;

  leaves.position.y =
    3;


  trunk.castShadow = true;
  leaves.castShadow = true;


  tree.add(
    trunk,
    leaves
  );


  tree.position.set(
    (Math.random() - .5) * 165,
    0,
    (Math.random() - .5) * 165
  );


  tree.scale.setScalar(
    .7 +
    Math.random() * .6
  );


  scene.add(tree);
}


/* =================================
   PLAYER
================================= */

function createCharacter() {

  const group =
    new THREE.Group();


  const body =
    new THREE.Mesh(
      new THREE.CapsuleGeometry(
        .55,
        1,
        5,
        8
      ),

      new THREE.MeshStandardMaterial({
        color: 0xffcf4a,
        roughness: .75
      })
    );


  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        .55,
        12,
        9
      ),

      new THREE.MeshStandardMaterial({
        color: 0xffd5a0,
        roughness: .8
      })
    );


  body.position.y =
    1.1;

  head.position.y =
    2.25;


  body.castShadow = true;
  head.castShadow = true;


  group.add(
    body,
    head
  );


  return group;
}


const player =
  createCharacter();

player.position.set(
  0,
  .2,
  8
);

scene.add(player);


/* =================================
   COINS
================================= */

const coins = [];


for (
  const z of [
    0,
    -12,
    -23,
    -34,
    -47,
    -60,
    -75
  ]
) {

  const coin =
    new THREE.Mesh(
      new THREE.TorusGeometry(
        .35,
        .12,
        8,
        16
      ),

      new THREE.MeshStandardMaterial({
        color: 0xffcf27,
        metalness: .3,
        roughness: .35
      })
    );


  coin.rotation.x =
    Math.PI / 2;


  coin.position.set(
    0,
    2 + z / -10,
    z
  );


  coin.castShadow = true;


  scene.add(coin);

  coins.push(coin);
}


/* =================================
   JOYSTICK
================================= */

const joystick =
  new DoodleJoystick(
    "#joystick",
    "#stick"
  );


/* =================================
   KEYBOARD
================================= */

const keys = {};


addEventListener(
  "keydown",
  event => {

    keys[
      event.key.toLowerCase()
    ] = true;


    if (
      event.key === " "
    ) {

      event.preventDefault();

      jump();
    }
  }
);


addEventListener(
  "keyup",
  event => {

    keys[
      event.key.toLowerCase()
    ] = false;
  }
);


/* =================================
   CAMERA CONTROL
================================= */

let yaw = 0;

let pitch = .35;

let cameraPointer = null;

const cameraZone =
  document.querySelector(
    "#cameraZone"
  );


/*
  Camera swipe START
*/

cameraZone.addEventListener(
  "pointerdown",
  event => {

    event.preventDefault();

    cameraPointer = {

      id:
        event.pointerId,

      x:
        event.clientX,

      y:
        event.clientY
    };


    cameraZone.setPointerCapture(
      event.pointerId
    );
  }
);


/*
  Camera swipe MOVE
*/

cameraZone.addEventListener(
  "pointermove",
  event => {

    if (
      !cameraPointer ||
      event.pointerId !==
      cameraPointer.id
    ) {
      return;
    }

    event.preventDefault();


    const dx =
      event.clientX -
      cameraPointer.x;


    const dy =
      event.clientY -
      cameraPointer.y;


    /*
      Horizontal swipe
      rotates camera.
    */

    yaw -=
      dx * .006;


    /*
      Vertical swipe
      tilts camera.
    */

    pitch -=
      dy * .004;


    pitch =
      THREE.MathUtils.clamp(
        pitch,
        -.1,
        1
      );


    cameraPointer.x =
      event.clientX;

    cameraPointer.y =
      event.clientY;
  }
);


/*
  Camera swipe END
*/

function stopCameraSwipe() {

  cameraPointer = null;
}


cameraZone.addEventListener(
  "pointerup",
  stopCameraSwipe
);

cameraZone.addEventListener(
  "pointercancel",
  stopCameraSwipe
);

cameraZone.addEventListener(
  "lostpointercapture",
  stopCameraSwipe
);


/* =================================
   PLAYER PHYSICS
================================= */

let verticalVelocity = 0;

let grounded = false;

let dashTimer = 0;

let score = 0;

let speed = 0;


/* =================================
   JUMP
================================= */

function jump() {

  if (!grounded) {
    return;
  }

  verticalVelocity =
    8.5;

  grounded = false;
}


/* =================================
   DASH
================================= */

function doDash() {

  if (dashTimer > 0) {
    return;
  }


  const direction =
    new THREE.Vector3(
      Math.sin(yaw),
      0,
      Math.cos(yaw)
    );


  player.position.addScaledVector(
    direction,
    5
  );


  dashTimer =
    .8;


  showMessage(
    "Dash!"
  );
}


/* =================================
   BUTTONS
================================= */

const jumpButton =
  document.querySelector(
    "#jump"
  );

const dashButton =
  document.querySelector(
    "#dash"
  );


jumpButton.addEventListener(
  "pointerdown",
  event => {

    event.preventDefault();

    jump();
  }
);


dashButton.addEventListener(
  "pointerdown",
  event => {

    event.preventDefault();

    doDash();
  }
);


/* =================================
   MESSAGE
================================= */

const message =
  document.querySelector(
    "#msg"
  );

const messageText =
  message.querySelector(
    "span"
  );


let messageTimeout;


function showMessage(text) {

  messageText.textContent =
    text;

  message.classList.add(
    "show"
  );


  clearTimeout(
    messageTimeout
  );


  messageTimeout =
    setTimeout(() => {

      message.classList.remove(
        "show"
      );

    }, 900);
}


/* =================================
   UPDATE
================================= */

function update(delta) {

  let x =
    joystick.x;

  let y =
    joystick.y;


  /* Keyboard */

  if (keys.w) {
    y--;
  }

  if (keys.s) {
    y++;
  }

  if (keys.a) {
    x--;
  }

  if (keys.d) {
    x++;
  }


  /* Normalize */

  const inputLength =
    Math.hypot(
      x,
      y
    );


  if (
    inputLength > 1
  ) {

    x /= inputLength;
    y /= inputLength;
  }


  /* Camera-relative movement */

  const forward =
    new THREE.Vector3(
      Math.sin(yaw),
      0,
      Math.cos(yaw)
    );


  const right =
    new THREE.Vector3(
      Math.cos(yaw),
      0,
      -Math.sin(yaw)
    );


  const movement =
    new THREE.Vector3()
      .addScaledVector(
        right,
        x
      )
      .addScaledVector(
        forward,
        -y
      );


  /* Move */

  if (
    movement.length() >
    .08
  ) {

    movement.normalize();


    speed =
      dashTimer > 0
        ? 15
        : 7.5;


    player.position.addScaledVector(
      movement,
      speed * delta
    );


    /*
      Rotate player toward
      movement direction.
    */

    const targetRotation =
      Math.atan2(
        movement.x,
        movement.z
      );


    player.rotation.y =
      THREE.MathUtils.lerp(
        player.rotation.y,
        targetRotation,
        Math.min(
          1,
          delta * 12
        )
      );

  } else {

    speed = 0;
  }


  /* Gravity */

  verticalVelocity -=
    22 * delta;


  player.position.y +=
    verticalVelocity *
    delta;


  /* Ground */

  if (
    player.position.y <=
    .2
  ) {

    player.position.y =
      .2;

    verticalVelocity = 0;

    grounded = true;
  }


  /* Falling reset */

  if (
    player.position.y <
    -8
  ) {

    player.position.set(
      0,
      .2,
      8
    );

    verticalVelocity = 0;

    grounded = true;

    showMessage(
      "Back to the world"
    );
  }


  /* Dash timer */

  dashTimer =
    Math.max(
      0,
      dashTimer - delta
    );


  /* Coins */

  for (
    let i =
      coins.length - 1;

    i >= 0;

    i--
  ) {

    const coin =
      coins[i];


    /* Spin */

    coin.rotation.z +=
      delta * 4;


    coin.rotation.y +=
      delta * 2;


    /*
      Floating animation
    */

    coin.position.y +=
      Math.sin(
        performance.now() *
        .003 +
        i
      ) *
      .001;


    /* Collect */

    if (
      player.position.distanceTo(
        coin.position
      ) < 1.5
    ) {

      scene.remove(
        coin
      );

      coins.splice(
        i,
        1
      );


      score++;


      showMessage(
        "+1 Coin"
      );
    }
  }


  /* =================================
     CAMERA FOLLOW
  ================================= */

  const horizontalDistance =
    8.5;


  const cameraOffset =
    new THREE.Vector3(

      Math.sin(yaw) *
        Math.cos(pitch) *
        horizontalDistance,

      Math.sin(pitch) *
        horizontalDistance +
        3,

      Math.cos(yaw) *
        Math.cos(pitch) *
        horizontalDistance
    );


  const targetCameraPosition =
    player.position
      .clone()
      .add(
        cameraOffset
      );


  /*
    Smooth camera.
  */

  camera.position.lerp(
    targetCameraPosition,
    1 -
      Math.pow(
        .0005,
        delta
      )
  );


  camera.lookAt(
    player.position.x,
    player.position.y + 1.2,
    player.position.z
  );


  /* HUD */

  document.querySelector(
    "#speed"
  ).textContent =
    speed.toFixed(1);


  document.querySelector(
    "#coins"
  ).textContent =
    score;
}


/* =================================
   ANIMATION LOOP
================================= */

let last =
  performance.now();


function loop(time) {

  const delta =
    Math.min(
      .033,
      (time - last) /
      1000
    );


  last = time;


  update(delta);


  renderer.render(
    scene,
    camera
  );


  requestAnimationFrame(
    loop
  );
}


requestAnimationFrame(
  loop
);


/* =================================
   RESIZE
================================= */

addEventListener(
  "resize",
  () => {

    camera.aspect =
      innerWidth /
      innerHeight;

    camera.updateProjectionMatrix();


    renderer.setSize(
      innerWidth,
      innerHeight
    );
  }
);
