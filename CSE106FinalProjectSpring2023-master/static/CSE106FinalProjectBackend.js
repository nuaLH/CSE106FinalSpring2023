//just added some functions we might need, add and remove any function as needed
function login() {
  const username = encodeURIComponent(
    document.getElementById("username").value
  );
  const password = encodeURIComponent(
    document.getElementById("password").value
  );
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/login");
  xhttp.setRequestHeader("Content-Type", "application/json");
  const data = JSON.stringify({ username: username, password: password });
  xhttp.send(data);
  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);
    if (response.error) {
      document.getElementById("demo").innerHTML = response.error;
    } else {
      window.location.href = response.redirect;
    }
  };
}

function logout() {
  console.log("logout");
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/logout");
  xhttp.send();
  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);
    if (response.error) {
      document.getElementById("demo").innerHTML = response.error;
    } else {
      window.location.href = response.redirect;
    }
  };
}

function register() {
  const username = encodeURIComponent(
    document.getElementById("username-reg").value
  );
  const nickname = encodeURIComponent(
    document.getElementById("nickname-reg").value
  );
  const password = encodeURIComponent(
    document.getElementById("password-reg").value
  );
  const confirm = encodeURIComponent(document.getElementById("confirm").value);
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/register");
  xhttp.setRequestHeader("Content-Type", "application/json");
  const data = JSON.stringify({
    username: username,
    nickname: nickname,
    password: password,
    confirm: confirm,
  });
  xhttp.send(data);
  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);
    if (response.error) {
      document.getElementById("demo1").innerHTML = response.error;
    } else {
      window.location.href = response.redirect;
    }
  };
}

function openHomePage() {
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/home");
  xhttp.send();

  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);
    if (response.error) {
      document.getElementById("demo").innerHTML = response.error;
    } else {
      window.location.href = response.redirect;
    }
  };
}

function profile(id) {
  console.log("onclick!");
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/profile?id=" + id);
  // xhttp.setRequestHeader("Content-Type", "application/json");
  console.log(id);
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // Redirect to the profile page
      window.location.href = "/profile?id=" + id;
    }
  };
  xhttp.send();
}

//makes a popout when clicking on the twit button
function popout() {
  var createPost = document.getElementById("modalPost");
  createPost.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
function closeModal() {
  document.getElementById("modalPost").style.display = "none";
}

function popoutRegister() {
  var createPost = document.getElementById("modalRegister");
  createPost.style.display = "block";
}

function popoutComment() {
  var createComment = document.getElementById("modalComment");
  createComment.style.display = "block";
}

function closepopoutComment() {
  document.getElementById("modalComment").style.display = "none";
}

function closemodalRegister() {
  document.getElementById("modalRegister").style.display = "none";
}
// When the user clicks anywhere outside of the modal, close it
window.addEventListener("click", function (event) {
  if (event.target == document.getElementById("modalPost")) {
    document.getElementById("modalPost").style.display = "none";
  }
});

window.addEventListener("click", function (event) {
  if (event.target == document.getElementById("modalRegister")) {
    document.getElementById("modalRegister").style.display = "none";
  }
});

window.addEventListener("click", function (event) {
  if (event.target == document.getElementById("modalComment")) {
    document.getElementById("modalComment").style.display = "none";
  }
});

//Loads website before running this code
window.onload = function () {

  // let testNames = ["Jess", "Tom", "Stew", "Bob",
  //   "Michael",
  //   "Christopher",
  //   "Jessica",
  //   "Matthew",
  //   "Ashley",
  //   "Jennifer",
  //   "Joshua",
  //   "Amanda",
  //   "Daniel",
  //   "David",
  //   "James",
  //   "Robert",
  //   "John",
  //   "Joseph",
  //   "Andrew",
  //   "Ryan",
  //   "Brandon",
  //   "Jason",
  //   "Justin",
  //   "Sarah",
  //   "William",
  //   "Jonathan",
  //   "Stephanie"];




  const searchResultBox = document.getElementById("search-result-box");
  const searchBar = document.getElementById("search-bar");

  searchBar.onkeyup = function () {
    // changed from let to var... not sure if there's a difference with this implementation
    var testNames = [];

    const xhttp = new XMLHttpRequest();
    xhttp.open("GET", "/loadusers", true)
    xhttp.onload = function () {
      const data = JSON.parse(xhttp.responseText);
      for (let i = 0; i < data.length; i++) {
        testNames.push(data[i]);
      }
      console.log(testNames);
      let result = [];
      let input = searchBar.value;
      if (input.length) {
        result = testNames.filter((keyword) => {
          return keyword.toLowerCase().includes(input.toLowerCase());
        });
        console.log("test2" + result);
      }
      display(result);
    };
    xhttp.send()
  };

  function display(result) {
    const usernames = result.map((list) => {
      return `<li onclick="profile('${list}')"><div class="avatar" id="search-profile-pic"><img class ="profile-pic" src="/static/TwatterDefaultProfilePic.png"></div><span> ${list} </span></li>`;
    });
    searchResultBox.innerHTML = "<ul>" + usernames.join("") + "</ul>";
  }
}




function follow(id) {
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/follow");
  console.log(id);
  const data = JSON.stringify({ user_id: id });
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(data);
  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);
    if (response.error) {
      document.getElementById("demo").innerHTML = response.error;
    } else {
      location.reload();
    }
  };
}

