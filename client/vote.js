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

      const alreadyVoted = localStorage.getItem(votedKey);

      data.forEach((q, qi) => {
        container.innerHTML += `<div class="card"><h3>${q.question}</h3>`;

        q.options.forEach(opt => {
          container.innerHTML += `
            <div class="option ${alreadyVoted ? "disabled" : ""}"
                 onclick="vote(${opt.id})">
              <span>${opt.text}</span>
              <span class="count">${opt.votes}</span>
            </div>
          `;
        });

        container.innerHTML += `</div>`;
      });

      if (alreadyVoted) {
        container.innerHTML += `
          <p class="info">You have already voted.</p>
        `;
      }
    });
}

/* Vote */
function vote(optionId) {
  if (localStorage.getItem(votedKey)) {
    alert("You already voted!");
    return;
  }

  fetch("/vote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionId, pollId })
  }).then(() => {
    localStorage.setItem(votedKey, true);
    loadPoll();
  });
}

socket.on("update", loadPoll);
loadPoll();
