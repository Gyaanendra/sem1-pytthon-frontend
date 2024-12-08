const axiosScript = document.createElement("script");
axiosScript.src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
document.head.appendChild(axiosScript);

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

  try {
    const response = await axios.post(
      "https://sem1-project-api.onrender.com/api/signup",
      {
        firstname: firstName,
        lastname: lastName,
        email,
        password,
      }
    );

    alert("Signup successful!");
    toggleForm("login");
  } catch (error) {
    alert(error.response?.data?.error || "An error occurred");
  }
}

// Login API call
async function login() {
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await axios.post(
      "https://sem1-project-api.onrender.com/api/login",
      { email, password }
    );

    const data = response.data;
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
  } catch (error) {
    alert(error.response?.data?.error || "Invalid email or password");
  }
}

// Logout function
function logout() {
  localStorage.removeItem("user"); // Clear user data from localStorage
  location.reload(); // Reload the page to reset the UI
}

// Fetch borrowed books API call
async function getBorrowedBooks(userId) {
  try {
    const response = await axios.post(
      "https://sem1-project-api.onrender.com/api/borrowed_books",
      { user_id: userId }
    );

    const data = response.data;
    console.log(data);
    const borrowedBooksSection = document.getElementById(
      "borrowedBooksSection"
    );
    borrowedBooksSection.innerHTML = ""; // Clear previous books

    if (data.borrowed_books && data.borrowed_books.length > 0) {
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
      borrowedBooksSection.innerHTML = "<p>No borrowed books were found</p>";
    }
  } catch (error) {
    const borrowedBooksSection = document.getElementById(
      "borrowedBooksSection"
    );
    borrowedBooksSection.innerHTML = "<p>Error fetching borrowed books</p>";
    console.error(error);
  }
}

async function getBookDetails(bookId, borrowed_date) {
  try {
    const response = await axios.post(
      "https://sem1-project-api.onrender.com/api/book_details",
      { book_id: bookId }
    );

    const data = response.data;
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
  } catch (error) {
    console.error(`Error fetching book details for book ID ${bookId}:`, error);
  }
}

async function returnBook(bookId) {
  if (!userId) {
    alert("User not logged in.");
    return;
  }

  try {
    const response = await axios.post(
      "https://sem1-project-api.onrender.com/api/return",
      { user_id: userId, book_id: bookId }
    );

    alert(response.data.message || "Book returned successfully");

    // Refresh borrowed books list
    getBorrowedBooks(userId);
  } catch (error) {
    alert(
      error.response?.data?.error ||
        "An error occurred while returning the book"
    );
  }
}

// Attach functions to global scope for HTML onclick events
window.toggleForm = toggleForm;
window.signUp = signUp;
window.login = login;
window.logout = logout;
