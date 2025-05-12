let clickCount = 0;

const countryInput = document.getElementById("country");
const countryList = document.getElementById("countryList");
const myForm = document.getElementById("form");
const modal = document.getElementById("form-feedback-modal");
const clicksInfo = document.getElementById("click-count");

function handleClick() {
  clickCount++;
  if (clicksInfo) clicksInfo.innerText = clickCount;
}

async function fetchAndFillCountries() {
  try {
    const response = await fetch("https://restcountries.com/v3.1/all");
    if (!response.ok) throw new Error("Błąd pobierania danych");
    const data = await response.json();
    const countries = data.map((c) => c.name.common).sort();
    if (countryList) {
      countryList.innerHTML = countries
        .map((name) => `<option value="${name}">${name}</option>`)
        .join("");
    }
  } catch (error) {
    console.error("Wystąpił błąd podczas wypełniania listy krajów:", error);
  }
}

async function getCountryByIP() {
  try {
    const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
    if (!response.ok) throw new Error("Błąd pobierania IP");
    const data = await response.json();
    const country = data.country;
    if (country && countryInput) countryInput.value = country;
    await updatePhonePrefix(country);
    return country;
  } catch (error) {
    console.error("Błąd pobierania danych z serwera GeoJS:", error);
  }
}

async function getCountryCode(countryName) {
  if (!countryName) return;
  try {
    const apiUrl = `https://restcountries.com/v3.1/name/${encodeURIComponent(
      countryName
    )}?fullText=true`;
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Błąd pobierania danych kraju");
    const data = await response.json();
    const idd = data[0].idd;
    return idd.root + (idd.suffixes ? idd.suffixes.join("") : "");
  } catch (error) {
    console.error("Wystąpił błąd podczas pobierania kodu kierunkowego:", error);
  }
}

async function updatePhonePrefix(countryName) {
  const code = await getCountryCode(countryName);
  const prefix = document.getElementById("phonePrefix");
  if (prefix && code) prefix.innerText = code;
}

document.addEventListener("DOMContentLoaded", async () => {
  document.addEventListener("click", handleClick);

  await fetchAndFillCountries();
  const detectedCountry = await getCountryByIP();

  if (countryInput) {
    countryInput.addEventListener("input", (e) =>
      updatePhonePrefix(e.target.value)
    );
  }

  const vatUE = document.getElementById("vatUE");
  vatUE?.addEventListener("change", () => {
    const billing = document.getElementById("billingFields");
    new bootstrap.Collapse(billing, { toggle: true });
  });

  myForm.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault();
      myForm.requestSubmit();
    }
  });

  myForm.addEventListener("submit", (e) => {
    e.preventDefault();
    new bootstrap.Modal(modal).show();
  });
});
