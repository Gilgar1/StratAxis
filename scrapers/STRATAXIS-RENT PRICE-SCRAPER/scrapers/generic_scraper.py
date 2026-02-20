import re
from typing import List, Dict, Any
from scrapers.base_scraper import BaseScraper

class GenericPortalScraper(BaseScraper):
    """
    Generic scraper for property portals
    Attempts to find common patterns across different sites
    """
    
    RENTAL_KEYWORDS = ['location', 'louer', 'rent', 'rental', 'à louer']
    EXCLUDE_KEYWORDS = ['vente', 'sale', 'à vendre', 'terrain', 'land']
    
    def __init__(self, source_name: str, base_url: str, city_paths: Dict[str, str] = None):
        super().__init__(source_name, base_url)
        self.city_paths = city_paths or {}
    
    def scrape(self, city: str) -> List[Dict[str, Any]]:
        """Scrape listings for a given city"""
        self.logger.info(f"Starting scrape for {city} on {self.source_name}")
        
        listings = []
        
        # Build search URLs
        search_urls = self._build_search_urls(city)
        
        for url in search_urls:
            soup = self.fetch_page(url)
            if not soup:
                continue
            
            # Try to find listing containers using common patterns
            listing_elements = self._find_listing_elements(soup)
            
            self.logger.info(f"Found {len(listing_elements)} potential listings on {url}")
            
            for element in listing_elements:
                listing = self._extract_listing_data(element, city, url)
                if listing and self._is_rental(listing):
                    listings.append(listing)
        
        self.logger.info(f"Scraped {len(listings)} rental listings for {city} from {self.source_name}")
        return listings
    
    def _build_search_urls(self, city: str) -> List[str]:
        """Build search URLs for the city"""
        urls = []
        
        # Use configured city path if available
        if city.lower() in self.city_paths:
            path = self.city_paths[city.lower()]
            urls.append(f"{self.base_url.rstrip('/')}{path}")
        else:
            # Try common URL patterns
            for keyword in ['location', 'rent', 'rental']:
                urls.append(f"{self.base_url.rstrip('/')}/{keyword}/{city.lower()}")
                urls.append(f"{self.base_url.rstrip('/')}/{city.lower()}/{keyword}")
        
        # Also try base URL
        urls.append(self.base_url)
        
        return urls
    
    def _find_listing_elements(self, soup):
        """Find listing elements using common selectors"""
        # Try common class/id patterns for property listings
        selectors = [
            'div.listing',
            'div.property',
            'div.item',
            'div.card',
            'article.listing',
            'article.property',
            'div[class*="listing"]',
            'div[class*="property"]',
            'div[class*="annonce"]',
            'div[class*="ad-"]',
        ]
        
        for selector in selectors:
            elements = soup.select(selector)
            if elements:
                return elements
        
        # If no specific pattern found, return empty
        return []
    
    def _extract_listing_data(self, element, city: str, page_url: str) -> Dict[str, Any]:
        """Extract data from a listing element"""
        try:
            # Extract basic info
            title = self._extract_title(element)
            price = self._extract_price(element)
            url = self._extract_url(element, page_url)
            description = self._extract_description(element)
            
            # Extract structured data
            bedrooms = self._extract_bedrooms(element, title, description)
            size = self._extract_size(element, description)
            neighborhood = self._extract_neighborhood(element, description, city)
            
            # Build listing
            return self.build_listing_dict(
                city=city,
                neighborhood=neighborhood,
                housing_type_raw=title,
                rent_price_raw=price,
                bedrooms_raw=bedrooms,
                size_raw=size,
                listing_date=self._extract_date(element),
                listing_url=url,
                full_description=description,
            )
        except Exception as e:
            self.logger.debug(f"Error extracting listing: {e}")
            return None
    
    def _extract_title(self, element) -> str:
        """Extract listing title"""
        selectors = ['h2', 'h3', 'h4', '.title', '.heading', '[class*="title"]']
        for selector in selectors:
            title = self.extract_text(element, selector)
            if title:
                return title
        return ""
    
    def _extract_price(self, element) -> str:
        """Extract price"""
        selectors = ['.price', '.amount', '[class*="price"]', '[class*="amount"]', 'span.price']
        for selector in selectors:
            price = self.extract_text(element, selector)
            if price and any(char.isdigit() for char in price):
                return price
        
        # Try to find any text with currency indicators
        text = element.get_text()
        match = re.search(r'[\d.,]+\s*(?:FCFA|XAF|CFA|€|EUR|\$)', text)
        if match:
            return match.group()
        
        return ""
    
    def _extract_url(self, element, base_url: str) -> str:
        """Extract listing URL"""
        link = element.find('a', href=True)
        if link:
            href = link['href']
            if href.startswith('http'):
                return href
            else:
                return f"{self.base_url.rstrip('/')}/{href.lstrip('/')}"
        return base_url
    
    def _extract_description(self, element) -> str:
        """Extract full description"""
        desc = self.extract_text(element, '.description')
        if desc:
            return desc
        return element.get_text(separator=' ', strip=True)
    
    def _extract_bedrooms(self, element, title: str, description: str) -> str:
        """Extract number of bedrooms"""
        text = f"{title} {description}".lower()
        
        # Look for bedroom patterns
        patterns = [
            r'(\d+)\s*(?:chambre|bedroom|ch\.|bed)',
            r't(\d+)',  # T2, T3 notation
            r'f(\d+)',  # F2, F3 notation
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return ""
    
    def _extract_size(self, element, description: str) -> str:
        """Extract size in sqm"""
        text = description.lower()
        
        # Look for size patterns
        patterns = [
            r'(\d+)\s*(?:m²|m2|sqm|metres?)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(1)
        
        return ""
    
    def _extract_neighborhood(self, element, description: str, city: str) -> str:
        """Extract neighborhood from description"""
        # Look for neighborhood indicators
        text = description.lower()
        
        # Common neighborhood keywords
        patterns = [
            r'(?:quartier|quarter|neighborhood)\s+([a-zàâçéèêëïîôùûüÿæœ\s-]+)',
            r'(?:à|in)\s+([a-zàâçéèêëïîôùûüÿæœ\s-]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text)
            if match:
                neighborhood = match.group(1).strip()
                # Basic cleaning
                neighborhood = re.sub(r'\s+', ' ', neighborhood)
                return neighborhood[:50]  # Limit length
        
        return ""
    
    def _extract_date(self, element) -> str:
        """Extract listing date"""
        selectors = ['.date', '.posted', '[class*="date"]', 'time']
        for selector in selectors:
            date_text = self.extract_text(element, selector)
            if date_text:
                return date_text
        return ""
    
    def _is_rental(self, listing: Dict[str, Any]) -> bool:
        """Check if listing is a rental (not sale/land)"""
        text = f"{listing.get('housing_type_raw', '')} {listing.get('full_description', '')}".lower()
        
        # Exclude if contains sale/land keywords
        if any(keyword in text for keyword in self.EXCLUDE_KEYWORDS):
            return False
        
        # Include if has rental keywords or has price (assume rental)
        has_rental_keyword = any(keyword in text for keyword in self.RENTAL_KEYWORDS)
        has_price = bool(listing.get('rent_price_raw'))
        
        return has_rental_keyword or has_price
