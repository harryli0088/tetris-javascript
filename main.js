const moves = {
  "67": { //default c 67
    name: "hold",
    func: () => {
      if(hold.canHold) {
        //swap pieces in hold
        currentPieceIndex = currentPiece.pieceIndex;
        currentPiece = pickNewPiece(hold.pieceIndex!==-1 ? hold.pieceIndex : undefined);
        hold.pieceIndex = currentPieceIndex;
        hold.canHold = false;
      }
    }
  },
  "40": { //efault arrow down 40
    name: "drop",
    func: drop
  },
  "32": { //default space 32
    name: "hard",
    func: () => {}
  },
  "39": { //default right arrow 39
    name: "right",
    func: () => {
      if(canMoveRight()) {
        currentPiece.left++;
      }
    }
  },
  "37": { //default left arrow 37
    name: "left",
    func: () => {
      if(currentPiece.left > 0) {
        currentPiece.left--;
      }
    }
  },
  "38": { //default up arrow 38
    name: "clockwise",
    func: () => {}
  },
  "90": { //default z 90
    name: "counterclockwise",
    func: () => {}
  },
  "88": { //default x 88
    name: "180",
    func: () => {}
  },
}



let pieces = [
  {
    name: "line",
    color: "lightblue",
    start: [
      [1,1,1,1]
    ]
  },
  {
    name: "z",
    color: "red",
    start: [
      [1,1,0],
      [0,1,1]
    ]
  },
  {
    name: "s",
    color: "green",
    start: [
      [0,1,1],
      [1,1,0]
    ]
  },
  {
    name: "t",
    color: "purple",
    start: [
      [0,1,0],
      [1,1,1]
    ]
  },
  {
    name: "square",
    color: "yellow",
    start: [
      [1,1],
      [1,1]
    ]
  },
  {
    name: "l-left",
    color: "blue",
    start: [
      [1,0,0],
      [1,1,1]
    ]
  },
  {
    name: "l-right",
    color: "orange",
    start: [
      [0,0,1],
      [1,1,1]
    ]
  }
]

const WIDTH = 10;
const HEIGHT = 20;
const pixelWidth = 400;
const pixelHeight = 800;
const squarePixelWidth = pixelWidth / WIDTH;

let grid = []; //grid of static pieces that have already dropped
let currentPiece = {
  left: 3, //squares from the left
  top: 0, //squares from the top
  pieceIndex: -1,
  array: []
};
let hold = {
  pieceIndex: -1,
  canHold: true
};


function init() {
  let row = [];
  for(let i=0; i<WIDTH; ++i) {
    row.push("gray");
  }
  for(let i=0; i<HEIGHT; ++i) {
    grid.push(JSON.parse(JSON.stringify(row)));
  }

  currentPiece = pickNewPiece();

  draw();
}


let canvas = document.getElementById("canvas");
canvas.width = pixelWidth;
canvas.height = pixelHeight;
let ctx = canvas.getContext("2d");




window.onkeydown = function(e) {
   var key = e.keyCode ? e.keyCode : e.which;

   if(moves[key]) {
     atBottom();

     console.log(moves[key].name);
     moves[key].func();
     draw();
   }
}



function pickNewPiece(index) {
  if(index == undefined) {
    index = Math.floor( Math.random()*(pieces.length-1) );
  }

  return {
    left: 3, //squares from the left
    top: -1*pieces[index].start.length+1, //squares from the top
    pieceIndex: index,
    array: JSON.parse(JSON.stringify(pieces[index].start))
  }
}




function draw() {
  //draw grid
  for(let h=0; h<grid.length; ++h) {
    for(let w=0; w<grid[h].length; ++w) {
      ctx.fillStyle = grid[h][w];
      ctx.fillRect(w*squarePixelWidth, h*squarePixelWidth, squarePixelWidth, squarePixelWidth);
    }
  }

  //draw piece
  for(let h=0; h<currentPiece.array.length; ++h) {
    for(let w=0; w<currentPiece.array[h].length; ++w) {
      if(currentPiece.array[h][w]===1) {
        ctx.fillStyle = pieces[ currentPiece.pieceIndex ].color;
        ctx.fillRect((w+currentPiece.left)*squarePixelWidth, (h+currentPiece.top)*squarePixelWidth, squarePixelWidth, squarePixelWidth);
      }
    }
  }
}

//returns true if the piece is touching the bottom, else false
function atBottom() {
  for(let w=0; w<currentPiece.array[0].length; ++w) {
    let pieceBottom = 0;
    //from bottom to top, find the lowest block
    for(let h=currentPiece.array.length-1; h>=0; --h) {
      if(currentPiece.array[h][w] === 1) {
        pieceBottom = h;
        break;
      }
    }
    pieceBottom += currentPiece.top;

    //find the highest piece in this column
    let gameBottom = grid.length-1;
    for(let h=grid.length-1; h>=0; --h) {
      if(grid[h][currentPiece.left + w] !== "gray") {
        gameBottom = h-1;
      }
    }

    if(pieceBottom >= gameBottom) {
      return true; //true if the piece is now touching the bottom
    }
  }

  return false; //false if the piece is not touching the bottom
}


function canMoveRight() {
  for(let currentH=0; currentH<currentPiece.array.length; ++currentH) {
    if(currentPiece.top + currentH >= 0) {
      let pieceRight = 0;
      //from right to left, find the right-most block
      for(let currentW=currentPiece.array[currentH].length-1; currentW>=0; --currentW) {
        if(currentPiece.array[currentH][currentW] === 1) {
          pieceRight = currentW;
          break;
        }
      }
      pieceRight += currentPiece.left;

      //find pieces right of this piece
      let gameRight = pieceRight+1;
      console.log(currentPiece.top + currentH);
      for(gameRight; gameRight<grid[0].length; ++gameRight) {
        if(grid[currentPiece.top + currentH][gameRight] !== "gray") {
          break;
        }
      }

      if(pieceRight + 1 >= gameRight) {
        return false;
      }
    }
  }

  return true;
}


function drop() {
  if(atBottom()) {
    solidifyPiece();
    currentPiece = pickNewPiece();
  }
  else {
    currentPiece.top++;
  }
}


function solidifyPiece() {
  for(let h=0; h<currentPiece.array.length; ++h) {
    for(let w=0; w<currentPiece.array[h].length; ++w) {
      if(currentPiece.array[h][w] === 1) {
        grid[currentPiece.top + h][currentPiece.left + w] = pieces[ currentPiece.pieceIndex ].color;
      }
    }
  }
}


function auto() {
  drop();

  draw();
}
setInterval(auto, 1000);


init();
