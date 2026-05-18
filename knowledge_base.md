# Knowledge Base: Expert System for Malnutrition Diagnosis in Toddlers (Balita)

## Source

This knowledge base synthesizes methodologies and findings from the following two primary references, which both explore the application of Case-Based Reasoning for detecting malnutrition in children:

1. **Alam, S., & Nurcahyo, G. W. (2022).** *Sistem Pakar dalam Mendiagnosis Gizi Buruk pada Balita dengan Menggunakan Metode CBR.* Jurnal Sistim Informasi dan Teknologi, Vol. 4, No. 4, pp. 143–148. DOI: [10.37034/jsisfotek.v4i4.140](https://doi.org/10.37034/jsisfotek.v4i4.140)
2. **Mawartika, Y. E. B., Etriyanti, E., Amalia, V., & Alfiarini. (2023).** *Implementasi Case Based Reasoning Untuk Mendeteksi Gejala Penyakit Gizi Buruk Pada Balita.* Jurnal Pustaka Data, Vol. 3 No. 1, pp. 1-6. DOI: [10.55382/jurnalpustakadata.v3i1.526](https://doi.org/10.55382/jurnalpustakadata.v3i1.526)

---

## Method Overview

The system uses **Case-Based Reasoning (CBR)** with **Nearest Neighbour Retrieval (NNR)** to diagnose types of malnutrition in toddlers (children under 5 years old / Balita).

**Core principle:** Given a new case (a set of observed symptoms), the system computes a similarity score against each known disease using the weighted symptom overlap, then returns the disease with the highest similarity.

---

## 1. Disease Codes (Kode Penyakit)

| Code | Disease Name (Indonesian)   | Disease Name (English)    |
|------|-----------------------------|---------------------------|
| GZ01 | Kwashiorkor                 | Kwashiorkor               |
| GZ02 | Marasmus                    | Marasmus                  |
| GZ03 | Kwashiorkor-Marasmus        | Kwashiorkor-Marasmus      |

---

## 2. Symptom Codes (Kode Gejala)

| Code | Symptom (Indonesian)                                    | Symptom (English)                                              | Weight (Bobot) | Weight Category  |
|------|---------------------------------------------------------|----------------------------------------------------------------|----------------|------------------|
| G01  | Edema                                                   | Edema (generalized swelling)                                   | 5              | Tinggi (High)    |
| G02  | Diare                                                   | Diarrhea                                                       | 3              | Sedang (Medium)  |
| G03  | Perut buncit                                            | Distended/bloated abdomen                                      | 5              | Tinggi (High)    |
| G04  | Tubuh kurus                                             | Emaciated/very thin body                                       | 5              | Tinggi (High)    |
| G05  | Perubahan mental                                        | Mental status change (apathy, irritability)                    | 5              | Tinggi (High)    |
| G06  | Massa otot mengecil                                     | Muscle mass wasting                                            | 3              | Sedang (Medium)  |
| G07  | Berat dan tinggi badan susah bertambah                  | Difficulty gaining weight and height                           | 5              | Tinggi (High)    |
| G08  | Kelainan kulit (bercak merah muda)                      | Skin abnormality (pink/reddish patches)                        | 3              | Sedang (Medium)  |
| G09  | Rambut kering atau kusam                                | Dry or dull hair                                               | 1              | Rendah (Low)     |
| G10  | Rambut tipis kemerahan                                  | Thin reddish hair (resembling corn silk)                       | 5              | Tinggi (High)    |
| G11  | Pandangan mata sayu                                     | Dull/sad eye gaze                                              | 3              | Sedang (Medium)  |
| G12  | Tubuh mengandung banyak cairan                          | Excess fluid retention in the body                             | 5              | Tinggi (High)    |
| G13  | Tulang yang menonjol (tulang iga dan bahu)              | Prominent bones (ribs and shoulders visible)                   | 5              | Tinggi (High)    |
| G14  | Kulit lengan, paha, dan bokong tampak kendur            | Loose/sagging skin on arms, thighs, and buttocks               | 3              | Sedang (Medium)  |
| G15  | Wajah sayu                                              | Sad/sunken facial appearance                                   | 5              | Tinggi (High)    |
| G16  | Wajah seperti orang tua                                 | Face resembles that of an elderly person                       | 1              | Rendah (Low)     |
| G17  | Kelelahan                                               | Fatigue/exhaustion                                             | 3              | Sedang (Medium)  |

### Weight Category Reference

| Category (Indonesian) | Category (English) | Value |
|-----------------------|--------------------|-------|
| Tinggi                | High               | 5     |
| Sedang                | Medium             | 3     |
| Rendah                | Low                | 1     |

---

## 3. Disease–Symptom Relation Rules

Each row is a symptom; each column is a disease. A checkmark (`✓`) means the symptom belongs to that disease's case profile.

| Symptom Code | GZ01 Kwashiorkor | GZ02 Marasmus | GZ03 Kwashiorkor-Marasmus |
|--------------|:----------------:|:-------------:|:-------------------------:|
| G01          | ✓                |               | ✓                         |
| G02          | ✓                | ✓             | ✓                         |
| G03          | ✓                |               |                           |
| G04          |                  | ✓             | ✓                         |
| G05          | ✓                | ✓             | ✓                         |
| G06          | ✓                |               |                           |
| G07          | ✓                |               |                           |
| G08          | ✓                |               |                           |
| G09          | ✓                |               |                           |
| G10          | ✓                |               |                           |
| G11          | ✓                |               |                           |
| G12          |                  |               | ✓                         |
| G13          |                  | ✓             |                           |
| G14          |                  | ✓             |                           |
| G15          |                  | ✓             |                           |
| G16          |                  | ✓             |                           |
| G17          | ✓                |               |                           |

### Per-Disease Symptom Profiles

```
GZ01 (Kwashiorkor)         : [G01, G02, G03, G05, G06, G07, G08, G09, G10, G11, G17]
GZ02 (Marasmus)            : [G02, G04, G05, G13, G14, G15, G16]
GZ03 (Kwashiorkor-Marasmus): [G01, G02, G04, G05, G12]
```

### Per-Disease Weight Totals (Denominator Reference)

| Disease | Symptom Weights                                                                              | Total Weight |
|---------|----------------------------------------------------------------------------------------------|--------------|
| GZ01    | G01(5) + G02(3) + G03(5) + G05(5) + G06(3) + G07(5) + G08(3) + G09(1) + G10(5) + G11(3) + G17(3) | **41**       |
| GZ02    | G02(3) + G04(5) + G05(5) + G13(5) + G14(3) + G15(5) + G16(1)                               | **27**       |
| GZ03    | G01(5) + G02(3) + G04(5) + G05(5) + G12(5)                                                  | **23**       |

---

## 4. Similarity Formula (CBR – Nearest Neighbour Retrieval)

The similarity between a new case and a stored case is computed as:

```
Similarity(x, x') = (s1*w1 + s2*w2 + ... + sn*wn) / (w1 + w2 + ... + wn)
```

Where:

- `n` = total number of symptoms in the **stored disease case** (not the user input)
- `wi` = weight of symptom `i` (from Section 2 above)
- `si` = 1 if symptom `i` from the stored case is also present in the user's input; 0 otherwise
- The denominator is the **sum of all weights for symptoms in the stored disease case**
- Result is expressed as a percentage (multiply by 100)

**Implementation note:** The numerator sums weights only for symptoms that exist in both the stored case and the new case. The denominator sums all weights for the stored case (regardless of match). The disease with the highest similarity score is the diagnosis output.

---

## 5. Decision Logic

```
FOR each disease GZ in {GZ01, GZ02, GZ03}:
    matched_weight_sum = SUM of weight(G_i) for all G_i in disease_symptoms(GZ)
                         where G_i is also in user_input_symptoms
    total_weight_sum   = SUM of weight(G_i) for all G_i in disease_symptoms(GZ)
    similarity(GZ)     = matched_weight_sum / total_weight_sum

diagnosis = argmax(similarity(GZ) for GZ in all diseases)
```

If two diseases share the same highest similarity score, CBR selects the result with the **largest absolute numerator**. If numerators are also equal, the case is flagged as ambiguous and additional symptom input should be requested.

---

## 6. System Accuracy

- Validation basis: 10 test cases
- Valid results (matching expert diagnosis): 9 out of 10
- Accuracy = (9 / 10) × 100% = **95%** (with probabilistic CBR method)

---

## 7. Implementation Notes for Agents

1. **Input:** A list of symptom codes (e.g., `["G01", "G02", "G05"]`) selected by the user/patient.
2. **For each disease:** compute similarity using the formula in Section 4 against the disease's symptom profile in Section 3.
3. **Output:** Return the disease with the highest similarity score, along with the percentage value.
4. **Tie-breaking:** If two diseases have equal similarity, select the one with the larger absolute numerator, or flag as ambiguous and request more symptom input.
5. **Threshold (implicit):** The paper does not define a minimum threshold; any non-zero similarity is considered a candidate. The highest score wins.
6. **Weight lookup:** Always use the weight values from Section 2 (G01=5, G02=3, G03=5, G04=5, G05=5, G06=3, G07=5, G08=3, G09=1, G10=5, G11=3, G12=5, G13=5, G14=3, G15=5, G16=1, G17=3).
