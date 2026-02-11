export function calculateNextDeliveryDate(frequency, deliveryDay, deliveryMonth, deliveryYear) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let nextDate = new Date(today);

  switch (frequency) {
    case "weekly": {
      const daysOfWeek = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
      };
      const targetDay = daysOfWeek[deliveryDay.toLowerCase()];
      const currentDay = today.getDay();
      let daysUntilTarget = targetDay - currentDay;
      if (daysUntilTarget <= 0) {
        daysUntilTarget += 7;
      }
      nextDate.setDate(today.getDate() + daysUntilTarget);
      break;
    }
    case "monthly": {
      const dayOfMonth = parseInt(deliveryDay, 10);
      nextDate = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
      if (nextDate <= today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
      // If we wanted day 31, but next month is Feb, date will be March 2/3.
      // Let's check for this.
      if (nextDate.getDate() !== dayOfMonth) {
          // It rolled over. Set to last day of previous month.
          nextDate = new Date(nextDate.getFullYear(), nextDate.getMonth(), 0);
      }
      break;
    }
    case "yearly": {
      // The original seems to treat this as a one-time event on a given year.
      // For a recurring cron, it should be every year.
      const month = parseInt(deliveryMonth, 10) - 1;
      const day = parseInt(deliveryDay, 10);
      nextDate = new Date(today.getFullYear(), month, day);
      if (nextDate <= today) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
      break;
    }
    default:
      // Defaulting to daily for unknown frequencies
      nextDate.setDate(today.getDate() + 1);
      break;
  }

  nextDate.setHours(9, 0, 0, 0);
  return nextDate;
}