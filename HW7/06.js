const jsonStr = '{"title": "Post 1", "tags": ["js", "node"]}';

let obj = JSON.parse(jsonStr);

console.log(obj.tags[1]); // node