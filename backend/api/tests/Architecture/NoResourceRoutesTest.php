<?php

declare(strict_types=1);

/**
 * T124 / SC-015 / FR-038 — esta fase **não** introduz endpoint de recurso.
 *
 * A tentação é concreta: com os módulos criados e os tipos gerados, expor um `/api/news` é
 * trabalho de dez minutos. E seria escopo vazando — o contrato OpenAPI existe para orientar
 * a próxima fase, não para ser implementado nesta. Este teste transforma "não vamos fazer
 * isso agora" em algo que reprova a construção em vez de depender de disciplina.
 *
 * O que continua permitido: a rota de saúde que o Laravel já traz.
 */

/**
 * Raiz da aplicação, calculada do próprio arquivo.
 *
 * Nome distinto do helper de `ModuleBoundariesTest` de propósito: Pest carrega os dois
 * arquivos no mesmo processo, e funções de mesmo nome colidiriam.
 */
function appRoot(string $relative = ''): string
{
    return rtrim(dirname(__DIR__, 2).'/'.ltrim($relative, '/'), '/');
}


it('não há rota de recurso em routes/api.php', function (): void {
    $path = appRoot('routes/api.php');

    if (! file_exists($path)) {
        // Ausência do arquivo é o estado mais correto possível nesta fase.
        expect(true)->toBeTrue();

        return;
    }

    $source = file_get_contents($path);
    expect($source)->not->toBeFalse();

    $forbidden = ['Route::apiResource', 'Route::resource', 'Route::post', 'Route::put', 'Route::patch', 'Route::delete'];

    foreach ($forbidden as $needle) {
        expect($source)->not->toContain(
            $needle,
            "routes/api.php introduz `{$needle}`. Nenhum endpoint de recurso pertence a esta fase (FR-038, SC-015)."
        );
    }

    // `Route::get` só é aceito na verificação de saúde, que não expõe recurso de domínio.
    preg_match_all('#Route::get\(\s*[\'"]([^\'"]+)#', (string) $source, $matches);

    foreach ($matches[1] as $uri) {
        expect(in_array($uri, ['/up', 'up', '/health', 'health'], true))->toBeTrue(
            "routes/api.php expõe GET {$uri}. Apenas a verificação de saúde é permitida nesta fase."
        );
    }
});

it('nenhuma migração de domínio foi criada nesta fase', function (): void {
    $migrations = glob(appRoot('database/migrations/*.php')) ?: [];

    $domainTables = array_filter($migrations, static function (string $file): bool {
        // As migrações que o Laravel já traz (users, cache, jobs) não são de domínio.
        return preg_match('#(news|categor|cities|neighborhood|author|source|gazette|editorial|advertis|media)#i', basename($file)) === 1;
    });

    expect(array_values($domainTables))->toBe(
        [],
        'Nenhum model persistido nem migração de domínio pertence a esta fase (FR-038).'
    );
});
