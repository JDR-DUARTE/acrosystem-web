import { Suspense } from "react";
import {
  listCategoriasProducto,
  listPromos,
  listPlanes,
} from "@/lib/api/tienda";
import { listCategorias } from "@/lib/api/miembros";
import { getTasaVigente } from "@/lib/api/tasas";
import TiendaWizard from "@/components/tienda/tienda-wizard";

export const metadata = { title: "Tienda · AcroSystem" };

export default async function TiendaPage() {
  const [categorias, categoriasPrecio, promos, planes, tasa] = await Promise.all([
    listCategoriasProducto(),
    listCategorias(),
    listPromos(),
    listPlanes(),
    getTasaVigente(),
  ]);

  return (
    <Suspense>
      <TiendaWizard
        categorias={categorias}
        categoriasPrecio={categoriasPrecio}
        promos={promos}
        planes={planes}
        tasaVigente={tasa.vigente}
      />
    </Suspense>
  );
}
