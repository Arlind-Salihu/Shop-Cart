// resources/js/lib/csrfFetch.js
function csrfToken() {
    return (
        document
            .querySelector('meta[name="csrf-token"]')
            ?.getAttribute("content") || ""
    );
}

export async function csrfFetch(url, options = {}) {
    const headers = new Headers(options.headers || {});

    headers.set("X-Requested-With", "XMLHttpRequest");

    // For Laravel session CSRF protection:
    const token = csrfToken();
    if (token) headers.set("X-CSRF-TOKEN", token);

    // If you're sending JSON, keep it consistent
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }

    return fetch(url, {
        ...options,
        headers,
        credentials: "include", // important for session cookies
    });
}
