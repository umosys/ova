var ObjectID = null;

try {
	ObjectID = require('mongodb').ObjectID;
}
catch(err) {}

module.exports = function(object, schema) {
	return validate(object, schema);
};

// http://stackoverflow.com/questions/7065120/calling-a-javascript-function-recursively
var validate = function recursive(object, schema) {
	var rules = schema._rules;

	if (typeof rules === 'object') {
		// not specifying required is the same specifying required is false
		// so skip any validation for this object since its undefined and not required
		if ((typeof rules.required === 'undefined' || rules.required === false) && typeof object === 'undefined')
			return null;
		
		// required, null, type, elementNull, elementType must be run first before other rules if they are provided
		if (typeof rules.required === 'boolean') { // run required validator first if specified
			var invalid = validators['required'](object, rules['required']);

			if (invalid)
				return invalid;
		}

		if (typeof rules.null === 'boolean') { // run null validator second if specified
			var invalid = validators['null'](object, rules['null']);

			if (invalid)
				return invalid;
		}
		
		if (typeof rules.type === 'string') {
			var invalid = validators['type'](object, rules['type']);

			if (invalid)
				return invalid;
		}
		
		if (typeof rules.elementNull === 'boolean') {
			var invalid = validators['elementNull'](object, rules['elementNull']);

			if (invalid)
				return invalid;
		}
		
		if (typeof rules.elementType === 'string') {
			var invalid = validators['elementType'](object, rules['elementType']);

			if (invalid)
				return invalid;
		}

		for (var rule in rules) {
			if (rule == 'required' || rule == 'null' || rule == 'type' || rule == 'elementNull' || rule == 'elementType')
				continue;

			var validator = validators[rule];

			if (typeof validator === 'undefined')
				throw new Error('validator for rule "' + rule + '" does not exist');

			var invalid = validator(object, rules[rule]);

			if (invalid) {
				return invalid; // return the error and don't drill down any deeper
			}
		}
	}

	var error = null;

	for (var prop in schema) {
		if (prop == '_rules')
			continue;

		var subobject = object[prop];
		var subschema = schema[prop];

		if (typeof subschema !== 'object')
			throw new TypeError('non-object for property in schema');

		var subErr = recursive(subobject, subschema);

		if (subErr) {
			if (error == null)
				error = {};

			error[prop] = subErr;
		}
	}

	return error;
};

var validateRequired = function(val, ruleVal) {
	return (ruleVal === true && typeof val === 'undefined' ? 'Required' : null);
};

var validateNull = function(val, ruleVal) {
	if (typeof val == 'undefined')
		return null;
	
	return (ruleVal === false && val == null ? 'Null' : null);
};

var validateType = function(val, ruleVal) {
	if (val == null)
		return null;

	var errorMsg = 'Invalid type';

	switch (ruleVal) {
		case 'array':
			if (!Array.isArray(val))
				return errorMsg;
			break;
		case 'boolean':
			if (typeof val != 'boolean')
				return errorMsg;
			break;
		case 'date':
			// http://stackoverflow.com/questions/643782/how-to-check-whether-an-object-is-a-date
			if (Object.prototype.toString.call(val) !== '[object Date]')
				return errorMsg;
			break;
		case 'dateString':
			if (isNaN(Date.parse(val)))
				return errorMsg;
			break;
		case 'jsonString':
			try {
				JSON.parse(val);
			}
			catch(e) {
				return errorMsg;
			}
			break;
		case 'number':
			if (typeof val != 'number')
				return errorMsg;
			break;
		case 'numberString':
			if (isNaN(val))
				return errorMsg;
			break;
		case 'object':
			if (typeof val != 'object')
				return errorMsg;
			break;
		case 'objectId':
			if (typeof val.toHexString !== 'function')
				return errorMsg;
			break;
		case 'objectIdString':
			if (ObjectID == null) {
				throw new Error('MongoDB package required. Use npm i mongodb');
			}
			
			if (!ObjectID.isValid(val))
				return errorMsg;
			break;
		case 'string':
			if (typeof val != 'string')
				return errorMsg;
			break;
		default:
			throw new Error('unsupported type');
	}

	return null;
};

var validateElementType = function(val, ruleVal) {
	if (val == null)
		return null;

	for (var i = 0; i < val.length; i++) {
		var invalidElementType = validateType(val[i], ruleVal);

		if (invalidElementType)
			return 'Invalid element type';
	}

	return null;
};

var validateElementNull = function(val, ruleVal) {
	if (val == null || ruleVal == true)
		return null;

	for (var i = 0; i < val.length; i++) {
		const element = val[i];
		
		if (element == null) {
			return 'Element null';
		}
	}

	return null;
};

