/*
Empty = 0
Soldier = 1
Cannon = 2
Chariot = 3
Horse = 4
Elephant = 5
Advisor = 6
General = 7

Red = +
Black = -

*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
let board = [];

const xOffset = 50;
const yOffset = 50;
const interval = 30;
const pieceSize = 30;

ctx.lineWidth = 2;
ctx.fillStyle = "#ede995";
let images = {};

const types = ["soldier", "cannon", "chariot", "horse", "elephant", "advisor", "general"];
const colors = ["r", "b"];
const langs = ["en", "ch"];

async function loadImages() {
	langs.forEach(lang => {
		images[lang] = {};
		types.forEach(type => {
			images[lang][type] = {};
			colors.forEach(color => {
				images[lang][type][color] = new Image();
				images[lang][type][color].src = `assets/pieces/${lang}_${type}_${color}.png`;
			});
		});
	});
}
loadImages();

function resetBoard() {
	board = [
		[-3,-4,-5,-6,-7,-6,-5,-4,-3],
		[0,0,0,0,0,0,0,0,0],
		[0,-2,0,0,0,0,0,-2,0],
		[-1,0,-1,0,-1,0,-1,0,-1],
		[0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0],
		[1,0,1,0,1,0,1,0,1],
		[0,2,0,0,0,0,0,2,0],
		[0,0,0,0,0,0,0,0,0],
		[3,4,5,6,7,6,5,4,3],
	];
}
resetBoard();

function getCanvasPos(x, y) {
	let resX = xOffset + x * interval;
	let resY = yOffset + y * interval;
	if (y > 4) { resY += interval; }
	return [resX, resY];
}
function getName(id) {
	return types[Math.abs(id) - 1];
}
function renderBoard(board, lang) {
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();
	
	for (let i = 0; i < 10; i++) {
		let pos1 = getCanvasPos(0, i);
		let pos2 = getCanvasPos(8, i);
		ctx.moveTo(pos1[0], pos1[1]);
		ctx.lineTo(pos2[0], pos2[1])
	}
	for (let i = 0; i < 9; i++) {
		let pos1 = getCanvasPos(i, 0);
		let pos2 = getCanvasPos(i, 9);
		ctx.moveTo(pos1[0], pos1[1]);
		ctx.lineTo(pos2[0], pos2[1]);
	}
	let pos1 = getCanvasPos(3, 0);
	let pos2 = getCanvasPos(5, 2);
	let pos3 = getCanvasPos(3, 2);
	let pos4 = getCanvasPos(5, 0);
	let pos5 = getCanvasPos(3, 7);
	let pos6 = getCanvasPos(5, 9);
	let pos7 = getCanvasPos(3, 9);
	let pos8 = getCanvasPos(5, 7);
	ctx.moveTo(pos1[0], pos1[1]);
	ctx.lineTo(pos2[0], pos2[1]);
	ctx.moveTo(pos3[0], pos3[1]);
	ctx.lineTo(pos4[0], pos4[1]);
	ctx.moveTo(pos5[0], pos5[1]);
	ctx.lineTo(pos6[0], pos6[1]);
	ctx.moveTo(pos7[0], pos7[1]);
	ctx.lineTo(pos8[0], pos8[1]);
	
	ctx.stroke();
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 9; j++) {
			let piece = board[i][j];
			if (piece === 0) { continue; }
			
			let pos = getCanvasPos(j, i);
			let img = images[lang][getName(piece)][piece > 0 ? "r" : "b"];
			
			img.addEventListener("load", () => {
				ctx.drawImage(
					img,
						pos[0] - pieceSize/2,
					pos[1] - pieceSize/2,
					pieceSize,
					pieceSize
				);
			});
		}
	}
}

renderBoard(board, "ch");