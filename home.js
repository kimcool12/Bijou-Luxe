const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");

searchBtn.addEventListener("click", () => {
  if (searchInput.classList.contains("w-0")) {
    searchInput.classList.remove("w-0", "opacity-0");
    searchInput.classList.add("w-40", "opacity-100", "mr-2"); // expand smoothly
    searchInput.focus();
  } else {
    searchInput.classList.add("w-0", "opacity-0");
    searchInput.classList.remove("w-40", "opacity-100", "mr-2");
  }
});




