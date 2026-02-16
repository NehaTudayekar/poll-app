function goNext() {
  const num = document.getElementById("numQ").value;

  if (num < 1) {
    alert("Enter at least 1 question");
    return;
  }

  localStorage.setItem("numQ", num);
  window.location = "step2.html";
}
