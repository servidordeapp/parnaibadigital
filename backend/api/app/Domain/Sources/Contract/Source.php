<?php

declare(strict_types=1);

namespace App\Domain\Sources\Contract;

/**
 * Uma fonte de conteúdo: um diário oficial, um feed, um portal de órgão público.
 *
 * A porta existe para que acrescentar uma fonte **não exija alterar o núcleo** (User Story 4,
 * cenário 2). Sem ela, cada fonte nova entraria como um ramo dentro do fluxo de ingestão, e o
 * fluxo viraria um `switch` sobre nomes de veículo — a forma mais rápida de tornar a próxima
 * fonte cara.
 *
 * Nenhuma implementação existe nesta fase (FR-038). O que está declarado é o formato do
 * encaixe, não o coletor.
 */
interface Source
{
    /** Identificador estável da fonte. Nunca o nome exibido, que pode mudar. */
    public function key(): string;

    /** Nome como o leitor o vê no rodapé de atribuição (FR-018). */
    public function displayName(): string;

    /** Endereço público da fonte — é ele que vai no link de atribuição. */
    public function homepage(): string;

    /**
     * Municípios cobertos, por código IBGE.
     *
     * Uma fonte que não declara cobertura não pode ser ligada: sem isso o conteúdo entraria
     * sem vínculo geográfico, e conteúdo sem município é o que FR-021 proíbe.
     *
     * @return list<string>
     */
    public function coversMunicipalities(): array;
}
