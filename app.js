
async function getCsrf() {
  const response = await fetch("/api/csrf");
  return (await response.json()).csrfToken;
}

async function sendRequest(url, data) {
  const token = await getCsrf();

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": token
    },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Something went wrong.");
  }

  return result;
}

function showMessage(id, message) {
  document.getElementById(id).textContent = message;
}

// Mobile navigation
const menu = document.getElementById("menu");
const nav = document.getElementById("nav");

menu.addEventListener("click", () => {
  nav.classList.toggle("open");
});

nav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
  });
});

// Current year
document.getElementById("year").textContent =
  new Date().getFullYear();

// Member login
document.getElementById("loginForm")
.addEventListener("submit", async event => {
  event.preventDefault();

  const form = new FormData(event.currentTarget);

  try {
    const result = await sendRequest("/api/login", {
      email: form.get("email"),
      password: form.get("password")
    });

    window.location.href = result.redirect;

  } catch (error) {
    showMessage("loginStatus", error.message);
  }
});

// Membership application
document.getElementById("applyForm")
.addEventListener("submit", async event => {
  event.preventDefault();

  const form = new FormData(event.currentTarget);

  try {
    const result = await sendRequest("/api/apply", {
      fullName: form.get("fullName"),
      email: form.get("email"),
      password: form.get("password")
    });

    showMessage("applyStatus", result.message);
    event.currentTarget.reset();

  } catch (error) {
    showMessage("applyStatus", error.message);
  }
});

// Contact form
document.getElementById("contactForm")
.addEventListener("submit", async event => {
  event.preventDefault();

  const form = new FormData(event.currentTarget);

  try {
    const result = await sendRequest("/api/contact", {
      name: form.get("name"),
      email: form.get("email"),
      subject: form.get("subject"),
      message: form.get("message")
    });

    showMessage("contactStatus", result.message);
    event.currentTarget.reset();

  } catch (error) {
    showMessage("contactStatus", error.message);
  }
});

// Load upcoming events
async function loadEvents() {
  const container = document.getElementById("publicEvents");

  try {
    const response = await fetch("/api/events");
    const data = await response.json();

    container.replaceChildren();

    if (data.events.length === 0) {
      container.textContent =
        "No upcoming events have been announced yet.";
      return;
    }

    data.events.forEach(event => {
      const card = document.createElement("div");
      card.className = "event";

      const title = document.createElement("h3");
      title.textContent = event.title;

      const date = document.createElement("p");
      date.textContent =
        [event.event_date, event.venue]
          .filter(Boolean).join(" • ");

      const description = document.createElement("p");
      description.textContent = event.description;

      card.append(title, date, description);
      container.appendChild(card);
    });

  } catch {
    container.textContent = "Unable to load events.";
  }
}

loadEvents();