var validateElementMin = function(val, ruleVal) {
	if (val == null)
		return null;

	for (var i = 0; i < val.length; i++) {
		const element = val[i];
		
		if (typeof element != 'number') {
			continue;
		}
		
		if (element < ruleVal) {
			return 'Element below minimum';
		}
	}

	return null;
};

var validateElementMax = function(val, ruleVal) {
	if (val == null)
		return null;

	for (var i = 0; i < val.length; i++) {
		const element = val[i];
		
		if (typeof element != 'number') {
			continue;
		}
		
		if (element > ruleVal) {
			return 'Element above maximum';
		}
	}

	return null;
};

var validateElementMinLength = function(val, ruleVal) {
	if (val == null)
		return null;

	for (var i = 0; i < val.length; i++) {
		const element = val[i];
		
		if (typeof element != 'string') {
			continue;
		}
		
		if (element.length < ruleVal) {
			return 'Element below minimum length';
		}
	}

	return null;
};

var validateElementMaxLength = function(val, ruleVal) {
	if (val == null)
		return null;

	for (var i = 0; i < val.length; i++) {
		const element = val[i];
		
		if (typeof element != 'string') {
			continue;
		}
		
		if (element.length > ruleVal) {
			return 'Element above maximum length';
		}
	}

	return null;
};


var validateEq = function(val, ruleVal) {
	if (val == null)
		return null;

	return (val !== ruleVal ? 'Not equal' : null);
};

var validateMin = function(val, ruleVal) {
	if (val == null)
		return null;

	return (val < ruleVal ? 'Below minimum' : null);
};

var validateMax = function(val, ruleVal) {
	if (val == null)
		return null;

	return (val > ruleVal ? 'Above maximum' : null);
};

var validateMinLength = function(val, ruleVal) {
	if (val == null)
		return null;

	return (val.length < ruleVal ? 'Below minimum length' : null);
};

var validateMaxLength = function(val, ruleVal) {
	if (val == null)
		return null;

	return (val.length > ruleVal ? 'Above maximum length' : null);
};

// Checks if array/string/object is empty
var validateEmpty = function(val, ruleVal) {
	if (val == null)
		return null;
		
	switch (typeof val) {
		case 'string':
			if (!ruleVal && val.length == 0) {
				return 'Empty string';
			}
			break;
		case 'object':
			if (!ruleVal) {
				if (Array.isArray(val) && val.length == 0) {
					return 'Empty array';
				}
				
				if (Object.keys(val).length === 0 && val.constructor === Object) {
					return 'Empty object';
				}
			}
			break;
		default:
			return 'Not object, array or string'
			break;
	}
	
	return null;
};

// Support array and non-array types
var validateEnum = function(val, ruleVal) {
	if (val == null)
		return null;

	if (validateType(val, 'array') == null) {
		for (var i = 0; i < val.length; i++) {
			if (ruleVal.indexOf(val[i]) < 0)
				return 'Not in enumeration';
		}
	}
	else {
		if (ruleVal.indexOf(val) < 0)
			return 'Not in enumeration';
	}

	return null;
};

var validateRegex = function(val, ruleVal) {
	if (val == null)
		return null;

	if (validateType(val, 'array') == null) {
		for (var i = 0; i < val.length; i++) {
			if (!ruleVal.test(val[i]))
				return 'Regex mismatch';
		}

		return null;
	}
	else {
		return (!ruleVal.test(val) ? 'Regex mismatch' : null);
	}
};

var validators = {
	required: validateRequired,
	null: validateNull,
	type: validateType,
	eq: validateEq,
	min: validateMin,
	max: validateMax,
	minLength: validateMinLength,
	maxLength: validateMaxLength,
	elementNull: validateElementNull,
	elementType: validateElementType,
	elementMin: validateElementMin,
	elementMax: validateElementMax,
	elementMinLength: validateElementMinLength,
	elementMaxLength: validateElementMaxLength,
	enum: validateEnum,
	empty: validateEmpty,
	regex: validateRegex
};

/**
 * Add custom validator
 * @param rule - Name of the rule to be used in _rule in schema. Cannot be 'required' or 'null'
 * @param fn - Validator function. Must have signature (val, ruleVal)
 */
module.exports.add = function(rule, fn) {
	if (rule === 'required' || rule === 'null')
		throw new Error('argument rule must not be required or null');

	if (typeof fn !== 'function')
		throw new TypeError('argument fn must be a function');

	validators[rule] = fn;
};

/**
 * Remove a validator
 * @param rule - Cannot be 'required' or 'null'
 */
module.exports.remove = function(rule) {
	if (rule === 'required' || rule === 'null')
		throw new Error('argument rule must not be required or null');

	delete validators[rule];
};