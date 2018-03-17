//---------//
// Imports //
//---------//

import Container from '../nodes/container'
import Node from '../nodes/node'
import parseMediaFeature from './feature'

//
//------//
// Main //
//------//

/**
 * Parses a media query, e.g. `screen and (color)`, `only tv`
 *
 * @param {string} string - the source media query string
 * @param {Number} index - the index of `string` in the overall input
 *
 * @return {Array} an array of Nodes and Containers
 */

function parseMediaQuery(string, index = 0) {
  const result = []

  // How many timies the parser entered parens/curly braces
  let localLevel = 0
  // Has any keyword, media type, media feature expression or interpolation
  // ('element' hereafter) started
  let insideSomeValue = false
  let node

  function resetNode() {
    return {
      before: '',
      after: '',
      value: '',
    }
  }

  node = resetNode()

  for (let i = 0; i < string.length; i++) {
    const character = string[i]
    // If not yet entered any element
    if (!insideSomeValue) {
      if (character.search(/\s/) !== -1) {
        // A whitespace
        // Don't form 'after' yet; will do it later
        node.before += character
      } else {
        // Not a whitespace - entering an element
        // Expression start
        if (character === '(') {
          node.type = 'media-feature-expression'
          localLevel++
        }
        node.value = character
        node.sourceIndex = index + i
        insideSomeValue = true
      }
    } else {
      // Already in the middle of some alement
      node.value += character

      // Here parens just increase localLevel and don't trigger a start of
      // a media feature expression (since they can't be nested)
      // Interpolation start
      if (character === '{' || character === '(') {
        localLevel++
      }
      // Interpolation/function call/media feature expression end
      if (character === ')' || character === '}') {
        localLevel--
      }
    }

    // If exited all parens/curlies and the next symbol
    if (
      insideSomeValue &&
      localLevel === 0 &&
      (character === ')' ||
        i === string.length - 1 ||
        string[i + 1].search(/\s/) !== -1)
    ) {
      if (['not', 'only', 'and'].indexOf(node.value) !== -1) {
        node.type = 'keyword'
      }
      // if it's an expression, parse its contents
      if (node.type === 'media-feature-expression') {
        node.nodes = parseMediaFeature(node.value, node.sourceIndex)
      }
      result.push(
        Array.isArray(node.nodes) ? new Container(node) : new Node(node)
      )
      node = resetNode()
      insideSomeValue = false
    }
  }

  // Now process the result array - to specify undefined types of the nodes
  // and specify the `after` prop
  for (let i = 0; i < result.length; i++) {
    node = result[i]
    if (i > 0) {
      result[i - 1].after = node.before
    }

    // Node types. Might not be set because contains interpolation/function
    // calls or fully consists of them
    if (node.type === undefined) {
      if (i > 0) {
        // only `and` can follow an expression
        if (result[i - 1].type === 'media-feature-expression') {
          node.type = 'keyword'
          continue
        }
        // Anything after 'only|not' is a media type
        if (result[i - 1].value === 'not' || result[i - 1].value === 'only') {
          node.type = 'media-type'
          continue
        }
        // Anything after 'and' is an expression
        if (result[i - 1].value === 'and') {
          node.type = 'media-feature-expression'
          continue
        }

        if (result[i - 1].type === 'media-type') {
          // if it is the last element - it might be an expression
          // or 'and' depending on what is after it
          if (!result[i + 1]) {
            node.type = 'media-feature-expression'
          } else {
            node.type =
              result[i + 1].type === 'media-feature-expression'
                ? 'keyword'
                : 'media-feature-expression'
          }
        }
      }

      if (i === 0) {
        // `screen`, `fn( ... )`, `#{ ... }`. Not an expression, since then
        // its type would have been set by now
        if (!result[i + 1]) {
          node.type = 'media-type'
          continue
        }

        // `screen and` or `#{...} (max-width: 10px)`
        if (
          result[i + 1] &&
          (result[i + 1].type === 'media-feature-expression' ||
            result[i + 1].type === 'keyword')
        ) {
          node.type = 'media-type'
          continue
        }
        if (result[i + 2]) {
          // `screen and (color) ...`
          if (result[i + 2].type === 'media-feature-expression') {
            node.type = 'media-type'
            result[i + 1].type = 'keyword'
            continue
          }
          // `only screen and ...`
          if (result[i + 2].type === 'keyword') {
            node.type = 'keyword'
            result[i + 1].type = 'media-type'
            continue
          }
        }
        if (result[i + 3]) {
          // `screen and (color) ...`
          if (result[i + 3].type === 'media-feature-expression') {
            node.type = 'keyword'
            result[i + 1].type = 'media-type'
            result[i + 2].type = 'keyword'
            continue
          }
        }
      }
    }
  }
  return result
}

//
//---------//
// Exports //
//---------//

export default parseMediaQuery
