// Navigate to trending route when event triggered
const go = (event) => {
    window.location.href = window.location.href + 'trending/' + input.value;
}

// Add event listners to the search button and link enter key press
const button = document.getElementsByClassName("search")[0];
const input = document.getElementsByClassName("input")[0];
button.addEventListener("click", (event) => go(event));
input.addEventListener("keyup", function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      button.click();
    }
  });