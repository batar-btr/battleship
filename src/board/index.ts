type Size = 'small' | 'medium' | 'large' | 'huge';

interface Ship {
  position: {
    x: number,
    y: number
  },
  direction: boolean,
  type: Size,
  length: number
}

const ships: Ship[] = [
  {
    position: { x: 2, y: 3 },
    direction: false,
    type: 'huge',
    length: 4
  },
  {
    position: { x: 1, y: 6 },
    direction: true,
    type: 'large',
    length: 3
  },
  {
    position: { x: 4, y: 8 },
    direction: false,
    type: 'large',
    length: 3
  },
  {
    position: { x: 1, y: 0 },
    direction: true,
    type: 'medium',
    length: 2
  },
  {
    position: { x: 8, y: 8 },
    direction: false,
    type: 'medium',
    length: 2
  },
  {
    position: { x: 7, y: 4 },
    direction: false,
    type: 'medium',
    length: 2
  },
  {
    position: { x: 7, y: 2 },
    direction: false,
    type: 'small',
    length: 1
  },
  {
    position: { x: 3, y: 1 },
    direction: false,
    type: 'small',
    length: 1
  },
  {
    position: { x: 4, y: 5 },
    direction: true,
    type: 'small',
    length: 1
  },
  {
    position: { x: 8, y: 0 },
    direction: true,
    type: 'small',
    length: 1
  }
]

type CellStatus = 'empty' | 'alive' | 'shot';

class Cell {
  x: number;
  y: number;
  status: CellStatus;
  shotPossibility: boolean;

  constructor(x: number, y: number, status: CellStatus) {
    this.x = x,
      this.y = y,
      this.status = status,
      this.shotPossibility = true
  }
}

class Board {
  ships: Ship[];
  board: Cell[][];
  shipCells: number[][][];

  constructor(ships: Ship[]) {

    this.ships = ships;

    const board: Cell[][] = Array.from({ length: 10 }, () => Array.from({ length: 10 })) // init board with 'empty' cells
    for (let y = 0; y < 10; y++) {
      for (let x = 0; x < 10; x++) {
        const cell = new Cell(x, y, 'empty')
        board[x][y] = cell;
      }
    }

    this.board = board;
    //*************SHIPS CELLS COORDS************/
    this.shipCells = ships.map(({ position, direction, length }) => {   // [ [ 2, 3 ], [ 3, 3 ], [ 4, 3 ], [ 5, 3 ] ],
      const cells = new Array(length).fill(0).map((_, idx) => {         // [ [ 1, 6 ], [ 1, 7 ], [ 1, 8 ] ],
        let { x, y } = position;                                        // [ [ 4, 8 ], [ 5, 8 ], [ 6, 8 ] ],
        direction ? y += idx : x += idx;                                // [ [ 1, 0 ], [ 1, 1 ] ],
        return [x, y];                                                  // [ [ 8, 8 ], [ 9, 8 ] ],
      })                                                                // .......
      return cells;
    });

    const flatCells = this.shipCells.flat();
    flatCells.forEach(([x, y]) => {
      this.board[x][y].status = 'alive';
    })

  }

  isKilled(coords: number[][]) {
    return coords.every(([x, y]) => this.board[x][y].status === 'shot');
  }

  getCellAround(shipIndex: number) {
    const coords = this.shipCells[shipIndex];
    const length = coords.length;
    const [x, y] = coords[0];
    const { direction } = this.ships[shipIndex];

    const cellsAround = [];

    let xFrom = x - 1;
    let yFrom = y - 1;
    let xTo;
    let yTo;

    if (direction) {
      xTo = x + 1;
      yTo = y + length
    } else {
      xTo = x + length;
      yTo = y + 1;
    }

    for (let i = xFrom; i <= xTo; i++) {
      for (let j = yFrom; j <= yTo; j++) {
        cellsAround.push([i, j]);
      }
    }

    const result = cellsAround
      .filter(([x, y]) => (x > 0 && x < 10) && (y > 0 && y < 10)) // remove out of range cells
      .filter(([x,y]) => !coords.some(cell => (cell[0] === x) && (cell[1] === y)));
      
    console.log(result)
  }

  checkAttack(x: number, y: number) {
    this.board[x][y].shotPossibility = false;
    const shipIndex = this.shipCells.findIndex(cells => cells.some(cell => cell[0] === x && cell[1] === y));
    if (shipIndex === -1) {
      console.log(x, y, 'miss');
      return;
    }
    this.board[x][y].status = 'shot';

    const currentShip = this.shipCells[shipIndex];  // [ [ 4, 8 ], [ 5, 8 ], [ 6, 8 ] ],
    if (this.isKilled(currentShip)) {
      console.log(x, y, 'Ship killed!', currentShip);
      this.getCellAround(shipIndex);
    } else {
      console.log(x, y, 'Shot', currentShip)
    }
  }
}

const board = new Board(ships);

console.log(board.board);

board.checkAttack(3, 8);
board.checkAttack(4, 8);
board.checkAttack(5, 8);
board.checkAttack(6, 8);
board.checkAttack(7, 8);
board.checkAttack(8, 8);
board.checkAttack(9, 8);





// function checkShipAlive(shipIndex: number) {
//   const ship = shipCells[shipIndex];
// }
