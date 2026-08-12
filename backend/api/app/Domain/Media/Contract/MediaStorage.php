<?php

declare(strict_types=1);

namespace App\Domain\Media\Contract;

/**
 * A porta de armazenamento de mídia.
 *
 * A URL devolvida é **opaca**: o frontend nunca conhece bucket, região ou fornecedor — o
 * contrato OpenAPI já trata `MediaRef.url` assim. Vazar a estrutura do storage para fora
 * desta porta transformaria uma troca de provedor numa migração de todas as telas.
 *
 * Nenhum SDK de fornecedor entra aqui (Princípio VIII). Nenhuma implementação nesta fase.
 */
interface MediaStorage
{
    /**
     * Guarda o binário e devolve a URL pública opaca.
     *
     * `$alt` é parâmetro obrigatório, e não opcional por conveniência: imagem sem texto
     * alternativo reprova WCAG 2.1 AA (Princípio III), e permitir criá-la aqui empurraria a
     * verificação para a camada mais distante do problema.
     */
    public function put(string $path, string $contents, string $contentType, string $alt): string;

    public function delete(string $path): void;

    /** URL pública de um caminho já armazenado. */
    public function urlFor(string $path): string;
}
