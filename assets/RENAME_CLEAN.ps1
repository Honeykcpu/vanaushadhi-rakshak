# Dataset Renaming Script for 89 Species
# Simple version without special characters

Write-Host "================================================================================"
Write-Host "DATASET RENAMING TO SCIENTIFIC NAMES - 89 SPECIES"
Write-Host "================================================================================"
Write-Host ""

# Complete mapping for all 89 species
$renameMap = @{
    "Adhatoda-vasica" = "Adhatoda_vasica"
    "Aloevera" = "Aloe_vera"
    "Amla" = "Phyllanthus_emblica"
    "Amruthaballi" = "Tinospora_cordifolia"
    "Apple_Tree_leaf" = "Malus_domestica"
    "Arali" = "Nerium_oleander"
    "Ashoka" = "Saraca_asoca"
    "Astma_weed" = "Euphorbia_hirta"
    "Badipala" = "Holarrhena_pubescens"
    "Balloon_Vine" = "Cardiospermum_halicacabum"
    "Bamboo" = "Bambusa_vulgaris"
    "Beans" = "Phaseolus_vulgaris"
    "Betel" = "Piper_betle"
    "Bhrami" = "Centella_asiatica"
    "Bringaraja" = "Eclipta_prostrata"
    "C.martini" = "Cymbopogon_martinii"
    "Camphor" = "Cinnamomum_camphora"
    "Caricature" = "Graptophyllum_pictum"
    "Castor" = "Ricinus_communis"
    "Catharanthus" = "Catharanthus_roseus"
    "Chakte" = "Sesbania_grandiflora"
    "Chilly" = "Capsicum_annuum"
    "Citron lime (herelikai)" = "Citrus_medica"
    "Coffee" = "Coffea_arabica"
    "Common rue (naagdalli)" = "Ruta_graveolens"
    "Coriender" = "Coriandrum_sativum"
    "Cucumber leaf" = "Cucumis_sativus"
    "Curry" = "Murraya_koenigii"
    "Cymbopogon citratus" = "Cymbopogon_citratus"
    "Doddpathre" = "Plectranthus_amboinicus"
    "Drumstick" = "Moringa_oleifera"
    "Ekka" = "Calotropis_gigantea"
    "Eucalyptus" = "Eucalyptus_globulus"
    "Ganigale" = "Abrus_precatorius"
    "Ganike" = "Solanum_nigrum"
    "Gasagase" = "Papaver_somniferum"
    "Ginger" = "Zingiber_officinale"
    "Globe Amarnath" = "Gomphrena_globosa"
    "Guava" = "Psidium_guajava"
    "Henna" = "Lawsonia_inermis"
    "Hibiscus" = "Hibiscus_rosa_sinensis"
    "Honge" = "Pongamia_pinnata"
    "Hydrangea-cinerea" = "Hydrangea_arborescens"
    "Insulin" = "Costus_igneus"
    "Jackfruit" = "Artocarpus_heterophyllus"
    "Jasmine" = "Jasminum_officinale"
    "Kamakasturi" = "Hedychium_coronarium"
    "Kambajala" = "Ipomoea_aquatica"
    "Kasambruga" = "Phyllanthus_niruri"
    "Kepala" = "Artocarpus_hirsutus"
    "Kohlrabi" = "Brassica_oleracea_gongylodes"
    "Lantana" = "Lantana_camara"
    "Lemon" = "Citrus_limon"
    "Lemongrass" = "Cymbopogon_citratus"
    "Malabar_Nut" = "Adhatoda_vasica"
    "Malabar_Spinach" = "Basella_alba"
    "Mango" = "Mangifera_indica"
    "Marigold" = "Tagetes_erecta"
    "Mint" = "Mentha_arvensis"
    "Neem" = "Azadirachta_indica"
    "Nelavembu" = "Andrographis_paniculata"
    "Nerale" = "Syzygium_cumini"
    "Nooni" = "Morinda_citrifolia"
    "Onion" = "Allium_cepa"
    "Padri" = "Stereospermum_suaveolens"
    "Palak (Spinach)" = "Spinacia_oleracea"
    "Papaya" = "Carica_papaya"
    "Parijatha" = "Nyctanthes_arbor_tristis"
    "Pea" = "Pisum_sativum"
    "Pepper" = "Piper_nigrum"
    "Phaseolus" = "Phaseolus_vulgaris"
    "Piper betle" = "Piper_betle"
    "Pomegranate" = "Punica_granatum"
    "Pumpkin" = "Cucurbita_pepo"
    "Raddish" = "Raphanus_sativus"
    "Rose" = "Rosa_chinensis"
    "Sampige" = "Magnolia_champaca"
    "Sapota" = "Manilkara_zapota"
    "Seethaashoka" = "Saraca_asoca"
    "Seethapala" = "Annona_squamosa"
    "Spinach1" = "Spinacia_oleracea"
    "Tamarind" = "Tamarindus_indica"
    "Taro" = "Colocasia_esculenta"
    "Tecoma" = "Tecoma_stans"
    "Thumbe" = "Leucas_aspera"
    "Tomato" = "Solanum_lycopersicum"
    "Tulsi" = "Ocimum_sanctum"
    "Turmeric" = "Curcuma_longa"
    "Turnip-leaf" = "Brassica_rapa"
}

