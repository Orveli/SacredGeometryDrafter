import { Tool, LineTool, rotateAroundPoint } from './pen.js';

var canvas = $(".svgCanvas");
var draw = SVG().addTo('.svgCanvas').size(canvas.width(), canvas.height());
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
    if (e.key === "c")
        tool.setActiveTool("CIRCLE")
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
    if (e.key === "d") download('art.svg', draw.svg());
    if (e.key === "+") tool.changeFractalOffset(20);
    if (e.key === "-") tool.changeFractalOffset(-20);
    if(e.key==="n") tool.newDrawing();
}
/*
//document.addEventListener('keydown', logKey);

function logKey(e) {
    // console.log(e.keyCode )

    if (e.key === "s") {
        console.log(symmetryLevels)
        symmetryLevels.push(symmetryLevels.shift());
        symmetryCount = symmetryLevels[0];
    }
    if (e.key === "c") {
        fractalPen.drawCircles(mousePos[0],mousePos[1]);
    }
    if (e.key === "d") {
        download('art.svg', draw.svg());
        // console.log(draw.svg())
    }
    if (e.key === "+") diameter *= 2;
    if (e.key === "-") diameter /= 2;
    // Esc
    if (e.keyCode === 27) {
        oldSymmetries.forEach(function (value) {
            value.forEach(function (line) {

                do {
                    line.removeSegment(0);
                }
                while (line.getSegmentCount() > 0)
                line.clear();

            });
            //  value.clear();
        });


    }
    // Back key
    if (e.keyCode === 37) {

        if (newSymmetries.length > 0) {
            return;
        }

        let len = oldSymmetries.length;
        console.log(oldSymmetries);
        console.log(oldSymmetries[len - 1])

        let empty = false;
        oldSymmetries[len - 1].forEach(function (line) {
            console.log(line)
            if (line.getSegmentCount() > 1)
                line.removeSegment(line.getSegmentCount() - 1);
            else
                empty = true;
        });
        if (empty) oldSymmetries.splice(oldSymmetries.length - 1, 1);
    }

}

function getDistance(xA, yA, xB, yB) {
    let xDiff = xA - xB;
    let yDiff = yA - yB;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}

 */

