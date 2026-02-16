const numQ = localStorage.getItem("numQ");
const formArea = document.getElementById("formArea");

for (let i = 0; i < numQ; i++) {
  formArea.innerHTML += `
    <div class="card">
      <input placeholder="Question ${i + 1}" id="q${i}">
      <input placeholder="Option 1" id="q${i}o1">
      <input placeholder="Option 2" id="q${i}o2">
      <input placeholder="Option 3" id="q${i}o3">
      <input placeholder="Option 4" id="q${i}o4">
    </div>
  `;
}

function createPoll() {
  let questions = [];

  for (let i = 0; i < numQ; i++) {
    const question = document.getElementById(`q${i}`).value.trim();
    if (!question) {
      alert("All questions must be filled");
      return;
    }

    let options = [];
    for (let j = 1; j <= 4; j++) {
      const opt = document.getElementById(`q${i}o${j}`).value.trim();
      if (opt) options.push(opt);
    }

    if (options.length < 2) {
      alert("Each question needs at least 2 options");
      return;
    }

    questions.push({ question, options });
  }

  fetch("/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questions })
  })
  .then(res => res.json())
  .then(data => {
    localStorage.setItem("link", data.link);
    window.location = "success.html";
  });
}
