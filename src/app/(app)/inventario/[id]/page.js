import DetalleProductoView from "@/components/inventario/detalle-producto-view";

export const metadata = { title: "Detalle de Producto · AcroSystem" };

export default async function EditarProductoPage({ params }) {
  const { id } = await params;
  return <DetalleProductoView productId={id} />;
}
