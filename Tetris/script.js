
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
    activePiece;
    startDelayBtwPieceFall;
    delayBtwPieceFall;
    pieces;
    holdingPiece = null;
    playerPressHoldPiece = false;
    startingPosition;
    constructor(ctx, startDelayBtwPieceFall, pieces, startingPosition){
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
        this.startingPosition = startingPosition;
    }

    draw(){
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        for(let a = 0; a < COLUMNS; a++){
            for(let b = 0; b < ROWS; b++){
                if(this.grid[a][b].color != 0){
                    ctx.fillStyle = COLORS[this.grid[a][b].color - 1].returnRGB();
                    let x = (a * BLOCKSIZE);
                    let y = (b * BLOCKSIZE);
                    ctx.fillRect(x, y, BLOCKSIZE, BLOCKSIZE);
                    darkerColor = getDarkerColor(COLORS[this.grid[a][b].color - 1]);
                    ctx.fillStyle = darkerColor.returnRGB();
                    x = (a * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
                    y = (b * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
                    ctx.fillRect(x, y, BLOCKSIZESHADE, BLOCKSIZESHADE);
                }
            }
        }
    }
    loadPiece(piece, position){
        this.activePiece = piece;
        this.activePiece.position = position;
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
        if(this.activePiece != null){
            this.activePiece.rotationIndex = 0;
            this.activePiece.shape = this.activePiece.rotations[this.activePiece.rotationIndex];
    
        }
        
        this.loadPiece(nextPieces.unloadPiece(), new Vector2(this.startingPosition.x, this.startingPosition.y));
        let isSpawningOnOtherPieces = false;
        for(let i = 0; i < this.activePiece.shape.length; i++){
            if(this.activePiece.getShapePosition(i).x >= 0 
            && this.activePiece.getShapePosition(i).x < COLUMNS
            && this.activePiece.getShapePosition(i).y >= 0
            && this.activePiece.getShapePosition(i).y < ROWS){
                if(this.grid[this.activePiece.getShapePosition(i).x][this.activePiece.getShapePosition(i).y].isLocked){
                    isSpawningOnOtherPieces = true;
                }
            }
        }
        // If player loses
        if(isSpawningOnOtherPieces){
            playerLose();
        }
    }

    moveCurrentHoldingPiece(movement){
        // Check if it hits the floor
        if(Piece.checkCollisionAgainstFloor(this.activePiece, movement)
        || Piece.checkCollisionAgainstOtherPiecesVertically(this.activePiece, this.grid, movement)){
            this.lockInCurrentHoldingPiece();
            this.pickNewHoldingPiece();
            return true;
        }
        if(Piece.checkCollisionAgainstOtherPiecesHorizontally(this.activePiece, this.grid, movement)){
            return true;
        }
        // Set the piece's last position to be colorless
        this.updateHoldingPiecePositionOnBoard(0);
        if(!Piece.checkCollisionAgainstWalls(this.activePiece, movement)){
            this.activePiece.position.x += movement.x;
            this.activePiece.position.y += movement.y;
        }
        this.updateHoldingPiecePositionOnBoard(this.activePiece.color);
        return false;
    }

    updateHoldingPiecePositionOnBoard(color){
        for(let i = 0; i < this.activePiece.shape.length; i++){
            if(this.activePiece.getShapePosition(i).x >= 0 
            && this.activePiece.getShapePosition(i).x < COLUMNS
            && this.activePiece.getShapePosition(i).y >= 0
            && this.activePiece.getShapePosition(i).y < ROWS){
                this.grid[this.activePiece.getShapePosition(i).x][this.activePiece.getShapePosition(i).y].color = color;
            }
            
        }
    }

    lockInCurrentHoldingPiece(){
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
            if(this.moveCurrentHoldingPiece(new Vector2(0, 1))){
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

            heldBlockCtx.clearRect(0, 0, heldBlockCanvasWidth, heldBlockCanvasHeight);
            heldBlockCtx.fillStyle = COLORS[this.holdingPiece.color - 1].returnRGB();
            for(let i = 0; i < this.holdingPiece.shape.length; i++){
                board.grid[this.holdingPiece.getShapePosition(i).x][this.holdingPiece.getShapePosition(i).y].color = 0;
            }
            this.holdingPiece.rotationIndex = 0;
            this.holdingPiece.shape = this.holdingPiece.rotations[this.holdingPiece.rotationIndex];
            for(let i = 0; i < this.holdingPiece.shape.length; i++){
                heldBlockCtx.fillRect(this.holdingPiece.shape[i].x * BLOCKSIZE, this.holdingPiece.shape[i].y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);
            }
            this.pickNewHoldingPiece();
        }else{
            if(!this.playerPressHoldPiece){

                let activePiece = this.activePiece;
                this.activePiece = this.holdingPiece;
                this.holdingPiece = activePiece;


                heldBlockCtx.clearRect(0, 0, heldBlockCanvasWidth, heldBlockCanvasHeight);
                heldBlockCtx.fillStyle = COLORS[this.holdingPiece.color - 1].returnRGB();
                for(let i = 0; i < this.holdingPiece.shape.length; i++){
                    board.grid[this.holdingPiece.getShapePosition(i).x][this.holdingPiece.getShapePosition(i).y].color = 0;
                    
                }

                this.activePiece.rotationIndex = 0;
                this.activePiece.shape = this.activePiece.rotations[this.activePiece.rotationIndex];
                this.activePiece.position = new Vector2(this.startingPosition.x, this.startingPosition.y);
                this.updateHoldingPiecePositionOnBoard(this.activePiece.color);

                this.holdingPiece.rotationIndex = 0;
                this.holdingPiece.shape = this.holdingPiece.rotations[this.holdingPiece.rotationIndex];
                for(let i = 0; i < this.holdingPiece.shape.length; i++){
                    heldBlockCtx.fillRect(this.holdingPiece.shape[i].x * BLOCKSIZE, this.holdingPiece.shape[i].y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);
                }
                this.playerPressHoldPiece = true;
            }
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
        // this.updateCanvas();
    }

    updateCanvas(){
        this.nextPiecesCtx.clearRect(0, 0, this.nextPiecesCanvas.width, this.nextPiecesCanvas.height);
        for(let i = 0; i < this.nextPieces.length; i++){
            this.nextPiecesCtx.fillStyle = COLORS[this.nextPieces[i].color - 1].returnRGB();
            let yOffset = i * PIECESMAXSIZE;
            for(let a = 0; a < this.nextPieces[i].shape.length; a++){
                this.nextPiecesCtx.fillRect(this.nextPieces[i].shape[a].x * BLOCKSIZE,
                    (this.nextPieces[i].shape[a].y + yOffset) * BLOCKSIZE, 
                    BLOCKSIZE, BLOCKSIZE
                );
                
                darkerColor = getDarkerColor(this.nextpieces[i].color);
                ctx.fillStyle = darkerColor.returnRGB();
                let x = (a * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
                let y = (b * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
                ctx.fillRect(x, y, BLOCKSIZESHADE, BLOCKSIZESHADE);
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
        board.updateHoldingPiecePositionOnBoard(board.activePiece.color);
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
        this.level = 0;
        this.levelTextNumber.innerHTML = 0;
        this.score = 0;
        this.scoreTextNumber.innerHTML = 0;
        this.nextLevelUpThreshold = SCORELEVELINCREMENT;
    }
}

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let heldBlockCanvas = document.getElementById("heldBlockCanvas");
let heldBlockCtx = heldBlockCanvas.getContext("2d");

let canvasWidth = 200;
let canvasHeight = 400;

let heldBlockCanvasWidth = 80;
let heldBlockCanvasHeight = 80;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

heldBlockCanvas.width = heldBlockCanvasWidth;
heldBlockCanvas.height = heldBlockCanvasHeight;

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
    heldBlockCtx.clearRect(0, 0, heldBlockCanvas.width, heldBlockCanvas.height);
    instantDropKeyPreviouslyPressed = false;
    instantDropKeyPressedDown = false;
    holdKeyPreviouslyPressed = false;
    holdKeyPressedDown = false;
    gameIsRunning = true;
    board.pickNewHoldingPiece();
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