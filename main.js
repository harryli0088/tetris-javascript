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
  "40": { //default arrow down 40
    name: "drop",
    func: drop
  },
  "32": { //default space 32
    name: "hard",
    func: () => {
      currentPiece.top += squaresToBottom();
      nextPiece();
    }
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
      if(canMoveLeft()) {
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
let score = 0;


//function to initialize the game
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



//key listener
window.onkeydown = function(e) {
   var key = e.keyCode ? e.keyCode : e.which;

   //if this key maps to a move
   if(moves[key]) {
     console.log(moves[key].name);
     moves[key].func();
     draw();
   }
}


//picks a new piece and returns for currentPiece
//if no index is passed, a random one will be chosen
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



//redraws the canvas
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

//returns the minimum number of squares the piece has before hitting the bottom
function squaresToBottom() {
  let minSquaresToBottom = -1;

  for(let currentW=0; currentW<currentPiece.array[0].length; ++currentW) {
    let pieceBottom = 0;
    //from bottom to top, find the lowest block
    for(let currentH=currentPiece.array.length-1; currentH>=0; --currentH) {
      if(currentPiece.array[currentH][currentW] === 1) {
        pieceBottom = currentH;
        break;
      }
    }
    pieceBottom += currentPiece.top;

    //find the closest piece in this column
    let gameBottom = pieceBottom + 1;
    for(gameBottom; gameBottom<grid.length; ++gameBottom) {
      if(grid[gameBottom][currentPiece.left + currentW] !== "gray") {
        break;
      }
    }

    const squaresToBottom = gameBottom - pieceBottom - 1;
    if(minSquaresToBottom===-1 || minSquaresToBottom>squaresToBottom) {
      minSquaresToBottom = squaresToBottom;
    }
  }

  return minSquaresToBottom;
}

//returns true if the user can move right, false otherwise
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



//returns true if the user can move left, false otherwise
function canMoveLeft() {
  for(let currentH=0; currentH<currentPiece.array.length; ++currentH) {
    if(currentPiece.top + currentH >= 0) {
      let pieceLeft = 0;
      //from left to right, find the left-most block
      for(let currentW=0; currentW<currentPiece.array[currentH].length; ++currentW) {
        if(currentPiece.array[currentH][currentW] === 1) {
          pieceLeft = currentW;
          break;
        }
      }
      pieceLeft += currentPiece.left;

      //find pieces right of this piece
      let gameLeft = pieceLeft-1;
      for(gameLeft; gameLeft>=0; --gameLeft) {
        if(grid[currentPiece.top + currentH][gameLeft] !== "gray") {
          break;
        }
      }

      if(pieceLeft - 1 <= gameLeft) {
        return false;
      }
    }
  }

  return true;
}


//function to run when a piece has hit the bottom
function nextPiece() {
  solidifyPiece();
  clearLines();
  currentPiece = pickNewPiece();
}



//function to run to drop the piece (either from user input or auto)
function drop() {
  //if this piece has hit the bottom, get the next piece
  if(squaresToBottom() <= 0) {
    nextPiece();
  }
  //else move the piece down
  else {
    currentPiece.top++;
  }
}


//fix a piece into the grid
function solidifyPiece() {
  for(let h=0; h<currentPiece.array.length; ++h) {
    for(let w=0; w<currentPiece.array[h].length; ++w) {
      if(currentPiece.array[h][w] === 1) {
        grid[currentPiece.top + h][currentPiece.left + w] = pieces[ currentPiece.pieceIndex ].color;
      }
    }
  }
}


//function to clear the full rows in the grid and add empty rows on top
function clearLines() {
  let clearindecies = []; //array to hold the indecies of the rows to clear
  //determine which rows need to be cleared
  for(let h=0; h<grid.length; ++h) {
    let noEmptySquares = true; //first assume that this row needs to be cleared
    for(let w=0; w<grid[h].length; ++w) {
      if(grid[h][w] === "gray") {
        noEmptySquares = false; //if we encounter an empty square, we know that this row should not be cleared
        break;
      }
    }

    //if we found no empty squares, push this row index into the arrau
    if(noEmptySquares) {
      clearindecies.push(h);
    }
  }

  score += clearindecies.length; //add one score point for each line cleared

  //remove each row
  for(let i=0; i<clearindecies.length; ++i) {
    grid.splice(clearindecies[i],1);
  }

  //create a new empty row
  let newRow = [];
  for(let i=0; i<WIDTH; ++i) {
    newRow.push("gray");
  }

  //add empty rows to the top of the grid
  for(let i=0; i<clearindecies.length; ++i) {
    grid.unshift(JSON.parse(JSON.stringify(newRow)));
  }
}


//function that runs automatically to drop the pieces
function auto() {
  drop();

  draw();
}

setInterval(auto, 1000);


init();
