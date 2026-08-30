export class DoodleJoystick{
constructor(base,stick){this.base=document.querySelector(base);this.stick=document.querySelector(stick);this.x=0;this.y=0;this.id=null;this.base.addEventListener("pointerdown",e=>this.start(e));addEventListener("pointermove",e=>this.move(e));addEventListener("pointerup",e=>this.end(e));addEventListener("pointercancel",e=>this.end(e))}
start(e){if(this.id!==null)return;this.id=e.pointerId;this.update(e.clientX,e.clientY)}
move(e){if(e.pointerId===this.id)this.update(e.clientX,e.clientY)}
end(e){if(e.pointerId!==this.id)return;this.id=null;this.x=this.y=0;this.stick.style.transform="translate(0,0)"}
update(x,y){let r=this.base.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2,rad=r.width/2-30,dx=x-cx,dy=y-cy,d=Math.hypot(dx,dy)||1;if(d>rad){dx=dx/d*rad;dy=dy/d*rad}this.x=dx/rad;this.y=dy/rad;if(Math.hypot(this.x,this.y)<.08)this.x=this.y=0;this.stick.style.transform=`translate(${this.x*rad}px,${this.y*rad}px)`}
}