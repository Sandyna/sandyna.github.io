let plantData = [];
let frostDate;
let selectedPlantIds = new Set();
let activeActions = new Set(['sowIndoors','sowOutdoors','transplant']);//removed harvest

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  const savedSelection = JSON.parse(localStorage.getItem('selectedPlantIds') || '[]');
  selectedPlantIds = new Set(savedSelection);
  loadPlantData();
  setupFrostDateInput();
  renderActionLegend();
  setupClearSelectionButton();
  setupRestoreDefaultsButton();
  setupCustomPlantForm();
  setupDownloadButtons();
  setupClearSessionButton();
  setupJsonUpload();
});

// ---------- LOAD PLANT DATA ----------
async function loadPlantData() {
  try {
    const saved = localStorage.getItem('plantData');
    if (saved) {
      plantData = JSON.parse(saved);
    } else {
      const response = await fetch('plants.json');
      plantData = await response.json();
      localStorage.setItem('plantData', JSON.stringify(plantData));
    }
    loadFrostDate();
    renderPlantOptions();
    generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
  } catch (error) {
    console.error('Error loading plant data:', error);
  }
}

//setup plant form
function setupCustomPlantForm() {
  const form = document.getElementById('custom-plant-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addCustomPlant();
  });
}

// ---------- FROST DATE ----------
function loadFrostDate() {
  const saved = localStorage.getItem('userFrostDate');
  //check for frostDate, use default if not present
  frostDate = saved ? new Date(saved) : new Date('2026-03-15');

  document.getElementById('frost-date-input').value =
    frostDate.toISOString().split('T')[0];
}
//setup the button and input for frost date
function setupFrostDateInput() {
  const inputEl = document.getElementById('frost-date-input');
  inputEl.addEventListener('change', () => {
    const input = inputEl.value;
    if (!input) return;

    frostDate = new Date(input);
    localStorage.setItem('userFrostDate', input);
    generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
  });
}

//download buttons
function setupDownloadButtons() {
  const pdfBtn = document.getElementById('download-pdf-btn');
  pdfBtn.title = "Download a PDF version of the calendar";
  const jsonBtn = document.getElementById('download-json-btn');
  jsonBtn.title = "Download a JSON file of all currently selected plants for backup or sharing. You can upload the JSON later to restore your session";
  const uploadBtn = document.getElementById('upload-json-btn');
  uploadBtn.title = "You can edit the JSON but if you break it, that's on you.";
  
  pdfBtn.addEventListener('click', downloadCalendarPDF);
  jsonBtn.addEventListener('click', downloadSelectedPlantsJSON);
    // JSON upload trigger
  uploadBtn.addEventListener('click', () => {
    const fileInput = document.getElementById('upload-json-input');
    fileInput.click();
  });
}

//clear selected plants
function setupClearSelectionButton() {
  const btn = document.getElementById('clear-selection-btn');
  
  btn.addEventListener('click', () => {
    // Clear internal selection state
    selectedPlantIds.clear();
    localStorage.setItem('selectedPlantIds', JSON.stringify([...selectedPlantIds]));

    // Uncheck all plant checkboxes
    const checkboxes = document.querySelectorAll('#plant-options input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);

    // Re-render calendar
    generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
  });
}

//Restore default plants
function setupRestoreDefaultsButton() {
  const btn = document.getElementById('restore-defaults-btn');
  btn.title = "Restores default plants, keeps custom plants";
  btn.addEventListener('click', () => {
    fetch('plants.json')
      .then(res => res.json())
      .then(defaultPlants => {
        // keep only user-added plants (ids starting with 'custom-')
        const userPlants = plantData.filter(p => p.id.startsWith('custom-'));
        plantData = [...userPlants, ...defaultPlants];
        localStorage.setItem('plantData', JSON.stringify(plantData));
        renderPlantOptions();
        generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
      })
      .catch(err => console.error('Error restoring default plants:', err));
  });
}

//action selection/legend
function renderActionLegend() {
  const container = document.getElementById('action-legend');
  container.innerHTML = '';

  Object.keys(actionColors).forEach(action => {
    const item = document.createElement('label');
    item.style.marginRight = '15px';
    item.style.cursor = 'pointer';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = activeActions.has(action);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        activeActions.add(action);
      } else {
        activeActions.delete(action);
      }
      generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
    });

    const colorBox = document.createElement('span');
    colorBox.classList.add('action-legend');
    colorBox.style.backgroundColor = actionColors[action];

    item.appendChild(checkbox);
    item.appendChild(colorBox);
    item.appendChild(document.createTextNode(actionLabels[action]));
    container.appendChild(item);
  });
}

