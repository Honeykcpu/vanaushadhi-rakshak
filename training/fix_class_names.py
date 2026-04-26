# fix_class_names.py
# Converts common names in class_names.json to scientific names

import json

# Complete mapping: common name -> scientific name
NAME_MAPPING = {
    "Adhatoda-vasica": "Adhatoda_vasica",
    "Aloevera": "Aloe_vera",
    "Amla": "Phyllanthus_emblica",
    "Amruthaballi": "Tinospora_cordifolia",
    "Apple_Tree_leaf": "Malus_domestica",
    "Arali": "Nerium_oleander",
    "ashoka": "Saraca_asoca",
    "Astma_weed": "Euphorbia_hirta",
    "Badipala": "Holarrhena_pubescens",
    "Balloon_Vine": "Cardiospermum_halicacabum",
    "Bamboo": "Bambusa_vulgaris",
    "Beans": "Phaseolus_vulgaris",
    "Betel": "Piper_betle",
    "Bhrami": "Centella_asiatica",
    "Bringaraja": "Eclipta_prostrata",
    "c.martini": "Cymbopogon_martinii",
    "camphor": "Cinnamomum_camphora",
    "Caricature": "Graptophyllum_pictum",
    "Castor": "Ricinus_communis",
    "Catharanthus": "Catharanthus_roseus",
    "Chakte": "Sesbania_grandiflora",
    "Chilly": "Capsicum_annuum",
    "Citron lime (herelikai)": "Citrus_medica",
    "Coffee": "Coffea_arabica",
    "Common rue (naagdalli)": "Ruta_graveolens",
    "Coriender": "Coriandrum_sativum",
    "cucumber leaf": "Cucumis_sativus",
    "Curry": "Murraya_koenigii",
    "Cymbopogon citratus": "Cymbopogon_citratus",
    "Doddpathre": "Plectranthus_amboinicus",
    "Drumstick": "Moringa_oleifera",
    "Ekka": "Calotropis_gigantea",
    "Eucalyptus": "Eucalyptus_globulus",
    "Ganigale": "Abrus_precatorius",
    "Ganike": "Solanum_nigrum",
    "Gasagase": "Papaver_somniferum",
    "Ginger": "Zingiber_officinale",
    "Globe Amarnath": "Gomphrena_globosa",
    "Guava": "Psidium_guajava",
    "Henna": "Lawsonia_inermis",
    "Hibiscus": "Hibiscus_rosa_sinensis",
    "Honge": "Pongamia_pinnata",
    "hydrangea-cinerea": "Hydrangea_arborescens",
    "Insulin": "Costus_igneus",
    "Jackfruit": "Artocarpus_heterophyllus",
    "Jasmine": "Jasminum_officinale",
    "kamakasturi": "Hedychium_coronarium",
    "Kambajala": "Ipomoea_aquatica",
    "Kasambruga": "Phyllanthus_niruri",
    "kepala": "Artocarpus_hirsutus",
    "Kohlrabi": "Brassica_oleracea_gongylodes",
    "Lantana": "Lantana_camara",
    "Lemon": "Citrus_limon",
    "Lemongrass": "Cymbopogon_citratus",
    "Malabar_Nut": "Adhatoda_vasica",
    "Malabar_Spinach": "Basella_alba",
    "Mango": "Mangifera_indica",
    "Marigold": "Tagetes_erecta",
    "Mint": "Mentha_arvensis",
    "Neem": "Azadirachta_indica",
    "Nelavembu": "Andrographis_paniculata",
    "Nerale": "Syzygium_cumini",
    "Nooni": "Morinda_citrifolia",
    "Onion": "Allium_cepa",
    "Padri": "Stereospermum_suaveolens",
    "Palak(Spinach)": "Spinacia_oleracea",
    "Papaya": "Carica_papaya",
    "Parijatha": "Nyctanthes_arbor_tristis",
    "Pea": "Pisum_sativum",
    "Pepper": "Piper_nigrum",
    "Phaseolus": "Phaseolus_vulgaris",
    "piper betle": "Piper_betle",
    "Pomegranate": "Punica_granatum",
    "Pumpkin": "Cucurbita_pepo",
    "Raddish": "Raphanus_sativus",
    "Rose": "Rosa_chinensis",
    "Sampige": "Magnolia_champaca",
    "Sapota": "Manilkara_zapota",
    "Seethaashoka": "Saraca_asoca",
    "Seethapala": "Annona_squamosa",
    "Spinach1": "Spinacia_oleracea",
    "Tamarind": "Tamarindus_indica",
    "Taro": "Colocasia_esculenta",
    "Tecoma": "Tecoma_stans",
    "Thumbe": "Leucas_aspera",
    "Tomato": "Solanum_lycopersicum",
    "Tulsi": "Ocimum_sanctum",
    "Turmeric": "Curcuma_longa",
    "turnip-leaf": "Brassica_rapa"
}

# Load current class names
with open('checkpoints/class_names.json', 'r') as f:
    common_names = json.load(f)

print(f"Loaded {len(common_names)} class names")
print("\nConverting to scientific names...")

# Convert to scientific names
scientific_names = []
not_found = []

for common in common_names:
    if common in NAME_MAPPING:
        scientific = NAME_MAPPING[common]
        scientific_names.append(scientific)
        print(f"✓ {common} → {scientific}")
    else:
        # Keep as-is if not in mapping
        scientific_names.append(common)
        not_found.append(common)
        print(f"⚠ {common} (no mapping, kept as-is)")

# Backup original
with open('checkpoints/class_names_ORIGINAL_BACKUP.json', 'w') as f:
    json.dump(common_names, f, indent=2)
print("\n✓ Backup saved to: checkpoints/class_names_ORIGINAL_BACKUP.json")

# Save scientific names
with open('checkpoints/class_names.json', 'w') as f:
    json.dump(scientific_names, f, indent=2)
print("✓ Scientific names saved to: checkpoints/class_names.json")

# Summary
print("\n" + "="*70)
print("SUMMARY")
print("="*70)
print(f"Total classes: {len(scientific_names)}")
print(f"Converted: {len(scientific_names) - len(not_found)}")
print(f"Not found in mapping: {len(not_found)}")

if not_found:
    print("\nNames without mapping (kept as-is):")
    for name in not_found:
        print(f"  - {name}")

print("\n✓ DONE! class_names.json now has scientific names.")
print("\nVerify by running:")
print("  import json")
print("  with open('checkpoints/class_names.json', 'r') as f:")
print("      names = json.load(f)")
print("  print(names[:10])")