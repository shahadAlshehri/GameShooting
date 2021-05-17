let canvas = document.getElementById('canvas')
let context = canvas.getContext('2d')
let Size = 100
let currentFrame = 0
let defeat = false
let victory = false
let WarplaneCase = false
let score = 0

let gunshots_soldier = []
let bombs = []
let block_protections = []
let WarplaneBombs = []

class PlayerSoldier {
  constructor() {
    this.width = 150
    this.height = 120
    this.x = 400
    this.y = 500
    this.speed = 10
    
    this.left = false
    this.right = false
    this.shooting = false
    this.live_soldier = true
  }
  
  DrawCharacter() {
    if (this.live_soldier) {
      let imge=new Image();
      imge.src="Player_Soldier.png";
      context.drawImage(imge, this.x, this.y, this.width,this.height);
    }
  }
  CharacterMovements() {
    if (this.left && this.live_soldier) {
       this.x -= this.speed
    } else if (this.right && this.live_soldier) {
       this.x += this.speed
     } 

    if (this.shooting && this.live_soldier) {
      gunshots_soldier.push(new GunshotsSoldier(this.x + 50, this.y + 25))
      player.shooting = false
    }
  }

}

// Default player starting location
let player = new PlayerSoldier()

function Player() {
  player.CharacterMovements()
  player.DrawCharacter()

  // Check collision with falling bombs
  for (let i = 0; i < bombs.length; i++) {
    if ( CheckCollision(player, bombs[i]))
       defeat = true
      // break; 
  }

  // Check if Warplane is alive and collision with Warplane
  if ( warplane.live_soldier && CheckCollision(player, warplane))
   defeat = true 
}

class GunshotsSoldier {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = 30
    this.height = 30
    this.power = 5
    this.speed = 10
  }
DrawGunshot() {
    let imgeshoot=new Image();
    imgeshoot.src="Gunshot.png";
    context.beginPath()
    context.drawImage(imgeshoot, this.x, this.y, this.width,this.height);
    context.fill();
  }
  GunshotMovement(){
    this.y -= this.speed
  } 
}

function handleGunshotsSoldier() {
  for (let i = 0; i < gunshots_soldier.length; i++) {
    gunshots_soldier[i].GunshotMovement()
    gunshots_soldier[i].DrawGunshot();

    // Check collision with falling bombs
    for (let j = 0; j < bombs.length; j++) {
      if ( bombs[j] &&  gunshots_soldier[i] && CheckCollision(gunshots_soldier[i], bombs[j]) )
       {
        bombs[j].health -= gunshots_soldier[i].power
        gunshots_soldier.splice(i, 1)
        i--
      }
    }

    // Check collision with WarplaneCas
    if (WarplaneCase  && gunshots_soldier[i] 
      && CheckCollision(warplane, gunshots_soldier[i])) {
      if (score < 70) score += 1
      gunshots_soldier.splice(i, 1)
      i--
    }

    // Check collision with canvas walls
    if (gunshots_soldier[i] && gunshots_soldier[i].y < 30) {
      gunshots_soldier.splice(i, 1)
      i--
    }
  }
}

class BlockProtection {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.width = 180
    this.height = 180
  }
  DrawBlock() {
    let imgesave=new Image();
    imgesave.src="BlockProtection.png";
    context.drawImage(imgesave, this.x, this.y, this.width,this.height);
  }
}

function handleBlockProtection() {
  for (let i = 0; i < block_protections.length; i++) {
    block_protections[i].DrawBlock()

    for (let j = 0; j < bombs.length; j++) {

      if (CheckCollision(block_protections[i], bombs[j])) {
        bombs.splice(j, 1)
        j++
      }
    }
    for (let j = 0; j < gunshots_soldier.length; j++) {
      if ( CheckCollision(block_protections[i], gunshots_soldier[j])) {
        gunshots_soldier.splice(j, 1)
        j--
      }
    }
  }
}

(function createBlockProtection() {
  block_protections.push(new BlockProtection(Math.random() * +100, Math.random() * +300))
  block_protections.push( new BlockProtection(Math.random() * +750+50, Math.random() * +150))
  })();

class Bombs {
  constructor(horizontalPosition) {
    this.x = horizontalPosition
    this.y = 20
    this.width = 70
    this.height = 70
    this.movement = Math.random() * 1+1 
    this.health = 5
  } 
  DrawBombs() {
    let imgebomb=new Image();
    imgebomb.src="Bomb.png";
    context.drawImage(imgebomb, this.x, this.y, this.width,this.height);
   
  }
  BombsMovement() {
    this.y += this.movement
  }
 
}

function handleBombs() {
  for (let i = 0; i < bombs.length; i++) {
    bombs[i].DrawBombs()
     bombs[i].BombsMovement()
   

    if (bombs[i].health <= 0) {
      if (score < 50) 
        score += 1
      bombs.splice(i, 1)
    } 
    }
  
   if(!WarplaneCase && currentFrame % 24===0){
    let Position = Math.floor(Math.random() * 18) * 30
    bombs.push(new Bombs(Position))
  }
}

