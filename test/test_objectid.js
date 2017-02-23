var should = require('should'),
	ObjectID = require('mongodb').ObjectID,
	ova = require('../index.js');

describe('Type validation', function() {
	it('should detect Object ID', function (done) {
		var actor = {
			id: ObjectID(),
			name: 'Gerald Butler'
		};

		var error = ova(actor,  {
			id: { _rules: { type: 'objectId' } },
			name: { _rules: { type: 'string' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-Object ID', function (done) {
		var actor = {
			id: 'abc',
			name: 'Gerald Butler'
		};

		var error = ova(actor,  {
			id: { _rules: { type: 'objectId' } },
			name: { _rules: { type: 'string' } }
		});

		error.id.should.equal('Invalid type');
		done();
	});

	it('should detect Object ID string', function (done) {
		var actor = {
			id: ObjectID().toString(),
			name: 'Gerald Butler'
		};

		var error = ova(actor,  {
			id: { _rules: { type: 'objectIdString' } },
			name: { _rules: { type: 'string' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-Object ID string', function (done) {
		var actor = {
			id: '123',
			name: 'Gerald Butler'
		};

		var error = ova(actor,  {
			id: { _rules: { type: 'objectIdString' } },
			actor: { _rules: { type: 'string' } }
		});

		error.id.should.equal('Invalid type');
		done();
	});
});

describe('Array type validation', function() {
	it('should detect Object ID elements', function (done) {
		var database = {
			entries: [ObjectID(), ObjectID()]
		};

		var error = ova(database,  {
			entries: { _rules: { type: 'array', arrayType: 'objectId' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-Object ID elements', function (done) {
		var database = {
			entries: ['123', '456']
		};

		var error = ova(database,  {
			entries: { _rules: { type: 'array', arrayType: 'objectId' } }
		});

		error.entries.should.equal('Invalid element type');
		done();
	});

	it('should detect Object ID string elements', function (done) {
		var table = {
			entries: [ObjectID().toString(), ObjectID().toString(), ObjectID().toString()]
		};

		var error = ova(table,  {
			entries: { _rules: { type: 'array', arrayType: 'objectIdString' } }
		});

		should.not.exist(error);
		done();
	});

	it('should detect non-Object ID string elements', function (done) {
		var table = {
			entries: ['123', '456', '789']
		};

		var error = ova(table,  {
			entries: { _rules: { type: 'array', arrayType: 'objectIdString' } }
		});

		error.entries.should.equal('Invalid element type');
		done();
	});
});
