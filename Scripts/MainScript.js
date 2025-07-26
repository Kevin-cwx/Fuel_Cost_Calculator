var log = console.log;

const yearSelect = document.getElementById("YearPicker");
const currentYear = new Date().getFullYear();

for (let year = 2000; year <= currentYear + 1; year++) {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
}