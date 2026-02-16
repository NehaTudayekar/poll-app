function generate() {
  const count = document.getElementById("qCount").value;
  const form = document.getElementById("form");
  form.innerHTML = "";

  for (let i = 0; i < count; i++) {
    let html = `<h3>Question ${i+1}</h3>
      <input class="question" placeholder="Question text"><br>`;

    for (let j = 0; j < 4; j++) {
      html += `<input class="option" placeholder="Option ${j+1}"><br>`;
    }

    form.innerHTML += html;
  }
}

async function submitPoll() {
  const questions = [];
  const qElems = document.querySelectorAll(".question");
  const optElems = document.querySelectorAll(".option");

  let index = 0;

  qElems.forEach(q => {
    const opts = [];
    for (let i = 0; i < 4; i++) {
      const val = optElems[index++].value;
      if (val) opts.push(val);
    }

    if (opts.length < 2) {
      alert("Each question needs at least 2 options");
      return;
    }

    questions.push({
      question: q.value,
      options: opts
    });
  });

  const res = await fetch("/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questions })
  });

  const data = await res.json();
  document.getElementById("link").innerHTML =
    "Share this link: <a href='" + data.link + "'>" + location.origin + data.link + "</a>";
}
