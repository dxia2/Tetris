class Vector2{
    x;
    y;
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}
class GridPiece{
    isLocked;
    color;
    constructor(isLocked, color){
        this.isLocked = isLocked;
        this.color = color;
    }
}
class Board{
    ctx;
    grid;
    currentHoldingPiece;
    startDelayBtwPieceFall;
    delayBtwPieceFall;
    pieces;
    constructor(ctx, startDelayBtwPieceFall, pieces){
        this.ctx = ctx;
        this.grid = new Array(COLUMNS);
        for(let i = 0; i < COLUMNS; i++){
            this.grid[i] = new Array(ROWS);
        }

        for(let x = 0; x < COLUMNS; x++){
            for(let y = 0; y < ROWS; y++){
                this.grid[x][y] = new GridPiece(false, 0);
            }
        }

        this.startDelayBtwPieceFall = startDelayBtwPieceFall;
        this.delayBtwPieceFall = startDelayBtwPieceFall;
        this.pieces = pieces;
    }

    draw(){
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for(let a = 0; a < COLUMNS; a++){
            for(let b = 0; b < ROWS; b++){
                if(this.grid[a][b].color != 0){
                    ctx.fillStyle = COLORS[this.grid[a][b].color - 1];
                    let x = (a * BLOCKSIZE)
                    let y = (b * BLOCKSIZE)
                    ctx.fillRect(x, y, BLOCKSIZE, BLOCKSIZE);
                }
            }
        }
    }
    loadPiece(piece, position){
        this.currentHoldingPiece = piece;
        this.currentHoldingPiece.position = position;
        for(let i = 0; i < piece.shape.length; i++){
            this.grid[piece.getShapePosition(i).x][piece.getShapePosition(i).y].color = piece.color;
        }
    }

    addGravity(){
        if(this.delayBtwPieceFall <= 0){
            // GRAVITY
            this.moveCurrentHoldingPiece(new Vector2(0, 1));

            this.delayBtwPieceFall = this.startDelayBtwPieceFall;
        }else{
            this.delayBtwPieceFall -= deltaTime;
        }
    }

    pickNewHoldingPiece(){
        if(this.currentHoldingPiece != null){
            this.currentHoldingPiece.rotationIndex = 0;
            this.currentHoldingPiece.shape = this.currentHoldingPiece.rotations[this.currentHoldingPiece.rotationIndex];
    
        }
        
        this.loadPiece(this.pieces[randomInteger(this.pieces.length)], new Vector2(5, 0));
        let isSpawningOnOtherPieces = false;
        for(let i = 0; i < this.currentHoldingPiece.shape.length; i++){
            if(this.currentHoldingPiece.getShapePosition(i).x >= 0 
            && this.currentHoldingPiece.getShapePosition(i).x < COLUMNS
            && this.currentHoldingPiece.getShapePosition(i).y >= 0
            && this.currentHoldingPiece.getShapePosition(i).y < ROWS){
                if(this.grid[this.currentHoldingPiece.getShapePosition(i).x][this.currentHoldingPiece.getShapePosition(i).y].isLocked){
                    isSpawningOnOtherPieces = true;
                }
            }
        }
        if(isSpawningOnOtherPieces){
            document.getElementById("youLoseTest").innerHTML = "yoy lose";
            gameIsRunning = false;
            // // move piece up by one
            // this.moveCurrentHoldingPiece(new Vector2(0, -1));
            // for(let i = 0; i < this.currentHoldingPiece.shape.length; i++){
            //     if(this.currentHoldingPiece.getShapePosition(i).x >= 0 
            //     && this.currentHoldingPiece.getShapePosition(i).x < COLUMNS
            //     && this.currentHoldingPiece.getShapePosition(i).y >= 0
            //     && this.currentHoldingPiece.getShapePosition(i).y < ROWS){
            //         if(this.grid[this.currentHoldingPiece.getShapePosition(i).x][this.currentHoldingPiece.getShapePosition(i).y].isLocked){
            //             // Lose
                        
            //         }
            //     }
            // }
        }
    }

