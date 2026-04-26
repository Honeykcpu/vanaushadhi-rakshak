import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

const API_URL = "http://127.0.0.1:5000";
const { width } = Dimensions.get("window");

// All 89 species from the model
const SPECIES_LIST = [
  "Adhatoda vasica",
  "Aloe vera",
  "Amla",
  "Amruthaballi",
  "Apple Tree",
  "Arali",
  "Ashoka",
  "Astma weed",
  "Badipala",
  "Balloon Vine",
  "Bamboo",
  "Beans",
  "Betel",
  "Brahmi",
  "Bringaraja",
  "Camphor",
  "Caricature",
  "Castor",
  "Catharanthus",
  "Chakte",
  "Chilly",
  "Citron lime",
  "Coffee",
  "Common rue",
  "Coriander",
  "Cucumber",
  "Curry",
  "Cymbopogon",
  "Doddpathre",
  "Drumstick",
  "Ekka",
  "Eucalyptus",
  "Ganigale",
  "Ganike",
  "Gasagase",
  "Ginger",
  "Globe Amaranth",
  "Guava",
  "Henna",
  "Hibiscus",
  "Honge",
  "Hydrangea",
  "Insulin plant",
  "Jackfruit",
  "Jasmine",
  "Kamakasturi",
  "Kambajala",
  "Kasambruga",
  "Kepala",
  "Kohlrabi",
  "Lantana",
  "Lemon",
  "Lemongrass",
  "Malabar Nut",
  "Malabar Spinach",
  "Mango",
  "Marigold",
  "Mint",
  "Neem",
  "Nelavembu",
  "Nerale",
  "Nooni",
  "Onion",
  "Padri",
  "Palak Spinach",
  "Papaya",
  "Parijatha",
  "Pea",
  "Pepper",
  "Phaseolus",
  "Pomegranate",
  "Pumpkin",
  "Radish",
  "Rose",
  "Sampige",
  "Sapota",
  "Seethaashoka",
  "Seethapala",
  "Spinach",
  "Tamarind",
  "Taro",
  "Tecoma",
  "Thumbe",
  "Tomato",
  "Tulsi",
  "Turmeric",
  "Turnip",
  "C.Martini",
  "Piper betle",
  "Hydrangea cinerea",
  "Kepala",
];

