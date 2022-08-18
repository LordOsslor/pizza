//globals
let pizzaDict = {};
let idIndex = 0;

const pizzaBaseColor = "#875827";
const pizzaBorderColor = "#000000";
const cheeseColor = "#f5d976";
const salamiColor = "#953144";

const margin = 5;
const salamiSize = 1;

const tlt = {
    deletePizza: "Pizza löschen",
    price: "Preis",
    crust: "Rand",
    toppingArea: "Belagfläche",
    pricePerToppingArea: "Preis pro Belagfläche",
    totalArea: "Gesamtfläche",
    crustArea: "Randfläche",
    roundPizza: "Runde Pizza",
    diameter: "Durchmesser",
    squarePizza: "Rechteckige Pizza",
    sideA: "Seite A",
    sideB: "Seite B"
}

//#region Common Pizza Functions
function createElement(type, parent, params = {}) {
    var element = document.createElement(type);
    parent.appendChild(element);

    if ("classes" in params) {
        var classes = params["classes"];
        if (typeof classes === 'string' || classes instanceof String) {
            element.classList.add(classes);
        }
        else {
            classes.forEach(cls => {
                element.classList.add(cls);
            });
        }
    }
    if ("attributes" in params) {
        var attributes = params["attributes"]
        Object.keys(attributes).forEach(attribute => {
            element.setAttribute(attribute, attributes[attribute]);
        });
    }
    if ("text" in params) {
        element.appendChild(document.createTextNode(params["text"]));
    }

    return element;
}
function clampNumberInput(input, min, max) {
    var pValue = input.value;
    if (!pValue) return NaN;
    var nValue = ((pValue < min) ? min : (max < min) ? pValue : (pValue > max) ? max : pValue)
    if (pValue != nValue) input.value = nValue;
    return nValue;
}
function updateOutput(output, value) {
    output.textContent = value.toFixed(2);
}
function plotCircle(ctx, cx, cy, rC, style) {
    ctx.beginPath();
    ctx.arc(cx, cy, rC, 0, 2 * Math.PI);
    ctx.fillStyle = style;
    ctx.fill();
    ctx.closePath();
}
//#endregion



//#region pizza Declarations
class Pizza {
    //non Functional Base Pizza
    constructor(id, name) {
        this.id = id;
        this.name = name;
        console.log("Creating Pizza \"" + this.name + "\" with id: " + this.id);

        //create Base Element
        this.pizzaElement = createElement("div", document.getElementById("pizzaSpace"), {
            classes: ["pizza"]
        });

        //create Header
        createElement("h1", this.pizzaElement, {
            classes: ["pizzaHeader"],
            text: name
        });

        //create Input Form
        this.iForm = createElement("form", this.pizzaElement, {
            classes: ["input"],
            attributes: {
                oninput: "updatePizza(" + id + ")"
            }
        });

        //create Delete Button
        createElement("button", this.pizzaElement, {
            classes: ["delete"],
            attributes: {
                onclick: "deletePizza(" + id + ")"
            },
            text: tlt["deletePizza"]
        });

        //create Common Inputs
        this.iPrice = this.createNumberInput("price", tlt["price"], "€", 10);
        this.iCrust = this.createNumberInput("crust", tlt["crust"], "cm", 1);

        //create Output Div
        this.oDiv = createElement("div", this.pizzaElement, { classes: ["output"] })

        //create Output Details
        this.oDetails = document.createElement("details")
        this.oDetails.classList.add("outputDetails");

        //create Common Outputs
        this.oToppingArea = this.createNumberOutput(tlt["toppingArea"], "cm²");
        this.oToppingPPA = this.createNumberOutput(tlt["pricePerToppingArea"], "ct/cm²")

        //create Common Detail Outputs
        this.oTotalArea = this.createNumberOutput(tlt["totalArea"], "cm²", true);
        this.oCrustArea = this.createNumberOutput(tlt["crustArea"], "cm²", true);

        //append The Detail List At The End
        this.oDiv.appendChild(this.oDetails);

        //create Pizza Display
        this.cSize = [250, 250]
        this.oDisplay = createElement("canvas", this.oDiv, {
            classes: ["display"],
            attributes: {
                width: this.cSize[0],
                height: this.cSize[1]
            }
        });
    }
    createNumberInput(inputName, labelText, unitText, defaultValue) {
        //create A Label
        createElement("label", this.iForm, {
            classes: ["inputLabel"],
            attributes: {
                for: inputName
            },
            text: labelText.concat(": ")
        });

        //create The Number Input
        var input = createElement("input", this.iForm, {
            classes: ["numberInput"],
            attributes: {
                type: "number",
                name: inputName,
                value: defaultValue
            }
        });

        //create The Unit Label
        createElement("label", this.iForm, {
            classes: ["unitLabel"],
            attributes: {
                for: inputName
            },
            text: unitText
        });

        //add Line Break
        createElement("br", this.iForm);

        return input;
    }
    createNumberOutput(labelText, unitText, detail) {
        var parentElement = detail ? this.oDetails : this.oDiv;

        //create A Label
        createElement("span", parentElement, {
            classes: "outputLabel",
            text: labelText.concat(": ")
        });

        //create The Number Output
        var output = createElement("span", parentElement, {
            classes: ["numberOutput"],
            text: 0
        });

        //create The Unit Label
        createElement("label", parentElement, {
            classes: ["unitLabel"],
            text: unitText
        });

        //add Line Break
        createElement("br", parentElement);

        return output;
    }

