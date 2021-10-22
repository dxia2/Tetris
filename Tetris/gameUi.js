let wannaPlayText = new UiText(new Vector2(100, 50), "wanna play?", "14px PressStart2P", "black", true);

let startButton = new UiButton(new Vector2(25, 200), 150, 75, "black", 5, new UiText(new Vector2(0, 0), "Start Game", "14px PressStart2P", "black", true), true, 
    function(){
        requestAnimationFrame(draw);
        board.pickNewActivePiece();
        this.isActive = false;
    }
);
let youDiedText = new UiText(new Vector2(100, 50), "yoy is dead", "14px PressStart2P", "black", true);
let yourScoreText = new UiText(new Vector2(100, 150), "Your Score Was:", "10px PressStart2P", "black", true)
let scoreDisplayText = new UiText(new Vector2(100, 175), "", "14px PressStart2P", "black", true);

let restartButton = new UiButton(new Vector2(25, 200), 150, 75, "black", 5, new UiText(new Vector2(0, 0), "Restart", "14px PressStart2P", "black", true), false,
    function(){
        this.isActive = false;
        resetGame();
    }
);

//------------------------------------------------------------
//Functions
function gameStartUI(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    wannaPlayText.drawUi(ctx);
    startButton.drawUi(ctx);

}
function gameEndUI(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scoreDisplayText.text = Score.score;
    youDiedText.drawUi(ctx);
    yourScoreText.drawUi(ctx);
    scoreDisplayText.drawUi(ctx);
    restartButton.isActive = true;
    restartButton.drawUi(ctx);
}
