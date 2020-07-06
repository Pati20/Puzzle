var puzzle = document.getElementById('puzzle');
var context = puzzle.getContext('2d');
var img = new Image();
img.src = './img/puzzle.jpg';
img.addEventListener('load', drawingGrid, false);
var sizeCanvas = document.getElementById('puzzle').width; // szerokość = 640px
var board_size = 4; // plansza 4x4
var sizeBlock = sizeCanvas / board_size; //rozmiar jednego puzzla w pixelach
var redBlock = new Object;
redBlock.x = 0;
redBlock.y = 0;
var checkedBlock = new Object;
checkedBlock.x = 0; //ustawienie wspołrzędnych
checkedBlock.y = 0;
var done = false;
boardStarting();

function boardStarting() { //tworzenie tablicy dwuwymiarowej
    boardElements = new Array(board_size);
    for (var i = 0; i < board_size; ++i) {
        boardElements[i] = new Array(board_size);
        for (var j = 0; j < board_size; ++j) {
            boardElements[i][j] = new Object;
            boardElements[i][j].x = i;
            boardElements[i][j].y = j;
        }
    }
    blocksStarting();
    cleaningBoard();

    if(!check()) {
        if(redBlock.y == 0  && redBlock.x <= 1) {
            change(board_size - 2, board_size -1, board_size - 1, board_size - 1);
        }else {
            change(0, 0, 1, 0);
        }
        cleaningBoard();
    }
    done = false;
}

function blocksStarting() { // shuffle puzzle
    var i = board_size * board_size - 1;
    while(i > 0) {
        var j = Math.floor(Math.random() * i);
        var xi = i % board_size;
        var yi = Math.floor(i / board_size);
        var xj = j % board_size;
        var yj = Math.floor(j / board_size);
        change(xi, yi, xj, yj);
        --i;
    }
}

function change(ix, iy, jx, jy) { // change pozycji puzla z puzlem y
    var temp = new Object();
    temp= boardElements[ix][iy];
    boardElements[ix][iy] = boardElements[jx][jy];
    boardElements[jx][jy] = temp;
}

function cleaningBoard() { // czyścimy planszę (na chwile )
    for(var i = 0; i < board_size; ++i) {
        for(var j = 0; j < board_size; ++j) {
            if(boardElements[i][j].x == board_size - 1 && boardElements[i][j].y == board_size - 1) {
                redBlock.x = 0;
                redBlock.y = 0;
            }
        }
    }
}

function inversionsSum() {
    var inv	= 0;
    for(var i =0; i < board_size; ++i){
        for(var j = 0; j < board_size; ++j) {
            // dla każdego klocka dodaje jego inwersje do licznika
            inv += countInversions(j, i);
        }
    }
    return inv;
}

function countInversions(a, b) {
    var inv = 0;	//licznik inwersji
    var num = b * board_size + a;
    var end = board_size * board_size;	// koniec tablicy, zanim pętla wyjdzie poza planszę
    var value = boardElements[a][b].y * board_size + boardElements[a][b].x; // podaje wartość do porównania
    for(var i = num + 1; i < end; ++i) {
        var x = i % board_size;
        var y = Math.floor(i / board_size);
        var comp = boardElements[x][y].y *board_size + boardElements[x][y].x;
        if(value > comp && value != (end - 1)) {
            ++inv;
        }
    }
    return inv;
}

function check() {
    var emptyRow = redBlock.y;
    var row = board_size - emptyRow;
    if(board_size % 2 == 1){
        return (inversionsSum() % 2 == 0);
    }
    if(board_size % 2 == 0 && row % 2 == 0){
        return (inversionsSum() % 2 == 1);
    }
    if(board_size % 2 == 0 && row % 2 == 1){
        return (inversionsSum() % 2 == 0);
    }
}

function drawingGrid() {
    context.clearRect(0, 0, sizeCanvas, sizeCanvas);
    for(var i = 0; i < board_size; ++i) {
        for(var j = 0; j < board_size; ++j) {
            var x = boardElements[i][j].x;
            var y = boardElements[i][j].y;
            if(i != redBlock.x || j != redBlock.y || done == true) {
                context.drawImage(img, x * sizeBlock, y * sizeBlock, sizeBlock, sizeBlock, i * sizeBlock, j * sizeBlock, sizeBlock, sizeBlock);
            }
        }
    }
}

