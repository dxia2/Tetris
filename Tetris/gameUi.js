
let startButton = new UiButton(new Vector2(25, 200), 150, 75, "black", 5, new UiText(new Vector2(0, 0), "Start Game", "14px PressStart2P", "black", true), 
    function(){
        requestAnimationFrame(draw);
        this.isActive = false;
    }
);

let restartButton = new UiButton(new Vector2(25, 200), 150, 75, "black", 5, new UiText(new Vector2(0, 0), "Restart", "14px PressStart2P", "black", true), 
    function(){
        this.isActive = false;
    }
);
gameStartUI();
//------------------------------------------------------------
//Functions
function gameStartUI(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    startButton.drawUi(ctx);
}
function gameEndUI(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    restartButton.drawUi(ctx);
}
