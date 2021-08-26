 import { Tool, LineTool, rotateAroundPoint, GridVisualise } from './pen.js';

var canvas = $(".svgCanvas");
var draw = SVG().addTo('.svgCanvas').size(canvas.width(), canvas.height());

var gridArt = new GridVisualise(canvas, draw); 
var tool = new Tool(canvas, draw);

var fractalSymmetryCount = 6;

var mousePos = [0, 0];

var symbolObjects = Array();

var symbol = draw.symbol()




document.onmousedown = function (e) {
    let mX = e.pageX;
    let mY = e.pageY;
    tool.toolDown(mX, mY);
}

document.onmousemove = function (e) {
    let mX = e.pageX;
    let mY = e.pageY;
    mousePos = [mX, mY];
    tool.toolMove(mX, mY);
}


document.onmouseup = function (e) {

    tool.toolUp();

}

function download(filename, text) {



    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);


}

document.addEventListener('keydown', keyDown);

function keyDown(e) {
    if (e.key === "l")
        tool.setActiveTool("LINE")
    if (e.key === "a")
        tool.setActiveTool("ARCH")
    if (e.key === "r")
        tool.scaleGridUp()
    if (e.key === "f")
        tool.scaleGridDown();
    if (e.key === "q")
        tool.scaleLineDown();
    if (e.key === "e")
        tool.scaleLineUp();
    if (e.key === "z")
        tool.undoPrevious();
    if (e.key === "1")
        tool.changeFractalSymmetryLevels();
    if (e.key === "2")
        tool.changeSymmetryLevels();
    if (e.key === "d") {
        // Hides the grid
        $(".Gridgroup").hide();
        download('art.svg', draw.svg());
        // Reshows the grid
        $(".Gridgroup").show();
    }
    if (e.key === "+") tool.changeFractalOffset(20);
    if (e.key === "-") tool.changeFractalOffset(-20);
    if (e.key === "n") tool.newDrawing();
}


