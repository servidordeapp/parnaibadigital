# Ingestão de fontes

**Feature**: 001-fundacao-prototipo-monorepo · User Story 4, cenário 2

## A pergunta que este documento responde

> Preciso acrescentar uma fonte nova — o diário oficial de outro município. O que eu toco?

**Resposta: você cria uma classe que implementa `Connector` e a registra. Nada do núcleo
muda.**

## Os seis tipos

Todos em `backend/api/app/Domain/Sources/Contract/`. Nenhum tem implementação nesta fase
(FR-038) — o que existe é o formato do encaixe.

```text
Source              quem é a fonte: chave, nome exibido, municípios cobertos
  ↓
Connector           como buscar: fetchSince(DateTimeImmutable): iterable<RawDocument>
  ↓
RawDocument         o documento como veio, sem interpretação
  ↓
NormalizedContent   interpretado: órgão, tipo, data, texto limpo, município
  ↓
EditorialDraft      rascunho proposto — aguarda aprovação humana
  ↓
IngestionJob        a execução: qual fonte, desde quando, com que resultado
```

## Por que seis tipos e não um

Cada fronteira existe para permitir uma troca sem arrastar as outras:

- **`Connector` separado da normalização.** Migrar uma fonte de raspagem para API oficial
  troca só o coletor. Juntos, migrar o transporte significaria reescrever também o resumo e a
  classificação dela.
- **`RawDocument` separado de `NormalizedContent`.** Guardar o bruto permite reprocessar
  quando a normalização melhorar, sem coletar tudo de novo — e é o que torna verificável que
  o resumo corresponde ao original (Princípio V).
- **`EditorialDraft` como tipo próprio.** Ver `docs/editorial-pipeline.md`: um booleano
  `publicado = false` é fácil de inverter por engano.
- **`IngestionJob` como conceito de domínio.** Quando uma matéria estiver errada, a pergunta
  vai ser "de qual rodada isso veio e o que mais entrou junto". Uma fila genérica responde
  "houve um job"; este tipo responde a pergunta que se faz de verdade.

## Como acrescentar uma fonte

1. Implemente `Source` — chave estável, nome exibido, homepage e **municípios cobertos**.
   Uma fonte que não declara cobertura não pode ser ligada: sem isso o conteúdo entraria sem
   vínculo geográfico, que é o que FR-021 proíbe.
2. Implemente `Connector` em `app/Infrastructure/Sources/Adapter/`. `fetchSince` recebe o
   momento da última execução — obrigatório, sem padrão, para que ninguém recolete o arquivo
   inteiro a cada rodada.
3. Registre o conector no provedor da aplicação.
4. Pronto. O restante do fluxo — normalização, resumo, revisão, publicação — não sabe que
   fonte é.

O que você **não** toca: nenhum arquivo em `app/Domain/` fora do seu módulo, nenhuma tela,
nenhum caso de uso existente.

## O que ainda não existe

Nenhum coletor, nenhum agendamento, nenhuma fila. `IngestionJob` descreve uma execução;
quem a executa entra com a infraestrutura (RabbitMQ está em `infrastructure/`, documentado e
não provisionado — D-23).
