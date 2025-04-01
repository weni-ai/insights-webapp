export default function env(name) {
  const envData =
    process.env?.[name] || window?.configs?.[name] || import.meta.env[name];

  if (name === 'FIREBASE_CONFIG' && typeof envData === 'string')
    return JSON.parse(envData);

  return envData;
}
