<?php

declare(strict_types=1);

namespace App\Domain\Sources\Contract;

/**
 * Uma execução de ingestão: qual fonte, desde quando, com que resultado.
 *
 * Existe como conceito de domínio, e não como detalhe da fila, porque o que interessa ao
 * produto é a **procedência**: quando uma matéria estiver errada, a pergunta vai ser "de qual
 * rodada isso veio e o que mais entrou junto". Uma fila genérica responde "houve um job";
 * este tipo responde a pergunta que se faz de verdade.
 */
interface IngestionJob
{
    public function id(): string;

    public function sourceKey(): string;

    public function startedAt(): \DateTimeImmutable;

    public function finishedAt(): ?\DateTimeImmutable;

    /** Quantos documentos novos a rodada trouxe. */
    public function documentsFound(): int;

    /** Falha da rodada, quando houve. `null` em execução bem-sucedida. */
    public function failureReason(): ?string;
}
