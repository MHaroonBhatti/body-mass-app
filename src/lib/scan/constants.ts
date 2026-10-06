export const SCAN_FLOW_STEPS = [
  { key: "participant", label: "Details", href: "/scan/participant" },
  { key: "instructions", label: "Instructions", href: "/scan/instructions" },
  { key: "photos", label: "Photos", href: "/scan/photo/front" },
  { key: "review", label: "Review", href: "/scan/review" },
] as const;

export const PHOTO_INSTRUCTIONS = [
  "Stand upright",
  "Keep your whole body visible",
  "Keep your head visible",
  "Keep both feet visible",
  "Keep arms slightly away from the torso",
  "Keep legs slightly separated",
  "Use a neutral posture",
  "Avoid flexing",
  "Avoid sucking in your stomach",
  "Use fitted but non-revealing clothing suitable for silhouette analysis",
  "Use good, even lighting",
  "Use a plain background if possible",
  "Keep the camera approximately level",
  "Keep approximately the same distance from the camera for all four photographs",
] as const;
