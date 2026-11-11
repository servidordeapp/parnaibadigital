<?php

declare(strict_types=1);

namespace App\Domain\Sources\Contract;

/**
 * O documento depois de interpretado: órgão, tipo, data e texto limpo.
 *
 * Ainda **não é matéria**. A distinção é deliberada e é a espinha do Princípio V: entre o
 * documento normalizado e o texto publicado existe a revisão humana, e um tipo que fizesse os
 * dois papéis permitiria pular esse passo sem que o código acusasse.
 */
interface NormalizedContent
{
    public function rawDocument(): RawDocument;

    public function agency(): string;

    public function documentType(): string;

    public function publishedAt(): \DateTimeImmutable;

    /** Texto limpo, sem marcação da origem. */
    public function plainText(): string;

    /** Município primário, por código IBGE. Sem ele o conteúdo não avança (FR-021). */
    public function municipalityIbgeCode(): string;
}
