let listA = [1, 2];
let listB = [3, 4];

function process(a, b) {
  a.push(99);   // 會影響外部陣列
  b = [100];    // 只是重新指向，不影響外部
}

process(listA, listB);

console.log(listA); // [1, 2, 99]
console.log(listB); // [3, 4]