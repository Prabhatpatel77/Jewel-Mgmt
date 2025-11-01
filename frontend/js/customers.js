let customers = [];
let filteredCustomers = [];

// Fetch all customers
async function fetchCustomers() {
  try {
    customers = await apiCall('/customers');
    filteredCustomers = [...customers];
    renderCustomers();
    updateCustomerCount();
    updateCustomerDropdown();
  } catch (error) {
    console.error('Error fetching customers:', error);
  }
}

// Render customers table
function renderCustomers() {
  const tbody = document.querySelector('#customersTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  filteredCustomers.forEach(customer => {
    const row = document.createElement('tr');
    row.className = 'fade-in';
    row.innerHTML = `
      <td><strong>${customer.name}</strong></td>
      <td>${customer.phone || 'N/A'}</td>
      <td>${customer.address || 'N/A'}</td>
      <td>
        <button class="btn btn-outline-gold btn-sm me-1" onclick="editCustomer(${customer.cust_id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-outline-danger btn-sm" onclick="deleteCustomer(${customer.cust_id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Update customer count
function updateCustomerCount() {
  const countElement = document.getElementById('customerCount');
  if (countElement) {
    countElement.textContent = `${filteredCustomers.length} customers`;
  }
}

// Update customer dropdown for sales
function updateCustomerDropdown() {
  const select = document.getElementById('saleCustId');
  if (!select) return;

  select.innerHTML = '<option value="">Select Customer</option>';
  customers.forEach(customer => {
    const option = document.createElement('option');
    option.value = customer.cust_id;
    option.textContent = customer.name;
    select.appendChild(option);
  });
}

// Save customer (create or update)
async function saveCustomer(e) {
  e.preventDefault();
  
  const customerData = {
    name: document.getElementById('custName').value.trim(),
    phone: document.getElementById('custPhone').value.trim(),
    address: document.getElementById('custAddress').value.trim()
  };

  const custId = document.getElementById('custId').value;

  try {
    if (custId) {
      // Update existing customer
      await apiCall(`/customers/${custId}`, {
        method: 'PUT',
        body: JSON.stringify(customerData)
      });
    } else {
      // Create new customer
      await apiCall('/customers', {
        method: 'POST',
        body: JSON.stringify(customerData)
      });
    }

    clearCustomerForm();
    await fetchCustomers();
    showMessage('customerMessage', `Customer ${custId ? 'updated' : 'added'} successfully!`);
  } catch (error) {
    showMessage('customerMessage', 'Error saving customer. Please try again.', 'error');
  }
}

// Edit customer
function editCustomer(id) {
  const customer = customers.find(c => c.cust_id === id);
  if (!customer) return;

  document.getElementById('custId').value = customer.cust_id;
  document.getElementById('custName').value = customer.name;
  document.getElementById('custPhone').value = customer.phone || '';
  document.getElementById('custAddress').value = customer.address || '';

  // Scroll to form
  document.getElementById('customerForm').scrollIntoView({ behavior: 'smooth' });
}

// Delete customer
async function deleteCustomer(id) {
  if (!confirm('Are you sure you want to delete this customer?')) return;

  try {
    await apiCall(`/customers/${id}`, { method: 'DELETE' });
    await fetchCustomers();
    showMessage('customerMessage', 'Customer deleted successfully!');
  } catch (error) {
    showMessage('customerMessage', 'Error deleting customer. Please try again.', 'error');
  }
}

// Clear customer form
function clearCustomerForm() {
  clearForm('customerForm');
}

// Search customers
function searchCustomers() {
  const query = document.getElementById('customerSearch').value.toLowerCase().trim();
  
  if (!query) {
    filteredCustomers = [...customers];
  } else {
    filteredCustomers = customers.filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      (customer.phone && customer.phone.toLowerCase().includes(query)) ||
      (customer.address && customer.address.toLowerCase().includes(query))
    );
  }
  
  renderCustomers();
  updateCustomerCount();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  const customerForm = document.getElementById('customerForm');
  const customerSearch = document.getElementById('customerSearch');

  if (customerForm) {
    customerForm.addEventListener('submit', saveCustomer);
  }

  if (customerSearch) {
    customerSearch.addEventListener('input', searchCustomers);
  }

  // Add message container
  if (customerForm && !document.getElementById('customerMessage')) {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'customerMessage';
    customerForm.parentNode.insertBefore(messageDiv, customerForm.nextSibling);
  }
});
