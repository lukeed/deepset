const assert = require('uvu/assert');
const { Suite } = require('benchmark');
const { klona } = require('klona/json');
const { dset } = require('../dist');

const contenders = {
	'clean-set': require('clean-set'),
	'dset-klona': function (obj, key, val) {
		let copy = klona(obj);
		dset(copy, key, val);
		return copy;
	}
};

console.log('Validation: ');
Object.keys(contenders).forEach(name => {
	try {
		const input = {};
		const output = contenders[name](input, 'x.y.z', 'foobar');

		assert.is.not(output === input, 'new object');
		assert.equal(output, {
			x: {
				y: {
					z: 'foobar'
				}
			}
		}, 'expected output');

		input.foo = 'bar';
		assert.is.not(output.foo, 'bar', 'detached clone');

		console.log('  ✔', name);
	} catch (err) {
		console.log('  ✘', name, `(FAILED @ "${err.message}")`);
	}
});


console.log('\nBenchmark:');
const onCycle = e => console.log('  ' + e.target);
const bench = new Suite({ onCycle });

Object.keys(contenders).forEach(name => {
	bench.add(name + ' '.repeat(12 - name.length), () => {
		contenders[name]({}, 'x.y.z', 'foobar');
		contenders[name]({}, 'x.a.b.c', 'howdy');
	});
});

bench.run();
