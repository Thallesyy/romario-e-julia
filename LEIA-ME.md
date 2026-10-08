# O céu daquela noite: Romario e Julia

O céu de verdade da noite do primeiro beijo do Romario e da Julia, em 08/10/2025, em
Esteio (RS): as estrelas do catálogo Hipparcos, a Via Láctea, a Lua quase cheia nascendo
e os planetas. Depois sobe pro espaço com as fotos do casal, até elas virarem a
constelação "R.J" em forma de coração.

No ar em https://thallesyy.github.io/romario-e-julia/

## Estado

- **Hora:** ninguém sabe a hora certa, então ficou 21h.
  - Às 21h a lua, quase cheia, está nascendo, e o Cruzeiro do Sul está baixinho.
  - Antes de umas 20h30 a lua ainda não tinha nascido, e aí a cena dela vira a do Escorpião,
    sozinha.
- **Fotos:** são as 26 do Romario, em `fotos/` como `foto01` a `foto26`.
  - Ficam na mesma ordem dos nomes do WhatsApp.
  - Os 5 vídeos não entraram.
- **Textos:**
  - As legendas, o bilhete e a frase de baixo do final são frases do Romario.
    Só passei a primeira letra pra minúscula, pra combinar com o resto do site.
  - O resto é rascunho.
- **Não testado num iPhone de verdade.**

## O que mudou no código em relação ao original

- **Cruzeiro do Sul baixinho:** quando ele está a menos de 15° do horizonte, o texto diz
  isso, a câmera mira um pouco mais alto, o nome vai em cima da cruz e os prédios abrem
  espaço pra ela.
- **O voo no espaço** vai na direção do centro da Via Láctea, qualquer que seja a altura
  dele no céu (`ALT_VOO`).
- **O texto do Escorpião** diz "se pondo" quando ele está no oeste.
- **Esteio** entrou no mapa de luzes.
- **O final** ganhou uma sombra suave atrás das frases, porque o centro da Via Láctea fica
  bem atrás delas.

## Onde trocar as coisas

Quase tudo fica no começo do `<script>` do `index.html`, no bloco "TUDO QUE É DO CASAL":

- `NOITE`: dia, hora, fuso, cidade, latitude e longitude. O céu, a Lua, os planetas e a
  Terra se recalculam sozinhos.
- `INICIAIS`: o nome da constelação (era "T.N").
- `MEMORIAS`: as fotos grandes, com as legendas.
- `TEXTOS`: todos os textos do caminho, o bilhete e o final.

Ainda presos em Sapucaia do Sul / RS, que precisam ser refeitos se o casal for de outro lugar:

- `CIDADES`, `ESTRADAS` e `AGUAS`: o mapa de luzes visto de perto;
- `CONTORNO_RS` e o rótulo "Rio Grande do Sul" (e Uruguai, Argentina, Oceano Atlântico);
- as luzes no horizonte, mais fortes pro sul (`pesoSul`).

## Fotos

1. Coloque as fotos na pasta `fotos/`, em JPG, PNG ou WEBP. Fotos HEIC do iPhone só
   funcionam com o `pillow-heif` instalado.
2. No `MEMORIAS`, use o nome do arquivo sem a extensão como `id`.
3. Rode:

   ```
   python ferramentas/preparar-fotos.py
   ```

O script gera o `fotos.js`:

- todas as fotos da pasta viram estrelas do coração (30 ou mais deixam ele bonito);
- as fotos do `MEMORIAS` também viram polaroides.

Se uma polaroide cortar a cabeça de alguém, ponha `foco` na foto, de 0 (topo) a 1 (base).

## Como testar

Rode `python -m http.server` dentro da pasta e abra o endereço que ele mostrar.

- `index.html?t=0.5` começa no meio da viagem.
- `index.html?simples=1` mostra a versão sem 3D.
- `index.html?teste=1&t=0.88` desenha só um quadro, pra tirar print.

## Arquivos

- `index.html`: a experiência toda.
- `astro.js`: as contas do céu (estrelas, Sol, Lua, planetas).
- `estrelas.js`: o catálogo de estrelas e constelações, gerado; não precisa mexer.
- `fotos.js`: as fotos embutidas, gerado pelo `ferramentas/preparar-fotos.py`.
- `fotos/`: as fotos originais do casal.
