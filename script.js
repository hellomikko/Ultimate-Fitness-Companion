// Tailwind CSS Configuration
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    darkMode: 'class',
  };
}

// ===== Theme Management =====
document.addEventListener('DOMContentLoaded', () => {
  // Apply saved theme on page load
  applySavedTheme();

  // Theme Switch
  const themeSwitch = document.getElementById('themeSwitch');
  if (themeSwitch) {
    // Set switch state based on saved theme
    themeSwitch.checked = document.body.classList.contains('dark-mode');

    themeSwitch.addEventListener('change', function() {
      document.body.classList.toggle('dark-mode');
      // Save theme preference
      const isDarkMode = document.body.classList.contains('dark-mode');
      localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    });
  }

  // Event Listener for Calculate Button on index.html
  const calculateButton = document.getElementById('calculateButton');
  if (calculateButton) {
    calculateButton.addEventListener('click', calculate);
  }

  // Event Listener for Add Entry Button on tracker.html
  const addEntryButton = document.getElementById('addEntryButton');
  if (addEntryButton) {
    addEntryButton.addEventListener('click', saveActivity);
  }

  // Initialize Activity Tracker Functions if on tracker.html
  if (document.getElementById('activityForm')) {
    initializeActivityTracker();
  }
});

function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}

// ===== Global Variables =====
let userGoal = '';
let dietPreference = '';
let activityData = [];
let suggestedCalories = null;

// ===== Calorie Calculator Functions =====
function calculate() {
  // Gather input values
  const age = parseInt(document.getElementById('age').value);
  const gender = document.getElementById('gender').value;
  const heightFeet = parseInt(document.getElementById('heightFeet').value);
  const heightInches = parseInt(document.getElementById('heightInches').value);
  const currentWeight = parseFloat(document.getElementById('currentWeight').value);
  const activityLevel = parseFloat(document.getElementById('activityLevel').value);
  const goal = document.getElementById('goal').value;
  const targetWeight = parseFloat(document.getElementById('targetWeight').value);
  const timeframe = parseInt(document.getElementById('timeframe').value);
  const bodyType = document.getElementById('bodyType').value;
  dietPreference = document.getElementById('diet').value;

  // Store user goal for meal suggestions
  userGoal = goal;

  // Validate inputs
  if (
    isNaN(age) || isNaN(heightFeet) || isNaN(heightInches) || isNaN(currentWeight) ||
    isNaN(activityLevel) || isNaN(targetWeight) || isNaN(timeframe) ||
    !gender || !goal || !bodyType || !dietPreference
  ) {
    alert('Please fill out all fields.');
    return;
  }

  // Show loading indicator
  document.getElementById('loading').classList.remove('hidden');
  document.getElementById('results').classList.add('hidden');

  // Simulate processing delay
  setTimeout(() => {
    // Convert height to inches
    const height = (heightFeet * 12) + heightInches;

    // BMR Calculation using Revised Harris-Benedict Equation
    let bmr = 0;
    if (gender === 'male') {
      bmr = 88.362 + (13.397 * currentWeight * 0.453592) + (4.799 * height * 2.54) - (5.677 * age);
    } else {
      bmr = 447.593 + (9.247 * currentWeight * 0.453592) + (3.098 * height * 2.54) - (4.330 * age);
    }

    // TDEE Calculation
    const tdee = bmr * activityLevel;

    // Caloric Needs Calculation
    const weightChange = targetWeight - currentWeight; // in pounds
    const totalCaloriesToBurn = weightChange * 3500; // 1 pound fat ≈ 3500 calories
    const dailyCalorieDeficit = totalCaloriesToBurn / (timeframe * 7);
    let recommendedCalories = 0;
    if (goal === 'lose') {
      recommendedCalories = tdee + dailyCalorieDeficit;
    } else if (goal === 'gain') {
      recommendedCalories = tdee + dailyCalorieDeficit; // Deficit will be negative for gain
    } else {
      recommendedCalories = tdee;
    }

    // Store suggestedCalories in localStorage
    localStorage.setItem('suggestedCalories', recommendedCalories.toFixed(2));

    // Meal Timing Suggestion
    const mealTimes = ['8:00 AM', '12:00 PM', '6:00 PM'];

    // Water Intake Suggestion
    const waterIntake = (currentWeight * 0.5).toFixed(1); // Half the body weight in ounces

    // Display results
    document.getElementById('bmrResult').innerHTML = `🔹 Your Basal Metabolic Rate (BMR) is <strong>${bmr.toFixed(2)} calories/day</strong>.`;
    document.getElementById('tdeeResult').innerHTML = `🔹 Your Total Daily Energy Expenditure (TDEE) is <strong>${tdee.toFixed(2)} calories/day</strong>.`;
    document.getElementById('calorieIntakeResult').innerHTML = `⭐ To achieve your goal, you should aim for <strong>${recommendedCalories.toFixed(2)} calories/day</strong>.`;

    // Meal Times
    const mealTimesList = document.getElementById('mealTimesList');
    mealTimesList.innerHTML = '';
    mealTimes.forEach(time => {
      const li = document.createElement('li');
      li.textContent = time;
      mealTimesList.appendChild(li);
    });

    // Hydration
    document.getElementById('hydration').innerHTML = `💧 You should drink at least <strong>${waterIntake} ounces</strong> of water daily.`;

    // Additional Advice
    let advice = '';
    if (goal === 'lose') {
      advice = `Focus on a calorie deficit through balanced meals and regular exercise. Incorporate both cardio and strength training to achieve a ${bodyType} body type.`;
    } else if (goal === 'gain') {
      advice = `Increase your calorie intake with nutrient-dense foods. Strength training is essential to build muscle mass for a ${bodyType} physique.`;
    } else {
      advice = `Maintain your current calorie intake and continue regular exercise to keep your ${bodyType} body type.`;
    }
    document.getElementById('advice').textContent = advice;

    // Fetch meal suggestions
    fetchMealSuggestions();

    // Hide loading indicator
    document.getElementById('loading').classList.add('hidden');

  }, 1500);
}

