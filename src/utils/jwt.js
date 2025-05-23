export function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

export function getJwtToken() {
  return new Promise((resolve) => {
    const isInIframe = window.self !== window.top;

    if (!isInIframe) resolve();

    const eventHandler = (event) => {
      if (event.data.event === 'updateToken') {
        localStorage.setItem('token', event.data.token);
        window.removeEventListener('message', eventHandler);
        return resolve();
      }
    };
    window.addEventListener('message', eventHandler);
    window.parent.postMessage({ event: 'getToken' }, '*');
  });
}
