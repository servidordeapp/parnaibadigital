/**
 * SC-009 — colisão entre slug de município e rota reservada REPROVA a construção.
 *
 * Ligado ao `prebuild` das duas aplicações, então roda antes de qualquer página ser gerada.
 * A escolha de reprovar em vez de avisar é deliberada: um slug ambíguo não quebra o build
 * do Astro — ele gera duas páginas plausíveis e a errada vence. O erro só apareceria em
 * produção, na forma de uma rota do portal que deixou de existir.
 */
import { findSlugConflicts, MUNICIPALITIES } from "@parnaibadigital/api-client/data/municipalities";

const conflicts = findSlugConflicts(MUNICIPALITIES);

if (conflicts.length > 0) {
  console.error(
    `Registro de slugs REPROVADO — ${String(conflicts.length)} conflito(s) (SC-009, D-13):\n`,
  );
  for (const conflict of conflicts) {
    console.error(`  [${conflict.reason}] ${conflict.message}`);
  }
  console.error(
    "\nResolva escolhendo outro slug para o município, ou renomeando a rota do portal em\n" +
      "packages/api-client/src/data/municipalities.ts. As duas coisas não podem ocupar a mesma raiz.",
  );
  process.exit(1);
}

console.log(
  `Registro de slugs íntegro — ${String(MUNICIPALITIES.length)} municípios, nenhum conflito com rota reservada.`,
);
