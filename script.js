const canvas = document.getElementById("canvas");
canvas.width = 700;
canvas.height = 600;
const ctx = canvas.getContext("2d");
let board = [];

const xOffset = 30;
const yOffset = 30;
const interval = 50;
const pieceSize = 40;

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

const getCanvasPos = (x, y) => [xOffset + x * interval, yOffset + y * interval];
const getName = (id) => types[Math.abs(id) - 1];

function renderBoard(board, lang) {
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.beginPath();

	// Draw grid
	for (let i = 0; i < 10; i++) {
		let pos1 = getCanvasPos(0, i);
		let pos2 = getCanvasPos(8, i);
		ctx.moveTo(pos1[0], pos1[1]);
		ctx.lineTo(pos2[0], pos2[1])
	}
	// Draw grid but without river.
	for (let i = 0; i < 9; i++) {
		let pos1 = getCanvasPos(i, 0);
		let pos4 = getCanvasPos(i, 9);
		if (i === 0 || i === 8) {
			ctx.moveTo(pos1[0], pos1[1]);
			ctx.lineTo(pos4[0], pos4[1]);
			continue;
		}
		let pos2 = getCanvasPos(i, 4);
		let pos3 = getCanvasPos(i, 5);
		ctx.moveTo(pos1[0], pos1[1]);
		ctx.lineTo(pos2[0], pos2[1]);
		ctx.moveTo(pos3[0], pos3[1]);
		ctx.lineTo(pos4[0], pos4[1]);
	}
	// Draw palace
	let lines = [
		[[3,0],[5,2]],
		[[3,2],[5,0]],
		[[3,7],[5,9]],
		[[3,9],[5,7]],
	];
	lines.forEach(line => {
		let pos1 = getCanvasPos(line[0][0], line[0][1]);
		let pos2 = getCanvasPos(line[1][0], line[1][1]);
		ctx.moveTo(pos1[0], pos1[1]);
		ctx.lineTo(pos2[0], pos2[1]);
	});
	
	ctx.stroke();
	// Draw pieces
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