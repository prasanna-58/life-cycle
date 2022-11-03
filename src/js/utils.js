/* eslint-disable no-unused-vars */
/**
 * Create full value by options from summary
 * @param {String} value
 * @param {Object} summary
 * @returns {string}
 */
const GetCellText = (value, summary = {}) => {
  const { pre, unit, type } = summary
  const _unit =
    typeof unit === 'string' && unit !== 'not'
      ? unit
      : !(unit && unit.custom && unit.value.length > 0)
        ? ''
        : pre === 'R'
          ? ` ${unit.value}`
          : `${unit.value} `

  return pre === 'R' ? `${value}${_unit}` : `${_unit}${value}`
}

/**
 * Round number
 * @param {Number} value
 * @param {Number} fraction
 * @returns {Number}
 */
const GetRoundedNumber = (value, fraction) => {
  const div = 10 ** fraction
  return value.toFixed ? (value.toFixed(fraction) * div) / div : value
}

/**
 * Functions for number summary
 */
const MathOfNumbers = {
  not: () => '-',
  sum: arr => arr.reduce((sum, item) => sum + item, 0),
  average: arr => MathOfNumbers.sum(arr) / arr.length,
  median: arr => {
    let value = 0
    // eslint-disable-next-line camelcase
    const sorted_arr = arr.sort()
    const mIndex = Math.floor(arr.length / 2)
    if (arr.length % 2) {
      value = sorted_arr[mIndex]
    } else {
      value = (sorted_arr[mIndex] + sorted_arr[mIndex - 1]) / 2
    }

    return value
  },
  min: arr => Math.min(...arr),
  max: arr => Math.max(...arr),
  count: arr => arr.length
}

export { GetCellText, GetRoundedNumber, MathOfNumbers }
