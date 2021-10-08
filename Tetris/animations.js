// An animation that makes the score text pop out when the player gains points
let scoreText = document.getElementById("scoreText");

let startTimePassed = 0.2;
let timePassed = startTimePassed;

let originalSize = 20;
let currentSize = originalSize;
let growSizeSpeed = 2;
let id;

function startScoreAnimation(){
    if(id != undefined){
        clearInterval(id);
    }

    timePassed = startTimePassed;
    currentSize = originalSize;
    id = setInterval(scoreTextGrow, 5);
}
function scoreTextGrow(){
    if(timePassed <= 0){
        
        clearInterval(id);
        timePassed = startTimePassed;
        id = setInterval(scoreTextShrink, 5);
    }else{
        scoreText.style.fontSize = currentSize + "px";
        currentSize += (startTimePassed - timePassed) * growSizeSpeed;
        timePassed -= deltaTime;
    }
}

function scoreTextShrink(){
    if(timePassed <= 0){
        clearInterval(id);
    }else{
        scoreText.style.fontSize = currentSize + "px";
        currentSize -= (startTimePassed - timePassed) * growSizeSpeed;
        timePassed -= deltaTime;
    }
}