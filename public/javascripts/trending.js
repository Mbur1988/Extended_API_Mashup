// Fetch and display requested data from Bing API
const fetcher = (event) => {
  const name = event.target.className; // button type
  const trend = event.target.parentElement.firstChild.textContent.substring(1); // parent trend
  const amount = event.path[1].childNodes[5].value; // amount of results to fetch
  fetch(`/trending/${name}/${trend}/${amount}`) // fetch requested data from Bing API
    .then((res) => res.json()).then((data) => {
      let canvas = event.path[4].childNodes[1];
      // if data is already being displayed on canvas then remove it first
      if (canvas.childNodes.length > 1) {
        for (let i = canvas.childNodes.length - 1; i > 0; i--) { // iterate through currently displayed data
          canvas.childNodes[i].remove(); // remove currently displayed data
        }
      }
      let h1 = document.createElement("h1");
      h1.className = "trending";
      h1.textContent = `Displaying ${name} related to " ${trend}"`;
      canvas.append(h1);
      // display news if news button was pressed
      if (name == "news") { // check if button press was news
        for (let story of data.stories) { // iterate through news stories
          let p = document.createElement("p"); // create p element
          let a = document.createElement("a"); // create a element
          a.href = story.url; // set link url of a element
          a.textContent = story.name // set text of a element
          p.appendChild(a); // append a to p
          canvas.append(p); // append p to document
        }
      // display images if pics button was pressed
      } else if (name == "pics") { // check if button press was pics
        for (let story of data.stories) { // iterate through pics
          let img = document.createElement("img"); // create img element 
          img.src = story.contentUrl; // set source url of img element
          img.alt = story.name; // set alternate text of img element 
          img.height = "200"; // set img height
          canvas.append(" ", img); // append img to document
        }
      }
    })
    .catch((error) => console.log(error)); // catch any errors
};

// Add an event listeners to buttons
const news = document.getElementsByClassName("news");
const pics = document.getElementsByClassName("pics");
for (let button of news) {
  button.addEventListener("click", (event) => fetcher(event));
}
for (let button of pics) {
  button.addEventListener("click", (event) => fetcher(event));
}
