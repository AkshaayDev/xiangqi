const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// Config constants
[canvas.width, canvas.height] = [600, 600];
const [xOffset, yOffset, interval, pieceSize] = [70, 50, 50, 40];
let images = {};

// Game variables
let lang = "ch";
let board = [];
let turn = "r";
let selected = null;
let selectedMoves = [];

// Game constants
const types = ["soldier", "cannon", "chariot", "horse", "elephant", "advisor", "general"];
const colors = ["r", "b"];
const langs = ["ch", "en"];

// Helper functions
const getCanvasPos = (x, y) => [xOffset + x * interval, yOffset + y * interval];
const getName = (id) => types[Math.abs(id) - 1];
const getCol = (id) => id > 0 ? "r" : "b";
const isAlly = (p1, p2) => p1 !== 0 && p2 !== 0 && (p1 > 0 === p2 > 0);
const isAtSide = (p, y) => (p > 0) === (y > 4);
const isInBoard = (x, y) => x >= 0 && x <= 8 && y >= 0 && y <= 9;
const isValid = (p, x, y) => isInBoard(x, y) && !isAlly(p, board[y][x]);

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
	turn = "r";
	selected = null;
	selectedMoves = [];
}
resetBoard();

function renderBoard() {
	ctx.fillStyle = "#ede995";
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	ctx.lineWidth = 2;
	ctx.strokeStyle = "#000000";
	ctx.beginPath();
	
	// Draw horizontal lines
	for (let i = 0; i < 10; i++) {
		ctx.moveTo(...getCanvasPos(0, i));
		ctx.lineTo(...getCanvasPos(8, i));
	}
	// Draw vertical lines and river
	for (let i = 0; i < 9; i++) {
		let top = getCanvasPos(i, 0), bottom = getCanvasPos(i, 9);
		ctx.moveTo(...top);
		if (i === 0 || i === 8) {
			ctx.lineTo(...bottom);
		} else {
			ctx.lineTo(...getCanvasPos(i, 4));
			ctx.moveTo(...getCanvasPos(i, 5));
			ctx.lineTo(...bottom);
		}
	}
	// Draw palace
	[ [[3,0],[5,2]], [[3,2],[5,0]], [[3,7],[5,9]], [[3,9],[5,7]] ].forEach(line => {
		ctx.moveTo(...getCanvasPos(...line[0]));
		ctx.lineTo(...getCanvasPos(...line[1]));
	});
	
	ctx.stroke();
	
	// Draw pieces
	for (let i = 0; i < 10; i++) {
		for (let j = 0; j < 9; j++) {
			let piece = board[i][j];	
			if (piece === 0) { continue; }
			
			let pos = getCanvasPos(j, i).map(coord => coord - pieceSize / 2);
			let img = images[lang][getName(piece)][getCol(piece)];
			const drawPiece = () => ctx.drawImage(img, ...pos, pieceSize, pieceSize);
			img.addEventListener("load", drawPiece);
			if (img.complete) { drawPiece(); }
		}
	}
	const drawCircle = (x, y, col) => {
		let pos = getCanvasPos(x, y);
		ctx.strokeStyle = col;
		ctx.beginPath();
		ctx.arc(...pos, pieceSize/2, 0, 2 * Math.PI);
		ctx.stroke();
	}
	if (selected) { drawCircle(...selected, "#ffff00"); }
	selectedMoves.forEach(move => drawCircle(...move, "#0000ff"));
}
function switchLang() {
	lang = (lang === "en") ? "ch" : "en";
	renderBoard();
}

