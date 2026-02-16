const params = new URLSearchParams(window.location.search);
const pollId = params.get("id");
const socket = io();

socket.emit("join", pollId);

const votedKey = "voted_" + pollId;

/* Load Poll */
function loadPoll() {
  fetch(`/poll/${pollId}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("poll");
      container.innerHTML = "";

      if (localStorage.getItem(votedKey)) {
        container.innerHTML = "<h3>You have already voted.</h3>";
        return;
      }

      data.forEach((q, qi) => {
        container.innerHTML += `<div class="card"><h3>${q.question}</h3>`;

        q.options.forEach(opt => {
          container.innerHTML += `
            <label class="option">
              <input type="radio" name="q${qi}" value="${opt.id}">
              ${opt.text} (Votes: ${opt.votes})
            </label>
          `;
        });

        container.innerHTML += `</div>`;
      });

      container.innerHTML += `
        <button onclick="submitVote()">Submit Vote</button>
      `;
    });
}


/* Submit Vote */
function submitVote() {
  const questions = document.querySelectorAll(".card");

  let selectedOptions = [];

  questions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);

    if (!selected) {
      alert("Please answer all questions");
      selectedOptions = null;
      return;
    }

    selectedOptions.push(selected.value);
  });

  if (!selectedOptions) return;

  // Send votes for all questions
  Promise.all(
    selectedOptions.map(optionId =>
      fetch("/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId, pollId })
      })
    )
  ).then(() => {
    localStorage.setItem(votedKey, true);
    alert("Vote submitted successfully!");
    loadPoll();
  });
}

socket.on("update", loadPoll);
loadPoll();
