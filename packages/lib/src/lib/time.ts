
function formatDate(date: Date, format: string): string {
  if (!(date instanceof Date) || isNaN(date.getTime()))
    return "Invalid date !"

  return format
    .replace("DD", date.getDate().toString().padStart(2, '0'))
    .replace("MM", (date.getMonth() + 1).toString().padStart(2, '0'))
    .replace("YYYY", date.getFullYear().toString())
    .replace("YY", date.getFullYear().toString().slice(-2))
    .replace("HH", date.getHours().toString().padStart(2, '0'))
    .replace("mm", date.getMinutes().toString().padStart(2, '0'))
    .replace("ss", date.getSeconds().toString().padStart(2, '0'))
}

export default {
  formatDate
}


