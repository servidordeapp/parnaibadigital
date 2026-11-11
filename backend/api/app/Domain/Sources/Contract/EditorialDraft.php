<?php

declare(strict_types=1);

namespace App\Domain\Sources\Contract;

/**
 * O rascunho que a automação produz e que **um editor precisa aprovar** antes de virar
 * matéria.
 *
 * `approvedBy()` devolver `null` é o estado normal de um rascunho recém-criado, e nenhuma
 * parte do sistema pode publicá-lo assim. É por isso que o rascunho é um tipo próprio, e não
 * uma matéria com um campo `publicado = false`: um booleano é fácil de inverter por engano;
 * um tipo distinto obriga a passar pelo caso de uso de aprovação (Princípio V).
 */
interface EditorialDraft
{
    public function normalizedContent(): NormalizedContent;

    /** Manchete proposta, no padrão `[Bairro] + [fato]`. */
    public function proposedHeadline(): string;

    public function proposedStandfirst(): string;

    /** Quem aprovou. `null` enquanto não houver revisão humana — e aí não se publica. */
    public function approvedBy(): ?string;

    public function approvedAt(): ?\DateTimeImmutable;
}
