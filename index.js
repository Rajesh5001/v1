let sessionId = '';


function showLoading() {
    document.getElementById('buffering-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('buffering-overlay').classList.add('hidden');
}

window.onload = performLogin;



async function performLogin() {
    const username = 'prana.user4@partnersi-prana4life.com';
    const password = 'Prana4@2025!';
    const errorMessage = document.getElementById('error-message');

    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    try {
        const loginResponse = await fetch(
            'https://cors-anywhere.herokuapp.com/https://partnersi-prana4life-quality.veevavault.com/api/v24.1/auth',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: formData,
            }
        );

        const loginData = await loginResponse.json();
        
        if (loginResponse.ok && loginData.sessionId) {
            sessionId = loginData.sessionId;  // Store sessionId
        } else {
            throw new Error(`Login warning: ${JSON.stringify(loginData)}`);
        }
    } catch (error) {
        console.error(error);
        errorMessage.innerText = error.message;
    }
}

async function searchDocuments() {
    showLoading();
    const searchInput = document.getElementById('search-input').value.trim();
    const errorMessage = document.getElementById('error-message');
    const dataTable = document.getElementById('data-table');
    const dataTableBody = dataTable.getElementsByTagName('tbody')[0];
    const documentCount = document.getElementById('document-count'); // Element to display document count

    if (!searchInput) {
        errorMessage.innerText = 'Please Enter a Document Name.';
        dataTableBody.innerHTML = '';
        dataTable.style.display = 'none';
        documentCount.innerText = ''; // Clear the document count if no input
        return;
        hideLoading();
    }

    if (!sessionId) {
        errorMessage.innerText = 'You must log in first.';
        return;
        hideLoading();

    }

    try {
        const apiUrl = `https://cors-anywhere.herokuapp.com/https://partnersi-prana4life-quality.veevavault.com/api/v24.1/query?q=select id,document_number__v, name__v, lifecycle__v, status__v, type__v FROM documents find( '${searchInput}' scope content)`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionId}`,
                'Accept': 'application/json',
            },
        });

        const data = await response.json();
        console.log('data:', data);

        // Check if data contains documents
        if (!data.data || data.data.length === 0) {
            errorMessage.innerText = 'No documents found.';
            dataTableBody.innerHTML = '';
            dataTable.style.display = 'none';
            documentCount.innerText = ''; // Clear document count if no documents found
            return;
        }

        // Clear previous results
        dataTableBody.innerHTML = '';
        errorMessage.innerText = '';

        // Update the document count on the UI based on the length of the data array
        documentCount.innerText = `Number of Available Documents: ${data.data.length}`;

        // Populate the table with document data
        data.data.forEach(document => {
            const row = dataTableBody.insertRow();

            const documentIdCell = row.insertCell(0);
            const documentLink = `https://partnersi-prana4life-quality.veevavault.com/ui/#doc_info/${document.id}/1/0?newTvsl=true&idx=1&pt=rl`;

            documentIdCell.innerHTML = `<a href="${documentLink}" target="_blank">${document.document_number__v || 'N/A'}</a>`;

            const documentNameCell = row.insertCell(1);
            documentNameCell.innerHTML = `<a href="${documentLink}" target="_blank">${document.name__v || 'N/A'}</a>`;

            const lifeCycleCell = row.insertCell(2);
            lifeCycleCell.innerText = document.lifecycle__v || 'N/A';

            const documentTypeCell = row.insertCell(3);
            documentTypeCell.innerText = document.type__v || 'N/A';

            const documentStatusCell = row.insertCell(4);
            documentStatusCell.innerText = document.status__v || 'N/A';
        });

        // Display the table
        dataTable.style.display = 'table';

    } catch (error) {
        console.error('Search error:', error);
        errorMessage.innerText = error.message;
        dataTableBody.innerHTML = '';
        dataTable.style.display = 'none';
    }
    finally{
            hideLoading();

    }
}