export default function DiseaseDiagnosis({ navigation }) {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [manualSpecies, setManualSpecies] = useState(null);
  const [search, setSearch] = useState("");

  const pickImage = async (useCamera) => {
    const perm = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Please allow access.");
      return;
    }
    const res = useCamera
      ? await ImagePicker.launchCameraAsync({
          quality: 0.9,
          allowsEditing: true,
          aspect: [4, 3],
        })
      : await ImagePicker.launchImageLibraryAsync({
          quality: 0.9,
          allowsEditing: true,
          aspect: [4, 3],
        });
    if (!res.canceled && res.assets?.[0]) {
      setImage(res.assets[0].uri);
      setResult(null);
      setReady(true);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    setReady(false);
    try {
      const resp = await fetch(image);
      const blob = await resp.blob();
      const base64 = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => res(reader.result);
        reader.readAsDataURL(blob);
      });
      const fd = new FormData();
      fd.append("image", base64);
      if (manualSpecies) fd.append("manual_species", manualSpecies);
      const r = await fetch(`${API_URL}/api/diagnose`, {
        method: "POST",
        body: fd,
        headers: { Accept: "application/json" },
      });
      if (!r.ok) throw new Error(`Server error: ${r.status}`);
      const d = await r.json();
      if (!d.success) throw new Error(d.error || "Analysis failed");
      setResult(d);
    } catch (e) {
      Alert.alert(
        "Failed",
        e.message.includes("Network")
          ? "Cannot reach server. Check Flask is running."
          : e.message,
      );
      setReady(true);
    } finally {
      setLoading(false);
    }
  };

  const diag = result?.diagnosis;
  const isHealthy = result?.health_status === "Healthy";
  const sid = result?.species_identification;
  const filteredSpecies = SPECIES_LIST.filter((s) =>
    s.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <ScrollView
      style={S.container}
      contentContainerStyle={{ paddingBottom: 50 }}
    >
      <View style={S.header}>
        <Text style={S.hEmoji}>🌿</Text>
        <Text style={S.hTitle}>Plant Disease Diagnosis</Text>
        <Text style={S.hSub}>AI-Powered Symptom Analysis</Text>
      </View>

      {/* Tip */}
      <View style={S.tip}>
        <Text style={S.tipEmoji}>💡</Text>
        <Text style={S.tipText}>
          Upload a <Text style={S.tipBold}>close-up of a single leaf</Text>. For
          accurate species diagnosis, select your plant below.
        </Text>
      </View>

      {/* Manual species selection */}
      <View style={S.speciesSelectBox}>
        <Text style={S.speciesSelectLabel}>
          🌱 Select Your Plant (optional but recommended)
        </Text>
        <TouchableOpacity
          style={S.speciesSelectBtn}
          onPress={() => setShowPicker(true)}
        >
          <Text style={S.speciesSelectBtnTxt}>
            {manualSpecies || "Tap to select plant species →"}
          </Text>
        </TouchableOpacity>
        {manualSpecies && (
          <TouchableOpacity onPress={() => setManualSpecies(null)}>
            <Text style={S.clearTxt}>✕ Clear selection</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Species picker modal */}
      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={S.modalOverlay}>
          <View style={S.modalBox}>
            <Text style={S.modalTitle}>Select Plant Species</Text>
            <View style={S.searchBox}>
              <Text style={S.searchIcon}>🔍</Text>
              <Text style={S.searchPlaceholder} onPress={() => {}}>
                {search || "Search species..."}
              </Text>
            </View>
            <View style={S.searchInputWrap}>
              {[
                "A",
                "B",
                "C",
                "D",
                "E",
                "F",
                "G",
                "H",
                "I",
                "J",
                "K",
                "L",
                "M",
                "N",
                "O",
                "P",
                "Q",
                "R",
                "S",
                "T",
                "U",
                "V",
                "W",
                "X",
                "Y",
                "Z",
              ].map((l) => (
                <TouchableOpacity
                  key={l}
                  style={S.letterBtn}
                  onPress={() => setSearch(l)}
                >
                  <Text style={S.letterTxt}>{l}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[S.letterBtn, { backgroundColor: "#ffcdd2" }]}
                onPress={() => setSearch("")}
              >
                <Text style={[S.letterTxt, { color: "#c62828" }]}>All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={filteredSpecies}
              keyExtractor={(i) => i}
              style={{ maxHeight: 350 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={S.speciesItem}
                  onPress={() => {
                    setManualSpecies(item);
                    setShowPicker(false);
                    setSearch("");
                  }}
                >
                  <Text style={S.speciesItemTxt}>🌿 {item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={S.modalClose}
              onPress={() => {
                setShowPicker(false);
                setSearch("");
              }}
            >
              <Text style={S.modalCloseTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Pick buttons */}
      <View style={S.row}>
        <TouchableOpacity
          style={S.pickBtn}
          onPress={() => pickImage(false)}
          disabled={loading}
        >
          <Text style={S.pickEmoji}>🖼️</Text>
          <Text style={S.pickText}>Gallery</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={S.pickBtn}
          onPress={() => pickImage(true)}
          disabled={loading}
        >
          <Text style={S.pickEmoji}>📷</Text>
          <Text style={S.pickText}>Camera</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <View style={S.imgWrap}>
          <Image source={{ uri: image }} style={S.img} resizeMode="cover" />
          {ready && (
            <View style={S.imgOverlay}>
              <Text style={S.imgOverlayTxt}>✓ Ready to analyze</Text>
            </View>
          )}
        </View>
      )}

      {ready && !loading && (
        <TouchableOpacity style={S.analyzeBtn} onPress={analyzeImage}>
          <Text style={S.analyzeTxt}>🔬 Analyze This Leaf</Text>
        </TouchableOpacity>
      )}

      {loading && (
        <View style={S.loadBox}>
          <ActivityIndicator size="large" color="#1b5e20" />
          <Text style={S.loadTitle}>Analyzing leaf...</Text>
          <Text style={S.loadSub}>
            Detecting symptoms • Matching disease database • Generating visual
            map
          </Text>
        </View>
      )}

      {result && !loading && (
        <View style={S.results}>
          {/* Status banner */}
          <View style={[S.banner, isHealthy ? S.bannerG : S.bannerR]}>
            <Text style={S.bannerEmoji}>{isHealthy ? "✅" : "⚠️"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={S.bannerTitle}>
                {isHealthy ? "Plant Appears Healthy" : "Disease Detected"}
              </Text>
              <Text style={S.bannerSub}>
                {result.total_symptoms_detected} symptom(s) detected
                {manualSpecies ? ` — ${manualSpecies}` : ""}
              </Text>
            </View>
          </View>

          {/* Annotated image */}
          {result.annotated_image && (
            <View style={S.card}>
              <Text style={S.label}>🔍 SYMPTOM MAP</Text>
              <Text style={S.sublabel}>
                Colored circles show detected disease regions on the leaf
              </Text>
              <Image
                source={{
                  uri: `data:image/jpeg;base64,${result.annotated_image}`,
                }}
                style={[S.annotImg, { height: width - 28 }]}
                resizeMode="contain"
              />
              <View style={S.legendRow}>
                <View style={S.legendItem}>
                  <View style={[S.dot, { backgroundColor: "#cc0000" }]} />
                  <Text style={S.legendTxt}>Brown Spots</Text>
                </View>
                <View style={S.legendItem}>
                  <View style={[S.dot, { backgroundColor: "#ddcc00" }]} />
                  <Text style={S.legendTxt}>Yellowing</Text>
                </View>
                <View style={S.legendItem}>
                  <View style={[S.dot, { backgroundColor: "#444" }]} />
                  <Text style={S.legendTxt}>Necrosis</Text>
                </View>
                <View style={S.legendItem}>
                  <View
                    style={[S.dot, { backgroundColor: "#fff", borderWidth: 1 }]}
                  />
                  <Text style={S.legendTxt}>Powder</Text>
                </View>
              </View>
            </View>
          )}

          {/* Symptoms */}
          {result.symptoms_observed?.length > 0 && (
            <View style={S.card}>
              <Text style={S.label}>👁️ SYMPTOMS OBSERVED</Text>
              {result.symptoms_observed.map((s, i) => (
                <View key={i} style={S.symptomRow}>
                  <View style={S.symptomDot} />
                  <View style={{ flex: 1 }}>
                    <Text style={S.symptomName}>{s.label}</Text>
                    <Text style={S.symptomDesc}>{s.description}</Text>
                    <View style={S.affectedBar}>
                      <View
                        style={[
                          S.affectedFill,
                          { width: `${Math.min(s.affected_area_pct, 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={S.symptomPct}>
                      {s.affected_area_pct}% of leaf affected
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Diagnosis */}
          <View style={[S.card, S.diagCard]}>
            <Text style={S.label}>🩺 DIAGNOSIS</Text>
            <Text style={S.diseaseName}>
              {diag?.primary_disease || "No Disease Detected"}
            </Text>
            {diag?.based_on_symptom && (
              <Text style={S.basedOn}>Based on: {diag.based_on_symptom}</Text>
            )}
            {diag?.causal_organism && diag.causal_organism !== "N/A" && (
              <View style={S.causeBox}>
                <Text style={S.causeLabel}>Causal Organism:</Text>
                <Text style={S.causeVal}>{diag.causal_organism}</Text>
              </View>
            )}
            <View
              style={[
                S.confBadge,
                {
                  backgroundColor:
                    diag?.confidence === "High" ? "#c8e6c9" : "#fff9c4",
                },
              ]}
            >
              <Text
                style={[
                  S.confTxt,
                  {
                    color: diag?.confidence === "High" ? "#1b5e20" : "#f57f17",
                  },
                ]}
              >
                {diag?.confidence} Confidence
              </Text>
            </View>
            <Text style={S.refTxt}>{diag?.reference}</Text>
          </View>

          {/* Treatment */}
          {diag?.treatment && (
            <View style={S.card}>
              <Text style={S.label}>💊 TREATMENT</Text>
              <View style={S.treatBox}>
                <Text style={S.treatTxt}>{diag.treatment}</Text>
              </View>
            </View>
          )}

          {/* Immediate actions */}
          {diag?.immediate_actions?.length > 0 && (
            <View style={S.card}>
              <Text style={S.label}>⚡ IMMEDIATE ACTIONS</Text>
              {diag.immediate_actions.map((a, i) => (
                <View key={i} style={S.actionRow}>
                  <View style={S.actionNum}>
                    <Text style={S.actionNumTxt}>{i + 1}</Text>
                  </View>
                  <Text style={S.actionTxt}>{a}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Prevention */}
          {diag?.preventive_measures?.length > 0 && (
            <View style={S.card}>
              <Text style={S.label}>🛡️ PREVENTIVE MEASURES</Text>
              {diag.preventive_measures.map((a, i) => (
                <View key={i} style={S.preventRow}>
                  <Text style={S.preventBullet}>◆</Text>
                  <Text style={S.preventTxt}>{a}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Species ID */}
          <View style={S.card}>
            <Text style={S.label}>🌱 SPECIES IDENTIFICATION</Text>
            {manualSpecies ? (
              <View style={S.manualSpeciesBox}>
                <Text style={S.manualSpeciesTxt}>
                  ✓ Manually selected: {manualSpecies}
                </Text>
              </View>
            ) : (
              <>
                {sid?.low_confidence && (
                  <View style={S.warnBox}>
                    <Text style={S.warnTxt}>
                      ⚠️ AI confidence is low ({sid?.confidence}). Select your
                      plant above for accurate results.
                    </Text>
                  </View>
                )}
                <Text style={S.speciesName}>{sid?.predicted_species}</Text>
                <Text style={S.confSmall}>
                  AI Confidence: {sid?.confidence}
                </Text>
              </>
            )}
            <Text style={S.noteSmall}>
              Symptom diagnosis above works independently of species ID.
            </Text>
          </View>

          {/* Medicinal uses */}
          {result.plant_info?.medicinal_uses ? (
            <View style={S.card}>
              <Text style={S.label}>🏥 MEDICINAL USES</Text>
              <Text style={S.medicinalTxt}>
                {result.plant_info.medicinal_uses}
              </Text>
            </View>
          ) : null}

          {/* Disclaimer */}
          <View style={S.disclaimer}>
            <Text style={S.disclaimerTxt}>
              {`⚠️ AI-based visual symptom analysis. Consult an agricultural expert before applying treatment.\nReference: Ghosh & Gupta, J. Medicinal Plants Studies 2024; 12(2):19-34`}
            </Text>
          </View>

          <TouchableOpacity
            style={S.retryBtn}
            onPress={() => {
              setResult(null);
              setImage(null);
              setReady(false);
            }}
          >
            <Text style={S.retryTxt}>🔄 Analyze Another Leaf</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={S.backBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={S.backTxt}>← Back to Home</Text>
          </TouchableOpacity>
        </View>
      )}

      {!result && !loading && (
        <TouchableOpacity
          style={S.backBtn}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={S.backTxt}>← Back to Home</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const S = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f7f0" },
  header: {
    backgroundColor: "#1b5e20",
    paddingTop: 55,
    paddingBottom: 28,
    alignItems: "center",
  },
  hEmoji: { fontSize: 52, marginBottom: 8 },
  hTitle: { fontSize: 26, fontWeight: "800", color: "#fff" },
  hSub: { fontSize: 14, color: "#a5d6a7", marginTop: 4 },
  tip: {
    flexDirection: "row",
    backgroundColor: "#fffde7",
    margin: 14,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#f9a825",
    alignItems: "flex-start",
  },
  tipEmoji: { fontSize: 20, marginRight: 10 },
  tipText: { flex: 1, fontSize: 13.5, color: "#5d4037", lineHeight: 20 },
  tipBold: { fontWeight: "800", color: "#333" },
  speciesSelectBox: {
    margin: 14,
    backgroundColor: "#e8f5e9",
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#2e7d32",
  },
  speciesSelectLabel: {
    fontSize: 13,
    color: "#2e7d32",
    fontWeight: "700",
    marginBottom: 10,
  },
  speciesSelectBtn: {
    backgroundColor: "#2e7d32",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  speciesSelectBtnTxt: { color: "#fff", fontSize: 15, fontWeight: "600" },
  clearTxt: {
    fontSize: 13,
    color: "#c62828",
    marginTop: 8,
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1b5e20",
    marginBottom: 14,
    textAlign: "center",
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchPlaceholder: { fontSize: 14, color: "#888" },
  searchInputWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginBottom: 10,
  },
  letterBtn: {
    backgroundColor: "#e8f5e9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  letterTxt: { fontSize: 12, color: "#2e7d32", fontWeight: "700" },
  speciesItem: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  speciesItemTxt: { fontSize: 15, color: "#333" },
  modalClose: {
    backgroundColor: "#1b5e20",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  modalCloseTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  row: {
    flexDirection: "row",
    marginHorizontal: 14,
    gap: 12,
    marginBottom: 14,
  },
  pickBtn: {
    flex: 1,
    backgroundColor: "#2e7d32",
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    elevation: 4,
  },
  pickEmoji: { fontSize: 30, marginBottom: 6 },
  pickText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  imgWrap: {
    marginHorizontal: 14,
    marginBottom: 12,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 5,
  },
  img: { width: "100%", height: 240 },
  imgOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(27,94,32,0.88)",
    padding: 10,
    alignItems: "center",
  },
  imgOverlayTxt: { color: "#fff", fontSize: 14, fontWeight: "700" },
  analyzeBtn: {
    marginHorizontal: 14,
    marginBottom: 16,
    backgroundColor: "#1b5e20",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    elevation: 6,
  },
  analyzeTxt: { color: "#fff", fontSize: 18, fontWeight: "800" },
  loadBox: {
    backgroundColor: "#fff",
    margin: 14,
    padding: 36,
    borderRadius: 16,
    alignItems: "center",
    elevation: 4,
  },
  loadTitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: "700",
    color: "#1b5e20",
  },
  loadSub: {
    marginTop: 8,
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    lineHeight: 20,
  },
  results: { paddingHorizontal: 14, paddingTop: 4 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    gap: 14,
    elevation: 3,
  },
  bannerG: { backgroundColor: "#1b5e20" },
  bannerR: { backgroundColor: "#bf360c" },
  bannerEmoji: { fontSize: 36 },
  bannerTitle: { fontSize: 20, fontWeight: "800", color: "#fff" },
  bannerSub: { fontSize: 13, color: "rgba(255,255,255,0.85)", marginTop: 2 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
  },
  diagCard: { borderLeftWidth: 5, borderLeftColor: "#bf360c" },
  label: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2e7d32",
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  sublabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    fontStyle: "italic",
  },
  annotImg: { width: "100%", borderRadius: 12, marginVertical: 8 },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
    justifyContent: "center",
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  legendTxt: { fontSize: 12, color: "#555" },
  symptomRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 10,
  },
  symptomDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ff9800",
    marginTop: 5,
  },
  symptomName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#333",
    marginBottom: 3,
  },
  symptomDesc: { fontSize: 13, color: "#666", lineHeight: 18, marginBottom: 6 },
  affectedBar: {
    height: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 3,
    marginBottom: 4,
    overflow: "hidden",
  },
  affectedFill: { height: "100%", backgroundColor: "#ff9800", borderRadius: 3 },
  symptomPct: { fontSize: 12, color: "#ff9800", fontWeight: "600" },
  diseaseName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#bf360c",
    marginBottom: 8,
  },
  basedOn: {
    fontSize: 13,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 8,
  },
  causeBox: {
    backgroundColor: "#fff3e0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  causeLabel: { fontSize: 12, color: "#888", marginBottom: 3 },
  causeVal: { fontSize: 14, color: "#555", fontStyle: "italic" },
  confBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  confTxt: { fontSize: 13, fontWeight: "700" },
  refTxt: { fontSize: 11, color: "#aaa", fontStyle: "italic" },
  treatBox: { backgroundColor: "#e8f5e9", padding: 16, borderRadius: 12 },
  treatTxt: {
    fontSize: 15,
    color: "#1b5e20",
    lineHeight: 24,
    fontWeight: "500",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  actionNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#1b5e20",
    alignItems: "center",
    justifyContent: "center",
  },
  actionNumTxt: { color: "#fff", fontSize: 13, fontWeight: "700" },
  actionTxt: { flex: 1, fontSize: 14, color: "#333", lineHeight: 22 },
  preventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 8,
  },
  preventBullet: { fontSize: 10, color: "#2e7d32", marginTop: 6 },
  preventTxt: { flex: 1, fontSize: 14, color: "#444", lineHeight: 22 },
  warnBox: {
    backgroundColor: "#fff3e0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#ff9800",
  },
  warnTxt: { fontSize: 13, color: "#e65100", lineHeight: 18 },
  manualSpeciesBox: {
    backgroundColor: "#e8f5e9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  manualSpeciesTxt: { fontSize: 15, color: "#1b5e20", fontWeight: "700" },
  speciesName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: 4,
  },
  confSmall: { fontSize: 13, color: "#888", marginBottom: 6 },
  noteSmall: { fontSize: 11, color: "#bbb", marginTop: 6, fontStyle: "italic" },
  medicinalTxt: { fontSize: 14, color: "#555", lineHeight: 24 },
  disclaimer: {
    backgroundColor: "#fff8e1",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  disclaimerTxt: { fontSize: 12.5, color: "#795548", lineHeight: 20 },
  retryBtn: {
    backgroundColor: "#2e7d32",
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },
  retryTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backBtn: {
    backgroundColor: "#388e3c",
    margin: 14,
    padding: 17,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
  },
  backTxt: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
