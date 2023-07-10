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

type CellStatus = 'empty' | 'alive' | 'dead';

class Cell {
  x: number;
  y: number;
  status: CellStatus;

  constructor(x:number, y:number, status: CellStatus) {
    this.x = x,
    this.y = y,
    this.status = status
  }
}

class Board {
  ships: Ship[];
  board: Cell[][];
  shipCells: number[][][];

  constructor(ships: Ship[]) {

    this.ships = ships;

    const board: Cell[][] = Array.from({ length: 10 }, () => Array.from({ length: 10 }))
    for(let y = 0; y < 10; y++) {
      for(let x = 0; x < 10; x++) {
        const cell = new Cell(x,y,'empty')
        board[x][y] = cell;
      }
    }

    this.board = board;

    this.shipCells = ships.map(({ position, direction, length }) => {   // [ [ 2, 3 ], [ 3, 3 ], [ 4, 3 ], [ 5, 3 ] ],
      const cells = new Array(length).fill(0).map((_, idx) => {         // [ [ 1, 6 ], [ 1, 7 ], [ 1, 8 ] ],
        let { x, y } = position;                                        // [ [ 4, 8 ], [ 5, 8 ], [ 6, 8 ] ],
        direction ? y += idx : x += idx;                                // [ [ 1, 0 ], [ 1, 1 ] ],
        return [x, y];                                                  // [ [ 8, 8 ], [ 9, 8 ] ],
      })                                                                //
      return cells;
    })
  }

  checkAttack(x: number, y: number) {
    const shipIndex = this.shipCells.findIndex(cells => cells.some(cell => cell[0] === x && cell[1] === y));
    console.log(shipIndex);
  }
}

const board = new Board(ships);

board.checkAttack(2,3);
board.checkAttack(0,0);
board.checkAttack(8,0);



// function checkShipAlive(shipIndex: number) {
//   const ship = shipCells[shipIndex];
// }
