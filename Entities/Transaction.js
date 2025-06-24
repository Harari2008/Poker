{
  "name": "Transaction",
  "type": "object",
  "properties": {
    "user_email": {
      "type": "string",
      "description": "מייל המשתמש"
    },
    "type": {
      "type": "string",
      "enum": [
        "deposit",
        "withdrawal",
        "game_payment",
        "game_winnings"
      ],
      "description": "סוג העסקה"
    },
    "amount": {
      "type": "number",
      "description": "סכום העסקה בשקלים"
    },
    "description": {
      "type": "string",
      "description": "תיאור העסקה"
    },
    "game_id": {
      "type": "string",
      "description": "מזהה המשחק (אם רלוונטי)"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "completed",
        "failed"
      ],
      "default": "completed",
      "description": "סטטוס העסקה"
    }
  },
  "required": [
    "user_email",
    "type",
    "amount",
    "description"
  ]
}
