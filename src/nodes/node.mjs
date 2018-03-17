/**
 * A very generic node. Pretty much any element of a media query
 */

export default function Node(opts) {
  this.after = opts.after
  this.before = opts.before
  this.type = opts.type
  this.value = opts.value
  this.sourceIndex = opts.sourceIndex
}
