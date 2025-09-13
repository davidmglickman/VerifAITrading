// Market hours utility for US equities (NYSE/Nasdaq)
// Uses America/New_York timezone and basic weekend/holiday handling

export type MarketSession = 'PRE_MARKET' | 'OPEN' | 'AFTER_HOURS' | 'CLOSED'

export interface MarketTimeContext {
  nowET: Date
  session: MarketSession
  isWeekend: boolean
  isHoliday: boolean
  nextOpen: Date
  nextClose: Date
}

// Minimal holiday placeholder. In production, fetch official exchanges' calendars.
const STATIC_HOLIDAYS_UTC = [
  // New Year's Day (observed)
  '2025-01-01',
  // Independence Day
  '2025-07-04',
  // Thanksgiving (4th Thursday of Nov, placeholder date)
  '2025-11-27',
  // Christmas Day
  '2025-12-25'
]

const inET = (d: Date) => new Date(
  d.toLocaleString('en-US', { timeZone: 'America/New_York' })
)

const atET = (year: number, monthIndex0: number, day: number, hours: number, minutes = 0) => {
  // Construct a date at given ET components, then convert back to a Date respecting TZ
  const iso = new Date(Date.UTC(year, monthIndex0, day, hours + 5, minutes)) // crude offset; corrected by toLocale in inET
  const et = inET(iso)
  et.setHours(hours, minutes, 0, 0)
  return et
}

const isHolidayET = (etDate: Date) => {
  const y = etDate.getFullYear()
  const m = String(etDate.getMonth() + 1).padStart(2, '0')
  const d = String(etDate.getDate()).padStart(2, '0')
  const key = `${y}-${m}-${d}`
  return STATIC_HOLIDAYS_UTC.includes(key)
}

export function getMarketTimeContext(now: Date = new Date()): MarketTimeContext {
  const nowET = inET(now)
  const day = nowET.getDay() // 0 Sun - 6 Sat
  const isWeekend = day === 0 || day === 6
  const isHoliday = isHolidayET(nowET)

  // Sessions (Eastern Time)
  // Pre-market: 4:00 - 9:30
  // Open: 9:30 - 16:00
  // After-hours: 16:00 - 20:00
  const y = nowET.getFullYear()
  const m = nowET.getMonth()
  const d = nowET.getDate()

  const preStart = atET(y, m, d, 4, 0)
  const openStart = atET(y, m, d, 9, 30)
  const openEnd = atET(y, m, d, 16, 0)
  const afterEnd = atET(y, m, d, 20, 0)

  let session: MarketSession = 'CLOSED'
  if (!isWeekend && !isHoliday) {
    if (nowET >= preStart && nowET < openStart) session = 'PRE_MARKET'
    else if (nowET >= openStart && nowET < openEnd) session = 'OPEN'
    else if (nowET >= openEnd && nowET < afterEnd) session = 'AFTER_HOURS'
    else session = 'CLOSED'
  }

  // Compute next open/close
  // If market open, nextClose is openEnd; else find next weekday non-holiday at 9:30
  let nextOpen = new Date(openStart)
  let nextClose = new Date(openEnd)

  const advanceToNextWeekday = (date: Date) => {
    let d2 = new Date(date)
    while (true) {
      const day = d2.getDay()
      if (day !== 0 && day !== 6 && !isHolidayET(d2)) return d2
      d2.setDate(d2.getDate() + 1)
    }
  }

  if (session === 'OPEN') {
    nextOpen = openStart
    nextClose = openEnd
  } else if (session === 'PRE_MARKET') {
    nextOpen = openStart
    nextClose = openEnd
  } else if (session === 'AFTER_HOURS') {
    // next open is next business day 9:30
    const tomorrow = new Date(nowET)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextBiz = advanceToNextWeekday(tomorrow)
    nextOpen = atET(nextBiz.getFullYear(), nextBiz.getMonth(), nextBiz.getDate(), 9, 30)
    nextClose = atET(nextBiz.getFullYear(), nextBiz.getMonth(), nextBiz.getDate(), 16, 0)
  } else {
    // CLOSED: could be before premarket, late night, or weekend/holiday
    if (nowET < preStart && !isWeekend && !isHoliday) {
      nextOpen = openStart
      nextClose = openEnd
    } else {
      const tomorrow = new Date(nowET)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const nextBiz = advanceToNextWeekday(tomorrow)
      nextOpen = atET(nextBiz.getFullYear(), nextBiz.getMonth(), nextBiz.getDate(), 9, 30)
      nextClose = atET(nextBiz.getFullYear(), nextBiz.getMonth(), nextBiz.getDate(), 16, 0)
    }
  }

  return {
    nowET,
    session,
    isWeekend,
    isHoliday,
    nextOpen,
    nextClose,
  }
}
