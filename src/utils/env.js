export default function env(name) {
  if (import.meta.env[name] && name === 'VITE_FIREBASE_CONFIG')
    return JSON.parse(import.meta.env[name]);

  return (
    window?.configs?.[name] ||
    import.meta.env[name] ||
    window?.configs?.[`VITE_${name}`] ||
    import.meta.env[`VITE_${name}`]
  );
}
