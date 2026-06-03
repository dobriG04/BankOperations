const API = process.env.REACT_APP_API_URL || 'http://localhost:5089';

async function apiFetch(path, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body !== null) options.body = JSON.stringify(body);

    const response = await fetch(API + path, options);
    const data = await response.json();
    if (!response.ok) {
        const error = new Error(data.message || 'Request failed');
        error.data = data;
        throw error;
    }
    return data;
}

export const getClients = () => apiFetch('/api/clients');
export const getClientDetails = (id) => apiFetch(`/api/clients/${id}`);
export const createPhysicalPerson = (body) => apiFetch('/api/clients/physical', 'POST', body);
export const createLegalEntity = (body) => apiFetch('/api/clients/legal', 'POST', body);

export const createBankAccount = (body) => apiFetch('/api/bankaccounts', 'POST', body);
export const closeBankAccount = (id) => apiFetch(`/api/bankaccounts/${id}/close`, 'POST');

export const createCredit = (body) => apiFetch('/api/credits', 'POST', body);
export const getCreditDetails = (id) => apiFetch(`/api/credits/${id}`);
export const payInstallment = (installmentId) => apiFetch('/api/credits/pay', 'POST', installmentId);