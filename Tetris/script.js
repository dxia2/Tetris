class Vector2{
    x;
    y;
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
class Board{
    ctx;
    grid;
    currentHoldingPiece;
    startDelayBtwPieceFall;
    delayBtwPieceFall;
    constructor(ctx, startDelayBtwPieceFall){
        this.ctx = ctx;
        this.grid = new Array(COLUMNS);
        for(let i = 0; i < COLUMNS; i++){
            this.grid[i] = new Array(ROWS);
        }

        for(let x = 0; x < COLUMNS; x++){
            for(let y = 0; y < ROWS; y++){
                this.grid[x][y] = 0;
            }
        }

        this.startDelayBtwPieceFall = startDelayBtwPieceFall;
        this.delayBtwPieceFall = startDelayBtwPieceFall;
    }

    draw(){
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for(let a = 0; a < COLUMNS; a++){
            for(let b = 0; b < ROWS; b++){
                if(this.grid[a][b] != 0){
                    ctx.fillStyle = COLORS[this.grid[a][b] - 1];
                    let x = (a * BLOCKSIZE)
                    let y = (b * BLOCKSIZE)
                    ctx.fillRect(x, y, BLOCKSIZE, BLOCKSIZE);
                }
            }
        }
    }
    loadPiece(piece, position){
        for(let i = 0; i < piece.shape.length; i++){
            piece.shape[i].x += position.x;
            piece.shape[i].y += position.y;

            this.currentHoldingPiece = piece;
            this.grid[piece.shape[i].x][piece.shape[i].y] = piece.color;
        }
    }

    updateHoldingPiece(){
        if(this.delayBtwPieceFall <= 0){
            // GRAVITY
            for(let i = 0; i < this.currentHoldingPiece.shape.length; i++){
                // Set the piece's last position to be colorless
                this.grid[this.currentHoldingPiece.shape[i].x][this.currentHoldingPiece.shape[i].y] = 0;
                this.currentHoldingPiece.shape[i].y += 1;
                this.grid[this.currentHoldingPiece.shape[i].x][this.currentHoldingPiece.shape[i].y] = this.currentHoldingPiece.color;
            }

            this.delayBtwPieceFall = this.startDelayBtwPieceFall;
        }else{
            this.delayBtwPieceFall -= deltaTime;
        }
    }

    pickNewHoldingPiece(){

    }

    moveCurrentHoldingPiece(movement){
        for(let i = 0; i < this.currentHoldingPiece.shape.length; i++){
            // Set the piece's last position to be colorless
            this.grid[this.currentHoldingPiece.shape[i].x][this.currentHoldingPiece.shape[i].y] = 0;
            this.currentHoldingPiece.shape[i].x += movement.x;
            this.currentHoldingPiece.shape[i].y += movement.y;
            this.grid[this.currentHoldingPiece.shape[i].x][this.currentHoldingPiece.shape[i].y] = this.currentHoldingPiece.color;
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

let board = new Board(ctx, 0.5);

let iBlock = new Piece(
    [new Vector2(0, 0), new Vector2(1, 0), new Vector2(2, 0), new Vector2(3, 0)],
    1
)
let jBlock = new Piece(
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1), new Vector2(2, 1)],
    2
)
let lBlock = new Piece(
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(2, 1), new Vector2(2, 0)],
    3
)
let oBlock = new Piece(
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0)],
    4
)
let sBlock = new Piece(
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0), new Vector2(2, 0)],
    5
)
let tBlock = new Piece(
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0), new Vector2(2, 1)],
    6
)
let zBlock = new Piece(
    [new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1), new Vector2(2, 1)],
    7
)

board.loadPiece(iBlock, new Vector2(5, 0));

requestAnimationFrame(draw)
function draw(){

    if(keysPressed["a"]){
        if(timeBtwMove["a"] <= 0){

            board.moveCurrentHoldingPiece(new Vector2(-1, 0));
            timeBtwMove["a"] = startTimeBtwMovePiece;
        }else{
            timeBtwMove["a"] -= deltaTime;
        }
    }else{
        timeBtwMove["a"] = 0;
    }

    if(keysPressed["d"]){
        if(timeBtwMove["d"] <= 0){
            board.moveCurrentHoldingPiece(new Vector2(1, 0));
            timeBtwMove["d"] = startTimeBtwMovePiece;
        }else{
            timeBtwMove["d"] -= deltaTime;
        }
    }else{
        timeBtwMove["d"] = 0;
    }

    if(keysPressed["s"]){
        if(timeBtwMove["s"] <= 0){
            board.moveCurrentHoldingPiece(new Vector2(0, 1));
            timeBtwMove["s"] = startTimeBtwMovePiece;
        }else{
            timeBtwMove["s"] -= deltaTime;
        }
    }else{
        timeBtwMove["s"] = 0;;
    }

    board.updateHoldingPiece();

    board.draw();
    requestAnimationFrame(draw);
}
