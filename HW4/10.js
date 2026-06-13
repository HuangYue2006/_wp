let students = [
  { name: "Tom", score: 85 },
  { name: "Amy", score: 55 }
];

function checkPass(score) {
  return score >= 60 ? "及格" : "不及格";
}

for (let i = 0; i < students.length; i++) {
  let result = {
    name: students[i].name,
    score: students[i].score,
    status: checkPass(students[i].score)
  };

  console.log(JSON.stringify(result));
}