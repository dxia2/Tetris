// Main script for tetris game

// A class that stores information for every tile on the board grid
class GridTile {
    // Stores a color and if the tile is locked in place(it's not part of the piece that the player is controlling)
    isLocked;
    color;
    constructor(isLocked, color) {
        this.isLocked = isLocked;
        this.color = color;
    }
}
// Class that stores information about the board the tetris pieces are on
class Board {
    ctx;
    grid;
    activePiece;
    startDelayBtwPieceFall;
    delayBtwPieceFall;
    pieces;
    holdingPiece = null;
    playerPressHoldPiece = false;
    startingPosition;
    constructor(ctx, startDelayBtwPieceFall, pieces, startingPosition) {
        this.ctx = ctx;
        // The grid is made up of 2 arrays of "GridTiles", which makes a 2d table
        this.grid = new Array(COLUMNS);
        for (let i = 0; i < COLUMNS; i++) {
            this.grid[i] = new Array(ROWS);
        }

        for (let x = 0; x < COLUMNS; x++) {
            for (let y = 0; y < ROWS; y++) {
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
    draw() {
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        // Loop through all the elements in the grid array
        // a represents the x value of the table, b represents the y value of the table
        for (let a = 0; a < COLUMNS; a++) {
            for (let b = 0; b < ROWS; b++) {
                // Color 0 represents an empty square, so if it is 0 we don't draw anything
                if (this.grid[a][b].color != 0) {
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
    loadPiece(piece, position) {
        this.activePiece = piece;
        this.activePiece.position = position;
        // Loop through all the parts of the shape of the piece, and set the position on the board to be the correct color
        for (let i = 0; i < piece.shape.length; i++) {
            this.grid[piece.getShapePosition(i).x][piece.getShapePosition(i).y].color = piece.color;
        }
    }
    // Simulates the pieces falling down
    addGravity() {
        // a timer that activates every x amount of seconds
        if (this.delayBtwPieceFall <= 0) {
            // move the active piece down by one on the grid
            this.moveActivePiece(new Vector2(0, 1));

            this.delayBtwPieceFall = this.startDelayBtwPieceFall;
        } else {
            this.delayBtwPieceFall -= deltaTime;
        }
    }
    // Function that picks a new active piece
    pickNewActivePiece() {
        // Reset the active piece's rotation because all the active pieces come from the same 7 pieces (not clones)
        // if we don't reset the rotation, the next time this piece comes into play it will have the same rotation
        if (this.activePiece != null) {
            this.activePiece.rotationIndex = 0;
            this.activePiece.shape = this.activePiece.rotations[this.activePiece.rotationIndex];
        }
        // Load a new piece based on what is next in the "nextPieces" class
        this.loadPiece(nextPieces.unloadPiece(), new Vector2(this.startingPosition.x, this.startingPosition.y));
        let isSpawningOnOtherPieces = false;
        // Check if the new piece is spawning on existing pieces, if so, the player loses
        for (let i = 0; i < this.activePiece.shape.length; i++) {
            if (this.grid[this.activePiece.getShapePosition(i).x][this.activePiece.getShapePosition(i).y].isLocked) {
                isSpawningOnOtherPieces = true;
            }
        }
        // Call playerLose function
        if (isSpawningOnOtherPieces) {
            playerLose();
        }
    }
    // a function that is used to move the active piece
    moveActivePiece(movement) {
        // Check if it hits the floor or if it collides with other tiles vertically
        if (Piece.checkCollisionAgainstFloor(this.activePiece, movement) ||
            Piece.checkCollisionAgainstOtherPiecesVertically(this.activePiece, this.grid, movement)) {
            // if so, pick a new active piece
            this.lockInActivePiece();
            this.pickNewActivePiece();
            // Since we are picking a new piece, the player can select a new piece to hold
            this.playerPressHoldPiece = false;
            return true;
        }
        // if it hits another tile horizontally, simply stop it from moving into that tile
        if (Piece.checkCollisionAgainstOtherPiecesHorizontally(this.activePiece, this.grid, movement)) {
            return true;
        }
        // Set the piece's last position to be colorless
        this.updateActivePiecePositionOnBoard(0);
        // Check if the active piece collides with the edges of the canvas
        if (!Piece.checkCollisionAgainstWalls(this.activePiece, movement)) {
            // If it doesn't, apply movement
            this.activePiece.position.x += movement.x;
            this.activePiece.position.y += movement.y;
        }

        this.updateActivePiecePositionOnBoard(this.activePiece.color);
        return false;
    }
    // Function that sets the active piece's position on the grid to be a certain color
    updateActivePiecePositionOnBoard(color) {
        for (let i = 0; i < this.activePiece.shape.length; i++) {
            // if(this.activePiece.getShapePosition(i).x >= 0 
            // && this.activePiece.getShapePosition(i).x < COLUMNS
            // && this.activePiece.getShapePosition(i).y >= 0
            // && this.activePiece.getShapePosition(i).y < ROWS){

            // }
            this.grid[this.activePiece.getShapePosition(i).x][this.activePiece.getShapePosition(i).y].color = color;

        }
    }
    // Locks in the active piece
    lockInActivePiece() {
        // Sets the elements on the grid of the active piece to have "isLocked = true"
        for (let i = 0; i < this.activePiece.shape.length; i++) {
            this.grid[this.activePiece.getShapePosition(i).x][this.activePiece.getShapePosition(i).y].isLocked = true;
        }
        this.rowIsComplete();
    }
    // Check if a row is completed
    rowIsComplete() {
        // Loop through all the rows
        for (let y = ROWS - 1; y >= 0; y--) {
            let rowIsComplete = true;
            for (let x = 0; x < COLUMNS; x++) {
                // If there is one grid cell that is not locked, the row cannot be complete
                if (!this.grid[x][y].isLocked) {
                    rowIsComplete = false;
                }
            }
            if (rowIsComplete) {
                // Clear the row if it is complete
                for (let x = 0; x < COLUMNS; x++) {
                    this.grid[x][y].isLocked = false;
                    this.grid[x][y].color = 0;
                }
                // Move everything in the grid above it down by one
                for (let a = y; a >= 0; a--) {
                    for (let b = 0; b < COLUMNS; b++) {
                        if (a != 0) {
                            let color = this.grid[b][a - 1].color;
                            let isLocked = this.grid[b][a - 1].isLocked;
                            this.grid[b][a - 1].color = 0;
                            this.grid[b][a - 1].isLocked = false;
                            this.grid[b][a].isLocked = isLocked;
                            this.grid[b][a].color = color;
                        } else {
                            // If a == 0, that means we are at the top of the grid and there is nothing to move down
                            this.grid[b][a].isLocked = false;
                            this.grid[b][a].color = 0;
                        }
                    }
                }
                // Add score
                Score.addScore(this);
                // increment the y because we need to check the same row again after everything was moved down
                y++;
            }
        }
    }
    // Function that instantly drops the active piece
    instantDrop() {
        let droppingBlock = true;
        // While there is nothing under it, move down one space
        while (droppingBlock) {
            if (this.moveActivePiece(new Vector2(0, 1))) {
                droppingBlock = false;
            }
        }
    }
    // Function that is called whenever the player wants to hold a piece
    holdPiece() {
        // If the active piece is the same as the held piece, there is no point in trying to swap them
        if (this.holdingPiece === this.activePiece) {
            return;
        }
        // If the holding piece == null, set it to be the active piece, and clear the space where the active piece was
        if (this.holdingPiece === null) {
            this.holdingPiece = this.activePiece;

            holdingPieceCtx.clearRect(0, 0, holdingPieceCanvasWidth, holdingPieceCanvasHeight);

            for (let i = 0; i < this.holdingPiece.shape.length; i++) {
                board.grid[this.holdingPiece.getShapePosition(i).x][this.holdingPiece.getShapePosition(i).y].color = 0;
            }
            this.holdingPiece.rotationIndex = 0;
            this.holdingPiece.shape = this.holdingPiece.rotations[this.holdingPiece.rotationIndex];

            this.pickNewActivePiece();
        } else {
            // If the holding piece is not == null, and the player hasnt already swapped the pieces
            // Switch the active piece with the holding piece
            if (!this.playerPressHoldPiece) {

                let activePiece = this.activePiece;
                this.activePiece = this.holdingPiece;
                this.holdingPiece = activePiece;


                holdingPieceCtx.clearRect(0, 0, holdingPieceCanvasWidth, holdingPieceCanvasHeight);

                for (let i = 0; i < this.holdingPiece.shape.length; i++) {
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
        // Draw the holding piece onto the held piece canvas
        for (let i = 0; i < this.holdingPiece.shape.length; i++) {
            holdingPieceCtx.fillStyle = COLORS[this.holdingPiece.color - 1].returnRGB();
            holdingPieceCtx.fillRect(this.holdingPiece.shape[i].x * BLOCKSIZE, this.holdingPiece.shape[i].y * BLOCKSIZE, BLOCKSIZE, BLOCKSIZE);

            let darkerColor = getDarkerColor(COLORS[this.holdingPiece.color - 1]);

            holdingPieceCtx.fillStyle = darkerColor.returnRGB();
            let x = (this.holdingPiece.shape[i].x * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
            let y = (this.holdingPiece.shape[i].y * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
            holdingPieceCtx.fillRect(x, y, BLOCKSIZESHADE, BLOCKSIZESHADE);
        }

        this.holdingPiece.position = new Vector2(this.startingPosition.x, this.startingPosition.y);
    }
}

// Class that contains information about the next 3 pieces
class NextPieces {
    nextPiecesCanvas;
    nextPiecesCtx;

    pieces;
    nextPieces;
    constructor(nextPiecesCanvasId, pieces, canvasWidth, canvasHeight) {
        this.nextPiecesCanvas = document.getElementById(nextPiecesCanvasId);
        this.nextPiecesCtx = this.nextPiecesCanvas.getContext("2d");

        this.nextPiecesCanvas.width = canvasWidth;
        this.nextPiecesCanvas.height = canvasHeight;
        // all the different pieces that are possible
        this.pieces = pieces;

        this.initialize();
    }

    initialize() {
        // Calculate the next 3 pieces
        this.nextPieces = [this.pieces[randomInteger(this.pieces.length - 1)], this.pieces[randomInteger(this.pieces.length - 1)], this.pieces[randomInteger(this.pieces.length - 1)]];
    }
    // Updates the next pieces canvas
    updateCanvas() {
        this.nextPiecesCtx.clearRect(0, 0, this.nextPiecesCanvas.width, this.nextPiecesCanvas.height);
        // Loop through all the elements in the nextPieces array
        for (let i = 0; i < this.nextPieces.length; i++) {
            // Calculate how far down to draw the pieces
            let yOffset = i * PIECESMAXSIZE;
            // Loop through all the individual pieces that make up the shape of the next piece and draw them
            for (let a = 0; a < this.nextPieces[i].shape.length; a++) {

                this.nextPiecesCtx.fillStyle = COLORS[this.nextPieces[i].color - 1].returnRGB();
                this.nextPiecesCtx.fillRect(this.nextPieces[i].shape[a].x * BLOCKSIZE,
                    (this.nextPieces[i].shape[a].y + yOffset) * BLOCKSIZE,
                    BLOCKSIZE, BLOCKSIZE
                );

                // Draw a slightly smaller, darker square on top to make the pieces stand out more
                let darkerColor = getDarkerColor(COLORS[this.nextPieces[i].color - 1]);

                this.nextPiecesCtx.fillStyle = darkerColor.returnRGB();
                // Calculate position
                let x = (this.nextPieces[i].shape[a].x * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
                let y = ((this.nextPieces[i].shape[a].y + yOffset) * BLOCKSIZE) + (BLOCKSIZE - BLOCKSIZESHADE) / 2;
                this.nextPiecesCtx.fillRect(x, y, BLOCKSIZESHADE, BLOCKSIZESHADE);
            }
        }
    }
    // returns the first piece in the nextPieces array and picks a new piece for the end of the array
    unloadPiece() {
        let unloadedPiece = this.nextPieces.shift();
        this.nextPieces.push(this.pieces[randomInteger(this.pieces.length)]);
        this.updateCanvas();
        return unloadedPiece;
    }
}
// class the contains information about the different pieces in the game
class Piece {
    // The shape refers to the current rotation the piece has and all the positions of the squares that make up the piece
    shape;
    // rotation defines to all the different possible rotations
    rotations;
    color;
    // Position of the piece on the grid of the board
    position;
    rotationIndex = 0;
    constructor(rotations, color) {
        this.rotations = rotations;
        this.color = color;

        this.shape = rotations[this.rotationIndex];
    }
    // returns the position of a square that makes up the shape + the position of the shape
    getShapePosition(index) {
        return new Vector2(this.shape[index].x + this.position.x, this.shape[index].y + this.position.y);
    }
    // Function for rotating the piece
    rotate(isRotatingRight) {
        // Store the original rotationIndex of the object so that we can revert it if the rotation doesn't work
        let originalRotationIndex = this.rotationIndex;

        // Check if rotating left or right
        if (isRotatingRight) {
            this.rotationIndex++;
            if (this.rotationIndex > this.rotations.length - 1) {
                this.rotationIndex = 0;
            }
        } else {
            this.rotationIndex--
            if (this.rotationIndex < 0) {
                this.rotationIndex = this.rotations.length - 1;
            }
        }
        // Clear the area where the piece used to be on the board
        board.updateActivePiecePositionOnBoard(0);
        this.shape = this.rotations[this.rotationIndex];

        // Check if the piece collides with the walls or other pieces or the floor when it rotates
        // Move the piece one block left and right to check if it still goes out of bounds or collides with other pieces
        if (Piece.checkCollisionAgainstWalls(this, new Vector2(0, 0)) || Piece.checkCollisionAgainstOtherPiecesRotation(this.rotations[this.rotationIndex], board.grid, this.position) || Piece.checkCollisionAgainstFloor(this, new Vector2(0, 0))) {
            this.position.x++;
            if (Piece.checkCollisionAgainstWalls(this, new Vector2(0, 0)) || Piece.checkCollisionAgainstOtherPiecesRotation(this.rotations[this.rotationIndex], board.grid, this.position) || Piece.checkCollisionAgainstFloor(this, new Vector2(0, 0))) {
                this.position.x -= 2;
                if (Piece.checkCollisionAgainstWalls(this, new Vector2(0, 0)) || Piece.checkCollisionAgainstOtherPiecesRotation(this.rotations[this.rotationIndex], board.grid, this.position) || Piece.checkCollisionAgainstFloor(this, new Vector2(0, 0))) {
                    // revert the rotation if it collides with things after moving it right one and left one
                    this.rotationIndex = originalRotationIndex;
                    this.shape = this.rotations[this.rotationIndex];
                    this.position.x++;
                }
            }
        }
        // Redraw the piece on the board
        board.updateActivePiecePositionOnBoard(board.activePiece.color);
    }
    // Checks for collisions against walls based on the movement given
    static checkCollisionAgainstWalls(piece, movement) {

        for (let i = 0; i < piece.shape.length; i++) {
            if (piece.getShapePosition(i).x + movement.x < 0 || piece.getShapePosition(i).x + movement.x > COLUMNS - 1) {
                return true;
            }
        }

        return false;
    }
    // Checks for collisions against the floor based on the movement given
    static checkCollisionAgainstFloor(piece, movement) {
        for (let i = 0; i < piece.shape.length; i++) {
            if (piece.getShapePosition(i).y + movement.y > ROWS - 1) {
                return true;
            }
        }

        return false;
    }
    // Checks for collisions against other pieces horizontally
    static checkCollisionAgainstOtherPiecesHorizontally(piece, grid, movement) {
        // Make a new array with the positions of the piece plus the movement
        let newPieceShapePositions = [];
        for (let i = 0; i < piece.shape.length; i++) {
            newPieceShapePositions.push(new Vector2(piece.getShapePosition(i).x + movement.x, piece.getShapePosition(i).y));
        }
        // loop through all the pieces in the array and check if they overlap with anything in the grid
        for (let i = 0; i < newPieceShapePositions.length; i++) {
            if (newPieceShapePositions[i].x < grid.length && newPieceShapePositions[i].x >= 0) {
                if (newPieceShapePositions[i].y < grid[newPieceShapePositions[i].x].length) {
                    if (grid[newPieceShapePositions[i].x][newPieceShapePositions[i].y].isLocked) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    // Checks for collisions against other pieces vertically
    static checkCollisionAgainstOtherPiecesVertically(piece, grid, movement) {
        let newPieceShapePositions = [];
        for (let i = 0; i < piece.shape.length; i++) {
            newPieceShapePositions.push(new Vector2(piece.getShapePosition(i).x, piece.getShapePosition(i).y + movement.y));
        }

        for (let i = 0; i < newPieceShapePositions.length; i++) {
            if (newPieceShapePositions[i].x < grid.length && newPieceShapePositions[i].x >= 0) {
                if (newPieceShapePositions[i].y < grid[newPieceShapePositions[i].x].length) {
                    if (grid[newPieceShapePositions[i].x][newPieceShapePositions[i].y].isLocked) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    // Checks for collisions against other pieces on the board based on the new rotation given
    static checkCollisionAgainstOtherPiecesRotation(newRot, grid, piecePosition) {
        for (let i = 0; i < newRot.length; i++) {
            if (newRot[i].x + piecePosition.x < grid.length && newRot[i].x + piecePosition.x >= 0) {
                if (newRot[i].y + piecePosition.y < grid[newRot[i].x + piecePosition.x].length) {
                    if (grid[newRot[i].x + piecePosition.x][newRot[i].y + piecePosition.y].isLocked) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
}
// class for keeping track of the score 
class Score {
    // Everything is static because the player can't have multiple scores
    static level = 1;
    static score = 0;
    static nextLevelUpThreshold = SCORELEVELINCREMENT;
    static levelTextNumber = document.getElementById("levelTextNumber");
    static scoreTextNumber = document.getElementById("scoreTextNumber");

    // function for adding to the score
    static addScore(board) {
        // Start animation on scoreText
        startTextAnimation(scoreText);
        // add score based on the level times SCORELEVELMULTIPLIER
        this.score += this.level * SCORELEVELMULTIPLIER;
        this.scoreTextNumber.innerHTML = this.score;
        // If the player has enough score to level up
        if (this.score >= this.nextLevelUpThreshold) {
            // add level
            this.level++;
            // start animation on levelText
            startTextAnimation(levelText)
            this.levelTextNumber.innerHTML = this.level;
            // Increase the score needed to level up again
            this.nextLevelUpThreshold += SCORELEVELINCREMENT * this.level;
        }
        // reduce the delay when the active piece of the board falls
        board.startDelayBtwPieceFall = STARTPIECEDROPDELAY - (this.level - 1) * DROPSPEEDINCREASEPERLEVEL;
        // if the drop speed is below the minimum, set it to be the minimum
        if (board.startDelayBtwPieceFall < MINDROPSPEED) {
            board.startDelayBtwPieceFall = MINDROPSPEED;
        }
    }
    // function that resets the level and score
    static reset() {
        this.level = 1;
        this.levelTextNumber.innerHTML = this.level;
        this.score = 0;
        this.scoreTextNumber.innerHTML = this.score;
        this.nextLevelUpThreshold = SCORELEVELINCREMENT;
    }
}
// Varibles
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

let holdingPieceCanvas = document.getElementById("holdingPieceCanvas");
let holdingPieceCtx = holdingPieceCanvas.getContext("2d");

let canvasWidth = 200;
let canvasHeight = 400;

let holdingPieceCanvasWidth = 80;
let holdingPieceCanvasHeight = 80;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

holdingPieceCanvas.width = holdingPieceCanvasWidth;
holdingPieceCanvas.height = holdingPieceCanvasHeight;

// Define all the pieces
let iBlock = new Piece(
    // The different rotations of the piece
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
// where the pieces spwn from
let pieceStartPositionOffset = new Vector2(4, 0);

// Create next pieces and the board
let nextPieces = new NextPieces("nextPiecesCanvas", [iBlock, jBlock, lBlock, oBlock, sBlock, tBlock, zBlock], 80, 240);
let board = new Board(ctx, STARTPIECEDROPDELAY, [iBlock, jBlock, lBlock, oBlock, sBlock, tBlock, zBlock], pieceStartPositionOffset);
// Display the ui at the start of the game
gameStartUI();

let gameIsRunning = true;

// booleans that only allow a key to be pressed once (so you can't hold the key)
let instantDropKeyPreviouslyPressed = false;
let instantDropKeyPressedDown = false;

let holdKeyPreviouslyPressed = false;
let holdKeyPressedDown = false;

// main loop
function draw() {
    // Detect whether certain keys are pressed
    // If "a" is pressed, move the active piece one space to the left
    if (keysPressed["a"]) {
        if (timeBtwMove["a"] <= 0) {
            board.moveActivePiece(new Vector2(-1, 0));
            timeBtwMove["a"] = startTimeBtwMovePiece;
        } else {
            timeBtwMove["a"] -= deltaTime;
        }
    } else {
        timeBtwMove["a"] = 0;
    }
    // If "d" is pressed, move the active piece one space to the right
    if (keysPressed["d"]) {
        if (timeBtwMove["d"] <= 0) {
            board.moveActivePiece(new Vector2(1, 0));
            timeBtwMove["d"] = startTimeBtwMovePiece;
        } else {
            timeBtwMove["d"] -= deltaTime;
        }
    } else {
        timeBtwMove["d"] = 0;
    }
    // if "s" is pressed, move the active piece one space down
    if (keysPressed["s"]) {
        if (timeBtwMove["s"] <= 0) {
            board.moveActivePiece(new Vector2(0, 1));
            timeBtwMove["s"] = startTimeBtwMovePiece;
        } else {
            timeBtwMove["s"] -= deltaTime;
        }
    } else {
        timeBtwMove["s"] = 0;
    }
    // if "q" is pressed, rotate the active piece counterclockwise
    if (keysPressed["q"]) {
        if (timeBtwRotate["q"] <= 0) {
            board.activePiece.rotate(false);
            timeBtwRotate["q"] = startTimeBtwRotate;
        } else {
            timeBtwRotate["q"] -= deltaTime;
        }
    } else {
        timeBtwRotate["q"] = 0;
    }
    // if "e" is pressed, rotate the active piece clockwise
    if (keysPressed["e"]) {
        if (timeBtwRotate["e"] <= 0) {
            board.activePiece.rotate(true);
            timeBtwRotate["e"] = startTimeBtwRotate;
        } else {
            timeBtwRotate["e"] -= deltaTime;
        }
    } else {
        timeBtwRotate["e"] = 0;
    }
    // if "w" is pressed, instantly drop the active piece (key cannot be held down)
    if (keysPressed["w"]) {
        if (instantDropKeyPreviouslyPressed) {
            if (instantDropKeyPressedDown) {
                instantDropKeyPressedDown = false;
            }
        } else {
            instantDropKeyPreviouslyPressed = true;
            instantDropKeyPressedDown = true;
        }

    } else {
        instantDropKeyPreviouslyPressed = false;
    }

    if (instantDropKeyPressedDown) {
        board.instantDrop();
    }
    // hold the active piece if "f" is pressed
    if (keysPressed["f"]) {
        if (holdKeyPreviouslyPressed) {
            if (holdKeyPressedDown) {
                holdKeyPressedDown = false;
            }
        } else {
            holdKeyPreviouslyPressed = true;
            holdKeyPressedDown = true;
        }

    } else {
        holdKeyPreviouslyPressed = false;
    }

    if (holdKeyPressedDown) {
        board.holdPiece();
    }


    board.addGravity();

    // if game is still running draw the next frame
    if (gameIsRunning) {
        board.draw();

        requestAnimationFrame(draw);
    }
}
// A function that returns a random integer
function randomInteger(max) {
    return Math.floor(Math.random() * max);
}
// A function that is called when the player loses
function playerLose() {
    // stop the game and draw the ending UI
    gameIsRunning = false;
    gameEndUI();
}
// Function that resets the game
function resetGame() {
    nextPieces = new NextPieces("nextPiecesCanvas", [iBlock, jBlock, lBlock, oBlock, sBlock, tBlock, zBlock], 80, 240);

    board = new Board(ctx, STARTPIECEDROPDELAY, [iBlock, jBlock, lBlock, oBlock, sBlock, tBlock, zBlock], new Vector2(4, 0));
    Score.reset();
    holdingPieceCtx.clearRect(0, 0, holdingPieceCanvas.width, holdingPieceCanvas.height);
    instantDropKeyPreviouslyPressed = false;
    instantDropKeyPressedDown = false;
    holdKeyPreviouslyPressed = false;
    holdKeyPressedDown = false;
    gameIsRunning = true;
    board.pickNewActivePiece();
    requestAnimationFrame(draw);
}

function getDarkerColor(color) {
    // A function that returns a slightly darker version of a color
    let darkerColor = new Color(color.r,
        color.g,
        color.b
    );
    darkerColor.r *= 0.85;
    darkerColor.g *= 0.85;
    darkerColor.b *= 0.85;
    return darkerColor;
}