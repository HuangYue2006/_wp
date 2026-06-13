function fakeGet(sql, params, callback) {
  callback(null, { title: "Fake Title" });
}

fakeGet("SELECT *", [], (err, row) => {
  if (err) {
    console.log("錯誤");
  } else {
    console.log(row.title);
  }
});