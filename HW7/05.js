function fetchData(id, callback) {
  const fakeData = {
    id: id,
    status: "success"
  };

  callback(null, fakeData);
}

fetchData(101, (err, data) => {
  if (err) {
    console.log("錯誤：" + err);
  } else {
    console.log("成功：", data);
  }
});