//---------//
// Imports //
//---------//

import Node from './node'

//
//------//
// Main //
//------//

/**
 * A node that contains other nodes and support traversing over them
 */
class Container extends Node {
  constructor(opts) {
    super(opts)

    this.nodes = opts.nodes

    if (this.after === undefined) {
      this.after =
        this.nodes.length > 0 ? this.nodes[this.nodes.length - 1].after : ''
    }

    if (this.before === undefined) {
      this.before = this.nodes.length > 0 ? this.nodes[0].before : ''
    }

    if (this.sourceIndex === undefined) {
      this.sourceIndex = this.before.length
    }

    this.nodes.forEach(node => {
      node.parent = this // eslint-disable-line no-param-reassign
    })
  }

  /**
   * Iterate over descendant nodes of the node
   *
   * @param {RegExp|string} filter - Optional. Only nodes with node.type that
   *    satisfies the filter will be traversed over
   * @param {function} cb - callback to call on each node. Takes theese params:
   *    node - the node being processed, i - it's index, nodes - the array
   *    of all nodes
   *    If false is returned, the iteration breaks
   *
   * @return (boolean) false, if the iteration was broken
   */
  walk(filter, cb) {
    const hasFilter = typeof filter === 'string' || filter instanceof RegExp
    const callback = hasFilter ? cb : filter
    const filterReg = typeof filter === 'string' ? new RegExp(filter) : filter

    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]
      const filtered = hasFilter ? filterReg.test(node.type) : true
      if (filtered && callback && callback(node, i, this.nodes) === false) {
        return false
      }
      if (node.nodes && node.walk(filter, cb) === false) {
        return false
      }
    }
    return true
  }

  /**
   * Iterate over immediate children of the node
   *
   * @param {function} cb - callback to call on each node. Takes theese params:
   *    node - the node being processed, i - it's index, nodes - the array
   *    of all nodes
   *    If false is returned, the iteration breaks
   *
   * @return (boolean) false, if the iteration was broken
   */
  each(cb = noop) {
    for (let i = 0; i < this.nodes.length; i++) {
      const node = this.nodes[i]
      if (cb(node, i, this.nodes) === false) {
        return false
      }
    }
    return true
  }
}

//
//------------------//
// Helper Functions //
//------------------//

function noop() {}

//
//---------//
// Exports //
//---------//

export default Container
