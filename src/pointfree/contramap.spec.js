const test = require('tape')
const sinon = require('sinon')
const helpers = require('../test/helpers')

const bindFunc = helpers.bindFunc

const isFunction = require('../core/isFunction')
const unit = require('../core/_unit')

const identity = x => x

const contramap = require('./contramap')

test('contramap pointfree', t => {
  const m = bindFunc(contramap)
  const f = { contramap: unit }

  t.ok(isFunction(contramap), 'is a function')

  const func = /contramap: Function required for first argument/
  t.throws(m(undefined, f), func, 'throws if first arg is undefined')
  t.throws(m(null, f), func, 'throws if first arg is null')
  t.throws(m(0, f), func, 'throws if first arg is a falsey number')
  t.throws(m(1, f), func, 'throws if first arg is a truthy number')
  t.throws(m('', f), func, 'throws if first arg is a falsey string')
  t.throws(m('string', f), func, 'throws if first arg is a truthy string')
  t.throws(m(false, f), func, 'throws if first arg is false')
  t.throws(m(true, f), func, 'throws if first arg is true')
  t.throws(m([], f), func, 'throws if first arg is an array')
  t.throws(m({}, f), func, 'throws if first arg is an object')

  const second = /contramap: Function or Contavariant Functor of the same type required for second argument/
  t.throws(m(unit, undefined), second, 'throws if second arg is undefined')
  t.throws(m(unit, null), second, 'throws if second arg is null')
  t.throws(m(unit, 0), second, 'throws if second arg is a falsey number')
  t.throws(m(unit, 1), second, 'throws if second arg is a truthy number')
  t.throws(m(unit, ''), second, 'throws if second arg is a falsey string')
  t.throws(m(unit, 'string'), second, 'throws if second arg is a truthy string')
  t.throws(m(unit, false), second, 'throws if second arg is false')
  t.throws(m(unit, true), second, 'throws if second arg is true')
  t.throws(m(unit, {}), second, 'throws if second arg is an object')
  t.throws(m(unit, []), second, 'throws if second arg is an object')

  t.doesNotThrow(m(unit, f), 'allows a function and functor')
  t.doesNotThrow(m(unit, unit), 'allows two functions')

  t.end()
})

test('contramap contra functor', t => {
  const m = { contramap: sinon.spy(unit) }

  contramap(identity, m)

  t.ok(m.contramap.calledWith(identity), 'calls contramap on functor, passing the function')
  t.end()
})

test('contramap function composition', t => {
  const first = sinon.spy(x => x + 2)
  const second = sinon.spy(x => x * 10)

  const comp = contramap(second, first)
  const result = comp(0)

  t.ok(isFunction(comp), 'returns a function')
  t.ok(second.calledBefore(first), 'calls the second function first')

  t.ok(first.calledWith(second.returnValues[0]), 'result of second is passed to the first')
  t.equal(result, first.returnValues[0], 'result of first is returned')

  t.end()
})
