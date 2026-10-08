"""
Gera o fotos.js a partir das fotos da pasta fotos/.

  python ferramentas/preparar-fotos.py            (lê a pasta fotos/)
  python ferramentas/preparar-fotos.py <pasta>    (lê outra pasta)

Todas as fotos da pasta viram estrelas do coração. As fotos grandes (polaroides)
são as que estão em MEMORIAS, no começo do <script> do index.html: o id é o nome
do arquivo sem a extensão, e o "foco" opcional diz onde cortar (0 = topo, 1 = base).

As fotos vão embutidas (base64) para o site funcionar até abrindo o
index.html direto do computador, sem servidor.
"""
import base64, io, json, os, re, sys
from PIL import Image, ImageOps

try:  # fotos .heic do iPhone, se o pillow-heif estiver instalado
    import pillow_heif
    pillow_heif.register_heif_opener()
    EXTENSOES = ('.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif')
except ImportError:
    EXTENSOES = ('.jpg', '.jpeg', '.png', '.webp')

AQUI = os.path.dirname(os.path.abspath(__file__))
ORIGEM = os.path.join(AQUI, '..', 'fotos')
INDEX = os.path.join(AQUI, '..', 'index.html')
SAIDA = os.path.join(AQUI, '..', 'fotos.js')
FOCO_PADRAO = 0.40
FOCO_MINI = {}  # ajuste fino do recorte quadrado, se precisar


def memorias_do_index():
    """lê os ids (e o foco) das fotos grandes direto do MEMORIAS do index.html"""
    html = open(INDEX, encoding='utf-8').read()
    bloco = re.search(r'var MEMORIAS = \[(.*?)\];', html, re.S)
    if not bloco:
        sys.exit('não achei o MEMORIAS no index.html')
    destaques = {}
    for item in re.finditer(r'\{[^{}]*?\}', bloco.group(1)):
        fid = re.search(r"id\s*:\s*'([^']+)'", item.group())
        foco = re.search(r'foco\s*:\s*([\d.]+)', item.group())
        if fid:
            destaques[fid.group(1)] = float(foco.group(1)) if foco else FOCO_PADRAO
    return destaques


def ordem_natural(nome):
    return [int(p) if p.isdigit() else p.lower() for p in re.split(r'(\d+)', nome)]


def abrir(caminho):
    img = Image.open(caminho)
    img = ImageOps.exif_transpose(img)
    return img.convert('RGB')


def recortar(img, proporcao, foco):
    """recorta para largura/altura = proporcao, deslizando no eixo que sobra"""
    w, h = img.size
    if w / h > proporcao:
        nw = round(h * proporcao)
        x = round((w - nw) * 0.5)
        return img.crop((x, 0, x + nw, h))
    nh = round(w / proporcao)
    y = round((h - nh) * foco)
    return img.crop((0, y, w, y + nh))


def para_uri(img, qualidade):
    buf = io.BytesIO()
    img.save(buf, 'JPEG', quality=qualidade, optimize=True, progressive=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode('ascii')


def main():
    origem = sys.argv[1] if len(sys.argv) > 1 else ORIGEM
    DESTAQUES = memorias_do_index()
    todos = os.listdir(origem)
    nomes = sorted((f for f in todos if f.lower().endswith(EXTENSOES)), key=ordem_natural)
    if any(f.lower().endswith(('.heic', '.heif')) for f in todos) and '.heic' not in EXTENSOES:
        print('atenção: tem foto .heic, e sem o pillow-heif ela fica de fora')
    if not nomes:
        sys.exit('nenhuma foto encontrada em ' + os.path.abspath(origem))

    destaques, minis = {}, {}
    for nome in nomes:
        fid = os.path.splitext(nome)[0]
        img = abrir(os.path.join(origem, nome))

        quadrada = recortar(img, 1.0, FOCO_MINI.get(fid, 0.38)).resize((224, 224), Image.LANCZOS)
        minis[fid] = para_uri(quadrada, 80)

        if fid in DESTAQUES:
            retrato = img.width < img.height
            prop = 3 / 4 if retrato else 4 / 3
            rec = recortar(img, prop, DESTAQUES[fid])
            alvo = (600, 800) if retrato else (800, 600)
            rec = rec.resize(alvo, Image.LANCZOS)
            destaques[fid] = {'aspect': round(rec.width / rec.height, 4), 'uri': para_uri(rec, 82)}

    faltando = [d for d in DESTAQUES if d not in destaques]
    if faltando:
        print('atenção, estão no MEMORIAS mas não achei a foto:', ', '.join(faltando))

    with open(SAIDA, 'w', encoding='utf-8') as f:
        f.write('/* gerado por ferramentas/preparar-fotos.py , não edite à mão */\n')
        f.write('var FOTOS_DESTAQUE = ' + json.dumps(destaques) + ';\n')
        f.write('var FOTOS_MINI = ' + json.dumps(minis) + ';\n')
    print('ok: %d destaques, %d no coração, %.1f MB' % (len(destaques), len(minis), os.path.getsize(SAIDA) / 1e6))


if __name__ == '__main__':
    main()
