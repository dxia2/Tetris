// Library for creating UI
class UiButton{
    position
    width;
    height;
    text;
    color;
    outlineWidth;
    clickAction;
    uiText;
    isActive;
    static uiButtons = [];
    constructor(position, width, height, color, outlineWidth, uiText, isActive, clickAction){
        this.position = position;
        this.width = width;
        this.height = height;
        this.color = color;
        this.outlineWidth = outlineWidth;
        this.clickAction = clickAction;
        this.uiText = uiText;
        this.uiText.position = new Vector2(this.uiText.position.x + this.position.x + this.width / 2, this.uiText.position.y + this.position.y + this.height / 2);
        this.isActive = isActive;
        UiButton.uiButtons.push(this);
    }
    // Call this whenever this element should be drawn
    drawUi(context){
        context.strokeStyle = this.color;
        context.lineWidth = this.lineWidth;
        context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        
        this.uiText.drawUi(context);
    }

    onClick(){
        if(!this.isActive){
            return;
        }
        this.clickAction();
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
    // Call this whenever this element should be drawn
    drawUi(context){
        context.font = this.font;
        context.fillStyle = this.color;
        if(this.centered){
            context.textAlign = "center";
        }else{
            context.textAlign = "left";
        }

        context.textBaseline = "middle";
        context.fillText(this.text, this.position.x, this.position.y);
    }
}
function getMousePositionOnCanvas(canvas, event){
    let rect = canvas.getBoundingClientRect();
    // Gets the mouse position on the page, then subtracts the canvas position on the page to get the mouse position in the canvas
    return new Vector2(event.clientX - rect.left, event.clientY - rect.top);
}
// Checks if a position is inside a button
function isInsideButton(pos, button){
    return pos.x > button.position.x && pos.x < button.position.x + button.width && pos.y < button.position.y + button.height && pos.y > button.position.y;
}

// Click event listener
canvas.addEventListener("click", onUiButtonClick, false)
// Click handler function
function onUiButtonClick(event){
    let mousePos = getMousePositionOnCanvas(canvas, event);
    for(let i = 0; i < UiButton.uiButtons.length; i++){
        if(isInsideButton(mousePos, UiButton.uiButtons[i])){
            UiButton.uiButtons[i].onClick();
        }
    }
}