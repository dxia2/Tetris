// An animation that makes the score text pop out when the player gains points
let scoreText = document.getElementById("scoreText");
let levelText = document.getElementById("levelText");

let startTimePassed = 0.2;
let timePassed = startTimePassed;

let originalSize = 16;
let currentSize = originalSize;
let growSizeSpeed = 2;
let id;

function startTextAnimation(text){
    if(id != undefined){
        clearInterval(id);
    }

    timePassed = startTimePassed;
    currentSize = originalSize;
    id = setInterval(textGrow, 5, text);
}
function textGrow(text){
    if(timePassed <= 0){
        
        clearInterval(id);
        timePassed = startTimePassed;
        id = setInterval(textShrink, 5, text);
    }else{
        text.style.fontSize = currentSize + "px";
        currentSize += (startTimePassed - timePassed) * growSizeSpeed;
        timePassed -= deltaTime;
    }
}

function textShrink(text){
    if(timePassed <= 0){
        clearInterval(id);
    }else{
        text.style.fontSize = currentSize + "px";
        currentSize -= (startTimePassed - timePassed) * growSizeSpeed;
        timePassed -= deltaTime;
    }
}