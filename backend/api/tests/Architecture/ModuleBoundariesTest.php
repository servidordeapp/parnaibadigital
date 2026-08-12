<?php

declare(strict_types=1);

/**
 * T117 / cenário V12 / Princípio VIII — a fronteira entre módulos, verificada em teste.
 *
 * O Deptrac já cobre isto na análise estática. Este teste existe além dele por dois motivos
 * concretos: roda junto da suíte (`composer test`), sem exigir uma ferramenta extra instalada
 * na máquina de quem desenvolve; e falha com uma mensagem que **nomeia o arquivo, o módulo
 * invadido e o que fazer** — enquanto uma violação de camada costuma sair como uma linha
 * críptica de configuração.
 *
 * O que se verifica: nenhum arquivo referencia `App\Domain\<Outro>\` fora de `Contract\`.
 */

/**
 * Raiz da aplicação, calculada do próprio arquivo.
 *
 * `base_path()` do Laravel exigiria a aplicação inicializada — e um teste de fronteira
 * arquitetural que precisa levantar o framework para rodar contradiz exatamente o que ele
 * verifica: que o domínio não depende do framework.
 */
function repoPath(string $relative = ''): string
{
    return rtrim(dirname(__DIR__, 2).'/'.ltrim($relative, '/'), '/');
}

/** @return list<string> */
function phpFilesUnder(string $directory): array
{
    if (! is_dir($directory)) {
        return [];
    }

    $files = [];
    $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($directory));

    foreach ($iterator as $file) {
        if ($file instanceof SplFileInfo && $file->getExtension() === 'php') {
            $files[] = $file->getPathname();
        }
    }

    sort($files);

    return $files;
}

/** O módulo ao qual um arquivo pertence, ou `null` se ele estiver fora de um módulo. */
function moduleOf(string $path): ?string
{
    if (preg_match('#/app/(?:Domain|Application|Infrastructure)/([A-Za-z]+)/#', $path, $matches) === 1) {
        return $matches[1];
    }

    return null;
}

it('lista os 14 módulos de domínio declarados no plano', function (): void {
    $expected = [
        'AI', 'Advertising', 'Analytics', 'Authors', 'Categories', 'Cities', 'Editorial',
        'Media', 'Neighborhoods', 'News', 'OfficialGazette', 'Search', 'Sources', 'Users',
    ];

    $found = array_values(array_filter(
        scandir(repoPath('app/Domain')) ?: [],
        static fn (string $entry): bool => ! in_array($entry, ['.', '..'], true),
    ));

    sort($found);

    expect($found)->toBe($expected);
});

it('todo módulo publica um README de fronteira', function (): void {
    $missing = [];

    foreach (glob(repoPath('app/Domain/*'), GLOB_ONLYDIR) ?: [] as $module) {
        if (! file_exists($module.'/README.md')) {
            $missing[] = basename($module);
        }
    }

    expect($missing)->toBe([]);
});

it('nenhum módulo referencia o interior de outro', function (): void {
    $violations = [];

    foreach (phpFilesUnder(repoPath('app')) as $file) {
        $owner = moduleOf($file);
        $source = file_get_contents($file);

        if ($source === false) {
            continue;
        }

        preg_match_all('#use\s+App\\\\Domain\\\\([A-Za-z]+)\\\\([A-Za-z\\\\]+);#', $source, $matches, PREG_SET_ORDER);

        foreach ($matches as $match) {
            [$statement, $targetModule, $rest] = $match;

            // O próprio módulo pode usar o que quiser de si mesmo.
            if ($targetModule === $owner) {
                continue;
            }

            // `Contract\` é o que cada módulo publica — atravessá-lo é legítimo.
            if (str_starts_with($rest, 'Contract\\')) {
                continue;
            }

            $violations[] = sprintf(
                "%s\n      %s\n      → use App\\Domain\\%s\\Contract\\… — o interior de %s é privado (Princípio VIII)",
                str_replace(repoPath().'/', '', $file),
                trim($statement),
                $targetModule,
                $targetModule,
            );
        }
    }

    expect($violations)->toBe([], "Fronteiras de módulo violadas:\n  ".implode("\n  ", $violations));
});

it('o domínio não depende do framework', function (): void {
    $violations = [];

    foreach (phpFilesUnder(repoPath('app/Domain')) as $file) {
        $source = file_get_contents($file);

        if ($source === false) {
            continue;
        }

        // `Domain` precisa ser testável sem levantar a aplicação — é o que torna a regra de
        // negócio independente do framework, e o que permitiria trocá-lo sem reescrevê-la.
        if (preg_match('#use\s+(Illuminate|Laravel)\\\\#', $source) === 1) {
            $violations[] = str_replace(repoPath().'/', '', $file);
        }
    }

    expect($violations)->toBe([], "Domínio acoplado ao framework:\n  ".implode("\n  ", $violations));
});
