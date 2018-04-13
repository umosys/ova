var should = require('should');
var ova = require('../index.js');

/*
Schema test
 - should throw an error if rule does not exist
 - should throw an error for non-objects in schema
 - should be able to traverse nested schemas
 - should be able to an error in a nested schema
Type validation
 - should detect unsupported type
 - should detect array
 - should detect non-array
 - should detect boolean
 - should detect non-boolean
 - should detect date
 - should detect non-date
 - should detect date string
 - should detect non-date string
 - should detect JSON string
 - should detect non-JSON string
 - should detect number (integer)
 - should detect number (decimal)
 - should detect number (negative)
 - should detect non-number
 - should detect number string (integer)
 - should detect number string (decimal)
 - should detect number string (negative)
 - should detect non-number string
 - should detect object
 - should detect non-object
 - should detect string
 - should detect non-string
Element type validation
 - should detect empty array
 - should detect boolean elements
 - should detect non-boolean elements
 - should detect date elements
 - should detect non-date elements
 - should detect date string elements
 - should detect non-date string elements
 - should detect JSON string elements
 - should detect non-JSON string elements
 - should detect number (integer) elements
 - should detect number (decimal) elements
 - should detect number (negative) elements
 - should detect non-number elements
 - should detect object elements
 - should detect non-object elements
 - should detect string elements
 - should detect non-string elements
Element null validation
 - should detect element can be null and is null
 - should detect element can be null and is not null
 - should detect element cannot be null and is null
 - should detect element cannot be null and is not null
Element min validation
 - should detect element equals minimum
 - should detect element above minimum
 - should detect element below minimum
Element max validation
 - should detect element equals maximum
 - should detect element above maximum
 - should detect element below maximum
Element min length validation
 - should detect element string length equals minimum length
 - should detect element string length above minimum length
 - should detect element string length below minimum length
Element max length validation
 - should detect element string length equals maximum length
 - should detect element string length above maximum length
 - should detect element string length below maximum length
Required validation
 - should not validate undefined property if required is absent
 - should not validate undefined property if required is false
 - should not validate defined property if required is false
 - should validate undefined property if required is true
 - should validate defined property if required is true
Null validation
 - should detect value can be null and is null
 - should detect value cannot be null and is null
 - should detect value can be null but can be undefined
 - should detect value can be null but cannot be undefined
 - should detect value can be null and is of correct type
Equals validation
 - should detect value equals target
 - should detect value does not equal target
Min validation
 - should detect value equals minimum
 - should detect value above minimum
 - should detect value below minimum
Max validation
 - should detect value equals maximum
 - should detect value above maximum
 - should detect value below maximum
Min length validation
 - should detect string length equals minimum length
 - should detect string length above minimum length
 - should detect string length below minimum length
 - should detect array length equals minimum length
 - should detect array length above minimum length
 - should detect array length below minimum length
Max length validation
 - should detect string length equals maximum length
 - should detect string length above maximum length
 - should detect string length below maximum length
 - should detect array length equals maximum length
 - should detect array length above maximum length
 - should detect array length below maximum length
enum validation
 - should detect value is in enum
 - should detect value is not in enum
 - should detect array is equal to enum (same order)
 - should detect array is equal to enum (different order)
 - should detect array is subset of enum
 - should detect array is superset of enum
 - should detect array has nothing from enum
Regex validation
 - should detect matching regex
 - should detect non-matching regex
 - should detect matching regex for each string in array
 - should detect non-matching regex for each string in array
 - should not detect non-matching regex for each non-string in array if elementType was not specified
 - should detect non-matching regex for each non-string in array if elementType was specified
Extensibility
 - should add custom validator
 - should detect disallowed value
 - should detect non-disallowed value
 - should not add custom validator if rule is "required"
 - should not add custom validator if rule is "null"
 - should not add custom validator if fn is not a function
 - should remove a validator
*/

