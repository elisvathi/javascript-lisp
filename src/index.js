const { eval_code, printItem} = require('./interpreter');
const parse= require('./parser');
const fs = require('fs');
const code = fs.readFileSync("examples/test.lisp").toString();
const parsed = parse(code);
const result = parsed.map(eval_code).filter(x=>x!== null);
result.filter(x=>x !== null && x !== undefined).forEach(x=>console.log(printItem(x)));

// return this.service.setTrackCover(track_id, body.picture, ext);
