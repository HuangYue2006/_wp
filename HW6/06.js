function myFilter(arr, callback) {
  const result = [];

  for (let item of arr) {
    if (callback(item)) {
      result.push(item);
    }
  }

  return result;
}

console.log(myFilter([1, 5, 8, 12], x => x > 7)); 
// [8, 12]