// ---------- CALENDAR ----------
function generateYearCalendar(year, plantData, frostDate) {
  const calendarContainer = document.getElementById('calendar-container');
  calendarContainer.innerHTML = ''; // Clear existing calendar

  //filter selected plants
  const selectedPlants = plantData.filter(plant => selectedPlantIds.has(plant.id));
  
  // Loop through all 12 months
  for (let month = 1; month <= 12; month++) {
    renderMonth(month, year, selectedPlants, frostDate); // pass filtered list
  }
}

//get date
function getEventDate(baseDate, offset) {
if (offset === null || offset === undefined) return null;
const d = new Date(baseDate);
d.setDate(d.getDate() + offset);
return d;
}

//creating tooltip on hover
function createTooltip(plantName, action) {
  const actionText = actionLabels[action] || action;
  return `${plantName} – ${actionText}`;
}

// Function to place the icon or placeholder
function placeIcon(container, color, action, plantDataObj) {
  const wrapper = document.createElement('span');
  wrapper.style.position = 'relative';

  const plantName = plantDataObj.name;
  const icon = plantDataObj.icon;
  const altText = plantDataObj.alternate_text;

  const tooltipText = createTooltip(plantName, action);

  const img = new Image();
  img.src = `icons/${icon}`;
  img.className = "calendar-icon";
  img.style.border = `2px solid ${color}`;

  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';
  tooltip.style.border = `2px solid ${color}`;
  tooltip.textContent = tooltipText;

  wrapper.appendChild(img);
  wrapper.appendChild(tooltip);
  container.appendChild(wrapper);

  img.onerror = function () {
    img.remove();
    wrapper.textContent = altText || plantName.slice(0,3).toUpperCase();
    wrapper.classList.add('calendar-placeholder');
    wrapper.style.border = `2px solid ${color}`;
    wrapper.appendChild(tooltip);
  };

  // show info box on click
  wrapper.style.cursor = 'pointer';
  wrapper.addEventListener('click', () => showPlantInfo(plantDataObj));
}

// Action → color mapping
const actionColors = {
  sowIndoors: 'blue',
  sowOutdoors: 'green',
  transplant: 'mediumturquoise',
//  harvest: 'red'
};
//Action → text mapping
const actionLabels = {
  sowIndoors: "Sow Indoors",
  sowOutdoors: "Sow Outdoors",
  transplant: "Transplant",
//  harvest: "Harvest"
};