function distance(cX, cY, eX, eY) {
    var d = Math.abs(cX - eX) + Math.abs(cY - eY);
    return d;
}
//onmouseover - gdy wskaźnk myszki zostanie przesunięty na canvas
document.getElementById('puzzle').onmouseover = function(e){
    // pageX, pageY - odczytują wspolrzedne x i y (w pixelach) miejsca kliknięcia myszką
    // offsetX, offsetY zwracaja wspolrzędne wskaznika myszki,
    // względnie do elementu docelowego - czyli tutaj wybranego klocka
    checkedBlock.x = Math.floor((e.pageX - this.offsetLeft) / sizeBlock);
    checkedBlock.y = Math.floor((e.pageY - this.offsetTop) / sizeBlock);
};

//Obsługa kliknięcia na dany klocek na canvasie
document.getElementById('puzzle').onclick = function(e) {
    if(!done) {
        checkedBlock.x = Math.floor((e.pageX - this.offsetLeft) / sizeBlock); // pozycja x klocka na którego kliknęlismy
        checkedBlock.y = Math.floor((e.pageY - this.offsetTop) / sizeBlock);  // pozycja y klocka na którego kliknęlismy
        var odl = distance(checkedBlock.x, checkedBlock.y, redBlock.x, redBlock.y);
        if(odl == 1) { //jeśli odległoć od czerwonego klocka jest = 1, czyli wybrany klocek przylega do niego
            changingBlocks(redBlock, checkedBlock);
            drawingGrid();
        }
        if(done) {
            winScreen();
        }
    }
};

function changingBlocks(red, chosen) {
    boardElements[red.x][red.y].x = boardElements[chosen.x][chosen.y].x;
    boardElements[red.x][red.y].y = boardElements[chosen.x][chosen.y].y;
    boardElements[chosen.x][chosen.y].x = board_size - 1;
    boardElements[chosen.x][chosen.y].y = board_size - 1;
    red.x = chosen.x;
    red.y = chosen.y;
    chceckWin();
}

function chceckWin() {
    for(var i = 0; i < board_size; ++i) {
        for(var j = 0; j < board_size; ++j) {
            //jeśli którakolwiek ze współrzędnych nie będzie sie zgadzać to obrazek nie został ułożony
            if(boardElements[i][j].x != i || boardElements[i][j].y != j) {
                done = false;
                return;
            }
        }
    }
    done = true;
}

function resetPuzzle() {
    sizeBlock = sizeCanvas / board_size;
    done = false;
    boardStarting();
    drawingGrid();
}

$(function () {
    puzzle.onmousemove = mousePos;
});

document.getElementById('resetButton').onclick = function(e) {
    resetPuzzle();
};

function giveParameters(value) {
    document.getElementById('textInput').value=value;
    board_size = value;
}
function winScreen() {
    var retry = confirm('Wygrałeś! Chcesz zagrać ponownie?');
    if(retry) {
        resetPuzzle();
    }
}

document.getElementById('hint').onmouseout = function(e) {
    drawingGrid();
};

function loadImage(src){
    return new Promise(
        function(resolve, reject){
            img.onload = function(){ resolve(src); };
            img.onerror = function(){ reject(src); };
            img.src = src;
        }
    );
}

//loadFull wywoływana na onclick na obrazku skompresowanym
function loadFull(src){
    var promise = loadImage(src);
// then() to podstawowa metoda pozwalajaca na podjecie działan po zmianie stanu obietnicy. Pobiera 2 argumenty:
// Pierwszy to funkcja przeznaczona do wywołania,gdy obietnica bedzie spełniona.
// 2. arg. to funkcja wywoływana w przypadku odrzucenia obietnicy
    promise.then(onSuccess).catch(onFailure);
    resetPuzzle()
}
function onSuccess(url){
    document.getElementById("hint").src = url;
}

function onFailure(url){
    alert("on failure")
}

// Obsługa zmiany kursora, najeżdżając myszką na obrazek, który można zamienić (przylegający do czerwonego)
function mousePos(e) {
    if (e.offsetX) {
        mouseX = e.offsetX;
        mouseY = e.offsetY;
    }
    else if (e.layerX) {
        mouseX = e.layerX;
        mouseY = e.layerY;
    }

    checkedBlock.x = Math.floor((mouseX) / sizeBlock);
    checkedBlock.y = Math.floor((mouseY) / sizeBlock);
    var d = distance(checkedBlock.x, checkedBlock.y, redBlock.x, redBlock.y);
    if(d == 1){
        document.body.style.cursor = 'grab'; // kursor łapka, czyli na klockach, na które możemy kliknąć (przylegające do czerwonego)
    }
    else {
        document.body.style.cursor = 'default'; //kursor domyślna strzałka, czyli nie mozna kliknac
    }
}