describe('Schema test', function() {
	it('should throw an error if rule does not exist', function (done) {
		try {
			var person = {
				name: 'Stranger'
			};

			var error = ova(person,  {
				name: { _rules: { disallow: 'Stranger' } }
			});
		}
		catch(err) {
			err.message.should.equal('validator for rule "disallow" does not exist');
		}
		finally {
			done();
		}
	});

	it('should throw an error for non-objects in schema', function (done) {
		var movie = {
			title: '300',
			duration: 117,
			rating: 5
		};

		try {
			var error = ova(movie,  {
				title: { _rules: { type: 'string' } },
				duration: 0,
				rating: function() { return 0; }
			});
		}
		catch(err) {
			err.message.should.equal('non-object for property in schema');
		}
		finally {
			done();
		}
	});

	it('should be able to traverse nested schemas', function (done) {
		var movie = {
			title: '300',
			crew: {
				director: 'Zack Snyder',
				writers: ['Frank Miller', 'Zack Snyder']
			}
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			crew: {
				director: { _rules: { type: 'string' } },
				writers: { _rules: { type: 'array', elementType: 'string' } }
			}
		});

		should.not.exist(error);
		done();
	});

	it('should be able to an error in a nested schema', function (done) {
		var movie = {
			title: 300,
			crew: {
				director: 'Zack Snyder',
				writers: 'Frank Miller, Zack Snyder'
			}
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			crew: {
				director: { _rules: { type: 'string' } },
				writers: { _rules: { type: 'array', elementType: 'string' } }
			}
		});

		error.title.should.equal('Invalid type');
		error.crew.writers.should.equal('Invalid type');
		done();
	});
});