    moveCurrentHoldingPiece(movement){
        // Check if it hits the floor
        if(Piece.checkCollisionAgainstFloor(this.currentHoldingPiece, movement)
        || Piece.checkCollisionAgainstOtherPiecesVertically(this.currentHoldingPiece, this.grid, movement)){
            this.lockInCurrentHoldingPiece();
            this.pickNewHoldingPiece();
            return true;
        }
        if(Piece.checkCollisionAgainstOtherPiecesHorizontally(this.currentHoldingPiece, this.grid, movement)){
            return true;
        }
        // Set the piece's last position to be colorless
        this.updateHoldingPiecePositionOnBoard(0);
        if(!Piece.checkCollisionAgainstWalls(this.currentHoldingPiece, movement)){
            this.currentHoldingPiece.position.x += movement.x;
            this.currentHoldingPiece.position.y += movement.y;
        }
        this.updateHoldingPiecePositionOnBoard(this.currentHoldingPiece.color);
        return false;
    }

    updateHoldingPiecePositionOnBoard(color){
        for(let i = 0; i < this.currentHoldingPiece.shape.length; i++){
            if(this.currentHoldingPiece.getShapePosition(i).x >= 0 
            && this.currentHoldingPiece.getShapePosition(i).x < COLUMNS
            && this.currentHoldingPiece.getShapePosition(i).y >= 0
            && this.currentHoldingPiece.getShapePosition(i).y < ROWS){
                this.grid[this.currentHoldingPiece.getShapePosition(i).x][this.currentHoldingPiece.getShapePosition(i).y].color = color;
            }
            
        }
    }

    lockInCurrentHoldingPiece(){
        for(let i = 0; i < this.currentHoldingPiece.shape.length; i++){
            this.grid[this.currentHoldingPiece.getShapePosition(i).x][this.currentHoldingPiece.getShapePosition(i).y].isLocked = true;
        }
        this.rowIsComplete();
    }

    // Check if a row is completed
    rowIsComplete(){
        for(let y = ROWS - 1; y >= 0; y--){
            let rowIsComplete = true;
            for(let x = 0; x < COLUMNS; x++){
                if(!this.grid[x][y].isLocked){
                    rowIsComplete = false;
                }
            }
            if(rowIsComplete){
                // Clear the row if it is complete
                for(let x = 0; x < COLUMNS; x++){
                    this.grid[x][y].isLocked = false;
                    this.grid[x][y].color = 0;
                }
                // Move everything in the grid down by one
                for(let a = y; a >= 0; a--){
                    for(let b = 0; b < COLUMNS; b++){
                        if(a != 0){
                            let color = this.grid[b][a - 1].color;
                            let isLocked = this.grid[b][a - 1].isLocked;
                            this.grid[b][a - 1].color = 0;
                            this.grid[b][a - 1].isLocked = false;
                            this.grid[b][a].isLocked = isLocked;
                            this.grid[b][a].color = color;
                        }else{
                            this.grid[b][a].isLocked = false;
                            this.grid[b][a].color = 0;
                        }
                    }
                }
                // Add score and set score text
                score += SCOREINCREMENT;
                scoreTextNumber.innerHTML = score;
                y++;
            }
        }
    }
    instantDrop(){
        let droppingBlock = true;
        while(droppingBlock){
            if(this.moveCurrentHoldingPiece(new Vector2(0, 1))){
                droppingBlock = false;
            }
        }
    }
}

