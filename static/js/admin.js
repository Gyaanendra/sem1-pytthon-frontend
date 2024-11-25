// API Base URL
const API_BASE_URL = "https://sem1-project-api.onrender.com/api";

// DOM Elements
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");
const loadingIndicator = document.getElementById("loading");
const loginPage = document.getElementById("loginPage");
const dashboardPage = document.getElementById("dashboardPage");
const userList = document.getElementById("userList");
const logoutBtn = document.getElementById("logoutBtn");
const totalUsers = document.getElementById("totalUsers");
const userModal = document.getElementById("userModal");
const userModalContent = document.getElementById("userModalContent");
const searchInput = document.getElementById("searchInput");

// Check if user is already logged in
function checkAuth() {
  const adminData = localStorage.getItem("adminData");
  if (adminData) {
    const admin = JSON.parse(adminData);
    document.getElementById("adminName").textContent = admin.name || "Admin";
    document.getElementById("adminEmail").textContent =
      admin.email || "admin@example.com";
    showDashboard();
  }
}

// Handle Login
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  errorMessage.style.display = "none";
  loadingIndicator.style.display = "block";

  try {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("adminData", JSON.stringify(data));
      showDashboard();
    } else {
      errorMessage.textContent = data.error || "Login failed";
      errorMessage.style.display = "block";
    }
  } catch (error) {
    errorMessage.textContent = "Network error. Please try again.";
    errorMessage.style.display = "block";
  } finally {
    loadingIndicator.style.display = "none";
  }
});

// Show Dashboard
async function showDashboard() {
  loginPage.style.display = "none";
  dashboardPage.style.display = "flex";
  await fetchUsers();
}

// Fetch Users
async function fetchUsers() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/users`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    console.log("Fetched users data:", data);

    // Update total users count
    totalUsers.textContent = `${data.user_count} Users`;

    // Populate user list
    userList.innerHTML = data.user_ids
      .map(
        ([userId, userName]) => `
  <div class="user-card" onclick="showUserModal('${userId}')">
    <div class="user-info">
      <h4>${userName}</h4>
      <p>ID: ${userId}</p>
    </div>
  </div>
`
      )
      .join("");
  } catch (error) {
    console.error("Error fetching users:", error);
    userList.innerHTML = `<p>Error loading users: ${error.message}</p>`;
  }
}
// DOM Elements
const selectUserSection = document.getElementById("selectUserSection");
const eventsSection = document.getElementById("eventsSection");
const eventsList = document.getElementById("eventsList");

// Toggle Sections
function showSection(section) {
  if (section === "users") {
    selectUserSection.style.display = "block";
    eventsSection.style.display = "none";
  } else if (section === "events") {
    selectUserSection.style.display = "none";
    eventsSection.style.display = "block";
    fetchEvents(); // Fetch events when this section is shown
  }
}

// Fetch Events
async function fetchEvents() {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/events`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);

    const data = await response.json();
    eventsList.innerHTML = data
      .map(
        (event) => `
<div class="user-card">
  <div class="user-info">
    <h4>Event ID: ${event.event_id}</h4>
    <p>${event.event_msg}</p>
  </div>
</div>
`
      )
      .join("");
  } catch (error) {
    console.error("Error fetching events:", error);
    eventsList.innerHTML = `<p>Error loading events: ${error.message}</p>`;
  }
}

// Filter Items
function filterItems() {
  const searchTerm = searchInput.value.toLowerCase();
  const activeList =
    selectUserSection.style.display === "block" ? userList : eventsList;
  const cards = activeList.getElementsByClassName("user-card");

  Array.from(cards).forEach((card) => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(searchTerm) ? "" : "none";
  });
}

// Filter Users
function filterUsers() {
  const searchTerm = searchInput.value.toLowerCase();
  const userCards = userList.getElementsByClassName("user-card");

  Array.from(userCards).forEach((card) => {
    const userName = card
      .querySelector(".user-info h4")
      .textContent.toLowerCase();
    const userId = card.querySelector(".user-info p").textContent.toLowerCase();
    card.style.display =
      userName.includes(searchTerm) || userId.includes(searchTerm)
        ? ""
        : "none";
  });
}
// Show User Modal
async function showUserModal(userId) {
  try {
    userModal.style.display = "block";
    userModalContent.innerHTML = "<p>Loading user details...</p>";

    // Fetch user details
    const userResponse = await fetch(`${API_BASE_URL}/admin/usersbyID`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    if (!userResponse.ok) throw new Error(`API error: ${userResponse.status}`);

    const userData = await userResponse.json();

    // Display user details immediately
    userModalContent.innerHTML = `
       <h2>User Details</h2>
       <div class="detail-grid">
         <div class="detail-item">
           <h3>Name</h3>
           <p>${userData.firstname} ${userData.lastname}</p>
         </div>
         <div class="detail-item">
           <h3>Email</h3>
           <p>${userData.email}</p>
         </div>
         <div class="detail-item">
           <h3>User ID</h3>
           <p>${userData.user_id}</p>
         </div>
         <div class="detail-item">
           <h3>Created on</h3>
           <p>Created at: ${userData.created_at}</p>
           <p>Date: ${userData.created_date}</p>
           <p>Day: ${userData.created_day}</p>
         </div>
       </div>
       <h3 style="margin-top: 2rem">Borrowed Books</h3>
       <div class="book-list" id="borrowedBooksContainer">
         <p>Loading borrowed books...</p>
       </div>
     `;

    // Fetch borrowed books
    const booksResponse = await fetch(`${API_BASE_URL}/borrowed_books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId }),
    });

    if (booksResponse.status === 404) {
      // No borrowed books case
      document.getElementById("borrowedBooksContainer").innerHTML =
        "<p>No borrowed books found for this user.</p>";
      return;
    }

    if (!booksResponse.ok)
      throw new Error(`API error: ${booksResponse.status}`);

    const booksData = await booksResponse.json();

    // Get details for each borrowed book
    const bookDetails = await Promise.all(
      booksData.borrowed_books.map(async ([bookId, borrowDate]) => {
        const bookResponse = await fetch(`${API_BASE_URL}/book_details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ book_id: bookId }),
        });

        if (!bookResponse.ok)
          throw new Error(`API error: ${bookResponse.status}`);

        const bookData = await bookResponse.json();
        return { ...bookData, borrowDate };
      })
    );

    // Update borrowed books content
    const borrowedBooksContainer = document.getElementById(
      "borrowedBooksContainer"
    );

    borrowedBooksContainer.innerHTML = bookDetails
      .map(
        (book) => `
           <div class="book-card">
             <div class="book-image">
               <img src="${book.thumbnail}" alt="${book.title}" />
             </div>
             <div class="book-info">
               <h4>${book.title}</h4>
               <p><strong>Author:</strong> ${book.authors}</p>
               <p><strong>Borrowed Date:</strong> ${new Date(
                 book.borrowDate
               ).toLocaleDateString()}</p>
             </div>
           </div>
         `
      )
      .join("");
  } catch (error) {
    console.error("Error showing user modal:", error);
    userModalContent.innerHTML = `
       <div class="error-message">
         Error loading user details: ${error.message}
       </div>
     `;
  }
}

// Close Modal
function closeModal() {
  userModal.style.display = "none";
}

// Close modal when clicking outside
window.onclick = function (event) {
  if (event.target === userModal) {
    closeModal();
  }
};

// Handle Logout
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminData");
  location.reload();
});

// Initialize
checkAuth();
