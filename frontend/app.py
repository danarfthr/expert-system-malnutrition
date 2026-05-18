import streamlit as st

st.set_page_config(
    page_title="Sistem Pakar Gizi Buruk",
    page_icon="🩺",
    layout="wide",
)

API_URL = "http://localhost:8000"


st.title("Sistem Pakar Diagnosa Gizi Buruk pada Balita")
st.markdown("Diagnosa dini malnutrition pada anak balita menggunakan Case-Based Reasoning (CBR)")

if "diagnosis_result" not in st.session_state:
    st.session_state.diagnosis_result = None

if "symptoms_data" not in st.session_state:
    st.session_state.symptoms_data = None

if not st.session_state.symptoms_data:
    try:
        response = __import__("requests").get(f"{API_URL}/symptoms")
        if response.status_code == 200:
            st.session_state.symptoms_data = response.json()["symptoms"]
    except Exception:
        st.error("Tidak dapat terhubung ke server. Pastikan backend sedang berjalan di port 8000.")
        st.stop()

symptoms = st.session_state.symptoms_data

st.sidebar.header("Mode Pakar")
expert_mode = st.sidebar.toggle("Aktifkan Mode Pakar")

with st.form("diagnosis_form"):
    st.subheader("Pilih Gejala yang Dialami")
    st.markdown("Centang semua gejala yang terlihat pada anak:")

    selected_symptoms = []
    cols = st.columns(3)
    for idx, symptom in enumerate(symptoms):
        with cols[idx % 3]:
            if st.checkbox(f"**{symptom['code']}** - {symptom['name']}", key=symptom["code"]):
                selected_symptoms.append(symptom["code"])

    submitted = st.form_submit_button("🩺 Diagnosa", use_container_width=True)

if submitted and selected_symptoms:
    try:
        response = __import__("requests").post(
            f"{API_URL}/diagnose",
            json={"symptoms": selected_symptoms},
        )
        if response.status_code == 200:
            st.session_state.diagnosis_result = response.json()
        else:
            st.error(f"Error: {response.status_code}")
    except Exception as e:
        st.error(f"Gagal melakukan diagnosa: {e}")

if st.session_state.diagnosis_result:
    result = st.session_state.diagnosis_result
    st.divider()
    st.subheader("Hasil Diagnosa")

    col1, col2 = st.columns(2)
    with col1:
        if result["disease_code"]:
            st.metric("Kode Penyakit", result["disease_code"])
            st.metric("Nama Penyakit", result["disease_name"])
        else:
            st.warning("Tidak ada hasil diagnosa")
    with col2:
        similarity_pct = result["similarity"] * 100
        st.metric("Similarity", f"{similarity_pct:.1f}%")
        if result["requires_review"]:
            st.warning("⚠️ Memerlukan review pakar - similarity di bawah threshold 70%")
        else:
            st.success("✓ Similarity memenuhi threshold")

    if result.get("message"):
        st.info(result["message"])

    if expert_mode and result["disease_code"]:
        st.divider()
        st.subheader("Tambah Kasus Baru ke Basis Pengetahuan")
        with st.form("retain_form"):
            new_code = st.text_input("Kode Penyakit", value=result["disease_code"], disabled=True)
            new_name = st.text_input("Nama Penyakit", value=result["disease_name"], disabled=True)
            new_symptoms = st.text_area(
                "Gejala",
                value=", ".join(selected_symptoms),
                disabled=True,
            )
            expert_decision = st.radio(
                "Keputusan Pakar",
                ["Konfirmasi sama", "Ubah diagnosis", "Tolak"],
                horizontal=True,
            )
            retain_submitted = st.form_submit_button("💾 Simpan ke Basis Kasus")

            if retain_submitted:
                if expert_decision == "Konfirmasi sama":
                    try:
                        resp = __import__("requests").post(
                            f"{API_URL}/cases",
                            json={"code": new_code, "name": new_name, "symptoms": selected_symptoms},
                        )
                        if resp.status_code == 201:
                            st.success("Kasus baru berhasil disimpan ke basis pengetahuan!")
                        else:
                            st.error(f"Gagal menyimpan: {resp.text}")
                    except Exception as e:
                        st.error(f"Error: {e}")
                elif expert_decision == "Ubah diagnosis":
                    st.info("Fitur ubah diagnosis akan meminta input kode penyakit baru.")
                else:
                    st.info("Diagnosis ditolak. Kasus tidak disimpan.")

    if st.button("🔄 Reset"):
        st.session_state.diagnosis_result = None
        st.rerun()