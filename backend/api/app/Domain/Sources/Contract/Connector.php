<?php

declare(strict_types=1);

namespace App\Domain\Sources\Contract;

/**
 * O coletor de uma fonte. Sabe buscar; não sabe interpretar.
 *
 * A separação entre `Connector` (busca) e a normalização (interpreta) é o que permite trocar
 * o transporte de uma fonte — de raspagem para API oficial, por exemplo — sem tocar em nada
 * do que vem depois. Sem ela, migrar uma fonte significaria reescrever também o resumo e a
 * classificação dela.
 */
interface Connector
{
    public function source(): Source;

    /**
     * Busca o que há de novo desde a última execução.
     *
     * `$since` é obrigatório e não tem padrão: um coletor que não sabe de onde retomar
     * recoleta o arquivo inteiro a cada rodada — que é como uma ingestão barata vira uma
     * conta cara sem ninguém perceber.
     *
     * @return iterable<RawDocument>
     */
    public function fetchSince(\DateTimeImmutable $since): iterable;
}