//create one month of the calendar
function renderMonth(month, year, selectedPlants, frostDate) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const monthDiv = document.createElement('div');
  monthDiv.classList.add('calendar-month');

  // Month header
  const header = document.createElement('div');
  header.classList.add('calendar-header');
  const monthColors = ['#ccecff', '#99ccff', '#32cccc', '#ccffcc', '#5dcc00', '#ffff99', '#ffcc00', '#ff9900', '#ff6500', '#ff7b80', '#cc99ff', '#ccccff'];
  header.style.backgroundColor = monthColors[month-1];
  header.textContent = monthName;
  monthDiv.appendChild(header);

  // Calendar grid
  const grid = document.createElement('div');
  grid.classList.add('calendar-grid');
  monthDiv.appendChild(grid);

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('calendar-day');
    dayDiv.setAttribute('data-day', day);

    const dayNumber = document.createElement('div');
    dayNumber.classList.add('calendar-day-number');
    dayNumber.textContent = day;

    const iconsContainer = document.createElement('div');
    iconsContainer.classList.add('calendar-icons');

    dayDiv.appendChild(dayNumber);
    dayDiv.appendChild(iconsContainer);
    grid.appendChild(dayDiv);

    //placing frost date icon into the calendar with a custom tooltip on hover
    if (frostDate.getDate() === day && frostDate.getMonth() === month - 1 && frostDate.getFullYear() === year) {
        const frostWrapper = document.createElement('span');
        frostWrapper.textContent = '❄️';
        frostWrapper.classList.add('frost-icon');
    
        const frostTooltip = document.createElement('div');
        frostTooltip.className = 'custom-tooltip';
        frostTooltip.style.border = `2px solid #a0e0ff`;
        frostTooltip.textContent = 'Last Frost Date';
    
        frostWrapper.appendChild(frostTooltip);
        iconsContainer.appendChild(frostWrapper);
    }

    // Place icons for each selected plant
    selectedPlants.forEach(plant => {
      const dates = {
        sowIndoors: getEventDate(frostDate, plant.sow_indoor),
        sowOutdoors: getEventDate(frostDate, plant.sow_outdoor),
        transplant: getEventDate(frostDate, plant.transplant),
  //      harvest: getEventDate(frostDate, plant.harvest)
      };

      for (const [action, date] of Object.entries(dates)) {
        if (!activeActions.has(action)) continue;
        if (date && date.getDate() === day && date.getMonth() === month - 1) {
          placeIcon(iconsContainer, actionColors[action], action, plant);
        }
      }
    });
  }
  // Append the completed month div once
  document.getElementById('calendar-container').appendChild(monthDiv);
}
//PLANT SELECTION
function renderPlantOptions() {
  const container = document.getElementById('plant-options');
  container.innerHTML = '';

  // Sort the plants alphabetically by name
  const sortedPlants = [...plantData].sort((a, b) => a.name.localeCompare(b.name));

  sortedPlants.forEach(plant => {
    const div = document.createElement('div');
    // checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `plant-${plant.id}`;
    checkbox.checked = selectedPlantIds.has(plant.id);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedPlantIds.add(plant.id);
      } else {
        selectedPlantIds.delete(plant.id);
      }
      localStorage.setItem('selectedPlantIds', JSON.stringify([...selectedPlantIds]));
      generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
    });

    //Add icon before name
    const plantLabel = document.createElement('label'); // renamed variable
    plantLabel.htmlFor = `plant-${plant.id}`;
    
    const iconImg = new Image();
    iconImg.src = `icons/${plant.icon}`;
    iconImg.classList.add('plant-label-icon');
    
    // fallback if image fails
    iconImg.onerror = () => {
      iconImg.replaceWith(document.createTextNode(plant.alternate_text || plant.name.slice(0,3).toUpperCase()));
    };
    
    // append plant name
    plantLabel.appendChild(document.createTextNode(plant.name));
    // always add colon + space
    plantLabel.appendChild(document.createTextNode(': '));
    //append image
    plantLabel.appendChild(iconImg);
    
    // red × delete button
    const deleteBtn = document.createElement('span');
    deleteBtn.textContent = '×';
    deleteBtn.classList.add('plant-delete');
    deleteBtn.title = 'Remove';
    deleteBtn.addEventListener('click', () => {
      // remove from plantData
      const index = plantData.findIndex(p => p.id === plant.id);
      if (index !== -1) plantData.splice(index, 1);
      //save the change in local storage
      localStorage.setItem('plantData', JSON.stringify(plantData));
      // remove from selection
      selectedPlantIds.delete(plant.id);
      //update local storage
      localStorage.setItem('selectedPlantIds', JSON.stringify([...selectedPlantIds]));
      //render changes
      renderPlantOptions();
      generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
    });
    
    div.appendChild(checkbox);
    div.appendChild(plantLabel);
    div.appendChild(deleteBtn);
    container.appendChild(div);
  });
}

