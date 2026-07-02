# DutyWise — Zimbabwe Import Duty & Customs Calculator Datasets

This folder contains 17 relational CSV seed datasets for a Zimbabwe import duty and
landed-cost calculator, modeled on the actual structure used by the **Zimbabwe Revenue
Authority (ZIMRA)**: Customs Duty → Surtax (vehicles) → Carbon Tax (vehicles) → VAT,
plus supporting reference data (agencies, trade agreements, restrictions, exemptions,
exchange rates, and search keywords).

> ⚠️ **Important disclaimer**: This is a **synthetic but realistically-modeled** dataset
> built from publicly available information about Zimbabwe's customs regime as of mid-2026
> (VAT rate, general duty bands, vehicle surtax/carbon tax mechanics, key agencies, trade
> blocs). Specific numeric rates for individual HS codes, fees, and carbon tax bands are
> **illustrative approximations**, not an official ZIMRA tariff extract. Before using this
> in a production calculator that gives users real financial figures, validate every rate
> against the current **ZIMRA Customs Tariff Handbook**, the **Customs and Excise Act
> [Chapter 23:02]**, the **VAT Act [Chapter 23:12]**, and the latest **Finance Act** /
> Statutory Instruments. Treat legal_reference / notes columns as pointers to *where to
> verify*, not as citations of exact clauses.

---

## File-by-file schema

### `countries.csv`
| column | description |
|---|---|
| country_id | PK |
| country_name, iso2, iso3 | identifiers |
| currency_code | FK → currencies.csv |
| region | geographic grouping |
| trade_bloc_membership | semicolon-separated (SADC, COMESA, AfCFTA, etc.) |
| is_major_trade_partner | Yes/No |
| notes | context (main border posts, typical goods) |

### `currencies.csv`
currency_code (PK), currency_name, symbol, decimal_places, is_legal_tender_zw

### `exchange_rates.csv`
rate_id (PK), currency_code (FK), **rate_to_usd** (units of that currency per 1 USD),
rate_date, source, rate_type. Snapshot dated 2026-06-30 — refresh from RBZ daily
interbank rate in production (`rbz.co.zw`).

### `government_agencies.csv`
agency_id (PK), agency_name, acronym, role_description, oversees_categories
(free-text list of category names), website, contact_note. Includes ZIMRA, MCAZ, EMA,
SAZ, veterinary/plant quarantine services, CVR/VID, POTRAZ, BAZ, ZNCC, ZIDA, RBZ, etc.

### `product_categories.csv`
category_id (PK), category_name, **parent_category_id** (FK → self, null for top-level),
description. Two-level hierarchy (e.g. `1 Vehicles & Transport` → `101 Passenger Cars`).

### `hs_codes.csv`
hs_code (PK, 8-digit HS-style code), description, category_id (FK), unit_of_measure
(u = units, kg, l, m, m2, pr = pairs, g = grams).

### `products.csv`
product_id (PK), product_name, hs_code (FK), category_id (FK), brand,
typical_unit_value_usd (illustrative CIF-comparable value), condition (New/Used), notes.
Sample catalogue of ~70 commonly-imported items for demo/search purposes.

### `tariff_rates.csv`
tariff_id (PK), hs_code (FK), **rate_type** (`General (MFN)`, `SADC Protocol on Trade`,
`COMESA Free Trade Area`, `AfCFTA`), duty_rate_percent, requires_certificate_of_origin,
effective_date, legal_reference, notes.
Each hs_code always has a `General (MFN)` row; some also have one or more preferential
rows. **App logic**: look up the country of origin's trade_bloc_membership in
`countries.csv`, and if it matches a preferential rate_type for that hs_code (and the
user confirms a Certificate of Origin), use the lower rate instead of General.

### `vat_rules.csv`
vat_rule_id (PK), hs_code (FK), vat_rate_percent, is_zero_rated, is_exempt,
exemption_reason, legal_reference. Standard rate is 15%; a handful of basic foodstuffs
and agricultural inputs are zero-rated; books/registered medicines/medical devices are
treated as exempt supplies.

### `excise_rules.csv`
excise_id (PK), hs_code (FK), excise_type (`Specific` = fixed amount per unit/litre, or
`Ad Valorem` = percentage), rate_percent, specific_amount_usd, specific_unit,
legal_reference, notes. Covers beer, wine, spirits, cigarettes; also includes two
**reference-only** fuel excise rows (HS 2710...) even though fuel isn't in
`hs_codes.csv`/`products.csv`, since fuel duty is commonly needed in landed-cost tools.

### `surtax_rules.csv`
surtax_id (PK), applies_to_category_id (FK), vehicle_type, min_age_years, max_age_years,
surtax_rate_percent, calculated_on, legal_reference, notes.
Reflects ZIMRA's actual mechanic: **surtax only applies to vehicles older than 5 years**
at import, calculated on the Value for Duty Purposes (VDP = CIF + incidental charges),
stacked in three age bands (0–5 / 6–10 / 11+ years).

