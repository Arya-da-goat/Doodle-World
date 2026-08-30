import * as THREE from "three";
import {DoodleJoystick} from "./joystick.js";

const scene=new THREE.Scene();
scene.background=new THREE.Color(0xbfe5f2);
scene.fog=new THREE.Fog(0xbfe5f2,45,150);

const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,300);
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xffffff,0x6f8c5e,2));
const sun=new THREE.DirectionalLight(0xffffff,2.2);sun.position.set(30,60,20);sun.castShadow=true;scene.add(sun);

const ground=new THREE.Mesh(new THREE.PlaneGeometry(180,180),new THREE.MeshStandardMaterial({color:0x9ccc82,roughness:1}));
ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground);

// doodle-like world markings
const pathMat=new THREE.MeshStandardMaterial({color:0xd8c38d});
for(let i=-80;i<81;i+=12){let p=new THREE.Mesh(new THREE.BoxGeometry(5,.04,5),pathMat);p.position.set(i,.02,0);scene.add(p)}

function tree(x,z,s=1){let g=new THREE.Group();let trunk=new THREE.Mesh(new THREE.CylinderGeometry(.28,.38,2.2,7),new THREE.MeshStandardMaterial({color:0x79533d}));trunk.position.y=1.1;trunk.castShadow=true;g.add(trunk);let crown=new THREE.Mesh(new THREE.SphereGeometry(1.7,9,7),new THREE.MeshStandardMaterial({color:0x5fa95b}));crown.position.y=3; crown.scale.set(1,.9,1);crown.castShadow=true;g.add(crown);g.position.set(x,0,z);g.scale.setScalar(s);scene.add(g)}
for(let i=0;i<55;i++){let x=(Math.random()-.5)*165,z=(Math.random()-.5)*165;if(Math.hypot(x,z)>18)tree(x,z,.7+Math.random()*.7)}

function house(x,z){let g=new THREE.Group();let body=new THREE.Mesh(new THREE.BoxGeometry(7,4.5,6),new THREE.MeshStandardMaterial({color:0xffefd0}));body.position.y=2.25;body.castShadow=true;g.add(body);let roof=new THREE.Mesh(new THREE.ConeGeometry(5.2,3,4),new THREE.MeshStandardMaterial({color:0xd76c58}));roof.position.y=6;roof.rotation.y=Math.PI/4;roof.castShadow=true;g.add(roof);g.position.set(x,0,z);scene.add(g)}
house(-8,-6);house(5,-8);house(0,-18);

function makePlayer(){let g=new THREE.Group();let body=new THREE.Mesh(new THREE.CapsuleGeometry(.65,1.2,5,8),new THREE.MeshStandardMaterial({color:0xffcf4a}));body.position.y=1.35;body.castShadow=true;g.add(body);let head=new THREE.Mesh(new THREE.SphereGeometry(.62,12,9),new THREE.MeshStandardMaterial({color:0xffd5a0}));head.position.y=2.65;head.castShadow=true;g.add(head);return g}
const player=makePlayer();player.position.set(0,0,8);scene.add(player);

function makeEnemy(){let g=new THREE.Group();let m=new THREE.Mesh(new THREE.SphereGeometry(.8,12,9),new THREE.MeshStandardMaterial({color:0x9c75db}));m.position.y=.8;m.castShadow=true;g.add(m);let e1=new THREE.Mesh(new THREE.SphereGeometry(.11,8,6),new THREE.MeshBasicMaterial({color:0x222222}));let e2=e1.clone();e1.position.set(-.25,1,-.65);e2.position.set(.25,1,-.65);g.add(e1,e2);return g}
const enemies=[];for(let i=0;i<8;i++){let e=makeEnemy();e.position.set((Math.random()-.5)*100,0,(Math.random()-.5)*100);e.userData={hp:40,max:40,speed:2.2,hit:0};scene.add(e);enemies.push(e)}

const joy=new DoodleJoystick("#joystick","#stick");
const state={hp:100,level:1,xp:0,gold:0,attackCooldown:0};
const keys={};addEventListener("keydown",e=>keys[e.key.toLowerCase()]=true);addEventListener("keyup",e=>keys[e.key.toLowerCase()]=false);
document.querySelector("#attack").addEventListener("pointerdown",attack);

function message(t){let el=document.querySelector("#message");el.textContent=t;el.classList.add("show");clearTimeout(message.t);message.t=setTimeout(()=>el.classList.remove("show"),1800)}
function addXP(n){state.xp+=n;if(state.xp>=100){state.xp-=100;state.level++;state.hp=100;message("⭐ LEVEL UP! Level "+state.level)}}
function attack(){if(state.attackCooldown>0)return;state.attackCooldown=.45;let best=null,bd=3.4;for(const e of enemies){if(e.userData.hp>0){let d=player.position.distanceTo(e.position);if(d<bd){bd=d;best=e}}}if(best){best.userData.hp-=20;best.userData.hit=.15;if(best.userData.hp<=0){best.visible=false;state.gold+=5;addXP(35);message("👾 Monster defeated! +35 XP")}}else message("⚔️ Swing!")}
function update(dt){
 let x=joy.x,y=joy.y;if(keys.w||keys.arrowup)y-=1;if(keys.s||keys.arrowdown)y+=1;if(keys.a||keys.arrowleft)x-=1;if(keys.d||keys.arrowright)x+=1;let m=Math.hypot(x,y);if(m>1){x/=m;y/=m}
 if(Math.hypot(x,y)>.08){player.position.x+=x*9*dt;player.position.z+=y*9*dt;player.rotation.y=Math.atan2(x,y)}
 player.position.x=THREE.MathUtils.clamp(player.position.x,-82,82);player.position.z=THREE.MathUtils.clamp(player.position.z,-82,82);
 state.attackCooldown=Math.max(0,state.attackCooldown-dt);
 for(const e of enemies){if(!e.visible)continue;e.userData.hit=Math.max(0,e.userData.hit-dt);let dx=player.position.x-e.position.x,dz=player.position.z-e.position.z,d=Math.hypot(dx,dz);if(d<18&&d>1.8){e.position.x+=dx/d*e.userData.speed*dt;e.position.z+=dz/d*e.userData.speed*dt}if(d<2&&e.userData.hit<=0){state.hp-=8;e.userData.hit=.9;if(state.hp<=0){state.hp=100;player.position.set(0,0,8);message("💫 You fainted! Back to the village.")}}}
 let target=new THREE.Vector3(player.position.x+4*player.userData?.x||player.position.x,2.8,player.position.z+7); // fallback
 const desired=new THREE.Vector3(player.position.x,5.5,player.position.z+8.5);camera.position.lerp(desired,1-Math.pow(.001,dt));camera.lookAt(player.position.x,1.3,player.position.z);
 document.querySelector("#stats").textContent=`HP ${Math.ceil(state.hp)} • Level ${state.level} • XP ${state.xp}/100 • Gold ${state.gold}`;
}
function loop(t){let dt=Math.min(.05,(t-(loop.last||t))/1000);loop.last=t;update(dt);renderer.render(scene,camera);requestAnimationFrame(loop)}requestAnimationFrame(loop);
addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
