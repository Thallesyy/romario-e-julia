"""
Gera o estrelas.js a partir do catálogo do d3-celestial
(Hipparcos, estrelas até magnitude 6 , o limite do olho humano).

  python3 ferramentas/preparar-estrelas.py <pasta com os .json do d3-celestial>

Os arquivos vêm de https://cdn.jsdelivr.net/npm/d3-celestial@0.7.35/data/
(stars.6.json, starnames.json, constellations.lines.json, constellations.json)
"""
import json, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
SAIDA = os.path.join(AQUI, '..', 'estrelas.js')

NOMES_PT = {
    'And': 'Andrômeda', 'Ant': 'Máquina Pneumática', 'Aps': 'Ave do Paraíso', 'Aqr': 'Aquário',
    'Aql': 'Águia', 'Ara': 'Altar', 'Ari': 'Áries', 'Aur': 'Cocheiro', 'Boo': 'Boieiro',
    'Cae': 'Cinzel', 'Cam': 'Girafa', 'Cnc': 'Câncer', 'CVn': 'Cães de Caça', 'CMa': 'Cão Maior',
    'CMi': 'Cão Menor', 'Cap': 'Capricórnio', 'Car': 'Quilha', 'Cas': 'Cassiopeia', 'Cen': 'Centauro',
    'Cep': 'Cefeu', 'Cet': 'Baleia', 'Cha': 'Camaleão', 'Cir': 'Compasso', 'Col': 'Pomba',
    'Com': 'Cabeleira de Berenice', 'CrA': 'Coroa Austral', 'CrB': 'Coroa Boreal', 'Crv': 'Corvo',
    'Crt': 'Taça', 'Cru': 'Cruzeiro do Sul', 'Cyg': 'Cisne', 'Del': 'Golfinho', 'Dor': 'Dourado',
    'Dra': 'Dragão', 'Equ': 'Cavalo Menor', 'Eri': 'Erídano', 'For': 'Fornalha', 'Gem': 'Gêmeos',
    'Gru': 'Grou', 'Her': 'Hércules', 'Hor': 'Relógio', 'Hya': 'Hidra', 'Hyi': 'Hidra Macho',
    'Ind': 'Índio', 'Lac': 'Lagarto', 'Leo': 'Leão', 'LMi': 'Leão Menor', 'Lep': 'Lebre',
    'Lib': 'Libra', 'Lup': 'Lobo', 'Lyn': 'Lince', 'Lyr': 'Lira', 'Men': 'Mesa', 'Mic': 'Microscópio',
    'Mon': 'Unicórnio', 'Mus': 'Mosca', 'Nor': 'Esquadro', 'Oct': 'Oitante', 'Oph': 'Serpentário',
    'Ori': 'Órion', 'Pav': 'Pavão', 'Peg': 'Pégaso', 'Per': 'Perseu', 'Phe': 'Fênix', 'Pic': 'Pintor',
    'Psc': 'Peixes', 'PsA': 'Peixe Austral', 'Pup': 'Popa', 'Pyx': 'Bússola', 'Ret': 'Retículo',
    'Sge': 'Flecha', 'Sgr': 'Sagitário', 'Sco': 'Escorpião', 'Scl': 'Escultor', 'Sct': 'Escudo',
    'Ser': 'Serpente', 'Ser1': 'Serpente', 'Ser2': 'Serpente', 'Sex': 'Sextante', 'Tau': 'Touro',
    'Tel': 'Telescópio', 'Tri': 'Triângulo', 'TrA': 'Triângulo Austral', 'Tuc': 'Tucano',
    'UMa': 'Ursa Maior', 'UMi': 'Ursa Menor', 'Vel': 'Vela', 'Vir': 'Virgem', 'Vol': 'Peixe Voador',
    'Vul': 'Raposa',
}

# nomes de estrelas como se fala por aqui
ESTRELAS_PT = {
    'Rigil Kentaurus': 'Alfa Centauri', 'Arcturus': 'Arcturo', 'Procyon': 'Prócion',
    'Spica': 'Espiga', 'Pollux': 'Pólux', 'Regulus': 'Régulo', 'Alphard': 'Alfarde',
    'Betelgeuse': 'Betelgeuse', 'Polaris': 'Polar', 'Sirius': 'Sírius',
}


def ra(lon):
    return round(lon % 360, 3)


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    pasta = sys.argv[1]
    ler = lambda n: json.load(open(os.path.join(pasta, n), encoding='utf-8'))

    estrelas = ler('stars.6.json')['features']
    nomes = ler('starnames.json')
    linhas = ler('constellations.lines.json')['features']
    consts = ler('constellations.json')['features']

    plano = []
    for s in sorted(estrelas, key=lambda s: s['properties']['mag']):
        lon, lat = s['geometry']['coordinates']
        try:
            bv = float(s['properties']['bv'])
        except (TypeError, ValueError):
            bv = 0.6
        plano += [ra(lon), round(lat, 3), round(s['properties']['mag'], 2), round(bv, 2)]

    brilhantes = []
    ignorar = {'Toliman'}  # a companheira de Alfa Centauri, grudada nela
    for s in estrelas:
        n = nomes.get(str(s['id']), {})
        nome = n.get('name')
        if nome and nome not in ignorar and s['properties']['mag'] < 1.9:
            lon, lat = s['geometry']['coordinates']
            brilhantes.append([ESTRELAS_PT.get(nome, nome), ra(lon), round(lat, 3), s['properties']['mag']])
    brilhantes.sort(key=lambda b: b[3])

    tracos = {}
    for f in linhas:
        tracos[f['id']] = [[[ra(p[0]), round(p[1], 3)] for p in linha] for linha in f['geometry']['coordinates']]

    rotulos = {}
    for f in consts:
        d = f['properties'].get('display') or f['geometry']['coordinates']
        rotulos[f['id']] = [NOMES_PT.get(f['id'], f['properties']['name']), ra(d[0]), round(d[1], 2), int(f['properties']['rank'])]

    with open(SAIDA, 'w', encoding='utf-8') as out:
        out.write('/* gerado por ferramentas/preparar-estrelas.py , catálogo Hipparcos via d3-celestial */\n')
        out.write('/* ESTRELAS: [ra, dec, magnitude, B-V] em sequência, coordenadas J2000 em graus */\n')
        out.write('var ESTRELAS = ' + json.dumps(plano, separators=(',', ':')) + ';\n')
        out.write('var ESTRELAS_NOMES = ' + json.dumps(brilhantes, ensure_ascii=False, separators=(',', ':')) + ';\n')
        out.write('var CONSTELACOES_LINHAS = ' + json.dumps(tracos, separators=(',', ':')) + ';\n')
        out.write('var CONSTELACOES_NOMES = ' + json.dumps(rotulos, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('ok: %d estrelas, %d nomes, %d constelações, %.0f KB' % (
        len(plano) // 4, len(brilhantes), len(tracos), os.path.getsize(SAIDA) / 1024))


if __name__ == '__main__':
    main()
