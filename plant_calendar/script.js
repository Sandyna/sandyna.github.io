async function loadPlantData() {
  try {
    const response = await fetch('plants.json');
    const plantData = await response.json();
    generateYearCalendar(2026, plantData, new Date("2026-03-15"));  // Pass the plant data and frost date to the calendar generation
  } catch (error) {
    console.error('Error loading plant data:', error);
  }
}

// Function to generate the full year calendar (12 months)
function generateYearCalendar(year, plantData, frostDate) {
  const calendarContainer = document.getElementById('calendar-container');
  calendarContainer.innerHTML = '';  // Clear any existing content

  // Loop through all 12 months
  for (let month = 1; month <= 12; month++) {
    generateCalendar(month, year, plantData, frostDate);
  }
}

// Function to generate each month's calendar
function generateCalendar(month, year, plantData, frostDate) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const monthDiv = document.createElement('div');
  monthDiv.classList.add('calendar-month');

  // Add month header (e.g., "January", "February", etc.)
  const header = document.createElement('div');
  header.classList.add('calendar-header');
  header.textContent = monthName;
  monthDiv.appendChild(header);

  // Create the grid for the calendar
  const grid = document.createElement('div');
  grid.classList.add('calendar-grid');
  monthDiv.appendChild(grid);

  // Loop through each day in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('calendar-day');
    dayDiv.setAttribute('data-day', day);
    dayDiv.textC
