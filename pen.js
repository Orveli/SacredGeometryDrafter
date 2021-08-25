class Grid {
    constructor(canvas, draw) {
        this.canvas = canvas;
        this.draw = draw;
        this.width = this.canvas.width();
        this.height = this.canvas.height();
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        this.gridSize = 40;
        this.deb = this.draw.circle(10).move(this.originX - 5, this.originY - 5);
    }


    scaleGridDown() {
        this.gridSize = this.gridSize / 2;
    }
    scaleGridUp() {
        this.gridSize = this.gridSize * 2
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

        // Even with a 3 fold symmetry we want to be able to snap to 60% angles so thats why symmetryCount is not always used as such
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

export class Drawable extends Grid {
    constructor(canvas, draw) {
        super(canvas, draw);
        this.symmetryCount = 3;
        this.oldSymmetries = new Array();
        this.newSymmetries = new Array();

        this.previousPoint = [this.originX, this.originY];
        this.lineWidth = 3;

        this.symbol = this.draw.symbol();
        this.fractalSymmetryCount = 3;
        this.symbolList = Array()
        this.fractalOffset = 200;

        this.createSymmetrySymbols();
        this.oldSymbols = Array();
    }

    newDrawing() {
        console.log("!")
         this.oldSymbols.push(this.symbolList);
    

        this.symbolSave = this.draw.symbol();
        for (let a = 0; a < this.oldSymmetries.length; a++) {
            for (let b = 0; b < this.oldSymmetries[a].length; b++) {
                this.symbolSave.add(this.oldSymmetries[a][b]);
       //         console.log("NOT",this.oldSymmetries[a][b])
            }
        }
        this.createSymmetrySymbols(this.symbolSave,true);
        this.createSymmetrySymbols();
    }
    createSymmetrySymbols(symbolToUse, ignoreSave) {
        if(symbolToUse===undefined) symbolToUse = this.symbol;
        for (let a = 0; a < this.symbolList.length; a++) {
            this.symbolList[a].remove();
        }
        this.symbolList = []
        for (let a = 0; a < this.fractalSymmetryCount; a++) {
            let rotPos = rotateAroundPoint(this.originX, this.originY, this.originX, this.originY - this.fractalOffset, 360 / this.fractalSymmetryCount * a)
            rotPos = this.inputToGrid(rotPos[0], rotPos[1])

            let diffX = rotPos[0] - this.originX;
            let diffY = rotPos[1] - this.originY;
            let symb = this.draw.use(symbolToUse).move(diffX, diffY)
            if(!ignoreSave) this.symbolList.push(symb);
        }
        let symb = this.draw.use(symbolToUse).move(0, 0)
        if(!ignoreSave) this.symbolList.push(symb);
    }

    setNewFractalOffset(fractalOffset) {
        this.fractalOffset = fractalOffset;
        this.createSymmetrySymbols();
    }

    setNewFractalSymmetryLevel(newSymmetryLevel) {
        this.fractalSymmetryCount = newSymmetryLevel;
        this.createSymmetrySymbols();
        console.log(newSymmetryLevel, this.fractalSymmetryCount);
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
    setFractalSymmetryCount(newSymmetryCount) {
        this.fractalSymmetryCount = newSymmetryCount;
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
        this.drawing = false;

    }


    startNewLine(x, y) {
        for (let a = 0; a < this.symmetryCount; a++) {
            let newLine = this.draw.path().fill('none').stroke({ color: 'black', width: this.lineWidth, linecap: 'round' });
            let rotPos = rotateAroundPoint(this.originX, this.originY, x, y, 360 / this.symmetryCount * a)
            newLine.M(rotPos[0], rotPos[1])
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
            this.symbol.add(this.newSymmetries[a]);
        }
    }

    toolDown(mX, mY) {
        this.drawing = true;
        this.previousPoint = this.inputToGrid(mX, mY, this.originX, this.originY);
        this.startNewLine(this.previousPoint[0], this.previousPoint[1]);

        for (let a = 0; a < this.newSymmetries.length; a++) {

            this.symbol.add(this.newSymmetries[a]);
        }
    }
    toolUp() {
        this.drawing = false;
        // save and clear

        this.oldSymmetries.push(this.newSymmetries);
        this.newSymmetries = []
    }
    toolMove(mX, mY) {
        var curPoint = this.inputToGrid(mX, mY, this.originX, this.originY);
        if (this.drawing) {
            if (this.previousPoint[0] === curPoint[0] && this.previousPoint[1] === curPoint[1]) {

            }
            else {
                this.drawLine(mX, mY, true); // curPoint in stead??
                console.log("NEW LINE")
            }
            let delta = getDistance(this.previousPoint[0], this.previousPoint[1], mX, mY);
            if (delta >= this.gridSize / 2) {


            }

        }
    }

}

export class CircleTool extends Grid {
    constructor(canvas, draw) {
        super(canvas, draw);
        this.circleStart = [0, 0];
        this.drawing = false;
        //  this.circle = this.draw.circle(this.gridSize).fill('none').stroke({ color: '#282D6A', width: 2 });

        this.symbol = this.draw.symbol();
        this.symmetryCount = 6;
        this.dtravellDistance = 0;
        this.newSymmetries = Array()

    }

    /*     startNewCircle(x, y) {
    
            let allignedPos = this.inputToGrid(x, y, this.originX, this.originY);
    
            for (let a = 0; a < this.symmetryCount; a++) {
                let newCircle = this.draw.circle(this.gridSize).fill('none').stroke({ color: '#282D6A', width: 2 });
                let rotPos = rotateAroundPoint(this.originX, this.originY, allignedPos[0], allignedPos[1], 360 / this.symmetryCount * a)
                newCircle.move(rotPos[0] - this.gridSize / 2, rotPos[1] - this.gridSize)
                this.newSymmetries.push(newCircle)
    
            }
        } */

    toolDown(mX, mY) {
        this.circleStart = [mX, mY];
        this.drawing = true;
        //  th is.startNewCircle();
        //this.circle.circle(this.gridSize).fill('none').stroke({ color: '#282D6A', width: 2 });
        let mouseInGrid = this.inputToGrid(mX, mY, this.originX, this.originY);

        if (mouseInGrid[0] == this.originX && mouseInGrid[1] == this.originY) {
            let newCircle2 = this.draw.circle(this.gridSize).fill('none')
                .stroke({ color: '#282D6A', width: 2 }).move(mouseInGrid[0] - this.gridSize / 2, mouseInGrid[1] - this.gridSize / 2);

        }
        else {
            for (let a = 0; a < this.symmetryCount; a++) {
                let rotPos = rotateAroundPoint(this.originX, this.originY, mouseInGrid[0], mouseInGrid[1], 360 / this.symmetryCount * a)
                let newCircle = this.draw.circle(this.gridSize).fill('none').stroke({ color: '#282D6A', width: 2 }).move(rotPos[0] - this.gridSize / 2, rotPos[1] - this.gridSize / 2)

            }

        }
    }

    drawSimple() {

    }

    toolMove(mX, mY) {
        this.travellDistance = getDistance(mX, mY, this.circleStart[0], this.circleStart[1]);
        if (this.travellDistance > this.gridSize) {
            let closestPos = this.inputToGrid(mX, mY, this.originX, this.originY);
            let diffX = closestPos[0] - this.circleStart[0];
            let diffY = closestPos[1] - this.circleStart[1];
            let circleCenterX = this.circleStart[0] + diffX;
            let circleCenterY = this.circleStart[1] + diffY;
            // this.circle.move(circleCenterX-this.gridSize/2,circleCenterY-this.gridSize/2)
            //  this.circle.move(500, 500)


        }

    }
    toolUp() {

    }
}
export class ArchTool extends Grid {
    constructor(canvas, draw) {
        super(canvas, draw);
        this.archStart;
        this.drawing = false;
        this.debg = this.draw.circle(10).move(this.originX - 5, this.originY - 5).fill('blue');
        this.symmetryCount = 6;
        this.previousPos;
        this.tempArchs = Array();
    }

    toolDown(mX, mY) {
        this.drawing = true;
        this.archStart = this.inputToGrid(mX, mY);

        this.tempArchs = [];
        for (let a = 0; a < this.symmetryCount; a++) {
            this.tempArchs.push(this.draw);
        }
    }

    toolMove(mX, mY) {
        let curPos = this.inputToGrid(mX, mY);

        if (this.drawing) {
            /*    
               for(let a = 0; a < this.symmetryCount; a++)
               {
                   console.log("!");
                   let rotPos = rotateAroundPoint(this.originX,this.originY,curPos[0],curPos[0], this.symmetryCount/360*a)
                   this.tempArchs[a].circle(10).move(rotPos[0],rotPos[1]).fill('green');
               }
               let delta = getDistance(curPos[0], curPos[1], this.archStart[0], this.archStart[1]);
               console.log(delta); */
        }
        //  if(this.archStart)

    }

    toolUp() {
        this.drawing = false;
    }

}

export class Tool {
    constructor(canvas, draw) {
        this.canvas = canvas;
        this.draw = draw;

        this.lineTool = new LineTool(canvas, draw, this.symbol);
        this.circleTool = new CircleTool(canvas, draw);
        this.archTool = new ArchTool(canvas, draw);

        this.activeTool = "LINE"

        // Arrays used to cycle through different symmetry levels
        this.symmetryLevels = [3, 6];
        this.fractalSymmetryLevels = [3, 6, 0];

        this.activeSymmetry = 3;
        this.activeFractalSymmetry = 3;

    }
    newDrawing() {
        this.lineTool.newDrawing();
    }
    changeFractalOffset(change) {
        this.lineTool.setNewFractalOffset(this.lineTool.fractalOffset + change)
    }
    changeFractalSymmetryLevels() {
        this.fractalSymmetryLevels.unshift(this.fractalSymmetryLevels.pop());
        this.activeFractalSymmetry = this.fractalSymmetryLevels[0];
        this.lineTool.setNewFractalSymmetryLevel(this.activeFractalSymmetry)
    }
    changeSymmetryLevels() {
        this.symmetryLevels.unshift(this.symmetryLevels.pop());
        this.activeSymmetry = this.symmetryLevels[0];
        this.lineTool.setNewSymmetryLevel(this.activeSymmetry)
    }

    setActiveTool(activeTool) {
        this.activeTool = activeTool;
    }
    scaleGridUp() {
        this.lineTool.scaleGridUp();
    }
    scaleGridDown() {
        this.lineTool.scaleGridDown();
    }
    scaleLineUp() {
        this.lineTool.scaleLineUp();
    }
    scaleLineDown() {
        this.lineTool.scaleLineDown();
    }
    setLineWidth(lineWidth) {
        this.lineTool.setLineWidth(lineWidth);
    }
    toolDown(mX, mY) {
        if (this.activeTool === "LINE")
            this.lineTool.toolDown(mX, mY);
        if (this.activeTool === "CIRCLE")
            this.circleTool.toolDown(mX, mY);
        if (this.activeTool === "ARCH")
            this.archTool.toolDown(mX, mY);

    }

    toolMove(mX, mY) {

        if (this.activeTool === "LINE")
            this.lineTool.toolMove(mX, mY);
        if (this.activeTool === "CIRCLE")
            this.circleTool.toolMove(mX, mY);
        if (this.activeTool === "ARCH")
            this.archTool.toolMove(mX, mY);
    }

    toolUp() {
        if (this.activeTool === "LINE")
            this.lineTool.toolUp();
        if (this.activeTool === "CIRCLE")
            this.circleTool.toolUp();
        if (this.activeTool === "ARCH")
            this.archTool.toolUp();
    }

    undoPrevious() {
        this.lineTool.undoPrevious();
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