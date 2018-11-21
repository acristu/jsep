var jsep = require("../src/jsep"); 

jsep.addLiteral("@", "@"); 

console.log(JSON.stringify(jsep("@[x]"), null, 4));
