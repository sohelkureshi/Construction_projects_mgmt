async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof data === "string" ? data : data.message || data.error || "Request failed";
    throw new Error(message);
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body, options = {}) => request(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  put: (path, body, options = {}) => request(path, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  delete: (path) => request(path, { method: "DELETE" })
};
