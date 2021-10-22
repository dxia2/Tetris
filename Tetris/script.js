// Main script for tetris game

// A class that stores information for every tile on the board grid
class GridTile{
    // Stores a color and if the tile is locked in place(it's not part of the piece that the player is controlling)
    isLocked;
    color;
    constructor(isLocked, color){
        this.isLocked = isLocked;
        this.color = color;
    }
}
// Class that stores information about the board the tetris pieces are on
class Board{
    ctx;
    grid;
    activePiece;
    startDelayBtwPieceFall;
    delayBtwPieceFall;
    pieces;
    holdingPiece = null;
    playerPressHoldPiece = false;
    startingPosition;
    constructor(ctx, startDelayBtwPieceFall, pieces, startingPosition){
        this.ctx = ctx;
        // The grid is made up of 2 arrays of "GridTiles", which makes a 2d table
        this.grid = new Array(COLUMNS);
        for(let i = 0; i < COLUMNS; i++){
            this.grid[i] = new Array(ROWS);
        }

        for(let x = 0; x < COLUMNS; x++){
            for(let y = 0; y < ROWS; y++){
                this.grid[x][y] = new GridTile(false, 0);
            }
        }
        // Set the rest of the varibles
        this.startDelayBtwPieceFall = startDelayBtwPieceFall;
        this.delayBtwPieceFall = startDelayBtwPieceFall;
        this.pieces = pieces;
        this.startingPosition = startingPosition;
    }
    // Function which draws onto the canvas based on what is in the grid
    draw(){
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // Loop through all the elements in the grid array
        // a represents the x value of the table, b represents the y value of the table
        for(let a = 0; a < COLUMNS; a++){
            for(let b = 0; b < ROWS; b++){
                // Color 0 represents an empty square, so if it is 0 we don't draw anything
                if(this.grid[a][b].color != 0){
                    // Set the fillstyle of the context based on the color of the element in the grid
                    this.ctx.fillStyle = COLORS[this.grid[a][b].color - 1].returnRGB();
                    // calculate the position of the square on the canvas
                    let x = (a * BLOCKSIZE);
                    let y = (b * BLOCKSIZE);
                    // fill in the square 
                    this.ctx.fillRect(x, y, BLOCKSIZE, BLOCKSIZE);

                    // Draw darker square inside to make it easier to see individual squares
                    let darkerColor = getDarkerColor(COLORS[this.grid[a][b].color - 1]);
                    this.ctx.fillStyle = darkerColor.returnRGB();
                    // Calculate the correct position inside the canvas
                    x = (a * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
                    y = (b * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
                    this.ctx.fillRect(x, y, BLOCKSIZESHADE, BLOCKSIZESHADE);
                }
            }
        }
    }
    // Load a new Piece onto the board (usually done after the player places a piece)
    loadPiece(piece, position){
        this.activePiece = piece;
        this.activePiece.position = position;
        // Loop through all the parts of the shape of the piece, and set the position on the board to be the correct color
        for(let i = 0; i < piece.shape.length; i++){
            this.grid[piece.getShapePosition(i).x][piece.getShapePosition(i).y].color = piece.color;
        }
    }
    // Simulates the pieces falling down
    addGravity(){
        // a timer that activates every x amount of seconds
        if(this.delayBtwPieceFall <= 0){
            // move the active piece down by one on the grid
            this.moveActivePiece(new Vector2(0, 1));

            this.delayBtwPieceFall = this.startDelayBtwPieceFall;
        }else{
            this.delayBtwPieceFall -= deltaTime;
        }
    }
    // Function that picks a new active piece
    pickNewActivePiece(){
        // Reset the active piece's rotation because all the active pieces come from the same 7 pieces (not clones)
        // if we don't reset the rotation, the next time this piece comes into play it will have the same rotation
        if(this.activePiece != null){
            this.activePiece.rotationIndex = 0;
            this.activePiece.shape = this.activePiece.rotations[this.activePiece.rotationIndex];
        }
        // Load a new piece based on what is next in the "nextPieces" class
        this.loadPiece(nextPieces.unloadPiece(), new Vector2(this.startingPosition.x, this.startingPosition.y));
        let isSpawningOnOtherPieces = false;
        // Check if the new piece is spawning on existing pieces, if so, the player loses
        for(let i = 0; i < this.activePiece.shape.length; i++){
            if(this.grid[this.activePiece.getShapePosition(i).x][this.activePiece.getShapePosition(i).y].isLocked){
                isSpawningOnOtherPieces = true;
            }
        }
        // Call playerLose function
        if(isSpawningOnOtherPieces){
            playerLose();
        }
    }
    // a function that is used to move the active piece
    moveActivePiece(movement){ 
        // Check if it hits the floor or if it collides with other tiles vertically
        if(Piece.checkCollisionAgainstFloor(this.activePiece, movement)
        || Piece.checkCollisionAgainstOtherPiecesVertically(this.activePiece, this.grid, movement)){
            // if so, pick a new active piece
            this.lockInActivePiece();
            this.pickNewActivePiece();
            return true;
        }
        // if it hits another tile horizontally, simply stop it from moving into that tile
        if(Piece.checkCollisionAgainstOtherPiecesHorizontally(this.activePiece, this.grid, movement)){
            return true;
        }
        // Set the piece's last position to be colorless
        this.updateActivePiecePositionOnBoard(0);
        // Check if the active piece collides with the edges of the canvas
        if(!Piece.checkCollisionAgainstWalls(this.activePiece, movement)){
            // If it doesn't, apply movement
            this.activePiece.position.x += movement.x;
            this.activePiece.position.y += movement.y;
        }

        this.updateActivePiecePositionOnBoard(this.activePiece.color);
        return false;
    }
    // Function that sets the active piece's position on the grid to be a certain color
    updateActivePiecePositionOnBoard(color){
        for(let i = 0; i < this.activePiece.shape.length; i++){
            if(this.activePiece.getShapePosition(i).x >= 0 
            && this.activePiece.getShapePosition(i).x < COLUMNS
            && this.activePiece.getShapePosition(i).y >= 0
            && this.activePiece.getShapePosition(i).y < ROWS){
                this.grid[this.activePiece.getShapePosition(i).x][this.activePiece.getShapePosition(i).y].color = color;
            }
            
        }
    }

    lockInActivePiece(){
        for(let i = 0; i < this.activePiece.shape.length; i++){
            this.grid[this.activePiece.getShapePosition(i).x][this.activePiece.getShapePosition(i).y].isLocked = true;
        }
        this.playerPressHoldPiece = false;
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
                Score.addScore(this);
                // increment the y because we need to check the same row again after everything was moved down
                y++;
            }
        }
    }

