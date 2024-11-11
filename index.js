let sessionId = '';

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

        if (!loginResponse.ok) {
            const errorText = await loginResponse.text();
            throw new Error(`Login failed: ${errorText}`);
        }

        const loginData = await loginResponse.json();
        sessionId = loginData.sessionId;  // Store sessionId
    } catch (error) {
        errorMessage.innerText = error.message;
    }
}

async function searchDocuments() {
    const searchInput = document.getElementById('search-input').value.trim();
    const errorMessage = document.getElementById('error-message');
    const dataTable = document.getElementById('data-table');
    const dataTableBody = dataTable.getElementsByTagName('tbody')[0];
    const documentCount = document.getElementById('document-count');

    if (!searchInput) {
        errorMessage.innerText = 'Please Enter a Document Name.';
        dataTableBody.innerHTML = '';
        dataTable.style.display = 'none';
        documentCount.innerText = '';
        return;
    }

    if (!sessionId) {
        errorMessage.innerText = 'You must log in first.';
        return;
    }

    try {
       const apiUrl = `https://cors-anywhere.herokuapp.com/https://partnersi-prana4life-quality.veevavault.com/api/v24.2/objects/documents?search=${encodeURIComponent(searchInput)}&scope=all`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${sessionId}`,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Search failed. Please try again.');
        }

        const data = await response.json();

        if (data.size === 0 || !data.documents || !Array.isArray(data.documents)) {
            errorMessage.innerText = 'No documents found.';
            dataTableBody.innerHTML = '';
            dataTable.style.display = 'none';
            return;
        }

        dataTableBody.innerHTML = '';
        errorMessage.innerText = '';
        documentCount.innerText = `Number of Available Documents: ${data.size}`;

        data.documents.forEach(document => {
            const row = dataTableBody.insertRow();

            const documentIdCell = row.insertCell(0);
            const documentLink = `https://partnersi-prana4life-quality.veevavault.com/ui/#doc_info/${document.document.id}/1/0?newTvsl=true&idx=1&pt=rl`;

            documentIdCell.innerHTML = `<a href="${documentLink}" target="_blank">${document.document.id || 'N/A'}</a>`;

            const documentNameCell = row.insertCell(1);
            documentNameCell.innerHTML = `<a href="${documentLink}" target="_blank">${document.document.name__v || 'N/A'}</a>`;

            const lifeCycleCell = row.insertCell(2);
            lifeCycleCell.innerText = document.document.lifecycle__v || 'N/A';

            const documentTypeCell = row.insertCell(3);
            documentTypeCell.innerText = document.document.type__v || 'N/A';

            const documentStatusCell = row.insertCell(4);
            documentStatusCell.innerText = document.document.status__v || 'N/A';
        });

        dataTable.style.display = 'table';

    } catch (error) {
        errorMessage.innerText = error.message;
        dataTableBody.innerHTML = '';
        dataTable.style.display = 'none';
    }
}
