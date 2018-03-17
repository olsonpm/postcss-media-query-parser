//------//
// Main //
//------//

/**
 * Parses a media feature expression, e.g. `max-width: 10px`, `(color)`
 *
 * @param {string} string - the source expression string, can be inside parens
 * @param {Number} index - the index of `string` in the overall input
 *
 * @return {Array} an array of Nodes, the first element being a media feature,
 *    the secont - its value (may be missing)
 */

function parseMediaFeature(string, index = 0) {
  const modesEntered = [
    {
      mode: 'normal',
      character: null,
    },
  ]
  const result = []
  let lastModeIndex = 0
  let mediaFeature = ''
  let colon = null
  let mediaFeatureValue = null
  let indexLocal = index

  let stringNormalized = string
  // Strip trailing parens (if any), and correct the starting index
  if (string[0] === '(' && string[string.length - 1] === ')') {
    stringNormalized = string.substring(1, string.length - 1)
    indexLocal++
  }

  for (let i = 0; i < stringNormalized.length; i++) {
    const character = stringNormalized[i]

    // If entering/exiting a string
    if (character === "'" || character === '"') {
      if (modesEntered[lastModeIndex].isCalculationEnabled === true) {
        modesEntered.push({
          mode: 'string',
          isCalculationEnabled: false,
          character,
        })
        lastModeIndex++
      } else if (
        modesEntered[lastModeIndex].mode === 'string' &&
        modesEntered[lastModeIndex].character === character &&
        stringNormalized[i - 1] !== '\\'
      ) {
        modesEntered.pop()
        lastModeIndex--
      }
    }

    // If entering/exiting interpolation
    if (character === '{') {
      modesEntered.push({
        mode: 'interpolation',
        isCalculationEnabled: true,
      })
      lastModeIndex++
    } else if (character === '}') {
      modesEntered.pop()
      lastModeIndex--
    }

    // If a : is met outside of a string, function call or interpolation, than
    // this : separates a media feature and a value
    if (modesEntered[lastModeIndex].mode === 'normal' && character === ':') {
      const mediaFeatureValueStr = stringNormalized.substring(i + 1)
      mediaFeatureValue = {
        type: 'value',
        before: /^(\s*)/.exec(mediaFeatureValueStr)[1],
        after: /(\s*)$/.exec(mediaFeatureValueStr)[1],
        value: mediaFeatureValueStr.trim(),
      }
      // +1 for the colon
      mediaFeatureValue.sourceIndex =
        mediaFeatureValue.before.length + i + 1 + indexLocal
      colon = {
        type: 'colon',
        sourceIndex: i + indexLocal,
        after: mediaFeatureValue.before,
        value: ':', // for consistency only
      }
      break
    }

    mediaFeature += character
  }

  // Forming a media feature node
  mediaFeature = {
    type: 'media-feature',
    before: /^(\s*)/.exec(mediaFeature)[1],
    after: /(\s*)$/.exec(mediaFeature)[1],
    value: mediaFeature.trim(),
  }
  mediaFeature.sourceIndex = mediaFeature.before.length + indexLocal
  result.push(mediaFeature)

  if (colon !== null) {
    colon.before = mediaFeature.after
    result.push(colon)
  }

  if (mediaFeatureValue !== null) {
    result.push(mediaFeatureValue)
  }

  return result
}

//
//---------//
// Exports //
//---------//

export default parseMediaFeature