    instantDrop(){
        let droppingBlock = true;
        while(droppingBlock){
            if(this.moveActivePiece(new Vector2(0, 1))){
                droppingBlock = false;
            }
        }
    }

    holdPiece(){

        if(this.holdingPiece === this.activePiece){
            return;
        }

        if(this.holdingPiece === null){
            this.holdingPiece = this.activePiece;

            heldPieceCtx.clearRect(0, 0, heldPieceCanvasWidth, heldPieceCanvasHeight);
            // heldPieceCtx.fillStyle = COLORS[this.holdingPiece.color - 1].returnRGB();
            for(let i = 0; i < this.holdingPiece.shape.length; i++){
                board.grid[this.holdingPiece.getShapePosition(i).x][this.holdingPiece.getShapePosition(i).y].color = 0;
            }
            this.holdingPiece.rotationIndex = 0;
            this.holdingPiece.shape = this.holdingPiece.rotations[this.holdingPiece.rotationIndex];

            this.pickNewActivePiece();
        }else{
            if(!this.playerPressHoldPiece){

                let activePiece = this.activePiece;
                this.activePiece = this.holdingPiece;
                this.holdingPiece = activePiece;


                heldPieceCtx.clearRect(0, 0, heldPieceCanvasWidth, heldPieceCanvasHeight);
                // heldPieceCtx.fillStyle = COLORS[this.holdingPiece.color - 1].returnRGB();
                for(let i = 0; i < this.holdingPiece.shape.length; i++){
                    board.grid[this.holdingPiece.getShapePosition(i).x][this.holdingPiece.getShapePosition(i).y].color = 0;
                    
                }

                this.activePiece.rotationIndex = 0;
                this.activePiece.shape = this.activePiece.rotations[this.activePiece.rotationIndex];
                this.activePiece.position = new Vector2(this.startingPosition.x, this.startingPosition.y);
                this.updateActivePiecePositionOnBoard(this.activePiece.color);

                this.holdingPiece.rotationIndex = 0;
                this.holdingPiece.shape = this.holdingPiece.rotations[this.holdingPiece.rotationIndex];

                this.playerPressHoldPiece = true;
            }
        }

        for(let i = 0; i < this.holdingPiece.shape.length; i++){
            heldPieceCtx.fillStyle = COLORS[this.holdingPiece.color - 1].returnRGB();
            heldPieceCtx.fillRect(this.holdingPiece.shape[i].x * BLOCKSIZE, this.holdingPiece.shape[i].y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);
        
            let darkerColor = getDarkerColor(COLORS[this.holdingPiece.color - 1]);

            heldPieceCtx.fillStyle = darkerColor.returnRGB();
            let x = (this.holdingPiece.shape[i].x * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
            let y = (this.holdingPiece.shape[i].y * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
            heldPieceCtx.fillRect(x, y, BLOCKSIZESHADE, BLOCKSIZESHADE);
        }

        this.holdingPiece.position = new Vector2(this.startingPosition.x, this.startingPosition.y);
    }
}


class NextPieces{
    nextPiecesCanvas;
    nextPiecesCtx;

    pieces;
    nextPieces;
    constructor(nextPiecesCanvasId, pieces, canvasWidth, canvasHeight){
        this.nextPiecesCanvas = document.getElementById(nextPiecesCanvasId);
        this.nextPiecesCtx = this.nextPiecesCanvas.getContext("2d");

        this.nextPiecesCanvas.width = canvasWidth;
        this.nextPiecesCanvas.height = canvasHeight;

        this.pieces = pieces;

        this.initialize();
    }

    initialize(){
        this.nextPieces = [this.pieces[randomInteger(this.pieces.length - 1)], this.pieces[randomInteger(this.pieces.length - 1)], this.pieces[randomInteger(this.pieces.length - 1)]];
    }

    updateCanvas(){
        this.nextPiecesCtx.clearRect(0, 0, this.nextPiecesCanvas.width, this.nextPiecesCanvas.height);
        for(let i = 0; i < this.nextPieces.length; i++){
            let yOffset = i * PIECESMAXSIZE;
            for(let a = 0; a < this.nextPieces[i].shape.length; a++){

                this.nextPiecesCtx.fillStyle = COLORS[this.nextPieces[i].color - 1].returnRGB();
                this.nextPiecesCtx.fillRect(this.nextPieces[i].shape[a].x * BLOCKSIZE,
                    (this.nextPieces[i].shape[a].y + yOffset) * BLOCKSIZE, 
                    BLOCKSIZE, BLOCKSIZE
                );
                
                let darkerColor = getDarkerColor(COLORS[this.nextPieces[i].color - 1]);

                this.nextPiecesCtx.fillStyle = darkerColor.returnRGB();
                let x = (this.nextPieces[i].shape[a].x * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
                let y = ((this.nextPieces[i].shape[a].y + yOffset) * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
                this.nextPiecesCtx.fillRect(x, y, BLOCKSIZESHADE, BLOCKSIZESHADE);
            }
        }
    }
    // returns the first piece in the nextPieces array and picks a new piece for the end of the array
    unloadPiece(){
        let unloadedPiece = this.nextPieces.shift();
        this.nextPieces.push(this.pieces[randomInteger(this.pieces.length)]);
        this.updateCanvas();
        return unloadedPiece;
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
        board.updateActivePiecePositionOnBoard(0);
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
        board.updateActivePiecePositionOnBoard(board.activePiece.color);
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

class Score{
    static level = 1;
    static score = 0;
    static nextLevelUpThreshold = SCORELEVELINCREMENT;
    static levelTextNumber = document.getElementById("levelTextNumber");
    static scoreTextNumber = document.getElementById("scoreTextNumber");

    static addScore(board){

        startTextAnimation(scoreText);
        this.score += this.level * SCORELEVELMULTIPLIER;
        console.log(this.score);
        if(this.score >= this.nextLevelUpThreshold){
            this.level++;
            startTextAnimation(levelText)
            this.levelTextNumber.innerHTML = this.level;
            this.nextLevelUpThreshold *= 2;
            this.nextLevelUpThreshold += SCORELEVELINCREMENT;
        }
        this.scoreTextNumber.innerHTML = this.score;

        board.startDelayBtwPieceFall = STARTPIECEDROPDELAY - (this.level - 1) * DROPSPEEDINCREASEPERLEVEL;
        if(board.startDelayBtwPieceFall < MINDROPSPEED){
            board.startDelayBtwPieceFall = MINDROPSPEED;
        }
    }

    static reset(){
        this.level = 1;
        this.levelTextNumber.innerHTML = this.level;
        this.score = 0;
        this.scoreTextNumber.innerHTML = this.score;
        this.nextLevelUpThreshold = SCORELEVELINCREMENT;
    }
}

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let heldPieceCanvas = document.getElementById("heldPieceCanvas");
let heldPieceCtx = heldPieceCanvas.getContext("2d");

let canvasWidth = 200;
let canvasHeight = 400;

let heldPieceCanvasWidth = 80;
let heldPieceCanvasHeight = 80;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

heldPieceCanvas.width = heldPieceCanvasWidth;
heldPieceCanvas.height = heldPieceCanvasHeight;

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

let pieceStartPositionOffset = new Vector2(4, 0);

let nextPieces = new NextPieces("nextPiecesCanvas", [iBlock, jBlock, lBlock, oBlock, sBlock, tBlock, zBlock], 80, 240);
let board = new Board(ctx, STARTPIECEDROPDELAY, [iBlock, jBlock, lBlock, oBlock, sBlock, tBlock, zBlock], pieceStartPositionOffset);

gameStartUI();

let gameIsRunning = true;

let instantDropKeyPreviouslyPressed = false;
let instantDropKeyPressedDown = false;

let holdKeyPreviouslyPressed = false;
let holdKeyPressedDown = false;

function draw(){
    if(keysPressed["a"]){
        if(timeBtwMove["a"] <= 0){
            board.moveActivePiece(new Vector2(-1, 0));
            timeBtwMove["a"] = startTimeBtwMovePiece;
        }else{
            timeBtwMove["a"] -= deltaTime;
        }
    }else{
        timeBtwMove["a"] = 0;
    }

    if(keysPressed["d"]){
        if(timeBtwMove["d"] <= 0){
            board.moveActivePiece(new Vector2(1, 0));
            timeBtwMove["d"] = startTimeBtwMovePiece;
        }else{
            timeBtwMove["d"] -= deltaTime;
        }
    }else{
        timeBtwMove["d"] = 0;
    }

    if(keysPressed["s"]){
        if(timeBtwMove["s"] <= 0){
            board.moveActivePiece(new Vector2(0, 1));
            timeBtwMove["s"] = startTimeBtwMovePiece;
        }else{
            timeBtwMove["s"] -= deltaTime;
        }
    }else{
        timeBtwMove["s"] = 0;
    }

    if(keysPressed["q"]){
        if(timeBtwRotate["q"] <= 0){
            board.activePiece.rotate(false);
            timeBtwRotate["q"] = startTimeBtwRotate;
        }else{
            timeBtwRotate["q"] -= deltaTime;
        }
    }else{
        timeBtwRotate["q"] = 0;
    }

    if(keysPressed["e"]){
        if(timeBtwRotate["e"] <= 0){
            board.activePiece.rotate(true);
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
    // Check if press f then hold the current piece
    if(keysPressed["f"]){
        if(holdKeyPreviouslyPressed){
            if(holdKeyPressedDown){
                holdKeyPressedDown = false;
            }
        }else{
            holdKeyPreviouslyPressed = true;
            holdKeyPressedDown = true;
        }

    }else{
        holdKeyPreviouslyPressed = false;
    }

    if(holdKeyPressedDown){
        board.holdPiece();
    }
    

    board.addGravity();

    if(gameIsRunning){
        board.draw();
        requestAnimationFrame(draw);
    }
}

function randomInteger(max){
    return Math.floor(Math.random() * max);
}

function playerLose(){
    gameIsRunning = false;
    gameEndUI();
}

function resetGame(){
    nextPieces = new NextPieces("nextPiecesCanvas", [iBlock, jBlock, lBlock, oBlock, sBlock, tBlock, zBlock], 80, 240);

    board = new Board(ctx, STARTPIECEDROPDELAY, [iBlock, jBlock, lBlock, oBlock, sBlock, tBlock, zBlock], new Vector2(4, 0));
    Score.reset();
    heldPieceCtx.clearRect(0, 0, heldPieceCanvas.width, heldPieceCanvas.height);
    instantDropKeyPreviouslyPressed = false;
    instantDropKeyPressedDown = false;
    holdKeyPreviouslyPressed = false;
    holdKeyPressedDown = false;
    gameIsRunning = true;
    board.pickNewActivePiece();
    requestAnimationFrame(draw);
}

function getDarkerColor(color){
    // Draw a smaller darker square inside
    let darkerColor = new Color(color.r, 
        color.g,
        color.b
    );
    darkerColor.r *= 0.85;
    darkerColor.g *= 0.85;
    darkerColor.b *= 0.85;
    return darkerColor;
}