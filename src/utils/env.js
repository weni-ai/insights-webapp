export default function env(name) {
  const envData =
    process.env?.[name] || window?.configs?.[name] || import.meta.env[name];

  if (
    (name === 'FIREBASE_CONFIG' ||
      name === 'ENABLE_SALES_FUNNEL_AGENTS_UUID') &&
    typeof envData === 'string'
  )
    return JSON.parse(envData);

  return envData;
}
