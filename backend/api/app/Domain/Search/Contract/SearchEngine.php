<?php

declare(strict_types=1);

namespace App\Domain\Search\Contract;

/**
 * A porta do motor de busca.
 *
 * D-14 decidiu **Meilisearch** e deliberadamente **não** o integrou nesta fase. A decisão
 * importa mesmo sem implementação: ela fecha uma pergunta arquitetural que voltaria em toda
 * discussão seguinte. A porta importa ainda mais — é ela que impede o SDK do fornecedor de
 * aparecer dentro de uma tela ou de um caso de uso, que é como uma escolha reversível vira
 * irreversível.
 *
 * Nenhuma implementação existe nesta fase (FR-038).
 */
interface SearchEngine
{
    /**
     * Indexa ou reindexa um documento.
     *
     * @param array<string, scalar|list<scalar>> $document
     */
    public function index(string $collection, string $id, array $document): void;

    public function remove(string $collection, string $id): void;

    /**
     * Consulta textual com filtros.
     *
     * `$filters` é intencionalmente simples — chave e valor. Repassar a sintaxe de filtro do
     * motor aqui vazaria o fornecedor pela porta que existe justamente para contê-lo.
     *
     * @param array<string, string> $filters
     * @return list<array{id: string, score: float}>
     */
    public function search(string $collection, string $term, array $filters = [], int $limit = 20): array;
}
