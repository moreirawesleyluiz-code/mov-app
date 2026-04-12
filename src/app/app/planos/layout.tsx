/**
 * Fundo alinhado ao app autenticado (movApp claro).
 */
export default function PlanosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative -mx-4 -mt-8 min-h-[calc(100vh-4rem)] bg-movApp-bg px-4 pb-36 pt-6 text-movApp-ink sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-0 lg:min-h-[calc(100vh-6rem)] lg:rounded-2xl lg:px-8 lg:pb-40">
      {children}
    </div>
  );
}
