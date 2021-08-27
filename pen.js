// Ideas / Todo:
// Create a line tool that creates a single line between two grid points
// Tool to reset symmetry origin and another one to rotate a set of symmetries drawn away from origin. (Like previously removed "fractalSymmetry")
// Current grid drawing is not optimal enough for small grids (Currently visual grid is not scalable)
// Undo could hide elements insted of deleting them (would enable redo functionality) - saving would then need to remove hidden elements from saved file
// Enable 4 timed symetry and make sure grid is redrawn after that is selected/unselected

class Grid {
    constructor(canvas, draw) {
        this.canvas = canvas;
        this.draw = draw;
        this.width = this.canvas.width();
        this.height = this.canvas.height();
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.gridSize = 40;
        // TODO: Make both tools use the same cursor
        this.deb = this.draw.circle(10).move(-100, -100).fill("none").stroke({ width: 1, color: "red" });
        this.symmetryCount = 6;
    }
    scaleGridDown() {
        this.gridSize = this.gridSize / 2;
        if(this.gridSize<20) this.gridSize = 20;
    }
    scaleGridUp() {
        this.gridSize = this.gridSize * 2
        if(this.gridSize>160) this.gridSize = 160;
    }
    movePointVerticaly(point, up) {
        let xChange = this.gridSize / 2 * Math.sin((90 - 360 / this.symmetryCount) * (Math.PI / 180));
        let yChange = this.gridSize / 2 * Math.sin(360 / this.symmetryCount * (Math.PI / 180));
        if (up)
            yChange *= -1;
        point[0] += xChange;
        point[1] += yChange;
        return point;
    }
    inputToGrid(x, y) {
        let point = [this.originX, this.originY];
        let yChange = this.gridSize / 2 * Math.sin(360 / this.symmetryCount * (Math.PI / 180));
        // calculates y distance from origin
        let distanceY = y - point[1];
        // Determines required movement direction
        let movePointUp = false;
        if (distanceY < 0) movePointUp = true;
        // calculates the needed move count
        distanceY = Math.abs(distanceY);
        let numberOfMovesNeededY = parseInt(distanceY / yChange);
        if ((distanceY % yChange) > yChange / 2) numberOfMovesNeededY++;
        // moves point vertically
        if (numberOfMovesNeededY > 0) {
            for (let a = 0; a < numberOfMovesNeededY; a++) {
                point = this.movePointVerticaly(point, movePointUp);
            }
        }
        // move point horizontaly
        let distanceX = x - point[0];
        if (numberOfMovesNeededY > 0) distanceX = x - point[0];
        let xRight = false;
        if (distanceX > 0) xRight = true;
        distanceX = Math.abs(distanceX);
        let numberOfMovesNeededX = parseInt(distanceX / (this.gridSize / 2));
        if (numberOfMovesNeededX > 0) {
            if (xRight)
                point[0] += this.gridSize / 2 * numberOfMovesNeededX;
            else
                point[0] -= this.gridSize / 2 * numberOfMovesNeededX;
        }
        point = this.closestPoint(point[0], point[1], x, y, true);
        this.deb.move(point[0] - 5, point[1] - 5);
        return point;
    }
    closestPoint(oX, oY, mX, mY, acceptGiven) {
        // Even with a 3 fold symmetry we want to be able to snap to 60% angles
        let pointCount = this.symmetryCount;
        if (pointCount === 3) pointCount = 6;
        // calculates all possible point around a circle
        let circularPoints = Array();
        for (let a = 0; a < pointCount; a++) {
            let angle = a * (360 / pointCount);
            let y = this.gridSize / 2 * Math.sin(angle * (Math.PI / 180));
            let x = this.gridSize / 2 * Math.sin((90 - angle) * (Math.PI / 180));
            x += oX;
            y += oY;
            circularPoints.push([x, y]);
        }
        // finds the nearest point
        let nearestPoint;
        if (acceptGiven) circularPoints.push([oX, oY]);
        for (let a = 0; a < circularPoints.length; a++) {
            let p = circularPoints[a];
            if (nearestPoint === undefined)
                nearestPoint = [p[0], p[1]];
            else if (getDistance(nearestPoint[0], nearestPoint[1], mX, mY) > getDistance(p[0], p[1], mX, mY)) {
                nearestPoint = [p[0], p[1]];
            }
        }
        return nearestPoint;
    }
}
export class GridVisualise extends Grid {
    constructor(canvas, draw) {
        super(canvas, draw);
        this.gridGroup; // svg group containing grid points 
        this.gridPoints = Array();
        this.createGrid();
    }
    // TODO: Optimize! This creates dublicate points at every second row and is slow as hell
    createGrid() {
        var group = this.draw.group()
        this.gridPoints = [];
        // calculates X-Y distances of the grid
        let xChange = this.gridSize / 2 * Math.sin((90 - 360 / this.symmetryCount) * (Math.PI / 180));
        let yChange = this.gridSize / 2 * Math.sin(360 / this.symmetryCount * (Math.PI / 180));
        let gridStart = this.inputToGrid(0, 0);
        let curX = gridStart[0];
        let curY = gridStart[1];
        let curRow = 0;
        do {
            do {
                group.add(this.draw.circle(2).move(curX - 1, curY - 1).fill("none").stroke({ width: 1, color: "#969696" }))
                curX += xChange * 2;
            }
            while (curX < this.width)
            curRow++;
            let nxtRow = this.inputToGrid(0, yChange / 2 * curRow)
            curY = nxtRow[1];
            curX = nxtRow[0]
        }
        while (curY < this.height)
        this.gridGroup = group.addClass("Gridgroup");
    }
    scaleGridDown() {
        this.gridSize = this.gridSize / 2;
        this.createGrid();
    }
    scaleGridUp() {
        this.gridSize = this.gridSize * 2
        this.createGrid();
    }
}
export class Drawable extends Grid {
    constructor(canvas, draw) {
        super(canvas, draw);
        this.symmetryCount = 3;
        this.oldSymmetries = new Array();
        this.newSymmetries = new Array();
        this.previousPoint = [this.originX, this.originY];
        this.lineWidth = 2;
        this.drawing = false;
    }
    setNewSymmetryLevel(newSymmetryLevel) {
        this.symmetryCount = newSymmetryLevel;
    }
    scaleLineUp() {
        this.lineWidth++;
    }
    scaleLineDown() {
        this.lineWidth--;
    }
    setSymmetryCount(newSymmetryCount) {
        this.symmetryCount = newSymmetryCount;
    }
    // Undoes previously added point
    // TODO: This removes points from paths, but leaves the empty path element in the dom
    undoPrevious() {
        // Only allows undoing when not actively drawing
        if (this.newSymmetries.length === 0) {
            if (this.oldSymmetries.length != 0) {
                let symCount = this.oldSymmetries[this.oldSymmetries.length - 1].length;
                // Removes last point from all symmetrylines
                for (let a = 0; a < symCount; a++) {
                    let path = this.oldSymmetries[this.oldSymmetries.length - 1][a];
                    path.removeSegment(path.getSegmentCount() - 1);
                }
                let lenghtLeft = this.oldSymmetries[this.oldSymmetries.length - 1][0].getSegmentCount();
                // Removes the line from the array if there are no more points left to undo
                if (lenghtLeft <= 1)
                    this.oldSymmetries.pop();
            }
        }
    }
}
export class LineTool extends Drawable {
    constructor(canvas, draw) {
        super(canvas, draw);
        this.group = draw.group().addClass("Lines");
    }
    startNewLine(x, y) {
        for (let a = 0; a < this.symmetryCount; a++) {
            let newLine = this.draw.path().fill('none').stroke({ color: 'black', width: this.lineWidth, linecap: 'round' });
            let rotPos = rotateAroundPoint(this.originX, this.originY, x, y, 360 / this.symmetryCount * a)
            newLine.M(rotPos[0], rotPos[1]).click(function () {
                console.log("!!!!!")
            })
            this.newSymmetries.push(newLine)
        }
    }
    drawLine(mX, mY) {
        let pos = this.closestPoint(this.previousPoint[0], this.previousPoint[1], mX, mY, false);
        for (let i = 0; i < this.newSymmetries.length; i++) {
            let rotPos = rotateAroundPoint(this.originX, this.originY, pos[0], pos[1], 360 / this.symmetryCount * i)
            this.newSymmetries[i].L(rotPos[0], rotPos[1]);
        }
        this.previousPoint = pos;
        for (let a = 0; a < this.newSymmetries.length; a++) {
            this.group.add(this.newSymmetries[a]);
        }
    }
    toolDown(mX, mY) {
        this.drawing = true;
        this.previousPoint = this.inputToGrid(mX, mY, this.originX, this.originY);
        this.startNewLine(this.previousPoint[0], this.previousPoint[1]);
    }
    toolUp() {
        this.drawing = false;
        // save and clear
        this.oldSymmetries.push(this.newSymmetries);
        this.newSymmetries = []
    }
    toolMove(mX, mY) {
        var curPoint = this.inputToGrid(mX, mY, this.originX, this.originY);
        if (this.drawing)
            if (this.previousPoint[0] != curPoint[0] || this.previousPoint[1] != curPoint[1])
                this.drawLine(curPoint[0], curPoint[1], true);
    }
}

