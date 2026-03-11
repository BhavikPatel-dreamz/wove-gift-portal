import { getSouthAfricaDateParts, makeSouthAfricaDate } from "./timezone.js";

export function calculateNextDeliveryDate(frequency, deliveryDay, deliveryMonth, deliveryYear) {
  const todayParts = getSouthAfricaDateParts(new Date());
  const todayLocal = new Date(
    Date.UTC(todayParts.year, todayParts.monthIndex, todayParts.day, 0, 0, 0, 0),
  );

  let nextLocal = new Date(todayLocal.getTime());

  switch (frequency) {
    case "weekly": {
      const daysOfWeek = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
      };
      const targetDay = daysOfWeek[String(deliveryDay || "").toLowerCase()];
      const currentDay = todayParts.dayOfWeek;

      if (targetDay === undefined) {
        nextLocal = new Date(
          Date.UTC(todayParts.year, todayParts.monthIndex, todayParts.day + 1),
        );
        break;
      }

      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
      }
      nextLocal = new Date(
        Date.UTC(
          todayParts.year,
          todayParts.monthIndex,
          todayParts.day + daysUntilTarget,
        ),
      );
      break;
    }
    case "monthly": {
      const dayOfMonth = parseInt(deliveryDay, 10);
      if (!Number.isFinite(dayOfMonth) || dayOfMonth < 1 || dayOfMonth > 31) {
        nextLocal = new Date(
          Date.UTC(todayParts.year, todayParts.monthIndex, todayParts.day + 1),
        );
        break;
      }

      const baseYear = todayParts.year;
      const baseMonthIndex = todayParts.monthIndex;
      let candidate = new Date(Date.UTC(baseYear, baseMonthIndex, dayOfMonth));

      // If we wanted day 31 but this month doesn't have it, use last day of the month.
      if (candidate.getUTCMonth() !== baseMonthIndex) {
        candidate = new Date(Date.UTC(baseYear, baseMonthIndex + 1, 0));
      }

      if (candidate.getTime() <= todayLocal.getTime()) {
        const nextMonthIndex = baseMonthIndex + 1;
        const expectedMonthIndex = (baseMonthIndex + 1) % 12;
        candidate = new Date(Date.UTC(baseYear, nextMonthIndex, dayOfMonth));

        if (candidate.getUTCMonth() !== expectedMonthIndex) {
          candidate = new Date(Date.UTC(baseYear, baseMonthIndex + 2, 0));
        }
      }

      nextLocal = candidate;
      break;
    }
    case "yearly": {
      const monthIndex = parseInt(deliveryMonth, 10) - 1;
      const dayOfMonth = parseInt(deliveryDay, 10);

      if (
        !Number.isFinite(monthIndex) ||
        monthIndex < 0 ||
        monthIndex > 11 ||
        !Number.isFinite(dayOfMonth) ||
        dayOfMonth < 1 ||
        dayOfMonth > 31
      ) {
        nextLocal = new Date(
          Date.UTC(todayParts.year, todayParts.monthIndex, todayParts.day + 1),
        );
        break;
      }

      const baseYear = todayParts.year;
      let candidate = new Date(Date.UTC(baseYear, monthIndex, dayOfMonth));

      // If we wanted Feb 29 in a non-leap year, use last day of Feb.
      if (candidate.getUTCMonth() !== monthIndex) {
        candidate = new Date(Date.UTC(baseYear, monthIndex + 1, 0));
      }

      if (candidate.getTime() <= todayLocal.getTime()) {
        const nextYear = baseYear + 1;
        candidate = new Date(Date.UTC(nextYear, monthIndex, dayOfMonth));
        if (candidate.getUTCMonth() !== monthIndex) {
          candidate = new Date(Date.UTC(nextYear, monthIndex + 1, 0));
        }
      }

      nextLocal = candidate;
      break;
    }
    default:
      // Defaulting to daily for unknown frequencies
      nextLocal = new Date(
        Date.UTC(todayParts.year, todayParts.monthIndex, todayParts.day + 1),
      );
      break;
  }

  return makeSouthAfricaDate({
    year: nextLocal.getUTCFullYear(),
    monthIndex: nextLocal.getUTCMonth(),
    day: nextLocal.getUTCDate(),
    hour: 9,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
}
