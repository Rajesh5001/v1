let sessionId = '';
let currentDocumentId = '';  // To store the ID of the document being updated

function showLoading() {
    document.getElementById('buffering-overlay').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('buffering-overlay').classList.add('hidden');
}


const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') { 
            searchDocuments();
        }
        
    });



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
        hideLoading()
        errorMessage.innerText = 'Please Enter a Document Name.';
        dataTableBody.innerHTML = '';
        dataTable.style.display = 'none';
        documentCount.innerText = ''; // Clear the document count if no input
        return;
    }

    if (!sessionId) {
        errorMessage.innerText = 'You must log in first.';
        hideLoading();
        return;
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
            hideLoading();
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

            const deleteCell = row.insertCell(5);
            deleteCell.innerHTML = `<button onclick="deleteDocument('${document.id}', this)" title="Delete" style="background: none; border: none; cursor: pointer;"><i class="fas fa-trash-alt" style="color: red;"></i></button>`;
            
            const updateCell = row.insertCell(6);
            updateCell.innerHTML = `<button onclick="editDocument('${document.id}', '${document.name__v}', '${document.type__v}', '${document.status__v}')" title="Update" style="background: none; border: none; cursor: pointer;"><i class="fas fa-edit" style="color: green;"></i></button>`;
            

        });
        // Display the table
        dataTable.style.display = 'table';

    } catch (error) {
        console.error('Search error:', error);
        errorMessage.innerText = error.message;
        dataTableBody.innerHTML = '';
        dataTable.style.display = 'none';
    }
    finally {
        hideLoading();
    }
}
async function deleteDocument(documentId, deleteButton) {
    const errorMessage = document.getElementById('error-message');

    if (!sessionId) {
        errorMessage.innerText = 'You must log in first.';
        return;
    }

    try {
        showLoading();

        const deleteUrl = `https://cors-anywhere.herokuapp.com/https://partnersi-prana4life-quality.veevavault.com/api/v24.1/objects/documents/${documentId}`;

        const deleteResponse = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${sessionId}`,
                'Accept': 'application/json',
            },
        });

        const responseData = await deleteResponse.json();
        console.log('Delete response:', responseData);

        if (deleteResponse.ok && responseData.responseStatus === 'SUCCESS') {
            // Remove the deleted document's row from the table
            const row = deleteButton.closest('tr');
            row.remove();

            // Update document count
            const documentCount = document.getElementById('document-count');
            const currentCount = parseInt(documentCount.innerText.split(": ")[1]) - 1;
            documentCount.innerText = `Number of Available Documents: ${currentCount}`;

            errorMessage.innerText = 'Document deleted successfully.';
        } else {
            throw new Error(
                `Delete failed: ${responseData.responseStatus || 'Unknown error'} - ${
                    responseData.responseMessage || JSON.stringify(responseData)
                }`
            );
        }
    } catch (error) {
        console.error('Delete error:', error);
        errorMessage.innerText = `Error deleting document: ${error.message}`;
    } finally {
        hideLoading();
    }
}

function editDocument(documentId, currentName) {
    // Show the update form
    document.getElementById('update-form').style.display = 'block';

    // Populate the form with the current document name
    document.getElementById('update-name').value = currentName;

    // Store the document ID for the update
    currentDocumentId = documentId;
}


function cancelUpdate() {
    // Hide the update form
    document.getElementById('update-form').style.display = 'none';
}

async function submitUpdate() {
    showLoading();

    const name = document.getElementById('update-name').value.trim();
    const errorMessage = document.getElementById('error-message');

    if (!name) {
        errorMessage.innerText = 'Document name is required for update.';
        hideLoading();
        return;
    }

    if (!sessionId) {
        errorMessage.innerText = 'You must log in first.';
        hideLoading();
        return;
    }

    try {
        const updateUrl = `https://cors-anywhere.herokuapp.com/https://partnersi-prana4life-quality.veevavault.com/api/v24.1/objects/documents/${currentDocumentId}`;
        
        const updatePayload = {
            name__v: name // Ensure the field name is correct
        };

        // Add a check for the current value to prevent unnecessary updates
        if (name === document.getElementById('update-name').placeholder) {
            errorMessage.innerText = 'No changes detected. Please modify the name before submitting.';
            hideLoading();
            return;
        }

        const updateResponse = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${sessionId}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
            },
            body: JSON.stringify(updatePayload),
        });

        const updateData = await updateResponse.json();
        console.log('Update response:', updateData);

        if (updateResponse.ok && updateData.responseStatus === 'SUCCESS') {
            cancelUpdate(); // Hide the update form
            errorMessage.innerText = 'Document updated successfully.';
            searchDocuments(); // Refresh the document list
        } else {
            throw new Error(`Update failed: ${JSON.stringify(updateData)}`);
        }
    } catch (error) {
        console.error('Update error:', error);
        errorMessage.innerText = error.message;
    } finally {
        hideLoading();
    }
}