export class ArchTool extends Drawable {
    constructor(canvas, draw) {
        super(canvas, draw);
        this.curArc = this.draw.path();
        this.tempArchs = Array();
        this.previousArchs = Array()
        this.archStart;
        this.group = draw.group().addClass("Arches");
    }
    toolDown(mX, mY) {
        this.drawing = true;
        this.archStart = this.inputToGrid(mX, mY);
        this.previousPoint = this.archStart;
    }
    toolMove(mX, mY) {
        let curPoint = this.inputToGrid(mX, mY);
        if (this.drawing) {
            let distance = getDistance(this.archStart[0], this.archStart[1], curPoint[0], curPoint[1]);
            // If cursor moved to next grid point
            if (Math.round(this.previousPoint[0]) != Math.round(curPoint[0]) || Math.round(this.previousPoint[1]) != Math.round(curPoint[1])) {
                // Removes old temp archs
                this.tempArchs.forEach(function name(params) {
                    params.remove();
                });
                this.tempArchs = []
                // Creates symmetry archs
                for (let a = 0; a < this.symmetryCount; a++) {
                    let rotStart = rotateAroundPoint(this.originX, this.originY, this.archStart[0], this.archStart[1], 360 / this.symmetryCount * a)
                    let rotPos = rotateAroundPoint(this.originX, this.originY, curPoint[0], curPoint[1], 360 / this.symmetryCount * a)
                    this.tempArchs.push(this.draw.path().fill("none").stroke({ width: 2, color: "black" })
                        .M({ x: rotStart[0], y: rotStart[1] })
                        .A(distance / 2, distance / 2, 0, 0, 0, { x: rotPos[0], y: rotPos[1] }));
                }
                this.previousPoint = curPoint;
            }
        }
    }
    toolUp() {
        this.drawing = false;
        // adds the previously drawn archs to a group
        let tmpGroup = this.draw.group().addClass("NewArc")
        for (let a = 0; a < this.tempArchs.length; a++) {
            //  this.group.add(this.tempArchs[a].svg());
            tmpGroup.add(this.tempArchs[a].svg());
        }
        this.group.add(tmpGroup);
        // Removes old temp archs
        this.tempArchs.forEach(function name(params) {
            params.remove();
        });
    }
    undo() {
        let previous = $('.NewArc').length;
        $('.NewArc')[previous - 1].remove();
    }
}

