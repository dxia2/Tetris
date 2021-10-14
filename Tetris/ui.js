class UiButton{
    position
    width;
    height;
    text;
    color;
    outlineWidth;
    font;
    clickAction;
    static uiButtons = [];
    constructor(position, width, height, text, color, outlineWidth, font, clickAction){
        this.position = position;
        this.width = width;
        this.height = height;
        this.text = text;
        this.color = color;
        this.outlineWidth = outlineWidth;
        this.font = font;
        this.clickAction = clickAction;
        UiButton.uiButtons.push(this);
    }

    draw(context){
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        
        context.font = this.font;
        context.fillStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.text, this.position.x + this.width / 2, this.position.y + this.height / 2);
    }
}
class UiText{
    position;
    text;
    font;
    color;
    centered;
    constructor(position, text, font, color, centered){
        this.position = position;
        this.text = text;
        this.font = font;
        this.color = color;
        this.centered = centered;
    }

    draw(context){
        context.font = this.font;
        context.fillStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillText(this.text, this.position.x, this.position.y);
    }
}
function getMousePositionOnCanvas(canvas, event){
    let rect = canvas.getBoundingClientRect();
    // Gets the mouse position on the page, then subtracts the canvas position on the page to get the mouse position in the canvas
    return new Vector2(event.clientX - rect.left, event.clientY - rect.top);
}

function isInsideButton(pos, button){
    return pos.x > button.position.x && pos.x < button.position.x + button.width && pos.y < button.position.y + button.height && pos.y > button.position.y;
}

let startButton = new UiButton(new Vector2(50, 200), 100, 50, "Start Game", "black", 5, "20px PressStart2P", 
    function(){
        requestAnimationFrame(draw);
    }
);
startButton.draw(ctx);

canvas.addEventListener("click", onUiButtonClick, false)

function onUiButtonClick(event){
    let mousePos = getMousePositionOnCanvas(canvas, event);
    for(let i = 0; i < UiButton.uiButtons.length; i++){
        if(isInsideButton(mousePos, UiButton.uiButtons[i])){
            UiButton.uiButtons[i].clickAction();
            
        }
        
    }
}