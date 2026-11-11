<?php

declare(strict_types=1);

namespace App\Domain\Sources\Contract;

/**
 * O documento como a fonte o entregou, **sem interpretação**.
 *
 * Guardar o bruto separado do normalizado não é redundância: é o que permite reprocessar uma
 * fonte quando a normalização melhorar, sem precisar coletar tudo de novo — e é o que torna
 * verificável a afirmação de que o resumo corresponde ao original (Princípio V).
 */
interface RawDocument
{
    public function sourceKey(): string;

    /** Identificador do documento **na origem** — é o que evita coletar duas vezes. */
    public function externalId(): string;

    /** Endereço verificável do original. Nunca opcional (Princípio V). */
    public function sourceUrl(): string;

    public function fetchedAt(): \DateTimeImmutable;

    /** Conteúdo bruto, como veio. Pode ser HTML, PDF extraído, texto ou JSON. */
    public function payload(): string;
}