function unfollow(id) {
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/unfollow");
  console.log(id);
  const data = JSON.stringify({ user_id: id });
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(data);
  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);
    if (response.error) {
      document.getElementById("demo").innerHTML = response.error;
    } else {
      location.reload();
    }
  };
}

// function registerpage() {
//   const xhttp = new XMLHttpRequest();
//   // this goes to the flask prefix
//   xhttp.open("GET", "/registerpage");
//   xhttp.send();
//   xhttp.onload = function () {
//     window.location.href = "/";
//   };
//   console.log("Register Page!");
// }

function post() {
  const content = encodeURIComponent(
    document.getElementById("content").value
  );
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/post");
  xhttp.setRequestHeader("Content-Type", "application/json");
  const data = JSON.stringify({ content: content });
  xhttp.send(data);
  closeModal();
  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);
    if (response.error) {
      document.getElementById("demo").innerHTML = response.error;

    } else {
      location.reload();
    }
  };
}



function likepost(postId) {
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/likes", true);
  xhttp.setRequestHeader('Content-Type', 'application/json');
  // on ready state change: determine if client request is successful 
  // then handle data in the function  
  xhttp.onreadystatechange = function () {
    var likes = JSON.parse(xhttp.responseText).likes;
    var likeBtn = document.getElementById("like-btn-" + postId);
    // where to display the like counter 
    likeBtn.innerHTML = '<i class="far fa-heart"></i> ' + likes;

  };
  // send to Flask Function to use
  xhttp.send(JSON.stringify({ post_id: postId }));
}


function comment(postId) {
  // selecting all of the elements responsible for holding the comments section 

  const commentform = document.querySelector('.comment-section form');
  const commentarea = document.getElementById("comment");

  // troubleshooting
  console.log(commentarea.value);

  // need to add a spot where the comment should be at on the front end 
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", '/comment', true);
  xhttp.setRequestHeader('Content-Type', 'application/json');


  // xhttp.onload = function () {
  //   const commentContainer = document.getElementById('comment-section' + postId);
  //   const newComment = document.createElement("p");
  //   newComment.innerText = JSON.parse(this.responseText).comment;
  //   commentContainer.append(newComment);

  //   commentarea.value = "";
  // }
  xhttp.send(JSON.stringify({ comment: commentarea.value, post_id: postId }));
}

function following(id) {
  console.log("onclick!");
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/following?id=" + id);
  // xhttp.setRequestHeader("Content-Type", "application/json");
  console.log(id);
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // Redirect to the profile page
      window.location.href = "/following?id=" + id;
    }
  };
  xhttp.send();
}

function followers(id) {
  console.log("onclick!");
  const xhttp = new XMLHttpRequest();
  xhttp.open("GET", "/followers?id=" + id);
  // xhttp.setRequestHeader("Content-Type", "application/json");
  console.log(id);
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      // Redirect to the profile page
      window.location.href = "/followers?id=" + id;
    }
  };
  xhttp.send();
}

function deletepost(id) {
  const xhttp = new XMLHttpRequest();
  xhttp.open("POST", "/deletepost");
  console.log(id);
  const data = JSON.stringify({ post_id: id });
  xhttp.setRequestHeader('Content-Type', 'application/json');
  xhttp.send(data);
  xhttp.onload = function () {
    const response = JSON.parse(this.responseText);
    if (response.error) {
      document.getElementById("demo").innerHTML = response.error;
    } else {
      location.reload();
    }
  };
}

function toggleFollow(id) {
  const button = document.getElementById("follow-btn");
  if (button.innerHTML === "Follow") {
    follow(id);
    button.innerHTML = "Unfollow";
  } else {
    unfollow(id);
    button.innerHTML = "Follow";
  }
}