// An animation that makes the score text pop out when the player gains points
let scoreText = document.getElementById("scoreText");
let levelText = document.getElementById("levelText");

let startTimePassed = 0.25;
let timePassed = startTimePassed;

let originalFontSize = 16;
let currentSize = originalFontSize;
let growSizeSpeed = 20;
let id;

function startTextAnimation(text){
    if(id != undefined){
        clearInterval(id);
    }

    timePassed = startTimePassed;
    currentSize = originalFontSize;
    id = setInterval(textGrow, 5, text);
}
function textGrow(text){
    if(timePassed <= 0){
        
        clearInterval(id);
        timePassed = startTimePassed;
        id = setInterval(textShrink, 5, text);
    }else{
        text.style.fontSize = currentSize + "px";
        currentSize += deltaTime * growSizeSpeed;
        timePassed -= deltaTime;
    }
}

function textShrink(text){
    if(timePassed <= 0){
        clearInterval(id);
    }else{
        text.style.fontSize = currentSize + "px";
        currentSize -= deltaTime * growSizeSpeed;
        timePassed -= deltaTime;
    }
}