$datasetPath = ".\Medicinal Leaf dataset"

# Check if dataset exists
if (-Not (Test-Path $datasetPath)) {
    Write-Host "ERROR: Dataset folder not found at: $datasetPath"
    Write-Host "Please run this script from the assets folder"
    pause
    exit
}

Write-Host "Found dataset at: $datasetPath"
Write-Host ""

# Create backup
Write-Host "Creating backup..."
$timestamp = Get-Date -Format 'yyyyMMdd_HHmmss'
$backupPath = ".\Medicinal_Leaf_Dataset_BACKUP_$timestamp"

try {
    Copy-Item -Path $datasetPath -Destination $backupPath -Recurse -Force
    Write-Host "Backup created at: $backupPath"
} catch {
    Write-Host "Warning: Backup failed - $($_.Exception.Message)"
}
Write-Host ""

# Rename folders
Write-Host "Renaming folders..."
Write-Host ""

$renamed = 0
$skipped = 0
$errors = 0

foreach ($oldName in $renameMap.Keys | Sort-Object) {
    $newName = $renameMap[$oldName]
    $oldPath = Join-Path $datasetPath $oldName
    $newPath = Join-Path $datasetPath $newName
    
    if (-Not (Test-Path $oldPath)) {
        Write-Host "[SKIP] $oldName (not found)"
        $skipped++
        continue
    }
    
    if ((Test-Path $newPath) -and ($oldPath -ne $newPath)) {
        Write-Host "[SKIP] $oldName -> $newName (target exists)"
        $skipped++
        continue
    }
    
    try {
        if ($oldPath -ne $newPath) {
            Rename-Item -Path $oldPath -NewName $newName -Force
            Write-Host "[OK] $oldName -> $newName"
            $renamed++
        }
    }
    catch {
        Write-Host "[ERROR] $oldName - $($_.Exception.Message)"
        $errors++
    }
}

Write-Host ""
Write-Host "================================================================================"
Write-Host "SUMMARY"
Write-Host "================================================================================"
Write-Host "Renamed: $renamed folders"
Write-Host "Skipped: $skipped folders"
Write-Host "Errors:  $errors folders"
Write-Host "================================================================================"
Write-Host ""

if ($renamed -gt 0) {
    Write-Host "SUCCESS! Dataset folders renamed to scientific names."
    Write-Host ""
    Write-Host "NEXT STEPS:"
    Write-Host "1. Open vanaushadhi_training.ipynb"
    Write-Host "2. Run all cells to retrain model"
    Write-Host "3. Wait for training to complete"
    Write-Host ""
}

Write-Host "Backup location: $backupPath"
Write-Host ""
pause
