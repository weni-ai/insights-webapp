export default function env(name) {
  return import.meta.env[name] ||
  window?.configs?.[name] ||
  process.env[name] ||
  window?.configs?.[`VITE_${name}`] ||
  process.env[`VITE_${name}`];
}
