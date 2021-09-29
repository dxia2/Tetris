let deltaTime = 0;
let lastTime = 0;

requestAnimationFrame(time);

function time(currentTime) {
    deltaTime = (currentTime - lastTime) * 0.001;
    lastTime = currentTime;
    requestAnimationFrame(time);
}