// Fetch Meal Suggestions without Paywall
function fetchMealSuggestions() {
  // Mock meal suggestions based on diet preference
  const mealDatabase = {
    vegetarian: ['Vegetable Stir Fry', 'Vegetarian Lasagna', 'Tofu Salad', 'Quinoa Stuffed Peppers', 'Veggie Burger'],
    vegan: ['Vegan Buddha Bowl', 'Lentil Soup', 'Vegan Curry', 'Chickpea Salad', 'Grilled Vegetable Panini'],
    pescatarian: ['Grilled Salmon', 'Shrimp Tacos', 'Tuna Salad', 'Baked Cod with Herbs', 'Seafood Paella'],
    'gluten-free': ['Grilled Chicken with Vegetables', 'Zucchini Noodles', 'Stuffed Bell Peppers', 'Baked Sweet Potato', 'Gluten-Free Pancakes'],
    none: ['Chicken Alfredo', 'Beef Stir Fry', 'Turkey Sandwich', 'Pasta Primavera', 'Grilled Cheese Sandwich'],
  };

  const meals = mealDatabase[dietPreference] || mealDatabase['none'];

  displayMealSuggestions(meals);
}

// Display Meal Suggestions
function displayMealSuggestions(meals) {
  const mealSuggestions = document.getElementById('mealSuggestions');
  mealSuggestions.innerHTML = '';

  if (meals.length === 0) {
    mealSuggestions.innerHTML = '<li>No meal suggestions available at this time.</li>';
    // Show results even if no meals are available
    document.getElementById('results').classList.remove('hidden');
    return;
  }

  meals.forEach(meal => {
    const li = document.createElement('li');
    li.textContent = meal;
    mealSuggestions.appendChild(li);
  });

  // Show results after meal suggestions are loaded
  document.getElementById('results').classList.remove('hidden');
}