class Warplane {
  constructor(Position) {
    this.x = Position
    this.y = 30
    this.width = 125
    this.height = 125
    this.movementX = Math.random() * 0.5 + 2
    this.movementY = Math.random() * 0.5 + 3
    this.live_warplane = true
  }
  DrawWarplane() {
    if (this.live_warplane) {
      let imgeWarplane=new Image();
      imgeWarplane.src="Warplane.png";
      context.drawImage(imgeWarplane, this.x, this.y, this.width,this.height);
    }
  }
  WarplaneMovment() {
    if (this.live_warplane) {
      if (this.x >= canvas.width - this.width || this.x <= 0)
        this.movementX *= -1
      if (this.y >= canvas.height - this.height || this.y <= 0)
        this.movementY *= -1

      for (let i = 0; i < block_protections.length; i++) {
        if (CheckCollision(this, block_protections[i])) {
          this.movementX *= -1
          this.movementY *= -1
        }
      }

      this.x += this.movementX
      this.y += this.movementY

      if (currentFrame % 50 === 0) {
        WarplaneBombs.push( new WarplaneBomb(this.x + 40, this.y + 40, 'up'))
        WarplaneBombs.push(new WarplaneBomb(this.x + 40, this.y + 40, 'left'))
        WarplaneBombs.push( new WarplaneBomb(this.x + 40, this.y + 40, 'right'))
      }
    }
  }
  }

let warplane = new Warplane(450)

function handleWarplane() {
  if (WarplaneCase) {
    warplane.DrawWarplane()
    warplane.WarplaneMovment()    
  }
}

class WarplaneBomb {
  constructor(x, y, dir) {
    this.x = x
    this.y = y
    this.width = 20
    this.height = 20
    this.power = 5
    this.speed = 6
    this.direction = dir
  } 
  DrawBomb() {

    let imgebomb2=new Image();
    imgebomb2.src="Bomb.png";
    context.beginPath()
    context.drawImage(imgebomb2, this.x, this.y, this.width,this.height);
    context.fill()
  }
  BombMovement() {
    switch (this.direction) {
      case 'up':
        this.y -= this.speed
        break
      case 'left':
        this.x -= this.speed
        break
      case 'right':
        this.x += this.speed
        break
    }
  }
 }

function handleWarplaneBomb() {
  for (let i = 0; i < WarplaneBombs.length; i++) {
    WarplaneBombs[i]. BombMovement()
    WarplaneBombs[i].DrawBomb() 

    for (let j = 0; j < block_protections.length; j++) {
      if ( WarplaneBombs[i] && CheckCollision(block_protections[j],  WarplaneBombs[i])) {
        WarplaneBombs.splice(i, 1)
        i--
      }
    }

    if ( WarplaneBombs[i] && CheckCollision(player,  WarplaneBombs[i])) {
      defeat = true
      WarplaneBombs.splice(i, 1)
      i--
    }

    if ( WarplaneBombs[i]) {
      if ( WarplaneBombs[i].x >= canvas.width -  WarplaneBombs[i].width ||  WarplaneBombs[i].x <= 0 
        ||  WarplaneBombs[i].y >= canvas.height -  WarplaneBombs[i].height || WarplaneBombs[i].y <= 0)
         {
        WarplaneBombs.splice(i, 1)
      }
    }
  }}
function drawScore() {
  context.fillStyle = 'red'
  context.font = '30px Arial'
  context.fillText('Score: ' + score, 20, 40);
}
function Game() {
  
  if (defeat) {
     let overLay=document.createElement("div");
    overLay.className="popUp-overlay";
     document.body.appendChild(overLay);
     let popupBox=document.createElement("div");
     popupBox.className="popUp-Box";
     popupBox.textContent="You are dead"
     popupBox.style.color="red"
     overLay.appendChild(popupBox);
     overLay.fill();
   
  } else if (victory) {
    let overLay=document.createElement("div");
    overLay.className="popUp-overlay";
     document.body.appendChild(overLay);
     let popupBox=document.createElement("div");
     popupBox.className="popUp-Box";
     popupBox.textContent="You Won"
     popupBox.createElement
     popupBox.style.color="green"
     overLay.appendChild(popupBox);
     overLay.fill()

  } else if (score >= 30) {
    warplane.live_warplane = false
    victory = true
  } else if (score >= 10) {//to 50 
    WarplaneCase = true
  }
}

(function DrawGame() {
  clearScreen();
  Player();
  handleGunshotsSoldier()
  handleBombs()
  Game();
  drawScore();
  handleBlockProtection()
  handleWarplane()
  handleWarplaneBomb()
  currentFrame++
  requestAnimationFrame(DrawGame)
})();

function  clearScreen(){
  context.fillStyle = 'rgba(31, 58, 16, 0.973)';
  context.fillRect(0, 0, canvas.width, canvas.height)
}

function CheckCollision(first, second) {
  if (
    !( first.x > second.x + second.width ||  first.x + first.width < second.x ||
      first.y > second.y + second.height || first.y + first.height < second.y )) 
  {
    return true
  }
}

function KeyDown(e) {
  if (e.keyCode == '37') {
    player.left = true
  } else if (e.keyCode == '39') {
    player.right = true
  } else if (e.keyCode == '13') {
    player.shooting = true
  }
}

function KeyUp(e) {
  if (e.keyCode == '37') {
    player.left = false
  } else if (e.keyCode == '39') {
    player.right = false
  } 
}

document.onkeydown = KeyDown
document.onkeyup = KeyUp


