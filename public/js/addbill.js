// Set today's date to the Bill Date field
document.addEventListener("DOMContentLoaded", () => {
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("billDate").value = today;
  });

  // Function to add a new row to the bill
  function addRow() {
    const table = document
      .getElementById("billTable")
      .getElementsByTagName("tbody")[0];
    const newRow = table.insertRow();
    const itemIdCell = newRow.insertCell(0);
    const itemCell = newRow.insertCell(1);
    const quantityCell = newRow.insertCell(2);
    const unitsCell = newRow.insertCell(3);
    const rateCell = newRow.insertCell(4);
    const amountCell = newRow.insertCell(5);

    const rowIndex = table.rows.length; // Use the current row count as index

    // Input fields for item_id, name, quantity, units, rate, and amount
    itemIdCell.innerHTML = `<input type="number" name="bill[items][${rowIndex}][item_id]" placeholder="Item ID" required>`;
    itemCell.innerHTML = `<input type="text" name="bill[items][${rowIndex}][name]" placeholder="Item" required>`;
    quantityCell.innerHTML = `<input type="number" name="bill[items][${rowIndex}][quantity]" placeholder="Quantity" oninput="calculateAmount(this)" required>`;
    unitsCell.innerHTML = `<input type="text" name="bill[items][${rowIndex}][units]" placeholder="Units" required>`;
    rateCell.innerHTML = `<input type="number" name="bill[items][${rowIndex}][rate]" placeholder="Rate" oninput="calculateAmount(this)" required>`;
    amountCell.innerHTML = `<input type="number" name="bill[items][${rowIndex}][amount]" placeholder="Amount" readonly>`;
  }

  // Function to calculate the amount when quantity or rate changes
  function calculateAmount(input) {
    const row = input.parentElement.parentElement;
    const quantity = row.cells[2].getElementsByTagName("input")[0].value;
    const rate = row.cells[4].getElementsByTagName("input")[0].value;
    const amountCell = row.cells[5].getElementsByTagName("input")[0];
    const amount = quantity * rate || 0;

    amountCell.value = amount.toFixed(2); // Update amount
    updateTotal();
  }

  function deleteRow(button) {
    const row = button.parentElement.parentElement;
    row.remove();
    updateTotal();
  }

  // Function to update the total amount
  function updateTotal() {
    let total = 0;
    const table = document
      .getElementById("billTable")
      .getElementsByTagName("tbody")[0];
    for (let i = 0; i < table.rows.length; i++) {
      const amount =
        parseFloat(
          table.rows[i].cells[5].getElementsByTagName("input")[0].value
        ) || 0;
      total += amount;
    }
    document.getElementById("totalAmount").textContent = total.toFixed(2); // Update total display
    document.getElementById("totalAmountInput").value = total.toFixed(2); // Update hidden input
  }