const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Config constants
canvas.width = 600;
canvas.height = 600;
const xOffset = 70;
const yOffset = 50;
const interval = 50;
const pieceSize = 40;
ctx.lineWidth = 2;
let images = {};

// Game variables
let lang = "ch";
let board = [];
let turn = "r";
let selected = null;

// Game constants
const types = ["soldier", "cannon", "chariot", "horse", "elephant", "advisor", "general"];
const colors = ["r", "b"];
const langs = ["ch", "en"];

const getCanvasPos = (x, y) => [xOffset + x * interval, yOffset + y * interval];
const getName = (id) => types[Math.abs(id) - 1];
const getCol = (id) => id > 0 ? "r" : "b";

function loadImages() {
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

function renderBoard() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#ede995";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	// Draw horizontal lines
	for (let i = 0; i < 10; i++) {
		let pos1 = getCanvasPos(0, i);
		let pos2 = getCanvasPos(8, i);
		ctx.moveTo(pos1[0], pos1[1]);
		ctx.lineTo(pos2[0], pos2[1])
	}
	// Draw vertical lines and river
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
			let img = images[lang][getName(piece)][getCol(piece)];
			const drawPiece = () => {
				ctx.drawImage(
					img,
					pos[0] - pieceSize/2,
					pos[1] - pieceSize/2,
					pieceSize,
					pieceSize
				);
			};
			img.addEventListener("load", drawPiece);
			if (img.complete) { drawPiece(); }
		}
	}
}
function switchLang() {
	lang = (lang == "en") ? "ch" : "en";
	renderBoard();
}

const isAlly = (p1, p2) => p1 !== 0 && p2 !== 0 && (p1 > 0 === p2 > 0);
const isSide = (p, y) => (p > 0) === (y > 4);
function getMoves(x, y) {
	let moves = [];
	
	let piece = board[y][x];
	let col = getCol(piece);

	// A piece cannot move to a space occupied by an ally piece
	let type = Math.abs(piece)
	switch (type) {
		case 1:
			// Soldier - Moves forward and if it crosses the river, sideways too
			let yNew = (col === "r") ? y-1 : y+1;
			if (yNew >= 0 && yNew <= 9 && !isAlly(piece, board[yNew][x])) {
				moves.push([x, yNew]);
			}
			if (!isSide(piece, y)) {
				let xLeft = x - 1;
				let xRight = x + 1;
				if (xLeft >= 0 && !isAlly(piece, board[y][xLeft])) {
					moves.push([xLeft, y]);
				}
				if (xRight <= 8 && !isAlly(piece, board[y][xRight])) {
					moves.push([xRight, y])
				}
			}
			break;
		case 2:
			// Cannon - Moves orthogonally but captures by crossing over another piece
			break;
		case 3:
			// Chariot - Moves and captures orthogonally
			break;
		case 4:
			// Horse - Moves in an L shape but can be blocked by neighbouring pieces
			break;
		case 5:
			// Elephant - Moves diagonally by two, can be blocked and cannot cross the river
			for (let i = -1; i <= 1; i += 2) {
				for (let j = -1; j <= 1; j += 2) {
					let xBlock = x + i, yBlock = y + j;
					if (xBlock < 0 || xBlock > 8 || yBlock < 0 || yBlock > 9) { continue; }
					if (!isSide(piece, yBlock)) { continue; }
					let xNew = x + 2*i, yNew = y + 2*j;
					if (!isAlly(piece, board[yNew][xNew])) {
						moves.push([xNew, yNew]);
					}
				}
			}
			break;
		case 6:
			// Advisor - Moves diagonally by one and stays in the palace
			if (x === 4) {
				// If it is at center of palace
				for (let i = -1; i <= 1; i += 2) {
					for (let j = -1; j <= 1; j += 2) {
						let xNew = x + i, yNew = y + j;
						if (!isAlly(piece, board[yNew][xNew])) {
							moves.push([xNew, yNew]);
						}
					}
				}
			} else {
				let xNew = 4;
				let yNew = (col === "r") ? 8 : 1;
				if (!isAlly(piece, board[yNew][xNew])) {
					moves.push([xNew, yNew]);
				}
			}
			break;
		case 7:
			// General - Moves orthogonally by one and stays in the palace
			for (let i = -1; i <= 1; i += 2) {
				let xNew = x + i;
				if (xNew >= 3 && xNew <= 5 && !isAlly(piece, board[y][xNew])) {
					moves.push([xNew, y]);
				}
				let yNew = y + i;
				if (col === "r" && (yNew < 7 || yNew > 9)) { continue; }
				if (col === "b" && (yNew < 0 || yNew > 2)) { continue; }
				if (!isAlly(piece, board[yNew][x])) {
					moves.push([x, yNew]);
				}
			}
			break;
	}
	return moves;
}

function select(x, y) {
	if (board[y][x] === 0) { return; }
	if (getCol(board[y][x]) !== turn) { return; }
	selected = [x, y];

	const drawCircle = (x, y, col) => {
		let pos = getCanvasPos(x, y);
		ctx.strokeStyle = col;
		ctx.beginPath();
		ctx.arc(pos[0], pos[1], pieceSize/2, 0, 2 * Math.PI);
		ctx.stroke();
	}
	drawCircle(x, y, "#ffff00");
	getMoves(x, y).forEach(move => drawCircle(move[0], move[1], "#0000ff"));
}
function move(x, y) {
	let selectedPiece = board[selected[1]][selected[0]];
	board[selected[1]][selected[0]] = 0;
	board[y][x] = selectedPiece;
	selected = null;
	turn = turn == "r" ? "b" : "r";
	renderBoard();
}

canvas.addEventListener("click", (event) => {
	const rect = canvas.getBoundingClientRect();
	let x = event.clientX - rect.left;
	let y = event.clientY - rect.top;
	let xGrid = Math.floor((x - xOffset + interval/2) / interval);
	let yGrid = Math.floor((y - yOffset + interval/2) / interval);
	if (xGrid < 0 || xGrid > 8 || yGrid < 0 || yGrid > 9) { return; }

	let pos = getCanvasPos(xGrid, yGrid);
	let dxSquared = (pos[0] - x) ** 2;
	let dySquared = (pos[1] - y) ** 2;
	let rSquared = (pieceSize / 2) ** 2;
	if (dxSquared + dySquared > rSquared) { return; }

	if (!selected) { select(xGrid, yGrid); }
	else { move(xGrid, yGrid); }
});

renderBoard(board, lang);
