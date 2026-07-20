export function getGreetingFromDate(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
}

export function formatLongDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