    delete() {
        console.log("Deleting Pizza \"" + this.name + "\" with id: " + this.id);
        this.pizzaElement.remove();
    }
    updateDisplay() { }
    update() {
        console.log("Updating Pizza \"" + this.name + "\" with id: " + this.id);
        updateOutput(this.oToppingArea, this.toppingArea);
        updateOutput(this.oToppingPPA, this.price / this.toppingArea * 100);

        updateOutput(this.oTotalArea, this.totalArea);
        updateOutput(this.oCrustArea, this.crustArea);

        //clear Display And Update It
        var ctx = this.oDisplay.getContext("2d");
        ctx.clearRect(0, 0, ...this.cSize);
        this.updateDisplay(ctx);
    }

    get price() {
        return clampNumberInput(this.iPrice, 0, -1);
    }
    get crust() { }
    get totalArea() { }
    get toppingArea() { }
    get crustArea() { }
}
class RoundPizza extends Pizza {
    constructor(id, name) {
        super(id, (name != "") ? name : tlt["roundPizza"]);
        this.iDiameter = this.createNumberInput("diameter", tlt["diameter"], "cm", 20);
    }

    get crust() {
        return clampNumberInput(this.iCrust, 0.1, this.radius / 2);
    }
    get radius() {
        return clampNumberInput(this.iDiameter, 1, 0) / 2;
    }
    get totalArea() {
        return Math.PI * this.radius ** 2;
    }
    get toppingArea() {
        return Math.PI * (this.radius - this.crust) ** 2;
    }
    get crustArea() {
        return this.totalArea - this.toppingArea;
    }



    populateTopping(ctx, cx, cy, rT, scale) {

        var salamiRadius = salamiSize * scale;

        //arbitrary Values
        var alpha = 2;
        var n = Math.round(rT ** 1.6 / (salamiRadius ** 1.9));


        //sunflower Distribution
        var b = Math.round(alpha * Math.sqrt(n));
        var phi = (Math.sqrt(5) + 1) / 2;

        function calcPolarRadius(k, n, b) {
            if (k > n - b) {
                return 1;
            }
            else {
                return Math.sqrt(k - 1 / 2) / Math.sqrt(n - (b + 1) / 2);
            }
        }

        for (let k = 1; k < n; k++) {
            var r = calcPolarRadius(k, n, b);
            var theta = 2 * Math.PI * k / phi ** 2;
            var x = cx + (rT - 2 * salamiRadius) * (r * Math.cos(theta));
            var y = cy + (rT - 2 * salamiRadius) * (r * Math.sin(theta));

            //plot Calculated Salami Position
            plotCircle(ctx, x, y, salamiRadius, salamiColor);
        }
    }
    updateDisplay(ctx) {
        //canvas Center
        var centerX = this.cSize[0] / 2;
        var centerY = this.cSize[1] / 2;

        //radii
        var baseRadius = Math.min(centerX, centerY) - 2 * margin;
        var toppingRadius = baseRadius * ((this.radius - this.crust) / this.radius);

        //scale In px/cm
        var scale = baseRadius / this.radius;

        //draw Pizza Base
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius, 0, 2 * Math.PI);
        ctx.fillStyle = pizzaBaseColor;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = pizzaBorderColor
        ctx.stroke();
        ctx.closePath();

