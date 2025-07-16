document.addEventListener("DOMContentLoaded", () => {
    const expenseList = document.getElementById("yearExpense-list");

    // Function to fetch and display yearly expenses
    async function fetchyearlyExpenses() {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch('http://localhost:4000/yearly-expense', {
                headers: {
                    "Authorization": token
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch yearly expenses');
            }

            const data = await response.json();
            displayyearlyExpenses(data.yearlyExpenses);
        } catch (error) {
            console.error('Error fetching yearly expenses:', error);
        }
    }

    // Function to display the fetched expenses
    function displayyearlyExpenses(expenses) {
        expenseList.innerHTML = ''; // Clear the previous table rows

        if (expenses.length === 0) {
            expenseList.innerHTML = '<tr><td colspan="2">No expenses for this year.</td></tr>';
            return;
        }

        expenses.forEach(expense => {
            const row = document.createElement("tr");

            // Create a cell for the year
            const yrCell = document.createElement("td");
            const validDate = new Date(`${expense._id}-01-01`);
            yrCell.textContent = validDate.toLocaleString('default', { year: 'numeric' });
            row.appendChild(yrCell);

            // Create a cell for the total expense
            const expenseCell = document.createElement("td");
            expenseCell.textContent = `₹${expense.totalExpense}`;
            row.appendChild(expenseCell);

            // Append the row to the table body
            expenseList.appendChild(row);
        });
    }

    fetchyearlyExpenses();
});
