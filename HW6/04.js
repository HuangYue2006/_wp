function cleanData(arr) {
  arr.pop();        // 移除最後一個
  arr.unshift("Start"); // 加到最前面
}

let myData = [1, 2, 3];
cleanData(myData);

console.log(myData); 