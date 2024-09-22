//board
let board;
let boardWidth = 360;
let boardHeight = 576;
let context;

//doodles
let doodlerWidth = 46;
let doodlerHeight = 46;
let doodlerX = boardWidth / 2 - doodlerWidth / 2;
let doodlerY = boardHeight * 7 / 8 - doodlerHeight;
let doodlerRightImage;
let doodlerLeftImage;

let doodler = {
    img: null,
    x: doodlerX,
    y: doodlerY,
    width: doodlerWidth,
    height: doodlerHeight,
}

//physics
let lastTime = 0;
let velocityX = 0;
let velocityY = 0; //doodler jump speed
let initialVelocityY = -8; //starting velocityY
let gravity = 0.4;


//platforms
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let brokenPlatformProbability = 0.3;
let platformImage;
let brokenPlatformImage;

//scores
let score = 0;
let maxScore = 0;
let gameOver = false;



window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    //draw doodler
    // context.fillStyle = "green";
    // context.fillRect(doodler.x, doodler.y, doodler.width, doodler.height);

    //load images
    doodlerRightImage = new Image();
    doodlerRightImage.src = "./doodler-right.png";
    doodler.img = doodlerRightImage;
    doodlerRightImage.onload = function () {
        context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);
    }

    doodlerLeftImage = new Image();
    doodlerLeftImage.src = "./doodler-left.png"

    platformImage = new Image();
    platformImage.src = "./platform.png";

    brokenPlatformImage = new Image();
    brokenPlatformImage.src = "./platform-broken.png"

    velocityY = initialVelocityY;
    placePlatforms() ;

    requestAnimationFrame(update);
    document.addEventListener("keydown", moveDoodler);
}

function update(currentTime) {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    let deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;

    doodler.x += velocityX * deltaTime * 60;
    if (doodler.x > board.width) {
        doodler.x = 0;
    } else if (doodler.x + doodler.width < 0) {
        doodler.x = board.width;
    }

    velocityY += gravity * deltaTime * 60;
    doodler.y += velocityY * deltaTime * 60;

    if (doodler.y > board.height) {
        gameOver = true;
    }
    //draw doodler over and over
    context.drawImage(doodler.img, doodler.x, doodler.y, doodler.width, doodler.height);

    //draw platform
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && doodler.y < boardHeight * 3 / 4) {
            platform.y -= initialVelocityY * deltaTime * 60; //slide platform down
        }
        if  (detectCollision(doodler, platform) && velocityY >= 0 && !platform.isBroken) {
            velocityY = initialVelocityY;
        }
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    }

    //clear platforms and add new ones
    while (platformArray.length > 0 && platformArray[0].y > board.height) {
        platformArray.shift(); //removes first element from array
        newPlatform();
    }
    updateScore(deltaTime);
    context.fillStyle = "black";
    context.font = "15px sans-serif";
    context.fillText(score, 5, 20);
    if (gameOver) {
        context.fillText("GAME OVER: Press space to restart", boardWidth/7, boardHeight*7/8)
    }
}

function moveDoodler(e) {
    if (e.code === "ArrowRight" || e.code === "KeyD") {
        velocityX =  4;
        doodler.img = doodlerRightImage;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        velocityX = -4;
        doodler.img = doodlerLeftImage;
    } else if (e.code === "Space" && gameOver) {
        //reset = all
        doodler = {
            img: doodlerRightImage,
            x: doodlerX,
            y: doodlerY,
            width: doodlerWidth,
            height: doodlerHeight,
        }
        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    }
}

function placePlatforms() {
    platformArray = [];

        let platform = {
            img: platformImage,
            x: boardWidth / 2,
            y: boardHeight - 50,
            width: platformWidth,
            height: platformHeight,
            isBroken: false,
        }
        platformArray.push(platform);


    // platform = {
    //     img: platformImage,
    //     x: boardWidth / 2,
    //     y: boardHeight - 150,
    //     width: platformWidth,
    //     height: platformHeight,
    // }
    // platformArray.push(platform);
    for (let i = 0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth * 3 / 4); // (0-1) * boardWidth * 3 / 4
        //starting platforms
            let platform = {
                img: platformImage,
                x: randomX,
                y: boardHeight - 75 * i - 150,
                width: platformWidth,
                height: platformHeight,
                isBroken: false,
            }
            platformArray.push(platform);

    }
}

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth * 3 / 4); // (0-1) * boardWidth * 3 / 4
    //starting platforms
    if (Math.random() < brokenPlatformProbability) {
        let platform = {
            img: brokenPlatformImage,
            x: randomX,
            y: -platformHeight,
            width: platformWidth,
            height: platformHeight,
            isBroken: true,
        }
        platformArray.push(platform);
    } else {
        let platform = {
            img: platformImage,
            x: randomX,
            y: -platformHeight,
            width: platformWidth,
            height: platformHeight,
            isBroken: false,
        }
        platformArray.push(platform);
    }
}

function updateScore(deltaTime) {
    let points = Math.floor(50 * Math.random()); // (0-1) * 50 --> (0-50)
    if (velocityY < 0) { //negative is going up
        maxScore += Math.floor(points * deltaTime * 60);
        if (score < maxScore) {
            score = maxScore;
        }
    } else if (velocityY >= 0) {
        maxScore -= Math.floor(points * deltaTime * 60);
    }
 }

function detectCollision(a, b) {
    return  a.x < b.x + b.width && // a's top left corner doesnt reach b's top right corner
            a.x + a.width > b.x && // a's top right corner passes b's top left corner
            a.y < b.y + b.height && // a's top left corner doesnt reach b's bottom left corner
            a.y + a.height > b.y // a's bottom left corner passes b's top left corner
}