function getMoves(x, y) {
	const orthogonals = [ [0, -1], [0, 1], [-1, 0], [1, 0] ];
	const diagonals = [ [-1, -1], [1, -1], [1, 1], [-1, 1] ];
	
	let moves = [];
	
	let piece = board[y][x];
	let col = getCol(piece);
	
	// A piece cannot move to a space occupied by an ally piece
	switch (Math.abs(piece)) {
		case 1:
			// Soldier - Moves forward and if it crosses the river, sideways too
			let yNew = (col === "r") ? y-1 : y+1;
			if (isValid(piece, x, yNew)) { moves.push([x, yNew]); }
			if (!isAtSide(piece, y)) {
				if (x >= 1 && !isAlly(piece, board[y][x-1])) { moves.push([x-1, y]); }
				if (x <= 7 && !isAlly(piece, board[y][x+1])) { moves.push([x+1, y]); }
			}
			break;
		case 2:
			// Cannon - Moves orthogonally but captures by crossing over exactly one piece
			orthogonals.forEach(([dx, dy]) => {
				let crossed = false;
				let xNew = x + dx, yNew = y + dy;
				while (isInBoard(xNew, yNew)) {
					if (!crossed) {
						// If the path is not crossed yet, check if it gets crossed
						if (board[yNew][xNew] === 0) { moves.push([xNew, yNew]); }
						else { crossed = true; }
					} else {
						// If the path is crossed, only add the space if it is an enemy
						if (isAlly(piece, board[yNew][xNew])) { break; }
						if (board[yNew][xNew] !== 0) { moves.push([xNew, yNew]); break; }
					}
					xNew += dx;
					yNew += dy;
				}
			});
			break;
		case 3:
			// Chariot - Moves and captures orthogonally
			orthogonals.forEach(([dx, dy]) => {
				let xNew = x + dx, yNew = y + dy;
				while (isInBoard(xNew, yNew)) {
					if (board[yNew][xNew] === 0) { moves.push([xNew, yNew]); }
					else if (isAlly(piece, board[yNew][xNew])) { break; }
					else { moves.push([xNew, yNew]); break; }
					xNew += dx;
					yNew += dy;
				}
			});
			break;
		case 4:
			// Horse - Moves in an L shape but can be blocked by neighbouring pieces
			let block = [0, -1];
			let posNew = [ [-1, -2], [1, -2] ];
			for (let i = 0; i < 4; i++) {	
				// Check if path is empty and spaces are valid
				let xBlock = x + block[0], yBlock = y + block[1];
				if (isInBoard(xBlock, yBlock) && board[yBlock][xBlock] === 0) {
					let xNew1 = x + posNew[0][0], yNew1 = y + posNew[0][1];
					let xNew2 = x + posNew[1][0], yNew2 = y + posNew[1][1];
					if (!isAlly(piece, board[yNew1][xNew1])) { moves.push([xNew1, yNew1]); }
					if (!isAlly(piece, board[yNew2][xNew2])) { moves.push([xNew2, yNew2]); }
				}
				// 90 degree rotation for other directions
				block = [block[1], -block[0]];
				posNew = posNew.map(pos => [pos[1], -pos[0]]);
			}
			break;
		case 5:
			// Elephant - Moves diagonally by exactly two, can be blocked and cannot cross the river
			for (let i = -1; i <= 1; i += 2) {
				for (let j = -1; j <= 1; j += 2) {
					if (!isValid(piece, x+i, y+j)) { continue; }
					if (!isAlly(piece, board[y + 2*j][x + 2*i])) { moves.push([x + 2*i, y + 2*j]); }
				}
			}
			break;
		case 6:
			// Advisor - Moves diagonally by one and stays in the palace
			if (x === 4) {
				// If the advisor is at the center of the palace, it can move to a corner of the palace
				diagonals.forEach(([dx, dy]) => {
					if (!isAlly(piece, board[y+dy][x+dx])) { moves.push([x+dx, y+dy]); }
				})
			} else {
				// Otherwise, it can only move to the center of the palace
				let yNew = (col === "r") ? 8 : 1;
				if (!isAlly(piece, board[yNew][4])) { moves.push([4, yNew]); }
			}
			break;
		case 7:
			// General - Moves orthogonally by one and stays in the palace
			// The general can only move to neighbouring positions that are in the palace
			for (let i = -1; i <= 1; i += 2) {
				if (x+i >= 3 && x+i <= 5 && !isAlly(piece, board[y][x+i])) { moves.push([x+i, y]); }
				if (col === "r" && (y+i < 7 || y+i > 9)) { continue; }
				if (col === "b" && (y+i < 0 || y+i > 2)) { continue; }
				if (!isAlly(piece, board[y+i][x])) { moves.push([x, y+i]); }
			}
			break;
	}
	return moves;
}

function select(x, y) {
	if (selected) {
		if (selected[0] === x && selected[1] === y) {
			// If the piece is selected twice, deselect it
			selected = null;
			selectedMoves = [];
			renderBoard();
		} else if (isAlly(board[selected[1]][selected[0]], board[y][x])) {
			// If the new selected piece is an ally, select it
			selected = null;
			select(x, y);
		}
	}
	else if (board[y][x] !== 0 && getCol(board[y][x]) === turn) {
		// Select the piece if it is valid
		selected = [x, y];
		selectedMoves = getMoves(x, y);
		renderBoard();
	}
}
function move(x, y) {
	let selectedPiece = board[selected[1]][selected[0]];
	if (isAlly(selectedPiece, board[y][x])) {
		// If the new selected piece is an ally, select it
		select(x, y);
	} else if (getMoves(selected[0], selected[1]).some(move => move[0] === x && move[1] === y)) {
		// Move the piece if it is a valid move
		board[selected[1]][selected[0]] = 0;
		board[y][x] = selectedPiece;
		selected = null;
		selectedMoves = [];
		turn = turn == "r" ? "b" : "r";
		renderBoard();
	}
}

canvas.addEventListener("click", (event) => {
	const rect = canvas.getBoundingClientRect();
	let x = event.clientX - rect.left;
	let y = event.clientY - rect.top;
	let xGrid = Math.floor((x - xOffset + interval/2) / interval);
	let yGrid = Math.floor((y - yOffset + interval/2) / interval);
	if (xGrid < 0 || xGrid > 8 || yGrid < 0 || yGrid > 9) { return; }
	
	// Calculate whether click is in the piece's circular hitbox
	let pos = getCanvasPos(xGrid, yGrid);
	let dxSquared = (pos[0] - x) ** 2;
	let dySquared = (pos[1] - y) ** 2;
	let rSquared = (pieceSize / 2) ** 2;
	if (dxSquared + dySquared > rSquared) { return; }
	
	(!selected) ? select(xGrid, yGrid) : move(xGrid, yGrid);
});

renderBoard();
