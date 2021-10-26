// Calculates the time between the current frame and the last one
// Makes it so that the game speed is not connected to the frame rate
let deltaTime = 0;
let lastTime = 0;

requestAnimationFrame(time);

function time(currentTime) {
    deltaTime = (currentTime - lastTime) * 0.001;
    lastTime = currentTime;

    requestAnimationFrame(time);
}