describe('Type validation', function() {
	it('should detect unsupported type', function (done) {
		var movie = {
			title: '300'
		};

		try {
			var error = ova(movie,  {
				title: { _rules: { type: 'unsupported' } }
			});
		}
		catch(err) {
			err.message.should.equal('unsupported type');
		}
		finally {
			done();
		}
	});

	it('should detect array', function (done) {
		var movie = {
			title: '300',
			cast: ['Gerard Butler', 'Lena Headey', 'Michael Fassbender']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { type: 'array', elementType: 'string' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-array', function (done) {
		var movie = {
			title: '300',
			cast: 'Gerard Butler, Lena Headey, Michael Fassbender'
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { type: 'array', elementType: 'string' } }
		});

		error.cast.should.equal('Invalid type');
		done();
	});

	it('should detect boolean', function (done) {
		var movie = {
			title: '300',
			released: true
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			released: { _rules: { type: 'boolean' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-boolean', function (done) {
		var movie = {
			title: '300',
			released: 'true'
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			released: { _rules: { type: 'boolean' } }
		});

		error.released.should.equal('Invalid type');
		done();
	});

	it('should detect date', function (done) {
		var movie = {
			title: '300',
			releaseDate: new Date(2007, 2, 9)
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			releaseDate: { _rules: { type: 'date' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-date', function (done) {
		var movie = {
			title: '300',
			releaseDate: '9 Mar 2007'
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			releaseDate: { _rules: { type: 'date' } }
		});

		error.releaseDate.should.equal('Invalid type');
		done();
	});

	it('should detect date string', function (done) {
		var day = {
			date: (new Date()).toISOString()
		};

		var error = ova(day,  {
			date: { _rules: { type: 'dateString' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-date string', function (done) {
		var day = {
			date: 'abc'
		};

		var error = ova(day,  {
			date: { _rules: { type: 'dateString' } }
		});

		error.date.should.equal('Invalid type');
		done();
	});

	it('should detect JSON string', function (done) {
		var movie = {
			title: '300',
			actors: "[\"Gerard Butler\",\"Lena Headey\"]"
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			actors: { _rules: { type: 'jsonString' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-JSON string', function (done) {
		var movie = {
			title: '300',
			actors: "[Gerard Butler,Lena Headey]"
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			actors: { _rules: { type: 'jsonString' } }
		});

		error.actors.should.equal('Invalid type');
		done();
	});

	it('should detect number (integer)', function (done) {
		var day = {
			temp: 25
		};

		var error = ova(day,  {
			temp: { _rules: { type: 'number' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect number (decimal)', function (done) {
		var day = {
			temp: 25.0
		};

		var error = ova(day,  {
			temp: { _rules: { type: 'number' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect number (negative)', function (done) {
		var day = {
			temp: -5
		};

		var error = ova(day,  {
			temp: { _rules: { type: 'number' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-number', function (done) {
		var day = {
			temp: 'five'
		};

		var error = ova(day,  {
			temp: { _rules: { type: 'number' } }
		});

		error.temp.should.equal('Invalid type');
		done();
	});

	it('should detect number string (integer)', function (done) {
		var day = {
			temp: '25'
		};

		var error = ova(day,  {
			temp: { _rules: { type: 'numberString' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect number string (decimal)', function (done) {
		var day = {
			temp: '25.0'
		};

		var error = ova(day,  {
			temp: { _rules: { type: 'numberString' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect number string (negative)', function (done) {
		var day = {
			temp: '-5'
		};

		var error = ova(day,  {
			temp: { _rules: { type: 'numberString' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-number string', function (done) {
		var day = {
			temp: 'five'
		};

		var error = ova(day,  {
			temp: { _rules: { type: 'numberString' } }
		});

		error.temp.should.equal('Invalid type');
		done();
	});

	it('should detect object', function (done) {
		var computer = {
			model: 'MacBook Air',
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string' } },
			processor: { _rules: { type: 'object' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-object', function (done) {
		var computer = {
			model: 'MacBook Air',
			processor: 'Intel Core i5'
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string' } },
			processor: { _rules: { type: 'object' } }
		});

		error.processor.should.equal('Invalid type');
		done();
	});

	it('should detect string', function (done) {
		var movie = {
			title: '300'
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-string', function (done) {
		var movie = {
			title: 300
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } }
		});

		error.title.should.equal('Invalid type');
		done();
	});
});

describe('Element type validation', function() {
	it('should detect empty array', function (done) {
		var poll = {
			votes: []
		};

		var error = ova(poll,  {
			votes: { _rules: { type: 'array', elementType: 'boolean' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect boolean elements', function (done) {
		var poll = {
			votes: [true, false, true]
		};

		var error = ova(poll,  {
			votes: { _rules: { type: 'array', elementType: 'boolean' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-boolean elements', function (done) {
		var poll = {
			votes: ['yes', 'no', 'yes']
		};

		var error = ova(poll,  {
			votes: { _rules: { type: 'array', elementType: 'boolean' } }
		});

		error.votes.should.equal('Invalid element type');
		done();
	});

	it('should detect date elements', function (done) {
		var poll = {
			dates: [(new Date()), (new Date()), (new Date())]
		};

		var error = ova(poll,  {
			dates: { _rules: { type: 'array', elementType: 'date' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-date elements', function (done) {
		var poll = {
			dates: ['6 Mar 2007']
		};

		var error = ova(poll,  {
			dates: { _rules: { type: 'array', elementType: 'date' } }
		});

		error.dates.should.equal('Invalid element type');
		done();
	});

	it('should detect date string elements', function (done) {
		var poll = {
			dates: [(new Date()).toISOString(), (new Date()).toISOString(), (new Date()).toISOString()]
		};

		var error = ova(poll,  {
			dates: { _rules: { type: 'array', elementType: 'dateString' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-date string elements', function (done) {
		var poll = {
			dates: ['abc', 'abc', 'abc']
		};

		var error = ova(poll,  {
			dates: { _rules: { type: 'array', elementType: 'dateString' } }
		});

		error.dates.should.equal('Invalid element type');
		done();
	});

	it('should detect JSON string elements', function (done) {
		var movie = {
			actors: ["{\"name\":\"Gerald Butler\"}", "{\"name\":\"Lena Headey\"}"]
		};

		var error = ova(movie,  {
			actors: { _rules: { type: 'array', elementType: 'jsonString' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-JSON string elements', function (done) {
		var movie = {
			actors: ["{name:Gerald Butler}", "{name:Lena Headey}"]
		};

		var error = ova(movie,  {
			actors: { _rules: { type: 'array', elementType: 'jsonString' } }
		});

		error.actors.should.equal('Invalid element type');
		done();
	});

	it('should detect number (integer) elements', function (done) {
		var poll = {
			voterAges: [20, 30, 40]
		};

		var error = ova(poll,  {
			voterAges: { _rules: { type: 'array', elementType: 'number' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect number (decimal) elements', function (done) {
		var spring = {
			temperatures: [15.0, 20.0, 25.0]
		};

		var error = ova(spring,  {
			temperatures: { _rules: { type: 'array', elementType: 'number' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect number (negative) elements', function (done) {
		var winter = {
			temperatures: [-1.0, -5, -10.0]
		};

		var error = ova(winter,  {
			temperatures: { _rules: { type: 'array', elementType: 'number' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-number elements', function (done) {
		var summer = {
			temperatures: ['one', true]
		};

		var error = ova(summer,  {
			temperatures: { _rules: { type: 'array', elementType: 'number' } }
		});

		error.temperatures.should.equal('Invalid element type');
		done();
	});

	it('should detect object elements', function (done) {
		var movie = {
			cast: [{ name: 'Gerald Butler' },  { name: 'Lena Headey' }]
		};

		var error = ova(movie,  {
			cast: { _rules: { type: 'array', elementType: 'object' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-object elements', function (done) {
		var movie = {
			cast: ['Gerald Butler', 'Lena Headey']
		};

		var error = ova(movie,  {
			cast: { _rules: { type: 'array', elementType: 'object' } }
		});

		error.cast.should.equal('Invalid element type');
		done();
	});

	it('should detect string elements', function (done) {
		var poll = {
			votes: ['yes', 'no', 'yes']
		};

		var error = ova(poll,  {
			votes: { _rules: { type: 'array', elementType: 'string' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-string elements', function (done) {
		var poll = {
			votes: [true, false, true]
		};

		var error = ova(poll,  {
			votes: { _rules: { type: 'array', elementType: 'string' } }
		});

		error.votes.should.equal('Invalid element type');
		done();
	});
});

describe('Element null validation', function() {
	it('should detect element can be null and is null', function (done) {
		var computer = {
			memorySlots: ['4GB', null, '4GB', '4GB']
		};

		var error = ova(computer,  {
			memorySlots: { _rules: { type: 'array', elementType: 'string', elementNull: true } }
		});

		should.not.exist(error);
		done();
	});
	
	it('should detect element can be null and is not null', function (done) {
		var computer = {
			memorySlots: ['4GB', '4GB', '4GB', '4GB']
		};

		var error = ova(computer,  {
			memorySlots: { _rules: { type: 'array', elementType: 'string', elementNull: true } }
		});

		should.not.exist(error);
		done();
	});
	
	it('should detect element cannot be null and is null', function (done) {
		var computer = {
			memorySlots: ['4GB', null, '4GB', '4GB']
		};

		var error = ova(computer,  {
			memorySlots: { _rules: { type: 'array', elementType: 'string', elementNull: false } }
		});

		error.memorySlots.should.equal('Element null');
		done();
	});
	
	it('should detect element cannot be null and is not null', function (done) {
		var computer = {
			memorySlots: ['4GB', '4GB', '4GB', '4GB']
		};

		var error = ova(computer,  {
			memorySlots: { _rules: { type: 'array', elementType: 'string', elementNull: false } }
		});

		should.not.exist(error);
		done();
	});
});

describe('Element min validation', function() {
	it('should detect element equals minimum', function (done) {
		var computer = {
			memoryCapacities: [8, 4, 8, 4]
		};

		var error = ova(computer,  {
			memoryCapacities: { _rules: { type: 'array', elementType: 'number', elementMin: 4 } }
		});

		should.not.exist(error);
		done();
	});
	
	it('should detect element above minimum', function (done) {
		var computer = {
			memoryCapacities: [8, 8, 8, 8]
		};

		var error = ova(computer,  {
			memoryCapacities: { _rules: { type: 'array', elementType: 'number', elementMin: 4 } }
		});

		should.not.exist(error);
		done();
	});
	
	it('should detect element below minimum', function (done) {
		var computer = {
			memoryCapacities: [8, 2, 8, 8]
		};

		var error = ova(computer,  {
			memoryCapacities: { _rules: { type: 'array', elementType: 'number', elementMin: 4 } }
		});

		error.memoryCapacities.should.equal('Element below minimum');
		done();
	});
});

describe('Element max validation', function() {
	it('should detect element equals maximum', function (done) {
		var computer = {
			memoryCapacities: [2, 4, 2, 4]
		};

		var error = ova(computer,  {
			memoryCapacities: { _rules: { type: 'array', elementType: 'number', elementMax: 4 } }
		});

		should.not.exist(error);
		done();
	});
	
	it('should detect element above maximum', function (done) {
		var computer = {
			memoryCapacities: [4, 8, 4, 4]
		};

		var error = ova(computer,  {
			memoryCapacities: { _rules: { type: 'array', elementType: 'number', elementMax: 4 } }
		});

		error.memoryCapacities.should.equal('Element above maximum');
		done();
	});
	
	it('should detect element below maximum', function (done) {
		var computer = {
			memoryCapacities: [2, 2, 2, 2]
		};

		var error = ova(computer,  {
			memoryCapacities: { _rules: { type: 'array', elementType: 'number', elementMax: 4 } }
		});

		should.not.exist(error);
		done();
	});
});

describe('Element min length validation', function() {
	it('should detect element string length equals minimum length', function (done) {
		var computer = {
			memoryBrands: ['Corsair', 'S']
		};

		var error = ova(computer,  {
			memoryBrands: { _rules: { type: 'array', elementType: 'string', elementMinLength: 1 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect element string length above minimum length', function (done) {
		var computer = {
			memoryBrands: ['Corsair', 'Samsung']
		};

		var error = ova(computer,  {
			memoryBrands: { _rules: { type: 'array', elementType: 'string', elementMinLength: 1 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect element string length below minimum length', function (done) {
		var computer = {
			memoryBrands: ['Corsair', '']
		};

		var error = ova(computer,  {
			memoryBrands: { _rules: { type: 'array', elementType: 'string', elementMinLength: 1 } }
		});

		error.memoryBrands.should.equal('Element below minimum length');
		done();
	});
});

describe('Element max length validation', function() {
	it('should detect element string length equals maximum length', function (done) {
		var computer = {
			memoryBrands: ['Toshiba', 'Samsung']
		};

		var error = ova(computer,  {
			memoryBrands: { _rules: { type: 'array', elementType: 'string', elementMaxLength: 7 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect element string length above maximum length', function (done) {
		var computer = {
			memoryBrands: ['Samsung', 'Kingston']
		};

		var error = ova(computer,  {
			memoryBrands: { _rules: { type: 'array', elementType: 'string', elementMaxLength: 7 } }
		});

		error.memoryBrands.should.equal('Element above maximum length');
		done();
	});

	it('should detect element string length below maximum length', function (done) {
		var computer = {
			memoryBrands: ['Samsung', 'Corsair']
		};

		var error = ova(computer,  {
			memoryBrands: { _rules: { type: 'array', elementType: 'string', elementMaxLength: 8 } }
		});

		should.not.exist(error);
		done();
	});
});

describe('Required validation', function() {
	it('should not validate undefined property if required is absent', function (done) {
		var computer = {
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string' } },
			processor: { _rules: { type: 'object' } }
		});

		should.not.exist(error);
		done();
	});

	it('should not validate undefined property if required is false', function (done) {
		var computer = {
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string', required: false } },
			processor: { _rules: { type: 'object' } }
		});

		should.not.exist(error);
		done();
	});

	it('should not validate defined property if required is false', function (done) {
		var computer = {
			model: 'MacBook Air',
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string', required: false } },
			processor: { _rules: { type: 'object' } }
		});

		should.not.exist(error);
		done();
	});

	it('should validate undefined property if required is true', function (done) {
		var computer = {
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string', required: true } },
			processor: { _rules: { type: 'object' } }
		});

		error.model.should.equal('Required');
		done();
	});

	it('should validate defined property if required is true', function (done) {
		var computer = {
			model: 'MacBook Air',
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string', required: true } },
			processor: { _rules: { type: 'object' } }
		});

		should.not.exist(error);
		done();
	});
});

describe('Null validation', function() {
	it('should detect value can be null and is null', function (done) {
		var computer = {
			model: null,
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string', null: true } },
			processor: { _rules: { type: 'object' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect value cannot be null and is null', function (done) {
		var computer = {
			model: null,
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string', null: false } },
			processor: { _rules: { type: 'object' } }
		});

		error.model.should.equal('Null');
		done();
	});

	it('should detect value can be null but can be undefined', function (done) {
		var computer = {
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string', null: true, required: false } },
			processor: { _rules: { type: 'object' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect value can be null but cannot be undefined', function (done) {
		var computer = {
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string', null: true, required: true } },
			processor: { _rules: { type: 'object' } }
		});

		error.model.should.equal('Required');
		done();
	});

	it('should detect value can be null and is of correct type', function (done) {
		var computer = {
			model: 'MacBook Air',
			processor: {
				name: 'Intel Core i5',
				speed: '1.8 GHz'
			}
		};

		var error = ova(computer,  {
			model: { _rules: { type: 'string', null: true } },
			processor: { _rules: { type: 'object' } }
		});

		should.not.exist(error);
		done();
	});
});

describe('Equals validation', function() {
	it('should detect value equals target', function (done) {
		var movie = {
			title: '300',
			starRating: 5
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string', eq: '300' } },
			starRating: { _rules: { type: 'number', eq: 5 } }
		});

		should.not.exist(error);
		done();
	});
	
	it('should detect value does not equal target', function (done) {
		var movie = {
			title: '200',
			starRating: 4
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string', eq: '300' } },
			starRating: { _rules: { type: 'number', eq: 5 } }
		});

		error.title.should.equal('Not equal');
		error.starRating.should.equal('Not equal');
		done();
	});
});

describe('Min validation', function() {
	it('should detect value equals minimum', function (done) {
		var movie = {
			title: '300',
			starRating: 1
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			starRating: { _rules: { type: 'number', min: 1 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect value above minimum', function (done) {
		var movie = {
			title: '300',
			starRating: 2
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			starRating: { _rules: { type: 'number', min: 1 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect value below minimum', function (done) {
		var movie = {
			title: '300',
			starRating: 0
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			starRating: { _rules: { type: 'number', min: 1 } }
		});

		error.starRating.should.equal('Below minimum');
		done();
	});
});

describe('Max validation', function() {
	it('should detect value equals maximum', function (done) {
		var movie = {
			title: '300',
			starRating: 5
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			starRating: { _rules: { type: 'number', max: 5 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect value above maximum', function (done) {
		var movie = {
			title: '300',
			starRating: 6
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			starRating: { _rules: { type: 'number', max: 5 } }
		});

		error.starRating.should.equal('Above maximum');
		done();
	});

	it('should detect value below maximum', function (done) {
		var movie = {
			title: '300',
			starRating: 4
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			starRating: { _rules: { type: 'number', max: 5 } }
		});

		should.not.exist(error);
		done();
	});
});

describe('Min length validation', function() {
	it('should detect string length equals minimum length', function (done) {
		var actor = {
			name: 'G'
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string', minLength: 1 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect string length above minimum length', function (done) {
		var actor = {
			name: 'Gerald Butler'
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string', minLength: 1 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect string length below minimum length', function (done) {
		var actor = {
			name: ''
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string', minLength: 1 } }
		});

		error.name.should.equal('Below minimum length');
		done();
	});

	it('should detect array length equals minimum length', function (done) {
		var movie = {
			title: '300',
			cast: ['Gerard Butler', 'Lena Headey']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { type: 'array', minLength: 2 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect array length above minimum length', function (done) {
		var movie = {
			title: '300',
			cast: ['Gerard Butler', 'Lena Headey', 'Michael Fassbender']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { type: 'array', minLength: 2 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect array length below minimum length', function (done) {
		var movie = {
			title: '300',
			cast: ['Gerard Butler']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { type: 'array', minLength: 2 } }
		});

		error.cast.should.equal('Below minimum length');
		done();
	});
});

describe('Max length validation', function() {
	it('should detect string length equals maximum length', function (done) {
		var actor = {
			name: 'Gerald'
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string', maxLength: 6 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect string length above maximum length', function (done) {
		var actor = {
			name: 'Gerald Butler'
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string', maxLength: 6 } }
		});

		error.name.should.equal('Above maximum length');
		done();
	});

	it('should detect string length below maximum length', function (done) {
		var actor = {
			name: 'Geral'
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string', maxLength: 6 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect array length equals maximum length', function (done) {
		var movie = {
			title: '300',
			cast: ['Gerard Butler', 'Lena Headey']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { type: 'array', maxLength: 2 } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect array length above maximum length', function (done) {
		var movie = {
			title: '300',
			cast: ['Gerard Butler', 'Lena Headey', 'Michael Fassbender']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { type: 'array', maxLength: 2 } }
		});

		error.cast.should.equal('Above maximum length');
		done();
	});

	it('should detect array length below maximum length', function (done) {
		var movie = {
			title: '300',
			cast: ['Gerard Butler']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { type: 'array', maxLength: 2 } }
		});

		should.not.exist(error);
		done();
	});
});

describe('enum validation', function() {
	it('should detect value is in enum', function (done) {
		var movie = {
			title: '300',
			rating: 'R'
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			rating: { _rules: { enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'] } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect value is not in enum', function (done) {
		var movie = {
			title: '300',
			rating: 'No Rating'
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			rating: { _rules: { enum: ['G', 'PG', 'PG-13', 'R', 'NC-17'] } }
		});

		error.rating.should.equal('Not in enumeration');
		done();
	});

	it('should detect array is equal to enum (same order)', function (done) {
		var movie = {
			title: '300',
			cast: ['Gerard Butler', 'Lena Headey', 'Michael Fassbender', 'David Wenham']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { enum: ['Gerard Butler', 'Lena Headey', 'Michael Fassbender', 'David Wenham'] } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect array is equal to enum (different order)', function (done) {
		var movie = {
			title: '300',
			cast: ['Lena Headey', 'David Wenham', 'Michael Fassbender', 'Gerard Butler']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { enum: ['Gerard Butler', 'Lena Headey', 'Michael Fassbender', 'David Wenham'] } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect array is subset of enum', function (done) {
		var movie = {
			title: '300',
			cast: ['Gerard Butler', 'Lena Headey', 'Michael Fassbender']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { enum: ['Gerard Butler', 'Lena Headey', 'Michael Fassbender', 'David Wenham'] } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect array is superset of enum', function (done) {
		var movie = {
			title: '300',
			cast: ['Nicholas Cage', 'Gerard Butler', 'Lena Headey', 'Michael Fassbender', 'David Wenham']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { enum: ['Gerard Butler', 'Lena Headey', 'Michael Fassbender', 'David Wenham'] } }
		});

		error.cast.should.equal('Not in enumeration');
		done();
	});

	it('should detect array has nothing from enum', function (done) {
		var movie = {
			title: '300',
			cast: ['Nicholas Cage', 'Christian Bale']
		};

		var error = ova(movie,  {
			title: { _rules: { type: 'string' } },
			cast: { _rules: { enum: ['Gerard Butler', 'Lena Headey', 'Michael Fassbender', 'David Wenham'] } }
		});

		error.cast.should.equal('Not in enumeration');
		done();
	});
});

describe('Regex validation', function() {
	it('should detect matching regex', function (done) {
		var actor = {
			name: 'Gerald Butler',
			email: 'gerald@hollywood.com'
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string' } },
			email: { _rules: { regex: /.+@.+/ } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-matching regex', function (done) {
		var actor = {
			name: 'Gerald Butler',
			email: '@hollywood.com'
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string' } },
			email: { _rules: { regex: /.+@.+/ } }
		});

		error.email.should.equal('Regex mismatch');
		done();
	});

	it('should detect matching regex for each string in array', function (done) {
		var actor = {
			name: 'Gerald Butler',
			tags: ['1man', 'actor', 'strong']
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string' } },
			tags: { _rules: { type: 'array', regex: /^[a-z0-9]{3,}$/ } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-matching regex for each string in array', function (done) {
		var actor = {
			name: 'Gerald Butler',
			tags: ['1man', 'act or', 'strong']
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string' } },
			tags: { _rules: { type: 'array', regex: /^[a-z0-9]{3,}$/ } }
		});

		error.tags.should.equal('Regex mismatch');
		done();
	});

	it('should not detect non-matching regex for each non-string in array if elementType was not specified', function (done) {
		var actor = {
			name: 'Gerald Butler',
			tags: [123]
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string' } },
			tags: { _rules: { type: 'array', regex: /^[a-z0-9]{3,}$/ } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-matching regex for each non-string in array if elementType was specified', function (done) {
		var actor = {
			name: 'Gerald Butler',
			tags: [123]
		};

		var error = ova(actor,  {
			name: { _rules: { type: 'string' } },
			tags: { _rules: { type: 'array', elementType: 'string', regex: /^[a-z0-9]{3,}$/ } }
		});

		error.tags.should.equal('Invalid element type');
		done();
	});
});

describe('Extensibility', function() {
	it('should add custom validator', function (done) {
		var fn = function(val, ruleVal) {
			return (val !== ruleVal ? null : 'Value is disallowed');
		};

		ova.add('disallow', fn);
		done();
	});

	it('should detect disallowed value', function (done) {
		var person = {
			name: 'Stranger'
		};

		var error = ova(person,  {
			name: { _rules: { type: 'string', disallow: 'Stranger' } }
		});

		error.name.should.equal('Value is disallowed');
		done();
	});

	it('should detect non-disallowed value', function (done) {
		var person = {
			name: 'Gerald Butler'
		};

		var error = ova(person,  {
			name: { _rules: { type: 'string', disallow: 'Stranger' } }
		});

		should.not.exist(error);
		done();
	});

	it('should not add custom validator if rule is "required"', function (done) {
		var fn = function(val, ruleVal) {
			return null;
		};

		try {
			ova.add('required', fn);
		}
		catch(err) {
			err.message.should.equal('argument rule must not be required or null');
		}
		finally {
			done();
		}
	});

	it('should not add custom validator if rule is "null"', function (done) {
		var fn = function(val, ruleVal) {
			return null;
		};

		try {
			ova.add('null', fn);
		}
		catch(err) {
			err.message.should.equal('argument rule must not be required or null');
		}
		finally {
			done();
		}
	});

	it('should not add custom validator if fn is not a function', function (done) {
		try {
			ova.add('custom', 'not a function');
		}
		catch(err) {
			err.message.should.equal('argument fn must be a function');
		}
		finally {
			done();
		}
	});

	it('should remove a validator', function (done) {
		ova.remove('disallow');

		try {
			var person = {
				name: 'Stranger'
			};

			var error = ova(person,  {
				name: { _rules: { type: 'string', disallow: 'Stranger' } }
			});
		}
		catch(err) {
			err.message.should.equal('validator for rule "disallow" does not exist');
		}
		finally {
			done();
		}
	});
});
