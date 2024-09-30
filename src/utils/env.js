export default function env(name) {
  if (import.meta.env[`VITE_${name}`] && name === 'VITE_FIREBASE_CONFIG')
    return JSON.parse(import.meta.env[`VITE_${name}`]);

  return (
    window?.configs?.[name] ||
    import.meta.env[name] ||
    window?.configs?.[`VITE_${name}`] ||
    import.meta.env[`VITE_${name}`]
  );
}
