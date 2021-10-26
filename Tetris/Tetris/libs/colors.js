// Class that contains color data that can be edited
class Color{
    r;
    g;
    b;
    constructor(r, g, b){
        this.r = r;
        this.g = g;
        this.b = b;
    }

    returnRGB(){
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    }
}