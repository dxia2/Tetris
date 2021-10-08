let keysPressed = {
    "w": false,
    "a": false,
    "s": false,
    "d": false,
    "q": false,
    "e": false,
    "f": false,
}
let timeBtwMove = {
    "w": 0,
    "a": 0,
    "s": 0,
    "d": 0
}

let timeBtwRotate = {
    "q": 0,
    "e": 0
}
let startTimeBtwMovePiece = 0.1;
let startTimeBtwRotate = 0.15;

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