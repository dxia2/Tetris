
const COLUMNS = 10;
const ROWS = 20;
const BLOCKSIZE = 20;
const BLOCKSIZESHADE = 15;
//["aqua", "blue", "orange", "yellow", "green", "magenta", "red"];
const COLORS = [new Color(0, 255, 255), new Color(0, 0, 255), new Color(255, 165, 0), new Color(255, 255, 0), new Color(0, 128, 0), new Color(255, 0, 255), new Color(255, 0, 0)];
const PIECESMAXSIZE = 4;
// the amount of score gained which is multip;lied by level
const SCORELEVELMULTIPLIER = 5;
// Every level up the threshold to level up is increased by 30
const SCORELEVELINCREMENT = 30;
const DROPSPEEDINCREASEPERLEVEL = 0.1;
const MINDROPSPEED = 0.1;
const STARTPIECEDROPDELAY = 1;