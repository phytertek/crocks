/** @license ISC License (c) copyright 2016 original and current authors */
/** @author Ian Hofmann-Hicks (evil) */

const VERSION = 1

const _implements = require('../core/implements')
const _inspect = require('../core/inspect')
const type = require('../core/types').type('State')
const _type = require('../core/types').typeFn(type(), VERSION)
const fl = require('../core/flNames')

const Pair = require('../core/Pair')
const Unit = require('../core/Unit')

const isFunction = require('../core/isFunction')
const isSameType = require('../core/isSameType')

const _of =
  x => State(s => Pair(x, s))

function get(fn) {
  if(!arguments.length) {
    return State(s => Pair(s, s))
  }

  if(isFunction(fn)) {
    return State(s => Pair(fn(s), s))
  }

  throw new TypeError('State.get: No arguments or function required')
}

function modify(fn) {
  if(!isFunction(fn)) {
    throw new TypeError('State.modify: Function Required')
  }

  return State(s => Pair(Unit(), fn(s)))
}

function State(fn) {
  if(!isFunction(fn)) {
    throw new TypeError('State: Must wrap a function in the form (s -> Pair a s)')
  }

  const of =
    _of

  const inspect =
    () => `State${_inspect(fn)}`

  function runWith(state, ...params) {
    const [ func = 'runWith' ] = params
    const m = fn(state)

    if(!isSameType(Pair, m)) {
      throw new TypeError(`State.${func}: Must wrap a function in the form (s -> Pair a s)`)
    }

    return m
  }

  function execWith(s) {
    const pair = runWith(s, 'execWith')
    return pair.snd()
  }

  function evalWith(s) {
    const pair = runWith(s, 'evalWith')
    return pair.fst()
  }

  function map(fn) {
    if(!isFunction(fn)) {
      throw new TypeError('State.map: Function required')
    }

    return State(s => {
      const m = runWith(s, 'map')
      return Pair(fn(m.fst()), m.snd())
    })
  }

  function ap(m) {
    if(!isSameType(State, m)) {
      throw new TypeError('State.ap: State required')
    }

    return State(s => {
      const pair = runWith(s, 'ap')
      const fn = pair.fst()

      if(!isFunction(fn)) {
        throw new TypeError('State.ap: Source value must be a function')
      }

      return m.map(fn).runWith(pair.snd())
    })
  }

  function chain(fn) {
    if(!isFunction(fn)) {
      throw new TypeError('State.chain: State returning function required')
    }

    return State(s => {
      const pair = runWith(s, 'chain')
      const m = fn(pair.fst())

      if(!isSameType(State, m)) {
        throw new TypeError('State.chain: Function must return another State')
      }

      return m.runWith(pair.snd())
    })
  }

  return {
    inspect, toString: inspect, runWith,
    execWith, evalWith, type, map, ap,
    chain, of,
    [fl.of]: of,
    [fl.map]: map,
    [fl.chain]: chain,
    ['@@type']: _type,
    constructor: State
  }
}

State.of = _of
State.get = get

State.modify = modify

State.put =
  x => modify(() => x)

State.type = type

State[fl.of] = _of
State['@@type'] = _type

State['@@implements'] = _implements(
  [ 'ap', 'chain', 'map', 'of' ]
)

module.exports = State
