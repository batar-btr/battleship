type Attack = 'miss' | 'killed' | 'shot';

export default function attackResponse(status: string, x: number, y: number, playerId: string) {
  return JSON.stringify({
    type: "attack",
    data: JSON.stringify({
      position: { x, y },
      currentPlayer: playerId,
      status
    }),
    id: 0,
  })
}