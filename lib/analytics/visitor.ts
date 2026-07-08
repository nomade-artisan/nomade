export function getVisitorId() {
  let visitorId = localStorage.getItem("visitor_id");

  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("visitor_id", visitorId);
  }

  return visitorId;
}

export function getSessionId() {
  let sessionId = sessionStorage.getItem("session_id");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem("session_id", sessionId);
  }

  return sessionId;
}