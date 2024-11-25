let userId = null;

// Check if the user is logged in
window.onload = function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    userId = user.user_id;
    document.getElementById(
      "userName"
    ).innerText = `Name: ${user.firstname} ${user.lastname}`;
    document.getElementById("userEmail").innerText = `Email: ${user.email}`;
    document.getElementById("userid").innerText = `User ID: ${user.user_id}`;
    document.getElementById("userDetails").style.display = "block";
    document.getElementById("signupForm").classList.remove("active");
    document.getElementById("loginForm").classList.remove("active");
    document.getElementById("logoutButton").style.display = "block";
    document.getElementById("logoutButton").classList.add("btn-secondary");
    document.getElementById("logoutButton").classList.add("btn");
    getBorrowedBooks(userId);
  } else {
    toggleForm("login");
  }
};

// Toggle between Sign Up and Login Forms
function toggleForm(form) {
  if (form === "signup") {
    document.getElementById("signupForm").classList.add("active");
    document.getElementById("loginForm").classList.remove("active");
  } else {
    document.getElementById("loginForm").classList.add("active");
    document.getElementById("signupForm").classList.remove("active");
  }
}

// Sign Up API call
async function signUp() {
  const firstName = document.getElementById("signupFirstName").value;
  const lastName = document.getElementById("signupLastName").value;
  const email = document.getElementById("signupEmail").value;
  const password = document.getElementById("signupPassword").value;

  const response = await fetch(
    "https://sem1-project-api.onrender.com/api/signup",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstname: firstName,
        lastname: lastName,
        email,
        password,
      }),
    }
  );

  const data = await response.json();
  if (response.status === 201) {
    alert("Signup successful!");
    toggleForm("login");
  } else {
    alert(data.error || "An error occurred");
  }
}

// Login API call
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  const response = await fetch(
    "https://sem1-project-api.onrender.com/api/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }
  );

  const data = await response.json();
  if (response.status === 200) {
    localStorage.setItem("user", JSON.stringify(data)); // Save user data to localStorage
    userId = data.user_id;
    document.getElementById(
      "userName"
    ).innerText = `Name: ${data.firstname} ${data.lastname}`;
    document.getElementById("userEmail").innerText = `Email: ${data.email}`;
    document.getElementById("userid").innerText = `User ID: ${data.user_id}`;
    document.getElementById("userDetails").style.display = "block";
    document.getElementById("signupForm").classList.remove("active");
    document.getElementById("loginForm").classList.remove("active");
    document.getElementById("logoutButton").style.display = "block";
    getBorrowedBooks(userId);
  } else {
    alert(data.error || "Invalid email or password");
  }
}

// Logout function
function logout() {
  localStorage.removeItem("user"); // Clear user data from localStorage
  location.reload(); // Reload the page to reset the UI
}

// Fetch borrowed books API call
async function getBorrowedBooks(userId) {
  const response = await fetch(
    "https://sem1-project-api.onrender.com/api/borrowed_books",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    }
  );

  const data = await response.json();
  console.log(data);
  if (response.status === 200) {
    const borrowedBooksSection = document.getElementById(
      "borrowedBooksSection"
    );
    borrowedBooksSection.innerHTML = ""; // Clear previous books
    data.borrowed_books.forEach(([bookId, borrowed_date]) => {
      const formattedDate = new Date(borrowed_date).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );
      getBookDetails(bookId, formattedDate);
    });
  } else {
    borrowedBooksSection.innerHTML = "";
    borrowedBooksSection.innerHTML = "<p>No borrowed books where found</p>";
  }
}

async function getBookDetails(bookId, borrowed_date) {
  const response = await fetch(
    "https://sem1-project-api.onrender.com/api/book_details",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ book_id: bookId }),
    }
  );

  const data = await response.json();
  if (response.status === 200) {
    const borrowedBooksSection = document.getElementById(
      "borrowedBooksSection"
    );
    const bookCard = document.createElement("div");
    bookCard.classList.add("card");
    bookCard.innerHTML = `
      <img src="${data.thumbnail}" alt="${data.title}">
      <h4>${data.title}</h4>
      <p>${data.authors}</p>
      <p>${borrowed_date}</p>
      <button class="return-btn" data-book-id="${bookId}">Return book</button>
    `;
    borrowedBooksSection.appendChild(bookCard);

    // Add event listener to the return button
    const returnButton = bookCard.querySelector(".return-btn");
    returnButton.addEventListener("click", () => returnBook(bookId));
  }
}

async function returnBook(bookId) {
  if (!userId) {
    alert("User not logged in.");
    return;
  }

  const response = await fetch(
    "https://sem1-project-api.onrender.com/api/return",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, book_id: bookId }),
    }
  );

  const data = await response.json();
  if (response.status === 200) {
    alert(data.message || "Book returned successfully");

    // Refresh borrowed books list
    getBorrowedBooks(userId);
  } else {
    alert(data.error || "An error occurred while returning the book");
  }
}
