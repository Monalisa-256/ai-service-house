export const decisions = {
  records: [
    [
      "Use the earlier notice",
      "Your draft offers a session under a superseded notice.",
    ],
    [
      "Use the current notice",
      "Your draft tells the visitor that Saturday application help is suspended.",
    ],
  ],
  "service-counter": [
    [
      "Offer a Tuesday time",
      "The visitor can choose a time. The calendar still has no confirmed booking.",
    ],
    [
      "Tell the visitor they are booked",
      "The visitor expects an appointment, but the lookup issued no confirmation.",
    ],
  ],
  workshop: [
    ["Serve the saved reply", "The visitor sees the old Saturday invitation."],
    [
      "Refresh the visitor display",
      "The visitor sees the newly generated reply explaining the suspension.",
    ],
  ],
  "test-room": [
    [
      "Release the candidate",
      "The candidate goes out with the failing Saturday answer.",
    ],
    [
      "Hold the release",
      "The candidate stays out of production while the Saturday answer is repaired.",
    ],
  ],
  security: [
    [
      "Request access to the rota",
      "The permission check blocks the request. The visitor receives no staff record.",
    ],
    [
      "Use the public notice",
      "The visitor receives the public service schedule without requesting staff data.",
    ],
  ],
} as const;

export const observations = {
  index: [
    "The deployed candidates omit the current notice.",
    "The deployed candidates include the current notice.",
  ],
  cache: [
    "The generated and displayed replies both invite the visitor.",
    "The generated reply corrects the invitation, but the display still shows it.",
  ],
} as const;
