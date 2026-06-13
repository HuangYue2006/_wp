function checkAdmin(role, callback) {
  if (role !== "admin") {
    callback("Access Denied");
  } else {
    callback(null, "Welcome");
  }
}

checkAdmin("user", (err, msg) => {
  if (err) {
    console.log(err);
  } else {
    console.log(msg);
  }
});