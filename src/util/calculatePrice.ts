export function calculatePrice(
  ratePerHour: number,
  startTime: string,
  endTime: string
) {
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start) {
    throw new Error("End time must be after start time");
  }

  const durationMs = end.getTime() - start.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  return ratePerHour * durationHours;
}