class Piece{
    shape;
    rotations;
    color;
    position;
    rotationIndex = 0;
    constructor(rotations, color){
        this.rotations = rotations;
        this.color = color;

        this.shape = rotations[this.rotationIndex];
    }
    getShapePosition(index){
        return new Vector2(this.shape[index].x + this.position.x, this.shape[index].y + this.position.y);
    }
    // Function for rotating the piece
    rotate(isRotatingRight){
        // Store the original rotationIndex of the object so that we can revert it if the rotation doesn't work
        let originalRotationIndex = this.rotationIndex;

        // Check if rotating left or right
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
        // Clear the area where the piece used to be on the board
        board.updateHoldingPiecePositionOnBoard(0);
        this.shape = this.rotations[this.rotationIndex];

        // Move the piece one block left and right to check if it still goes out of bounds or collides with other pieces
        if(Piece.checkCollisionAgainstWalls(this, new Vector2(0, 0)) || Piece.checkCollisionAgainstOtherPiecesRotation(this.rotations[this.rotationIndex], board.grid, this.position) || Piece.checkCollisionAgainstFloor(this, new Vector2(0, 0))){
            this.position.x++;
            if(Piece.checkCollisionAgainstWalls(this, new Vector2(0, 0)) || Piece.checkCollisionAgainstOtherPiecesRotation(this.rotations[this.rotationIndex], board.grid, this.position) || Piece.checkCollisionAgainstFloor(this, new Vector2(0, 0))){
                this.position.x -= 2;
                if(Piece.checkCollisionAgainstWalls(this, new Vector2(0, 0)) || Piece.checkCollisionAgainstOtherPiecesRotation(this.rotations[this.rotationIndex], board.grid, this.position) || Piece.checkCollisionAgainstFloor(this, new Vector2(0, 0))){
                    this.rotationIndex = originalRotationIndex;
                    this.shape = this.rotations[this.rotationIndex];
                    this.position.x++;
                }
            }

        }        
        // Redraw the piece on the board
        board.updateHoldingPiecePositionOnBoard(board.currentHoldingPiece.color);
    }

    static checkCollisionAgainstWalls(piece, movement){

        for(let i = 0; i < piece.shape.length; i++){
            if(piece.getShapePosition(i).x + movement.x < 0 || piece.getShapePosition(i).x + movement.x > COLUMNS - 1){
                return true;
            }
        }

        return false;
    }

    static checkCollisionAgainstFloor(piece, movement){
        for(let i = 0; i < piece.shape.length; i++){
            if(piece.getShapePosition(i).y + movement.y > ROWS - 1){
                return true;
            }
        }

        return false;
    }

    static checkCollisionAgainstOtherPiecesHorizontally(piece, grid, movement){
        let newPieceShapePositions = [];
        for(let i = 0; i < piece.shape.length; i++){
            newPieceShapePositions.push(new Vector2(piece.getShapePosition(i).x + movement.x, piece.getShapePosition(i).y));
        }

        for(let i = 0; i < newPieceShapePositions.length; i++){
            if(newPieceShapePositions[i].x < grid.length && newPieceShapePositions[i].x >= 0){
                if(newPieceShapePositions[i].y < grid[newPieceShapePositions[i].x].length){
                    if(grid[newPieceShapePositions[i].x][newPieceShapePositions[i].y].isLocked){
                        return true;
                    }
                }
            }
        }
        return false;
    }
    static checkCollisionAgainstOtherPiecesVertically(piece, grid, movement){
        let newPieceShapePositions = [];
        for(let i = 0; i < piece.shape.length; i++){
            newPieceShapePositions.push(new Vector2(piece.getShapePosition(i).x, piece.getShapePosition(i).y + movement.y));
        }

        for(let i = 0; i < newPieceShapePositions.length; i++){
            if(newPieceShapePositions[i].x < grid.length && newPieceShapePositions[i].x >= 0){
                if(newPieceShapePositions[i].y < grid[newPieceShapePositions[i].x].length){
                    if(grid[newPieceShapePositions[i].x][newPieceShapePositions[i].y].isLocked){
                        return true;
                    }
                }
            }
        }
        return false;
    }

