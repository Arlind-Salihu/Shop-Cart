export async function csrfFetch(url, options = {}) {
    const token = document
        .querySelector('meta[name="csrf-token"]')
        ?.getAttribute("content");

    const headers = {
        "X-Requested-With": "XMLHttpRequest",
        ...(token ? { "X-CSRF-TOKEN": token } : {}),
        ...(options.headers || {}),
    };

    return fetch(url, {
        credentials: "same-origin",
        ...options,
        headers,
    });
}
