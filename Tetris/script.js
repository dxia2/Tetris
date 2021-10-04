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

            this.currentHoldingPiece = piece;
            this.currentHoldingPiece.position = position;
            this.grid[piece.getShapePosition(i).x][piece.getShapePosition(i).y] = piece.color;
        }
    }

    addGravity(){
        if(this.delayBtwPieceFall <= 0){
            // GRAVITY
            this.updateHoldingPiecePositionOnBoard(0);
            this.currentHoldingPiece.position.y += 1;
            this.updateHoldingPiecePositionOnBoard(this.currentHoldingPiece.color);

            this.delayBtwPieceFall = this.startDelayBtwPieceFall;
        }else{
            this.delayBtwPieceFall -= deltaTime;
        }
    }

    pickNewHoldingPiece(){

    }

    moveCurrentHoldingPiece(movement){
        // Check if it is touching the sides of the board
        if(this.currentHoldingPiece.position.x + movement.x < 0
        || this.currentHoldingPiece.position.x + this.currentHoldingPiece.width + movement.x > COLUMNS){
            return;
        }
        // Set the piece's last position to be colorless
        this.updateHoldingPiecePositionOnBoard(0);
        this.currentHoldingPiece.position.x += movement.x;
        this.currentHoldingPiece.position.y += movement.y;
        this.updateHoldingPiecePositionOnBoard(this.currentHoldingPiece.color)
    }

    updateHoldingPiecePositionOnBoard(color){
        for(let i = 0; i < this.currentHoldingPiece.shape.length; i++){
            this.grid[this.currentHoldingPiece.getShapePosition(i).x][this.currentHoldingPiece.getShapePosition(i).y] = color;
        }
    }
}

class Piece{
    shape;
    rotations;
    color;
    width;
    position;
    rotationIndex = 0;
    constructor(rotations, color){
        this.rotations = rotations;
        this.color = color;

        this.shape = rotations[this.rotationIndex];

        this.calculateWidth();
    }
    getShapePosition(index){
        return new Vector2(this.shape[index].x + this.position.x, this.shape[index].y + this.position.y);
    }
    calculateWidth(){
        let highestX = 0;
        for(let i = 0; i < this.shape.length; i++){
            if(this.shape[i].x > highestX){
                highestX = this.shape[i].x;
            }
        }
        this.width = highestX + 1;
    }
    rotate(isRotatingRight){
        if(isRotatingRight){
            this.rotationIndex++;
            if(this.rotationIndex > this.rotations.length - 1){
                this.rotationIndex = 0;
            }
        }else{
            this.rotationIndex--
            if(this.rotationIndex < 0){
                this.rotationIndex = this.rotations.length - 1;
            }
        }

        board.updateHoldingPiecePositionOnBoard(0);
        this.shape = this.rotations[this.rotationIndex];
        board.updateHoldingPiecePositionOnBoard(board.currentHoldingPiece.color);
        this.calculateWidth();
    }
}

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let canvasWidth = 200;
let canvasHeight = 400;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

let board = new Board(ctx, 1);

let iBlock = new Piece(
    [
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(2, 1), new Vector2(3, 1)],
    [new Vector2(2, 0), new Vector2(2, 1), new Vector2(2, 2), new Vector2(2, 3)],
    [new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2), new Vector2(3, 2)],
    [new Vector2(1, 0), new Vector2(1, 1), new Vector2(1, 2), new Vector2(1, 3)],
    ],
    1
)
/*
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
*/

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
        timeBtwMove["s"] = 0;
    }

    if(keysPressed["q"]){
        if(timeBtwRotate["q"] <= 0){
            board.currentHoldingPiece.rotate(false);
            timeBtwRotate["q"] = startTimeBtwRotate;
        }else{
            timeBtwRotate["q"] -= deltaTime;
        }
    }else{
        timeBtwRotate["q"] = 0;
    }

    if(keysPressed["e"]){
        if(timeBtwRotate["e"] <= 0){
            board.currentHoldingPiece.rotate(true);
            timeBtwRotate["e"] = startTimeBtwRotate;
        }else{
            timeBtwRotate["e"] -= deltaTime;
        }
    }else{
        timeBtwRotate["e"] = 0;
    }


    board.addGravity();

    board.draw();
    requestAnimationFrame(draw);
}
