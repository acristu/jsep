(function() {
var binops = {
	"+" : function(a, b) { return a + b; },
	"-" : function(a, b) { return a - b; },
	"*" : function(a, b) { return a * b; },
	"/" : function(a, b) { return a / b; },
	"%" : function(a, b) { return a % b; }
};
var unops = {
	"-" : function(a) { return -a; },
	"+" : function(a) { return -a; }
};

var do_eval = function(node) {
	if(node.type === "BinaryExpression") {
		return binops[node.operator](do_eval(node.left), do_eval(node.right));
	} else if(node.type === "UnaryExpression") {
		return unops[node.operator](do_eval(node.argument));
	} else if(node.type === "Literal") {
		return node.value;
	}
};

var test_op_expession = function(str) {
	equal(do_eval(cleanup_literals(jsep(str))), eval(str));
};

var filter_props = function(larger, smaller) {
	var rv = (typeof larger.length === 'number') ? [] : {};
	var prop_val;
	for(var prop_name in smaller) {
		prop_val  = smaller[prop_name];
		if(typeof prop_val === 'string' || typeof prop_val === 'number') {
			rv[prop_name] = larger[prop_name];
		} else {
			rv[prop_name] = filter_props(larger[prop_name], prop_val);
		}
	}
	return rv;
};

var parse = jsep;
var test_parser = function(inp, out) {
	var parse_val = parse(inp);
	return deepEqual(cleanup_literals(filter_props(parse_val, out)), out);
};
var esprima_comparison_test = function(str) {
	var jsep_val = jsep(str),
		esprima_val = esprima.parse(str);
	return deepEqual(cleanup_literals(cleanup_debug_fields(jsep_val)), esprima_val.body[0].expression);
};
function cleanup_debug_fields(jsep_val) {
	if (jsep_val.startIndex != null) delete jsep_val.startIndex;
	if (jsep_val.endIndex != null) delete jsep_val.endIndex;
	if (jsep_val.origExpr != null) delete jsep_val.origExpr;
	for(var prop_name in jsep_val) {
		prop_val  = jsep_val[prop_name];
		if (typeof prop_val === 'object') {
			jsep_val[prop_name] = cleanup_debug_fields(prop_val);
		}
	}
	return jsep_val;
}
function cleanup_literals(jsep_val) {
	if (jsep_val.type === 'NumberLiteral') jsep_val.type = 'Literal';
	if (jsep_val.type === 'StringLiteral') jsep_val.type = 'Literal';
	for(var prop_name in jsep_val) {
		prop_val  = jsep_val[prop_name];
		if (typeof prop_val === 'object') {
			jsep_val[prop_name] = cleanup_literals(prop_val);
		}
	}
	return jsep_val;
}

module("Expression Parser");

test('Constants', function() {
	test_parser("'abc'", {value: "abc"});
	test_parser('"abc"', {value: "abc"});
	test_parser("123", {value: 123});
	test_parser("12.3", {value: 12.3});
});

test('Variables', function() {
	test_parser("abc", {name: "abc"});
	test_parser("a.b[c[0]]", {
		property: {
			type: "MemberExpression"
		}
	});
    test_parser("Δέλτα", {name: "Δέλτα"});
});

test('Function Calls', function() {
	//test_parser("a(b, c(d,e), f)", {});
	test_parser("a b + c", {});
	test_parser(";", {});
});

test('Arrays', function() {
	test_parser("[]", {type: 'ArrayExpression', elements: []});

	test_parser("[a]", {
		type: 'ArrayExpression',
		elements: [{type: 'Identifier', name: 'a'}]
	});
});

test('Ops', function() {
	test_op_expession("1");
	test_op_expession("1+2");
	test_op_expession("1*2");
	test_op_expession("1*(2+3)");
	test_op_expession("(1+2)*3");
	test_op_expession("(1+2)*3+4-2-5+2/2*3");
	test_op_expession("1 + 2-   3*	4 /8");
	test_op_expession("\n1\r\n+\n2\n");
});

test('Custom operators', function() {
	jsep.addBinaryOp("^", 10);
	test_parser("a^b", {});

    jsep.addBinaryOp("×", 9);
    test_parser("a×b", {
        type: 'BinaryExpression',
        left: {name: 'a'},
        right: {name: 'b'}
    });

	jsep.addUnaryOp("#");
	test_parser("#a", {
		type: "UnaryExpression",
		operator: "#",
		argument: {type: "Identifier", name: "a"}
	});
});

test('Custom alphanumeric operators', function() {
	jsep.addBinaryOp("and", 2);
	test_parser("a and b", {
		type: "BinaryExpression",
		operator: "and",
		left: {type: "Identifier", name: "a"},
		right: {type: "Identifier", name: "b"}
	});
	test_parser("bands", {type: "Identifier", name: "bands"});
	// TODO: https://github.com/soney/jsep/issues/68
	//test_parser("b ands", {type: "Compound"});

	jsep.addUnaryOp("not");
	test_parser("not a", {
		type: "UnaryExpression",
		operator: "not",
		argument: {type: "Identifier", name: "a"}
	});
	// TODO: https://github.com/soney/jsep/issues/68
	//test_parser("notes", {type: "Identifier", name: "notes"});
});

test('Bad Numbers', function() {
	test_parser("1.", {type: "Literal", value: 1, raw: "1."});

	throws(function(){
		var x = jsep("1.2.3");
	});
});

test('Uncompleted expression-call/array', function() {
	throws(function(){
		var x = jsep("myFunction(a,b");
	}, "detects unfinished expression call");
	throws(function(){
		var x = jsep("[1,2");
	}, "detects unfinished array");
});

test('Esprima Comparison', function() {
	([
		" true",
		"false ",
		" 1.2 ",
		" .2 ",
		"a",
		"a .b",
		"a.b. c",
		"a [b]",
		"a.b  [ c ] ",
		"$foo[ bar][ baz].other12 ['lawl'][12]",
		"$foo     [ 12	] [ baz[z]    ].other12*4 + 1 ",
		"$foo[ bar][ baz]    (a, bb ,   c  )   .other12 ['lawl'][12]",
		"(a(b(c[!d]).e).f+'hi'==2) === true",
		"(Object.variable.toLowerCase()).length == 3",
		"(Object.variable.toLowerCase())  .  length == 3",
		"[1] + [2]"
	]).map(esprima_comparison_test);
});

test('Ternary', function() {
	var val = jsep('a ? b : c');
	equal(val.type, 'ConditionalExpression');
	val = jsep('a||b ? c : d');
	equal(val.type, 'ConditionalExpression');
});

test('origExpr/startIndex/endIndex', function () {
	jsep.addLiteral('@', '@');

	var parsed_expr = jsep('12 + func(a) - func2(b)');
	equal(parsed_expr.left.type, "BinaryExpression", "origExpr for BinaryExpression");
	equal(parsed_expr.left.origExpr, "12 + func(a)", "origExpr for BinaryExpression");
	
	var parsed_expr = jsep('[FLOOR(@[idx]/4) * 4, @[idx]]');
	equal(parsed_expr.type, "ArrayExpression", "origExpr type for ArrayExpression");
	equal(parsed_expr.origExpr, "[FLOOR(@[idx]/4) * 4, @[idx]]");

	var parsed_expr = jsep('@[name]');
	equal(parsed_expr.type, "MemberExpression", "origExpr type for UnaryExpression");
	equal(parsed_expr.origExpr, "@[name]");

	var parsed_expr = jsep("12 + X['abc123()[]!'] - Y['!@#$%^&*()as_']");
	equal(parsed_expr.left.type, "BinaryExpression");
	equal(parsed_expr.left.origExpr, "12 + X['abc123()[]!']");
	equal(parsed_expr.left.right.type, "MemberExpression");
	equal(parsed_expr.left.right.origExpr, "X['abc123()[]!']", "origExpr for MemberExpression with string literal property");
});

test('forceParseIncompleteExpr', function () {
	var parsed_expr = jsep('SUM(1', true);
	equal(parsed_expr.type, "CallExpression");
	equal(parsed_expr.origExpr, "SUM(1)");
	var parsed_expr = jsep('a + ', true);
	equal(parsed_expr.type, "BinaryExpression");
	var parsed_expr = jsep('f(1) + g(', true);
	equal(parsed_expr.type, "BinaryExpression");
	equal(parsed_expr.origExpr, "f(1) + g()");
	var parsed_expr = jsep('[a, b', true);
	equal(parsed_expr.type, "ArrayExpression");
	equal(parsed_expr.origExpr, "[a, b]");
	var parsed_expr = jsep('FUNC(A.', true);
	equal(parsed_expr.type, "CallExpression");
	equal(parsed_expr.origExpr, "FUNC(A.identifier_expected)");
});

}());
