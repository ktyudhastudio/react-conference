export const randomId = (prefix = "u") =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
