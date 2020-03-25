
const N=100
const DX=311/2
const DY=180/2

const toScreen = (x,y) => [
  (x-y)*DX/2 + swx,
  y*DY+(x-y)*DY/2 + swy
]

const isVisible = (i,j) => {
   const [x,y] = toScreen(i,j)
   if(x+DX<0) return false;
   if(x-DX>=canvas.width) return false;
   if(y+DY<0) return false;
   if(y-DY>=canvas.height) return false;
   return true;
}

var swx=0,swy=0
var g = null;
var mans = []

const world = []
for(var i=0; i<N; i++) {
  const r = []
  world.push(r)
  for(var j=0; j<N; j++) {
    r.push(null)
  }
}

for(var i=0; i<1000; i++) {
  mans.push({
    x:N*Math.random(), y:N*Math.random(),
    dir:0, anim:0
  })
}


const frames = (f, min, max) => {
  var ret = [];
  for(var i=min; i<max; i++) ret.push(f(i))
  return ret
}

var sprites = {
  ground:'assets/tile.png',
  man:{
    walk:{
      0:frames((i)=>`assets/man-walk-x-${i}.png`,0,8),
      1:frames((i)=>`assets/man-walk-${i}.png`,0,8),
      2:frames((i)=>`assets/man-walk-y-${i}.png`,0,8),
      3:frames((i)=>`assets/man-walk-c-${i}.png`,0,8),
    }
  }
}

function preloadSprites(sprites) {
  for(var i in sprites) {
    if(typeof(sprites[i]) === 'string') {
      const src = sprites[i];
      sprites[i] = new Image()
      sprites[i].src = src
    } else {
      preloadSprites(sprites[i])
    }
  }
}

function fill(color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

var canvas = null;
var ctx = null;
function draw() {
  fill("black")
  world.forEach((r,i)=>{
    r.forEach((x,j)=>{
      if(isVisible(i,j))
        ctx.drawImage(sprites.ground, ...toScreen(i,j))
    })
  })

  var manstodraw = []
  mans.forEach(m=>{
    if(isVisible(m.x,m.y)) manstodraw.push(m)
    if(m.dir===1) m.x += .08
    else if(m.dir===0) m.y += .08
    else if(m.dir===2) m.y -= .08
    else if(m.dir===3) m.x -= .08
    m.anim++;
    if(m.anim>=sprites.man.walk[m.dir].length) m.anim=0
  })

  manstodraw.sort((a,b)=>(a.y+a.x)- (b.y+b.x)).forEach(m=>{
    ctx.drawImage(sprites.man.walk[m.dir][m.anim], ...toScreen(m.x,m.y))
  })

}

$(()=>{

  preloadSprites(sprites)

  canvas = $("canvas")[0]
  ctx = canvas.getContext("2d")


  setInterval(draw, 70)

  setInterval(()=>{
    mans.forEach(m=>{
      var changeDir = Math.random()>0.99
      if(changeDir) m.dir = Math.floor(Math.random()*4)
      if(m.dir===1 && m.x >= N-2) m.dir = 3
      else if(m.dir===0 && m.y >= N-2) m.dir = 2
      else if(m.dir===2 && m.y < 0) m.dir = 0
      else if(m.dir===3 && m.x < 0) m.dir = 1
    })
  },100)


})

var dragging = false;
var lastx = 0, lasty = 0;
var dragStarted = false;

$(window).mousedown((e)=>{dragging = true; lastx=e.clientX; lasty=e.clientY; })
$(window).mousemove((e)=>{
  if(!dragging) return;
  if(Math.abs(e.clientX - lastx) + Math.abs(e.clientY - lasty) < 20 && !dragStarted) return;
  if(!dragStarted) dragStarted=true;
  $(window).trigger("drag", {dx:e.clientX-lastx, dy:e.clientY-lasty})
  lastx = e.clientX;
  lasty = e.clientY;
})
$(window).mouseup((e)=>{dragging=false; dragStarted=false})

$(window).on("drag", (e, {dx,dy})=>{
  swx+=dx*5; swy+=dy*5
})
