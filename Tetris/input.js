let keysPressed = {
    "w": false,
    "a": false,
    "s": false,
    "d": false
}
let timeBtwMove = {
    "w": 0,
    "a": 0,
    "s": 0,
    "d": 0
}
let startTimeBtwMovePiece = 0.1;

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
function keyDownHandler(event) {
    if (event.key in keysPressed) {
        keysPressed[event.key] = true;
    }
}

function keyUpHandler(event) {
    if (event.key in keysPressed) {
        keysPressed[event.key] = false;
    }
}