//ADD CUSTOM PLANT
function addCustomPlant() {
  const name = document.getElementById('plant-name').value.trim();
  if (!name) return; // require name

  const sun = document.getElementById('sun-needs').value.trim() || '';
  const water = document.getElementById('water-needs').value.trim() || '';
  
  const sowIndoorRaw = document.getElementById('sow-indoor').value;
  const sowIndoor = sowIndoorRaw === '' ? null : parseInt(sowIndoorRaw, 10);
  
  const sowOutdoorRaw = document.getElementById('sow-outdoor').value;
  const sowOutdoor = sowOutdoorRaw === '' ? null : parseInt(sowOutdoorRaw, 10);
  
  const transplantRaw = document.getElementById('transplant').value;
  const transplant = transplantRaw === '' ? null : parseInt(transplantRaw, 10);
  
//  const harvestRaw = document.getElementById('harvest').value;
//  const harvest = harvestRaw === '' ? null : parseInt(harvestRaw, 10);
  
  const alternateText = document.getElementById('plant-alt-text').value.trim() || name.slice(0,3).toUpperCase();

  const newPlant = {
    id: 'custom-' + Date.now(),
    name,
    sun_needs: sun,
    water_needs: water,
    sow_indoor: sowIndoor != null ? sowIndoor * -7 : null,   // negative weeks → days
    sow_outdoor: sowOutdoor != null ? sowOutdoor * 7 : null,
    transplant: transplant != null ? transplant * 7 : null,
//    harvest: harvest != null ? harvest * 7 : null,
    alternate_text: alternateText
  };
  //add the plant
  plantData.push(newPlant);
  // Add custom plants into local storage
  localStorage.setItem('plantData', JSON.stringify(plantData));
  //render options and callendar
  renderPlantOptions();
  generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);

  document.getElementById('custom-plant-form').reset();
}

//PLANT INFO
function showPlantInfo(plant) {
  const infoBox = document.getElementById('show-plant-info');
  infoBox.innerHTML = '';

  // --- Name (top left) ---
  const nameEl = document.createElement('div');
  nameEl.classList.add('plant-info-name');
  nameEl.textContent = plant.name;
  infoBox.appendChild(nameEl);
  
  // --- Icon (top right) ---
  const iconEl = document.createElement('div');
  iconEl.classList.add('plant-icon-display');
  const img = new Image();
  img.src = `icons/${plant.icon}`;
  img.classList.add('plant-icon-display');
  img.onload = () => {
    iconEl.appendChild(img);
  };
  img.onerror = () => {
    iconEl.textContent =
      plant.alternate_text || plant.name.slice(0,3).toUpperCase();
  };
  infoBox.appendChild(iconEl);
  
  // other info
  const fields = [
    { key: 'sun_needs', label: 'Sun Needs' },
    { key: 'water_needs', label: 'Water Needs' },
    { key: 'sow_indoor', label: 'Sow Indoors (weeks before last frost)' },
    { key: 'sow_outdoor', label: 'Sow Outdoors (weeks after last frost)' },
    { key: 'transplant', label: 'Transplant (weeks after last frost)' },
//    { key: 'harvest', label: 'Harvest (weeks after last frost)' },
    { key: 'tooltip', label: 'Notes' }
  ];
  
fields.forEach(({ key, label }) => {
  const value = plant[key];

  if (value !== null && value !== undefined && value !== '') {
    const div = document.createElement('div');

    if (['sow_indoor','sow_outdoor','transplant'].includes(key)) { //removed harvest
      const weeks = Math.round(Math.abs(value / 7));
      div.textContent = `${label}: cca. ${weeks} weeks`;
    } else {
      div.textContent = `${label}: ${value}`;
    }

    infoBox.appendChild(div);
  }
});

  infoBox.style.display = 'block';
}

