# Knowledge Base: Expert System for Malnutrition Diagnosis in Toddlers (Balita)

## Source

**RBR Rules (Forward Chaining):**

1. **Kartika, D., Gema, R. L., & Pratiwi, M. (2016).** *Expert Systems for Identifying Children's Severe Malnutrition.* Journal of Computer Science and Information Technology, Vol. 1, No. 1, pp. 20–29. Published by LPPM UPI YPTK, Universitas Putra Indonesia YPTK, Padang.

**CBR Case Profiles and NNR Formula:**

1. **Alam, S., & Nurcahyo, G. W. (2022).** *Sistem Pakar dalam Mendiagnosis Gizi Buruk pada Balita dengan Menggunakan Metode CBR.* Jurnal Sistim Informasi dan Teknologi, Vol. 4, No. 4, pp. 143–148. DOI: [10.37034/jsisfotek.v4i4.140](https://doi.org/10.37034/jsisfotek.v4i4.140)
2. **Mawartika, Y. E. B., Etriyanti, E., Amalia, V., & Alfiarini. (2023).** *Implementasi Case Based Reasoning Untuk Mendeteksi Gejala Penyakit Gizi Buruk Pada Balita.* Jurnal Pustaka Data, Vol. 3 No. 1, pp. 1-6. DOI: [10.55382/jurnalpustakadata.v3i1.526](https://doi.org/10.55382/jurnalpustakadata.v3i1.526)

---

## Method Overview

The system uses a **Hybrid RBR + CBR** approach:

1. **RBR (Rule-Based Reasoning) — Forward Chaining:** Run first. If the user's input matches **all** symptoms in a rule (100% match), return that diagnosis immediately.
2. **CBR (Case-Based Reasoning) — Nearest Neighbour Retrieval:** Activated only when no RBR rule fires. Computes a weighted similarity score against each disease's case profile and returns the best match.

**Critical implementation note:** RBR and CBR use **different symptom sets** by design.

- RBR rules define strict expert-authored IF-THEN conditions (comprehensive, all-or-nothing).
- CBR profiles define the minimal discriminating features extracted from the literature (used for partial similarity scoring).
- Do not mix or substitute one for the other.

---

## 1. Disease Codes (Kode Penyakit)

| Code | Disease (Indonesian)     | Disease (English)         |
|------|--------------------------|---------------------------|
| GZ01 | Kwashiorkor              | Kwashiorkor               |
| GZ02 | Marasmus                 | Marasmus                  |
| GZ03 | Kwashiorkor-Marasmus     | Kwashiorkor-Marasmus      |

---

## 2. Symptom Codes and Weights (Kode Gejala)

| Code | Symptom (Indonesian)                             | Symptom (English)                              | Weight |
|------|--------------------------------------------------|------------------------------------------------|--------|
| G01  | Edema                                            | Edema (generalized swelling)                   | 5      |
| G02  | Diare                                            | Diarrhea                                       | 3      |
| G03  | Perut buncit                                     | Distended/bloated abdomen                      | 5      |
| G04  | Tubuh kurus                                      | Emaciated/very thin body                       | 5      |
| G05  | Perubahan mental                                 | Mental status change (apathy, irritability)    | 5      |
| G06  | Massa otot mengecil                              | Muscle mass wasting                            | 3      |
| G07  | Berat dan tinggi badan susah bertambah           | Difficulty gaining weight and height           | 5      |
| G08  | Kelainan kulit (bercak merah muda)               | Skin abnormality (pink/reddish patches)        | 3      |
| G09  | Rambut kering atau kusam                         | Dry or dull hair                               | 1      |
| G10  | Rambut tipis kemerahan                           | Thin reddish hair (resembling corn silk)       | 5      |
| G11  | Pandangan mata sayu                              | Dull/sad eye gaze                              | 3      |
| G12  | Tubuh mengandung banyak cairan                   | Excess fluid retention in the body             | 5      |
| G13  | Tulang yang menonjol (tulang iga dan bahu)       | Prominent bones (ribs and shoulders visible)   | 5      |
| G14  | Kulit lengan, paha, dan bokong tampak kendur     | Loose/sagging skin on arms, thighs, buttocks   | 3      |
| G15  | Wajah sayu                                       | Sad/sunken facial appearance                   | 5      |
| G16  | Wajah seperti orang tua                          | Face resembles that of an elderly person       | 1      |
| G17  | Kelelahan                                        | Fatigue/exhaustion                             | 3      |

Weight scale: High = 5, Medium = 3, Low = 1

---

## 3. RBR Rules — Forward Chaining

**Source:** Kartika et al. (2016), UPI YPTK Padang.

All conditions in a rule must be satisfied (logical AND). A rule fires only on 100% symptom match.
If a rule fires, its diagnosis is returned immediately; CBR is not executed.

### Rule 1 → GZ01 (Kwashiorkor)

```
IF   G01 (Edema)
AND  G02 (Diare)
AND  G03 (Perut buncit)
AND  G05 (Perubahan mental)
AND  G06 (Massa otot mengecil)
AND  G07 (Berat dan tinggi badan susah bertambah)
AND  G08 (Kelainan kulit (bercak merah muda))
AND  G09 (Rambut kering atau kusam)
AND  G10 (Rambut tipis kemerahan)
AND  G11 (Pandangan mata sayu)
AND  G15 (Wajah sayu)
AND  G17 (Kelelahan)
THEN GZ01 (Kwashiorkor)
```

### Rule 2 → GZ02 (Marasmus)

```
IF   G02 (Diare)
AND  G04 (Tubuh kurus)
AND  G05 (Perubahan mental)
AND  G13 (Tulang yang menonjol (tulang iga dan bahu))
AND  G14 (Kulit lengan, paha, dan bokong tampak kendur)
AND  G15 (Wajah sayu)
AND  G16 (Wajah seperti orang tua)
THEN GZ02 (Marasmus)
```

### Rule 3 → GZ03 (Kwashiorkor-Marasmus)

```
IF   G01 (Edema)
AND  G02 (Diare)
AND  G03 (Perut buncit)
AND  G04 (Tubuh kurus)
AND  G05 (Perubahan mental)
AND  G06 (Massa otot mengecil)
AND  G07 (Berat dan tinggi badan susah bertambah)
AND  G08 (Kelainan kulit (bercak merah muda))
AND  G10 (Rambut tipis kemerahan)
AND  G12 (Tubuh mengandung banyak cairan)
AND  G13 (Tulang yang menonjol (tulang iga dan bahu))
AND  G15 (Wajah sayu)
THEN GZ03 (Kwashiorkor-Marasmus)
```

### RBR Symptom Set Summary

| Symptom | Rule 1 GZ01 | Rule 2 GZ02 | Rule 3 GZ03 |
|---------|:-----------:|:-----------:|:-----------:|
| G01     | ✓           |             | ✓           |
| G02     | ✓           | ✓           | ✓           |
| G03     | ✓           |             | ✓           |
| G04     |             | ✓           | ✓           |
| G05     | ✓           | ✓           | ✓           |
| G06     | ✓           |             | ✓           |
| G07     | ✓           |             | ✓           |
| G08     | ✓           |             | ✓           |
| G09     | ✓           |             |             |
| G10     | ✓           |             | ✓           |
| G11     | ✓           |             |             |
| G12     |             |             | ✓           |
| G13     |             | ✓           | ✓           |
| G14     |             | ✓           |             |
| G15     | ✓           | ✓           | ✓           |
| G16     |             | ✓           |             |
| G17     | ✓           |             |             |

---

## 4. CBR Case Profiles — Nearest Neighbour Retrieval

**Source:** Alam & Nurcahyo (2022); Mawartika et al. (2023).

These profiles are used **only** when no RBR rule fires. They are derived from the reference papers
and differ from the RBR rules — do not substitute one for the other.

### Symptom-Disease Matrix (CBR)

| Symptom | GZ01 Kwashiorkor | GZ02 Marasmus | GZ03 Kwashiorkor-Marasmus |
|---------|:----------------:|:-------------:|:-------------------------:|
| G01     | ✓                |               | ✓                         |
| G02     | ✓                | ✓             | ✓                         |
| G03     | ✓                |               |                           |
| G04     |                  | ✓             | ✓                         |
| G05     | ✓                | ✓             | ✓                         |
| G06     | ✓                |               |                           |
| G07     | ✓                |               |                           |
| G08     | ✓                |               |                           |
| G09     | ✓                |               |                           |
| G10     | ✓                |               |                           |
| G11     | ✓                |               |                           |
| G12     |                  |               | ✓                         |
| G13     |                  | ✓             |                           |
| G14     |                  | ✓             |                           |
| G15     |                  | ✓             |                           |
| G16     |                  | ✓             |                           |
| G17     | ✓                |               |                           |

### CBR Profiles and Weight Totals (Denominators)

```
GZ01: [G01, G02, G03, G05, G06, G07, G08, G09, G10, G11, G17]
      5+3+5+5+3+5+3+1+5+3+3 = 41

GZ02: [G02, G04, G05, G13, G14, G15, G16]
      3+5+5+5+3+5+1 = 27

GZ03: [G01, G02, G04, G05, G12]
      5+3+5+5+5 = 23
```

### Discrepancy Notes (RBR vs CBR)

These differences are intentional and must be preserved in the implementation:

| Disease | Symptom  | In RBR Rule | In CBR Profile | Note                                      |
|---------|----------|:-----------:|:--------------:|-------------------------------------------|
| GZ01    | G15      | ✓           | ✗              | Expert added G15 to RBR; absent from lit. |
| GZ03    | G03,G06,G07,G08,G10,G13,G15 | ✓ | ✗   | RBR is exhaustive; CBR profile is minimal |
| GZ03    | —        | 12 symptoms | 5 symptoms     | CBR uses core discriminating features only|

---

## 5. Similarity Formula (CBR – NNR)

```
Similarity(new_case, disease) = SUM(s_i * w_i) / SUM(w_i)
```

Where:

- `w_i` = weight of symptom `i` belonging to the **disease's CBR profile**
- `s_i` = 1 if symptom `i` is also in the user's input, 0 otherwise
- Denominator = total weight of all symptoms in the disease's CBR profile (fixed per disease)
- Result expressed as percentage (multiply by 100)

---

## 6. Hybrid Decision Logic

```
INPUT: user_symptoms = list of symptom codes

# Step 1: RBR — Forward Chaining
FOR each rule R in {Rule1, Rule2, Rule3}:
    IF user_symptoms contains ALL symptoms in R.conditions:
        RETURN R.diagnosis  # Exit immediately; skip CBR

# Step 2: CBR — NNR (only reached if no rule fired)
FOR each disease GZ in {GZ01, GZ02, GZ03}:
    matched = SUM(weight(g) for g in CBR_profile(GZ) if g in user_symptoms)
    total   = SUM(weight(g) for g in CBR_profile(GZ))
    similarity[GZ] = matched / total

diagnosis = argmax(similarity)

# Tie-breaking
IF two diseases share the same max similarity:
    SELECT the one with the larger matched weight numerator
    IF numerators are also equal:
        FLAG as ambiguous; request additional symptom input

# Threshold
IF max(similarity) < threshold:
    TRIGGER Revise step (expert review)
ELSE:
    RETURN diagnosis with similarity percentage
```

---

## 7. System Accuracy

- Validation basis: 10 test cases
- Correct diagnoses: 9 out of 10
- Accuracy: **90%** (CBR-only baseline from literature)

---

## 8. Implementation Notes for Agents

1. **Input:** A list of symptom codes, e.g. `["G01", "G02", "G05"]`.
2. **Always run RBR first.** CBR is only invoked when zero RBR rules fire.
3. **Use CBR profiles (Section 4) exclusively for NNR computation.** Do not use RBR symptom sets as CBR denominators.
4. **Weight lookup (canonical):** G01=5, G02=3, G03=5, G04=5, G05=5, G06=3, G07=5, G08=3, G09=1, G10=5, G11=3, G12=5, G13=5, G14=3, G15=5, G16=1, G17=3.
5. **Output format:** `{ "method": "RBR" | "CBR", "diagnosis": "GZ0X", "similarity": float | null }`.
6. **Threshold** is not defined in the source papers — set it in config, not hardcoded. A reasonable default is 0.5 (50%).
