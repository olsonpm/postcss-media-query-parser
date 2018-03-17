//---------//
// Imports //
//---------//

import Container from '../nodes/container'
import Node from '../nodes/node'
import parseMediaQuery from './query'

//
//------//
// Main //
//------//

/**
 * Parses a media query list. Takes a possible `url()` at the start into
 * account, and divides the list into media queries that are parsed separately
 *
 * @param {string} string - the source media query list string
 *
 * @return {Array} an array of Nodes/Containers
 */

function parseMediaList(string) {
  const result = []
  let interimIndex = 0
  let levelLocal = 0

  // Check for a `url(...)` part (if it is contents of an @import rule)
  const doesHaveUrl = /^(\s*)url\s*\(/.exec(string)
  if (doesHaveUrl !== null) {
    let i = doesHaveUrl[0].length
    let parenthesesLv = 1
    while (parenthesesLv > 0) {
      const character = string[i]
      if (character === '(') {
        parenthesesLv++
      }
      if (character === ')') {
        parenthesesLv--
      }
      i++
    }
    result.unshift(
      new Node({
        type: 'url',
        value: string.substring(0, i).trim(),
        sourceIndex: doesHaveUrl[1].length,
        before: doesHaveUrl[1],
        after: /^(\s*)/.exec(string.substring(i))[1],
      })
    )
    interimIndex = i
  }

  // Start processing the media query list
  for (let i = interimIndex; i < string.length; i++) {
    const character = string[i]

    // Dividing the media query list into comma-separated media queries
    // Only count commas that are outside of any parens
    // (i.e., not part of function call params list, etc.)
    if (character === '(') {
      levelLocal++
    }
    if (character === ')') {
      levelLocal--
    }
    if (levelLocal === 0 && character === ',') {
      const mediaQueryString = string.substring(interimIndex, i)
      const spaceBefore = /^(\s*)/.exec(mediaQueryString)[1]
      result.push(
        new Container({
          type: 'media-query',
          value: mediaQueryString.trim(),
          sourceIndex: interimIndex + spaceBefore.length,
          nodes: parseMediaQuery(mediaQueryString, interimIndex),
          before: spaceBefore,
          after: /(\s*)$/.exec(mediaQueryString)[1],
        })
      )
      interimIndex = i + 1
    }
  }

  const mediaQueryString = string.substring(interimIndex)
  const spaceBefore = /^(\s*)/.exec(mediaQueryString)[1]
  result.push(
    new Container({
      type: 'media-query',
      value: mediaQueryString.trim(),
      sourceIndex: interimIndex + spaceBefore.length,
      nodes: parseMediaQuery(mediaQueryString, interimIndex),
      before: spaceBefore,
      after: /(\s*)$/.exec(mediaQueryString)[1],
    })
  )

  return result
}

//
//---------//
// Exports //
//---------//

export default parseMediaList
