
function formatDate(date: Date, format: string): string {
  if (!(date instanceof Date) || isNaN(date.getTime()))
    return "Invalid date !";

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return format.replace("DD", day)
               .replace("MM", month)
               .replace("YYYY", year)
               .replace("YY", year.slice(-2))
               .replace("HH", hours)
               .replace("mm", minutes)
               .replace("ss", seconds);
}

export default {
  formatDate
}