//nuke the session
function setupClearSessionButton() {
  const btn = document.getElementById('clear-session-btn');
  btn.addEventListener('click', () => {
    localStorage.clear();           // clears frost date, etc.
    selectedPlantIds.clear();       // unselect all plants
    loadPlantData();                // reload default plants
  });
}

// ---------- JSON EXPORT ----------
function downloadSelectedPlantsJSON() {
  // Separate defaults vs custom
  const defaults = [];
  const custom = [];

  plantData.forEach(p => {
    if (p.id.startsWith('custom-')) {
      custom.push({
        id: p.id,
        name: p.name,
        sow_indoor: p.sow_indoor ?? null,
        sow_outdoor: p.sow_outdoor ?? null,
        transplant: p.transplant ?? null,
//        harvest: p.harvest ?? null,
        sun_needs: p.sun_needs || '',
        water_needs: p.water_needs || '',
        icon: p.icon || '',
        alternate_text: p.alternate_text ?? null,
        tooltip: p.tooltip || ''
      });
    } else if (selectedPlantIds.has(p.id)) {
      defaults.push(p.id);
    }
  });

  const jsonData = { defaults, custom };

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'planting-calendar.json';
  a.click();
  URL.revokeObjectURL(url);
}

function setupJsonUpload() {
  const fileInput = document.getElementById('upload-json-input');

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      alert('Invalid JSON file.');
      return;
    }

    // Validate structure
    if (!data.defaults || !Array.isArray(data.defaults) || !data.custom || !Array.isArray(data.custom)) {
      alert('Invalid JSON structure. Expected {defaults: [...], custom: [...]}');
      return;
    }

    // Load true defaults
    let defaultPlants = [];
    try {
      const response = await fetch('plants.json');
      defaultPlants = await response.json();
    } catch {
      alert('Failed to load default plants.');
      return;
    }
    const defaultIds = new Set(defaultPlants.map(p => p.id));

    // Add selected defaults
    const newPlantData = [];
    data.defaults.forEach(id => {
      const dp = defaultPlants.find(p => p.id === id);
      if (dp) newPlantData.push(dp);
    });

    // Add custom plants
    const seenIds = new Set(newPlantData.map(p => p.id));
    let idEditedCount = 0;

    for (let i = 0; i < data.custom.length; i++) {
      const plant = data.custom[i];

      // Ensure ID exists and starts with 'custom-'
      if (!plant.id || !plant.id.startsWith('custom-')) {
        plant.id = 'custom-' + Date.now() + '-' + i;
        idEditedCount++;
      }

      // Check duplicate
      if (seenIds.has(plant.id)) {
        alert('Duplicate IDs found in uploaded plants. Upload aborted.');
        return;
      }

      seenIds.add(plant.id);

      // Ensure fields exist
      const normalizedPlant = {
        id: plant.id,
        name: plant.name || 'Unnamed Plant',
        sow_indoor: plant.sow_indoor ?? null,
        sow_outdoor: plant.sow_outdoor ?? null,
        transplant: plant.transplant ?? null,
//        harvest: plant.harvest ?? null,
        sun_needs: plant.sun_needs || '',
        water_needs: plant.water_needs || '',
        icon: plant.icon || '',
        alternate_text: plant.alternate_text ?? null,
        tooltip: plant.tooltip || ''
      };

      newPlantData.push(normalizedPlant);
    }

    // Update plantData and selection
    plantData = newPlantData;
    selectedPlantIds = new Set([
      ...data.defaults.filter(id => defaultIds.has(id)),
      ...data.custom.map(p => p.id)
    ]);

    localStorage.setItem('plantData', JSON.stringify(plantData));
    localStorage.setItem('selectedPlantIds', JSON.stringify([...selectedPlantIds]));

    renderPlantOptions();
    generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);

    // Notify user
    if (idEditedCount > 0) {
      alert(`${idEditedCount} custom plant IDs were updated to avoid conflicts.`);
    } else {
      alert('Plants uploaded successfully!');
    }

    fileInput.value = '';
  });
}

