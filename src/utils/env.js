export default function env(name) {
  return (
    import.meta.env?.[name] ||
    window?.configs?.[name] ||
    window?.configs?.[`VITE_${name}`]
  );
}
