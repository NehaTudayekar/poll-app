const params = new URLSearchParams(window.location.search);
const pollId = params.get("id");
const socket = io();

socket.emit("join", pollId);

const votedKey = "voted_" + pollId;
let selectedOptions = {}; // store answers

function loadPoll() {
  fetch(`/poll/${pollId}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("poll");
      container.innerHTML = "";

      if (localStorage.getItem(votedKey)) {
        document.getElementById("msg").innerText = "You already voted.";
        document.getElementById("submitBtn").style.display = "none";
      }

      data.forEach((q, qi) => {
        container.innerHTML += `<div class="card"><h3>${q.question}</h3>`;

        q.options.forEach(opt => {
          container.innerHTML += `
            <div class="option" onclick="selectOption(${qi}, ${opt.id}, this)">
              ${opt.text} - Votes: ${opt.votes}
            </div>
          `;
        });

        container.innerHTML += `</div>`;
      });
    });
}

/* Select option (one per question) */
function selectOption(questionIndex, optionId, element) {
  if (localStorage.getItem(votedKey)) return;

  // Remove highlight from same question
  const card = element.parentElement;
  card.querySelectorAll(".option").forEach(opt => {
    opt.style.background = "white";
  });

  element.style.background = "#cce5ff";
  selectedOptions[questionIndex] = optionId;
}

/* Submit votes */
function submitVotes() {
  if (localStorage.getItem(votedKey)) return;

  const totalQuestions = document.querySelectorAll(".card").length;

  if (Object.keys(selectedOptions).length !== totalQuestions) {
    alert("Please answer all questions!");
    return;
  }

  // Send vote for each selected option
  Object.values(selectedOptions).forEach(optionId => {
    fetch("/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId, pollId })
    });
  });

  localStorage.setItem(votedKey, true);
  document.getElementById("msg").innerText = "Vote submitted successfully!";
  document.getElementById("submitBtn").style.display = "none";
}

socket.on("update", loadPoll);
loadPoll();
