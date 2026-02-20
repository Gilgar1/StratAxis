"""
Create realistic sample data for demonstration
This simulates what would be scraped from real websites
"""

import pandas as pd
import random
from datetime import datetime, timedelta

# Douala neighborhoods
douala_neighborhoods = [
    "Bonapriso", "Akwa", "Bonanjo", "Deido", "Bonaberi", 
    "Bepanda", "Makepe", "Logbaba", "Ndogpassi", "PK10",
    "PK12", "Ngombé", "Ndokotti", "Bali", "Koumassi"
]

# Yaoundé neighborhoods
yaounde_neighborhoods = [
    "Bastos", "Ngoa-Ekelle", "Nlongkak", "Omnisport", "Mvan",
    "Essos", "Emana", "Odza", "Mimboman", "Ekounou",
    "Tsinga", "Elig-Essono", "Nkoldongo", "Cite Verte", "Damas"
]

# Price ranges per neighborhood (realistic XAF per m²)
neighborhood_prices = {
    # Douala - premium
    "Bonapriso": (80000, 150000),
    "Akwa": (70000, 120000),
    "Bonanjo": (75000, 130000),
    # Douala - mid-range
    "Deido": (40000, 80000),
    "Makepe": (35000, 70000),
    "Logbaba": (30000, 60000),
    "Bepanda": (25000, 50000),
    # Douala - affordable
    "Bonaberi": (20000, 45000),
    "Ndogpassi": (18000, 40000),
    "PK10": (15000, 35000),
    "PK12": (12000, 30000),
    "Ngombé": (10000, 25000),
    "Ndokotti": (18000, 38000),
    "Bali": (22000, 48000),
    "Koumassi": (20000, 42000),
    
    # Yaoundé - premium
    "Bastos": (100000, 180000),
    "Ngoa-Ekelle": (90000, 160000),
    "Nlongkak": (75000, 140000),
    # Yaoundé - mid-range  
    "Omnisport": (50000, 90000),
    "Mvan": (45000, 85000),
    "Essos": (40000, 75000),
    "Tsinga": (38000, 72000),
    # Yaoundé - affordable
    "Emana": (25000, 55000),
    "Odza": (22000, 50000),
    "Mimboman": (20000, 45000),
    "Ekounou": (18000, 40000),
    "Elig-Essono": (20000, 43000),
    "Nkoldongo": (17000, 38000),
    "Cite Verte": (23000, 48000),
    "Damas": (30000, 60000),
}

# Sample websites
websites = [
    "mapiole", "koutchoumi", "keur_immo", "geloka", "coinafrique",
    "homecm", "camerounmaison", "weetyu", "cameroonproperty", "jumia"
]

def generate_raw_listing(city, neighborhood, website):
    """Generate a realistic raw listing"""
    min_price, max_price = neighborhood_prices[neighborhood]
    price_per_sqm = random.uniform(min_price, max_price)
    
    # Random land size (100 m² to 5000 m²)
    land_size_sqm = random.choice([100, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1200, 1500, 2000, 2500, 3000, 5000])
    
    total_price = price_per_sqm * land_size_sqm
    
    # Vary the format of price_raw (realistic variations)
    price_formats = [
        f"{total_price/1_000_000:.1f} million FCFA",
        f"{total_price/1_000_000:.0f}M",
        f"FCFA {int(total_price):,}",
        f"{int(total_price)} FCFA",
        f"{total_price/1_000_000:.2f} millions",
    ]
    price_raw = random.choice(price_formats)
    
    # Vary the format of land_size_raw
    if random.random() < 0.7:  # 70% in m²
        size_formats = [
            f"{land_size_sqm} m²",
            f"{land_size_sqm} sqm",
            f"{land_size_sqm} m2",
            f"{land_size_sqm} metres carrés",
        ]
    else:  # 30% in hectares
        hectares = land_size_sqm / 10000
        size_formats = [
            f"{hectares} ha",
            f"{hectares} hectare",
            f"{hectares} hectares",
        ]
    land_size_raw = random.choice(size_formats)
    
    # Vary neighborhood format
    neighborhood_variations = {
        "Bonapriso": ["Bonapriso", "Bonapriso - Douala", "bonapriso dla", "BONAPRISO"],
        "Akwa": ["Akwa", "Akwa Douala", "quartier akwa", "AKWA"],
        "Bastos": ["Bastos", "Quartier Bastos", "bastos", "BASTOS - Yaoundé"],
    }
    
    neighborhood_raw = neighborhood_variations.get(
        neighborhood, [neighborhood, neighborhood.upper(), f"{neighborhood} - {city}"]
    )[random.randint(0, min(len(neighborhood_variations.get(neighborhood, [neighborhood])) - 1, 3))]
    
    return {
        'city': city,
        'neighborhood': neighborhood_raw,
        'price_raw': price_raw,
        'land_size_raw': land_size_raw,
        'listing_date': (datetime.now() - timedelta(days=random.randint(0, 60))).strftime('%Y-%m-%d'),
        'source_site': website,
        'listing_url': f"https://{website}.com/listing-{random.randint(1000, 9999)}"
    }

# Generate sample data
listings = []

# Generate 10-30 listings per neighborhood
for city, neighborhoods in [("Douala", douala_neighborhoods), ("Yaoundé", yaounde_neighborhoods)]:
    for neighborhood in neighborhoods:
        num_listings = random.randint(10, 30)
        for _ in range(num_listings):
            website = random.choice(websites)
            listings.append(generate_raw_listing(city, neighborhood, website))

# Add some duplicates (realistic scenario)
for _ in range(50):
    listings.append(random.choice(listings).copy())

# Add some invalid entries (missing data)
for _ in range(20):
    invalid = random.choice(listings).copy()
    if random.random() < 0.5:
        invalid['price_raw'] = "Contact for price"
    else:
        invalid['land_size_raw'] = "Taille disponible sur demande"
    listings.append(invalid)

# Shuffle
random.shuffle(listings)

# Save as JSON
import json
with open('c:/Users/ander/Desktop/strataxis data two/data/sample_raw_listings.json', 'w', encoding='utf-8') as f:
    json.dump(listings, f, indent=2, ensure_ascii=False)

print(f"✅ Generated {len(listings)} sample raw listings")
print(f"   - Valid listings: ~{len(listings) - 70}")
print(f"   - Duplicates: ~50")
print(f"   - Invalid: ~20")
print(f"   - Cities: Douala, Yaoundé")
print(f"   - Neighborhoods: {len(douala_neighborhoods + yaounde_neighborhoods)}")
