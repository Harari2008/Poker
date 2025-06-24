{
  "name": "GameResult",
  "type": "object",
  "properties": {
    "game_id": {
      "type": "string",
      "description": "מזהה המשחק"
    },
    "player_email": {
      "type": "string",
      "description": "מייל השחקן"
    },
    "buy_in": {
      "type": "number",
      "description": "סכום הקנייה"
    },
    "final_amount": {
      "type": "number",
      "description": "סכום סופי שהשחקן סיים איתו"
    },
    "profit_loss": {
      "type": "number",
      "description": "רווח או הפסד (חיובי = רווח, שלילי = הפסד)"
    },
    "confirmed_by_host": {
      "type": "boolean",
      "default": false,
      "description": "האם התוצאה אושרה על ידי מארח המשחק"
    }
  },
  "required": [
    "game_id",
    "player_email",
    "buy_in",
    "final_amount"
  ]
}
