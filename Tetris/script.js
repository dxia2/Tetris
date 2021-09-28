class Board{
    ctx;
    grid;
    constructor(ctx){
        this.ctx = ctx;
        this.grid = new Array(ROWS);
        for(let i = 0; i < ROWS; i++){
            this.grid[i] = new Array(COLUMNS);
        }

        for(let x = 0; x < ROWS; x++){
            for(let y = 0; y < COLUMNS; y++){
                this.grid[x][y] = 0;
            }
        }
    }

    draw(){
        for(let a = 0; a < ROWS; a++){
            for(let b = 0; b < COLUMNS; b++){
                if(this.grid[a][b] != 0){
                    ctx.fillStyle = COLORS[this.grid[a][b] - 1];
                    let x = (a * BLOCKSIZE) - (BLOCKSIZE / 2);
                    let y = (b * BLOCKSIZE) - (BLOCKSIZE / 2);
                    ctx.fillRect(x, y, BLOCKSIZE, BLOCKSIZE);
                }
            }
        }
    }
}

class Piece{
    shape;
    color;
    constructor(shape, color){
        this.shape = shape;
        this.color = color;
    }
}


let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let canvasWidth = 200;
let canvasHeight = 400;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

let board = new Board(ctx);

board.grid[0][4] = 5;

for(let x = 0; x < ROWS; x++){
    for(let y = 0; y < COLUMNS; y++){
        console.log(x + y);
    }
}

requestAnimationFrame(draw)
function draw(){
    board.draw();
    requestAnimationFrame(draw);
}