    static checkCollisionAgainstOtherPiecesRotation(newRot, grid, piecePosition){
        for(let i = 0; i < newRot.length; i++){
            if(newRot[i].x + piecePosition.x < grid.length && newRot[i].x + piecePosition.x >= 0){
                if(newRot[i].y + piecePosition.y < grid[newRot[i].x + piecePosition.x].length){
                    if(grid[newRot[i].x + piecePosition.x][newRot[i].y + piecePosition.y].isLocked){
                        return true;
                    }
                }
            }
        }
        return false;
    }
}

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let canvasWidth = 200;
let canvasHeight = 400;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

let iBlock = new Piece(
    [
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(2, 1), new Vector2(3, 1)],
    [new Vector2(2, 0), new Vector2(2, 1), new Vector2(2, 2), new Vector2(2, 3)],
    [new Vector2(0, 2), new Vector2(1, 2), new Vector2(2, 2), new Vector2(3, 2)],
    [new Vector2(1, 0), new Vector2(1, 1), new Vector2(1, 2), new Vector2(1, 3)],
    ],
    1
)

let jBlock = new Piece(
    [
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1), new Vector2(2, 1)],
    [new Vector2(1, 0), new Vector2(1, 1), new Vector2(1, 2), new Vector2(2, 0)],
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(2, 1), new Vector2(2, 2)],
    [new Vector2(1, 0), new Vector2(1, 1), new Vector2(1, 2), new Vector2(0, 2)],
    ],
    2
)

let lBlock = new Piece(
    [
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(2, 1), new Vector2(2, 0)],
    [new Vector2(1, 0), new Vector2(1, 1), new Vector2(1, 2), new Vector2(2, 2)],
    [new Vector2(0, 1), new Vector2(0, 2), new Vector2(1, 1), new Vector2(2, 1)],
    [new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1), new Vector2(1, 2)],
    ],
    3
)

let oBlock = new Piece(
    [
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0)],
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0)],
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0)],
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0)],
    ],
    4
)

let sBlock = new Piece(
    [
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0), new Vector2(2, 0)],
    [new Vector2(1, 0), new Vector2(1, 1), new Vector2(2, 1), new Vector2(2, 2)],
    [new Vector2(0, 2), new Vector2(1, 2), new Vector2(1, 1), new Vector2(2, 1)],
    [new Vector2(0, 0), new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 2)],
    ],
    5
)

let tBlock = new Piece(
    [
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0), new Vector2(2, 1)],
    [new Vector2(1, 0), new Vector2(1, 1), new Vector2(2, 1), new Vector2(1, 2)],
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 2), new Vector2(2, 1)],
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 0), new Vector2(1, 2)],
    ],
    6
)

let zBlock = new Piece(
    [
    [new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1), new Vector2(2, 1)],
    [new Vector2(1, 1), new Vector2(1, 2), new Vector2(2, 1), new Vector2(2, 0)],
    [new Vector2(0, 1), new Vector2(1, 1), new Vector2(1, 2), new Vector2(2, 2)],
    [new Vector2(0, 1), new Vector2(0, 2), new Vector2(1, 1), new Vector2(1, 0)],
    ],
    7
)

let board = new Board(ctx, 1, [iBlock, jBlock, lBlock, oBlock, sBlock, tBlock, zBlock]);
let gameIsRunning = true;

let score = 0;
let scoreTextNumber = document.getElementById("scoreTextNumber");

let instantDropKeyPreviouslyPressed = false;
let instantDropKeyPressedDown = false;

board.pickNewHoldingPiece();

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

    if(keysPressed["w"]){
        if(instantDropKeyPreviouslyPressed){
            if(instantDropKeyPressedDown){
                instantDropKeyPressedDown = false;
            }
        }else{
            instantDropKeyPreviouslyPressed = true;
            instantDropKeyPressedDown = true;
        }

    }else{
        instantDropKeyPreviouslyPressed = false;
    }

    if(instantDropKeyPressedDown){
        board.instantDrop();
    }

    board.addGravity();

    board.draw();
    if(gameIsRunning){
        requestAnimationFrame(draw);
    }
}

function randomInteger(max){
    return Math.floor(Math.random() * max);
}
