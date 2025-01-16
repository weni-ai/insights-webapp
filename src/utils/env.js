export default function env(name) {
  const envData = process.env?.[name] || window?.configs?.[name] || import.meta.env[name];

  if (name === 'FIREBASE_CONFIG')
    return JSON.parse(envData);
  
  return envData
}
