function calculateTotal(cart, discountFunc) {
  const sum = cart.reduce((acc, val) => acc + val, 0);
  return discountFunc(sum);
}

// 測試
const result = calculateTotal([100, 200, 300], total => total - 50);

console.log(result); // 550