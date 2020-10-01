// Fetch and display requested data from Bing API
const fetcher = (event) => {
  const name = event.target.className; // button type
  const trend = event.target.parentElement.firstChild.textContent.substring(1); // parent trend
  fetch(`/trending/${name}/${trend}`) // fetch requested data from Bing API
    .then((res) => res.json()).then((data) => {
      let parent = event.target.parentElement; // parent element of event
      let current = ""; // initialise empty string
      if (parent.childNodes.length > 4) { // check for data currently displayed
        if (parent.childNodes[4].nodeName == "BR") { current = "pics" } // currently displaying pics
        else if (parent.childNodes[4].nodeName == "P") { current = "news" } // currently displaying news
        for (let i = parent.childNodes.length - 1; i > 3; i--) { // iterate through currently displayed data
          parent.childNodes[i].remove(); // remove currently displayed data
        }
      }
      if (name == "news" && name != current) { // check if button press was news
        for (let story of data.stories) { // iterate through news stories
          let p = document.createElement("p"); // create p element
          let a = document.createElement("a"); // create a element
          a.href = story.url; // set link url of a element
          a.textContent = story.name // set text of a element
          p.appendChild(a); // append a to p
          parent.append(p); // append p to document
        }
      } else if (name == "pics" && name != current) { // check if button press was pics
        parent.append(document.createElement("br")); // add new line element
        for (let story of data.stories) { // iterate through pics
          let img = document.createElement("img"); // create img element 
          img.src = story.contentUrl; // set source url of img element
          img.alt = story.name; // set alternate text of img element 
          img.height = "200"; // set img height
          parent.append(" ", img); // append img to document
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