### `carbon_tax_rules.csv`
carbon_tax_id (PK), applies_to_category_id (FK), engine_capacity_min_cc/max_cc,
carbon_tax_amount_usd, billing_frequency, legal_reference, notes. Specific-amount bands
by engine size and vehicle category — **flagged as illustrative**; verify against the
current Finance Act carbon tax schedule.

### `government_fees.csv`
fee_id (PK), fee_name, applicable_to, fee_basis, amount_usd, amount_percent,
agency_id (FK), legal_reference, notes. Non-tax charges that still affect landed cost:
CBCA inspection, SAZ conformity, permits, registration/roadworthy fees, port handling,
Certificate of Origin, clearing agent commission (market-practice, not statutory —
flagged in notes).

### `trade_agreements.csv`
agreement_id (PK), agreement_name, acronym, member_countries (free text),
preferential_treatment, effective_date, notes. SADC, COMESA, AfCFTA, and Zimbabwe's
bilateral trade agreements — cross-reference with `tariff_rates.rate_type`.

### `import_restrictions.csv`
restriction_id (PK), hs_code (FK, nullable if category-wide), category_id (FK),
restriction_type (Banned / Licence Required / Permit Required / Age Restriction /
Quota/Licence Required / Certification Required / Type-Approval Required / Declaration
Required), permit_or_licence_name, issuing_agency_id (FK), legal_reference, notes.

### `duty_exemptions.csv`
exemption_id (PK), exemption_name, eligible_persons, applies_to_category_id (FK,
nullable = broadly applicable), conditions, legal_reference, notes. Returning residents,
disability vehicle suspension, diplomats, ZIDA investment rebate, PVO donations,
relocation personal effects, agricultural equipment, solar incentives, medical/disaster
relief donations.

### `product_keywords.csv`
keyword_id (PK), keyword, hs_code (FK), relevance_weight (1.0 single-word / 0.9
multi-word). Powers a simple search-to-HS-code lookup (e.g. "iphone" → 8517.12,
"mealie meal" → 1101.00) so users can find their item's HS code without knowing it.

---

## Suggested calculation flow (vehicles)

1. **VDP** (Value for Duty Purposes) = CIF value + incidental import charges (freight,
   insurance, port handling from `government_fees.csv`).
2. **Customs Duty** = VDP × `tariff_rates.duty_rate_percent` (pick General or the best
   applicable preferential rate for the origin country/trade bloc).
3. **Surtax** (vehicles only, if age > 5 years) = VDP × `surtax_rules.surtax_rate_percent`
   for the matching category + age band.
4. **Carbon Tax** (vehicles only) = flat `carbon_tax_rules.carbon_tax_amount_usd` for the
   matching category + engine-capacity band.
5. **VAT** = (VDP + Customs Duty + Surtax) × `vat_rules.vat_rate_percent` (15% standard;
   Carbon Tax is typically **not** part of the VAT base — confirm against current rules).
6. **Total Landed Cost** = VDP + Customs Duty + Surtax + Carbon Tax + VAT + applicable
   `government_fees.csv` line items (registration, CBCA, roadworthy, agent commission, etc.).

## Suggested calculation flow (non-vehicle goods)

1. **CIF/VDP** = goods value + freight + insurance + handling.
2. **Customs Duty** = VDP × best applicable `tariff_rates` rate.
3. **Excise Duty** (if applicable, e.g. alcohol/tobacco) = per `excise_rules.csv`
   (specific and/or ad valorem — some goods use both, i.e. a compound duty).
4. **VAT** = (VDP + Customs Duty + Excise Duty) × `vat_rules.vat_rate_percent`
   (0% if zero-rated, N/A if exempt).
5. **Total Landed Cost** = VDP + Customs Duty + Excise Duty + VAT + relevant fees.

Before finalizing a duty result in the UI, check `import_restrictions.csv` for permit/
licence/ban flags and `duty_exemptions.csv` for any rebate the importer may qualify for.

## Currency handling

All monetary reference values in this dataset are in **USD**. Convert to ZWG (or other
display currency) at calculation time using `exchange_rates.csv`
(`amount_zwg = amount_usd × rate_to_usd_for_ZWG`). Because Zimbabwe's exchange rate
moves frequently, wire this table to a live RBZ feed in production rather than relying
on the static snapshot shipped here.

## Known simplifications

- Not every HS code in the real Customs Tariff Handbook is represented — this is a
  ~70-line representative sample covering the categories most relevant to an individual/
  small-business import calculator (vehicles, electronics, clothing, food, machinery,
  medical, agri-inputs, building materials, etc.), not the full ~6,000+ line tariff book.
- Fuel excise rows in `excise_rules.csv` reference HS codes not present in
  `hs_codes.csv`/`products.csv` — included for completeness since landed-cost tools often
  need fuel duty; add matching HS/category rows if you plan to price fuel imports.
- Carbon tax figures are structurally realistic (banded by engine cc, vehicle category)
  but the dollar amounts are illustrative placeholders pending verification against the
  current Finance Act schedule.
- Preferential (SADC/COMESA/AfCFTA) rows are attached to a *curated subset* of HS codes
  that plausibly qualify — actual eligibility always depends on rules-of-origin analysis
  per shipment, not just the HS code.