//download pdf
async function downloadCalendarPDF() {
  const { jsPDF } = window.jspdf;
  const calendar = document.getElementById('calendar-container');
  const selectionContainer = document.getElementById('plant-options');

  // --- PAGE 1: Calendar ---
  const tempCalendar = document.createElement('div');
  tempCalendar.className = 'pdf-export-container';

  const title = document.createElement('h1');
  title.className = 'pdf-title';
  title.textContent = 'Planting Calendar';
  tempCalendar.appendChild(title);

  const calendarClone = calendar.cloneNode(true);
  calendarClone.classList.add('pdf-calendar');
  tempCalendar.appendChild(calendarClone);

  document.body.appendChild(tempCalendar);

  // Wait for images to load
  await Promise.all(Array.from(tempCalendar.querySelectorAll('img')).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => { img.onload = img.onerror = resolve; });
  }));
  const calendarCanvas = await html2canvas(tempCalendar, {
    scale: 3,       // keeps it sharp
    useCORS: true
  });
  
  const calendarImgData = calendarCanvas.toDataURL('image/png');

  const pdf = new jsPDF('landscape', 'pt', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Scale to fit page width and height
  let imgWidth = pageWidth;
  let imgHeight = calendarCanvas.height * (imgWidth / calendarCanvas.width);
  if (imgHeight > pageHeight) {
    const scaleFactor = pageHeight / imgHeight;
    imgWidth *= scaleFactor;
    imgHeight *= scaleFactor;
  }

  pdf.addImage(calendarImgData, 'PNG', 0, 0, imgWidth, imgHeight);
  document.body.removeChild(tempCalendar);

  // --- PAGE 2: Selected Plants ---
  pdf.addPage();
  const tempPlants = document.createElement('div');
  tempPlants.className = 'pdf-export-container';

  const plantsTitle = document.createElement('h1');
  plantsTitle.className = 'pdf-title';
  plantsTitle.textContent = 'Selected Plants';
  tempPlants.appendChild(plantsTitle);

  const checkboxes = selectionContainer.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(cb => {
    if (!cb.checked) return;

    const plantDiv = document.createElement('div');
    plantDiv.className = 'pdf-legend-plant';

    const plant = plantData.find(p => p.id === cb.id.replace('plant-', ''));
    if (!plant) return;

    const iconSpan = document.createElement('span');
    iconSpan.className = 'pdf-legend-icon';

    if (plant.icon) {
      const img = new Image();
      img.src = `icons/${plant.icon}`;
      img.className = 'pdf-legend-img';
      img.onerror = () => {
        img.replaceWith(document.createTextNode(plant.alternate_text || plant.name.slice(0,3).toUpperCase()));
      };
      iconSpan.appendChild(img);
    } else {
      iconSpan.textContent = plant.alternate_text || plant.name.slice(0,3).toUpperCase();
    }

    const nameSpan = document.createElement('span');
    nameSpan.className = 'pdf-legend-name';
    nameSpan.textContent = `: ${plant.name}`;

    plantDiv.appendChild(iconSpan);
    plantDiv.appendChild(nameSpan);
    tempPlants.appendChild(plantDiv);
  });

  document.body.appendChild(tempPlants);

  await Promise.all(Array.from(tempPlants.querySelectorAll('img')).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => { img.onload = img.onerror = resolve; });
  }));

  const plantsCanvas = await html2canvas(tempPlants, { scale: 2 });
  const plantsImgData = plantsCanvas.toDataURL('image/png');

  const plantsImgWidth = pageWidth;
  let plantsImgHeight = plantsCanvas.height * (plantsImgWidth / plantsCanvas.width);
  if (plantsImgHeight > pageHeight) {
    const scaleFactor = pageHeight / plantsImgHeight;
    plantsImgHeight *= scaleFactor;
  }

  pdf.addImage(plantsImgData, 'PNG', 0, 0, plantsImgWidth, plantsImgHeight);

  pdf.save('planting-calendar.pdf');
  document.body.removeChild(tempPlants);
}







