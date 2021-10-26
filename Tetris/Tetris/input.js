// A script that gets all the key inputs

// Object that contains all the keys we try to detect
let keysPressed = {
    "w": false,
    "a": false,
    "s": false,
    "d": false,
    "q": false,
    "e": false,
    "f": false,
}
// Object that holds how much time is left before the active piece can move a certain direction again
let timeBtwMove = {
    //"w": 0,
    "a": 0,
    "s": 0,
    "d": 0
}
// Object that holds how much time is left before the active piece can rotate a certain direction again
let timeBtwRotate = {
    "q": 0,
    "e": 0
}
// The active piece will continue to move when the player holds down a key
// Defines how long of a delay there will be before the active piece moves again
let startTimeBtwMovePiece = 0.1;
// Defines how long of a delay there will be before the active piece rotates again
let startTimeBtwRotate = 0.15;

// Event Listeners
document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);
// Event functions
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