export const
  FPS = 60,

  secondsInTicks = (seconds: number) =>
    seconds * FPS,

  ticksInDays = (days: number) =>
    days * 24 * 60 * FPS,

  ticksInYears = (years: number) =>
    Math.round(ticksInDays(years * 365)),

  PER_SECOND_RATE = (sec: number) =>
    1 / sec / FPS,

  MAX_CAT_AGE = ticksInYears(15),
  MAX_CAT_HUNGER = ticksInDays(28),
  MAX_CAT_THIRST = ticksInDays(3),

  SECONDS_PER_CAT = 20,
  BLINK_RATE = PER_SECOND_RATE(10),
  UNBLINK_RATE = PER_SECOND_RATE(1),
  CAT_RATE = PER_SECOND_RATE(200),
  DRINK_RATE = Math.round(MAX_CAT_THIRST * PER_SECOND_RATE(10)),
  EAT_RATE = Math.round(MAX_CAT_HUNGER * PER_SECOND_RATE(10)),
  SIT_RATE = PER_SECOND_RATE(10),
  SUSPEND_RATE = PER_SECOND_RATE(600)
