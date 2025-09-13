export const
  FPS = 60,

  ticksInDays = (days: number) =>
    days * 24 * 60 * FPS,

  ticksInYears = (years: number) =>
    Math.round(ticksInDays(years * 365)),

  PER_SECOND_RATE = (sec: number) =>
    1 / sec / FPS,

  SECONDS_PER_CAT = 20,
  CAT_RATE = PER_SECOND_RATE(20),
  SIT_RATE = PER_SECOND_RATE(10),
  SUSPEND_RATE = PER_SECOND_RATE(600)