export class Tool {
    constructor(canvas, draw) {
        this.canvas = canvas;
        this.draw = draw;
        this.lineTool = new LineTool(canvas, draw, this.symbol);
        this.archTool = new ArchTool(canvas, draw);
        this.activeTool = "LINE"
        // Arrays used to cycle through different symmetry levels
        this.symmetryLevels =  [3,6];
        this.activeSymmetry = 1;
    }
    changeSymmetryLevels() {
        this.symmetryLevels.unshift(this.symmetryLevels.pop());
        this.activeSymmetry = this.symmetryLevels[0];
        this.lineTool.setNewSymmetryLevel(this.activeSymmetry)
        this.archTool.setNewSymmetryLevel(this.activeSymmetry)
    } 
    setActiveTool(activeTool) {
        this.activeTool = activeTool;
    }
    scaleGridUp() {
        this.lineTool.scaleGridUp();
        this.archTool.scaleGridUp();
    }
    scaleGridDown() {
        this.lineTool.scaleGridDown();
        this.archTool.scaleGridDown();
    }
    scaleLineUp() {
        this.lineTool.scaleLineUp();
        this.archTool.scaleLineUp();
    }
    scaleLineDown() {
        this.lineTool.scaleLineDown();
        this.archTool.scaleLineDown();
    }
    setLineWidth(lineWidth) {
        this.lineTool.setLineWidth(lineWidth);
        this.archTool.setLineWidth(lineWidth);
    }
    toolDown(mX, mY) {
        if (this.activeTool === "LINE")
            this.lineTool.toolDown(mX, mY);
        if (this.activeTool === "ARCH")
            this.archTool.toolDown(mX, mY);
    }
    toolMove(mX, mY) {

        if (this.activeTool === "LINE")
            this.lineTool.toolMove(mX, mY);
        if (this.activeTool === "ARCH")
            this.archTool.toolMove(mX, mY);
    }
    toolUp() {
        if (this.activeTool === "LINE")
            this.lineTool.toolUp();
        if (this.activeTool === "ARCH")
            this.archTool.toolUp();
    }
    undoPrevious() {
        if (this.activeTool === "LINE")
            this.lineTool.undoPrevious();
        if (this.activeTool === "ARCH")
            this.archTool.undo();
    }
}
export function rotateAroundPoint(oX, oY, x, y, angle) {
    let radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - oX)) + (sin * (y - oY)) + oX,
        ny = (cos * (y - oY)) - (sin * (x - oX)) + oY;
    return [nx, ny];
}
function getDistance(xA, yA, xB, yB) {
    let xDiff = xA - xB;
    let yDiff = yA - yB;

    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
}
