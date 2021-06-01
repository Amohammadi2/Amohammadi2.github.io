export function isProduction() {
  const local_hosts = [
    /localhost/,
    /127\.0\.0\.1/,
    /192\.168\..*/,
  ]

  for (const host of local_hosts) {
    if (window.location.hostname.match(host))
      return false;
  }
  return true;
}