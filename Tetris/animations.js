// An animation that makes the score text pop out when the player gains points
let scoreText = document.getElementById("scoreText");
let levelText = document.getElementById("levelText");

// How long the animation will last for
let startTimePassed = 0.25;
let timePassed = startTimePassed;
// The original size of the font
let originalFontSize = 16;
let currentSize = originalFontSize;
// How fast the font grows
let growSizeSpeed = 20;
let id;

// Function that starts the animation
function startTextAnimation(text) {
    if (id != undefined) {
        clearInterval(id);
    }

    timePassed = startTimePassed;
    currentSize = originalFontSize;
    id = setInterval(textGrow, 5, text);
}
// Function that makes the text grow bigger
function textGrow(text) {
    if (timePassed <= 0) {

        clearInterval(id);
        timePassed = startTimePassed;
        id = setInterval(textShrink, 5, text);
    } else {
        text.style.fontSize = currentSize + "px";
        // increase the font size by a little bit each frame to make it look smooth
        currentSize += deltaTime * growSizeSpeed;
        timePassed -= deltaTime;
    }
}
// Function that makes the text grow smaller
function textShrink(text) {
    if (timePassed <= 0) {
        clearInterval(id);
    } else {
        text.style.fontSize = currentSize + "px";
        currentSize -= deltaTime * growSizeSpeed;
        timePassed -= deltaTime;
    }
}