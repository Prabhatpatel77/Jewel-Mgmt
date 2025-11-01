let sales = [];
let filteredSales = [];

// Fetch all sales
async function fetchSales() {
  try {
    sales = await apiCall('/sales');
    filteredSales = [...sales];
    renderSales();
    updateSalesCount();
  } catch (error) {
    console.error('Error fetching sales:', error);
  }
}

// Render sales table
function renderSales() {
  const tbody = document.querySelector('#salesTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  filteredSales.forEach(sale => {
    const row = document.createElement('tr');
    row.className = 'fade-in';
    row.innerHTML = `
      <td><strong>${sale.customer_name}</strong></td>
      <td><span class="badge" style="background: var(--light-brown); color: var(--brown);">${sale.item_name}</span></td>
      <td>${sale.quantity}</td>
      <td><strong>${formatCurrency(sale.total_amount)}</strong></td>
      <td>${formatDate(sale.sale_date)}</td>
      <td>
        <button class="btn btn-outline-gold btn-sm me-1" onclick="editSale(${sale.sale_id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-outline-danger btn-sm" onclick="deleteSale(${sale.sale_id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Update sales count
function updateSalesCount() {
  const countElement = document.getElementById('salesCount');
  if (countElement) {
    countElement.textContent = `${filteredSales.length} sales`;
  }
}

// Update item dropdown for sales
// In sales.js, after items are fetched:
function updateItemDropdown() {
  const select = document.getElementById('saleItemId');
  select.innerHTML = '<option value="">Select Item</option>';
  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item.item_id;
    option.textContent = item.item_name + ' (' + formatCurrency(item.price) + ')';
    select.appendChild(option);
  });
}


// Calculate total amount
function calculateTotal() {
  const itemSelect = document.getElementById('saleItemId');
  const qtyInput = document.getElementById('saleQty');
  const totalInput = document.getElementById('saleTotalAmount');
  
  if (!itemSelect || !qtyInput || !totalInput) return;
  
  const selectedOption = itemSelect.options[itemSelect.selectedIndex];
  const price = parseFloat(selectedOption.dataset.price) || 0;
  const qty = parseInt(qtyInput.value) || 0;
  
  totalInput.value = (price * qty).toFixed(2);
}

// Save sale (create or update)
async function saveSale(e) {
  e.preventDefault();
  
  const saleData = {
    cust_id: parseInt(document.getElementById('saleCustId').value),
    item_id: parseInt(document.getElementById('saleItemId').value),
    quantity: parseInt(document.getElementById('saleQty').value),
    total_amount: parseFloat(document.getElementById('saleTotalAmount').value),
    sale_date: document.getElementById('saleDate').value
  };

  const saleId = document.getElementById('saleId').value;

  try {
    if (saleId) {
      // Update existing sale
      await apiCall(`/sales/${saleId}`, {
        method: 'PUT',
        body: JSON.stringify(saleData)
      });
    } else {
      // Create new sale
      await apiCall('/sales', {
        method: 'POST',
        body: JSON.stringify(saleData)
      });
    }

    clearSaleForm();
    await fetchSales();
    showMessage('saleMessage', `Sale ${saleId ? 'updated' : 'recorded'} successfully!`);
  } catch (error) {
    showMessage('saleMessage', 'Error saving sale. Please try again.', 'error');
  }
}

// Edit sale
function editSale(id) {
  const sale = sales.find(s => s.sale_id === id);
  if (!sale) return;

  document.getElementById('saleId').value = sale.sale_id;
  document.getElementById('saleCustId').value = sale.cust_id;
  document.getElementById('saleItemId').value = sale.item_id;
  document.getElementById('saleQty').value = sale.quantity;
  document.getElementById('saleTotalAmount').value = sale.total_amount;
  document.getElementById('saleDate').value = sale.sale_date.split('T')[0];

  // Scroll to form
  document.getElementById('saleForm').scrollIntoView({ behavior: 'smooth' });
}

// Delete sale
async function deleteSale(id) {
  if (!confirm('Are you sure you want to delete this sale?')) return;

  try {
    await apiCall(`/sales/${id}`, { method: 'DELETE' });
    await fetchSales();
    showMessage('saleMessage', 'Sale deleted successfully!');
  } catch (error) {
    showMessage('saleMessage', 'Error deleting sale. Please try again.', 'error');
  }
}

// Clear sale form
function clearSaleForm() {
  clearForm('saleForm');
  // Reset date to today
  document.getElementById('saleDate').value = new Date().toISOString().split('T')[0];
}

// Search sales
function searchSales() {
  const query = document.getElementById('salesSearch').value.toLowerCase().trim();
  
  if (!query) {
    filteredSales = [...sales];
  } else {
    filteredSales = sales.filter(sale =>
      sale.customer_name.toLowerCase().includes(query) ||
      sale.item_name.toLowerCase().includes(query)
    );
  }
  
  renderSales();
  updateSalesCount();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  const saleForm = document.getElementById('saleForm');
  const salesSearch = document.getElementById('salesSearch');
  const itemSelect = document.getElementById('saleItemId');
  const qtyInput = document.getElementById('saleQty');

  if (saleForm) {
    saleForm.addEventListener('submit', saveSale);
  }

  if (salesSearch) {
    salesSearch.addEventListener('input', searchSales);
  }

  if (itemSelect) {
    itemSelect.addEventListener('change', calculateTotal);
  }

  if (qtyInput) {
    qtyInput.addEventListener('input', calculateTotal);
  }

  // Add message container
  if (saleForm && !document.getElementById('saleMessage')) {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'saleMessage';
    saleForm.parentNode.insertBefore(messageDiv, saleForm.nextSibling);
  }

  // Update dropdowns when items are loaded
  setTimeout(() => {
    updateItemDropdown();
  }, 1000);
});
