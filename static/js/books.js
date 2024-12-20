const axiosScript = document.createElement("script");
axiosScript.src = "https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js";
document.head.appendChild(axiosScript);
function getCurrentUser() {
  const userData = localStorage.getItem("user");
  if (userData) {
    return JSON.parse(userData);
  }
  return null;
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

async function fetchBooks() {
  const booksGrid = document.getElementById("booksGrid");
  const loadingSpinner = document.getElementById("loadingSpinner");
  loadingSpinner.style.display = "block"; // Show the loading animation

  try {
    const response = await axios.get(
      "https://sem1-project-api.onrender.com/api/books"
    );
    const books = response.data;

    booksGrid.innerHTML = ""; // Clear existing books
    books.forEach((book) => {
      const bookCard = document.createElement("div");
      bookCard.classList.add("book-card");
      bookCard.innerHTML = `
        <img src="${book.thumbnail}" alt="${book.title}">
        <div class="book-info">
          <h3>${book.title}</h3>
          <p class="book-author">by ${book.authors}</p>
          <div class="book-meta">
          </div>
        </div>
      `;
      bookCard.addEventListener("click", () => openModal(book));
      booksGrid.appendChild(bookCard);
    });
  } catch (error) {
    console.error("Failed to load books:", error);
    alert("Failed to fetch books. Please try again later.");
  } finally {
    loadingSpinner.style.display = "none"; // Hide the loading animation
  }
}

function openModal(book) {
  const user = getCurrentUser();

  document.getElementById("modalImage").src = book.thumbnail;
  document.getElementById("modalTitle").textContent = book.title;
  document.getElementById("modalAuthors").textContent = `by ${book.authors}`;
  document.getElementById("modalPublished").textContent = book.published_year;
  document.getElementById("modalPages").textContent = `${book.num_pages} pages`;
  document.getElementById("modalCategories").textContent = book.categories;
  document.getElementById("modalRating").textContent =
    book.ratings_count || "Not rated";
  document.getElementById("modalAvgRating").textContent =
    book.average_rating || "Not rated";
  document.getElementById("isbn10").textContent =
    book.isbn10 || "Not available";
  document.getElementById("isbn13").textContent =
    book.isbn13 || "Not available";
  document.getElementById("modalDescription").textContent = book.description;
  document.getElementById("bookModal").style.display = "flex";

  // Update borrow button event listener
  document.getElementById("borrowButton").onclick = () => {
    openConfirmModal(book);
  };
}

function openConfirmModal(book) {
  const user = getCurrentUser();
  if (!user) {
    alert("Please log in to borrow books.");
    window.location.href = "/profile";
    return;
  }

  document.getElementById("confirmBookTitle").textContent = book.title;
  document.getElementById("confirmBookId").textContent = book.book_id;
  document.getElementById("confirmUserId").textContent = user.user_id;
  document.getElementById(
    "confirmUserName"
  ).textContent = `${user.firstname} ${user.lastname}`;

  document.getElementById("bookModal").style.display = "none";
  document.getElementById("confirmModal").style.display = "flex";
}

async function borrowBook(bookId, userId) {
  try {
    const response = await axios.post(
      "https://sem1-project-api.onrender.com/api/borrow",
      { book_id: bookId, user_id: userId }
    );
    const data = response.data;
    alert(data.error || "Book borrowed successfully!");
    window.location.href = "/profile"; // Redirect to profile to see borrowed books
  } catch (error) {
    console.error("Borrow book error:", error);
    alert(
      error.response?.data?.error ||
        "An error occurred while borrowing the book."
    );
  }
  closeModal("confirmModal");
}

// Update the confirm borrow button event listener
document.getElementById("confirmBorrowButton").addEventListener("click", () => {
  const bookId = document.getElementById("confirmBookId").textContent;
  const userId = document.getElementById("confirmUserId").textContent;
  borrowBook(bookId, userId);
});

// Add logout button functionality
function addLogoutButton() {
  const nav = document.querySelector("nav");
  const user = getCurrentUser();
  if (user) {
    const logoutBtn = document.createElement("a");
    logoutBtn.href = "#";
    logoutBtn.textContent = "Logout";
    logoutBtn.classList.add("btn");
    logoutBtn.classList.add("btn-secondary");
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      localStorage.removeItem("user");
      window.location.href = "/profile";
    };

    nav.appendChild(logoutBtn);
  }
}

// Add search filter functionality
document.querySelector(".search-input").addEventListener("keyup", function () {
  const searchTerm = this.value.toLowerCase(); // Get the search term
  const bookCards = document.querySelectorAll(".book-card"); // Get all book cards

  bookCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase(); // Book title
    const author = card.querySelector(".book-author").textContent.toLowerCase(); // Book author

    // Check if the title or author matches the search term
    if (title.includes(searchTerm) || author.includes(searchTerm)) {
      card.style.display = ""; // Show the card
    } else {
      card.style.display = "none"; // Hide the card
    }
  });
});

window.onload = () => {
  fetchBooks();
  addLogoutButton();
};
