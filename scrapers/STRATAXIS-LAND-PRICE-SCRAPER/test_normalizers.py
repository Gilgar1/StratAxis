"""
StratAxis - Quick Test Script
Tests normalization functions without scraping
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent))

from utils.text_normalizer import PriceNormalizer, LandSizeNormalizer, NeighborhoodNormalizer

def test_price_normalization():
    """Test price normalization"""
    print("\n" + "="*60)
    print("TESTING PRICE NORMALIZATION")
    print("="*60)
    
    test_cases = [
        "50 million FCFA",
        "50M",
        "FCFA 50,000,000",
        "25 milliards",
        "1.5M",
        "500000",
        "invalid"
    ]
    
    normalizer = PriceNormalizer()
    
    for test in test_cases:
        result = normalizer.normalize(test)
        print(f"{test:20s} → {result}")


def test_land_size_normalization():
    """Test land size normalization"""
    print("\n" + "="*60)
    print("TESTING LAND SIZE NORMALIZATION")
    print("="*60)
    
    test_cases = [
        "500 m²",
        "1 hectare",
        "0.5 ha",
        "5000 sqm",
        "250",
        "invalid"
    ]
    
    normalizer = LandSizeNormalizer()
    
    for test in test_cases:
        result = normalizer.normalize(test)
        print(f"{test:20s} → {result}")


def test_neighborhood_normalization():
    """Test neighborhood normalization"""
    print("\n" + "="*60)
    print("TESTING NEIGHBORHOOD NORMALIZATION")
    print("="*60)
    
    test_cases = [
        "Bonapriso – Douala",
        "bonapriso dla",
        "Akwa Douala",
        "Bastos",
        "Ngoa-Ekelle",
        "Some Unknown Quarter"
    ]
    
    normalizer = NeighborhoodNormalizer()
    
    for test in test_cases:
        result = normalizer.normalize(test)
        print(f"{test:25s} → {result}")


def test_price_per_sqm_calculation():
    """Test price per sqm calculation"""
    print("\n" + "="*60)
    print("TESTING PRICE PER SQM CALCULATION")
    print("="*60)
    
    test_data = [
        ("50 million FCFA", "500 m²"),
        ("25M", "1000 m²"),
        ("100 million", "2 hectares"),
    ]
    
    price_norm = PriceNormalizer()
    size_norm = LandSizeNormalizer()
    
    for price_raw, size_raw in test_data:
        price = price_norm.normalize(price_raw)
        size = size_norm.normalize(size_raw)
        
        if price and size:
            price_per_sqm = price / size
            print(f"{price_raw:20s} / {size_raw:15s} = {price_per_sqm:,.0f} XAF/m²")
        else:
            print(f"{price_raw:20s} / {size_raw:15s} = INVALID")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("STRATAXIS TEXT NORMALIZATION TEST SUITE")
    print("="*60)
    
    test_price_normalization()
    test_land_size_normalization()
    test_neighborhood_normalization()
    test_price_per_sqm_calculation()
    
    print("\n" + "="*60)
    print("TESTS COMPLETE")
    print("="*60 + "\n")
