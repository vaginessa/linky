export const compareDateStrings = (a, b) => {
  a = Date.parse(a)
  b = Date.parse(b)
  if (a > b) {
    return 1
  }
  if (a < b) {
    return -1
  }
  return 0
}

// https://vuejs.org/v2/guide/syntax.html#Filters
export const normalize = value => {
  if (!value) return ''
  value = value.toString().replace(/_/g, ' ')
  return value.charAt(0).toUpperCase() + value.slice(1)
}
