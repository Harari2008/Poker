{
  "name": "FriendRequest",
  "type": "object",
  "properties": {
    "from_email": {
      "type": "string",
      "description": "מייל השולח"
    },
    "from_nickname": {
      "type": "string",
      "description": "כינוי השולח"
    },
    "from_avatar": {
      "type": "string",
      "description": "אווטאר השולח"
    },
    "to_email": {
      "type": "string",
      "description": "מייל המקבל"
    },
    "status": {
      "type": "string",
      "enum": [
        "pending",
        "accepted",
        "declined"
      ],
      "default": "pending",
      "description": "סטטוס הבקשה"
    }
  },
  "required": [
    "from_email",
    "to_email",
    "from_nickname"
  ]
}