        //draw Pizza Topping
        plotCircle(ctx, centerX, centerY, toppingRadius, cheeseColor);

        this.populateTopping(ctx, centerX, centerY, toppingRadius, scale, 2);
    }
}
class RectangularPizza extends Pizza {
    constructor(id, name) {
        super(id, (name != "") ? name : tlt["squarePizza"]);
        this.iA = this.createNumberInput("a", tlt["sideA"], "cm", "20");
        this.iB = this.createNumberInput("b", tlt["sideB"], "cm", "16");

        this.tPos = [];
    }

    get a() {
        return clampNumberInput(this.iA, 1, -1);
    }
    get b() {
        return clampNumberInput(this.iB, 1, -1);
    }
    get crust() {
        return clampNumberInput(this.iCrust, 0, Math.min(this.a, this.b) / 2 - 0.1);
    }

    get totalArea() {
        return this.a * this.b;
    }
    get crustArea() {
        return 2 * (this.a - this.crust) * this.crust + 2 * (this.b - this.crust) * this.crust;
    }
    get toppingArea() {
        return (this.a - 2 * this.crust) * (this.b - 2 * this.crust)
    }

    populateTopping(ctx, originX, originY, x, y, scale) {
        //1cm Salami
        var salamiRadius = salamiSize * scale;
        var boundingSize = 3 * salamiRadius;

        //salami Count
        var countX = Math.floor(x / boundingSize);
        var countY = Math.floor(y / boundingSize);

        //grid Size
        var sizeX = x / countX;
        var sizeY = y / countY;

        for (let ix = 0; ix < countX; ix++) {
            for (let iy = 0; iy < countY; iy++) {
                //top Left Grid Corners
                var cornerX = originX + ix * sizeX;
                var cornerY = originY + iy * sizeY;

                //random Number Between (start + dist) and (start + range - dist); Dist Is Padding
                function rnd(start, range, dist) {
                    return start + dist + Math.random() * (range - 2 * dist);
                }

                //draw Salami
                plotCircle(
                    ctx,
                    rnd(cornerX, sizeX, 1.1 * salamiRadius),
                    rnd(cornerY, sizeY, 1.1 * salamiRadius),
                    salamiRadius,
                    salamiColor
                );
            }

        }
    }

    updateDisplay(ctx) {
        //centers
        var cx = this.cSize[0] / 2;
        var cy = this.cSize[1] / 2;

        //dimension Sizes
        var sx = this.cSize[0] - 2 * margin;
        var sy = this.cSize[1] - 2 * margin;

        //assign Dimensions
        var x = this.a;
        var y = this.b;

        //scale
        var scale = Math.min(sx / x, sy / y);

        //scale Dimensions
        x = scale * x;
        y = scale * y;

        //draw Pizza Base
        ctx.beginPath();
        ctx.rect(cx - x / 2, cy - y / 2, x, y);
        ctx.fillStyle = pizzaBaseColor;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = pizzaBorderColor;
        ctx.stroke();
        ctx.closePath();

        //draw Cheese
        x = x - scale * 2 * this.crust;
        y = y - scale * 2 * this.crust;
        var ox = cx - x / 2;
        var oy = cy - y / 2;
        ctx.beginPath();
        ctx.rect(ox, oy, x, y);
        ctx.fillStyle = cheeseColor;
        ctx.fill();
        ctx.closePath();

        this.populateTopping(ctx, ox, oy, x, y, scale);
    }
}
//#endregion



//#region Pizza Creation
function createPizza() {
    var pizzaType = document.getElementById("pizzaType").value;
    var pizzaName = document.getElementById("pizzaName").value;
    switch (pizzaType) {
        case "round":
            pizzaDict[idIndex] = new RoundPizza(idIndex, pizzaName);
            break;
        case "rectangular":
            pizzaDict[idIndex] = new RectangularPizza(idIndex, pizzaName);
            break;
        default:
            break;
    }
    pizzaDict[idIndex].update();
    document.getElementById("pizzaName").value = "";
    idIndex += 1;
}
function deletePizza(id) {
    pizzaDict[id].delete();
    delete pizzaDict[id];
}
function updatePizza(id) {
    pizzaDict[id].update();
}
//#endregion