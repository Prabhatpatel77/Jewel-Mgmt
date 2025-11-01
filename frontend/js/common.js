// Base configuration
const BASE_URL = 'http://localhost:3000/api';

// Utility function for API calls
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}

// Show message function
function showMessage(elementId, message, type = 'success') {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = `<div class="message ${type}">${message}</div>`;
    setTimeout(() => {
      element.innerHTML = '';
    }, 5000);
  }
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount);
}

// Format date
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-IN');
}

// Clear form function
function clearForm(formId) {
  const form = document.getElementById(formId);
  if (form) {
    form.reset();
    // Clear hidden fields
    const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
    hiddenInputs.forEach(input => input.value = '');
  }
}
