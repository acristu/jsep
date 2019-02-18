var jsep = require("../src/jsep"); 

jsep.addLiteral("@", "@"); 

// console.log(JSON.stringify(jsep.parse("@[x]"), null, 4));
console.log(JSON.stringify(jsep.parse("a+", true), null, 4));