// ===== Activity Tracker Functions =====
function initializeActivityTracker() {
  // Initialize chart data
  activityData = JSON.parse(localStorage.getItem('activityData')) || [];
  suggestedCalories = parseFloat(localStorage.getItem('suggestedCalories')) || null;

  // Render chart and entries on page load
  renderChart();
  displayActivityEntries();
}

function saveActivity() {
  const date = document.getElementById('date').value;
  const calories = parseInt(document.getElementById('calories').value);

  if (!date || isNaN(calories)) {
    alert('Please enter both date and calories consumed.');
    return;
  }

  // Check for duplicate date entries and update
  const existingEntryIndex = activityData.findIndex(entry => entry.date === date);
  if (existingEntryIndex >= 0) {
    activityData[existingEntryIndex].calories = calories;
  } else {
    activityData.push({ date, calories });
  }

  // Save data
  localStorage.setItem('activityData', JSON.stringify(activityData));

  // Clear form inputs
  document.getElementById('activityForm').reset();

  // Re-render chart and entries
  renderChart();
  displayActivityEntries();
}

function renderChart() {
  const ctx = document.getElementById('activityChart').getContext('2d');

  // Sort data by date
  activityData.sort((a, b) => new Date(a.date) - new Date(b.date));

  const labels = activityData.map(entry => entry.date);
  const dataPoints = activityData.map(entry => entry.calories);

  // Get suggested calories data
  const suggestedData = labels.map(() => suggestedCalories);

  // Destroy existing chart if any
  if (window.activityChart instanceof Chart) {
    window.activityChart.destroy();
  }

  // Create new chart
  window.activityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Actual Calories Consumed',
          data: dataPoints,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3,
        },
        {
          label: 'Suggested Caloric Intake',
          data: suggestedData,
          borderColor: 'rgba(34, 197, 94, 1)',
          borderDash: [10, 5],
          pointRadius: 0,
          fill: false,
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) {
              if (context.dataset.label === 'Actual Calories Consumed') {
                const actual = context.parsed.y;
                const suggested = suggestedCalories;
                return `Actual: ${actual} cal, Suggested: ${suggested} cal`;
              } else {
                return null; // Hide tooltip for the suggested calories line
              }
            },
          },
        },
      },
      scales: {
        x: { title: { display: true, text: 'Date' } },
        y: { title: { display: true, text: 'Calories' } },
      },
    },
  });
}

function displayActivityEntries() {
  const activityEntriesDiv = document.getElementById('activityEntries');
  activityEntriesDiv.innerHTML = '';

  if (activityData.length === 0) {
    activityEntriesDiv.innerHTML = '<p>No activity entries yet.</p>';
    return;
  }

  const table = document.createElement('table');
  table.classList.add('w-full', 'mb-4');

  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th class="border px-4 py-2 text-left">Date</th>
      <th class="border px-4 py-2 text-left">Calories Consumed</th>
      <th class="border px-4 py-2 text-left">Actions</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  activityData.forEach((entry, index) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="border px-4 py-2">${entry.date}</td>
      <td class="border px-4 py-2">${entry.calories}</td>
      <td class="border px-4 py-2">
        <button class="delete-entry bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" data-index="${index}">
          Delete
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  activityEntriesDiv.appendChild(table);

  // Add event listeners for delete buttons
  const deleteButtons = document.querySelectorAll('.delete-entry');
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      const index = e.target.getAttribute('data-index');
      deleteEntry(index);
    });
  });
}

function deleteEntry(index) {
  if (confirm('Are you sure you want to delete this entry?')) {
    activityData.splice(index, 1);
    localStorage.setItem('activityData', JSON.stringify(activityData));
    renderChart();
    displayActivityEntries();
  }
}
