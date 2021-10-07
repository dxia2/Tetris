let scoreText = document.getElementById("scoreText");

id = setInterval(scoreTextGrow, 5);

let startTimePassed = 1;
let timePassed = startTimePassed;
function scoreTextGrow(){
    if(timePassed <= 0){
        scoreText.style.fontSize = "50px";
        clearInterval(id)
    }else{
        scoreText.style.fontSize = "200px";
        timePassed -= deltaTime;
    }
}